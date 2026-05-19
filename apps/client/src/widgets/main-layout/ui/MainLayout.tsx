import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useGetCartQuery } from '@/entities/cart';
import { appRoutes } from '@/shared/routes';
import styles from './MainLayout.module.css';

const links = [
  [appRoutes.services(), 'Услуги'],
  [appRoutes.subscriptions(), 'Членство'],
  [appRoutes.studios(), 'Студии'],
  [appRoutes.masters(), 'Мастера'],
  [appRoutes.certificates(), 'Сертификаты'],
] as const;

export function MainLayout() {
  const navigate = useNavigate();
  const { isAuthLoading, logout, user } = useAuth();
  const { data: cartItems = [] } = useGetCartQuery(undefined, { skip: !user });
  const logoRoute = user ? appRoutes.account() : appRoutes.home();
  const accountInitial = (user?.fullName?.trim()?.[0] ?? 'Р').toUpperCase();

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
              <NavLink className={styles.ghostButton} to={appRoutes.login()}>
                Войти
              </NavLink>
              <NavLink className={styles.primaryButton} to={appRoutes.subscriptions()}>
                Стать частью клуба
              </NavLink>
            </>
          ) : null}

          {user ? (
            <>
              <NavLink className={styles.cartButton} to={appRoutes.cart()}>
                <span>Корзина</span>
                <strong>{cartItems.length}</strong>
              </NavLink>
              {user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? (
                <NavLink className={styles.ghostButton} to={appRoutes.admin()}>
                  Админ-панель
                </NavLink>
              ) : null}
              <NavLink className={styles.accountLink} to={appRoutes.account()}>
                <span className={styles.avatar} aria-hidden="true">
                  {accountInitial}
                </span>
                <span>Личный кабинет</span>
              </NavLink>
              <button className={styles.ghostButton} type="button" onClick={handleLogout}>
                Выйти
              </button>
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
