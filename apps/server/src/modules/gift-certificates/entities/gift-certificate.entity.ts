import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum GiftCertificateStatus {
  ACTIVE = 'ACTIVE',
  REDEEMED = 'REDEEMED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export enum GiftCertificateFormat {
  EMAIL = 'EMAIL',
  PAPER = 'PAPER',
}

@Entity('gift_certificates')
export class GiftCertificate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'buyer_id' })
  buyer?: User;

  @Column({ name: 'recipient_name' })
  recipientName: string;

  @Column({ name: 'recipient_contact', nullable: true })
  recipientContact?: string;

  @Column({ type: 'enum', enum: GiftCertificateFormat, default: GiftCertificateFormat.EMAIL })
  format: GiftCertificateFormat;

  @Column({ name: 'amount_rub' })
  amountRub: number;

  @Column({ type: 'text', nullable: true })
  message?: string;

  @Column({ type: 'enum', enum: GiftCertificateStatus, default: GiftCertificateStatus.ACTIVE })
  status: GiftCertificateStatus;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
