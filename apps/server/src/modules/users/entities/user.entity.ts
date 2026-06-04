import { UserGender, UserRole } from '@massage/shared';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Studio } from '../../studios/entities/studio.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', unique: true, nullable: true })
  email?: string | null;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ name: 'full_name', type: 'text', default: '' })
  fullName: string;

  @Column({ type: 'text', nullable: true, unique: true })
  phone?: string | null;

  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  avatarUrl?: string | null;

  @Column({ name: 'yandex_id', type: 'text', unique: true, nullable: true })
  yandexId?: string | null;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CLIENT })
  role: UserRole;

  @Column({ type: 'enum', enum: UserGender, default: UserGender.FEMALE })
  gender: UserGender;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ManyToMany(() => Studio, { eager: true })
  @JoinTable({
    name: 'admin_studios',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'studio_id', referencedColumnName: 'id' },
  })
  adminStudios: Studio[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date | null;
}
