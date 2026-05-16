import { FormEvent, useState } from 'react';
import { certificatePresets } from '@/entities/certificate';
import styles from './IssueCertificateForm.module.css';

export function IssueCertificateForm() {
  const [type, setType] = useState<'amount' | 'service'>('amount');
  const [format, setFormat] = useState<'email' | 'paper'>('email');
  const [presetIndex, setPresetIndex] = useState(1);
  const [recipient, setRecipient] = useState('');
  const [sender, setSender] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isReady, setIsReady] = useState(false);

  const selectedPreset = certificatePresets[presetIndex] ?? certificatePresets[1];

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!recipient.trim() || !sender.trim()) {
      setError('Заполните имя получателя и отправителя');
      setIsReady(false);
      return;
    }

    if (!email.includes('@')) {
      setError('Введите корректный email для доставки');
      setIsReady(false);
      return;
    }

    setError('');
    setIsReady(true);
  };

  return (
    <form className={styles.root} onSubmit={handleSubmit} noValidate>
      <div className={styles.step}>
        <h2><span>1</span> Выберите номинал или услугу</h2>
        <div className={styles.optionRow}>
          <button
            className={`${styles.optionCard} ${type === 'amount' ? styles.optionActive : ''}`}
            type="button"
            onClick={() => setType('amount')}
          >
            <strong>Номинал</strong>
            <span>Денежная сумма на любые услуги клуба</span>
          </button>
          <button
            className={`${styles.optionCard} ${type === 'service' ? styles.optionActive : ''}`}
            type="button"
            onClick={() => setType('service')}
          >
            <strong>Услуга</strong>
            <span>Конкретная услуга или процедура</span>
          </button>
        </div>
        <div className={styles.valueRow}>
          {certificatePresets.map((preset, index) => (
            <button
              key={preset.value}
              className={`${styles.valueButton} ${index === presetIndex ? styles.valueActive : ''}`}
              type="button"
              onClick={() => setPresetIndex(index)}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.step}>
        <h2><span>2</span> Формат получения</h2>
        <div className={styles.optionRow}>
          <button
            className={`${styles.optionCard} ${format === 'email' ? styles.optionActive : ''}`}
            type="button"
            onClick={() => setFormat('email')}
          >
            <strong>Электронный</strong>
            <span>Придет на почту сразу после оплаты</span>
          </button>
          <button
            className={`${styles.optionCard} ${format === 'paper' ? styles.optionActive : ''}`}
            type="button"
            onClick={() => setFormat('paper')}
          >
            <strong>Бумажный</strong>
            <span>В красивом конверте в любом салоне</span>
          </button>
        </div>
      </div>

      <div className={styles.step}>
        <h2><span>3</span> Персонализация</h2>
        <div className={styles.form}>
          <div className={styles.formRow}>
            <label>
              <span>Кому</span>
              <input
                className={styles.input}
                placeholder="Имя получателя"
                value={recipient}
                onChange={(event) => {
                  setRecipient(event.target.value);
                  setError('');
                  setIsReady(false);
                }}
              />
            </label>
            <label>
              <span>От кого</span>
              <input
                className={styles.input}
                placeholder="Ваше имя"
                value={sender}
                onChange={(event) => {
                  setSender(event.target.value);
                  setError('');
                  setIsReady(false);
                }}
              />
            </label>
          </div>
          <label>
            <span>Email для доставки</span>
            <input
              className={styles.input}
              placeholder="example@mail.ru"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError('');
                setIsReady(false);
              }}
            />
          </label>
          <label>
            <span>Текст поздравления (необязательно)</span>
            <textarea
              className={styles.textarea}
              placeholder="Приятного отдыха! С любовью..."
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
          </label>
        </div>
      </div>

      <div className={styles.total}>
        <div className={styles.totalTop}>
          <h3>Итого к оплате</h3>
          <strong>{selectedPreset.label}</strong>
        </div>
        <div className={styles.totalMeta}>
          <span>Безопасная оплата</span>
          <span>Действует 1 год</span>
          <span>Мгновенная доставка</span>
        </div>
        {error ? <p className={styles.error}>{error}</p> : null}
        {isReady ? <p className={styles.success}>Сертификат готов к оплате на фронтенде.</p> : null}
        <button className={styles.payButton} type="submit">
          Оплатить
        </button>
      </div>
    </form>
  );
}
