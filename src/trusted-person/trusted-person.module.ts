import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InviteOtp } from '../entities/invite-otp.entity';
import { TrustedPerson } from '../entities/trusted-person.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { TrustedPersonController } from './trusted-person.controller';
import { TrustedPersonService } from './trusted-person.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TrustedPerson, InviteOtp]),
    JwtModule.register({}),
    NotificationsModule,
  ],
  controllers: [TrustedPersonController],
  providers: [TrustedPersonService],
  exports: [TrustedPersonService],
})
export class TrustedPersonModule {}
