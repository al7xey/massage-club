import type { PublicUserDto } from '@massage/shared';
import type { AppointmentDto } from '@/entities/appointment';
import type { GiftCertificateDto } from '@/entities/certificate';
import type { ServiceDto } from '@/entities/service';
import { baseApi } from '@/shared/api/baseApi';

export interface AdminSummaryDto {
  users: number;
  appointments: number;
  activeSubscriptions: number;
  paymentsRub: number;
  giftCertificates: number;
}

export interface AdminUserDto extends PublicUserDto {
  isActive: boolean;
  createdAt: string;
}

export interface AdminSubscriptionDto {
  id: string;
  status: string;
  startsAt: string;
  endsAt: string;
  user: PublicUserDto;
  plan: {
    id: string;
    name: string;
    code: string;
    monthlyPriceRub: number;
    discountPercent: number;
    includedCredits: number;
  };
}

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminSummary: builder.query<AdminSummaryDto, void>({
      query: () => '/admin/analytics/summary',
      providesTags: ['Admin'],
    }),
    getAdminAppointments: builder.query<AppointmentDto[], void>({
      query: () => '/admin/appointments',
      providesTags: ['Admin'],
    }),
    getAdminUsers: builder.query<AdminUserDto[], void>({
      query: () => '/admin/users',
      providesTags: ['Admin'],
    }),
    getAdminServices: builder.query<ServiceDto[], void>({
      query: () => '/admin/services',
      providesTags: ['Admin'],
    }),
    getAdminSubscriptions: builder.query<AdminSubscriptionDto[], void>({
      query: () => '/admin/subscriptions',
      providesTags: ['Admin'],
    }),
    getAdminGiftCertificates: builder.query<GiftCertificateDto[], void>({
      query: () => '/admin/gift-certificates',
      providesTags: ['Admin'],
    }),
  }),
});

export const {
  useGetAdminAppointmentsQuery,
  useGetAdminGiftCertificatesQuery,
  useGetAdminServicesQuery,
  useGetAdminSubscriptionsQuery,
  useGetAdminSummaryQuery,
  useGetAdminUsersQuery,
} = adminApi;
