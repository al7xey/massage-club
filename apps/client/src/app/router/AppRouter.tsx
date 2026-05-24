import type { UserRole } from '@massage/shared';
import { useLayoutEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { appRoutes } from '@/shared/routes';
import { AdminLayout, SuperAdminLayout } from '@/widgets/admin-layout';
import { MainLayout } from '@/widgets/main-layout';
import { accountRoutes, adminRoutes, publicRoutes, superAdminRoutes, type AppRouteConfig } from './routeGroups';

export function AppRouter() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<MainLayout />}>
          {publicRoutes.map(renderRoute)}

          <Route element={<ProtectedRoute allowedRoles={['CLIENT', 'ADMIN', 'SUPER_ADMIN'] as UserRole[]} />}>
            {accountRoutes.map(renderRoute)}
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN'] as UserRole[]} />}>
          <Route path="admin" element={<AdminLayout mode="admin" />}>
            {adminRoutes.map(renderRoute)}
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN'] as UserRole[]} />}>
          <Route path="super-admin" element={<SuperAdminLayout />}>
            {superAdminRoutes.map(renderRoute)}
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={appRoutes.home()} replace />} />
      </Routes>
    </>
  );
}

function renderRoute(route: AppRouteConfig) {
  if ('index' in route) {
    return <Route key="index" index element={route.element} />;
  }

  return <Route key={route.path} path={route.path} element={route.element} />;
}

function ScrollToTop() {
  const { key, pathname } = useLocation();

  useLayoutEffect(() => {
    const scrollRoot = document.querySelector<HTMLElement>('[data-app-scroll-root]');
    scrollRoot?.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [key, pathname]);

  return null;
}
