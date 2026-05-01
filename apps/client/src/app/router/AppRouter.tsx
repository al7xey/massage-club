import { Navigate, Route, Routes } from 'react-router-dom';
import { MainLayout } from '@/widgets/layout/MainLayout';
import { AccountPage } from '@/pages/account/AccountPage';
import { MyAppointmentsPage } from '@/pages/account/MyAppointmentsPage';
import { MyPaymentsPage } from '@/pages/account/MyPaymentsPage';
import { MySubscriptionPage } from '@/pages/account/MySubscriptionPage';
import { SupportTicketsPage } from '@/pages/account/SupportTicketsPage';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminSectionPage } from '@/pages/admin/AdminSectionPage';
import { AuthPage } from '@/pages/public/AuthPage';
import { BookingPage } from '@/pages/public/BookingPage';
import { CertificatesPage } from '@/pages/public/CertificatesPage';
import { HomePage } from '@/pages/public/HomePage';
import { ServiceDetailsPage } from '@/pages/public/ServiceDetailsPage';
import { ServicesCatalogPage } from '@/pages/public/ServicesCatalogPage';
import { StudiosPage } from '@/pages/public/StudiosPage';
import { SubscriptionPlansPage } from '@/pages/public/SubscriptionPlansPage';

export function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="services" element={<ServicesCatalogPage />} />
        <Route path="services/:id" element={<ServiceDetailsPage />} />
        <Route path="subscriptions" element={<SubscriptionPlansPage />} />
        <Route path="studios" element={<StudiosPage />} />
        <Route path="booking" element={<BookingPage />} />
        <Route path="auth" element={<AuthPage />} />
        <Route path="certificates" element={<CertificatesPage />} />
        <Route path="account" element={<AccountPage />} />
        <Route path="account/subscription" element={<MySubscriptionPage />} />
        <Route path="account/appointments" element={<MyAppointmentsPage />} />
        <Route path="account/payments" element={<MyPaymentsPage />} />
        <Route path="account/support" element={<SupportTicketsPage />} />
        <Route path="admin" element={<AdminDashboardPage />} />
        <Route path="admin/:section" element={<AdminSectionPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
