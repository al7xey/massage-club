import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Studio } from '../../studios/entities/studio.entity';
import { Master } from './master.entity';

@Entity('master_shifts')
export class MasterShift {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Master, { eager: true, nullable: false })
  @JoinColumn({ name: 'master_id' })
  master: Master;

  @ManyToOne(() => Studio, { eager: true, nullable: false })
  @JoinColumn({ name: 'studio_id' })
  studio: Studio;

  @Column({ name: 'starts_at', type: 'timestamptz' })
  startsAt: Date;

  @Column({ name: 'ends_at', type: 'timestamptz' })
  endsAt: Date;

  @Column({ name: 'is_available', default: true })
  isAvailable: boolean;
}
