import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { TrustedPerson } from './entities/trusted-person.entity';
import { Schedule } from './entities/schedule.entity';
import { BlockedApp } from './entities/blocked-app.entity';
import { ProtectionSettings } from './entities/protection-settings.entity';
import { UnlockRequest } from './entities/unlock-request.entity';
import { Otp } from './entities/otp.entity';
import { Notification } from './entities/notification.entity';
import { Device } from './entities/device.entity';
import { InviteOtp } from './entities/invite-otp.entity';
import { BlockedDomain } from './entities/blocked-domain.entity';

config();

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  extra: { options: '-c timezone=UTC' },
  entities: [
    User,
    TrustedPerson,
    Schedule,
    BlockedApp,
    ProtectionSettings,
    UnlockRequest,
    Otp,
    Notification,
    Device,
    InviteOtp,
    BlockedDomain,
  ],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
});
