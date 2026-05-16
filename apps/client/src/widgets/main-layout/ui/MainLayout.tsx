import { Link, NavLink, Outlet } from 'react-router-dom';
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
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <NavLink to={appRoutes.home()} className={styles.logo}>
          <span aria-hidden="true">♡</span>
          Для себя
        </NavLink>

        <nav className={styles.nav} aria-label="Основная навигация">
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} className={({ isActive }) => (isActive ? styles.activeLink : undefined)}>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.actions}>
          <NavLink className={styles.login} to={appRoutes.auth()}>
            Войти
          </NavLink>
          <NavLink className={styles.primaryButton} to={appRoutes.booking()}>
            Купить подписку
          </NavLink>
        </div>
      </header>

      <Outlet />

      <footer className={styles.footer}>
        <div className={styles.footerMain}>
          <div>
            <p className={styles.footerBrand}>
              <span aria-hidden="true">♡</span>
              Для себя
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
            <Link to={appRoutes.contacts()} className={styles.socials} aria-label="Социальные сети">
              <span>☆</span>
              <span>□</span>
            </Link>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span>© 2024 Dlya Sebya Wellness. Все права защищены.</span>
          <div className={styles.footerPolicies}>
            <Link to={appRoutes.contacts()}>Политика конфиденциальности</Link>
            <Link to={appRoutes.certificates()}>Подарочные сертификаты</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
