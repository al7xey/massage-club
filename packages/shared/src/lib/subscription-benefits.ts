export interface SubscriptionBenefitContext {
  discountPercent: number;
  remainingCredits: number;
}

export interface SubscriptionBenefitItemInput {
  id: string;
  priceRub: number;
}

export interface SubscriptionBenefitItemResult {
  id: string;
  basePriceRub: number;
  finalPriceRub: number;
  paidBySubscriptionCredit: boolean;
  discountPercent: number;
}

export interface SubscriptionBenefitResult {
  items: SubscriptionBenefitItemResult[];
  subscriptionCreditsUsed: number;
  totalAmountRub: number;
}

export type SubscriptionPurchaseMode = 'ACTIVATE' | 'EXTEND' | 'SWITCH';

export function applySubscriptionBenefits(
  items: SubscriptionBenefitItemInput[],
  context?: Partial<SubscriptionBenefitContext> | null,
): SubscriptionBenefitResult {
  const discountPercent = normalizeDiscountPercent(context?.discountPercent);
  const remainingCredits = Math.max(0, Math.floor(context?.remainingCredits ?? 0));
  const prioritizedCredits = new Set(
    [...items]
      .sort((left, right) => right.priceRub - left.priceRub || left.id.localeCompare(right.id))
      .slice(0, remainingCredits)
      .map((item) => item.id),
  );

  const pricedItems = items.map<SubscriptionBenefitItemResult>((item) => {
    const paidBySubscriptionCredit = prioritizedCredits.has(item.id);

    return {
      id: item.id,
      basePriceRub: item.priceRub,
      finalPriceRub: paidBySubscriptionCredit ? 0 : Math.round(item.priceRub * (1 - discountPercent / 100)),
      paidBySubscriptionCredit,
      discountPercent: paidBySubscriptionCredit ? 0 : discountPercent,
    };
  });

  return {
    items: pricedItems,
    subscriptionCreditsUsed: pricedItems.filter((item) => item.paidBySubscriptionCredit).length,
    totalAmountRub: pricedItems.reduce((sum, item) => sum + item.finalPriceRub, 0),
  };
}

export function resolveSubscriptionPurchaseMode(activePlanId: null | string | undefined, nextPlanId: string): SubscriptionPurchaseMode {
  if (!activePlanId) {
    return 'ACTIVATE';
  }

  return activePlanId === nextPlanId ? 'EXTEND' : 'SWITCH';
}

const subscriptionBenefits = {
  applySubscriptionBenefits,
  resolveSubscriptionPurchaseMode,
};

export default subscriptionBenefits;

function normalizeDiscountPercent(value: number | undefined) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(value ?? 0)));
}
