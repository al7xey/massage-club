import { applySubscriptionBenefits } from '@massage/shared/lib/subscription-benefits';
import { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { pendingCartStorage, useAddCartItemMutation, useGetCartQuery, useRemoveCartItemMutation } from '@/entities/cart';
import type { CartItemDto } from '@/entities/cart';
import { getSubscriptionPlanTitle, useGetMySubscriptionQuery } from '@/entities/subscription';
import { useAuth } from '@/features/auth';
import { formatPrice } from '@/shared/lib/currency/formatPrice';
import { getFallbackImage } from '@/shared/lib/fallbackImages';
import { resolveMediaUrl } from '@/shared/lib/media';
import { formatServiceCount } from '@/shared/lib/text/formatServiceCount';
import { appRoutes } from '@/shared/routes';
import { EmptyState, LinkButton } from '@/shared/ui';
import { PageShell } from '@/shared/ui/page-shell/PageShell';
import styles from './CartPage.module.css';

export function CartPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const addServiceId = searchParams.get('addServiceId');
  const { data: cartItems = [], isLoading } = useGetCartQuery(undefined, { skip: !user });
  const { data: activeSubscription } = useGetMySubscriptionQuery(undefined, { skip: !user });
  const [addCartItem, { isLoading: isAdding }] = useAddCartItemMutation();
  const [removeCartItem, { isLoading: isRemoving }] = useRemoveCartItemMutation();

  useEffect(() => {
    if (!addServiceId) {
      return;
    }

    if (!user) {
      pendingCartStorage.set(addServiceId);
      navigate(appRoutes.login(), { replace: true, state: { action: 'cart', from: appRoutes.cart(), serviceId: addServiceId } });
      return;
    }

    void addCartItem({ serviceId: addServiceId })
      .unwrap()
      .finally(() => {
        navigate(appRoutes.cart(), { replace: true });
      });
  }, [addCartItem, addServiceId, navigate, user]);

  const remainingCredits = useMemo(
    () => activeSubscription?.credits.reduce((sum, credit) => sum + credit.remainingCredits, 0) ?? 0,
    [activeSubscription],
  );
  const pricingPreview = useMemo(
    () =>
      applySubscriptionBenefits(
        cartItems.map((item) => ({
          id: item.id,
          isIncludedInSubscription: isClassicMassage(item.service),
          priceRub: item.service.priceRub,
        })),
        {
          discountPercent: activeSubscription?.plan.discountPercent ?? 0,
          remainingCredits,
        },
      ),
    [activeSubscription?.plan.discountPercent, cartItems, remainingCredits],
  );
  const previewByItemId = useMemo(() => new Map(pricingPreview.items.map((item) => [item.id, item])), [pricingPreview.items]);
  const groupedRows = useMemo(() => buildCartRows(cartItems, previewByItemId), [cartItems, previewByItemId]);
  const baseAmountRub = cartItems.reduce((sum, item) => sum + item.service.priceRub, 0);
  const savedAmountRub = baseAmountRub - pricingPreview.totalAmountRub;
  const potentialSuperTotalRub = getSuperPrice(baseAmountRub);
  const potentialSuperSavingRub = Math.max(0, baseAmountRub - potentialSuperTotalRub);
  const isMutating = isAdding || isRemoving;

  const addSameService = (serviceId: string) => {
    void addCartItem({ serviceId });
  };

  const removeOne = (items: CartItemDto[]) => {
    const lastItem = items.at(-1);
    if (lastItem) {
      void removeCartItem(lastItem.id);
    }
  };

  const removeAll = (items: CartItemDto[]) => {
    void Promise.all(items.map((item) => removeCartItem(item.id).unwrap().catch(() => undefined)));
  };

  return (
    <PageShell title="Корзина">
      <section className={styles.layout}>
        <div className={styles.list}>
          {isLoading || isAdding ? <p className={styles.state}>Загружаем корзину...</p> : null}
          {!user ? (
            <EmptyState
              title="Корзина пока пустая"
              description="Войдите, чтобы сохранять выбранные услуги."
              actions={<LinkButton state={{ from: appRoutes.cart() }} to={appRoutes.login()}>Войти</LinkButton>}
            />
          ) : null}
          {user && !isLoading && cartItems.length === 0 ? (
            <EmptyState
              title="Корзина пока пустая"
              description="Откройте услугу и добавьте ее в корзину."
              actions={<LinkButton to={appRoutes.services()}>Перейти к услугам</LinkButton>}
            />
          ) : null}

          {groupedRows.map((row) => (
            <article className={styles.card} key={row.service.id}>
              <div className={styles.imageWrap}>
                <img className={styles.image} src={getServiceImageUrl(row.service)} alt="" loading="lazy" />
              </div>

              <div className={styles.cardBody}>
                <span className={styles.meta}>{row.service.durationMinutes} минут</span>
                <h3>{row.service.title}</h3>
                <p>{row.service.description}</p>
              </div>

              <div className={styles.cardSide}>
                <div className={styles.priceBlock}>
                  <strong className={row.hasIncludedCredit ? styles.includedPrice : undefined}>
                    {row.hasIncludedCredit && row.totalRub === 0 ? 'В подписке' : formatPrice(row.totalRub)}
                  </strong>
                  {row.savedRub > 0 ? <span className={styles.oldPrice}>{formatPrice(row.baseRub)}</span> : null}
                </div>
                <div className={styles.rowControls}>
                  <div className={styles.quantityControl} aria-label={`Количество: ${row.items.length}`}>
                    <button className={styles.quantityButton} type="button" disabled={isMutating} aria-label="Уменьшить количество" onClick={() => removeOne(row.items)}>
                      −
                    </button>
                    <span>{row.items.length}</span>
                    <button className={styles.quantityButton} type="button" disabled={isMutating} aria-label="Увеличить количество" onClick={() => addSameService(row.service.id)}>
                      +
                    </button>
                  </div>
                  <button className={styles.deleteButton} type="button" disabled={isMutating} aria-label={`Удалить ${row.service.title} из корзины`} onClick={() => removeAll(row.items)}>
                    <TrashIcon />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {cartItems.length > 0 ? (
          <aside className={styles.summary}>
            <p className={styles.summaryLabel}>Итого</p>
            <strong>{formatPrice(pricingPreview.totalAmountRub)}</strong>
            <span>{formatServiceCount(cartItems.length)}</span>
            {activeSubscription ? (
              <div className={styles.discountPanel}>
                <b>{getSubscriptionPlanTitle(activeSubscription.plan.code, activeSubscription.plan.name)}</b>
                <p>
                  {savedAmountRub > 0
                    ? `Скидка уже учтена: ${pricingPreview.subscriptionCreditsUsed} по подписке, экономия ${formatPrice(savedAmountRub)}.`
                    : `Активная подписка применится к подходящим услугам. Доступно визитов: ${remainingCredits}.`}
                </p>
              </div>
            ) : (
              <div className={styles.discountPanel}>
                <b>Возможная скидка по подписке</b>
                <p>С Super тарифом −30%: итог {formatPrice(potentialSuperTotalRub)}, экономия {formatPrice(potentialSuperSavingRub)}.</p>
              </div>
            )}
            <LinkButton to={appRoutes.booking()}>Оформить</LinkButton>
          </aside>
        ) : null}
      </section>
    </PageShell>
  );
}

function buildCartRows(cartItems: CartItemDto[], previewByItemId: Map<string, { finalPriceRub: number; paidBySubscriptionCredit: boolean }>) {
  const rows = new Map<
    string,
    {
      hasIncludedCredit: boolean;
      baseRub: number;
      items: CartItemDto[];
      service: CartItemDto['service'];
      savedRub: number;
      totalRub: number;
    }
  >();

  for (const item of cartItems) {
    const preview = previewByItemId.get(item.id);
    const row = rows.get(item.service.id) ?? {
      hasIncludedCredit: false,
      baseRub: 0,
      items: [],
      service: item.service,
      savedRub: 0,
      totalRub: 0,
    };

    row.items.push(item);
    row.baseRub += item.service.priceRub;
    row.totalRub += preview?.finalPriceRub ?? item.service.priceRub;
    row.savedRub = Math.max(0, row.baseRub - row.totalRub);
    row.hasIncludedCredit = row.hasIncludedCredit || Boolean(preview?.paidBySubscriptionCredit);
    rows.set(item.service.id, row);
  }

  return Array.from(rows.values());
}

function isClassicMassage(service: { category?: { slug?: string } | null; title: string }) {
  const title = service.title.toLowerCase();
  const categorySlug = service.category?.slug ?? '';
  return categorySlug.includes('massage') && title.includes('классический');
}

function getSuperPrice(priceRub: number) {
  return Math.round(Math.max(0, priceRub) * 0.7);
}

function getServiceImageUrl(service: { category?: { slug?: string } | null; galleryUrls?: string[] | null; imageUrl?: string | null }) {
  const uploadedUrl = resolveMediaUrl(service.imageUrl ?? service.galleryUrls?.[0]);
  return uploadedUrl || getFallbackImage('services', service.category?.slug ?? 'service');
}

function TrashIcon() {
  return (
    <svg className={styles.trashIcon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 7h16" />
      <path d="M9 7V5h6v2" />
      <path d="m6.5 7 .9 13h9.2l.9-13" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </svg>
  );
}
