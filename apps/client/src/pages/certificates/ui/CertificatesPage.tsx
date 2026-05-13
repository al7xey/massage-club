import { HomeBreadcrumb } from '@/shared/ui/breadcrumbs/HomeBreadcrumb';
import { IssueCertificateForm } from '@/features/issue-certificate';

export function CertificatesPage() {
  return (
    <main className="page">
      <HomeBreadcrumb />

      <section className="cert-header">
        <div>
          <h1>Сертификаты</h1>
          <p>Подарите заботу своим близким</p>
        </div>
        <div className="segment-control">
          <button className="segment-control__item segment-control__item--active" type="button">
            Оформить новый
          </button>
          <button className="segment-control__item" type="button">
            Проверить статус
          </button>
        </div>
      </section>

      <section className="cert-layout">
        <div>
          <IssueCertificateForm />
        </div>

        <aside className="certificate-preview">
          <p>ПОДАРОЧНЫЙ СЕРТИФИКАТ</p>
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
    </main>
  );
}
