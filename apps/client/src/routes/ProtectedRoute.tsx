import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { appRoutes } from '@/shared/routes';

type UserRole = 'CLIENT' | 'ADMIN' | 'SUPER_ADMIN';

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
    return <Navigate to={appRoutes.login()} state={{ from: location.pathname }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={appRoutes.login()} state={{ denied: true, from: location.pathname }} replace />;
  }

  return <Outlet />;
}
