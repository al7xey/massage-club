import { NavLink, Outlet } from 'react-router-dom';
import { appRoutes } from '@/shared/routes';

const links = [
  [appRoutes.services(), 'Услуги'],
  [appRoutes.subscriptions(), 'Членство'],
  [appRoutes.studios(), 'Студии'],
  [appRoutes.masters(), 'Мастера'],
  [appRoutes.certificates(), 'Сертификаты'],
] as const;

export function MainLayout() {
  return (
    <div className="app-shell">
      <div className="layout-frame">
        <header className="header">
          <NavLink to={appRoutes.home()} className="logo">
            <span className="logo-mark" aria-hidden>
              ♡
            </span>
            Для себя
          </NavLink>

          <nav className="nav" aria-label="Основная навигация">
            {links.map(([to, label]) => (
              <NavLink key={to} to={to} end={to === appRoutes.home()}>
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="header-actions">
            <NavLink className="header-login" to={appRoutes.auth()}>
              Войти
            </NavLink>
            <NavLink className="ui-btn ui-btn-primary" to={appRoutes.subscriptions()}>
              Купить подписку
            </NavLink>
          </div>
        </header>

        <Outlet />

        <footer className="footer">
          <div className="footer-main">
            <div>
              <p className="footer-brand">Для себя</p>
              <p>Сеть wellness-клубов с заботой о вашем теле и ментальном здоровье.</p>
            </div>
            <div>
              <h4>Клуб</h4>
              <a href="/about">О клубе</a>
              <a href="/blog">Блог</a>
              <a href="/faq">FAQ</a>
            </div>
            <div>
              <h4>Услуги</h4>
              <a href={appRoutes.services()}>Массаж</a>
              <a href={appRoutes.services()}>SPA-программы</a>
              <a href={appRoutes.services()}>Уход за лицом</a>
            </div>
            <div>
              <h4>Контакты</h4>
              <p>8 (800) 555-35-35</p>
              <p>hello@dlyasebya.ru</p>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2024 Dlya Sebya Wellness. Все права защищены.</span>
            <div className="footer-policies">
              <a href="/privacy">Политика конфиденциальности</a>
              <a href="/offer">Публичная оферта</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
