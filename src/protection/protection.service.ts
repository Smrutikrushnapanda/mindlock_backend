import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProtectionSettings } from '../entities/protection-settings.entity';

@Injectable()
export class ProtectionService {
  constructor(
    @InjectRepository(ProtectionSettings)
    private readonly settings: Repository<ProtectionSettings>,
  ) {}

  async ensureForUser(userId: string): Promise<ProtectionSettings> {
    const existing = await this.settings.findOne({ where: { userId } });
    if (existing) return existing;
    return this.settings.save(
      this.settings.create({
        userId,
        pornBlocking: true,
        appBlocking: true,
        protectionLevel: 'high',
        blockedCategories: ['adult', 'dating', 'gambling', 'drugs', 'explicit'],
        vpnConnected: false,
      }),
    );
  }

  async status(userId: string) {
    const settings = await this.ensureForUser(userId);
    const { user, ...safe } = settings;
    void user;
    return safe;
  }

  async setPornBlocking(userId: string, enabled: boolean) {
    const settings = await this.ensureForUser(userId);
    settings.pornBlocking = enabled;
    settings.lastSync = new Date();
    return this.settings.save(settings);
  }

  async setAppBlocking(userId: string, enabled: boolean) {
    const settings = await this.ensureForUser(userId);
    settings.appBlocking = enabled;
    settings.lastSync = new Date();
    return this.settings.save(settings);
  }

  async coverage(userId: string) {
    const settings = await this.ensureForUser(userId);
    let percent = 0;
    if (settings.pornBlocking) percent += 40;
    if (settings.appBlocking) percent += 40;
    if (settings.protectionLevel === 'high') percent += 20;
    else if (settings.protectionLevel === 'medium') percent += 10;
    return {
      coveragePercent: Math.min(percent, 100),
      pornBlocking: settings.pornBlocking,
      appBlocking: settings.appBlocking,
      protectionLevel: settings.protectionLevel,
      blockedCategories: settings.blockedCategories,
      vpnConnected: settings.vpnConnected,
      lastSync: settings.lastSync,
    };
  }
}
