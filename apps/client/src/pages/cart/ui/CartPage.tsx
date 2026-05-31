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
import { appRoutes } from '@/shared/routes';
import { Button, EmptyState, LinkButton } from '@/shared/ui';
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
                <strong className={row.hasIncludedCredit ? styles.includedPrice : undefined}>
                  {row.hasIncludedCredit && row.totalRub === 0 ? 'В подписке' : formatPrice(row.totalRub)}
                </strong>
                <div className={styles.quantityControl} aria-label={`Количество: ${row.items.length}`}>
                  <Button size="sm" variant="secondary" disabled={isMutating} onClick={() => removeOne(row.items)}>
                    -
                  </Button>
                  <span>{row.items.length}</span>
                  <Button size="sm" variant="secondary" disabled={isMutating} onClick={() => addSameService(row.service.id)}>
                    +
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {cartItems.length > 0 ? (
          <aside className={styles.summary}>
            <p className={styles.summaryLabel}>Итого</p>
            <strong>{formatPrice(pricingPreview.totalAmountRub)}</strong>
            <span>{cartItems.length} услуг</span>
            {activeSubscription ? (
              <p>
                {getSubscriptionPlanTitle(activeSubscription.plan.code, activeSubscription.plan.name)}: {pricingPreview.subscriptionCreditsUsed} по подписке,
                экономия {formatPrice(savedAmountRub)}.
              </p>
            ) : (
              <p>С Super тарифом итог был бы {formatPrice(getSuperPrice(baseAmountRub))}.</p>
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
      items: CartItemDto[];
      service: CartItemDto['service'];
      totalRub: number;
    }
  >();

  for (const item of cartItems) {
    const preview = previewByItemId.get(item.id);
    const row = rows.get(item.service.id) ?? {
      hasIncludedCredit: false,
      items: [],
      service: item.service,
      totalRub: 0,
    };

    row.items.push(item);
    row.totalRub += preview?.finalPriceRub ?? item.service.priceRub;
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
