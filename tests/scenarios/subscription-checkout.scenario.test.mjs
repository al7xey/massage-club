import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { applySubscriptionBenefits, resolveSubscriptionPurchaseMode } = require('../../packages/shared/dist/lib/subscription-benefits.js');

test('scenario: registered client buys a SUPER subscription and receives credits plus discount on paid services', () => {
  const selectedServices = [
    { id: 'relax', priceRub: 3200, isIncludedInSubscription: true },
    { id: 'spa', priceRub: 6000, isIncludedInSubscription: true },
    { id: 'wrap', priceRub: 4500 },
  ];

  const mode = resolveSubscriptionPurchaseMode(undefined, 'LADY_SUPER');
  const pricing = applySubscriptionBenefits(selectedServices, {
    discountPercent: 30,
    remainingCredits: 1,
  });

  assert.equal(mode, 'ACTIVATE');
  assert.equal(pricing.subscriptionCreditsUsed, 1);
  assert.equal(pricing.items.find((item) => item.id === 'spa')?.finalPriceRub, 0);
  assert.equal(pricing.items.find((item) => item.id === 'relax')?.finalPriceRub, 2240);
  assert.equal(pricing.items.find((item) => item.id === 'wrap')?.finalPriceRub, 3150);
  assert.equal(pricing.totalAmountRub, 5390);
});

test('scenario: existing subscriber extending the same plan keeps EXTEND purchase mode', () => {
  assert.equal(resolveSubscriptionPurchaseMode('FAMILY', 'FAMILY'), 'EXTEND');
});

test('scenario: subscriber changing tariff receives SWITCH purchase mode', () => {
  assert.equal(resolveSubscriptionPurchaseMode('LADY', 'MISTER_SUPER'), 'SWITCH');
});
