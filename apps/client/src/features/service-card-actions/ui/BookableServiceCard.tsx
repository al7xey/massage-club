import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { pendingCartStorage, useAddCartItemMutation, useGetCartQuery } from '@/entities/cart';
import { ServiceCard, type ServiceCardModel } from '@/entities/service';
import { appRoutes } from '@/shared/routes';

interface BookableServiceCardProps {
  service: ServiceCardModel;
}

export function BookableServiceCard({ service }: BookableServiceCardProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: cartItems = [] } = useGetCartQuery(undefined, { skip: !user });
  const [addCartItem, { isLoading }] = useAddCartItemMutation();
  const detailsPath = appRoutes.serviceDetails(service.id);
  const cartCount = cartItems.filter((item) => item.service.id === service.id).length;

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
      pendingCartStorage.set(service.id);
      navigateToAuth('cart');
      return;
    }

    await addCartItem({ serviceId: service.id }).unwrap();
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
      cartCount={cartCount}
      isActionDisabled={isLoading}
      service={service}
      onAddToCart={handleAddToCart}
      onBook={handleBook}
    />
  );
}
