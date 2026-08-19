import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TrustedPerson } from './trusted-person.entity';
import { Schedule } from './schedule.entity';
import { BlockedApp } from './blocked-app.entity';
import { ProtectionSettings } from './protection-settings.entity';
import { UnlockRequest } from './unlock-request.entity';
import { Notification } from './notification.entity';
import { Device } from './device.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ name: 'biometric_enabled', default: false })
  biometricEnabled: boolean;

  @Column({ name: 'pin_hash', type: 'varchar', nullable: true })
  pinHash: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @OneToOne(() => TrustedPerson, (t) => t.user)
  trustedPerson: TrustedPerson;

  @OneToMany(() => Schedule, (s) => s.user)
  schedules: Schedule[];

  @OneToMany(() => BlockedApp, (b) => b.user)
  blockedApps: BlockedApp[];

  @OneToOne(() => ProtectionSettings, (p) => p.user)
  protectionSettings: ProtectionSettings;

  @OneToMany(() => UnlockRequest, (u) => u.user)
  unlockRequests: UnlockRequest[];

  @OneToMany(() => Notification, (n) => n.user)
  notifications: Notification[];

  @OneToMany(() => Device, (d) => d.user)
  devices: Device[];
}
