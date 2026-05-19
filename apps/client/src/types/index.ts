export type UserRole = 'guest' | 'client' | 'admin' | 'superadmin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Exclude<UserRole, 'guest'>;
  createdAt: string;
}

export interface Service {
  id: string;
  title: string;
  slug?: string;
  description: string;
  durationMinutes: number;
  priceRub: number;
}

export interface Studio {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
}

export interface Master {
  id: string;
  firstName: string;
  lastName: string;
  bio: string;
  studio: Studio;
  services: Service[];
  isActive: boolean;
}

export type SubscriptionPlanType = 'individual' | 'family';
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled';

export interface SubscriptionPlan {
  id: string;
  code: string;
  name: string;
  priceRub: number;
  periodDays: number;
  includedVisits: number;
  discountPercent: number;
  description: string;
  type: SubscriptionPlanType;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  remainingVisits: number;
  discountPercent: number;
}

export type AppointmentStatus = 'planned' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  userId: string;
  serviceId: string;
  serviceName: string;
  studioId: string;
  studioName: string;
  masterId: string;
  masterName: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  basePriceRub: number;
  finalPriceRub: number;
  paidBySubscriptionVisit: boolean;
  createdAt: string;
}

export type PaymentType = 'subscription' | 'service' | 'certificate';
export type PaymentStatus = 'paid' | 'refunded';

export interface Payment {
  id: string;
  userId: string;
  type: PaymentType;
  title: string;
  amountRub: number;
  status: PaymentStatus;
  createdAt: string;
}

export type GiftCertificateStatus = 'active' | 'used' | 'expired';
export type GiftCertificateFormat = 'email' | 'paper';

export interface GiftCertificate {
  id: string;
  userId: string;
  code: string;
  nominalRub: number;
  format: GiftCertificateFormat;
  recipientName: string;
  recipientContact: string;
  message: string;
  purchasedAt: string;
  expiresAt: string;
  status: GiftCertificateStatus;
}

export interface BookingPrice {
  basePriceRub: number;
  finalPriceRub: number;
  discountPercent: number;
  canUseSubscriptionVisit: boolean;
}
