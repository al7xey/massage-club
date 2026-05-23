import type { UserRole } from '@massage/shared';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { ForbiddenPage } from '@/pages/forbidden';
import { appRoutes } from '@/shared/routes';

interface RoleBasedRouteProps {
  allowedRoles?: UserRole[];
}

export function RoleBasedRoute({ allowedRoles }: RoleBasedRouteProps) {
  const { isAuthLoading, user } = useAuth();
  const location = useLocation();

  if (isAuthLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to={appRoutes.login()} state={{ from: location.pathname }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <ForbiddenPage />;
  }

  return <Outlet />;
}

export function ProtectedRoute(props: RoleBasedRouteProps) {
  return <RoleBasedRoute {...props} />;
}
