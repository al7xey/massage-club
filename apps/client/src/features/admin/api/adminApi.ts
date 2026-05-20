import type { PublicUserDto } from '@massage/shared';
import type { AppointmentDto } from '@/entities/appointment';
import type { GiftCertificateDto } from '@/entities/certificate';
import type { ServiceDto } from '@/entities/service';
import type { MembershipEntryFeeSettingDto, SubscriptionPlanDto } from '@/entities/subscription';
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
    periodDays: number;
    discountPercent: number;
    certificateDiscountPercent: number;
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
    getAdminSubscriptionPlans: builder.query<SubscriptionPlanDto[], void>({
      query: () => '/admin/subscription-plans',
      providesTags: ['Admin', 'SubscriptionPlans'],
    }),
    getAdminMembershipEntryFee: builder.query<MembershipEntryFeeSettingDto, void>({
      query: () => '/settings/membership-entry-fee',
      providesTags: ['Settings'],
    }),
    updateAdminMembershipEntryFee: builder.mutation<MembershipEntryFeeSettingDto, Partial<MembershipEntryFeeSettingDto>>({
      query: (body) => ({ url: '/admin/settings/membership-entry-fee', method: 'PATCH', body }),
      invalidatesTags: ['Settings', 'Admin'],
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
  useGetAdminMembershipEntryFeeQuery,
  useGetAdminSubscriptionPlansQuery,
  useGetAdminSubscriptionsQuery,
  useGetAdminSummaryQuery,
  useGetAdminUsersQuery,
  useUpdateAdminMembershipEntryFeeMutation,
} = adminApi;
