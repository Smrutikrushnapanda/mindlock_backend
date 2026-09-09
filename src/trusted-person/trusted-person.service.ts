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
    this.logger.log(`[TrustedPerson] Invite requested for email: ${dto.email}`);

    // Step 1: Create or update trusted person record
    let person = await this.persons.findOne({ where: { userId } });
    if (person) {
      this.logger.log(`[TrustedPerson] Updating existing trusted person record`);
      Object.assign(person, dto, { verified: false, verifiedAt: null });
    } else {
      this.logger.log(`[TrustedPerson] Creating new trusted person record`);
      person = this.persons.create({ userId, ...dto });
    }
    await this.persons.save(person);
    this.logger.log(`[TrustedPerson] Trusted person saved (id: ${person.id})`);

    // Step 2: Generate OTP and save
    const code = this.generateCode();
    this.logger.log(`[TrustedPerson] OTP generated`);
    const existing =
      (await this.inviteOtps.findOne({ where: { userId } })) ??
      this.inviteOtps.create({ userId, email: dto.email });
    existing.code = await bcrypt.hash(code, 10);
    existing.email = dto.email;
    existing.expiresAt = new Date(Date.now() + INVITE_OTP_TTL_MS);
    existing.attempts = 0;
    existing.verified = false;
    await this.inviteOtps.save(existing);
    this.logger.log(`[TrustedPerson] OTP saved to database`);

    // Step 3: Send invitation email
    this.logger.log(`[TrustedPerson] Sending invitation email`);
    const result = await this.email
      .sendOtpEmail({
        to: dto.email,
        code,
        trustedPersonName: dto.name,
        purpose: 'to be added as your trusted person in MindLock',
      })
      .catch((err) => {
        this.logger.error(
          `[TrustedPerson] Email send failed: ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
        return { delivered: false as const };
      });

    if (result.delivered) {
      this.logger.log(`[TrustedPerson] Email accepted by SMTP`);
    } else {
      this.logger.warn(
        `[TrustedPerson] Email not delivered — OTP was generated but email failed`
      );
    }

    // Step 4: Create notification
    await this.notifications.create(
      userId,
      'trusted_invite',
      'Trusted person invited',
      `${dto.name} has been invited as your trusted person (${dto.relationship})`,
    );

    this.logger.log(`[TrustedPerson] Invite completed (emailDelivered: ${result.delivered})`);
    return { ...person, emailDelivered: result.delivered };
  }

  async findForUser(userId: string) {
    this.logger.log(`[TrustedPerson] Fetching trusted person for user`);
    return this.persons.findOne({ where: { userId } });
  }

  async update(userId: string, dto: UpdateTrustedPersonDto) {
    this.logger.log(`[TrustedPerson] Updating trusted person details`);
    const person = await this.persons.findOne({ where: { userId } });
    if (!person) throw new NotFoundException('No trusted person set');
    Object.assign(person, dto, { verified: false, verifiedAt: null });
    const saved = await this.persons.save(person);
    this.logger.log(`[TrustedPerson] Trusted person updated (verified reset to false)`);
    return saved;
  }

  async verifyOtp(userId: string, dto: VerifyTrustedPersonOtpDto) {
    this.logger.log(`[TrustedPerson] OTP verification requested`);

    const person = await this.persons.findOne({ where: { userId } });
    if (!person) {
      this.logger.warn(`[TrustedPerson] No trusted person found for user`);
      throw new NotFoundException('No trusted person set — invite them first');
    }

    const otp = await this.inviteOtps.findOne({ where: { userId } });
    if (!otp || otp.verified) {
      this.logger.warn(`[TrustedPerson] No active OTP found or already verified`);
      throw new BadRequestException('No active verification code — invite again');
    }
    if (otp.expiresAt.getTime() < Date.now()) {
      this.logger.warn(`[TrustedPerson] OTP expired`);
      throw new BadRequestException('Verification code has expired — invite again');
    }
    if (otp.attempts >= INVITE_OTP_ATTEMPTS_LIMIT) {
      this.logger.warn(`[TrustedPerson] Too many failed attempts`);
      throw new BadRequestException('Too many failed attempts — invite again');
    }

    const matches = await bcrypt.compare(dto.code, otp.code);
    if (!matches) {
      otp.attempts += 1;
      await this.inviteOtps.save(otp);
      const remaining = INVITE_OTP_ATTEMPTS_LIMIT - otp.attempts;
      this.logger.warn(`[TrustedPerson] Incorrect OTP (attempts: ${otp.attempts}/${INVITE_OTP_ATTEMPTS_LIMIT})`);
      throw new BadRequestException(
        remaining <= 0
          ? 'Too many failed attempts — invite again'
          : `Incorrect code — ${remaining} attempts remaining`,
      );
    }

    this.logger.log(`[TrustedPerson] OTP verified successfully`);
    otp.verified = true;
    await this.inviteOtps.save(otp);

    person.verified = true;
    person.verifiedAt = new Date();
    const saved = await this.persons.save(person);
    this.logger.log(`[TrustedPerson] Trusted person marked as verified`);

    await this.notifications.create(
      person.userId,
      'trusted_invite',
      'Trusted person verified',
      `${person.name} confirmed your invite and can now approve unlock requests`,
    );

    this.logger.log(`[TrustedPerson] Verification completed`);
    return saved;
  }

  // Legacy JWT-invite path, kept for previously sent emails.
  async verify(dto: { token: string }) {
    this.logger.log(`[TrustedPerson] Legacy JWT verification requested`);
    let payload: { userId: string; email: string; type?: string };
    try {
      payload = await this.jwt.verifyAsync(dto.token, {
        secret: this.config.get<string>('JWT_INVITE_SECRET'),
      });
    } catch {
      this.logger.warn(`[TrustedPerson] Invalid or expired invite link`);
      throw new NotFoundException('Invalid or expired invite link');
    }
    if (payload.type !== 'trusted-invite') {
      this.logger.warn(`[TrustedPerson] Invalid invite link type`);
      throw new NotFoundException('Invalid invite link');
    }
    const person = await this.persons.findOne({ where: { userId: payload.userId } });
    if (!person || person.email !== payload.email) {
      this.logger.warn(`[TrustedPerson] Invite does not match any trusted person`);
      throw new NotFoundException('Invite does not match any trusted person');
    }
    person.verified = true;
    person.verifiedAt = new Date();
    const saved = await this.persons.save(person);
    this.logger.log(`[TrustedPerson] Trusted person verified via legacy JWT link`);
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
