import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { useGetCartQuery } from '@/entities/cart';
import brandLogo from '@/shared/assets/brand-logo.jpg';
import { appRoutes } from '@/shared/routes';
import { LinkButton } from '@/shared/ui';
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
  const { isAuthLoading, user } = useAuth();
  const { data: cartItems = [] } = useGetCartQuery(undefined, { skip: !user });
  const logoRoute = user ? appRoutes.account() : appRoutes.home();
  const accountInitial = (user?.fullName?.trim()?.[0] ?? 'Р').toUpperCase();
  const authState = { backgroundLocation: location, from: location.pathname };

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <NavLink to={logoRoute} className={styles.logo}>
            <span className={styles.brandMark} aria-hidden="true">
              <img src={brandLogo} alt="" />
            </span>
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
                <LinkButton
                  aria-label={`Корзина, товаров: ${cartItems.length}`}
                  className={styles.iconButton}
                  to={appRoutes.cart()}
                  variant="secondary"
                  size="sm"
                >
                  <span className={styles.cartIcon} aria-hidden="true" />
                  <strong className={styles.cartBadge}>{cartItems.length}</strong>
                </LinkButton>
                {user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? (
                  <LinkButton to={appRoutes.admin()} variant="secondary" size="sm">
                    Админ-панель
                  </LinkButton>
                ) : null}
                <LinkButton
                  aria-label="Личный кабинет"
                  className={styles.iconButton}
                  to={appRoutes.account()}
                  variant="secondary"
                  size="sm"
                >
                  <span className={styles.avatar} aria-hidden="true">
                    {accountInitial}
                  </span>
                </LinkButton>
              </>
            ) : null}
          </div>
        </div>
      </header>

      <Outlet />

      <footer className={styles.footer}>
        <div className={styles.footerMain}>
          <div>
            <p className={styles.footerBrand}>
              <span className={styles.brandMark} aria-hidden="true">
                <img src={brandLogo} alt="" />
              </span>
              RelaxUp
            </p>
            <p>Wellness-клуб с подпиской на массаж, SPA и уходовые процедуры.</p>
          </div>
          <div>
            <h4>Клуб</h4>
            <Link to={appRoutes.studios()}>Студии</Link>
            <Link to={appRoutes.subscriptions()}>Членство</Link>
            <Link to={appRoutes.contacts()}>Контакты</Link>
          </div>
          <div>
            <h4>Услуги</h4>
            <Link to={appRoutes.services()}>Каталог</Link>
            <Link to={`${appRoutes.services()}?category=spa-programs`}>SPA-программы</Link>
            <Link to={`${appRoutes.services()}?category=face-care`}>Уход за лицом</Link>
          </div>
          <div>
            <h4>Документы</h4>
            <Link to={appRoutes.legal()}>Юридический реестр</Link>
            <p>8 (800) 555-35-35</p>
            <p>hello@dlyasebya.ru</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
