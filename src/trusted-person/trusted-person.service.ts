import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { InviteOtp } from '../entities/invite-otp.entity';
import { TrustedPerson } from '../entities/trusted-person.entity';
import { EmailService } from '../email/email.service';
import { NotificationsService } from '../notifications/notifications.service';
import { InviteTrustedPersonDto, UpdateTrustedPersonDto, VerifyTrustedPersonOtpDto } from './dto';

const INVITE_OTP_TTL_MS = 10 * 60 * 1000;
const INVITE_OTP_ATTEMPTS_LIMIT = 5;

@Injectable()
export class TrustedPersonService {
  private readonly logger = new Logger(TrustedPersonService.name);

  constructor(
    @InjectRepository(TrustedPerson) private readonly persons: Repository<TrustedPerson>,
    @InjectRepository(InviteOtp) private readonly inviteOtps: Repository<InviteOtp>,
    private readonly email: EmailService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly notifications: NotificationsService,
  ) {}

  async invite(userId: string, dto: InviteTrustedPersonDto) {
    let person = await this.persons.findOne({ where: { userId } });
    if (person) {
      Object.assign(person, dto, { verified: false, verifiedAt: null });
    } else {
      person = this.persons.create({ userId, ...dto });
    }
    await this.persons.save(person);

    const code = this.generateCode();
    const existing =
      (await this.inviteOtps.findOne({ where: { userId } })) ??
      this.inviteOtps.create({ userId, email: dto.email });
    existing.code = await bcrypt.hash(code, 10);
    existing.email = dto.email;
    existing.expiresAt = new Date(Date.now() + INVITE_OTP_TTL_MS);
    existing.attempts = 0;
    existing.verified = false;
    await this.inviteOtps.save(existing);

    const result = await this.email
      .sendOtpEmail({
        to: dto.email,
        code,
        trustedPersonName: dto.name,
        purpose: 'to be added as your trusted person in MindLock',
      })
      .catch((err) => {
        this.logger.error(
          `Failed to send invite OTP to ${dto.email}: ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
        return { delivered: false as const };
      });

    await this.notifications.create(
      userId,
      'trusted_invite',
      'Trusted person invited',
      `${dto.name} has been invited as your trusted person (${dto.relationship})`,
    );

    return { ...person, emailDelivered: result.delivered };
  }

  async findForUser(userId: string) {
    return this.persons.findOne({ where: { userId } });
  }

  async update(userId: string, dto: UpdateTrustedPersonDto) {
    const person = await this.persons.findOne({ where: { userId } });
    if (!person) throw new NotFoundException('No trusted person set');
    Object.assign(person, dto, { verified: false, verifiedAt: null });
    return this.persons.save(person);
  }

  async verifyOtp(userId: string, dto: VerifyTrustedPersonOtpDto) {
    const person = await this.persons.findOne({ where: { userId } });
    if (!person) {
      throw new NotFoundException('No trusted person set — invite them first');
    }

    const otp = await this.inviteOtps.findOne({ where: { userId } });
    if (!otp || otp.verified) {
      throw new BadRequestException('No active verification code — invite again');
    }
    if (otp.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Verification code has expired — invite again');
    }
    if (otp.attempts >= INVITE_OTP_ATTEMPTS_LIMIT) {
      throw new BadRequestException('Too many failed attempts — invite again');
    }

    const matches = await bcrypt.compare(dto.code, otp.code);
    if (!matches) {
      otp.attempts += 1;
      await this.inviteOtps.save(otp);
      const remaining = INVITE_OTP_ATTEMPTS_LIMIT - otp.attempts;
      throw new BadRequestException(
        remaining <= 0
          ? 'Too many failed attempts — invite again'
          : `Incorrect code — ${remaining} attempts remaining`,
      );
    }

    otp.verified = true;
    await this.inviteOtps.save(otp);

    person.verified = true;
    person.verifiedAt = new Date();
    const saved = await this.persons.save(person);
    await this.notifications.create(
      person.userId,
      'trusted_invite',
      'Trusted person verified',
      `${person.name} confirmed your invite and can now approve unlock requests`,
    );
    return saved;
  }

  // Legacy JWT-invite path, kept for previously sent emails.
  async verify(dto: { token: string }) {
    let payload: { userId: string; email: string; type?: string };
    try {
      payload = await this.jwt.verifyAsync(dto.token, {
        secret: this.config.get<string>('JWT_INVITE_SECRET'),
      });
    } catch {
      throw new NotFoundException('Invalid or expired invite link');
    }
    if (payload.type !== 'trusted-invite') {
      throw new NotFoundException('Invalid invite link');
    }
    const person = await this.persons.findOne({ where: { userId: payload.userId } });
    if (!person || person.email !== payload.email) {
      throw new NotFoundException('Invite does not match any trusted person');
    }
    person.verified = true;
    person.verifiedAt = new Date();
    const saved = await this.persons.save(person);
    await this.notifications.create(
      person.userId,
      'trusted_invite',
      'Trusted person verified',
      `${person.name} accepted your invite and can now approve unlock requests`,
    );
    return saved;
  }

  private generateCode(): string {
    return String(Math.floor(100000 + Math.random() * 900000));
  }
}
