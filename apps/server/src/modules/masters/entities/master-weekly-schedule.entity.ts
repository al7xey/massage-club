import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Studio } from '../../studios/entities/studio.entity';
import { Master } from './master.entity';

@Entity('master_weekly_schedules')
export class MasterWeeklySchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Master, { eager: true, nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'master_id' })
  master: Master;

  @ManyToOne(() => Studio, { eager: true, nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studio_id' })
  studio: Studio;

  @Column({ name: 'day_of_week' })
  dayOfWeek: number;

  @Column({ name: 'interval_index', default: 0 })
  intervalIndex: number;

  @Column({ name: 'is_working', default: true })
  isWorking: boolean;

  @Column({ name: 'start_time', type: 'varchar', length: 5, nullable: true })
  startTime?: string | null;

  @Column({ name: 'end_time', type: 'varchar', length: 5, nullable: true })
  endTime?: string | null;

  @Column({ name: 'break_start_time', type: 'varchar', length: 5, nullable: true })
  breakStartTime?: string | null;

  @Column({ name: 'break_end_time', type: 'varchar', length: 5, nullable: true })
  breakEndTime?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
