import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Master } from '../../masters/entities/master.entity';
import { Service } from '../../services/entities/service.entity';
import { Studio } from '../../studios/entities/studio.entity';
import { User } from '../../users/entities/user.entity';

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true, nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Service, { eager: true, nullable: false })
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @ManyToOne(() => Studio, { eager: true, nullable: false })
  @JoinColumn({ name: 'studio_id' })
  studio: Studio;

  @ManyToOne(() => Master, { eager: true, nullable: false })
  @JoinColumn({ name: 'master_id' })
  master: Master;

  @Column({ name: 'starts_at', type: 'timestamptz' })
  startsAt: Date;

  @Column({ name: 'ends_at', type: 'timestamptz' })
  endsAt: Date;

  @Column({ type: 'enum', enum: AppointmentStatus, default: AppointmentStatus.SCHEDULED })
  status: AppointmentStatus;

  @Column({ name: 'price_rub' })
  priceRub: number;

  @Column({ type: 'text', nullable: true })
  note?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
