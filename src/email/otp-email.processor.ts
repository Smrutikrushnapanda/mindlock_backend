import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EmailService } from './email.service';

export interface OtpEmailJobData {
  to: string;
  code: string;
  requestId: string;
  trustedPersonName: string;
}

@Processor('otp-email')
export class OtpEmailProcessor extends WorkerHost {
  private readonly logger = new Logger(OtpEmailProcessor.name);

  constructor(private readonly email: EmailService) {
    super();
  }

  async process(job: Job<OtpEmailJobData>): Promise<string> {
    const { to, code, trustedPersonName, requestId } = job.data;
    this.logger.log(`Sending OTP email for unlock request ${requestId}`);
    return this.email.send({
      to,
      subject: 'MindLock — Unlock approval code',
      text: [
        `Hi ${trustedPersonName},`,
        '',
        'Someone is requesting a temporary unlock from MindLock protection.',
        `Your approval code is: ${code}`,
        '',
        'Share this code with the requester only if you approve the unlock.',
        'The code expires in 5 minutes.',
      ].join('\n'),
      html: `<p>Hi ${trustedPersonName},</p>
<p>Someone is requesting a temporary unlock from <strong>MindLock</strong> protection.</p>
<p>Your approval code is:</p>
<h2 style="letter-spacing:4px;">${code}</h2>
<p>Share this code with the requester only if you approve the unlock. It expires in <strong>5 minutes</strong>.</p>`,
    });
  }
}
