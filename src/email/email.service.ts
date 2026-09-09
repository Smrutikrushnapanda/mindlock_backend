import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

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

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend;
  private fromEmail: string;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    const from = this.config.get<string>('RESEND_FROM_EMAIL');

    if (!apiKey) {
      this.logger.error('[Email] RESEND_API_KEY is not set — emails will fail');
    }
    if (!from) {
      this.logger.error('[Email] RESEND_FROM_EMAIL is not set — emails will fail');
    }

    this.resend = new Resend(apiKey);
    this.fromEmail = from ?? 'noreply@resend.dev';

    if (apiKey && from) {
      this.logger.log('[Email] Resend configuration loaded');
    }
  }

  async send(message: EmailMessage): Promise<EmailResult> {
    try {
      this.logger.log(`[Email] Sending email to ${message.to}`);
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
      });

      if (error) {
        const errorMsg = error.message ?? String(error);
        this.logger.error(`[Email] Resend email failed to ${message.to}: ${errorMsg}`);
        return { delivered: false, error: errorMsg };
      }

      this.logger.log(`[Email] Resend accepted email (id: ${data?.id})`);
      return { delivered: true, messageId: data?.id };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      this.logger.error(`[Email] Email delivery failed to ${message.to}: ${error}`);
      return { delivered: false, error };
    }
  }

  async sendOtpEmail(input: {
    to: string;
    code: string;
    trustedPersonName: string;
    purpose?: string;
  }): Promise<EmailResult> {
    const {
      to,
      code,
      trustedPersonName,
      purpose = 'temporary unlock from MindLock protection',
    } = input;

    this.logger.log(`[Email] Sending Trusted Person OTP to ${to}`);

    return this.send({
      to,
      subject: 'MindLock — Trusted Person Verification',
      text: [
        `Hi ${trustedPersonName},`,
        '',
        `You have been invited to be a trusted person in MindLock.`,
        `Someone is requesting ${purpose}.`,
        '',
        `Your verification code is: ${code}`,
        '',
        'Share this code with the requester only if you approve.',
        'The code expires in 10 minutes.',
        '',
        'If you did not expect this email, you can safely ignore it.',
      ].join('\n'),
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:480px;margin:40px auto;background:#fff;border-radius:12px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <div style="text-align:center;margin-bottom:24px;">
      <h1 style="font-size:20px;color:#1a1a1a;margin:0;">MindLock</h1>
    </div>
    <p style="font-size:15px;color:#374151;margin:0 0 16px;">Hi ${trustedPersonName},</p>
    <p style="font-size:15px;color:#374151;margin:0 0 16px;">You have been invited to be a <strong>trusted person</strong> in MindLock.</p>
    <p style="font-size:15px;color:#374151;margin:0 0 24px;">Someone is requesting <strong>${purpose}</strong>.</p>
    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;text-align:center;margin:0 0 24px;">
      <p style="font-size:13px;color:#6b7280;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px;">Your verification code</p>
      <p style="font-size:32px;font-weight:bold;color:#1a1a1a;letter-spacing:6px;margin:0;">${code}</p>
    </div>
    <p style="font-size:14px;color:#6b7280;margin:0 0 8px;">This code expires in <strong>10 minutes</strong>.</p>
    <p style="font-size:14px;color:#6b7280;margin:0 0 24px;">Share this code with the requester only if you approve.</p>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
    <p style="font-size:12px;color:#9ca3af;margin:0;">If you did not expect this email, you can safely ignore it.</p>
  </div>
</body>
</html>`.trim(),
    });
  }
}
