import test from 'node:test';
import assert from 'node:assert/strict';

import { formatPrice } from '../../apps/client/src/shared/lib/currency/formatPrice.ts';
import { formatServiceCount } from '../../apps/client/src/shared/lib/text/formatServiceCount.ts';
import { repeatToLength } from '../../apps/client/src/shared/lib/collection/repeatToLength.ts';
import { formatUserDisplayName } from '../../apps/client/src/shared/lib/auth/formatUserDisplayName.ts';
import { getApiErrorMessage } from '../../apps/client/src/shared/lib/api/getApiErrorMessage.ts';
import {
  getSubscriptionPlanSortIndex,
  getSubscriptionPlanTitle,
} from '../../apps/client/src/entities/subscription/lib/getSubscriptionPlanTitle.ts';
import { createServiceCardModel } from '../../apps/client/src/entities/service/lib/createServiceCardModel.ts';
import { createMasterCardModel } from '../../apps/client/src/entities/master/lib/createMasterCardModel.ts';
import { createReviewCardModel } from '../../apps/client/src/entities/review/lib/createReviewCardModel.ts';
import { certificatePresets } from '../../apps/client/src/entities/certificate/model/presets.ts';

test('formatPrice renders Russian ruble values with thousands separator', () => {
  assert.equal(formatPrice(1000), '1\u00a0000 ₽');
  assert.equal(formatPrice(1250000), '1\u00a0250\u00a0000 ₽');
});

test('formatServiceCount chooses the correct Russian plural form', () => {
  assert.equal(formatServiceCount(1), '1 услуга');
  assert.equal(formatServiceCount(2), '2 услуги');
  assert.equal(formatServiceCount(5), '5 услуг');
  assert.equal(formatServiceCount(11), '11 услуг');
  assert.equal(formatServiceCount(21), '21 услуга');
});

test('repeatToLength repeats source items without mutating the original array', () => {
  const source = ['spa', 'massage'];
  const repeated = repeatToLength(source, 5);

  assert.deepEqual(repeated, ['spa', 'massage', 'spa', 'massage', 'spa']);
  assert.deepEqual(source, ['spa', 'massage']);
});

test('repeatToLength returns an empty array for empty input or non-positive length', () => {
  assert.deepEqual(repeatToLength([], 3), []);
  assert.deepEqual(repeatToLength(['spa'], 0), []);
  assert.deepEqual(repeatToLength(['spa'], -1), []);
});

test('formatUserDisplayName prefers trimmed fullName over separate name fields', () => {
  assert.equal(
    formatUserDisplayName({ fullName: '  Анна Семёнова  ', firstName: 'Анна', lastName: 'Петрова' }),
    'Анна Семёнова',
  );
});

test('formatUserDisplayName builds a name from firstName and lastName when fullName is absent', () => {
  assert.equal(formatUserDisplayName({ firstName: 'Иван', lastName: 'Петров' }), 'Иван Петров');
  assert.equal(formatUserDisplayName({ firstName: 'Иван', lastName: null }), 'Иван');
  assert.equal(formatUserDisplayName({ fullName: '   ', firstName: null, lastName: 'Петров' }), 'Петров');
});

test('getApiErrorMessage handles common API error shapes', () => {
  assert.equal(getApiErrorMessage('plain error'), 'plain error');
  assert.equal(getApiErrorMessage(new Error('runtime error')), 'runtime error');
  assert.equal(getApiErrorMessage({ data: 'server error' }), 'server error');
  assert.equal(getApiErrorMessage({ data: { message: ['email is required', 'password is short'] } }), 'email is required, password is short');
  assert.equal(getApiErrorMessage({ data: { message: 'validation failed' } }), 'validation failed');
  assert.equal(getApiErrorMessage({ error: 'network failed' }), 'network failed');
  assert.equal(getApiErrorMessage({}, 'fallback text'), 'fallback text');
});

test('subscription plan helpers map known codes and keep unknown codes after known plans', () => {
  assert.equal(getSubscriptionPlanTitle('LADY_SUPER', 'fallback'), 'LADY SUPER');
  assert.equal(getSubscriptionPlanTitle('CUSTOM', 'Custom plan'), 'Custom plan');
  assert.ok(getSubscriptionPlanSortIndex('UNKNOWN') > getSubscriptionPlanSortIndex('FAMILY_SUPER'));
});

test('createServiceCardModel derives display labels from known category slugs', () => {
  const model = createServiceCardModel({
    id: 'service-1',
    title: 'Классический массаж',
    durationMinutes: 60,
    priceRub: 3500,
    category: { id: 'cat-1', name: 'Massage', slug: 'massage' },
  });

  assert.equal(model.categoryLabel, 'Массаж для женщин');
  assert.equal(model.badgeText, '60 мин');
});

test('createServiceCardModel keeps custom category names as stored', () => {
  const model = createServiceCardModel({
    id: 'service-2',
    title: 'SPA',
    durationMinutes: 90,
    priceRub: 5000,
    category: { id: 'cat-2', name: 'spa уход', slug: 'custom-spa' },
  });

  assert.equal(model.categoryLabel, 'spa уход');
  assert.equal(model.badgeText, '90 мин');
});

test('createMasterCardModel builds a stable master presentation model', () => {
  const model = createMasterCardModel(
    {
      id: 'master-1',
      firstName: 'Анна',
      lastName: 'Петрова',
      bio: 'Специалист по массажу',
      photoUrls: ['https://example.com/photo.jpg'],
      services: [{ id: 'service-1' }, { id: 'service-2' }],
    },
    1,
  );

  assert.equal(model.fullName, 'Анна Петрова');
  assert.equal(model.summary, 'Специалист по массажу');
  assert.equal(model.rating, 4.9);
  assert.equal(model.reviewsCount, 51);
  assert.equal(model.photoUrl, 'https://example.com/photo.jpg');
});

test('createMasterCardModel falls back to generated summary and direct photoUrl', () => {
  const model = createMasterCardModel(
    {
      id: 'master-2',
      firstName: 'Иван',
      lastName: 'Сидоров',
      photoUrl: 'https://example.com/direct.jpg',
      services: [{ id: 'service-1' }],
    },
    2,
  );

  assert.equal(model.fullName, 'Иван Сидоров');
  assert.equal(model.rating, 5);
  assert.match(model.summary, /RelaxUp: 1 услуг/);
  assert.equal(model.photoUrl, 'https://example.com/direct.jpg');
});

test('createReviewCardModel builds display data from a complete review', () => {
  const model = createReviewCardModel({
    id: 'review-1',
    rating: 5,
    comment: 'Отличный сервис',
    createdAt: '2026-06-01T12:00:00.000Z',
    user: { fullName: 'Мария' },
    service: { title: 'SPA-программа' },
  });

  assert.equal(model.id, 'review-1');
  assert.equal(model.author, 'Мария');
  assert.equal(model.role, 'SPA-программа');
  assert.equal(model.text, 'Отличный сервис');
  assert.equal(model.rating, 5);
  assert.match(model.date, /01\.06\.2026|1\.06\.2026/);
});

test('createReviewCardModel fills guest fallback values for anonymous reviews', () => {
  const model = createReviewCardModel({
    id: 'review-2',
    rating: 4,
    comment: '',
    createdAt: '2026-06-02T12:00:00.000Z',
  });

  assert.equal(model.author, 'Гость RelaxUp');
  assert.equal(model.role, 'Гость клуба');
  assert.ok(model.text.length > 10);
});

test('certificate presets expose expected fixed amounts', () => {
  assert.deepEqual(
    certificatePresets.map((preset) => preset.value),
    [1000, 3000, 5000, 10000],
  );
  assert.equal(certificatePresets.at(-1)?.label, '10 000 ₽');
});
