import { demoSubscriptionPlans } from '@/data/mockData';
import type { SubscriptionPlan, UserSubscription } from '@/types';
import { addDays, createId, ensureSeedData, mockKeys, readJson, writeJson } from './storageService';
import { paymentService } from './paymentService';

function isSubscriptionActive(subscription: UserSubscription) {
  return subscription.status === 'active' && new Date(subscription.endDate) >= new Date();
}

export const subscriptionService = {
  getPlans(): SubscriptionPlan[] {
    return demoSubscriptionPlans;
  },

  getPlan(planId: string): SubscriptionPlan | undefined {
    return demoSubscriptionPlans.find((plan) => plan.id === planId);
  },

  getUserSubscriptions(userId: string): UserSubscription[] {
    ensureSeedData();
    return readJson<UserSubscription[]>(mockKeys.subscriptions, []).filter((subscription) => subscription.userId === userId);
  },

  getActiveSubscription(userId: string): UserSubscription | null {
    return this.getUserSubscriptions(userId).find(isSubscriptionActive) ?? null;
  },

  purchasePlan(userId: string, planId: string): UserSubscription {
    ensureSeedData();
    const plan = this.getPlan(planId);

    if (!plan) {
      throw new Error('Тариф не найден');
    }

    const subscriptions = readJson<UserSubscription[]>(mockKeys.subscriptions, []);
    const updatedSubscriptions = subscriptions.map((subscription) =>
      subscription.userId === userId && isSubscriptionActive(subscription)
        ? { ...subscription, status: 'cancelled' as const }
        : subscription,
    );

    const start = new Date();
    const subscription: UserSubscription = {
      id: createId('sub'),
      userId,
      planId: plan.id,
      planName: plan.name,
      status: 'active',
      startDate: start.toISOString(),
      endDate: addDays(start, plan.periodDays).toISOString(),
      remainingVisits: plan.includedVisits,
      discountPercent: plan.discountPercent,
    };

    writeJson(mockKeys.subscriptions, [subscription, ...updatedSubscriptions]);
    paymentService.createPayment(userId, 'subscription', `Подписка ${plan.name}`, plan.priceRub);
    return subscription;
  },

  consumeVisit(userId: string) {
    const subscriptions = readJson<UserSubscription[]>(mockKeys.subscriptions, []);
    const active = subscriptions.find((subscription) => subscription.userId === userId && isSubscriptionActive(subscription));

    if (!active || active.remainingVisits <= 0) {
      throw new Error('Нет доступных посещений');
    }

    writeJson(
      mockKeys.subscriptions,
      subscriptions.map((subscription) =>
        subscription.id === active.id
          ? { ...subscription, remainingVisits: subscription.remainingVisits - 1 }
          : subscription,
      ),
    );
  },

  getAllSubscriptions(): UserSubscription[] {
    ensureSeedData();
    return readJson<UserSubscription[]>(mockKeys.subscriptions, []);
  },
};
