import { useEffect, useId, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useGetCartQuery } from '@/entities/cart';
import { useAuth } from '@/features/auth';
import { resolveMediaUrl } from '@/shared/lib/media';
import { appRoutes } from '@/shared/routes';
import { BrandMark, LinkButton } from '@/shared/ui';
import styles from './MainLayout.module.css';

type MobileIconName = 'home' | 'cart' | 'calendar' | 'user' | 'menu' | 'login' | 'building' | 'gift' | 'star' | 'credit-card';

const links = [
  [appRoutes.services(), 'Услуги'],
  [appRoutes.subscriptions(), 'Тарифы'],
  [appRoutes.studios(), 'Студии'],
  [appRoutes.masters(), 'Мастера'],
  [appRoutes.certificates(), 'Сертификаты'],
] as const;

const bottomLinks = [
  { icon: 'cart' as const, label: 'Услуги', to: appRoutes.services(), match: (path: string) => path.startsWith('/services') },
  { icon: 'credit-card' as const, label: 'Тарифы', to: appRoutes.subscriptions(), match: (path: string) => path.startsWith('/subscriptions') },
  { icon: 'building' as const, label: 'Студии', to: appRoutes.studios(), match: (path: string) => path.startsWith('/studios') },
  { icon: 'user' as const, label: 'Мастера', to: appRoutes.masters(), match: (path: string) => path.startsWith('/masters') },
  { icon: 'gift' as const, label: 'Сертификаты', to: appRoutes.certificates(), match: (path: string) => path.startsWith('/certificates') },
] as const;

export function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const mobileMenuId = useId();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthLoading, user } = useAuth();
  const { data: cartItems = [] } = useGetCartQuery(undefined, { skip: !user });
  const logoRoute = user ? appRoutes.account() : appRoutes.home();
  const accountInitial = (user?.fullName?.trim()?.[0] ?? 'Р').toUpperCase();
  const authState = { from: `${location.pathname}${location.search}` };
  const profileRoute = user ? appRoutes.account() : appRoutes.login();
  const showBackLink = location.pathname !== '/';
  const footerText = 'Wellness-клуб с подпиской на массаж, SPA и уходовые процедуры.';
  const contactPhone = '8 (800) 555-35-35';
  const contactEmail = 'hello@relaxup.ru';

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <NavLink to={logoRoute} className={styles.logo}>
            <span className={styles.brandMark} aria-hidden="true">
              <BrandMark />
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
                <LinkButton className={styles.headerGuestButton} state={authState} to={appRoutes.login()} variant="secondary" size="sm">
                  Войти
                </LinkButton>
                <LinkButton className={styles.headerGuestButton} to={appRoutes.subscriptions()} size="sm">
                  Выбрать тариф
                </LinkButton>
              </>
            ) : null}

            {user ? (
              <>
                <LinkButton aria-label={`Корзина, товаров: ${cartItems.length}`} className={styles.iconButton} to={appRoutes.cart()} variant="secondary" size="sm">
                  <MobileNavIcon name="cart" />
                  {cartItems.length > 0 ? <strong className={styles.cartBadge}>{cartItems.length}</strong> : null}
                </LinkButton>
                {user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? (
                  <LinkButton to={user.role === 'SUPER_ADMIN' ? appRoutes.superAdmin() : appRoutes.admin()} variant="secondary" size="sm">
                    Админ-панель
                  </LinkButton>
                ) : null}
                <LinkButton aria-label="Профиль" className={styles.iconButton} to={appRoutes.account()} variant="secondary" size="sm">
                  <span className={styles.avatar} aria-hidden="true">
                    {user.avatarUrl ? <img src={resolveMediaUrl(user.avatarUrl)} alt="" /> : accountInitial}
                  </span>
                </LinkButton>
              </>
            ) : null}
          </div>

          <button
            aria-controls={mobileMenuId}
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
            className={styles.menuButton}
            type="button"
            onClick={() => setIsMobileMenuOpen((value) => !value)}
          >
            <span aria-hidden="true" />
          </button>
        </div>
      </header>

      {isMobileMenuOpen ? (
        <div className={styles.mobileMenuLayer}>
          <button className={styles.mobileMenuBackdrop} type="button" aria-label="Закрыть меню" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className={styles.mobileMenuPanel} id={mobileMenuId} aria-label="Мобильное меню">
            <div className={styles.mobileMenuHeader}>
              <strong>Меню</strong>
              <button className={styles.mobileCloseButton} type="button" aria-label="Закрыть меню" onClick={() => setIsMobileMenuOpen(false)}>
                <span aria-hidden="true" />
              </button>
            </div>

            <nav className={styles.mobileMenuNav} aria-label="Разделы сайта">
              {links.map(([to, label]) => (
                <NavLink key={to} to={to} className={({ isActive }) => (isActive ? styles.mobileActiveLink : undefined)}>
                  {label}
                </NavLink>
              ))}
            </nav>

            <div className={styles.mobileMenuActions}>
              {!user && !isAuthLoading ? (
                <>
                  <LinkButton state={authState} to={appRoutes.login()} variant="secondary" fullWidth>
                    Войти
                  </LinkButton>
                  <LinkButton to={appRoutes.subscriptions()} fullWidth>
                    Выбрать тариф
                  </LinkButton>
                </>
              ) : null}

              {user ? (
                <>
                  <LinkButton to={appRoutes.cart()} variant="secondary" fullWidth>
                    Корзина ({cartItems.length})
                  </LinkButton>
                  <LinkButton to={appRoutes.account()} variant="secondary" fullWidth>
                    Профиль
                  </LinkButton>
                  <LinkButton to={appRoutes.accountAppointments()} variant="secondary" fullWidth>
                    Мои записи
                  </LinkButton>
                  {user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? (
                    <LinkButton to={user.role === 'SUPER_ADMIN' ? appRoutes.superAdmin() : appRoutes.admin()} variant="secondary" fullWidth>
                      Админ-панель
                    </LinkButton>
                  ) : null}
                </>
              ) : null}
            </div>
          </aside>
        </div>
      ) : null}

      {showBackLink ? (
        <div className={styles.backRow}>
          <button type="button" onClick={() => navigate(-1)}>
            ← Назад
          </button>
        </div>
      ) : null}

      <Outlet />

      <nav className={styles.bottomNav} aria-label="Быстрая навигация">
        {bottomLinks.map((item) => {
          const isActive = item.match(location.pathname);
          return (
            <NavLink key={item.to} to={item.to} aria-label={item.label} className={isActive ? styles.bottomNavActive : styles.bottomNavLink}>
              <MobileNavIcon name={item.icon} />
              {item.to === appRoutes.cart() && cartItems.length > 0 ? <strong className={styles.bottomBadge}>{cartItems.length}</strong> : null}
            </NavLink>
          );
        })}
        <NavLink
          aria-label={user ? 'Профиль' : 'Войти'}
          className={location.pathname.startsWith('/account') || location.pathname.startsWith('/login') ? styles.bottomNavActive : styles.bottomNavLink}
          state={user ? undefined : authState}
          to={profileRoute}
        >
          <MobileNavIcon name={user ? 'user' : 'login'} />
        </NavLink>
      </nav>

      <footer className={styles.footer}>
        <div className={styles.footerMain}>
          <div>
            <p className={styles.footerBrand}>
              <span className={styles.brandMark} aria-hidden="true">
                <BrandMark />
              </span>
              RelaxUp
            </p>
            <p>{footerText}</p>
          </div>
          <div>
            <h4>Клуб</h4>
            <Link to={appRoutes.studios()}>Студии</Link>
            <Link to={appRoutes.subscriptions()}>Тарифы</Link>
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
            <p>{contactPhone}</p>
            <p>{contactEmail}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function MobileNavIcon({ name }: { name: MobileIconName }) {
  const paths: Record<MobileIconName, string[]> = {
    home: ['M4 10.5 12 4l8 6.5', 'M6 10v9h12v-9', 'M10 19v-5h4v5'],
    cart: ['M6 7h13l-1.4 7.5H8L6.8 4.5H4', 'M9 19a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM17 19a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z'],
    calendar: ['M7 4v3M17 4v3', 'M5 8h14', 'M6.5 5.5h11A1.5 1.5 0 0 1 19 7v11a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 18V7a1.5 1.5 0 0 1 1.5-1.5Z'],
    user: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M5 20c1.3-3.3 3.6-5 7-5s5.7 1.7 7 5'],
    menu: ['M5 7h14M5 12h14M5 17h14'],
    login: ['M14 5h3.5A1.5 1.5 0 0 1 19 6.5v11a1.5 1.5 0 0 1-1.5 1.5H14', 'M5 12h9', 'M11 8.5 14.5 12 11 15.5'],
    building: ['M5.5 20V5.5h8V20', 'M13.5 9.5h5V20', 'M8 8h2M8 11h2M16 13h1'],
    gift: ['M5 10h14v10H5V10Z', 'M12 10v10M4 10h16', 'M8.5 7.5C6 7.5 6 4 8.5 4 11 4 12 8 12 8s1-4 3.5-4S18 7.5 15.5 7.5H8.5Z'],
    star: ['M12 4.5 14.2 9l4.8.7-3.5 3.4.9 4.9-4.4-2.3L7.6 18l.9-4.9L5 9.7 9.8 9 12 4.5Z'],
    'credit-card': ['M4.5 7.5h15v10h-15v-10Z', 'M4.5 10.5h15', 'M7 15h4'],
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {paths[name].map((path) => (
        <path d={path} key={path} />
      ))}
    </svg>
  );
}
