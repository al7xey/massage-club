import { useState } from 'react';
import { IssueCertificateForm } from '@/features/issue-certificate';
import { useLookupGiftCertificateQuery } from '@/entities/certificate';
import { getApiErrorMessage } from '@/shared/lib/api/getApiErrorMessage';
import { PageShell } from '@/shared/ui/page-shell/PageShell';
import styles from './CertificatesPage.module.css';

export function CertificatesPage() {
  const [mode, setMode] = useState<'new' | 'status'>('new');
  const [lookupValue, setLookupValue] = useState('');
  const [submittedCode, setSubmittedCode] = useState('');
  const { data: certificate, error, isFetching } = useLookupGiftCertificateQuery(submittedCode, { skip: !submittedCode });
  const actions = (
    <div className={styles.segment}>
      <button
        className={mode === 'new' ? styles.segmentActive : styles.segmentItem}
        type="button"
        onClick={() => setMode('new')}
      >
        Оформить новый
      </button>
      <button
        className={mode === 'status' ? styles.segmentActive : styles.segmentItem}
        type="button"
        onClick={() => setMode('status')}
      >
        Проверить статус
      </button>
    </div>
  );

  return (
    <PageShell title="Сертификаты" description="Подарите близким заботу и спокойное время для себя." actions={actions}>
      <section className={styles.layout}>
        {mode === 'new' ? (
          <IssueCertificateForm />
        ) : (
          <div className={styles.statusPanel}>
            <h2>Проверить сертификат</h2>
            <p>Введите код сертификата, чтобы посмотреть номинал, срок действия и текущий статус.</p>
            <input placeholder="Например: GIFT-DEMO01" value={lookupValue} onChange={(event) => setLookupValue(event.target.value)} />
            <button type="button" onClick={() => setSubmittedCode(lookupValue.trim().toUpperCase())}>
              {isFetching ? 'Проверяем...' : 'Проверить'}
            </button>
            {error ? <p className={styles.error}>{getApiErrorMessage(error, 'Не удалось найти сертификат')}</p> : null}
            {certificate ? (
              <div className={styles.lookupResult}>
                <p><span>Код</span><strong>{certificate.code}</strong></p>
                <p><span>Получатель</span><strong>{certificate.recipientName}</strong></p>
                <p><span>Номинал</span><strong>{certificate.amountRub.toLocaleString('ru-RU')} ₽</strong></p>
                <p><span>Статус</span><strong>{formatCertificateStatus(certificate.status)}</strong></p>
                <p><span>Действует до</span><strong>{new Intl.DateTimeFormat('ru-RU').format(new Date(certificate.expiresAt))}</strong></p>
              </div>
            ) : null}
          </div>
        )}
      </section>
    </PageShell>
  );
}

function formatCertificateStatus(status: string) {
  const normalizedStatus = status.toUpperCase();
  const labels: Record<string, string> = {
    ACTIVE: 'Активен',
    USED: 'Использован',
    REDEEMED: 'Использован',
    EXPIRED: 'Истёк',
    CANCELLED: 'Отменён',
  };

  return labels[normalizedStatus] ?? status;
}
