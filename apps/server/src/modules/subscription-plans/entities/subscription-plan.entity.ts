import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('subscription_plans')
export class SubscriptionPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'monthly_price_rub' })
  monthlyPriceRub: number;

  @Column({ name: 'period_days', default: 30 })
  periodDays: number;

  @Column({ name: 'discount_percent' })
  discountPercent: number;

  @Column({ name: 'certificate_discount_percent', default: 0 })
  certificateDiscountPercent: number;

  @Column({ name: 'included_credits' })
  includedCredits: number;

  @Column({ name: 'included_description', type: 'text', nullable: true })
  includedDescription?: string;

  @Column({ name: 'freeze_count_per_year', default: 0 })
  freezeCountPerYear: number;

  @Column({ name: 'freeze_days', default: 0 })
  freezeDays: number;

  @Column({ name: 'family_members_limit', default: 1 })
  familyMembersLimit: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
