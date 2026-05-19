import { UserRole } from '@massage/shared';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

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

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CLIENT })
  role: UserRole;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
