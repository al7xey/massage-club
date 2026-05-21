import { applySubscriptionBenefits } from '@massage/shared/lib/subscription-benefits';
import type { SubscriptionBenefitItemResult } from '@massage/shared/lib/subscription-benefits';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGetAvailableMastersQuery, useGetServiceSlotsQuery } from '@/entities/appointment';
import { useAddCartItemMutation, useCheckoutCartMutation, useGetCartQuery, useRemoveCartItemMutation } from '@/entities/cart';
import type { CartCheckoutResponseDto, CartItemDto } from '@/entities/cart';
import { useGetStudiosQuery } from '@/entities/studio';
import { useGetMySubscriptionQuery } from '@/entities/subscription';
import { getApiErrorMessage } from '@/shared/lib/api/getApiErrorMessage';
import { formatPrice } from '@/shared/lib/currency/formatPrice';
import { appRoutes } from '@/shared/routes';
import { Button, EmptyState, LinkButton, TextField } from '@/shared/ui';
import styles from './BookingDraftForm.module.css';

const today = new Date().toISOString().slice(0, 10);

interface CartItemConfig {
  startsAt: string;
  masterId: string;
}

export function BookingDraftForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const serviceIdFromQuery = searchParams.get('serviceId');
  const { data: cartItems = [], isLoading: isLoadingCart } = useGetCartQuery();
  const { data: studios = [] } = useGetStudiosQuery();
  const { data: activeSubscription } = useGetMySubscriptionQuery();
  const [addCartItem, { isLoading: isAddingService }] = useAddCartItemMutation();
  const [removeCartItem, { isLoading: isRemovingService }] = useRemoveCartItemMutation();
  const [checkoutCart, { isLoading: isSubmitting }] = useCheckoutCartMutation();
  const [studioId, setStudioId] = useState('');
  const [date, setDate] = useState(today);
  const [configs, setConfigs] = useState<Record<string, CartItemConfig>>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<CartCheckoutResponseDto | null>(null);

  useEffect(() => {
    if (!serviceIdFromQuery) {
      return;
    }

    void addCartItem({ serviceId: serviceIdFromQuery })
      .unwrap()
      .finally(() => {
        navigate(appRoutes.booking(), { replace: true });
      });
  }, [addCartItem, navigate, serviceIdFromQuery]);

  useEffect(() => {
    if (!studioId && studios[0]) {
      setStudioId(studios[0].id);
    }
  }, [studioId, studios]);

  useEffect(() => {
    setConfigs((current) => {
      const next: Record<string, CartItemConfig> = {};

      for (const item of cartItems) {
        next[item.id] = current[item.id] ?? { startsAt: '', masterId: '' };
      }

      return next;
    });
  }, [cartItems]);

  const remainingCredits = useMemo(
    () => activeSubscription?.credits.reduce((sum, credit) => sum + credit.remainingCredits, 0) ?? 0,
    [activeSubscription],
  );
  const discountPercent = activeSubscription?.plan.discountPercent ?? 0;
  const pricingPreview = useMemo(
    () =>
      applySubscriptionBenefits(
        cartItems.map((item) => ({ id: item.id, priceRub: item.service.priceRub })),
        { discountPercent, remainingCredits },
      ),
    [cartItems, discountPercent, remainingCredits],
  );
  const pricingByItemId = useMemo(
    () => new Map(pricingPreview.items.map((item) => [item.id, item])),
    [pricingPreview.items],
  );

  const isReadyForSubmit =
    cartItems.length > 0 &&
    Boolean(studioId) &&
    Boolean(date) &&
    cartItems.every((item) => Boolean(configs[item.id]?.startsAt) && Boolean(configs[item.id]?.masterId));

  const handleConfigChange = (itemId: string, patch: Partial<CartItemConfig>) => {
    setConfigs((current) => ({
      ...current,
      [itemId]: {
        ...(current[itemId] ?? { startsAt: '', masterId: '' }),
        ...patch,
      },
    }));
    setError('');
  };

  const handleSubmit = async () => {
    if (!studioId || !date) {
      setError('Выберите студию и дату.');
      return;
    }

    if (!isReadyForSubmit) {
      setError('Выберите время и мастера для каждой услуги.');
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
        })),
      }).unwrap();

      setSuccess(response);
      setError('');
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, 'Не удалось оформить запись.'));
    }
  };

  if (isLoadingCart || isAddingService) {
    return <p className={styles.state}>Загрузка...</p>;
  }

  if (success) {
    return (
      <section className={styles.root}>
        <article className={styles.successCard}>
          <h2>Запись оформлена</h2>
          <div className={styles.summaryGrid}>
            <div>
              <span>Записей</span>
              <strong>{success.appointments.length}</strong>
            </div>
            <div>
              <span>Списано визитов</span>
              <strong>{success.subscriptionCreditsUsed}</strong>
            </div>
            <div>
              <span>К оплате</span>
              <strong>{formatPrice(success.totalAmountRub)}</strong>
            </div>
          </div>
          <div className={styles.actions}>
            <LinkButton to={appRoutes.accountAppointments()}>Мои записи</LinkButton>
            <Button variant="secondary" onClick={() => setSuccess(null)}>
              Новая запись
            </Button>
          </div>
        </article>
      </section>
    );
  }

  return (
    <section className={styles.root}>
      <section className={styles.controls}>
        <div className={styles.field}>
          <span>Студия</span>
          <div className={styles.studioRow}>
            {studios.map((studio) => (
              <button
                key={studio.id}
                type="button"
                className={`${styles.studioButton} ${studio.id === studioId ? styles.studioButtonActive : ''}`}
                onClick={() => setStudioId(studio.id)}
              >
                {studio.name}
              </button>
            ))}
          </div>
        </div>
        <TextField label="Дата" type="date" min={today} value={date} onChange={(event) => setDate(event.target.value)} />
      </section>

      {cartItems.length === 0 ? (
        <EmptyState
          title="В корзине пока нет услуг"
          description="Добавьте услуги из каталога."
          actions={<LinkButton to={appRoutes.services()}>Перейти в каталог</LinkButton>}
        />
      ) : (
        <>
          <section className={styles.cards}>
            {cartItems.map((item) => (
              <BookingItemCard
                key={item.id}
                item={item}
                studioId={studioId}
                date={date}
                config={configs[item.id] ?? { startsAt: '', masterId: '' }}
                isRemovingService={isRemovingService}
                onChange={(patch) => handleConfigChange(item.id, patch)}
                onRemove={() => void removeCartItem(item.id)}
                pricePreview={pricingByItemId.get(item.id)}
              />
            ))}
          </section>

          <section className={styles.summaryCard}>
            <div className={styles.summaryGrid}>
              <div>
                <span>Услуг</span>
                <strong>{cartItems.length}</strong>
              </div>
              <div>
                <span>Визитов по подписке</span>
                <strong>{pricingPreview.subscriptionCreditsUsed}</strong>
              </div>
              <div>
                <span>К оплате</span>
                <strong>{formatPrice(pricingPreview.totalAmountRub)}</strong>
              </div>
            </div>
            <div className={styles.actions}>
              <Button onClick={() => void handleSubmit()} isLoading={isSubmitting} loadingText="Оформляем..." disabled={!isReadyForSubmit}>
                Подтвердить запись
              </Button>
            </div>
          </section>
        </>
      )}

      {error ? <p className={styles.error}>{error}</p> : null}
    </section>
  );
}

function BookingItemCard({
  item,
  studioId,
  date,
  config,
  isRemovingService,
  onChange,
  onRemove,
  pricePreview,
}: {
  item: CartItemDto;
  studioId: string;
  date: string;
  config: CartItemConfig;
  isRemovingService: boolean;
  onChange: (patch: Partial<CartItemConfig>) => void;
  onRemove: () => void;
  pricePreview?: SubscriptionBenefitItemResult;
}) {
  const { data: slots = [], isFetching: isLoadingSlots } = useGetServiceSlotsQuery(
    { serviceId: item.service.id, studioId, date },
    { skip: !studioId || !date },
  );
  const { data: masters = [], isFetching: isLoadingMasters } = useGetAvailableMastersQuery(
    { serviceId: item.service.id, studioId, startsAt: config.startsAt },
    { skip: !studioId || !config.startsAt },
  );

  useEffect(() => {
    if (!config.startsAt || isLoadingSlots) {
      return;
    }

    if (!slots.includes(config.startsAt)) {
      onChange({ startsAt: '', masterId: '' });
    }
  }, [config.startsAt, isLoadingSlots, onChange, slots]);

  useEffect(() => {
    if (!config.masterId || isLoadingMasters) {
      return;
    }

    if (!masters.some((master) => master.id === config.masterId)) {
      onChange({ masterId: '' });
    }
  }, [config.masterId, isLoadingMasters, masters, onChange]);

  return (
    <article className={styles.card}>
      <div className={styles.cardTop}>
        <div>
          <p className={styles.cardTitle}>{item.service.title}</p>
          <span className={styles.cardMeta}>{item.service.durationMinutes} мин</span>
        </div>
        <div className={styles.cardTopRight}>
          <strong>{formatItemPrice(pricePreview)}</strong>
          <Button size="sm" variant="secondary" disabled={isRemovingService} onClick={onRemove}>
            Убрать
          </Button>
        </div>
      </div>

      <div className={styles.inlineGroup}>
        <span className={styles.fieldLabel}>Время</span>
        <div className={styles.chips}>
          {slots.map((slot) => (
            <button
              key={slot}
              type="button"
              className={`${styles.chip} ${config.startsAt === slot ? styles.chipActive : ''}`}
              onClick={() => onChange({ startsAt: slot, masterId: '' })}
            >
              {new Intl.DateTimeFormat('ru-RU', { timeStyle: 'short' }).format(new Date(slot))}
            </button>
          ))}
        </div>
        {isLoadingSlots ? <small className={styles.hint}>Загружаем слоты...</small> : null}
        {!isLoadingSlots && slots.length === 0 ? <small className={styles.hint}>Нет доступного времени.</small> : null}
      </div>

      {config.startsAt ? (
        <div className={styles.inlineGroup}>
          <span className={styles.fieldLabel}>Мастер</span>
          <div className={styles.chips}>
            {masters.map((master) => (
              <button
                key={master.id}
                type="button"
                className={`${styles.chip} ${config.masterId === master.id ? styles.chipActive : ''}`}
                onClick={() => onChange({ masterId: master.id })}
              >
                {master.firstName} {master.lastName}
              </button>
            ))}
          </div>
          {isLoadingMasters ? <small className={styles.hint}>Загружаем мастеров...</small> : null}
          {!isLoadingMasters && masters.length === 0 ? <small className={styles.hint}>На это время мастеров нет.</small> : null}
        </div>
      ) : null}
    </article>
  );
}

function formatItemPrice(item?: SubscriptionBenefitItemResult) {
  if (!item) {
    return '—';
  }

  return item.paidBySubscriptionCredit ? 'Включено' : formatPrice(item.finalPriceRub);
}
