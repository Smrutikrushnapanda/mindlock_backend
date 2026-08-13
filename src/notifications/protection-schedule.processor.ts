import { Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Job, Queue } from 'bullmq';
import { Repository } from 'typeorm';
import { Schedule } from '../entities/schedule.entity';
import { NotificationsService } from './notifications.service';

const ENDING_WINDOW_MIN = 10;
const WEEK_DAY_MAP: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

interface ScheduleState {
  activated: boolean;
  endingNotified: boolean;
}

@Processor('protection-check')
export class ProtectionScheduleProcessor extends WorkerHost implements OnModuleInit {
  private readonly logger = new Logger(ProtectionScheduleProcessor.name);
  private readonly state = new Map<string, ScheduleState>();

  constructor(
    @InjectRepository(Schedule) private readonly schedules: Repository<Schedule>,
    private readonly notifications: NotificationsService,
    @InjectQueue('protection-check') private readonly queue: Queue,
  ) {
    super();
  }

  async onModuleInit() {
    await this.queue.upsertJobScheduler(
      'protection-check-every-minute',
      { every: 60_000 },
      { name: 'check', data: {} },
    );
    this.logger.log('Protection schedule checker started (every 60s)');
  }

  async process(_job: Job): Promise<void> {
    const schedules = await this.schedules.find({ where: { isActive: true } });
    const today = new Date();
    const dayKey = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][today.getDay()];

    for (const schedule of schedules) {
      if (!schedule.days.includes(dayKey)) {
        this.state.delete(schedule.id);
        continue;
      }

      const [startMin, endMin] = this.toMinutes(schedule.startTime, schedule.endTime);
      if (startMin === null || endMin === null) continue;

      const nowMin = today.getHours() * 60 + today.getMinutes();
      const state = this.state.get(schedule.id) ?? { activated: false, endingNotified: false };

      if (nowMin >= startMin && nowMin < endMin) {
        if (!state.activated) {
          await this.notifications.create(
            schedule.userId,
            'protection_activated',
            'Protection active',
            `Focus mode started: ${schedule.name} (${schedule.startTime}–${schedule.endTime})`,
          );
          state.activated = true;
          state.endingNotified = false;
          this.logger.log(`protection_activated → schedule ${schedule.id}`);
        }
        if (!state.endingNotified && endMin - nowMin <= ENDING_WINDOW_MIN) {
          await this.notifications.create(
            schedule.userId,
            'protection_ending',
            'Protection ending soon',
            `${schedule.name} ends at ${schedule.endTime} — ${endMin - nowMin} min remaining`,
          );
          state.endingNotified = true;
          this.logger.log(`protection_ending → schedule ${schedule.id}`);
        }
      } else {
        state.activated = false;
        state.endingNotified = false;
      }

      this.state.set(schedule.id, state);
    }
  }

  private toMinutes(start: string, end: string): [number, number] {
    const parse = (t: string) => {
      const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(t);
      return m ? Number(m[1]) * 60 + Number(m[2]) : null;
    };
    return [parse(start), parse(end)];
  }
}
