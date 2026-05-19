import { FormEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { certificatePresets, useCreateGiftCertificateMutation } from '@/entities/certificate';
import { getApiErrorMessage } from '@/shared/lib/api/getApiErrorMessage';
import { appRoutes } from '@/shared/routes';
import styles from './IssueCertificateForm.module.css';

const customMinAmount = 1000;
const customStep = 500;

export function IssueCertificateForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [createGiftCertificate, { isLoading }] = useCreateGiftCertificateMutation();
  const [type, setType] = useState<'amount' | 'service'>('amount');
  const [format, setFormat] = useState<'email' | 'paper'>('email');
  const [amountMode, setAmountMode] = useState<'preset' | 'custom'>('preset');
  const [presetIndex, setPresetIndex] = useState(1);
  const [customAmount, setCustomAmount] = useState('1500');
  const [recipient, setRecipient] = useState('');
  const [sender, setSender] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const selectedPreset = certificatePresets[presetIndex] ?? certificatePresets[1];
  const resolvedAmount = useMemo(() => {
    if (amountMode === 'preset') {
      return selectedPreset.value;
    }

    const parsed = Number(customAmount);
    return Number.isFinite(parsed) ? parsed : 0;
  }, [amountMode, customAmount, selectedPreset.value]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      navigate(appRoutes.login(), { state: { from: appRoutes.certificates() } });
      return;
    }

    if (!recipient.trim() || !sender.trim()) {
      setError('Заполните имя получателя и отправителя');
      setSuccess('');
      return;
    }

    if (!email.includes('@') && !email.trim().startsWith('+')) {
      setError('Введите email или телефон получателя');
      setSuccess('');
      return;
    }

    if (resolvedAmount < customMinAmount || resolvedAmount % customStep !== 0) {
      setError(`Укажите сумму от ${customMinAmount} ₽ с шагом ${customStep} ₽`);
      setSuccess('');
      return;
    }

    try {
      const certificate = await createGiftCertificate({
        recipientName: recipient.trim(),
        recipientContact: email.trim(),
        amountRub: resolvedAmount,
        format: format === 'paper' ? 'PAPER' : 'EMAIL',
        message: (message || `Подарок от ${sender}`).trim(),
      }).unwrap();
      setError('');
      setSuccess(`Сертификат оформлен. Код: ${certificate.code}`);
    } catch (certificateError) {
      setError(getApiErrorMessage(certificateError, 'Не удалось оформить сертификат'));
      setSuccess('');
    }
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
            <span>Подарок под конкретную процедуру или формат отдыха</span>
          </button>
        </div>

        <div className={styles.modeRow}>
          <button
            className={amountMode === 'preset' ? styles.modeActive : styles.modeButton}
            type="button"
            onClick={() => setAmountMode('preset')}
          >
            Готовые суммы
          </button>
          <button
            className={amountMode === 'custom' ? styles.modeActive : styles.modeButton}
            type="button"
            onClick={() => setAmountMode('custom')}
          >
            Своя сумма
          </button>
        </div>

        {amountMode === 'preset' ? (
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
        ) : (
          <label className={styles.customAmount}>
            <span>Своя сумма</span>
            <input
              className={styles.input}
              type="number"
              min={customMinAmount}
              step={customStep}
              value={customAmount}
              onChange={(event) => setCustomAmount(event.target.value)}
            />
            <small>Минимум {customMinAmount} ₽, шаг {customStep} ₽</small>
          </label>
        )}
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
            <span>Придёт на почту сразу после оплаты</span>
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
              <input className={styles.input} placeholder="Имя получателя" value={recipient} onChange={(event) => setRecipient(event.target.value)} />
            </label>
            <label>
              <span>От кого</span>
              <input className={styles.input} placeholder="Ваше имя" value={sender} onChange={(event) => setSender(event.target.value)} />
            </label>
          </div>
          <label>
            <span>Email или телефон получателя</span>
            <input className={styles.input} placeholder="example@mail.ru или +7..." value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label>
            <span>Текст поздравления</span>
            <textarea className={styles.textarea} placeholder="Приятного отдыха!" value={message} onChange={(event) => setMessage(event.target.value)} />
          </label>
        </div>
      </div>

      <div className={styles.total}>
        <div className={styles.totalTop}>
          <h3>Итого к оплате</h3>
          <strong>{resolvedAmount.toLocaleString('ru-RU')} ₽</strong>
        </div>
        <div className={styles.totalMeta}>
          <span>Безопасная оплата</span>
          <span>Действует 1 год</span>
          <span>{format === 'paper' ? 'Бумажный формат' : 'Мгновенная доставка'}</span>
        </div>
        {error ? <p className={styles.error}>{error}</p> : null}
        {success ? <p className={styles.success}>{success}</p> : null}
        <button className={styles.payButton} type="submit" disabled={isLoading}>
          {isLoading ? 'Оформляем...' : 'Оплатить'}
        </button>
      </div>
    </form>
  );
}
