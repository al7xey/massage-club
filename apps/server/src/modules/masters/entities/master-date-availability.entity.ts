import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Studio } from '../../studios/entities/studio.entity';
import { Master } from './master.entity';

export enum MasterDateAvailabilityStatus {
  AVAILABLE = 'available',
  UNAVAILABLE = 'unavailable',
  CUSTOM = 'custom',
  VACATION = 'vacation',
  SICK = 'sick',
  OTHER = 'other',
}

@Entity('master_date_availability')
export class MasterDateAvailability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Master, { eager: true, nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'master_id' })
  master: Master;

  @ManyToOne(() => Studio, { eager: true, nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'studio_id' })
  studio?: Studio | null;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'enum', enum: MasterDateAvailabilityStatus, default: MasterDateAvailabilityStatus.UNAVAILABLE })
  status: MasterDateAvailabilityStatus;

  @Column({ name: 'start_time', type: 'varchar', length: 5, nullable: true })
  startTime?: string | null;

  @Column({ name: 'end_time', type: 'varchar', length: 5, nullable: true })
  endTime?: string | null;

  @Column({ type: 'text', nullable: true })
  reason?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
