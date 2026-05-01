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

  @Column({ name: 'discount_percent' })
  discountPercent: number;

  @Column({ name: 'included_credits' })
  includedCredits: number;

  @Column({ name: 'family_members_limit', default: 1 })
  familyMembersLimit: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
