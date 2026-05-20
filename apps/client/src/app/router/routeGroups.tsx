import type { ReactNode } from 'react';
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
import { LegalDocumentsPage } from '@/pages/legal-documents';
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

export type AppRouteConfig = { index: true; element: ReactNode } | { path: string; element: ReactNode };

export const publicRoutes: AppRouteConfig[] = [
  { index: true, element: <HomePage /> },
  { path: 'services', element: <ServicesCatalogPage /> },
  { path: 'services/:id', element: <ServiceDetailsPage /> },
  { path: 'masters', element: <MastersPage /> },
  { path: 'subscriptions', element: <SubscriptionPlansPage /> },
  { path: 'studios', element: <StudiosPage /> },
  { path: 'auth', element: <AuthPage /> },
  { path: 'login', element: <LoginPage /> },
  { path: 'register', element: <RegisterPage /> },
  { path: 'certificates', element: <CertificatesPage /> },
  { path: 'contacts', element: <ContactsPage /> },
  { path: 'legal', element: <LegalDocumentsPage /> },
];

export const accountRoutes: AppRouteConfig[] = [
  { path: 'cart', element: <CartPage /> },
  { path: 'booking', element: <BookingPage /> },
  { path: 'account', element: <AccountPage /> },
  { path: 'account/subscription', element: <MySubscriptionPage /> },
  { path: 'account/appointments', element: <MyAppointmentsPage /> },
  { path: 'account/payments', element: <MyPaymentsPage /> },
  { path: 'account/support', element: <SupportTicketsPage /> },
];

export const adminRoutes: AppRouteConfig[] = [
  { path: 'admin', element: <AdminDashboardPage /> },
  { path: 'admin/:section', element: <AdminSectionPage /> },
];

export { LoginPage, RegisterPage };
