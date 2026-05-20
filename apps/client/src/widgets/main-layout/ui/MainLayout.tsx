import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { useGetCartQuery } from '@/entities/cart';
import { appRoutes } from '@/shared/routes';
import { Button, LinkButton } from '@/shared/ui';
import styles from './MainLayout.module.css';

const links = [
  [appRoutes.services(), 'Услуги'],
  [appRoutes.subscriptions(), 'Членство'],
  [appRoutes.studios(), 'Студии'],
  [appRoutes.masters(), 'Мастера'],
  [appRoutes.certificates(), 'Сертификаты'],
] as const;

export function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthLoading, logout, user } = useAuth();
  const { data: cartItems = [] } = useGetCartQuery(undefined, { skip: !user });
  const logoRoute = user ? appRoutes.account() : appRoutes.home();
  const accountInitial = (user?.fullName?.trim()?.[0] ?? 'Р').toUpperCase();
  const authState = { backgroundLocation: location, from: location.pathname };

  const handleLogout = async () => {
    await logout();
    navigate(appRoutes.home());
  };

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <NavLink to={logoRoute} className={styles.logo}>
          <span aria-hidden="true">♥</span>
          RelaxUp
        </NavLink>

        <nav className={styles.nav} aria-label="Основная навигация">
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} className={({ isActive }) => (isActive ? styles.activeLink : undefined)}>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.actions}>
          {!user && !isAuthLoading ? (
            <>
              <LinkButton state={authState} to={appRoutes.login()} variant="secondary" size="sm">
                Войти
              </LinkButton>
              <LinkButton to={appRoutes.subscriptions()} size="sm">
                Стать частью клуба
              </LinkButton>
            </>
          ) : null}

          {user ? (
            <>
              <LinkButton className={styles.cartButton} to={appRoutes.cart()} variant="secondary" size="sm">
                <span>Корзина</span>
                <strong>{cartItems.length}</strong>
              </LinkButton>
              {user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? (
                <LinkButton to={appRoutes.admin()} variant="secondary" size="sm">
                  Админ-панель
                </LinkButton>
              ) : null}
              <LinkButton className={styles.accountLink} to={appRoutes.account()} variant="secondary" size="sm">
                <span className={styles.avatar} aria-hidden="true">
                  {accountInitial}
                </span>
                <span>Личный кабинет</span>
              </LinkButton>
              <Button variant="secondary" size="sm" onClick={handleLogout}>
                Выйти
              </Button>
            </>
          ) : null}
        </div>
      </header>

      <Outlet />

      <footer className={styles.footer}>
        <div className={styles.footerMain}>
          <div>
            <p className={styles.footerBrand}>
              <span aria-hidden="true">♥</span>
              RelaxUp
            </p>
            <p>Сеть wellness-клубов с заботой о вашем теле и ментальном здоровье. Работаем по системе подписки.</p>
          </div>
          <div>
            <h4>Клуб</h4>
            <Link to={appRoutes.studios()}>Студии</Link>
            <Link to={appRoutes.subscriptions()}>Членство</Link>
            <Link to={appRoutes.contacts()}>Контакты</Link>
          </div>
          <div>
            <h4>Услуги</h4>
            <Link to={appRoutes.services()}>Массаж</Link>
            <Link to={appRoutes.services()}>SPA-программы</Link>
            <Link to={appRoutes.services()}>Уход за лицом</Link>
          </div>
          <div>
            <h4>Контакты</h4>
            <p>8 (800) 555-35-35</p>
            <p>hello@dlyasebya.ru</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
