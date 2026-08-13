import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UnlockRequest } from './unlock-request.entity';

@Entity('otps')
export class Otp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'unlock_request_id', unique: true })
  unlockRequestId: string;

  @OneToOne(() => UnlockRequest, (u) => u.otp)
  @JoinColumn({ name: 'unlock_request_id' })
  unlockRequest: UnlockRequest;

  @Column()
  code: string;

  @Column({ name: 'expires_at' })
  expiresAt: Date;

  @Column({ default: 0 })
  attempts: number;

  @Column({ default: false })
  verified: boolean;
}
