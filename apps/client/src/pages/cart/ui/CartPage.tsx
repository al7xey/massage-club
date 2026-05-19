import { applySubscriptionBenefits } from '@massage/shared/lib/subscription-benefits';
import { useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAddCartItemMutation, useGetCartQuery, useRemoveCartItemMutation } from '@/entities/cart';
import { useGetMySubscriptionQuery } from '@/entities/subscription';
import { formatPrice } from '@/shared/lib/currency/formatPrice';
import { appRoutes } from '@/shared/routes';
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
            <div className={styles.empty}>
              <h2>Корзина пока пуста</h2>
              <p>Добавьте услуги из каталога или со страницы детали, а затем перейдите к оформлению записи.</p>
              <Link className={styles.primaryButton} to={appRoutes.services()}>
                Перейти к услугам
              </Link>
            </div>
          ) : null}

          {cartItems.map((item) => {
            const preview = previewByItemId.get(item.id);

            return (
              <article className={styles.card} key={item.id}>
                <div>
                  <span className={styles.meta}>{item.service.durationMinutes} минут</span>
                  <h3>{item.service.title}</h3>
                  <p>{item.service.description}</p>
                </div>
                <div className={styles.cardSide}>
                  <strong>{preview?.paidBySubscriptionCredit ? 'Включено в подписку' : formatPrice(preview?.finalPriceRub ?? item.service.priceRub)}</strong>
                  <button type="button" className={styles.removeButton} disabled={isRemoving} onClick={() => void removeCartItem(item.id)}>
                    Удалить
                  </button>
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
                Подписка <strong>{activeSubscription.plan.name}</strong>: автоматически спишем {pricingPreview.subscriptionCreditsUsed} визита и сэкономим {formatPrice(savedAmountRub)}.
              </p>
            ) : (
              <p>На следующем шаге вы выберете студию, дату, время и мастеров для каждой услуги отдельно.</p>
            )}
            <Link className={styles.primaryButton} to={appRoutes.booking()}>
              Перейти к оформлению
            </Link>
          </aside>
        ) : null}
      </section>
    </PageShell>
  );
}
