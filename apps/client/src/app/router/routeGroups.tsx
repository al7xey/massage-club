import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { AccountPage } from '@/pages/account';
import { AccountSettingsPage } from '@/pages/account-settings';
import {
  AdminDashboardPage,
  AdminMasterDetailsPage,
  AdminMastersPage,
  AdminSchedulePage,
  AdminStudiosPage,
  SuperAdminAppointmentsPage,
  SuperAdminAuditLogPage,
  SuperAdminDashboardPage,
  SuperAdminMastersPage,
  SuperAdminServiceDetailsPage,
  SuperAdminServicesPage,
  SuperAdminSiteContentPage,
  SuperAdminUsersPage,
} from '@/pages/admin-crm';
import { AuthPage } from '@/pages/auth';
import { BookingPage } from '@/pages/booking';
import { CartPage } from '@/pages/cart';
import { CertificatesPage } from '@/pages/certificates';
import { ContactsPage } from '@/pages/contacts';
import { HomePage } from '@/pages/home';
import { LoginPage } from '@/pages/login';
import { LegalDocumentsPage } from '@/pages/legal-documents';
import { MastersPage } from '@/pages/masters';
import { MasterDetailsPage } from '@/pages/master-details';
import { MyAppointmentsPage } from '@/pages/my-appointments';
import { MyPaymentsPage } from '@/pages/my-payments';
import { MySubscriptionPage } from '@/pages/my-subscription';
import { RegisterPage } from '@/pages/register';
import { ReviewsPage } from '@/pages/reviews';
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
  { path: 'masters/:id', element: <MasterDetailsPage /> },
  { path: 'subscriptions', element: <SubscriptionPlansPage /> },
  { path: 'studios', element: <StudiosPage /> },
  { path: 'auth', element: <AuthPage /> },
  { path: 'login', element: <LoginPage /> },
  { path: 'register', element: <RegisterPage /> },
  { path: 'certificates', element: <CertificatesPage /> },
  { path: 'contacts', element: <ContactsPage /> },
  { path: 'reviews', element: <ReviewsPage /> },
  { path: 'legal', element: <LegalDocumentsPage /> },
];

export const accountRoutes: AppRouteConfig[] = [
  { path: 'cart', element: <CartPage /> },
  { path: 'booking', element: <BookingPage /> },
  { path: 'account', element: <AccountPage /> },
  { path: 'account/settings', element: <AccountSettingsPage /> },
  { path: 'account/subscription', element: <MySubscriptionPage /> },
  { path: 'account/appointments', element: <MyAppointmentsPage /> },
  { path: 'account/payments', element: <MyPaymentsPage /> },
  { path: 'account/support', element: <SupportTicketsPage /> },
];

export const adminRoutes: AppRouteConfig[] = [
  { index: true, element: <Navigate to="dashboard" replace /> },
  { path: 'dashboard', element: <AdminDashboardPage /> },
  { path: 'masters', element: <AdminMastersPage /> },
  { path: 'masters/:id', element: <AdminMasterDetailsPage /> },
  { path: 'studios', element: <AdminStudiosPage /> },
  { path: 'schedule', element: <AdminSchedulePage /> },
];

export const superAdminRoutes: AppRouteConfig[] = [
  { index: true, element: <Navigate to="dashboard" replace /> },
  { path: 'dashboard', element: <SuperAdminDashboardPage /> },
  { path: 'masters', element: <SuperAdminMastersPage /> },
  { path: 'masters/:id', element: <AdminMasterDetailsPage /> },
  { path: 'services', element: <SuperAdminServicesPage /> },
  { path: 'services/:id', element: <SuperAdminServiceDetailsPage /> },
  { path: 'studios', element: <AdminStudiosPage /> },
  { path: 'schedule', element: <AdminSchedulePage /> },
  { path: 'appointments', element: <SuperAdminAppointmentsPage /> },
  { path: 'users', element: <SuperAdminUsersPage /> },
  { path: 'site-content', element: <SuperAdminSiteContentPage /> },
  { path: 'audit-log', element: <SuperAdminAuditLogPage /> },
];

export { LoginPage, RegisterPage };
