import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { useAddCartItemMutation } from '@/entities/cart';
import { ServiceCard, type ServiceCardModel } from '@/entities/service';
import { appRoutes } from '@/shared/routes';

interface BookableServiceCardProps {
  service: ServiceCardModel;
}

export function BookableServiceCard({ service }: BookableServiceCardProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [addCartItem, { isLoading }] = useAddCartItemMutation();
  const detailsPath = appRoutes.serviceDetails(service.id);

  const navigateToAuth = (action: 'book' | 'cart') => {
    navigate(appRoutes.login(), {
      state: {
        action,
        backgroundLocation: location,
        from: detailsPath,
        serviceId: service.id,
      },
    });
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigateToAuth('cart');
      return;
    }

    await addCartItem({ serviceId: service.id }).unwrap();
    navigate(appRoutes.cart());
  };

  const handleBook = async () => {
    if (!user) {
      navigateToAuth('book');
      return;
    }

    await addCartItem({ serviceId: service.id }).unwrap();
    navigate(`${appRoutes.booking()}?serviceId=${service.id}`);
  };

  return (
    <ServiceCard
      isActionDisabled={isLoading}
      service={service}
      onAddToCart={handleAddToCart}
      onBook={handleBook}
    />
  );
}
