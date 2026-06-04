import type { UserRole } from '@massage/shared';
import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { ForbiddenPage } from '@/pages/forbidden';
import { API_BASE_URL } from '@/shared/config/env';
import { appRoutes } from '@/shared/routes';
import { tokenStorage } from '@/shared/lib/storage/tokenStorage';

interface RoleBasedRouteProps {
  allowedRoles?: UserRole[];
}

export function RoleBasedRoute({ allowedRoles }: RoleBasedRouteProps) {
  const { isAuthLoading, user } = useAuth();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const yandexCode = searchParams.get('code');

  if (isAuthLoading) {
    return null;
  }

  if (!user && yandexCode && location.pathname === appRoutes.account()) {
    return <YandexOAuthCallback code={yandexCode} />;
  }

  if (!user) {
    return <Navigate to={appRoutes.login()} state={{ from: `${location.pathname}${location.search}` }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <ForbiddenPage />;
  }

  return <Outlet />;
}

export function ProtectedRoute(props: RoleBasedRouteProps) {
  return <RoleBasedRoute {...props} />;
}

function YandexOAuthCallback({ code }: { code: string }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const exchange = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/yandex/exchange`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          throw new Error(response.statusText);
        }

        const payload = (await response.json()) as { accessToken?: string; refreshToken?: string };
        if (!payload.accessToken || !payload.refreshToken) {
          throw new Error('Yandex auth did not return tokens');
        }

        tokenStorage.setTokens({
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken,
        });
        window.location.replace(appRoutes.account());
      } catch {
        if (isMounted) {
          setFailed(true);
        }
      }
    };

    void exchange();

    return () => {
      isMounted = false;
    };
  }, [code]);

  if (failed) {
    return <Navigate to={appRoutes.login()} state={{ from: appRoutes.account() }} replace />;
  }

  return null;
}
