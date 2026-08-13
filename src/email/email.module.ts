import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';
import { OtpEmailProcessor } from './otp-email.processor';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST') ?? 'localhost',
          port: config.get<number>('REDIS_PORT') ?? 6379,
        },
      }),
    }),
    BullModule.registerQueue({ name: 'otp-email' }),
  ],
  providers: [EmailService, OtpEmailProcessor],
  exports: [EmailService, BullModule],
})
export class EmailModule {}
