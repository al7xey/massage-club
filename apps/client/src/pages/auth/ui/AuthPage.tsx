import { Navigate, useLocation } from 'react-router-dom';
import { appRoutes } from '@/shared/routes';

export function AuthPage() {
  const location = useLocation();

  return <Navigate to={appRoutes.login()} state={{ backgroundLocation: location, from: location.pathname }} replace />;
}
