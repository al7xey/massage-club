import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { SubscriptionPlan } from '../../subscription-plans/entities/subscription-plan.entity';
import { User } from '../../users/entities/user.entity';

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  FROZEN = 'FROZEN',
  AUTO_RENEWAL_DISABLED = 'AUTO_RENEWAL_DISABLED',
  PAYMENT_ISSUE = 'PAYMENT_ISSUE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true, nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => SubscriptionPlan, { eager: true, nullable: false })
  @JoinColumn({ name: 'plan_id' })
  plan: SubscriptionPlan;

  @Column({ type: 'enum', enum: SubscriptionStatus, default: SubscriptionStatus.ACTIVE })
  status: SubscriptionStatus;

  @Column({ name: 'starts_at', type: 'timestamptz' })
  startsAt: Date;

  @Column({ name: 'ends_at', type: 'timestamptz' })
  endsAt: Date;

  @Column({ name: 'frozen_until', type: 'timestamptz', nullable: true })
  frozenUntil?: Date;

  @Column({ name: 'auto_renewal_enabled', default: true })
  autoRenewalEnabled: boolean;

  @Column({ name: 'grace_period_ends_at', type: 'timestamptz', nullable: true })
  gracePeriodEndsAt?: Date;

  @Column({ name: 'payment_issue_notified_at', type: 'timestamptz', nullable: true })
  paymentIssueNotifiedAt?: Date;

  @Column({ name: 'next_payment_retry_at', type: 'timestamptz', nullable: true })
  nextPaymentRetryAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
