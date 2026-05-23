import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum SiteContentType {
  TEXT = 'text',
  IMAGE = 'image',
  HTML = 'html',
  JSON = 'json',
}

@Entity('site_content')
export class SiteContent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  key: string;

  @Column()
  title: string;

  @Column({ type: 'jsonb', nullable: true })
  value?: unknown;

  @Column({ type: 'enum', enum: SiteContentType, default: SiteContentType.TEXT })
  type: SiteContentType;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
