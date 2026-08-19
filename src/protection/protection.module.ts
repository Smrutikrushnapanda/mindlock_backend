import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockedDomain } from '../entities/blocked-domain.entity';
import { ProtectionSettings } from '../entities/protection-settings.entity';
import { ProtectionController } from './protection.controller';
import { ProtectionService } from './protection.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProtectionSettings, BlockedDomain])],
  controllers: [ProtectionController],
  providers: [ProtectionService],
  exports: [ProtectionService],
})
export class ProtectionModule {}
