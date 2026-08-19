import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('blocked_domains')
@Index(['category', 'domain'], { unique: true })
export class BlockedDomain {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  category: string;

  @Column()
  domain: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
