import type { PublicUserDto } from '@massage/shared';
import type { AppointmentDto } from '@/entities/appointment';
import type { MasterDto } from '@/entities/master';
import type { ServiceDto } from '@/entities/service';
import type { StudioDto } from '@/entities/studio';
import { baseApi } from '@/shared/api/baseApi';

export interface AdminDashboardDto {
  masters: number;
  activeStudios: number;
  todayAppointments: number;
  scheduleConflicts: number;
  activeMasters?: number;
  freeWindowsToday?: number;
  cancellationsToday?: number;
  pendingRequests?: number;
  certificatesToReview?: number;
  revenueRub?: number;
  activeSubscriptions?: number;
}

export interface AdminUserDto extends PublicUserDto {
  status: 'active' | 'blocked';
  isActive: boolean;
  adminStudios?: StudioDto[];
  hasActiveSubscription?: boolean;
  subscriptionStatus?: string | null;
  subscriptionPlanName?: string | null;
  subscriptionEndsAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export type AdminAppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
export type AdminSubscriptionStatus = 'ACTIVE' | 'FROZEN' | 'AUTO_RENEWAL_DISABLED' | 'PAYMENT_ISSUE' | 'EXPIRED' | 'CANCELLED';
export type AdminPaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
export type AdminCertificateStatus = 'ACTIVE' | 'REDEEMED' | 'EXPIRED' | 'CANCELLED';
export type AdminRequestStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED';

export interface AdminAppointmentDto extends AppointmentDto {
  user: PublicUserDto;
}

export interface UpsertAppointmentPayload {
  clientId: string;
  serviceId: string;
  masterId: string;
  studioId: string;
  startsAt: string;
  durationMinutes?: number;
  status?: AdminAppointmentStatus;
  priceRub?: number;
  note?: string;
}

export interface AdminSubscriptionPlanDto {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  monthlyPriceRub: number;
  periodDays: number;
  discountPercent: number;
  certificateDiscountPercent?: number;
  includedCredits: number;
  includedDescription?: string | null;
  freezeCountPerYear?: number;
  freezeDays?: number;
  familyMembersLimit?: number;
  isActive: boolean;
}

export interface UpsertSubscriptionPlanPayload {
  code: string;
  name: string;
  description?: string;
  monthlyPriceRub: number;
  periodDays?: number;
  discountPercent: number;
  certificateDiscountPercent?: number;
  includedCredits: number;
  includedDescription?: string;
  freezeCountPerYear?: number;
  freezeDays?: number;
  familyMembersLimit?: number;
  isActive?: boolean;
}

export interface AdminSubscriptionDto {
  id: string;
  user: PublicUserDto;
  plan: AdminSubscriptionPlanDto;
  status: AdminSubscriptionStatus;
  startsAt: string;
  endsAt: string;
  frozenUntil?: string | null;
  autoRenewalEnabled: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminCertificateDto {
  id: string;
  code: string;
  buyer?: PublicUserDto | null;
  recipientName: string;
  recipientContact?: string | null;
  format: 'EMAIL' | 'PAPER';
  amountRub: number;
  message?: string | null;
  status: AdminCertificateStatus;
  expiresAt: string;
  createdAt: string;
}

export interface UpsertCertificatePayload {
  recipientName: string;
  amountRub: number;
  recipientContact: string;
  format?: 'EMAIL' | 'PAPER';
  message?: string;
  status?: AdminCertificateStatus;
}

export interface AdminPaymentDto {
  id: string;
  user: PublicUserDto;
  amountRub: number;
  status: AdminPaymentStatus;
  provider: string;
  purpose: string;
  relatedEntityId?: string | null;
  createdAt: string;
}

export interface AdminRequestDto {
  id: string;
  user: PublicUserDto;
  subject: string;
  message: string;
  status: AdminRequestStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminAuditLogDto {
  id: string;
  actorId?: string | null;
  actorRole: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  oldValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
  createdAt: string;
}

export interface AdminAnalyticsDto {
  users: number;
  appointments: number;
  activeSubscriptions: number;
  giftCertificates: number;
  paymentsRub: number;
}

export interface AdminNetworkSettingsDto {
  networkName: string;
  primaryColor: string;
  contactEmail: string;
  supportPhone: string;
  defaultWorkingHours: string;
  scheduleStepMinutes: number;
  defaultAppointmentDurationMinutes: number;
  minAppointmentDurationMinutes: number;
  maxAppointmentDurationMinutes: number;
  allowCustomAppointmentDuration: boolean;
  cancellationRules: string;
  certificateValidityDays: number;
  defaultAppointmentStatus: AdminAppointmentStatus;
}

export interface UpsertMasterPayload {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  description?: string;
  specialization?: string;
  experienceYears?: number;
  photoUrl?: string;
  photoUrls?: string[];
  isActive?: boolean;
  studioIds?: string[];
  serviceIds?: string[];
}

export interface UpsertStudioPayload {
  name?: string;
  city?: string;
  address?: string;
  phone?: string;
  photoUrl?: string;
  photoUrls?: string[];
}

export interface UpsertServicePayload {
  title?: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  durationMinutes?: number;
  durationLabel?: string;
  composition?: string;
  priceRub?: number;
  imageUrl?: string;
  galleryUrls?: string[];
  categoryId?: string;
  isActive?: boolean;
}

export interface DeleteResultDto {
  deleted: boolean;
  id: string;
}

export interface WeeklyScheduleIntervalDto {
  studioId: string;
  intervalIndex?: number;
  isWorking?: boolean;
  startTime: string;
  endTime: string;
  breakStartTime?: string;
  breakEndTime?: string;
}

export interface WeeklyScheduleDayDto {
  dayOfWeek: number;
  isWorking?: boolean;
  intervals: WeeklyScheduleIntervalDto[];
}

export interface WeeklyScheduleResponseDto {
  days: WeeklyScheduleDayDto[];
  warnings?: string[];
}

export interface AdminDateAvailabilityDto {
  id: string;
  date: string;
  status: 'available' | 'unavailable' | 'custom' | 'vacation' | 'sick' | 'other';
  startTime?: string | null;
  endTime?: string | null;
  reason?: string | null;
  studio?: StudioDto | null;
}

export interface UpsertAdminDateAvailabilityPayload {
  date: string;
  status: AdminDateAvailabilityDto['status'];
  studioId?: string;
  startTime?: string;
  endTime?: string;
  reason?: string;
}

export interface AdminMasterShiftDto {
  id: string;
  startsAt: string;
  endsAt: string;
  isAvailable: boolean;
  master: MasterDto;
  studio: StudioDto;
}

export interface AdminScheduleOverviewDto {
  from: string;
  to: string;
  masters: MasterDto[];
  shifts: AdminMasterShiftDto[];
  appointments: {
    id: string;
    startsAt: string;
    endsAt: string;
    status: AdminAppointmentStatus;
    priceRub?: number;
    note?: string | null;
    user?: PublicUserDto;
    master: MasterDto;
    studio: StudioDto;
    service: ServiceDto;
  }[];
}

export interface UpsertAdminMasterShiftPayload {
  masterId: string;
  studioId: string;
  startsAt: string;
  endsAt: string;
  isAvailable?: boolean;
}

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminDashboard: builder.query<AdminDashboardDto, void>({
      query: () => '/admin/dashboard',
      providesTags: ['Admin'],
    }),
    getAdminServices: builder.query<ServiceDto[], void>({
      query: () => '/admin/services',
      providesTags: ['Admin', 'Services'],
    }),
    createAdminService: builder.mutation<ServiceDto, UpsertServicePayload>({
      query: (body) => ({ url: '/admin/services', method: 'POST', body }),
      invalidatesTags: ['Admin', 'Services'],
    }),
    updateAdminService: builder.mutation<ServiceDto, { id: string; body: UpsertServicePayload }>({
      query: ({ id, body }) => ({ url: `/admin/services/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Admin', 'Services'],
    }),
    deleteAdminService: builder.mutation<ServiceDto, string>({
      query: (id) => ({ url: `/admin/services/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Admin', 'Services'],
    }),
    getAdminAppointments: builder.query<
      AdminAppointmentDto[],
      { date?: string; studioId?: string; masterId?: string; serviceId?: string; status?: AdminAppointmentStatus } | void
    >({
      query: (params) => ({ url: '/admin/appointments', params: params ?? undefined }),
      providesTags: ['Admin', 'Appointments'],
    }),
    createAdminAppointment: builder.mutation<AdminAppointmentDto, UpsertAppointmentPayload>({
      query: (body) => ({ url: '/admin/appointments', method: 'POST', body }),
      invalidatesTags: ['Admin', 'Appointments', 'Masters'],
    }),
    updateAdminAppointment: builder.mutation<AdminAppointmentDto, { id: string; body: Partial<UpsertAppointmentPayload> }>({
      query: ({ id, body }) => ({ url: `/admin/appointments/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Admin', 'Appointments', 'Masters'],
    }),
    cancelAdminAppointment: builder.mutation<AdminAppointmentDto, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({ url: `/admin/appointments/${id}/cancel`, method: 'PATCH', body: { reason } }),
      invalidatesTags: ['Admin', 'Appointments', 'Masters'],
    }),
    getAdminClients: builder.query<AdminUserDto[], { search?: string } | void>({
      query: (params) => ({ url: '/admin/clients', params: params ?? undefined }),
      providesTags: ['Admin'],
    }),
    getAdminUsers: builder.query<AdminUserDto[], { search?: string; status?: string } | void>({
      query: (params) => ({ url: '/admin/users', params: params ?? undefined }),
      providesTags: ['Admin'],
    }),
    getAdminCertificates: builder.query<AdminCertificateDto[], { status?: AdminCertificateStatus; search?: string } | void>({
      query: () => '/admin/certificates',
      providesTags: ['Admin', 'GiftCertificates'],
      transformResponse: (items: AdminCertificateDto[], _meta, arg) => filterCertificates(items, arg),
    }),
    createAdminCertificate: builder.mutation<AdminCertificateDto, UpsertCertificatePayload>({
      query: (body) => ({ url: '/admin/certificates', method: 'POST', body }),
      invalidatesTags: ['Admin', 'GiftCertificates'],
    }),
    updateAdminCertificate: builder.mutation<AdminCertificateDto, { id: string; body: Partial<UpsertCertificatePayload> }>({
      query: ({ id, body }) => ({ url: `/admin/certificates/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Admin', 'GiftCertificates'],
    }),
    deleteAdminCertificate: builder.mutation<{ deleted: boolean }, string>({
      query: (id) => ({ url: `/admin/certificates/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Admin', 'GiftCertificates'],
    }),
    getAdminRequests: builder.query<AdminRequestDto[], { status?: AdminRequestStatus; search?: string } | void>({
      query: (params) => ({ url: '/admin/requests', params: params ?? undefined }),
      providesTags: ['Admin', 'SupportTickets'],
    }),
    updateAdminRequest: builder.mutation<AdminRequestDto, { id: string; body: { status?: AdminRequestStatus } }>({
      query: ({ id, body }) => ({ url: `/admin/requests/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Admin', 'SupportTickets'],
    }),
    getAdminSubscriptions: builder.query<AdminSubscriptionDto[], void>({
      query: () => '/admin/subscriptions',
      providesTags: ['Admin', 'MySubscription'],
    }),
    getAdminPayments: builder.query<AdminPaymentDto[], void>({
      query: () => '/admin/payments',
      providesTags: ['Admin', 'Payments'],
    }),
    getSuperAdminServices: builder.query<ServiceDto[], void>({
      query: () => '/super-admin/services',
      providesTags: ['Admin', 'Services'],
    }),
    getSuperAdminService: builder.query<ServiceDto, string>({
      query: (id) => `/super-admin/services/${id}`,
      providesTags: ['Admin', 'Services'],
    }),
    createSuperAdminService: builder.mutation<ServiceDto, UpsertServicePayload>({
      query: (body) => ({ url: '/super-admin/services', method: 'POST', body }),
      invalidatesTags: ['Admin', 'Services'],
    }),
    updateSuperAdminService: builder.mutation<ServiceDto, { id: string; body: UpsertServicePayload }>({
      query: ({ id, body }) => ({ url: `/super-admin/services/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Admin', 'Services'],
    }),
    updateSuperAdminServicePhoto: builder.mutation<ServiceDto, { id: string; imageUrl: string }>({
      query: ({ id, imageUrl }) => ({ url: `/super-admin/services/${id}/photo`, method: 'PATCH', body: { imageUrl } }),
      invalidatesTags: ['Admin', 'Services'],
    }),
    deleteSuperAdminService: builder.mutation<ServiceDto, string>({
      query: (id) => ({ url: `/super-admin/services/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Admin', 'Services'],
    }),
    getAdminStudios: builder.query<StudioDto[], void>({
      query: () => '/admin/studios',
      providesTags: ['Admin', 'Studios'],
    }),
    createAdminStudio: builder.mutation<StudioDto, Required<Pick<UpsertStudioPayload, 'address' | 'city' | 'name'>> & UpsertStudioPayload>({
      query: (body) => ({ url: '/admin/studios', method: 'POST', body }),
      invalidatesTags: ['Admin', 'Studios'],
    }),
    updateAdminStudio: builder.mutation<StudioDto, { id: string; body: UpsertStudioPayload }>({
      query: ({ id, body }) => ({ url: `/admin/studios/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Admin', 'Studios'],
    }),
    getAdminMasters: builder.query<MasterDto[], { search?: string; studioId?: string } | void>({
      query: (params) => ({ url: '/admin/masters', params: params ?? undefined }),
      providesTags: ['Admin', 'Masters'],
    }),
    getAdminMaster: builder.query<MasterDto, string>({
      query: (id) => `/admin/masters/${id}`,
      providesTags: ['Admin', 'Masters'],
    }),
    createAdminMaster: builder.mutation<MasterDto, UpsertMasterPayload>({
      query: (body) => ({ url: '/admin/masters', method: 'POST', body }),
      invalidatesTags: ['Admin', 'Masters'],
    }),
    updateAdminMaster: builder.mutation<MasterDto, { id: string; body: UpsertMasterPayload }>({
      query: ({ id, body }) => ({ url: `/admin/masters/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Admin', 'Masters'],
    }),
    updateAdminMasterPhoto: builder.mutation<MasterDto, { id: string; photoUrl: string }>({
      query: ({ id, photoUrl }) => ({ url: `/admin/masters/${id}/photo`, method: 'PATCH', body: { photoUrl } }),
      invalidatesTags: ['Admin', 'Masters'],
    }),
    deleteAdminMaster: builder.mutation<DeleteResultDto, string>({
      query: (id) => ({ url: `/admin/masters/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Admin', 'Masters'],
    }),
    getAdminWeeklySchedule: builder.query<WeeklyScheduleResponseDto, string>({
      query: (id) => `/admin/masters/${id}/weekly-schedule`,
      providesTags: ['Admin', 'Masters'],
    }),
    updateAdminWeeklySchedule: builder.mutation<WeeklyScheduleResponseDto, { id: string; days: WeeklyScheduleDayDto[] }>({
      query: ({ id, days }) => ({ url: `/admin/masters/${id}/weekly-schedule`, method: 'PUT', body: { days } }),
      invalidatesTags: ['Admin', 'Masters'],
    }),
    getAdminDateAvailability: builder.query<AdminDateAvailabilityDto[], { id: string; from?: string; to?: string }>({
      query: ({ id, ...params }) => ({ url: `/admin/masters/${id}/date-availability`, params }),
      providesTags: ['Admin', 'Masters'],
    }),
    createAdminDateAvailability: builder.mutation<AdminDateAvailabilityDto, { id: string; body: UpsertAdminDateAvailabilityPayload }>({
      query: ({ id, body }) => ({ url: `/admin/masters/${id}/date-availability`, method: 'POST', body }),
      invalidatesTags: ['Admin', 'Masters'],
    }),
    updateAdminDateAvailability: builder.mutation<
      AdminDateAvailabilityDto,
      { id: string; availabilityId: string; body: Partial<UpsertAdminDateAvailabilityPayload> }
    >({
      query: ({ id, availabilityId, body }) => ({
        url: `/admin/masters/${id}/date-availability/${availabilityId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Admin', 'Masters'],
    }),
    deleteAdminDateAvailability: builder.mutation<{ deleted: boolean }, { id: string; availabilityId: string }>({
      query: ({ id, availabilityId }) => ({ url: `/admin/masters/${id}/date-availability/${availabilityId}`, method: 'DELETE' }),
      invalidatesTags: ['Admin', 'Masters'],
    }),
    getAdminScheduleOverview: builder.query<
      AdminScheduleOverviewDto,
      { from?: string; to?: string; studioId?: string; masterId?: string; serviceId?: string } | void
    >({
      query: (params) => ({ url: '/admin/schedule/overview', params: params ?? undefined }),
      providesTags: ['Admin', 'Masters'],
    }),
    getAdminScheduleDay: builder.query<
      AdminScheduleOverviewDto,
      { date?: string; studioId?: string; masterId?: string; serviceId?: string } | void
    >({
      query: (params) => ({ url: '/admin/schedule/day', params: params ?? undefined }),
      providesTags: ['Admin', 'Masters'],
    }),
    getAdminScheduleWeek: builder.query<
      AdminScheduleOverviewDto,
      { startDate?: string; studioId?: string; masterId?: string; serviceId?: string } | void
    >({
      query: (params) => ({ url: '/admin/schedule/week', params: params ?? undefined }),
      providesTags: ['Admin', 'Masters'],
    }),
    getAdminScheduleMonth: builder.query<
      AdminScheduleOverviewDto,
      { month?: string; studioId?: string; masterId?: string; serviceId?: string } | void
    >({
      query: (params) => ({ url: '/admin/schedule/month', params: params ?? undefined }),
      providesTags: ['Admin', 'Masters'],
    }),
    getAdminMasterShifts: builder.query<AdminMasterShiftDto[], { masterId?: string; studioId?: string; date?: string } | void>({
      query: (params) => ({ url: '/admin/master-shifts', params: params ?? undefined }),
      providesTags: ['Admin', 'Masters'],
    }),
    createAdminMasterShift: builder.mutation<AdminMasterShiftDto, UpsertAdminMasterShiftPayload>({
      query: (body) => ({ url: '/admin/master-shifts', method: 'POST', body }),
      invalidatesTags: ['Admin', 'Masters'],
    }),
    updateAdminMasterShift: builder.mutation<AdminMasterShiftDto, { id: string; body: Partial<UpsertAdminMasterShiftPayload> }>({
      query: ({ id, body }) => ({ url: `/admin/master-shifts/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Admin', 'Masters'],
    }),
    deleteAdminMasterShift: builder.mutation<{ deleted: boolean }, string>({
      query: (id) => ({ url: `/admin/master-shifts/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Admin', 'Masters'],
    }),
    getSuperAdminUsers: builder.query<AdminUserDto[], { search?: string; status?: string } | void>({
      query: (params) => ({ url: '/super-admin/users', params: params ?? undefined }),
      providesTags: ['Admin'],
    }),
    updateSuperAdminUserRole: builder.mutation<AdminUserDto, { id: string; role: PublicUserDto['role']; studioIds?: string[] }>({
      query: ({ id, role, studioIds }) => ({ url: `/super-admin/users/${id}/role`, method: 'PATCH', body: { role, studioIds } }),
      invalidatesTags: ['Admin', 'Studios'],
    }),
    blockSuperAdminUser: builder.mutation<AdminUserDto, string>({
      query: (id) => ({ url: `/super-admin/users/${id}/block`, method: 'PATCH' }),
      invalidatesTags: ['Admin'],
    }),
    unblockSuperAdminUser: builder.mutation<AdminUserDto, string>({
      query: (id) => ({ url: `/super-admin/users/${id}/unblock`, method: 'PATCH' }),
      invalidatesTags: ['Admin'],
    }),
    deleteSuperAdminUser: builder.mutation<DeleteResultDto, string>({
      query: (id) => ({ url: `/super-admin/users/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Admin'],
    }),
    getSuperAdminTariffs: builder.query<AdminSubscriptionPlanDto[], void>({
      query: () => '/super-admin/tariffs',
      providesTags: ['Admin', 'SubscriptionPlans'],
    }),
    createSuperAdminTariff: builder.mutation<AdminSubscriptionPlanDto, UpsertSubscriptionPlanPayload>({
      query: (body) => ({ url: '/super-admin/tariffs', method: 'POST', body }),
      invalidatesTags: ['Admin', 'SubscriptionPlans'],
    }),
    updateSuperAdminTariff: builder.mutation<AdminSubscriptionPlanDto, { id: string; body: Partial<UpsertSubscriptionPlanPayload> }>({
      query: ({ id, body }) => ({ url: `/super-admin/tariffs/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Admin', 'SubscriptionPlans'],
    }),
    deleteSuperAdminTariff: builder.mutation<AdminSubscriptionPlanDto, string>({
      query: (id) => ({ url: `/super-admin/tariffs/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Admin', 'SubscriptionPlans'],
    }),
    getSuperAdminSubscriptions: builder.query<AdminSubscriptionDto[], void>({
      query: () => '/super-admin/subscriptions',
      providesTags: ['Admin', 'MySubscription'],
    }),
    updateSuperAdminSubscriptionStatus: builder.mutation<AdminSubscriptionDto, { id: string; status: AdminSubscriptionStatus }>({
      query: ({ id, status }) => ({ url: `/super-admin/subscriptions/${id}/status`, method: 'PATCH', body: { status } }),
      invalidatesTags: ['Admin', 'MySubscription'],
    }),
    getSuperAdminPayments: builder.query<AdminPaymentDto[], void>({
      query: () => '/super-admin/payments',
      providesTags: ['Admin', 'Payments'],
    }),
    updateSuperAdminPaymentStatus: builder.mutation<AdminPaymentDto, { id: string; status: AdminPaymentStatus }>({
      query: ({ id, status }) => ({ url: `/super-admin/payments/${id}/status`, method: 'PATCH', body: { status } }),
      invalidatesTags: ['Admin', 'Payments'],
    }),
    getSuperAdminCertificates: builder.query<AdminCertificateDto[], { status?: AdminCertificateStatus; search?: string } | void>({
      query: () => '/super-admin/certificates',
      providesTags: ['Admin', 'GiftCertificates'],
      transformResponse: (items: AdminCertificateDto[], _meta, arg) => filterCertificates(items, arg),
    }),
    getSuperAdminRequests: builder.query<AdminRequestDto[], { status?: AdminRequestStatus; search?: string } | void>({
      query: (params) => ({ url: '/super-admin/requests', params: params ?? undefined }),
      providesTags: ['Admin', 'SupportTickets'],
    }),
    updateSuperAdminRequest: builder.mutation<AdminRequestDto, { id: string; body: { status?: AdminRequestStatus } }>({
      query: ({ id, body }) => ({ url: `/super-admin/requests/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Admin', 'SupportTickets'],
    }),
    getSuperAdminAnalytics: builder.query<AdminAnalyticsDto, void>({
      query: () => '/super-admin/analytics',
      providesTags: ['Admin'],
    }),
    getAdminSettings: builder.query<AdminNetworkSettingsDto, void>({
      query: () => '/admin/settings',
      providesTags: ['Settings'],
    }),
    getSuperAdminAuditLog: builder.query<AdminAuditLogDto[], void>({
      query: () => '/super-admin/audit-log',
      providesTags: ['Admin'],
    }),
    getSuperAdminSettings: builder.query<AdminNetworkSettingsDto, void>({
      query: () => '/super-admin/settings',
      providesTags: ['Settings'],
    }),
    updateSuperAdminSettings: builder.mutation<AdminNetworkSettingsDto, Partial<AdminNetworkSettingsDto>>({
      query: (body) => ({ url: '/super-admin/settings', method: 'PATCH', body }),
      invalidatesTags: ['Settings', 'Admin'],
    }),
    uploadAdminImage: builder.mutation<{ url: string }, File>({
      query: (file) => {
        const body = new FormData();
        body.append('file', file);
        return { url: '/uploads', method: 'POST', body, timeout: 30000 };
      },
    }),
  }),
});

export const {
  useBlockSuperAdminUserMutation,
  useCancelAdminAppointmentMutation,
  useCreateAdminAppointmentMutation,
  useCreateAdminCertificateMutation,
  useCreateAdminMasterMutation,
  useCreateAdminDateAvailabilityMutation,
  useCreateAdminMasterShiftMutation,
  useCreateAdminServiceMutation,
  useCreateAdminStudioMutation,
  useCreateSuperAdminTariffMutation,
  useCreateSuperAdminServiceMutation,
  useDeleteAdminCertificateMutation,
  useDeleteAdminServiceMutation,
  useDeleteAdminDateAvailabilityMutation,
  useDeleteAdminMasterMutation,
  useDeleteAdminMasterShiftMutation,
  useDeleteSuperAdminTariffMutation,
  useDeleteSuperAdminServiceMutation,
  useDeleteSuperAdminUserMutation,
  useGetAdminAppointmentsQuery,
  useGetAdminCertificatesQuery,
  useGetAdminClientsQuery,
  useGetAdminDateAvailabilityQuery,
  useGetAdminDashboardQuery,
  useGetAdminMasterQuery,
  useGetAdminMastersQuery,
  useGetAdminMasterShiftsQuery,
  useGetAdminPaymentsQuery,
  useGetAdminRequestsQuery,
  useGetAdminServicesQuery,
  useGetAdminSettingsQuery,
  useGetAdminScheduleDayQuery,
  useGetAdminScheduleMonthQuery,
  useGetAdminScheduleOverviewQuery,
  useGetAdminScheduleWeekQuery,
  useGetAdminStudiosQuery,
  useGetAdminSubscriptionsQuery,
  useGetAdminUsersQuery,
  useGetAdminWeeklyScheduleQuery,
  useGetSuperAdminAnalyticsQuery,
  useGetSuperAdminAuditLogQuery,
  useGetSuperAdminCertificatesQuery,
  useGetSuperAdminPaymentsQuery,
  useGetSuperAdminRequestsQuery,
  useGetSuperAdminServiceQuery,
  useGetSuperAdminServicesQuery,
  useGetSuperAdminSettingsQuery,
  useGetSuperAdminSubscriptionsQuery,
  useGetSuperAdminTariffsQuery,
  useGetSuperAdminUsersQuery,
  useUnblockSuperAdminUserMutation,
  useUpdateAdminAppointmentMutation,
  useUpdateAdminCertificateMutation,
  useUpdateAdminDateAvailabilityMutation,
  useUpdateAdminMasterMutation,
  useUpdateAdminMasterPhotoMutation,
  useUpdateAdminMasterShiftMutation,
  useUpdateAdminRequestMutation,
  useUpdateAdminServiceMutation,
  useUpdateAdminWeeklyScheduleMutation,
  useUpdateAdminStudioMutation,
  useUpdateSuperAdminPaymentStatusMutation,
  useUpdateSuperAdminRequestMutation,
  useUpdateSuperAdminServiceMutation,
  useUpdateSuperAdminServicePhotoMutation,
  useUpdateSuperAdminSettingsMutation,
  useUpdateSuperAdminSubscriptionStatusMutation,
  useUpdateSuperAdminTariffMutation,
  useUpdateSuperAdminUserRoleMutation,
  useUploadAdminImageMutation,
} = adminApi;

function filterCertificates(items: AdminCertificateDto[], arg?: { status?: AdminCertificateStatus; search?: string } | void) {
  const search = arg?.search?.trim().toLowerCase();
  return items.filter((item) => {
    const matchesStatus = !arg?.status || item.status === arg.status;
    const haystack = `${item.code} ${item.recipientName} ${item.recipientContact ?? ''} ${item.buyer?.fullName ?? ''}`.toLowerCase();
    return matchesStatus && (!search || haystack.includes(search));
  });
}
