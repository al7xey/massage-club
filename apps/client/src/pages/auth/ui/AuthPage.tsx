import { Navigate } from 'react-router-dom';
import { appRoutes } from '@/shared/routes';

export function AuthPage() {
  return <Navigate to={appRoutes.login()} replace />;
}
