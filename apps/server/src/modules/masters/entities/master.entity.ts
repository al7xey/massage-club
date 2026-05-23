import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Service } from '../../services/entities/service.entity';
import { Studio } from '../../studios/entities/studio.entity';

@Entity('masters')
export class Master {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ type: 'text', nullable: true })
  bio?: string | null;

  @Column({ type: 'text', nullable: true })
  phone?: string | null;

  @Column({ type: 'text', nullable: true })
  specialization?: string | null;

  @Column({ name: 'experience_years', default: 0 })
  experienceYears: number;

  @Column({ name: 'photo_url', type: 'text', nullable: true })
  photoUrl?: string | null;

  @Column({ name: 'photo_urls', type: 'jsonb', default: () => "'[]'" })
  photoUrls: string[];

  @ManyToOne(() => Studio, { eager: true, nullable: true })
  @JoinColumn({ name: 'studio_id' })
  studio?: Studio;

  @ManyToMany(() => Studio, { eager: true })
  @JoinTable({ name: 'master_studios' })
  studios: Studio[];

  @ManyToMany(() => Service, { eager: true })
  @JoinTable({ name: 'master_services' })
  services: Service[];

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date | null;
}
