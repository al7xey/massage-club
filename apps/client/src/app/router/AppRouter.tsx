import type { UserRole } from '@massage/shared';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Location, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { appRoutes } from '@/shared/routes';
import { AdminLayout, SuperAdminLayout } from '@/widgets/admin-layout';
import { MainLayout } from '@/widgets/main-layout';
import { LoginPage, RegisterPage, accountRoutes, adminRoutes, publicRoutes, superAdminRoutes, type AppRouteConfig } from './routeGroups';

export function AppRouter() {
  const location = useLocation();
  const state = location.state as { backgroundLocation?: Location } | null;
  const backgroundLocation = state?.backgroundLocation;
  const isAuthRoute = location.pathname === appRoutes.login() || location.pathname === appRoutes.register();
  const isMobileViewport = useIsMobileViewport();
  const renderAuthAsPage = isAuthRoute && isMobileViewport;
  const lastContentLocationRef = useRef<Location>(location);
  const hasContentLocationRef = useRef(!isAuthRoute);

  useEffect(() => {
    if (!isAuthRoute || renderAuthAsPage) {
      lastContentLocationRef.current = location;
      hasContentLocationRef.current = true;
    }
  }, [isAuthRoute, location, renderAuthAsPage]);

  const routesLocation =
    renderAuthAsPage
      ? location
      : (backgroundLocation ??
        (isAuthRoute
          ? hasContentLocationRef.current
            ? lastContentLocationRef.current
            : {
                ...location,
                hash: '',
                pathname: appRoutes.home(),
                search: '',
              }
          : location));

  return (
    <>
      <ScrollToTop />
      <Routes location={routesLocation}>
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

      {!renderAuthAsPage && (backgroundLocation || isAuthRoute) ? (
        <Routes>
          <Route path={appRoutes.login()} element={<LoginPage />} />
          <Route path={appRoutes.register()} element={<RegisterPage />} />
        </Routes>
      ) : null}
    </>
  );
}

function useIsMobileViewport() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia('(max-width: 760px)').matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 760px)');
    const update = () => setIsMobile(mediaQuery.matches);

    update();
    mediaQuery.addEventListener('change', update);

    return () => {
      mediaQuery.removeEventListener('change', update);
    };
  }, []);

  return isMobile;
}

function renderRoute(route: AppRouteConfig) {
  if ('index' in route) {
    return <Route key="index" index element={route.element} />;
  }

  return <Route key={route.path} path={route.path} element={route.element} />;
}

function ScrollToTop() {
  const { key, pathname } = useLocation();
  const isAuthRoute = pathname === appRoutes.login() || pathname === appRoutes.register();

  useLayoutEffect(() => {
    if (isAuthRoute) {
      return;
    }
    const scrollRoot = document.querySelector<HTMLElement>('[data-app-scroll-root]');
    scrollRoot?.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [isAuthRoute, key, pathname]);

  return null;
}
