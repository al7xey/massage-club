import { useLayoutEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AccountPage } from '@/pages/account';
import { AdminDashboardPage } from '@/pages/admin-dashboard';
import { AdminSectionPage } from '@/pages/admin-section';
import { AuthPage } from '@/pages/auth';
import { BookingPage } from '@/pages/booking';
import { CartPage } from '@/pages/cart';
import { CertificatesPage } from '@/pages/certificates';
import { ContactsPage } from '@/pages/contacts';
import { HomePage } from '@/pages/home';
import { LoginPage } from '@/pages/login';
import { MastersPage } from '@/pages/masters';
import { MyAppointmentsPage } from '@/pages/my-appointments';
import { MyPaymentsPage } from '@/pages/my-payments';
import { MySubscriptionPage } from '@/pages/my-subscription';
import { RegisterPage } from '@/pages/register';
import { ServiceDetailsPage } from '@/pages/service-details';
import { ServicesCatalogPage } from '@/pages/services-catalog';
import { StudiosPage } from '@/pages/studios';
import { SubscriptionPlansPage } from '@/pages/subscription-plans';
import { SupportTicketsPage } from '@/pages/support-tickets';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { appRoutes } from '@/shared/routes';
import { MainLayout } from '@/widgets/main-layout';

export function AppRouter() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="services" element={<ServicesCatalogPage />} />
          <Route path="services/:id" element={<ServiceDetailsPage />} />
          <Route path="masters" element={<MastersPage />} />
          <Route path="subscriptions" element={<SubscriptionPlansPage />} />
          <Route path="studios" element={<StudiosPage />} />
          <Route path="auth" element={<AuthPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="certificates" element={<CertificatesPage />} />
          <Route path="contacts" element={<ContactsPage />} />

          <Route element={<ProtectedRoute allowedRoles={['CLIENT', 'ADMIN', 'SUPER_ADMIN']} />}>
            <Route path="cart" element={<CartPage />} />
            <Route path="booking" element={<BookingPage />} />
            <Route path="account" element={<AccountPage />} />
            <Route path="account/subscription" element={<MySubscriptionPage />} />
            <Route path="account/appointments" element={<MyAppointmentsPage />} />
            <Route path="account/payments" element={<MyPaymentsPage />} />
            <Route path="account/support" element={<SupportTicketsPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']} />}>
            <Route path="admin" element={<AdminDashboardPage />} />
            <Route path="admin/:section" element={<AdminSectionPage />} />
          </Route>

          <Route path="*" element={<Navigate to={appRoutes.home()} replace />} />
        </Route>
      </Routes>
    </>
  );
}

function ScrollToTop() {
  const { key, pathname } = useLocation();

  useLayoutEffect(() => {
    const scrollRoot = document.querySelector<HTMLElement>('[data-app-scroll-root]');
    scrollRoot?.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [key, pathname]);

  return null;
}
