import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('devices')
export class Device {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (u) => u.devices)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'push_token', type: 'varchar', nullable: true })
  pushToken: string | null;

  @Column({ default: 'android' })
  platform: string;

  @Column({ name: 'is_managed', default: false })
  isManaged: boolean;

  @CreateDateColumn({ name: 'last_seen' })
  lastSeen: Date;
}
