import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Service } from '../../services/entities/service.entity';
import { Subscription } from './subscription.entity';

@Entity('subscription_credits')
export class SubscriptionCredit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Subscription, { nullable: false })
  @JoinColumn({ name: 'subscription_id' })
  subscription: Subscription;

  @ManyToOne(() => Service, { eager: true, nullable: true })
  @JoinColumn({ name: 'service_id' })
  service?: Service;

  @Column({ name: 'total_credits' })
  totalCredits: number;

  @Column({ name: 'remaining_credits' })
  remainingCredits: number;
}
