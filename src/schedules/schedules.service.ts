import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule } from '../entities/schedule.entity';
import { CreateScheduleDto, UpdateScheduleDto } from './dto';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(Schedule) private readonly schedules: Repository<Schedule>,
  ) {}

  async findAll(userId: string) {
    return this.schedules.find({
      where: { userId },
      order: { createdAt: 'ASC' },
    });
  }

  async create(userId: string, dto: CreateScheduleDto) {
    const schedule = this.schedules.create({ userId, ...dto });
    return this.schedules.save(schedule);
  }

  async update(userId: string, id: string, dto: UpdateScheduleDto) {
    const schedule = await this.findOneOwned(userId, id);
    Object.assign(schedule, dto);
    return this.schedules.save(schedule);
  }

  async toggle(userId: string, id: string) {
    const schedule = await this.findOneOwned(userId, id);
    schedule.isActive = !schedule.isActive;
    return this.schedules.save(schedule);
  }

  async remove(userId: string, id: string) {
    const schedule = await this.findOneOwned(userId, id);
    await this.schedules.remove(schedule);
    return { message: 'Schedule deleted' };
  }

  private async findOneOwned(userId: string, id: string) {
    const schedule = await this.schedules.findOne({ where: { id, userId } });
    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }
    return schedule;
  }
}
