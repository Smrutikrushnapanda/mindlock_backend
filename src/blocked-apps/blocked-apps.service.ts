import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlockedApp } from '../entities/blocked-app.entity';
import { BulkUpdateAppsDto } from './dto';

@Injectable()
export class BlockedAppsService {
  constructor(
    @InjectRepository(BlockedApp) private readonly apps: Repository<BlockedApp>,
  ) {}

  async findAll(userId: string) {
    return this.apps.find({ where: { userId }, order: { appName: 'ASC' } });
  }

  async bulkUpdate(userId: string, dto: BulkUpdateAppsDto) {
    const existing = await this.apps.find({ where: { userId } });
    const byPackage = new Map(existing.map((a) => [a.packageName, a]));

    const toSave: BlockedApp[] = [];
    for (const item of dto.apps) {
      const found = byPackage.get(item.packageName);
      if (found) {
        if (item.appName !== undefined) found.appName = item.appName;
        if (item.category !== undefined) found.category = item.category;
        if (item.isBlocked !== undefined) found.isBlocked = item.isBlocked;
        toSave.push(found);
      } else {
        toSave.push(
          this.apps.create({
            userId,
            packageName: item.packageName,
            appName: item.appName,
            category: item.category ?? null,
            isBlocked: item.isBlocked ?? true,
          }),
        );
      }
    }

    await this.apps.save(toSave);
    return this.findAll(userId);
  }

  async toggle(userId: string, id: string) {
    const app = await this.apps.findOne({ where: { id, userId } });
    if (!app) {
      throw new NotFoundException('Blocked app not found');
    }
    app.isBlocked = !app.isBlocked;
    return this.apps.save(app);
  }
}
