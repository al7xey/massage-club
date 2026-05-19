import { demoServices } from '@/data/mockData';
import { appointmentService } from './appointmentService';
import { authService } from './authService';
import { certificateService } from './certificateService';
import { paymentService } from './paymentService';
import { subscriptionService } from './subscriptionService';

export const adminService = {
  getSummary() {
    const users = authService.getUsers();
    const subscriptions = subscriptionService.getAllSubscriptions();
    const appointments = appointmentService.getAllAppointments();
    const certificates = certificateService.getAllCertificates();
    const payments = paymentService.getAllPayments();

    return {
      users,
      services: demoServices,
      subscriptions,
      appointments,
      certificates,
      totalUsers: users.length,
      activeSubscriptions: subscriptions.filter((subscription) => subscription.status === 'active').length,
      totalAppointments: appointments.length,
      totalSalesRub: payments.reduce((sum, payment) => sum + (payment.status === 'paid' ? payment.amountRub : 0), 0),
    };
  },
};
