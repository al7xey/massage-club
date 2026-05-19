import { applySubscriptionBenefits } from '@massage/shared/lib/subscription-benefits';
import type { SubscriptionBenefitItemResult } from '@massage/shared/lib/subscription-benefits';
import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useGetAvailableMastersQuery, useGetServiceSlotsQuery } from '@/entities/appointment';
import { useAddCartItemMutation, useCheckoutCartMutation, useGetCartQuery, useRemoveCartItemMutation } from '@/entities/cart';
import type { CartCheckoutResponseDto, CartItemDto } from '@/entities/cart';
import type { MasterDto } from '@/entities/master';
import { useGetStudiosQuery } from '@/entities/studio';
import { useGetMySubscriptionQuery } from '@/entities/subscription';
import { getApiErrorMessage } from '@/shared/lib/api/getApiErrorMessage';
import { formatPrice } from '@/shared/lib/currency/formatPrice';
import { appRoutes } from '@/shared/routes';
import styles from './BookingDraftForm.module.css';

const today = new Date().toISOString().slice(0, 10);
const STEPS = ['Корзина', 'Студия и дата', 'Время и мастер', 'Подтверждение', 'Готово'] as const;

interface CartItemConfig {
  startsAt: string;
}

export function BookingDraftForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const addServiceId = searchParams.get('serviceId');
  const { data: cartItems = [], isLoading: isLoadingCart } = useGetCartQuery();
  const { data: studios = [] } = useGetStudiosQuery();
  const { data: activeSubscription } = useGetMySubscriptionQuery();
  const [addCartItem, { isLoading: isAddingToCart }] = useAddCartItemMutation();
  const [removeCartItem, { isLoading: isRemovingFromCart }] = useRemoveCartItemMutation();
  const [checkoutCart, { isLoading: isSubmitting }] = useCheckoutCartMutation();
  const [step, setStep] = useState(0);
  const [studioId, setStudioId] = useState('');
  const [date, setDate] = useState(today);
  const [configs, setConfigs] = useState<Record<string, CartItemConfig>>({});
  const [selectedMasterId, setSelectedMasterId] = useState('');
  const [availableMastersByItem, setAvailableMastersByItem] = useState<Record<string, MasterDto[]>>({});
  const [mastersLoadingByItem, setMastersLoadingByItem] = useState<Record<string, boolean>>({});
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
          startsAt: '',
        };
      }

      return next;
    });
  }, [cartItems]);

  useEffect(() => {
    const validItemIds = new Set(cartItems.map((item) => item.id));

    setAvailableMastersByItem((current) => {
      const nextEntries = Object.entries(current).filter(([itemId]) => validItemIds.has(itemId));
      return nextEntries.length === Object.keys(current).length ? current : Object.fromEntries(nextEntries);
    });

    setMastersLoadingByItem((current) => {
      const nextEntries = Object.entries(current).filter(([itemId]) => validItemIds.has(itemId));
      return nextEntries.length === Object.keys(current).length ? current : Object.fromEntries(nextEntries);
    });
  }, [cartItems]);

  const selectedStudio = studios.find((studio) => studio.id === studioId) ?? null;
  const discountPercent = activeSubscription?.plan.discountPercent ?? 0;
  const remainingCredits = useMemo(
    () => activeSubscription?.credits.reduce((sum, credit) => sum + credit.remainingCredits, 0) ?? 0,
    [activeSubscription],
  );
  const pricingPreview = useMemo(
    () =>
      applySubscriptionBenefits(
        cartItems.map((item) => ({
          id: item.id,
          priceRub: item.service.priceRub,
        })),
        {
          discountPercent,
          remainingCredits,
        },
      ),
    [cartItems, discountPercent, remainingCredits],
  );
  const pricingByItemId = useMemo(
    () => new Map(pricingPreview.items.map((item) => [item.id, item])),
    [pricingPreview.items],
  );
  const allSlotsSelected = cartItems.length > 0 && cartItems.every((item) => Boolean(configs[item.id]?.startsAt));
  const isLoadingCommonMasters =
    allSlotsSelected && cartItems.some((item) => mastersLoadingByItem[item.id] ?? !availableMastersByItem[item.id]);
  const commonAvailableMasters = useMemo(() => {
    if (!allSlotsSelected || cartItems.length === 0) {
      return [];
    }

    const masterLists = cartItems.map((item) => availableMastersByItem[item.id]).filter(Boolean);
    if (masterLists.length !== cartItems.length) {
      return [];
    }

    const commonIds = new Set(masterLists[0].map((master) => master.id));
    for (const masters of masterLists.slice(1)) {
      const ids = new Set(masters.map((master) => master.id));
      for (const masterId of [...commonIds]) {
        if (!ids.has(masterId)) {
          commonIds.delete(masterId);
        }
      }
    }

    return masterLists[0]
      .filter((master) => commonIds.has(master.id))
      .sort((left, right) => left.lastName.localeCompare(right.lastName) || left.firstName.localeCompare(right.firstName));
  }, [allSlotsSelected, availableMastersByItem, cartItems]);
  const selectedMaster = commonAvailableMasters.find((master) => master.id === selectedMasterId) ?? null;

  useEffect(() => {
    if (cartItems.length === 0) {
      setStep(0);
    }
  }, [cartItems.length]);

  useEffect(() => {
    if (selectedMasterId && !commonAvailableMasters.some((master) => master.id === selectedMasterId)) {
      setSelectedMasterId('');
    }
  }, [commonAvailableMasters, selectedMasterId]);

  useEffect(() => {
    if (!selectedMasterId && commonAvailableMasters.length === 1) {
      setSelectedMasterId(commonAvailableMasters[0].id);
    }
  }, [commonAvailableMasters, selectedMasterId]);

  const updateConfig = (itemId: string, patch: Partial<CartItemConfig>) => {
    setConfigs((current) => ({
      ...current,
      [itemId]: {
        ...(current[itemId] ?? { startsAt: '' }),
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
      const hasIncompleteItem = cartItems.some((item) => !configs[item.id]?.startsAt);

      if (hasIncompleteItem) {
        setError('Для каждой услуги выберите время');
        return false;
      }

      if (isLoadingCommonMasters) {
        setError('Подождите, пока мы подберем мастеров на выбранные слоты');
        return false;
      }

      if (!selectedMasterId || !selectedMaster) {
        setError('Выберите одного мастера на весь заказ');
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
    if (!validateStep(0) || !validateStep(1) || !validateStep(2) || !selectedMasterId) {
      return;
    }

    try {
      const response = await checkoutCart({
        studioId,
        date,
        items: cartItems.map((item) => ({
          cartItemId: item.id,
          masterId: selectedMasterId,
          startsAt: configs[item.id].startsAt,
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
            <p>Проверьте состав заказа. Дальше вы выберете студию, дату, время для каждой услуги и одного общего мастера на весь заказ.</p>
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
              {cartItems.map((item) => {
                const pricing = pricingByItemId.get(item.id);

                return (
                  <article className={styles.card} key={item.id}>
                    <div>
                      <span className={styles.cardMeta}>{item.service.durationMinutes} минут</span>
                      <strong>{item.service.title}</strong>
                      <p>{item.service.description}</p>
                    </div>
                    <div className={styles.cardSide}>
                      <em>{formatItemPrice(pricing)}</em>
                      <button
                        type="button"
                        className={styles.secondaryButton}
                        disabled={isRemovingFromCart}
                        onClick={() => void removeCartItem(item.id)}
                      >
                        Удалить
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      ) : null}

      {step === 1 ? (
        <section className={styles.stage}>
          <div className={styles.stageHeader}>
            <h3>Общие параметры заказа</h3>
            <p>Студия и дата общие для всего заказа. После этого вы выберете время для услуг и увидите один список мастеров, доступных на весь заказ.</p>
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
            <h3>Время и мастер</h3>
            <p>Сначала выберите время для каждой услуги, затем мы покажем только тех мастеров, которые могут провести весь заказ целиком в студии {selectedStudio?.name ?? '—'}.</p>
          </div>

          {activeSubscription ? (
            <div className={styles.subscriptionHint}>
              <strong>Подписка {activeSubscription.plan.name}</strong>
              <span>
                Автоматически применим {pricingPreview.subscriptionCreditsUsed} визита по подписке и скидку {discountPercent}% на остальные услуги.
              </span>
            </div>
          ) : null}

          <div className={styles.cards}>
            {cartItems.map((item) => (
              <CartBookingItem
                key={item.id}
                date={date}
                item={item}
                preview={pricingByItemId.get(item.id)}
                selectedStudioId={studioId}
                config={configs[item.id] ?? { startsAt: '' }}
                onChange={(patch) => updateConfig(item.id, patch)}
                setAvailableMastersByItem={setAvailableMastersByItem}
                setMastersLoadingByItem={setMastersLoadingByItem}
              />
            ))}
          </div>

          <div className={styles.masterPanel}>
            <div className={styles.stageHeader}>
              <h3>Общий мастер на весь заказ</h3>
              <p>В списке ниже только мастера, которые свободны во все выбранные слоты и ведут все услуги из корзины.</p>
            </div>

            {!allSlotsSelected ? <p className={styles.hint}>Сначала выберите время для всех услуг.</p> : null}
            {allSlotsSelected && isLoadingCommonMasters ? <p className={styles.hint}>Подбираем мастеров на весь заказ...</p> : null}
            {allSlotsSelected && !isLoadingCommonMasters && commonAvailableMasters.length === 0 ? (
              <p className={styles.hint}>На выбранные слоты нет одного мастера, который сможет взять весь заказ. Попробуйте изменить время.</p>
            ) : null}

            {allSlotsSelected && !isLoadingCommonMasters && commonAvailableMasters.length > 0 ? (
              <div className={styles.masterGrid}>
                {commonAvailableMasters.map((master) => {
                  const isSelected = master.id === selectedMasterId;

                  return (
                    <button
                      key={master.id}
                      type="button"
                      className={`${styles.masterButton} ${isSelected ? styles.masterButtonSelected : ''}`}
                      onClick={() => setSelectedMasterId(master.id)}
                    >
                      <strong>
                        {master.firstName} {master.lastName}
                      </strong>
                      <span>{master.bio?.trim() || 'Доступен для всех выбранных услуг'}</span>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {step === 3 ? (
        <section className={styles.stage}>
          <div className={styles.stageHeader}>
            <h3>Подтверждение заказа</h3>
            <p>Проверьте выбранные студию, дату, время и общего мастера перед оплатой.</p>
          </div>

          <div className={styles.cards}>
            {cartItems.map((item) => {
              const config = configs[item.id];
              const pricing = pricingByItemId.get(item.id);

              return (
                <article className={styles.card} key={item.id}>
                  <div>
                    <span className={styles.cardMeta}>
                      {selectedStudio?.name ?? '—'} · {formatDateTime(config?.startsAt)}
                    </span>
                    <strong>{item.service.title}</strong>
                    <p>
                      {selectedMaster ? `${selectedMaster.firstName} ${selectedMaster.lastName}` : 'Мастер не выбран'}
                    </p>
                  </div>
                  <div className={styles.cardSide}>
                    <em>{formatItemPrice(pricing)}</em>
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
              <span>Мастер</span>
              <strong>{selectedMaster ? `${selectedMaster.firstName} ${selectedMaster.lastName}` : '—'}</strong>
            </div>
            <div>
              <span>Визиты по подписке</span>
              <strong>{pricingPreview.subscriptionCreditsUsed}</strong>
            </div>
            <div>
              <span>К оплате</span>
              <strong>{formatPrice(pricingPreview.totalAmountRub)}</strong>
            </div>
          </div>
        </section>
      ) : null}

      {step === 4 && success ? (
        <section className={styles.stage}>
          <div className={styles.stageHeader}>
            <h3>Заказ оформлен</h3>
            <p>Мы сохранили все записи из корзины и автоматически применили выгоды подписки там, где это было выгоднее всего.</p>
          </div>

          <div className={styles.cards}>
            {success.appointments.map((appointment) => (
              <article className={styles.card} key={appointment.id}>
                <div>
                  <span className={styles.cardMeta}>{formatDateTime(appointment.startsAt)}</span>
                  <strong>{appointment.service.title}</strong>
                  <p>
                    {appointment.studio.name} · {appointment.master.firstName} {appointment.master.lastName}
                  </p>
                </div>
                <div className={styles.cardSide}>
                  <em>{appointment.paidBySubscriptionCredit ? 'Включено в подписку' : formatPrice(appointment.priceRub)}</em>
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
              <span>Визитов списано</span>
              <strong>{success.subscriptionCreditsUsed}</strong>
            </div>
            <div>
              <span>Платежей</span>
              <strong>{success.payments.length}</strong>
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
  item,
  onChange,
  preview,
  selectedStudioId,
  setAvailableMastersByItem,
  setMastersLoadingByItem,
}: {
  config: CartItemConfig;
  date: string;
  item: CartItemDto;
  onChange: (patch: Partial<CartItemConfig>) => void;
  preview?: SubscriptionBenefitItemResult;
  selectedStudioId: string;
  setAvailableMastersByItem: Dispatch<SetStateAction<Record<string, MasterDto[]>>>;
  setMastersLoadingByItem: Dispatch<SetStateAction<Record<string, boolean>>>;
}) {
  const itemId = item.id;
  const { data: availableSlots = [], isFetching: isLoadingSlots } = useGetServiceSlotsQuery(
    { serviceId: item.service.id, studioId: selectedStudioId, date },
    { skip: !selectedStudioId || !date },
  );
  const { data: availableMasters = [], isFetching: isLoadingMasters } = useGetAvailableMastersQuery(
    { serviceId: item.service.id, studioId: selectedStudioId, startsAt: config.startsAt },
    { skip: !selectedStudioId || !config.startsAt },
  );

  useEffect(() => {
    if (!config.startsAt || isLoadingSlots) {
      return;
    }

    if (!availableSlots.includes(config.startsAt)) {
      onChange({ startsAt: '' });
    }
  }, [availableSlots, config.startsAt, isLoadingSlots, onChange]);

  useEffect(() => {
    setMastersLoadingByItem((current) => {
      if (current[itemId] === isLoadingMasters) {
        return current;
      }

      return {
        ...current,
        [itemId]: isLoadingMasters,
      };
    });
  }, [isLoadingMasters, itemId, setMastersLoadingByItem]);

  useEffect(() => {
    if (!config.startsAt) {
      setAvailableMastersByItem((current) => {
        if (!current[itemId]) {
          return current;
        }

        const next = { ...current };
        delete next[itemId];
        return next;
      });
      return;
    }

    setAvailableMastersByItem((current) => {
      const previous = current[itemId] ?? [];
      if (sameMasters(previous, availableMasters)) {
        return current;
      }

      return {
        ...current,
        [itemId]: availableMasters,
      };
    });
  }, [availableMasters, config.startsAt, itemId, setAvailableMastersByItem]);

  return (
    <article className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <span className={styles.cardMeta}>{item.service.durationMinutes} минут</span>
          <strong>{item.service.title}</strong>
        </div>
        <em>{formatItemPrice(preview)}</em>
      </div>

      <div className={styles.slotGroup}>
        <span className={styles.fieldLabel}>Свободное время</span>
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
        {isLoadingSlots ? <p className={styles.hint}>Загружаем доступное время...</p> : null}
        {!isLoadingSlots && availableSlots.length === 0 ? (
          <p className={styles.hint}>На выбранную дату для этой услуги пока нет свободного времени.</p>
        ) : null}
      </div>

      {config.startsAt && isLoadingMasters ? <p className={styles.hint}>Проверяем, какие мастера свободны на это время...</p> : null}
      {config.startsAt && !isLoadingMasters && availableMasters.length === 0 ? (
        <p className={styles.hint}>На это время нет свободных мастеров для этой услуги. Выберите другой слот.</p>
      ) : null}
    </article>
  );
}

function sameMasters(left: MasterDto[], right: MasterDto[]) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((master, index) => master.id === right[index]?.id);
}

function formatItemPrice(item?: SubscriptionBenefitItemResult) {
  if (!item) {
    return '—';
  }

  return item.paidBySubscriptionCredit ? 'Включено в подписку' : formatPrice(item.finalPriceRub);
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
