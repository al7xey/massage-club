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

  @Column({ name: 'short_description', type: 'text', nullable: true })
  shortDescription?: string | null;

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

  @Column({ name: 'subscription_price_rub', type: 'integer', nullable: true })
  subscriptionPriceRub?: number | null;

  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl?: string | null;

  @Column({ name: 'gallery_urls', type: 'jsonb', default: () => "'[]'" })
  galleryUrls: string[];

  @Column({ type: 'text', nullable: true })
  contraindications?: string | null;

  @Column({ type: 'text', nullable: true })
  benefits?: string | null;

  @Column({ type: 'text', nullable: true })
  rules?: string | null;

  @Column({ name: 'seo_title', type: 'text', nullable: true })
  seoTitle?: string | null;

  @Column({ name: 'seo_description', type: 'text', nullable: true })
  seoDescription?: string | null;

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
