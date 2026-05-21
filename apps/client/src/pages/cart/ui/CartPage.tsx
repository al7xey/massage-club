import { applySubscriptionBenefits } from '@massage/shared/lib/subscription-benefits';
import { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAddCartItemMutation, useGetCartQuery, useRemoveCartItemMutation } from '@/entities/cart';
import { getSubscriptionPlanTitle, useGetMySubscriptionQuery } from '@/entities/subscription';
import { formatPrice } from '@/shared/lib/currency/formatPrice';
import { appRoutes } from '@/shared/routes';
import { Button, EmptyState, LinkButton } from '@/shared/ui';
import { PageShell } from '@/shared/ui/page-shell/PageShell';
import styles from './CartPage.module.css';

export function CartPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const addServiceId = searchParams.get('addServiceId');
  const { data: cartItems = [], isLoading } = useGetCartQuery();
  const { data: activeSubscription } = useGetMySubscriptionQuery();
  const [addCartItem, { isLoading: isAdding }] = useAddCartItemMutation();
  const [removeCartItem, { isLoading: isRemoving }] = useRemoveCartItemMutation();

  useEffect(() => {
    if (!addServiceId) {
      return;
    }

    void addCartItem({ serviceId: addServiceId })
      .unwrap()
      .finally(() => {
        navigate(appRoutes.cart(), { replace: true });
      });
  }, [addCartItem, addServiceId, navigate]);

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
  const previewByItemId = useMemo(
    () => new Map(pricingPreview.items.map((item) => [item.id, item])),
    [pricingPreview.items],
  );
  const baseAmountRub = cartItems.reduce((sum, item) => sum + item.service.priceRub, 0);
  const savedAmountRub = baseAmountRub - pricingPreview.totalAmountRub;

  return (
    <PageShell title="Корзина услуг" description="Соберите несколько услуг, а мы автоматически применим визиты по подписке и скидки перед checkout.">
      <section className={styles.layout}>
        <div className={styles.list}>
          {isLoading || isAdding ? <p className={styles.state}>Загружаем корзину...</p> : null}
          {!isLoading && cartItems.length === 0 ? (
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
                <img className={styles.image} src={getServiceImageUrl(item.service.category?.slug)} alt="" loading="lazy" />
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
                        <span>Стоимость без скидки: {formatPrice(preview.basePriceRub)}</span>
                      )}
                    </div>
                  ) : null}
                </div>
                <div className={styles.cardSide}>
                  <strong>{preview?.paidBySubscriptionCredit ? 'Включено в подписку' : formatPrice(preview?.finalPriceRub ?? item.service.priceRub)}</strong>
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
              <p>На следующем шаге вы выберете студию, дату, время и мастеров для каждой услуги отдельно.</p>
            )}
            <LinkButton to={appRoutes.booking()}>
              Перейти к оформлению
            </LinkButton>
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

function getServiceImageUrl(categorySlug?: string) {
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
