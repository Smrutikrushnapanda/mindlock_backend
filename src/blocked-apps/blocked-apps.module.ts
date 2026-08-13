import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockedApp } from '../entities/blocked-app.entity';
import { BlockedAppsController } from './blocked-apps.controller';
import { BlockedAppsService } from './blocked-apps.service';

@Module({
  imports: [TypeOrmModule.forFeature([BlockedApp])],
  controllers: [BlockedAppsController],
  providers: [BlockedAppsService],
})
export class BlockedAppsModule {}
