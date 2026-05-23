import { useEffect, useId, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { useGetCartQuery } from '@/entities/cart';
import { getSiteContentText, useGetPublicSiteContentQuery } from '@/entities/site-content';
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

const secondaryLinks = [
  [appRoutes.reviews(), 'Отзывы'],
  [appRoutes.contacts(), 'Контакты'],
  [appRoutes.legal(), 'Документы'],
] as const;

const bottomLinks = [
  [appRoutes.services(), 'Услуги', 'services'],
  [appRoutes.subscriptions(), 'Клуб', 'club'],
  [appRoutes.studios(), 'Студии', 'studios'],
  [appRoutes.masters(), 'Мастера', 'masters'],
] as const;

export function MainLayout() {
  const location = useLocation();
  const mobileMenuId = useId();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthLoading, user } = useAuth();
  const { data: cartItems = [] } = useGetCartQuery(undefined, { skip: !user });
  const { data: siteContent = [] } = useGetPublicSiteContentQuery();
  const logoRoute = user ? appRoutes.account() : appRoutes.home();
  const accountInitial = (user?.fullName?.trim()?.[0] ?? 'Р').toUpperCase();
  const authState = { backgroundLocation: location, from: location.pathname };
  const footerText = getSiteContentText(siteContent, 'site.footer.text', 'Wellness-клуб с подпиской на массаж, SPA и уходовые процедуры.');
  const contactPhone = getSiteContentText(siteContent, 'site.contacts.phone', '8 (800) 555-35-35');
  const contactEmail = getSiteContentText(siteContent, 'site.contacts.email', 'hello@dlyasebya.ru');

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname, location.search]);

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
                  <svg className={styles.cartIcon} width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.5 15.5L9.5 12" stroke="currentColor" strokeLinecap="round" />
                    <path d="M8.5 6.5L6.5 9.5M15.5 6.5L17.5 9.5" stroke="currentColor" strokeLinecap="round" />
                    <path d="M13.5 15.5L14.5 12" stroke="currentColor" strokeLinecap="round" />
                    <path d="M4.5 9.5C5.08429 9.5 5.59018 9.90581 5.71693 10.4762L6.80394 15.3677C7.13763 16.8694 7.30448 17.6202 7.85289 18.0601C8.4013 18.5 9.17043 18.5 10.7087 18.5H13.2913C14.8296 18.5 15.5987 18.5 16.1471 18.0601C16.6955 17.6202 16.8624 16.8694 17.1961 15.3677L18.2831 10.4762C18.4098 9.90581 18.9157 9.5 19.5 9.5" stroke="currentColor" strokeLinecap="round" />
                    <path d="M3.5 9.5H20.5" stroke="currentColor" strokeLinecap="round" />
                  </svg>
                  <strong className={styles.cartBadge}>{cartItems.length}</strong>
                </LinkButton>
                {user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? (
                  <LinkButton to={user.role === 'SUPER_ADMIN' ? appRoutes.superAdmin() : appRoutes.admin()} variant="secondary" size="sm">
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
                    {user.avatarUrl ? <img src={user.avatarUrl} alt="" /> : accountInitial}
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
              {[...links, ...secondaryLinks].map(([to, label]) => (
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
                    Стать частью клуба
                  </LinkButton>
                </>
              ) : null}

              {user ? (
                <>
                  <LinkButton to={appRoutes.cart()} variant="secondary" fullWidth>
                    Корзина ({cartItems.length})
                  </LinkButton>
                  <LinkButton to={appRoutes.account()} variant="secondary" fullWidth>
                    Личный кабинет
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

      <Outlet />

      <nav className={styles.bottomNav} aria-label="Быстрая навигация">
        {bottomLinks.map(([to, label, icon]) => (
          <NavLink
            key={to}
            to={to}
            aria-label={label}
            className={({ isActive }) => (isActive ? styles.bottomNavActive : styles.bottomNavLink)}
          >
            <MobileNavIcon name={icon} />
            <span>{label}</span>
          </NavLink>
        ))}
        {!user && !isAuthLoading ? (
          <NavLink
            aria-label="Войти"
            className={({ isActive }) => (isActive ? styles.bottomNavActive : styles.bottomNavLink)}
            state={authState}
            to={appRoutes.login()}
          >
            <MobileNavIcon name="login" />
            <span>Войти</span>
          </NavLink>
        ) : (
          <button
            className={styles.bottomNavMenuButton}
            type="button"
            aria-label="Открыть меню"
            aria-expanded={isMobileMenuOpen}
            aria-controls={mobileMenuId}
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <MobileNavIcon name="menu" />
            <span>Ещё</span>
          </button>
        )}
      </nav>

      <footer className={styles.footer}>
        <div className={styles.footerMain}>
          <div>
            <p className={styles.footerBrand}>
              <span className={styles.brandMark} aria-hidden="true">
                <img src={brandLogo} alt="" />
              </span>
              RelaxUp
            </p>
            <p>{footerText}</p>
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
            <p>{contactPhone}</p>
            <p>{contactEmail}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function MobileNavIcon({ name }: { name: (typeof bottomLinks)[number][2] | 'login' | 'menu' }) {
  if (name === 'services') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3.5L13.8 8l4.7 1.7-4.7 1.8L12 16l-1.8-4.5-4.7-1.8L10.2 8 12 3.5Z" />
        <path d="M18 15l.9 2.1L21 18l-2.1.9L18 21l-.9-2.1L15 18l2.1-.9L18 15Z" />
      </svg>
    );
  }

  if (name === 'club') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 7.5A2.5 2.5 0 0 1 7.5 5h9A2.5 2.5 0 0 1 19 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 16.5v-9Z" />
        <path d="M8 9h8M8 13h5" />
      </svg>
    );
  }

  if (name === 'studios') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 21s6-5.2 6-11a6 6 0 0 0-12 0c0 5.8 6 11 6 11Z" />
        <path d="M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
      </svg>
    );
  }

  if (name === 'masters') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 5.5 14 9l3.8.6-2.7 2.6.6 3.8-3.7-2-3.7 2 .6-3.8L6.2 9.6 10 9l2-3.5Z" />
        <path d="M7 19h10" />
      </svg>
    );
  }

  if (name === 'login') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14 5h3.5A1.5 1.5 0 0 1 19 6.5v11a1.5 1.5 0 0 1-1.5 1.5H14" />
        <path d="M5 12h9" />
        <path d="M11 8.5 14.5 12 11 15.5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 7h14M5 12h14M5 17h14" />
    </svg>
  );
}
