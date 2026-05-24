import type { UserRole } from '@massage/shared';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { appRoutes } from '@/shared/routes';
import { BrandMark } from '@/shared/ui';
import styles from './AdminLayout.module.css';

type AdminLayoutMode = 'admin' | 'super-admin';
type AdminIconName =
  | 'home'
  | 'calendar'
  | 'clipboard'
  | 'users'
  | 'cart'
  | 'user'
  | 'gift'
  | 'settings'
  | 'credit-card'
  | 'repeat'
  | 'wallet'
  | 'chart'
  | 'building'
  | 'roles';

interface AdminNavItem {
  icon: AdminIconName;
  label: string;
  to: string;
  roles: UserRole[];
}

const adminNav: AdminNavItem[] = [
  { icon: 'home', label: 'Обзор', to: '/admin/dashboard', roles: ['ADMIN', 'SUPER_ADMIN'] as UserRole[] },
  { icon: 'calendar', label: 'Расписание', to: '/admin/schedule', roles: ['ADMIN', 'SUPER_ADMIN'] as UserRole[] },
  { icon: 'clipboard', label: 'Записи', to: '/admin/appointments', roles: ['ADMIN', 'SUPER_ADMIN'] as UserRole[] },
  { icon: 'roles', label: 'Пользователи и роли', to: '/admin/users', roles: ['ADMIN', 'SUPER_ADMIN'] as UserRole[] },
  { icon: 'cart', label: 'Услуги', to: '/admin/services', roles: ['ADMIN', 'SUPER_ADMIN'] as UserRole[] },
  { icon: 'user', label: 'Мастера', to: '/admin/masters', roles: ['ADMIN', 'SUPER_ADMIN'] as UserRole[] },
  { icon: 'gift', label: 'Сертификаты', to: '/admin/certificates', roles: ['ADMIN', 'SUPER_ADMIN'] as UserRole[] },
  { icon: 'clipboard', label: 'Обращения', to: '/admin/requests', roles: ['ADMIN', 'SUPER_ADMIN'] as UserRole[] },
];

const superAdminNav: AdminNavItem[] = [
  { icon: 'home', label: 'Обзор сети', to: '/super-admin/dashboard', roles: ['SUPER_ADMIN'] as UserRole[] },
  { icon: 'building', label: 'Студии', to: '/super-admin/studios', roles: ['SUPER_ADMIN'] as UserRole[] },
  { icon: 'calendar', label: 'Расписание', to: '/super-admin/schedule', roles: ['SUPER_ADMIN'] as UserRole[] },
  { icon: 'clipboard', label: 'Записи', to: '/super-admin/appointments', roles: ['SUPER_ADMIN'] as UserRole[] },
  { icon: 'roles', label: 'Пользователи и роли', to: '/super-admin/users', roles: ['SUPER_ADMIN'] as UserRole[] },
  { icon: 'cart', label: 'Услуги', to: '/super-admin/services', roles: ['SUPER_ADMIN'] as UserRole[] },
  { icon: 'user', label: 'Мастера', to: '/super-admin/masters', roles: ['SUPER_ADMIN'] as UserRole[] },
  { icon: 'credit-card', label: 'Тарифы', to: '/super-admin/tariffs', roles: ['SUPER_ADMIN'] as UserRole[] },
  { icon: 'gift', label: 'Сертификаты', to: '/super-admin/certificates', roles: ['SUPER_ADMIN'] as UserRole[] },
];

export function AdminLayout({ mode }: { mode: AdminLayoutMode }) {
  const { logout, user, userDisplayName } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const nav = mode === 'super-admin' ? superAdminNav : adminNav;
  const title = mode === 'super-admin' ? 'Super Admin' : 'Admin';
  const section = resolveSectionTitle(location.pathname, nav);

  const handleLogout = async () => {
    await logout();
    navigate(appRoutes.login(), { replace: true });
  };

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true">
            <BrandMark />
          </span>
          <div>
            <strong>RelaxUp</strong>
            <small>{title}</small>
          </div>
        </div>
        <nav className={styles.nav} aria-label={title}>
          {nav.map((item) =>
            !user || !item.roles.includes(user.role) ? null : (
              <NavLink className={({ isActive }) => (isActive ? styles.activeLink : undefined)} key={item.to} to={item.to}>
                <LineIcon name={item.icon} />
                <span>{item.label}</span>
              </NavLink>
            ),
          )}
        </nav>
        <button className={styles.logout} type="button" onClick={() => void handleLogout()}>
          Выйти
        </button>
      </aside>
      <div className={styles.workspace}>
        <header className={styles.topbar}>
          <div>
            <span>{mode === 'super-admin' ? 'Супер-админ панель' : 'Админ панель'}</span>
            <h1>{section}</h1>
          </div>
          <div className={styles.user}>
            <small>{user?.role}</small>
            <strong>{userDisplayName}</strong>
          </div>
        </header>
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function SuperAdminLayout() {
  return <AdminLayout mode="super-admin" />;
}

function resolveSectionTitle(pathname: string, nav: AdminNavItem[]) {
  const item = nav
    .filter((entry) => pathname === entry.to || pathname.startsWith(`${entry.to}/`))
    .sort((left, right) => right.to.length - left.to.length)[0];
  return item?.label ?? 'Обзор';
}

function LineIcon({ name }: { name: AdminIconName }) {
  const paths: Record<AdminIconName, string[]> = {
    home: ['M4 10.5 12 4l8 6.5', 'M6 10v9h12v-9', 'M10 19v-5h4v5'],
    calendar: ['M7 4v3M17 4v3', 'M5 8h14', 'M6.5 5.5h11A1.5 1.5 0 0 1 19 7v11a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 18V7a1.5 1.5 0 0 1 1.5-1.5Z'],
    clipboard: ['M9 5.5h6', 'M9 12h6M9 15.5h4', 'M8 4.5h8A1.5 1.5 0 0 1 17.5 6v12A1.5 1.5 0 0 1 16 19.5H8A1.5 1.5 0 0 1 6.5 18V6A1.5 1.5 0 0 1 8 4.5Z'],
    users: ['M8.5 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z', 'M15.5 11a2.5 2.5 0 1 0 0-5', 'M3.8 18.5c1-2.8 2.7-4.2 4.7-4.2s3.7 1.4 4.7 4.2', 'M13.8 15c1.8.2 3.2 1.4 4.4 3.5'],
    cart: ['M6 7h13l-1.4 7.5H8L6.8 4.5H4', 'M9 19a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM17 19a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z'],
    user: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M5 20c1.3-3.3 3.6-5 7-5s5.7 1.7 7 5'],
    gift: ['M5 10h14v10H5V10Z', 'M12 10v10M4 10h16', 'M8.5 7.5C6 7.5 6 4 8.5 4 11 4 12 8 12 8s1-4 3.5-4S18 7.5 15.5 7.5H8.5Z'],
    settings: ['M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z', 'M12 3.5v2M12 18.5v2M4.6 7l1.7 1M17.7 16l1.7 1M4.6 17l1.7-1M17.7 8l1.7-1M3.5 12h2M18.5 12h2'],
    'credit-card': ['M4.5 7.5h15v10h-15v-10Z', 'M4.5 10.5h15', 'M7 15h4'],
    repeat: ['M17 7H8.5a4 4 0 0 0-3.7 2.5', 'M14.5 4.5 17 7l-2.5 2.5', 'M7 17h8.5a4 4 0 0 0 3.7-2.5', 'M9.5 19.5 7 17l2.5-2.5'],
    wallet: ['M4.5 7.5h14A1.5 1.5 0 0 1 20 9v9a1.5 1.5 0 0 1-1.5 1.5h-14A1.5 1.5 0 0 1 3 18V7a2.5 2.5 0 0 1 2.5-2.5H17', 'M15.5 13.5H20', 'M16.5 13.5h.1'],
    chart: ['M5 19V5', 'M5 19h14', 'M8.5 15v-4M12 15V8M15.5 15v-6'],
    building: ['M5.5 20V5.5h8V20', 'M13.5 9.5h5V20', 'M8 8h2M8 11h2M8 14h2M16 13h1'],
    roles: ['M9.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z', 'M4 19c1.2-3.3 3-5 5.5-5 1.2 0 2.2.3 3.1.9', 'M16.5 14v5M14 16.5h5'],
  };

  return (
    <svg className={styles.navIcon} viewBox="0 0 24 24" aria-hidden="true">
      {paths[name].map((path) => (
        <path d={path} key={path} />
      ))}
    </svg>
  );
}
