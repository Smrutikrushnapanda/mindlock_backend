import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Schedule } from '../entities/schedule.entity';
import { Notification } from '../entities/notification.entity';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { ProtectionScheduleProcessor } from './protection-schedule.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, Schedule]),
    BullModule.registerQueue({ name: 'protection-check' }),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, ProtectionScheduleProcessor],
  exports: [NotificationsService],
})
export class NotificationsModule {}
