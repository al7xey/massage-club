import { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAddCartItemMutation, useGetCartQuery, useRemoveCartItemMutation } from '@/entities/cart';
import { formatPrice } from '@/shared/lib/currency/formatPrice';
import { appRoutes } from '@/shared/routes';
import { PageShell } from '@/shared/ui/page-shell/PageShell';
import styles from './CartPage.module.css';

export function CartPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const addServiceId = searchParams.get('addServiceId');
  const { data: cartItems = [], isLoading } = useGetCartQuery();
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

  const totalAmountRub = cartItems.reduce((sum, item) => sum + item.service.priceRub, 0);

  return (
    <PageShell title="Корзина услуг" description="Соберите несколько услуг и затем настройте запись на checkout.">
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

          {cartItems.map((item) => (
            <article className={styles.card} key={item.id}>
              <div>
                <span className={styles.meta}>{item.service.durationMinutes} минут</span>
                <h3>{item.service.title}</h3>
                <p>{item.service.description}</p>
              </div>
              <div className={styles.cardSide}>
                <strong>{formatPrice(item.service.priceRub)}</strong>
                <button type="button" className={styles.removeButton} disabled={isRemoving} onClick={() => void removeCartItem(item.id)}>
                  Удалить
                </button>
              </div>
            </article>
          ))}
        </div>

        {cartItems.length > 0 ? (
          <aside className={styles.summary}>
            <p className={styles.summaryLabel}>В корзине</p>
            <strong>{cartItems.length} услуг</strong>
            <span>{formatPrice(totalAmountRub)}</span>
            <p>На следующем шаге вы выберете общую студию и дату, а затем настроите мастера и время для каждой услуги отдельно.</p>
            <Link className={styles.primaryButton} to={appRoutes.booking()}>
              Перейти к оформлению
            </Link>
          </aside>
        ) : null}
      </section>
    </PageShell>
  );
}
