import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { applySubscriptionBenefits, resolveSubscriptionPurchaseMode } = require('../packages/shared/dist/lib/subscription-benefits.js');

test('applySubscriptionBenefits spends credits on the most expensive services first', () => {
  const result = applySubscriptionBenefits(
    [
      { id: 'back', priceRub: 3200 },
      { id: 'face', priceRub: 1800 },
      { id: 'spa', priceRub: 4700, isIncludedInSubscription: true },
      { id: 'classic', priceRub: 2500, isIncludedInSubscription: true },
    ],
    {
      discountPercent: 10,
      remainingCredits: 2,
    },
  );

  const pricedById = new Map(result.items.map((item) => [item.id, item]));

  assert.equal(result.subscriptionCreditsUsed, 2);
  assert.equal(result.totalAmountRub, 4500);
  assert.equal(pricedById.get('spa')?.finalPriceRub, 0);
  assert.equal(pricedById.get('classic')?.finalPriceRub, 0);
  assert.equal(pricedById.get('back')?.finalPriceRub, 2880);
  assert.equal(pricedById.get('face')?.finalPriceRub, 1620);
  assert.equal(pricedById.get('face')?.discountPercent, 10);
});

test('applySubscriptionBenefits falls back to percentage discount when there are no credits left', () => {
  const result = applySubscriptionBenefits(
    [
      { id: 'relax', priceRub: 4000 },
      { id: 'deep', priceRub: 5000 },
    ],
    {
      discountPercent: 15,
      remainingCredits: 0,
    },
  );

  assert.equal(result.subscriptionCreditsUsed, 0);
  assert.equal(result.totalAmountRub, 7650);
  assert.deepEqual(
    result.items.map((item) => item.finalPriceRub),
    [3400, 4250],
  );
});

test('resolveSubscriptionPurchaseMode distinguishes new activation, extension and switching', () => {
  assert.equal(resolveSubscriptionPurchaseMode(undefined, 'plan-a'), 'ACTIVATE');
  assert.equal(resolveSubscriptionPurchaseMode('plan-a', 'plan-a'), 'EXTEND');
  assert.equal(resolveSubscriptionPurchaseMode('plan-a', 'plan-b'), 'SWITCH');
});
