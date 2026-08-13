import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('blocked_apps')
export class BlockedApp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (u) => u.blockedApps)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'package_name' })
  packageName: string;

  @Column({ name: 'app_name' })
  appName: string;

  @Column({ type: 'varchar', nullable: true })
  category: string | null;

  @Column({ name: 'is_blocked', default: true })
  isBlocked: boolean;
}
