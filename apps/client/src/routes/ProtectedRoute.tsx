import type { UserRole } from '@massage/shared';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { appRoutes } from '@/shared/routes';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthLoading, user } = useAuth();
  const location = useLocation();

  if (isAuthLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to={appRoutes.login()} state={{ backgroundLocation: location, from: location.pathname }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={appRoutes.login()} state={{ backgroundLocation: location, denied: true, from: location.pathname }} replace />;
  }

  return <Outlet />;
}
