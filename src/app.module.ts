import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { BlockedAppsModule } from './blocked-apps/blocked-apps.module';
import { DevicesModule } from './devices/devices.module';
import { EmailModule } from './email/email.module';
import { HealthController } from './health.controller';
import { NotificationsModule } from './notifications/notifications.module';
import { ProtectionModule } from './protection/protection.module';
import { SchedulesModule } from './schedules/schedules.module';
import { TrustedPersonModule } from './trusted-person/trusted-person.module';
import { UnlockRequestsModule } from './unlock-requests/unlock-requests.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        ssl: { rejectUnauthorized: false },
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
      }),
    }),
    AuthModule,
    UsersModule,
    SchedulesModule,
    BlockedAppsModule,
    ProtectionModule,
    EmailModule,
    TrustedPersonModule,
    UnlockRequestsModule,
    NotificationsModule,
    DevicesModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
