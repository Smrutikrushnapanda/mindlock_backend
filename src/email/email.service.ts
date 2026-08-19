import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailResult {
  delivered: boolean;
  messageId?: string;
  error?: string;
}

const GMAIL_HOSTS = ['smtp.gmail.com', 'smtp.googlemail.com'];

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;
  private readonly useEthereal: boolean;
  private readonly fromOverride: string | undefined;

  constructor(private readonly config: ConfigService) {
    this.useEthereal = !config.get<string>('SMTP_HOST');
    this.fromOverride = config.get<string>('SMTP_FROM');
  }

  async onModuleInit() {
    if (this.useEthereal) {
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });
      this.logger.warn(
        `SMTP not configured — using Ethereal test inbox: ${testAccount.user}`,
      );
    } else {
      const host = this.config.get<string>('SMTP_HOST');
      const port = this.config.get<number>('SMTP_PORT') ?? 587;
      const user = this.config.get<string>('SMTP_USER');
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: user
          ? { user, pass: this.config.get<string>('SMTP_PASS') }
          : undefined,
      });
    }
  }

  private resolveFrom(): string {
    const host = this.config.get<string>('SMTP_HOST') ?? '';
    const user = this.config.get<string>('SMTP_USER');
    if (GMAIL_HOSTS.includes(host) && user) {
      // Gmail rejects From addresses it does not own. Always send as the
      // authenticated account; the display name may still be configured.
      const displayName = this.config.get<string>('SMTP_FROM_NAME') ?? 'MindLock';
      return `${displayName} <${user}>`;
    }
    return this.fromOverride ?? (user ? `MindLock <${user}>` : 'MindLock <noreply@mindlock.app>');
  }

  async send(message: EmailMessage): Promise<EmailResult> {
    try {
      const info = await this.transporter.sendMail({
        from: this.resolveFrom(),
        ...message,
      });
      if (this.useEthereal) {
        this.logger.log(`Ethereal preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
      return { delivered: true, messageId: info.messageId };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      this.logger.error(`Email delivery failed to ${message.to}: ${error}`);
      return { delivered: false, error };
    }
  }

  async sendOtpEmail(input: {
    to: string;
    code: string;
    trustedPersonName: string;
    purpose?: string;
  }): Promise<EmailResult> {
    const { to, code, trustedPersonName, purpose = 'temporary unlock from MindLock protection' } = input;
    this.logger.log(`Sending OTP email to trusted contact ${to}`);
    return this.send({
      to,
      subject: 'MindLock — Approval code',
      text: [
        `Hi ${trustedPersonName},`,
        '',
        `Someone is requesting ${purpose}.`,
        `Your approval code is: ${code}`,
        '',
        'Share this code with the requester only if you approve.',
        'The code expires in 5 minutes.',
      ].join('\n'),
      html: `<p>Hi ${trustedPersonName},</p>
<p>Someone is requesting <strong>${purpose}</strong>.</p>
<p>Your approval code is:</p>
<h2 style="letter-spacing:4px;">${code}</h2>
<p>Share this code with the requester only if you approve. It expires in <strong>5 minutes</strong>.</p>`,
    });
  }
}
