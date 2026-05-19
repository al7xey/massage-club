import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useGetAppointmentSlotsQuery } from '@/entities/appointment';
import { useAddCartItemMutation, useCheckoutCartMutation, useGetCartQuery, useRemoveCartItemMutation } from '@/entities/cart';
import type { CartCheckoutResponseDto, CartItemDto } from '@/entities/cart';
import { useGetMastersQuery } from '@/entities/master';
import { useGetStudiosQuery } from '@/entities/studio';
import { useGetMySubscriptionQuery } from '@/entities/subscription';
import { getApiErrorMessage } from '@/shared/lib/api/getApiErrorMessage';
import { formatPrice } from '@/shared/lib/currency/formatPrice';
import { appRoutes } from '@/shared/routes';
import styles from './BookingDraftForm.module.css';

const today = new Date().toISOString().slice(0, 10);
const STEPS = ['Корзина', 'Студия и дата', 'Настройка услуг', 'Подтверждение', 'Готово'] as const;

interface CartItemConfig {
  masterId: string;
  startsAt: string;
  useSubscriptionCredit: boolean;
}

export function BookingDraftForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const addServiceId = searchParams.get('serviceId');
  const { data: cartItems = [], isLoading: isLoadingCart } = useGetCartQuery();
  const { data: studios = [] } = useGetStudiosQuery();
  const { data: masters = [] } = useGetMastersQuery();
  const { data: activeSubscription } = useGetMySubscriptionQuery();
  const [addCartItem, { isLoading: isAddingToCart }] = useAddCartItemMutation();
  const [removeCartItem, { isLoading: isRemovingFromCart }] = useRemoveCartItemMutation();
  const [checkoutCart, { isLoading: isSubmitting }] = useCheckoutCartMutation();
  const [step, setStep] = useState(0);
  const [studioId, setStudioId] = useState('');
  const [date, setDate] = useState(today);
  const [configs, setConfigs] = useState<Record<string, CartItemConfig>>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<CartCheckoutResponseDto | null>(null);

  useEffect(() => {
    if (!addServiceId) {
      return;
    }

    void addCartItem({ serviceId: addServiceId })
      .unwrap()
      .finally(() => {
        navigate(appRoutes.booking(), { replace: true });
      });
  }, [addCartItem, addServiceId, navigate]);

  useEffect(() => {
    if (!studioId && studios[0]) {
      setStudioId(studios[0].id);
    }
  }, [studioId, studios]);

  useEffect(() => {
    setConfigs((current) => {
      const next: Record<string, CartItemConfig> = {};

      for (const item of cartItems) {
        next[item.id] = current[item.id] ?? {
          masterId: '',
          startsAt: '',
          useSubscriptionCredit: false,
        };
      }

      return next;
    });
  }, [cartItems]);

  const selectedStudio = studios.find((studio) => studio.id === studioId) ?? null;
  const remainingCredits = useMemo(
    () => activeSubscription?.credits.reduce((sum, credit) => sum + credit.remainingCredits, 0) ?? 0,
    [activeSubscription],
  );
  const selectedCreditCount = useMemo(
    () => Object.values(configs).filter((config) => config.useSubscriptionCredit).length,
    [configs],
  );
  const discountPercent = activeSubscription?.plan.discountPercent ?? 0;

  const totalAmountRub = useMemo(
    () =>
      cartItems.reduce((sum, item) => {
        const config = configs[item.id];
        if (config?.useSubscriptionCredit) {
          return sum;
        }

        return sum + Math.round(item.service.priceRub * (1 - discountPercent / 100));
      }, 0),
    [cartItems, configs, discountPercent],
  );

  useEffect(() => {
    if (cartItems.length === 0) {
      setStep(0);
    }
  }, [cartItems.length]);

  const updateConfig = (itemId: string, patch: Partial<CartItemConfig>) => {
    setConfigs((current) => ({
      ...current,
      [itemId]: {
        ...(current[itemId] ?? { masterId: '', startsAt: '', useSubscriptionCredit: false }),
        ...patch,
      },
    }));
    setError('');
  };

  const validateStep = (index: number) => {
    if (index === 0 && cartItems.length === 0) {
      setError('Добавьте хотя бы одну услугу в корзину');
      return false;
    }

    if (index === 1 && (!studioId || !date)) {
      setError('Выберите студию и дату');
      return false;
    }

    if (index === 2) {
      if (selectedCreditCount > remainingCredits) {
        setError('Выбрано больше посещений по подписке, чем доступно');
        return false;
      }

      const hasIncompleteItem = cartItems.some((item) => {
        const config = configs[item.id];
        return !config?.masterId || !config?.startsAt;
      });

      if (hasIncompleteItem) {
        setError('Настройте мастера и время для каждой услуги');
        return false;
      }
    }

    return true;
  };

  const goNextStep = () => {
    if (!validateStep(step)) {
      return;
    }

    setStep((current) => Math.min(current + 1, STEPS.length - 2));
    setError('');
  };

  const goPreviousStep = () => {
    setStep((current) => Math.max(current - 1, 0));
    setError('');
  };

  const handleSubmit = async () => {
    if (!validateStep(0) || !validateStep(1) || !validateStep(2)) {
      return;
    }

    try {
      const response = await checkoutCart({
        studioId,
        date,
        items: cartItems.map((item) => ({
          cartItemId: item.id,
          masterId: configs[item.id].masterId,
          startsAt: configs[item.id].startsAt,
          useSubscriptionCredit: configs[item.id].useSubscriptionCredit,
        })),
      }).unwrap();

      setSuccess(response);
      setError('');
      setStep(4);
    } catch (checkoutError) {
      setError(getApiErrorMessage(checkoutError, 'Не удалось оформить запись'));
    }
  };

  const startNewBooking = () => {
    setStep(0);
    setSuccess(null);
  };

  if (isLoadingCart || isAddingToCart) {
    return <p className={styles.state}>Готовим checkout...</p>;
  }

  return (
    <section className={styles.root}>
      <div className={styles.stepper}>
        {STEPS.map((stepTitle, index) => {
          const isCurrent = step === index;
          const isComplete = step > index;

          return (
            <div
              key={stepTitle}
              className={`${styles.stepItem} ${isCurrent ? styles.stepCurrent : ''} ${isComplete ? styles.stepComplete : ''}`}
            >
              <span>{index + 1}</span>
              <strong>{stepTitle}</strong>
            </div>
          );
        })}
      </div>

      {step === 0 ? (
        <section className={styles.stage}>
          <div className={styles.stageHeader}>
            <h3>Услуги в корзине</h3>
            <p>Проверьте состав заказа. На следующем шаге вы выберете общую студию и дату для всего заказа.</p>
          </div>

          {cartItems.length === 0 ? (
            <div className={styles.empty}>
              <p>В корзине пока нет услуг.</p>
              <Link className={styles.primaryButton} to={appRoutes.services()}>
                Добавить услуги
              </Link>
            </div>
          ) : (
            <div className={styles.cards}>
              {cartItems.map((item) => (
                <article className={styles.card} key={item.id}>
                  <div>
                    <span className={styles.cardMeta}>{item.service.durationMinutes} минут</span>
                    <strong>{item.service.title}</strong>
                    <p>{item.service.description}</p>
                  </div>
                  <div className={styles.cardSide}>
                    <em>{formatPrice(item.service.priceRub)}</em>
                    <button type="button" className={styles.secondaryButton} disabled={isRemovingFromCart} onClick={() => void removeCartItem(item.id)}>
                      Удалить
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      ) : null}

      {step === 1 ? (
        <section className={styles.stage}>
          <div className={styles.stageHeader}>
            <h3>Общие параметры заказа</h3>
            <p>Студия и дата будут общими для всех услуг из корзины.</p>
          </div>

          <div className={styles.studioGrid}>
            {studios.map((studio) => {
              const isSelected = studio.id === studioId;

              return (
                <button
                  key={studio.id}
                  type="button"
                  className={`${styles.studioCard} ${isSelected ? styles.studioCardSelected : ''}`}
                  onClick={() => setStudioId(studio.id)}
                >
                  <strong>{studio.name}</strong>
                  <span>{studio.address}</span>
                  <small>{studio.phone}</small>
                </button>
              );
            })}
          </div>

          <label className={styles.field}>
            <span>Дата</span>
            <input className={styles.input} type="date" min={today} value={date} onChange={(event) => setDate(event.target.value)} />
          </label>
        </section>
      ) : null}

      {step === 2 ? (
        <section className={styles.stage}>
          <div className={styles.stageHeader}>
            <h3>Настройка услуг</h3>
            <p>Для каждой услуги отдельно выберите мастера и время в студии {selectedStudio?.name ?? '—'} на дату {formatDate(date)}.</p>
          </div>

          {activeSubscription ? (
            <div className={styles.subscriptionHint}>
              <strong>Подписка {activeSubscription.plan.name}</strong>
              <span>Осталось посещений: {remainingCredits}. Выбрано по подписке: {selectedCreditCount}.</span>
            </div>
          ) : null}

          <div className={styles.cards}>
            {cartItems.map((item) => (
              <CartBookingItem
                key={item.id}
                date={date}
                discountPercent={discountPercent}
                item={item}
                remainingCredits={remainingCredits}
                selectedStudioId={studioId}
                config={configs[item.id] ?? { masterId: '', startsAt: '', useSubscriptionCredit: false }}
                masters={masters}
                onChange={(patch) => updateConfig(item.id, patch)}
              />
            ))}
          </div>
        </section>
      ) : null}

      {step === 3 ? (
        <section className={styles.stage}>
          <div className={styles.stageHeader}>
            <h3>Подтверждение заказа</h3>
            <p>Проверьте все услуги, выбранную студию, дату и индивидуальные слоты перед оплатой.</p>
          </div>

          <div className={styles.cards}>
            {cartItems.map((item) => {
              const config = configs[item.id];
              const master = masters.find((candidate) => candidate.id === config?.masterId);
              const itemPrice = config?.useSubscriptionCredit ? 0 : Math.round(item.service.priceRub * (1 - discountPercent / 100));

              return (
                <article className={styles.card} key={item.id}>
                  <div>
                    <span className={styles.cardMeta}>{selectedStudio?.name ?? '—'} · {formatDateTime(config?.startsAt)}</span>
                    <strong>{item.service.title}</strong>
                    <p>{master ? `${master.firstName} ${master.lastName}` : 'Мастер не выбран'}</p>
                  </div>
                  <div className={styles.cardSide}>
                    <em>{config?.useSubscriptionCredit ? 'По подписке' : formatPrice(itemPrice)}</em>
                  </div>
                </article>
              );
            })}
          </div>

          <div className={styles.summary}>
            <div>
              <span>Студия</span>
              <strong>{selectedStudio?.name ?? '—'}</strong>
            </div>
            <div>
              <span>Дата</span>
              <strong>{formatDate(date)}</strong>
            </div>
            <div>
              <span>По подписке</span>
              <strong>{selectedCreditCount}</strong>
            </div>
            <div>
              <span>К оплате</span>
              <strong>{formatPrice(totalAmountRub)}</strong>
            </div>
          </div>
        </section>
      ) : null}

      {step === 4 && success ? (
        <section className={styles.stage}>
          <div className={styles.stageHeader}>
            <h3>Заказ оформлен</h3>
            <p>Мы сохранили все записи из корзины и подготовили оплату по выбранным позициям.</p>
          </div>

          <div className={styles.cards}>
            {success.appointments.map((appointment) => (
              <article className={styles.card} key={appointment.id}>
                <div>
                  <span className={styles.cardMeta}>{formatDateTime(appointment.startsAt)}</span>
                  <strong>{appointment.service.title}</strong>
                  <p>{appointment.studio.name} · {appointment.master.firstName} {appointment.master.lastName}</p>
                </div>
                <div className={styles.cardSide}>
                  <em>{appointment.paidBySubscriptionCredit ? 'По подписке' : formatPrice(appointment.priceRub)}</em>
                </div>
              </article>
            ))}
          </div>

          <div className={styles.summary}>
            <div>
              <span>Создано записей</span>
              <strong>{success.appointments.length}</strong>
            </div>
            <div>
              <span>По подписке</span>
              <strong>{success.subscriptionCreditsUsed}</strong>
            </div>
            <div>
              <span>К оплате</span>
              <strong>{formatPrice(success.totalAmountRub)}</strong>
            </div>
          </div>

          <div className={styles.footerActions}>
            <Link className={styles.primaryButton} to={appRoutes.accountAppointments()}>
              Перейти к записям
            </Link>
            <button className={styles.secondaryButton} type="button" onClick={startNewBooking}>
              Новый заказ
            </button>
          </div>
        </section>
      ) : null}

      {error ? <p className={styles.errorBox}>{error}</p> : null}

      {step < 4 ? (
        <div className={styles.footerActions}>
          {step > 0 ? (
            <button type="button" className={styles.secondaryButton} onClick={goPreviousStep}>
              Назад
            </button>
          ) : (
            <span />
          )}

          {step < 3 ? (
            <button type="button" className={styles.primaryButton} onClick={goNextStep}>
              Продолжить
            </button>
          ) : (
            <button className={styles.primaryButton} type="button" disabled={isSubmitting} onClick={() => void handleSubmit()}>
              {isSubmitting ? 'Оформляем...' : 'Подтвердить и оплатить'}
            </button>
          )}
        </div>
      ) : null}
    </section>
  );
}

function CartBookingItem({
  config,
  date,
  discountPercent,
  item,
  masters,
  onChange,
  remainingCredits,
  selectedStudioId,
}: {
  config: CartItemConfig;
  date: string;
  discountPercent: number;
  item: CartItemDto;
  masters: Array<{
    id: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    studio?: { id: string } | undefined;
    services: Array<{ id: string }>;
  }>;
  onChange: (patch: Partial<CartItemConfig>) => void;
  remainingCredits: number;
  selectedStudioId: string;
}) {
  const availableMasters = useMemo(
    () =>
      masters.filter(
        (master) =>
          master.isActive &&
          master.studio?.id === selectedStudioId &&
          master.services.some((service) => service.id === item.service.id),
      ),
    [item.service.id, masters, selectedStudioId],
  );

  const { data: availableSlots = [], isFetching: isLoadingSlots } = useGetAppointmentSlotsQuery(
    { masterId: config.masterId, date, durationMinutes: item.service.durationMinutes },
    { skip: !config.masterId || !date },
  );

  const finalPrice = Math.round(item.service.priceRub * (1 - discountPercent / 100));

  return (
    <article className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <span className={styles.cardMeta}>{item.service.durationMinutes} минут</span>
          <strong>{item.service.title}</strong>
        </div>
        <em>{config.useSubscriptionCredit ? 'По подписке' : formatPrice(finalPrice)}</em>
      </div>

      <label className={styles.field}>
        <span>Мастер</span>
        <select className={styles.input} value={config.masterId} onChange={(event) => onChange({ masterId: event.target.value, startsAt: '' })}>
          <option value="">Выберите мастера</option>
          {availableMasters.map((master) => (
            <option key={master.id} value={master.id}>
              {master.firstName} {master.lastName}
            </option>
          ))}
        </select>
      </label>

      <div className={styles.slotGroup}>
        <span className={styles.fieldLabel}>Свободные слоты</span>
        <div className={styles.slotGrid}>
          {availableSlots.map((slot) => {
            const isSelected = config.startsAt === slot;

            return (
              <button
                key={slot}
                type="button"
                className={`${styles.slotButton} ${isSelected ? styles.slotSelected : ''}`}
                onClick={() => onChange({ startsAt: slot })}
              >
                {new Intl.DateTimeFormat('ru-RU', { timeStyle: 'short' }).format(new Date(slot))}
              </button>
            );
          })}
        </div>
        {isLoadingSlots ? <p className={styles.hint}>Загружаем слоты...</p> : null}
        {!isLoadingSlots && config.masterId && availableSlots.length === 0 ? (
          <p className={styles.hint}>На выбранную дату у этого мастера нет свободных слотов.</p>
        ) : null}
      </div>

      {remainingCredits > 0 ? (
        <label className={styles.creditToggle}>
          <input
            type="checkbox"
            checked={config.useSubscriptionCredit}
            onChange={(event) => onChange({ useSubscriptionCredit: event.target.checked })}
          />
          <span>Оплатить эту услугу посещением по подписке</span>
        </label>
      ) : null}
    </article>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ru-RU').format(new Date(value));
}

function formatDateTime(value?: string) {
  if (!value) {
    return 'Не выбрано';
  }

  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}
