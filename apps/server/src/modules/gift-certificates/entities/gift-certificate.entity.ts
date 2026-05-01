import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum GiftCertificateStatus {
  ACTIVE = 'ACTIVE',
  REDEEMED = 'REDEEMED',
  EXPIRED = 'EXPIRED',
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

  @Column({ name: 'amount_rub' })
  amountRub: number;

  @Column({ type: 'enum', enum: GiftCertificateStatus, default: GiftCertificateStatus.ACTIVE })
  status: GiftCertificateStatus;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
