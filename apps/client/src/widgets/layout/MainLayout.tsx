import { NavLink, Outlet } from 'react-router-dom';

const links = [
  ['/', 'Главная'],
  ['/services', 'Услуги'],
  ['/subscriptions', 'Подписки'],
  ['/studios', 'Студии'],
  ['/booking', 'Запись'],
  ['/certificates', 'Сертификаты'],
  ['/account', 'Кабинет'],
  ['/admin', 'Админ'],
];

export function MainLayout() {
  return (
    <div className="app-shell">
      <header className="header">
        <NavLink to="/" className="logo">Massage Club</NavLink>
        <nav className="nav" aria-label="Основная навигация">
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'}>
              {label}
            </NavLink>
          ))}
        </nav>
      </header>
      <Outlet />
    </div>
  );
}
