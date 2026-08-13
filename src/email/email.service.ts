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

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;
  private readonly useEthereal: boolean;

  constructor(private readonly config: ConfigService) {
    this.useEthereal = !config.get<string>('SMTP_HOST');
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
      this.transporter = nodemailer.createTransport({
        host: this.config.get<string>('SMTP_HOST'),
        port: this.config.get<number>('SMTP_PORT') ?? 587,
        secure: (this.config.get<number>('SMTP_PORT') ?? 587) === 465,
        auth: this.config.get<string>('SMTP_USER')
          ? {
              user: this.config.get<string>('SMTP_USER'),
              pass: this.config.get<string>('SMTP_PASS'),
            }
          : undefined,
      });
    }
  }

  async send(message: EmailMessage): Promise<string> {
    const from = this.config.get<string>('SMTP_FROM') ?? 'MindLock <noreply@mindlock.app>';
    const info = await this.transporter.sendMail({ from, ...message });
    if (this.useEthereal) {
      this.logger.log(`Ethereal preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
    return info.messageId;
  }
}
