import { applySubscriptionBenefits } from '@massage/shared/lib/subscription-benefits';
import { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAddCartItemMutation, useGetCartQuery, useRemoveCartItemMutation } from '@/entities/cart';
import { getSubscriptionPlanTitle, useGetMySubscriptionQuery } from '@/entities/subscription';
import { useAuth } from '@/features/auth';
import { formatPrice } from '@/shared/lib/currency/formatPrice';
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
      navigate(appRoutes.login(), { replace: true, state: { from: `${appRoutes.cart()}?addServiceId=${addServiceId}` } });
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
  const baseAmountRub = cartItems.reduce((sum, item) => sum + item.service.priceRub, 0);
  const savedAmountRub = baseAmountRub - pricingPreview.totalAmountRub;

  return (
    <PageShell title="Корзина услуг">
      <section className={styles.layout}>
        <div className={styles.list}>
          {isLoading || isAdding ? <p className={styles.state}>Загружаем корзину...</p> : null}
          {!user ? (
            <EmptyState
              title="Корзина пока пуста"
              description="Войдите, чтобы сохранить выбранные услуги и оформить запись."
              actions={<LinkButton state={{ from: appRoutes.cart() }} to={appRoutes.login()}>Войти</LinkButton>}
            />
          ) : null}
          {user && !isLoading && cartItems.length === 0 ? (
            <EmptyState
              title="Корзина пока пуста"
              description="Добавьте услуги из каталога или со страницы детали, а затем перейдите к оформлению записи."
              actions={<LinkButton to={appRoutes.services()}>Перейти к услугам</LinkButton>}
            />
          ) : null}

          {cartItems.map((item) => {
            const preview = previewByItemId.get(item.id);

            return (
              <article className={styles.card} key={item.id}>
                <div className={styles.imageWrap}>
                  <img className={styles.image} src={getServiceImageUrl(item.service)} alt="" loading="lazy" />
                </div>

                <div className={styles.cardBody}>
                  <span className={styles.meta}>{item.service.durationMinutes} минут</span>
                  <h3>{item.service.title}</h3>
                  <p>{item.service.description}</p>

                  {preview ? (
                    <div className={styles.discountLine}>
                      {preview.paidBySubscriptionCredit ? (
                        <span>Классический массаж включен в подписку</span>
                      ) : preview.discountPercent > 0 ? (
                        <span>
                          Скидка {preview.discountPercent}%: {formatPrice(preview.basePriceRub)} → {formatPrice(preview.finalPriceRub)}
                        </span>
                      ) : (
                        <span>Super: скидка 30% - {formatPrice(getSuperPrice(preview.basePriceRub))} вместо {formatPrice(preview.basePriceRub)}</span>
                      )}
                    </div>
                  ) : null}
                </div>

                <div className={styles.cardSide}>
                  <strong className={preview?.paidBySubscriptionCredit ? styles.includedPrice : undefined}>
                    {preview?.paidBySubscriptionCredit ? 'В подписке' : formatPrice(preview?.finalPriceRub ?? item.service.priceRub)}
                  </strong>
                  <Button size="sm" variant="danger" disabled={isRemoving} onClick={() => void removeCartItem(item.id)}>
                    Удалить
                  </Button>
                </div>
              </article>
            );
          })}
        </div>

        {cartItems.length > 0 ? (
          <aside className={styles.summary}>
            <p className={styles.summaryLabel}>В корзине</p>
            <strong>{cartItems.length} услуг</strong>
            <span>{formatPrice(pricingPreview.totalAmountRub)}</span>
            {activeSubscription ? (
              <p>
                Подписка <strong>{getSubscriptionPlanTitle(activeSubscription.plan.code, activeSubscription.plan.name)}</strong>: автоматически спишем{' '}
                {pricingPreview.subscriptionCreditsUsed} визита и сэкономим {formatPrice(savedAmountRub)}.
              </p>
            ) : (
              <div className={styles.superHint}>
                <p>Подписка Super даст скидку 30%: итог будет {formatPrice(getSuperPrice(baseAmountRub))} вместо {formatPrice(baseAmountRub)}.</p>
                <LinkButton to={appRoutes.subscriptions()} variant="secondary">Перейти к тарифам</LinkButton>
              </div>
            )}
            <LinkButton to={appRoutes.booking()}>Перейти к оформлению</LinkButton>
          </aside>
        ) : null}
      </section>
    </PageShell>
  );
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
  if (uploadedUrl) {
    return uploadedUrl;
  }

  const categorySlug = service.category?.slug;
  if (categorySlug === 'face-care') {
    return 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=420&q=80';
  }

  if (categorySlug === 'laser-hair-removal') {
    return 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=420&q=80';
  }

  if (categorySlug === 'spa-programs') {
    return 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=420&q=80';
  }

  return 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=420&q=80';
}
