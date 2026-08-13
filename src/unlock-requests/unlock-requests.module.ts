import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Otp } from '../entities/otp.entity';
import { TrustedPerson } from '../entities/trusted-person.entity';
import { UnlockRequest } from '../entities/unlock-request.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { UnlockRequestsController } from './unlock-requests.controller';
import { UnlockRequestsService } from './unlock-requests.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UnlockRequest, Otp, TrustedPerson]),
    NotificationsModule,
  ],
  controllers: [UnlockRequestsController],
  providers: [UnlockRequestsService],
})
export class UnlockRequestsModule {}
