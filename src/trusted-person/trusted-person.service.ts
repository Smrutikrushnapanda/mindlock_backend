import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
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
import {
  InviteTrustedPersonDto,
  UpdateTrustedPersonDto,
  VerifyTrustedPersonOtpDto,
  CompleteReplacementDto,
} from './dto';

const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_ATTEMPTS_LIMIT = 5;
const REPLACEMENT_TOKEN_TTL_MS = 15 * 60 * 1000;

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

  // ─── Existing invite flow ────────────────────────────────────────

  async invite(userId: string, dto: InviteTrustedPersonDto) {
    this.logger.log(`[TrustedPerson] Invite requested for email: ${dto.email}`);

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

    const code = this.generateCode();
    this.logger.log(`[TrustedPerson] OTP generated`);
    const existing =
      (await this.inviteOtps.findOne({ where: { userId, purpose: 'invite' } })) ??
      this.inviteOtps.create({ userId, email: dto.email, purpose: 'invite' });
    existing.code = await bcrypt.hash(code, 10);
    existing.email = dto.email;
    existing.expiresAt = new Date(Date.now() + OTP_TTL_MS);
    existing.attempts = 0;
    existing.verified = false;
    existing.purpose = 'invite';
    await this.inviteOtps.save(existing);
    this.logger.log(`[TrustedPerson] OTP saved to database`);

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
      this.logger.log(`[TrustedPerson] Email sent successfully`);
    } else {
      this.logger.warn(
        `[TrustedPerson] Email not delivered — OTP was generated but email failed`
      );
    }

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

    const otp = await this.inviteOtps.findOne({ where: { userId, purpose: 'invite' } });
    if (!otp || otp.verified) {
      this.logger.warn(`[TrustedPerson] No active OTP found or already verified`);
      throw new BadRequestException('No active verification code — invite again');
    }
    if (otp.expiresAt.getTime() < Date.now()) {
      this.logger.warn(`[TrustedPerson] OTP expired`);
      throw new BadRequestException('Verification code has expired — invite again');
    }
    if (otp.attempts >= OTP_ATTEMPTS_LIMIT) {
      this.logger.warn(`[TrustedPerson] Too many failed attempts`);
      throw new BadRequestException('Too many failed attempts — invite again');
    }

    const matches = await bcrypt.compare(dto.code, otp.code);
    if (!matches) {
      otp.attempts += 1;
      await this.inviteOtps.save(otp);
      const remaining = OTP_ATTEMPTS_LIMIT - otp.attempts;
      this.logger.warn(`[TrustedPerson] Incorrect OTP (attempts: ${otp.attempts}/${OTP_ATTEMPTS_LIMIT})`);
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

  // ─── Replacement flow ────────────────────────────────────────────

  async requestReplacement(userId: string) {
    this.logger.log(`[TrustedPerson] Replacement request for user: ${userId}`);

    const person = await this.persons.findOne({ where: { userId } });
    if (!person) {
      throw new NotFoundException('No trusted person set');
    }
    if (!person.verified) {
      throw new BadRequestException('Current trusted person is not verified — cannot replace');
    }

    const code = this.generateCode();
    this.logger.log(`[TrustedPerson] Replacement OTP generated`);

    const existing =
      (await this.inviteOtps.findOne({ where: { userId, purpose: 'replacement' } })) ??
      this.inviteOtps.create({ userId, email: person.email, purpose: 'replacement' });
    existing.code = await bcrypt.hash(code, 10);
    existing.email = person.email;
    existing.expiresAt = new Date(Date.now() + OTP_TTL_MS);
    existing.attempts = 0;
    existing.verified = false;
    existing.purpose = 'replacement';
    await this.inviteOtps.save(existing);
    this.logger.log(`[TrustedPerson] Replacement OTP saved to database`);

    const result = await this.email
      .sendOtpEmail({
        to: person.email,
        code,
        trustedPersonName: person.name,
        purpose: 'to authorize replacing your trusted person in MindLock',
      })
      .catch((err) => {
        this.logger.error(
          `[TrustedPerson] Replacement email send failed: ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
        return { delivered: false as const };
      });

    if (result.delivered) {
      this.logger.log(`[TrustedPerson] Replacement email sent successfully`);
    } else {
      this.logger.warn(`[TrustedPerson] Replacement email not delivered`);
    }

    return {
      email: person.email,
      name: person.name,
      emailDelivered: result.delivered,
    };
  }

  async verifyReplacement(userId: string, dto: VerifyTrustedPersonOtpDto) {
    this.logger.log(`[TrustedPerson] Replacement OTP verification requested`);

    const person = await this.persons.findOne({ where: { userId } });
    if (!person || !person.verified) {
      throw new NotFoundException('No verified trusted person found');
    }

    const otp = await this.inviteOtps.findOne({ where: { userId, purpose: 'replacement' } });
    if (!otp || otp.verified) {
      this.logger.warn(`[TrustedPerson] No active replacement OTP found or already verified`);
      throw new BadRequestException('No active verification code — request a new one');
    }
    if (otp.expiresAt.getTime() < Date.now()) {
      this.logger.warn(`[TrustedPerson] Replacement OTP expired`);
      throw new BadRequestException('Verification code has expired — request a new one');
    }
    if (otp.attempts >= OTP_ATTEMPTS_LIMIT) {
      this.logger.warn(`[TrustedPerson] Too many failed replacement attempts`);
      throw new BadRequestException('Too many failed attempts — request a new one');
    }

    const matches = await bcrypt.compare(dto.code, otp.code);
    if (!matches) {
      otp.attempts += 1;
      await this.inviteOtps.save(otp);
      const remaining = OTP_ATTEMPTS_LIMIT - otp.attempts;
      this.logger.warn(`[TrustedPerson] Incorrect replacement OTP (attempts: ${otp.attempts}/${OTP_ATTEMPTS_LIMIT})`);
      throw new BadRequestException(
        remaining <= 0
          ? 'Too many failed attempts — request a new one'
          : `Incorrect code — ${remaining} attempts remaining`,
      );
    }

    this.logger.log(`[TrustedPerson] Replacement OTP verified successfully`);
    otp.verified = true;
    await this.inviteOtps.save(otp);

    const replacementSecret = this.config.get<string>('JWT_INVITE_SECRET');
    const token = await this.jwt.signAsync(
      {
        sub: userId,
        type: 'trusted-person-replacement',
        personId: person.id,
        exp: Math.floor(Date.now() / 1000) + Math.floor(REPLACEMENT_TOKEN_TTL_MS / 1000),
      },
      { secret: replacementSecret },
    );

    this.logger.log(`[TrustedPerson] Replacement authorization token issued`);
    return { replacementToken: token };
  }

  async completeReplacement(userId: string, dto: CompleteReplacementDto) {
    this.logger.log(`[TrustedPerson] Replacement completion requested`);

    let payload: { sub: string; type: string; personId: string };
    try {
      payload = await this.jwt.verifyAsync(dto.replacementToken, {
        secret: this.config.get<string>('JWT_INVITE_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired replacement authorization');
    }

    if (payload.type !== 'trusted-person-replacement' || payload.sub !== userId) {
      throw new UnauthorizedException('Invalid replacement authorization');
    }

    const currentPerson = await this.persons.findOne({ where: { userId } });
    if (!currentPerson || currentPerson.id !== payload.personId) {
      throw new UnauthorizedException('Replacement authorization does not match current trusted person');
    }

    this.logger.log(`[TrustedPerson] Replacement authorization valid — creating new trusted person`);

    const person = await this.invite(userId, dto);

    await this.notifications.create(
      userId,
      'trusted_invite',
      'Trusted person replaced',
      `${dto.name} has been invited to replace your previous trusted person`,
    );

    return person;
  }

  // ─── Legacy ──────────────────────────────────────────────────────

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
