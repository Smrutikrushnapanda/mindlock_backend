import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('protection_settings')
export class ProtectionSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', unique: true })
  userId: string;

  @OneToOne(() => User, (u) => u.protectionSettings)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'porn_blocking', default: true })
  pornBlocking: boolean;

  @Column({ name: 'app_blocking', default: true })
  appBlocking: boolean;

  @Column({ name: 'protection_level', default: 'high' })
  protectionLevel: string;

  @Column({
    name: 'blocked_categories',
    type: 'text',
    array: true,
    default: () => `ARRAY['adult','dating','gambling','drugs','explicit']`,
  })
  blockedCategories: string[];

  @Column({ name: 'vpn_connected', default: false })
  vpnConnected: boolean;

  @CreateDateColumn({ name: 'last_sync' })
  lastSync: Date;
}
