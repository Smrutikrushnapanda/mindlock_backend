import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { TrustedPerson } from '../entities/trusted-person.entity';
import { EmailService } from '../email/email.service';
import { NotificationsService } from '../notifications/notifications.service';
import { InviteTrustedPersonDto, UpdateTrustedPersonDto, VerifyTrustedPersonDto } from './dto';

@Injectable()
export class TrustedPersonService {
  constructor(
    @InjectRepository(TrustedPerson) private readonly persons: Repository<TrustedPerson>,
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

    const token = await this.jwt.signAsync(
      { userId, email: dto.email, name: dto.name, type: 'trusted-invite' },
      { secret: this.config.get<string>('JWT_INVITE_SECRET'), expiresIn: '7d' },
    );
    await this.sendInviteEmail(person, token);
    await this.notifications.create(
      userId,
      'trusted_invite',
      'Trusted person invited',
      `${dto.name} has been invited as your trusted person (${dto.relationship})`,
    );
    return person;
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

  async verify(dto: VerifyTrustedPersonDto) {
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

  private async sendInviteEmail(person: TrustedPerson, token: string) {
    const verifyUrl = `${this.config.get<string>(
      'APP_URL',
    )}/trusted-person/verify?token=${token}`;
    await this.email.send({
      to: person.email,
      subject: 'MindLock — You have been invited as a trusted person',
      text: `Hi ${person.name},

You have been invited to be the trusted person for a MindLock protection user.

Click this link to accept the invite:
${verifyUrl}

This link expires in 7 days.`,
      html: `<p>Hi ${person.name},</p>
<p>You have been invited to be the <strong>trusted person</strong> for a MindLock protection user.</p>
<p><a href="${verifyUrl}" style="background:#E31B23;color:#fff;padding:12px 24px;border-radius:14px;text-decoration:none;display:inline-block;">Accept invite</a></p>
<p>This link expires in 7 days.</p>`,
    });
  }
}
