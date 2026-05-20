import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ServiceCategory } from './service-category.entity';

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'duration_minutes' })
  durationMinutes: number;

  @Column({ name: 'duration_label', nullable: true })
  durationLabel?: string;

  @Column({ type: 'text', nullable: true })
  composition?: string;

  @Column({ name: 'external_source', nullable: true })
  externalSource?: string;

  @Column({ name: 'external_id', nullable: true })
  externalId?: string;

  @Column({ name: 'price_rub' })
  priceRub: number;

  @ManyToOne(() => ServiceCategory, (category) => category.services, { nullable: true, eager: true })
  @JoinColumn({ name: 'category_id' })
  category?: ServiceCategory;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
