import { SubscriptionStatus } from '../entities/subscription.entity';

export interface SubscriptionState {
  status: SubscriptionStatus;
  activeUntil: Date;
}
