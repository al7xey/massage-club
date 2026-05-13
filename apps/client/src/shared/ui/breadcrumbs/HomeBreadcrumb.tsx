import { Link } from 'react-router-dom';
import { appRoutes } from '@/shared/routes';

export function HomeBreadcrumb() {
  return (
    <p className="home-crumb">
      <Link to={appRoutes.home()}>Главная</Link>
    </p>
  );
}
