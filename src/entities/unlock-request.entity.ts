import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Otp } from './otp.entity';

@Entity('unlock_requests')
export class UnlockRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (u) => u.unlockRequests)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  reason: string;

  @Column({ name: 'custom_message', type: 'varchar', nullable: true })
  customMessage: string | null;

  @Column({ name: 'duration_min' })
  durationMin: number;

  @Column({ default: 'pending' })
  status: string;

  @CreateDateColumn({ name: 'requested_at', type: 'timestamptz' })
  requestedAt: Date;

  @Column({ name: 'responded_at', type: 'timestamptz', nullable: true })
  respondedAt: Date | null;

  @Column({ name: 'unlocked_until', type: 'timestamptz', nullable: true })
  unlockedUntil: Date | null;

  @OneToOne(() => Otp, (o) => o.unlockRequest)
  otp: Otp;
}
