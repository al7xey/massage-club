import { applySubscriptionBenefits, type SubscriptionBenefitItemResult } from '@massage/shared/lib/subscription-benefits';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGetAvailableMastersQuery } from '@/entities/appointment';
import { useAddCartItemMutation, useCheckoutCartMutation, useGetCartQuery, useRemoveCartItemMutation } from '@/entities/cart';
import type { CartCheckoutResponseDto, CartItemDto } from '@/entities/cart';
import { useGetMastersQuery, type MasterDto } from '@/entities/master';
import type { StudioDto } from '@/entities/studio';
import { useGetStudiosQuery } from '@/entities/studio';
import { useGetMySubscriptionQuery } from '@/entities/subscription';
import { getApiErrorMessage } from '@/shared/lib/api/getApiErrorMessage';
import { formatPrice } from '@/shared/lib/currency/formatPrice';
import { formatServiceCount } from '@/shared/lib/text/formatServiceCount';
import { appRoutes } from '@/shared/routes';
import { Button, EmptyState, LinkButton, TextField } from '@/shared/ui';
import styles from './BookingDraftForm.module.css';

type StepId = 'services' | 'place' | 'time' | 'master' | 'confirm';

const steps: Array<{ id: StepId; label: string; title: string }> = [
  { id: 'services', label: 'Услуги', title: 'Выберите услуги' },
  { id: 'place', label: 'Место', title: 'Выберите студию и дату' },
  { id: 'time', label: 'Время', title: 'Выберите время' },
  { id: 'master', label: 'Мастер', title: 'Выберите мастера' },
  { id: 'confirm', label: 'Итог', title: 'Проверьте запись' },
];

export function BookingDraftForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const serviceIdFromQuery = searchParams.get('serviceId');
  const studioIdFromQuery = searchParams.get('studioId');
  const masterIdFromQuery = searchParams.get('masterId');
  const { data: cartItems = [], isLoading: isLoadingCart } = useGetCartQuery();
  const { data: studios = [] } = useGetStudiosQuery();
  const { data: activeSubscription } = useGetMySubscriptionQuery();
  const { data: allMasters = [] } = useGetMastersQuery();
  const [addCartItem, { isLoading: isAddingService }] = useAddCartItemMutation();
  const [removeCartItem, { isLoading: isRemovingService }] = useRemoveCartItemMutation();
  const [checkoutCart, { isLoading: isSubmitting }] = useCheckoutCartMutation();
  const [activeStep, setActiveStep] = useState<StepId>('services');
  const [studioId, setStudioId] = useState('');
  const [date, setDate] = useState(getDateInputValue(new Date()));
  const [startsAt, setStartsAt] = useState('');
  const [selectedMasterId, setSelectedMasterId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<CartCheckoutResponseDto | null>(null);

  useEffect(() => {
    if (!serviceIdFromQuery) {
      return;
    }

    void addCartItem({ serviceId: serviceIdFromQuery })
      .unwrap()
      .catch((addError) => {
        setError(getApiErrorMessage(addError, 'Не удалось добавить услугу к записи.'));
      })
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
    if (!studioIdFromQuery || !studios.some((studio) => studio.id === studioIdFromQuery)) {
      return;
    }

    setStudioId(studioIdFromQuery);
  }, [studioIdFromQuery, studios]);

  useEffect(() => {
    if (!masterIdFromQuery || !allMasters.some((master) => master.id === masterIdFromQuery)) {
      return;
    }

    setSelectedMasterId(masterIdFromQuery);
  }, [allMasters, masterIdFromQuery]);

  const selectedStudio = useMemo(() => studios.find((studio) => studio.id === studioId), [studioId, studios]);
  const selectedMaster = useMemo(() => allMasters.find((master) => master.id === selectedMasterId), [allMasters, selectedMasterId]);
  const remainingCredits = activeSubscription?.credits.reduce((sum, credit) => sum + credit.remainingCredits, 0) ?? 0;
  const discountPercent = activeSubscription?.plan.discountPercent ?? 0;
  const pricingPreview = useMemo(
    () =>
      applySubscriptionBenefits(
        cartItems.map((item) => ({
          id: item.id,
          isIncludedInSubscription: isClassicMassage(item.service),
          priceRub: item.service.priceRub,
        })),
        { discountPercent, remainingCredits },
      ),
    [cartItems, discountPercent, remainingCredits],
  );
  const pricingByItemId = useMemo(() => new Map(pricingPreview.items.map((item) => [item.id, item])), [pricingPreview.items]);
  const isTimeSelected = Boolean(startsAt);
  const isMasterSelected = Boolean(selectedMasterId);
  const isReadyForSubmit = cartItems.length > 0 && Boolean(studioId) && Boolean(date) && isTimeSelected && isMasterSelected;

  const scrollToFormTop = useCallback(() => {
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }, []);

  const setActiveStepWithScroll = useCallback(
    (stepId: StepId) => {
      setActiveStep(stepId);
      scrollToFormTop();
    },
    [scrollToFormTop],
  );

  const resetSchedule = useCallback(() => {
    setStartsAt('');
    setSelectedMasterId('');
  }, []);

  const selectTime = useCallback((nextStartsAt: string) => {
    setStartsAt(nextStartsAt);
    setSelectedMasterId(masterIdFromQuery ?? '');
    setError('');
  }, [masterIdFromQuery]);

  const selectStudio = (nextStudioId: string) => {
    setStudioId(nextStudioId);
    resetSchedule();
    setError('');
  };

  const selectDate = (nextDate: string) => {
    setDate(nextDate);
    resetSchedule();
    setError('');
  };

  const selectMaster = useCallback((masterId: string) => {
    setSelectedMasterId(masterId);
    setError('');
  }, []);

  const goToStep = (stepId: StepId) => {
    const requestedIndex = getStepIndex(stepId);
    const currentIndex = getStepIndex(activeStep);

    if (requestedIndex <= currentIndex || canEnterStep(stepId, { isMasterSelected, isTimeSelected, cartItems, date, studioId })) {
      setActiveStepWithScroll(stepId);
      setError('');
      return;
    }

    setError(getStepError(stepId));
  };

  const goNext = () => {
    const currentIndex = getStepIndex(activeStep);
    const nextStep = steps[currentIndex + 1]?.id;

    if (!nextStep) {
      return;
    }

    goToStep(nextStep);
  };

  const handleRemoveCartItem = async (itemId: string) => {
    await removeCartItem(itemId).unwrap();
  };

  const handleSubmit = async () => {
    if (!isReadyForSubmit) {
      setError('Заполните все шаги записи перед подтверждением.');
      return;
    }

    try {
      const response = await checkoutCart({
        date,
        studioId,
        items: buildCheckoutItems(cartItems, selectedMasterId, startsAt),
      }).unwrap();

      setSuccess(response);
      setError('');
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, 'Не удалось оформить запись.'));
    }
  };

  const startNewBooking = () => {
    setSuccess(null);
    setActiveStep('services');
    setError('');
  };

  if (isLoadingCart || isAddingService) {
    return <p className={styles.state}>Загружаем запись...</p>;
  }

  if (success) {
    return (
      <section className={styles.root}>
        <article className={styles.successCard}>
          <span className={styles.kicker}>Запись готова</span>
          <h2>Мы забронировали ваше время</h2>
          <div className={styles.summaryGrid}>
            <SummaryMetric label="Записей" value={String(success.appointments.length)} />
            <SummaryMetric label="Списано визитов" value={String(success.subscriptionCreditsUsed)} />
            <SummaryMetric label="К оплате" value={formatPrice(success.totalAmountRub)} />
          </div>
          <div className={styles.actions}>
            <LinkButton to={appRoutes.accountAppointments()}>Мои записи</LinkButton>
            <Button variant="secondary" onClick={startNewBooking}>
              Новая запись
            </Button>
          </div>
        </article>
      </section>
    );
  }

  return (
    <section className={styles.root}>
      <div className={styles.layout}>
        <aside className={styles.stepper} aria-label="Этапы записи">
          {steps.map((step, index) => {
            const isActive = activeStep === step.id;
            const isComplete = isStepComplete(step.id, { isMasterSelected, isTimeSelected, cartItems, date, studioId });

            return (
              <button
                key={step.id}
                className={styles.stepButton}
                type="button"
                aria-current={isActive ? 'step' : undefined}
                data-complete={isComplete || undefined}
                onClick={() => goToStep(step.id)}
              >
                <span>{index + 1}</span>
                <strong>{step.label}</strong>
              </button>
            );
          })}
        </aside>

        <div className={styles.stage}>
          <StageHeader title={steps[getStepIndex(activeStep)].title} description={getStageDescription(activeStep)} />

          {activeStep === 'services' ? (
            <ServicesStep
              cartItems={cartItems}
              isRemovingService={isRemovingService}
              pricingByItemId={pricingByItemId}
              onRemove={(itemId) => void handleRemoveCartItem(itemId)}
            />
          ) : null}

          {activeStep === 'place' ? (
            <PlaceStep date={date} selectedStudioId={studioId} studios={studios} onDateChange={selectDate} onStudioChange={selectStudio} />
          ) : null}

          {activeStep === 'time' ? <TimeStep cartItems={cartItems} date={date} studioId={studioId} startsAt={startsAt} onTimeChange={selectTime} /> : null}

          {activeStep === 'master' ? (
            <MasterStep cartItems={cartItems} onSelectMaster={selectMaster} selectedMasterId={selectedMasterId} startsAt={startsAt} studioId={studioId} />
          ) : null}

          {activeStep === 'confirm' ? (
            <ConfirmStep
              cartItems={cartItems}
              pricingByItemId={pricingByItemId}
              pricingTotal={pricingPreview.totalAmountRub}
              selectedMaster={selectedMaster}
              selectedStudio={selectedStudio}
              startsAt={startsAt}
              subscriptionCreditsUsed={pricingPreview.subscriptionCreditsUsed}
            />
          ) : null}
        </div>

        <aside className={styles.sideSummary}>
          <span className={styles.kicker}>Итого</span>
          <strong>{formatPrice(pricingPreview.totalAmountRub)}</strong>
          <p>{formatServiceCount(cartItems.length)} · {pricingPreview.subscriptionCreditsUsed} по подписке</p>
          {cartItems.length > 0 ? (
            <div className={styles.stageActions}>
              {activeStep !== 'services' ? (
                <Button variant="secondary" onClick={() => setActiveStepWithScroll(steps[Math.max(0, getStepIndex(activeStep) - 1)].id)}>
                  Назад
                </Button>
              ) : (
                <LinkButton variant="secondary" to={appRoutes.services()}>
                  Добавить услугу
                </LinkButton>
              )}

              {activeStep === 'confirm' ? (
                <Button onClick={() => void handleSubmit()} isLoading={isSubmitting} loadingText="Оформляем..." disabled={!isReadyForSubmit}>
                  Подтвердить запись
                </Button>
              ) : (
                <Button onClick={goNext}>Продолжить</Button>
              )}
            </div>
          ) : null}
          <dl>
            <div>
              <dt>Студия</dt>
              <dd>{selectedStudio?.name ?? 'Не выбрана'}</dd>
            </div>
            <div>
              <dt>Дата</dt>
              <dd>{formatDateLabel(date)}</dd>
            </div>
            <div>
              <dt>Время</dt>
              <dd>{startsAt ? formatTime(startsAt) : 'Не выбрано'}</dd>
            </div>
            <div>
              <dt>Мастер</dt>
              <dd>{selectedMaster ? formatMasterName(selectedMaster) : 'Не выбран'}</dd>
            </div>
          </dl>
        </aside>
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}
    </section>
  );
}

function ServicesStep({
  cartItems,
  isRemovingService,
  onRemove,
  pricingByItemId,
}: {
  cartItems: CartItemDto[];
  isRemovingService: boolean;
  onRemove: (itemId: string) => void;
  pricingByItemId: Map<string, SubscriptionBenefitItemResult>;
}) {
  if (cartItems.length === 0) {
    return (
      <EmptyState
        title="Сначала выберите услугу"
        description="Добавьте процедуру из каталога, а затем вернитесь к записи."
        actions={<LinkButton to={appRoutes.services()}>Перейти в каталог</LinkButton>}
      />
    );
  }

  return (
    <div className={styles.serviceList}>
      {cartItems.map((item) => (
        <article className={styles.serviceRow} key={item.id}>
          <div>
            <h3>{item.service.title}</h3>
            <p>{item.service.durationMinutes} мин · {formatItemPrice(pricingByItemId.get(item.id))}</p>
          </div>
          <Button size="sm" variant="secondary" disabled={isRemovingService} onClick={() => onRemove(item.id)}>
            Убрать
          </Button>
        </article>
      ))}
    </div>
  );
}

function PlaceStep({
  date,
  onDateChange,
  onStudioChange,
  selectedStudioId,
  studios,
}: {
  date: string;
  onDateChange: (date: string) => void;
  onStudioChange: (studioId: string) => void;
  selectedStudioId: string;
  studios: StudioDto[];
}) {
  const dates = useMemo(() => getUpcomingDates(6), []);

  return (
    <div className={styles.placeGrid}>
      <div className={styles.choiceGroup}>
        <span className={styles.groupLabel}>Студия</span>
        <div className={styles.studioGrid}>
          {studios.map((studio) => (
            <button
              key={studio.id}
              className={styles.choiceCard}
              type="button"
              aria-pressed={studio.id === selectedStudioId}
              onClick={() => onStudioChange(studio.id)}
            >
              <strong>{studio.name}</strong>
              <span>{studio.address}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.choiceGroup}>
        <span className={styles.groupLabel}>Дата</span>
        <div className={styles.dateGrid}>
          {dates.map((item) => (
            <button
              key={item.value}
              className={styles.dateButton}
              type="button"
              aria-pressed={item.value === date}
              onClick={() => onDateChange(item.value)}
            >
              <span>{item.weekday}</span>
              <strong>{item.day}</strong>
            </button>
          ))}
        </div>
        <TextField label="Другая дата" type="date" min={getDateInputValue(new Date())} value={date} onChange={(event) => onDateChange(event.target.value)} />
      </div>
    </div>
  );
}

function TimeStep({
  cartItems,
  date,
  studioId,
  startsAt,
  onTimeChange,
}: {
  cartItems: CartItemDto[];
  date: string;
  studioId: string;
  startsAt: string;
  onTimeChange: (startsAt: string) => void;
}) {
  return <SlotPicker cartItems={cartItems} date={date} selectedSlot={startsAt} studioId={studioId} onTimeChange={onTimeChange} />;
}

function MasterStep({
  cartItems,
  onSelectMaster,
  selectedMasterId,
  startsAt,
  studioId,
}: {
  cartItems: CartItemDto[];
  onSelectMaster: (masterId: string) => void;
  selectedMasterId: string;
  startsAt: string;
  studioId: string;
}) {
  return <MasterPicker cartItems={cartItems} onSelectMaster={onSelectMaster} selectedMasterId={selectedMasterId} startsAt={startsAt} studioId={studioId} />;
}

function SlotPicker({
  cartItems,
  date,
  selectedSlot,
  studioId,
  onTimeChange,
}: {
  cartItems: CartItemDto[];
  date: string;
  selectedSlot: string;
  studioId: string;
  onTimeChange: (startsAt: string) => void;
}) {
  const slots = useMemo(() => getDefaultDaySlots(date), [date]);
  const totalDuration = cartItems.reduce((sum, item) => sum + item.service.durationMinutes, 0);

  return (
    <div className={styles.selectionPanel}>
      <div className={styles.panelTitle}>
        <span>Доступное время</span>
        <h3>Единое время начала для всей записи</h3>
        <p>
          {formatServiceCount(cartItems.length)} · примерно {totalDuration} мин · {studioId ? 'почасовые слоты с 10:00 до 19:00' : 'сначала выберите студию'}
        </p>
      </div>
      <div className={styles.slotGrid}>
        {slots.map((slot) => (
          <button
            key={slot}
            className={styles.slotButton}
            type="button"
            aria-pressed={selectedSlot === slot}
            onClick={() => onTimeChange(slot)}
          >
            {formatTime(slot)}
          </button>
        ))}
      </div>
    </div>
  );
}

function MasterPicker({
  cartItems,
  onSelectMaster,
  selectedMasterId,
  startsAt,
  studioId,
}: {
  cartItems: CartItemDto[];
  onSelectMaster: (masterId: string) => void;
  selectedMasterId: string;
  startsAt: string;
  studioId: string;
}) {
  const primaryServiceId = cartItems[0]?.service.id ?? '';
  const { data: masters = [], isFetching } = useGetAvailableMastersQuery(
    { serviceId: primaryServiceId, startsAt, studioId },
    { skip: !studioId || !startsAt || !primaryServiceId },
  );
  const { data: fallbackMasters = [] } = useGetMastersQuery();
  const requiredServiceIds = useMemo(() => new Set(cartItems.map((item) => item.service.id)), [cartItems]);
  const visibleMasters = useMemo(
    () =>
      (masters.length > 0 ? masters : fallbackMasters.filter((master) => master.isActive))
        .filter((master) => master.studio?.id === studioId)
        .filter((master) => {
          const masterServiceIds = new Set(master.services.map((service) => service.id));
          return [...requiredServiceIds].every((serviceId) => masterServiceIds.has(serviceId));
        }),
    [fallbackMasters, masters, requiredServiceIds, studioId],
  );

  useEffect(() => {
    if (!selectedMasterId || isFetching) {
      return;
    }

    if (!visibleMasters.some((master) => master.id === selectedMasterId)) {
      onSelectMaster('');
    }
  }, [isFetching, onSelectMaster, selectedMasterId, visibleMasters]);

  if (!startsAt) {
    return (
      <div className={styles.selectionPanel}>
        <PanelTitle cartItems={cartItems} title="Мастер" />
        <p className={styles.emptyNote}>Сначала выберите общее время записи.</p>
      </div>
    );
  }

  return (
    <div className={styles.selectionPanel}>
      <PanelTitle cartItems={cartItems} title={`Мастер на ${formatTime(startsAt)}`} />
      {isFetching ? <p className={styles.state}>Проверяем мастеров...</p> : null}
      {!isFetching && visibleMasters.length === 0 ? <p className={styles.emptyNote}>Нет мастеров, которые доступны в этот слот и подходят для всех выбранных услуг.</p> : null}
      <div className={styles.masterGrid}>
        {visibleMasters.map((master) => (
          <button
            key={master.id}
            className={styles.masterButton}
            type="button"
            aria-pressed={selectedMasterId === master.id}
            onClick={() => onSelectMaster(master.id)}
          >
            <strong>{formatMasterName(master)}</strong>
            <span>{master.bio ?? 'Мастер массажа и SPA'}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ConfirmStep({
  cartItems,
  pricingByItemId,
  pricingTotal,
  selectedMaster,
  selectedStudio,
  startsAt,
  subscriptionCreditsUsed,
}: {
  cartItems: CartItemDto[];
  pricingByItemId: Map<string, SubscriptionBenefitItemResult>;
  pricingTotal: number;
  selectedMaster?: MasterDto;
  selectedStudio?: StudioDto;
  startsAt: string;
  subscriptionCreditsUsed: number;
}) {
  return (
    <div className={styles.confirmGrid}>
      {cartItems.map((item, index) => (
        <article className={styles.confirmCard} key={item.id}>
          <span>{formatDateTime(getSequentialStartsAt(cartItems, startsAt, index))}</span>
          <h3>{item.service.title}</h3>
          <p>{selectedStudio?.name ?? 'Студия не выбрана'}</p>
          <p>{selectedMaster ? formatMasterName(selectedMaster) : 'Мастер не выбран'}</p>
          <strong>{formatItemPrice(pricingByItemId.get(item.id))}</strong>
        </article>
      ))}
      <div className={styles.totalCard}>
        <SummaryMetric label="Услуг" value={String(cartItems.length)} />
        <SummaryMetric label="По подписке" value={String(subscriptionCreditsUsed)} />
        <SummaryMetric label="К оплате" value={formatPrice(pricingTotal)} />
      </div>
    </div>
  );
}

function PanelTitle({ cartItems, title }: { cartItems: CartItemDto[]; title: string }) {
  return (
    <div className={styles.panelTitle}>
      <span>{title}</span>
      <h3>{cartItems.length > 1 ? `${formatServiceCount(cartItems.length)} в записи` : cartItems[0]?.service.title ?? 'Услуга'}</h3>
      <p>{cartItems.reduce((sum, item) => sum + item.service.durationMinutes, 0)} мин</p>
    </div>
  );
}

function StageHeader({ description, title }: { description: string; title: string }) {
  return (
    <header className={styles.stageHeader}>
      <h2>{title}</h2>
      <p>{description}</p>
    </header>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function canEnterStep(
  stepId: StepId,
  state: {
    isMasterSelected: boolean;
    isTimeSelected: boolean;
    cartItems: CartItemDto[];
    date: string;
    studioId: string;
  },
) {
  if (stepId === 'services') return true;
  if (stepId === 'place') return state.cartItems.length > 0;
  if (stepId === 'time') return state.cartItems.length > 0 && Boolean(state.studioId) && Boolean(state.date);
  if (stepId === 'master') return state.isTimeSelected;
  return state.isMasterSelected;
}

function isStepComplete(
  stepId: StepId,
  state: {
    isMasterSelected: boolean;
    isTimeSelected: boolean;
    cartItems: CartItemDto[];
    date: string;
    studioId: string;
  },
) {
  if (stepId === 'services') return state.cartItems.length > 0;
  if (stepId === 'place') return Boolean(state.studioId) && Boolean(state.date);
  if (stepId === 'time') return state.isTimeSelected;
  if (stepId === 'master') return state.isMasterSelected;
  return state.isMasterSelected;
}

function getStepError(stepId: StepId) {
  if (stepId === 'place') return 'Сначала добавьте услугу.';
  if (stepId === 'time') return 'Выберите услугу, студию и дату.';
  if (stepId === 'master') return 'Сначала выберите общее время записи.';
  return 'Выберите мастера для всей записи перед подтверждением.';
}

function getStageDescription(stepId: StepId) {
  if (stepId === 'services') return 'Запись собирается из услуг в корзине. Можно убрать лишнее или добавить новую процедуру из каталога.';
  if (stepId === 'place') return 'Студия и дата применяются ко всей записи. При смене даты или студии время нужно выбрать заново.';
  if (stepId === 'time') return 'Выберите почасовой слот с 10:00 до 19:00. Это будет время начала всей записи.';
  if (stepId === 'master') return 'После выбора времени покажем мастеров, которые подходят для всех выбранных услуг.';
  return 'Проверьте услуги, дату, студию, мастера и стоимость перед подтверждением.';
}

function getStepIndex(stepId: StepId) {
  return steps.findIndex((step) => step.id === stepId);
}

function getUpcomingDates(count: number) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);

    return {
      day: new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' }).format(date),
      value: getDateInputValue(date),
      weekday: index === 0 ? 'Сегодня' : new Intl.DateTimeFormat('ru-RU', { weekday: 'short' }).format(date),
    };
  });
}

function getDefaultDaySlots(date: string) {
  if (!date) {
    return [];
  }

  const slots: string[] = [];

  for (let hour = 10; hour <= 19; hour += 1) {
    slots.push(`${date}T${String(hour).padStart(2, '0')}:00:00`);
  }

  return slots;
}

function getDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateLabel(value: string) {
  if (!value) return 'Не выбрана';
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', weekday: 'short' }).format(new Date(`${value}T12:00:00`));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

function formatDateTime(value?: string) {
  if (!value) return 'Время не выбрано';
  return new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function formatMasterName(master: MasterDto) {
  return `${master.firstName} ${master.lastName}`.trim();
}

function formatItemPrice(item?: SubscriptionBenefitItemResult) {
  if (!item) {
    return 'Расчет после выбора';
  }

  return item.paidBySubscriptionCredit ? 'По подписке' : formatPrice(item.finalPriceRub);
}

function isClassicMassage(service: { category?: { slug?: string } | null; title: string }) {
  const title = service.title.toLowerCase();
  const categorySlug = service.category?.slug ?? '';
  return categorySlug.includes('massage') && title.includes('классический');
}

function buildCheckoutItems(cartItems: CartItemDto[], masterId: string, startsAt: string) {
  let cursor = new Date(startsAt);

  return cartItems.map((item) => {
    const itemStartsAt = cursor.toISOString();
    cursor = new Date(cursor.getTime() + item.service.durationMinutes * 60_000);

    return {
      cartItemId: item.id,
      masterId,
      startsAt: itemStartsAt,
    };
  });
}

function getSequentialStartsAt(cartItems: CartItemDto[], startsAt: string, targetIndex: number) {
  let cursor = new Date(startsAt);

  for (let index = 0; index < targetIndex; index += 1) {
    cursor = new Date(cursor.getTime() + cartItems[index].service.durationMinutes * 60_000);
  }

  return cursor.toISOString();
}
