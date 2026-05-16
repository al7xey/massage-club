import { useState } from 'react';
import { IssueCertificateForm } from '@/features/issue-certificate';
import { PageShell } from '@/shared/ui/page-shell/PageShell';
import styles from './CertificatesPage.module.css';

export function CertificatesPage() {
  const [mode, setMode] = useState<'new' | 'status'>('new');
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
            <p>Введите номер сертификата или email получателя. Проверка подготовлена на фронтенде.</p>
            <input placeholder="Номер сертификата или email" />
            <button type="button">Проверить</button>
          </div>
        )}
        <aside className={styles.preview}>
          <p>Подарочный сертификат</p>
          <div>
            <span>Кому:</span>
            <strong>Имя получателя</strong>
          </div>
          <div>
            <span>Номинал / Услуга:</span>
            <strong>3000 ₽</strong>
          </div>
        </aside>
      </section>
    </PageShell>
  );
}
