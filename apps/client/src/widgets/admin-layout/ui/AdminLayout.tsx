import type { UserRole } from '@massage/shared';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { appRoutes } from '@/shared/routes';
import styles from './AdminLayout.module.css';

type AdminLayoutMode = 'admin' | 'super-admin';

interface AdminNavItem {
  label: string;
  to: string;
  roles: UserRole[];
}

const adminNav: AdminNavItem[] = [
  { label: 'Обзор', to: '/admin/dashboard', roles: ['ADMIN', 'SUPER_ADMIN'] as UserRole[] },
  { label: 'Мастера', to: '/admin/masters', roles: ['ADMIN', 'SUPER_ADMIN'] as UserRole[] },
  { label: 'Студии', to: '/admin/studios', roles: ['ADMIN', 'SUPER_ADMIN'] as UserRole[] },
];

const superAdminNav: AdminNavItem[] = [
  { label: 'Обзор', to: '/super-admin/dashboard', roles: ['SUPER_ADMIN'] as UserRole[] },
  { label: 'Мастера', to: '/super-admin/masters', roles: ['SUPER_ADMIN'] as UserRole[] },
  { label: 'Услуги', to: '/super-admin/services', roles: ['SUPER_ADMIN'] as UserRole[] },
  { label: 'Студии', to: '/super-admin/studios', roles: ['SUPER_ADMIN'] as UserRole[] },
  { label: 'Пользователи', to: '/super-admin/users', roles: ['SUPER_ADMIN'] as UserRole[] },
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
          <span>R</span>
          <div>
            <strong>RelaxUp</strong>
            <small>{title}</small>
          </div>
        </div>
        <nav className={styles.nav} aria-label={title}>
          {nav.map((item) =>
            !user || !item.roles.includes(user.role) ? null : (
              <NavLink className={({ isActive }) => (isActive ? styles.activeLink : undefined)} key={item.to} to={item.to}>
                {item.label}
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
