import type { UserRole } from '@massage/shared';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { Location, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { appRoutes } from '@/shared/routes';
import { MainLayout } from '@/widgets/main-layout';
import { LoginPage, RegisterPage, accountRoutes, adminRoutes, publicRoutes, type AppRouteConfig } from './routeGroups';

export function AppRouter() {
  const location = useLocation();
  const state = location.state as { backgroundLocation?: Location } | null;
  const backgroundLocation = state?.backgroundLocation;
  const isAuthRoute = location.pathname === appRoutes.login() || location.pathname === appRoutes.register();
  const lastContentLocationRef = useRef<Location>(location);
  const hasContentLocationRef = useRef(!isAuthRoute);

  useEffect(() => {
    if (!isAuthRoute) {
      lastContentLocationRef.current = location;
      hasContentLocationRef.current = true;
    }
  }, [isAuthRoute, location]);

  const routesLocation =
    backgroundLocation ??
    (isAuthRoute
      ? hasContentLocationRef.current
        ? lastContentLocationRef.current
        : {
            ...location,
            hash: '',
            pathname: appRoutes.home(),
            search: '',
          }
      : location);

  return (
    <>
      <ScrollToTop />
      <Routes location={routesLocation}>
        <Route element={<MainLayout />}>
          {publicRoutes.map(renderRoute)}

          <Route element={<ProtectedRoute allowedRoles={['CLIENT', 'ADMIN', 'SUPER_ADMIN'] as UserRole[]} />}>
            {accountRoutes.map(renderRoute)}
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN'] as UserRole[]} />}>
            {adminRoutes.map(renderRoute)}
          </Route>

          <Route path="*" element={<Navigate to={appRoutes.home()} replace />} />
        </Route>
      </Routes>

      {backgroundLocation || isAuthRoute ? (
        <Routes>
          <Route path={appRoutes.login()} element={<LoginPage />} />
          <Route path={appRoutes.register()} element={<RegisterPage />} />
        </Routes>
      ) : null}
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
