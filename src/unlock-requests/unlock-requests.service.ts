import { InjectQueue } from '@nestjs/bullmq';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { Otp } from '../entities/otp.entity';
import { UnlockRequest } from '../entities/unlock-request.entity';
import { TrustedPerson } from '../entities/trusted-person.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { OtpEmailJobData } from '../email/otp-email.processor';
import { CreateUnlockRequestDto, VerifyOtpDto } from './dto';

const OTP_TTL_MS = 5 * 60 * 1000;
const OTP_ATTEMPTS_LIMIT = 5;
const RESEND_COOLDOWN_MS = 45 * 1000;

@Injectable()
export class UnlockRequestsService {
  private readonly lastResend = new Map<string, number>();

  constructor(
    @InjectRepository(UnlockRequest) private readonly requests: Repository<UnlockRequest>,
    @InjectRepository(Otp) private readonly otps: Repository<Otp>,
    @InjectRepository(TrustedPerson) private readonly persons: Repository<TrustedPerson>,
    @InjectQueue('otp-email') private readonly otpEmailQueue: Queue<OtpEmailJobData>,
    private readonly notifications: NotificationsService,
  ) {}

  async create(userId: string, dto: CreateUnlockRequestDto) {
    const trustedPerson = await this.persons.findOne({ where: { userId, verified: true } });
    if (!trustedPerson) {
      throw new BadRequestException(
        'A verified trusted person is required to request an unlock',
      );
    }

    const request = await this.requests.save(
      this.requests.create({
        userId,
        reason: dto.reason,
        customMessage: dto.customMessage ?? null,
        durationMin: dto.durationMin,
        status: 'pending',
      }),
    );

    await this.createOtpAndEmail(request.id, trustedPerson);
    this.lastResend.set(request.id, Date.now());
    return this.findOne(userId, request.id);
  }

  async findAll(userId: string) {
    return this.requests.find({ where: { userId }, order: { requestedAt: 'DESC' } });
  }

  async findOne(userId: string, id: string) {
    const request = await this.requests.findOne({
      where: { id, userId },
      relations: { otp: false },
    });
    if (!request) throw new NotFoundException('Unlock request not found');
    return request;
  }

  async verifyOtp(userId: string, id: string, dto: VerifyOtpDto) {
    const request = await this.requests.findOne({ where: { id, userId } });
    if (!request) throw new NotFoundException('Unlock request not found');
    if (request.status !== 'pending') {
      throw new BadRequestException(`Request is already ${request.status}`);
    }

    const otp = await this.otps.findOne({ where: { unlockRequestId: id } });
    if (!otp || otp.verified) {
      throw new BadRequestException('No active OTP for this request');
    }
    if (otp.expiresAt.getTime() < Date.now()) {
      await this.expire(request);
      throw new BadRequestException('OTP has expired');
    }
    if (otp.attempts >= OTP_ATTEMPTS_LIMIT) {
      await this.expire(request);
      throw new BadRequestException('Too many failed attempts — request expired');
    }

    const matches = await bcrypt.compare(dto.code, otp.code);
    if (!matches) {
      otp.attempts += 1;
      await this.otps.save(otp);
      if (otp.attempts >= OTP_ATTEMPTS_LIMIT) {
        await this.expire(request);
        throw new BadRequestException('Too many failed attempts — request expired');
      }
      throw new BadRequestException(
        `Incorrect code — ${OTP_ATTEMPTS_LIMIT - otp.attempts} attempts remaining`,
      );
    }

    otp.verified = true;
    await this.otps.save(otp);
    request.status = 'approved';
    request.respondedAt = new Date();
    request.unlockedUntil = new Date(Date.now() + request.durationMin * 60 * 1000);
    const saved = await this.requests.save(request);
    await this.notifications.create(
      userId,
      'unlock_approved',
      'Unlock approved',
      `Your device is unlocked until ${saved.unlockedUntil.toLocaleString()}`,
    );
    return saved;
  }

  async resendOtp(userId: string, id: string) {
    const request = await this.requests.findOne({ where: { id, userId } });
    if (!request) throw new NotFoundException('Unlock request not found');
    if (request.status !== 'pending') {
      throw new BadRequestException(`Request is already ${request.status}`);
    }

    const last = this.lastResend.get(id) ?? 0;
    const elapsed = Date.now() - last;
    if (elapsed < RESEND_COOLDOWN_MS) {
      const waitSec = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
      throw new BadRequestException(
        `Please wait ${waitSec}s before resending`,
      );
    }
    this.lastResend.set(id, Date.now());

    const trustedPerson = await this.persons.findOne({
      where: { userId, verified: true },
    });
    if (!trustedPerson) {
      throw new BadRequestException('No verified trusted person found');
    }

    await this.createOtpAndEmail(request.id, trustedPerson, true);
    return { message: 'OTP resent' };
  }

  async cancel(userId: string, id: string) {
    const request = await this.requests.findOne({ where: { id, userId } });
    if (!request) throw new NotFoundException('Unlock request not found');
    if (request.status !== 'pending') {
      throw new BadRequestException(`Request is already ${request.status}`);
    }
    request.status = 'cancelled';
    request.respondedAt = new Date();
    await this.requests.save(request);
    await this.otps.delete({ unlockRequestId: id });
    return request;
  }

  private async createOtpAndEmail(
    requestId: string,
    trustedPerson: TrustedPerson,
    resetAttempts = false,
  ) {
    const code = this.generateCode();
    const otp =
      (await this.otps.findOne({ where: { unlockRequestId: requestId } })) ??
      this.otps.create({ unlockRequestId: requestId });
    otp.code = await bcrypt.hash(code, 10);
    otp.expiresAt = new Date(Date.now() + OTP_TTL_MS);
    if (resetAttempts) otp.attempts = 0;
    otp.verified = false;
    await this.otps.save(otp);

    await this.otpEmailQueue.add(
      'send',
      {
        to: trustedPerson.email,
        code,
        requestId,
        trustedPersonName: trustedPerson.name,
      },
      { removeOnComplete: true, removeOnFail: 100 },
    );
  }

  private generateCode(): string {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  private async expire(request: UnlockRequest) {
    request.status = 'expired';
    request.respondedAt = new Date();
    await this.requests.save(request);
    await this.notifications.create(
      request.userId,
      'unlock_denied',
      'Unlock request expired',
      `Your unlock request for "${request.reason}" expired without approval`,
    );
  }
}
