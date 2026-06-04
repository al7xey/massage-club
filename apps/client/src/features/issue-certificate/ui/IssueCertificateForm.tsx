import { FormEvent, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { certificatePresets, useCreateGiftCertificateMutation } from '@/entities/certificate';
import { useGetServicesQuery } from '@/entities/service';
import { getApiErrorMessage } from '@/shared/lib/api/getApiErrorMessage';
import { appRoutes } from '@/shared/routes';
import { Button, SelectField, TextAreaField, TextField } from '@/shared/ui';
import styles from './IssueCertificateForm.module.css';

const customMinAmount = 1000;
const customStep = 500;

export function IssueCertificateForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [createGiftCertificate, { isLoading }] = useCreateGiftCertificateMutation();
  const [type, setType] = useState<'amount' | 'service'>('amount');
  const { data: servicesPage } = useGetServicesQuery({ limit: 48, sort: 'popular' }, { skip: type !== 'service' });
  const [format, setFormat] = useState<'email' | 'paper'>('email');
  const [amountChoice, setAmountChoice] = useState<number | 'custom'>(3000);
  const [customAmount, setCustomAmount] = useState('1500');
  const [serviceId, setServiceId] = useState('');
  const [recipient, setRecipient] = useState('');
  const [sender, setSender] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const services = servicesPage?.items ?? [];
  const selectedService = services.find((service) => service.id === serviceId);
  const resolvedAmount = useMemo(() => {
    if (type === 'service') {
      return selectedService?.priceRub ?? 0;
    }

    if (amountChoice !== 'custom') {
      return amountChoice;
    }

    const parsed = Number(customAmount);
    return Number.isFinite(parsed) ? parsed : 0;
  }, [amountChoice, customAmount, selectedService?.priceRub, type]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      navigate(appRoutes.login(), {
        state: { backgroundLocation: location, from: appRoutes.certificates() },
      });
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

    if (type === 'service' && !selectedService) {
      setError('Выберите услугу для сертификата');
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
        amountRub: resolvedAmount,
        format: format === 'paper' ? 'PAPER' : 'EMAIL',
        message: (message || `Подарок от ${sender}${selectedService ? `: ${selectedService.title}` : ''}`).trim(),
        recipientContact: email.trim(),
        recipientName: recipient.trim(),
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

        {type === 'amount' ? (
          <div className={styles.valueRow}>
            {certificatePresets.map((preset) => (
              <Button
                key={preset.value}
                className={`${styles.valueButton} ${amountChoice === preset.value ? styles.valueActive : ''}`}
                size="sm"
                variant={amountChoice === preset.value ? 'primary' : 'secondary'}
                aria-pressed={amountChoice === preset.value}
                onClick={() => setAmountChoice(preset.value)}
              >
                {preset.label}
              </Button>
            ))}
            <Button
              className={`${styles.valueButton} ${amountChoice === 'custom' ? styles.valueActive : ''}`}
              size="sm"
              variant={amountChoice === 'custom' ? 'primary' : 'secondary'}
              aria-pressed={amountChoice === 'custom'}
              onClick={() => setAmountChoice('custom')}
            >
              Своя сумма
            </Button>
          </div>
        ) : (
          <SelectField aria-label="Выберите услугу" label="" value={serviceId} onChange={(event) => setServiceId(event.target.value)}>
            <option value="">Выберите услугу</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.title} · {service.priceRub.toLocaleString('ru-RU')} ₽
              </option>
            ))}
          </SelectField>
        )}

        {type === 'amount' && amountChoice === 'custom' ? (
          <TextField
            helperText={`Минимум ${customMinAmount} ₽, шаг ${customStep} ₽`}
            label="Своя сумма"
            min={customMinAmount}
            step={customStep}
            type="number"
            value={customAmount}
            onChange={(event) => setCustomAmount(event.target.value)}
          />
        ) : null}
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
            <span>Придет на почту сразу после оформления</span>
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
            <TextField label="Кому" placeholder="Имя получателя" value={recipient} onChange={(event) => setRecipient(event.target.value)} />
            <TextField label="От кого" placeholder="Ваше имя" value={sender} onChange={(event) => setSender(event.target.value)} />
          </div>
          <TextField label="Email или телефон получателя" placeholder="example@mail.ru или +7..." value={email} onChange={(event) => setEmail(event.target.value)} />
          <TextAreaField label="Текст поздравления" placeholder="Приятного отдыха!" value={message} onChange={(event) => setMessage(event.target.value)} />
        </div>
      </div>

      <div className={styles.total}>
        <div className={styles.totalTop}>
        <h3>Итого</h3>
          <strong>{resolvedAmount.toLocaleString('ru-RU')} ₽</strong>
        </div>
        <div className={styles.totalMeta}>
          <span>Оформление без оплаты</span>
          <span>Действует 1 год</span>
          <span>{format === 'paper' ? 'Бумажный формат' : 'Мгновенная доставка'}</span>
        </div>
        {error ? <p className={styles.error}>{error}</p> : null}
        {success ? <p className={styles.success}>{success}</p> : null}
        <Button fullWidth isLoading={isLoading} loadingText="Оформляем..." type="submit">
          Оформить сертификат
        </Button>
      </div>
    </form>
  );
}
