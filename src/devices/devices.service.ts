import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from '../entities/device.entity';
import { RegisterPushTokenDto } from './dto';

@Injectable()
export class DevicesService {
  constructor(@InjectRepository(Device) private readonly devices: Repository<Device>) {}

  async registerPushToken(userId: string, dto: RegisterPushTokenDto) {
    let device = await this.devices.findOne({
      where: { userId, pushToken: dto.pushToken },
    });
    if (device) {
      device.lastSeen = new Date();
      if (dto.platform) device.platform = dto.platform;
      if (dto.isManaged !== undefined) device.isManaged = dto.isManaged;
    } else {
      device = this.devices.create({
        userId,
        pushToken: dto.pushToken,
        platform: dto.platform ?? 'android',
        isManaged: dto.isManaged ?? false,
      });
    }
    return this.devices.save(device);
  }
}
