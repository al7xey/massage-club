import { landingContent } from '@/shared/config/publicContent';
import { HomeCrumb } from '@/shared/ui/public/PublicBlocks';

export function CertificatesPage() {
  const presets = landingContent.certificatePresets;

  return (
    <main className="page">
      <HomeCrumb />

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
          <div className="cert-step">
            <h2>1. Выберите номинал или услугу</h2>
            <div className="option-row">
              <button className="option-card option-card--active" type="button">
                <strong>Номинал</strong>
                <span>Денежная сумма на любые услуги клуба</span>
              </button>
              <button className="option-card" type="button">
                <strong>Услуга</strong>
                <span>Конкретная услуга или процедура</span>
              </button>
            </div>
            <div className="value-row">
              {presets.map((preset, index) => (
                <button
                  key={preset.value}
                  className={`value-btn ${index === 1 ? 'value-btn--active' : ''}`}
                  type="button"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="cert-step">
            <h2>2. Формат получения</h2>
            <div className="option-row">
              <button className="option-card option-card--active" type="button">
                <strong>Электронный</strong>
                <span>Придет на почту сразу после оплаты</span>
              </button>
              <button className="option-card" type="button">
                <strong>Бумажный</strong>
                <span>В красивом конверте в любом салоне</span>
              </button>
            </div>
          </div>

          <div className="cert-step">
            <h2>3. Персонализация</h2>
            <form className="cert-form">
              <div className="cert-form__row">
                <input className="input" placeholder="Кому" />
                <input className="input" placeholder="От кого" />
              </div>
              <input className="input" placeholder="Email для доставки" />
              <textarea className="input input--textarea" placeholder="Текст поздравления (необязательно)" />
            </form>
          </div>

          <div className="cert-total">
            <div className="cert-total__top">
              <h3>Итого к оплате</h3>
              <strong>3000 ₽</strong>
            </div>
            <div className="cert-total__meta">
              <span>Безопасная оплата</span>
              <span>Действует 1 год</span>
              <span>Мгновенная доставка</span>
            </div>
            <button className="ui-btn ui-btn-primary ui-btn-block" type="button">
              Оплатить
            </button>
          </div>
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
