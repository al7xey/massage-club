const test = require('node:test');
const assert = require('node:assert/strict');

process.env.TS_NODE_PROJECT = 'apps/server/tsconfig.json';
require('reflect-metadata');
require('ts-node/register/transpile-only');

const { NotFoundException } = require('@nestjs/common');
const {
  normalizeEmail,
  normalizePhone,
  isEmailIdentifier,
} = require('../../apps/server/src/common/utils/normalize-contact.util.ts');
const { TrimPipe } = require('../../apps/server/src/common/pipes/trim.pipe.ts');
const { EncryptionService } = require('../../apps/server/src/common/security/encryption.service.ts');
const { SubscriptionPlansService } = require('../../apps/server/src/modules/subscription-plans/subscription-plans.service.ts');
const { PaymentsService } = require('../../apps/server/src/modules/payments/payments.service.ts');
const { PaymentStatus } = require('../../apps/server/src/modules/payments/entities/payment.entity.ts');
const { GiftCertificatesService } = require('../../apps/server/src/modules/gift-certificates/gift-certificates.service.ts');
const {
  GiftCertificateFormat,
} = require('../../apps/server/src/modules/gift-certificates/entities/gift-certificate.entity.ts');

function createRepositoryMock(initial = []) {
  const records = [...initial];
  const calls = {
    create: [],
    save: [],
    find: [],
    findOne: [],
    findOneByOrFail: [],
    delete: [],
  };

  return {
    records,
    calls,
    create(payload) {
      calls.create.push(payload);
      return { ...payload };
    },
    async save(entity) {
      calls.save.push(entity);
      if (entity.id) {
        const index = records.findIndex((record) => record.id === entity.id);
        if (index >= 0) {
          records[index] = entity;
        } else {
          records.push(entity);
        }
      }
      return entity;
    },
    async find(options) {
      calls.find.push(options);
      return records;
    },
    async findOne(options) {
      calls.findOne.push(options);
      const id = options?.where?.id;
      const code = options?.where?.code;
      if (id) {
        return records.find((record) => record.id === id) ?? null;
      }
      if (code) {
        return records.find((record) => record.code === code) ?? null;
      }
      return records[0] ?? null;
    },
    async findOneByOrFail(criteria) {
      calls.findOneByOrFail.push(criteria);
      const id = criteria?.id;
      const record = records.find((item) => item.id === id);
      if (!record) {
        throw new Error('not found');
      }
      return record;
    },
    async delete(id) {
      calls.delete.push(id);
      const index = records.findIndex((record) => record.id === id);
      if (index >= 0) {
        records.splice(index, 1);
      }
      return { affected: index >= 0 ? 1 : 0 };
    },
  };
}

test('normalizeEmail trims, lowercases and converts blank values to null', () => {
  assert.equal(normalizeEmail('  USER@Example.COM  '), 'user@example.com');
  assert.equal(normalizeEmail('   '), null);
  assert.equal(normalizeEmail(null), null);
});

test('normalizePhone converts Russian local formats to canonical +7 format', () => {
  assert.equal(normalizePhone('8 (999) 123-45-67'), '+79991234567');
  assert.equal(normalizePhone('9991234567'), '+79991234567');
  assert.equal(normalizePhone('+7 999 123 45 67'), '+79991234567');
});

test('normalizePhone preserves short non-empty values and drops empty values', () => {
  assert.equal(normalizePhone('12345'), '12345');
  assert.equal(normalizePhone('abc'), null);
  assert.equal(normalizePhone('   '), null);
});

test('isEmailIdentifier detects email-like login identifiers', () => {
  assert.equal(isEmailIdentifier('user@example.com'), true);
  assert.equal(isEmailIdentifier('+79991234567'), false);
});

test('TrimPipe trims string payloads and keeps non-string payloads untouched', () => {
  const pipe = new TrimPipe();
  const objectValue = { name: '  stays as is  ' };

  assert.equal(pipe.transform('  hello  ', {}), 'hello');
  assert.equal(pipe.transform(42, {}), 42);
  assert.equal(pipe.transform(objectValue, {}), objectValue);
});

test('EncryptionService encrypts and decrypts contact data', () => {
  const service = new EncryptionService({ get: () => '12345678901234567890123456789012' });
  const encrypted = service.encrypt('client@example.com');

  assert.notEqual(encrypted, 'client@example.com');
  assert.ok(encrypted.startsWith('enc:v1:'));
  assert.equal(service.decrypt(encrypted), 'client@example.com');
});

test('EncryptionService leaves empty, plain and already encrypted values unchanged when appropriate', () => {
  const service = new EncryptionService({ get: () => '12345678901234567890123456789012' });

  assert.equal(service.encrypt(''), '');
  assert.equal(service.decrypt('plain-value'), 'plain-value');
  assert.equal(service.encrypt('enc:v1:already-encrypted'), 'enc:v1:already-encrypted');
});

test('EncryptionService accepts hex and base64 keys and rejects weak keys', () => {
  assert.doesNotThrow(() => new EncryptionService({ get: () => 'a'.repeat(64) }));
  assert.doesNotThrow(() => new EncryptionService({ get: () => Buffer.alloc(32, 7).toString('base64') }));
  assert.throws(() => new EncryptionService({ get: () => 'short-key' }), /APP_ENCRYPTION_KEY/);
});

test('SubscriptionPlansService returns active plans in business order with display names', async () => {
  const repository = createRepositoryMock([
    { id: '3', code: 'FAMILY_SUPER', name: 'old family super', isActive: true },
    { id: '1', code: 'LADY', name: 'old lady', isActive: true },
    { id: '2', code: 'MISTER', name: 'old mister', isActive: true },
    { id: '4', code: 'CUSTOM', name: 'Custom', isActive: true },
  ]);
  const service = new SubscriptionPlansService(repository);

  const plans = await service.findAll();

  assert.deepEqual(plans.map((plan) => plan.code), ['LADY', 'MISTER', 'FAMILY_SUPER', 'CUSTOM']);
  assert.equal(plans[0].name, 'LADY');
  assert.equal(repository.calls.find[0].where.isActive, true);
});

test('SubscriptionPlansService finds, creates, updates and soft-deletes plans', async () => {
  const repository = createRepositoryMock([{ id: 'plan-1', code: 'LADY', name: 'LADY', isActive: true }]);
  const service = new SubscriptionPlansService(repository);

  assert.equal((await service.findOne('plan-1')).id, 'plan-1');
  assert.deepEqual(await service.create({ code: 'CUSTOM', name: 'Custom' }), { code: 'CUSTOM', name: 'Custom' });

  const updated = await service.update('plan-1', { name: 'LADY updated' });
  assert.equal(updated.name, 'LADY updated');

  const removed = await service.remove('plan-1');
  assert.equal(removed.isActive, false);
  assert.equal(repository.calls.save.length, 3);
});

test('SubscriptionPlansService throws NotFoundException for unknown plans', async () => {
  const service = new SubscriptionPlansService(createRepositoryMock());

  await assert.rejects(() => service.findOne('missing'), NotFoundException);
});

test('PaymentsService creates paid mock checkout records for existing users', async () => {
  const paymentsRepository = createRepositoryMock();
  const usersRepository = createRepositoryMock([{ id: 'user-1', fullName: 'Client' }]);
  const service = new PaymentsService(paymentsRepository, usersRepository);

  const payment = await service.mockCheckout('user-1', {
    amountRub: 5000,
    purpose: 'SUBSCRIPTION',
    relatedEntityId: 'plan-1',
  });

  assert.equal(payment.amountRub, 5000);
  assert.equal(payment.status, PaymentStatus.PAID);
  assert.equal(payment.provider, 'mock');
  assert.equal(payment.user.id, 'user-1');
});

test('PaymentsService reads payment lists with newest-first ordering', async () => {
  const paymentsRepository = createRepositoryMock([{ id: 'payment-1', user: { id: 'user-1' } }]);
  const service = new PaymentsService(paymentsRepository, createRepositoryMock());

  await service.findMine('user-1');
  await service.findAll();

  assert.deepEqual(paymentsRepository.calls.find[0].where, { user: { id: 'user-1' } });
  assert.deepEqual(paymentsRepository.calls.find[0].order, { createdAt: 'DESC' });
  assert.deepEqual(paymentsRepository.calls.find[1].order, { createdAt: 'DESC' });
});

test('PaymentsService throws NotFoundException when payment is absent', async () => {
  const service = new PaymentsService(createRepositoryMock(), createRepositoryMock());

  await assert.rejects(() => service.findOne('missing'), NotFoundException);
});

test('GiftCertificatesService creates admin certificates with default email format and one-year expiry', async () => {
  const certificatesRepository = createRepositoryMock();
  const service = new GiftCertificatesService(certificatesRepository, createRepositoryMock(), createRepositoryMock());

  const originalRandom = Math.random;
  Math.random = () => 0.123456789;
  try {
    const before = Date.now();
    const certificate = await service.createAdmin({
      recipientName: 'Анна',
      recipientContact: 'anna@example.com',
      amountRub: 3000,
      message: 'Поздравляем',
    });
    const after = Date.now();

    assert.equal(certificate.format, GiftCertificateFormat.EMAIL);
    assert.equal(certificate.code, 'GIFT-4FZZZX');
    assert.equal(certificate.amountRub, 3000);
    assert.ok(certificate.expiresAt.getTime() > before);
    assert.ok(certificate.expiresAt.getTime() > after + 300 * 24 * 60 * 60 * 1000);
  } finally {
    Math.random = originalRandom;
  }
});

test('GiftCertificatesService creates user certificate and linked paid payment', async () => {
  const buyer = { id: 'user-1', fullName: 'Client' };
  const certificatesRepository = createRepositoryMock();
  const usersRepository = createRepositoryMock([buyer]);
  const paymentsRepository = createRepositoryMock();
  const service = new GiftCertificatesService(certificatesRepository, usersRepository, paymentsRepository);

  const result = await service.create('user-1', {
    recipientName: 'Анна',
    recipientContact: 'anna@example.com',
    amountRub: 5000,
    format: GiftCertificateFormat.PRINTED,
  });

  assert.equal(result.buyer, buyer);
  assert.equal(result.payment.amountRub, 5000);
  assert.equal(result.payment.provider, 'mock');
  assert.equal(result.payment.status, PaymentStatus.PAID);
  assert.match(result.payment.purpose, /^GIFT_CERTIFICATE:GIFT-/);
});

test('GiftCertificatesService finds certificates by code and throws for missing codes', async () => {
  const service = new GiftCertificatesService(
    createRepositoryMock([{ id: 'cert-1', code: 'GIFT-ABC123' }]),
    createRepositoryMock(),
    createRepositoryMock(),
  );

  assert.equal((await service.findByCode('GIFT-ABC123')).id, 'cert-1');
  await assert.rejects(() => service.findByCode('GIFT-MISSING'), NotFoundException);
});

test('GiftCertificatesService updates, lists and removes certificates', async () => {
  const certificatesRepository = createRepositoryMock([{ id: 'cert-1', code: 'GIFT-ABC123', amountRub: 1000 }]);
  const service = new GiftCertificatesService(certificatesRepository, createRepositoryMock(), createRepositoryMock());

  assert.deepEqual(await service.findMine('user-1'), certificatesRepository.records);
  assert.deepEqual(await service.findAll(), certificatesRepository.records);

  const updated = await service.update('cert-1', { amountRub: 3000 });
  assert.equal(updated.amountRub, 3000);

  assert.deepEqual(await service.remove('cert-1'), { deleted: true });
  assert.equal(certificatesRepository.calls.delete[0], 'cert-1');
});

test('GiftCertificatesService throws NotFoundException when updating or removing unknown certificates', async () => {
  const service = new GiftCertificatesService(createRepositoryMock(), createRepositoryMock(), createRepositoryMock());

  await assert.rejects(() => service.update('missing', { amountRub: 3000 }), NotFoundException);
  await assert.rejects(() => service.remove('missing'), NotFoundException);
});
