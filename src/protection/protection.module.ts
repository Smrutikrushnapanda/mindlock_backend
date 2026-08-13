import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProtectionSettings } from '../entities/protection-settings.entity';
import { ProtectionController } from './protection.controller';
import { ProtectionService } from './protection.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProtectionSettings])],
  controllers: [ProtectionController],
  providers: [ProtectionService],
  exports: [ProtectionService],
})
export class ProtectionModule {}
