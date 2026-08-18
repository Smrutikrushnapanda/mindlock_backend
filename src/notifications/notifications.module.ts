import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Schedule } from '../entities/schedule.entity';
import { Notification } from '../entities/notification.entity';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { ProtectionScheduleService } from './protection-schedule.service';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, Schedule])],
  controllers: [NotificationsController],
  providers: [NotificationsService, ProtectionScheduleService],
  exports: [NotificationsService, ProtectionScheduleService],
})
export class NotificationsModule {}