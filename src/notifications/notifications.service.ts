import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';

export type NotificationType =
  | 'protection_activated'
  | 'protection_ending'
  | 'unlock_approved'
  | 'unlock_denied'
  | 'trusted_invite';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification) private readonly notifications: Repository<Notification>,
  ) {}

  async create(
    userId: string,
    type: NotificationType,
    title: string,
    body: string,
  ): Promise<Notification> {
    return this.notifications.save(
      this.notifications.create({ userId, type, title, body }),
    );
  }

  async createMany(
    userIds: string[],
    type: NotificationType,
    title: string,
    body: string,
  ): Promise<number> {
    const entities = userIds.map((userId) =>
      this.notifications.create({ userId, type, title, body }),
    );
    const saved = await this.notifications.save(entities);
    return saved.length;
  }

  async findByUser(userId: string) {
    return this.notifications.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async markRead(userId: string, id: string) {
    const notification = await this.notifications.findOne({ where: { id, userId } });
    if (!notification) throw new NotFoundException('Notification not found');
    notification.read = true;
    return this.notifications.save(notification);
  }
}
