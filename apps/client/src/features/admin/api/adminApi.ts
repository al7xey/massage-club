import type { PublicUserDto } from '@massage/shared';
import type { AppointmentDto } from '@/entities/appointment';
import type { GiftCertificateDto } from '@/entities/certificate';
import type { MasterDto } from '@/entities/master';
import type { ServiceDto } from '@/entities/service';
import type { StudioDto } from '@/entities/studio';
import type { MembershipEntryFeeSettingDto, SubscriptionPlanDto } from '@/entities/subscription';
import { baseApi } from '@/shared/api/baseApi';

export interface AdminSummaryDto {
  users: number;
  appointments: number;
  activeSubscriptions: number;
  paymentsRub: number;
  giftCertificates: number;
}

export interface AdminDashboardDto {
  masters: number;
  activeStudios: number;
  todayAppointments: number;
  scheduleConflicts: number;
}

export interface AdminUserDto extends PublicUserDto {
  status: 'active' | 'blocked';
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
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

export interface MasterShiftDto {
  id: string;
  master: MasterDto;
  studio: StudioDto;
  startsAt: string;
  endsAt: string;
  isAvailable: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface WeeklyScheduleIntervalDto {
  id?: string;
  studioId: string;
  studio?: StudioDto;
  intervalIndex?: number;
  isWorking?: boolean;
  startTime: string;
  endTime: string;
  breakStartTime?: string | null;
  breakEndTime?: string | null;
}

export interface WeeklyScheduleDayDto {
  dayOfWeek: number;
  isWorking: boolean;
  intervals: WeeklyScheduleIntervalDto[];
}

export interface DateAvailabilityDto {
  id: string;
  date: string;
  status: 'available' | 'unavailable' | 'custom' | 'vacation' | 'sick' | 'other';
  startTime?: string | null;
  endTime?: string | null;
  reason?: string | null;
  studio?: StudioDto | null;
}

export interface ScheduleOverviewDto {
  from: string;
  to: string;
  masters: MasterDto[];
  shifts: MasterShiftDto[];
  appointments: AppointmentDto[];
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
  isActive?: boolean;
  studioIds?: string[];
  serviceIds?: string[];
}

export interface UpsertSchedulePayload {
  masterId: string;
  studioId: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  startsAt?: string;
  endsAt?: string;
  isAvailable?: boolean;
}

export interface UpsertStudioPayload {
  name?: string;
  city?: string;
  address?: string;
  phone?: string;
  photoUrl?: string;
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
  subscriptionPriceRub?: number;
  imageUrl?: string;
  galleryUrls?: string[];
  contraindications?: string;
  benefits?: string;
  rules?: string;
  seoTitle?: string;
  seoDescription?: string;
  categoryId?: string;
  isActive?: boolean;
}

export interface SiteContentDto {
  id: string;
  key: string;
  title: string;
  value: unknown;
  type: 'text' | 'image' | 'html' | 'json';
  updatedAt: string;
}

export interface AuditLogDto {
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

export interface UpdateAppointmentPayload {
  clientId?: string;
  serviceId?: string;
  masterId?: string;
  studioId?: string;
  date?: string;
  startTime?: string;
  startsAt?: string;
  status?: string;
  priceRub?: number;
  note?: string;
}

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminDashboard: builder.query<AdminDashboardDto, void>({
      query: () => '/admin/dashboard',
      providesTags: ['Admin'],
    }),
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
      providesTags: ['Admin', 'Services'],
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
    updateSuperAdminServiceGallery: builder.mutation<ServiceDto, { id: string; galleryUrls: string[] }>({
      query: ({ id, galleryUrls }) => ({ url: `/super-admin/services/${id}/gallery`, method: 'PATCH', body: { galleryUrls } }),
      invalidatesTags: ['Admin', 'Services'],
    }),
    deactivateSuperAdminService: builder.mutation<ServiceDto, string>({
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
    getAdminMasters: builder.query<MasterDto[], { search?: string; studioId?: string; isActive?: string } | void>({
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
    updateAdminMasterStudios: builder.mutation<MasterDto, { id: string; studioIds: string[] }>({
      query: ({ id, studioIds }) => ({ url: `/admin/masters/${id}/studios`, method: 'PATCH', body: { studioIds } }),
      invalidatesTags: ['Admin', 'Masters'],
    }),
    updateAdminMasterServices: builder.mutation<MasterDto, { id: string; serviceIds: string[] }>({
      query: ({ id, serviceIds }) => ({ url: `/admin/masters/${id}/services`, method: 'PATCH', body: { serviceIds } }),
      invalidatesTags: ['Admin', 'Masters'],
    }),
    deactivateAdminMaster: builder.mutation<MasterDto, string>({
      query: (id) => ({ url: `/admin/masters/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Admin', 'Masters'],
    }),
    getAdminSchedules: builder.query<MasterShiftDto[], { masterId?: string; studioId?: string; date?: string } | void>({
      query: (params) => ({ url: '/admin/schedules', params: params ?? undefined }),
      providesTags: ['Admin'],
    }),
    createAdminSchedule: builder.mutation<MasterShiftDto, UpsertSchedulePayload>({
      query: (body) => ({ url: '/admin/schedules', method: 'POST', body }),
      invalidatesTags: ['Admin'],
    }),
    updateAdminSchedule: builder.mutation<MasterShiftDto, { id: string; body: Partial<UpsertSchedulePayload> }>({
      query: ({ id, body }) => ({ url: `/admin/schedules/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Admin'],
    }),
    deleteAdminSchedule: builder.mutation<{ deleted: boolean }, string>({
      query: (id) => ({ url: `/admin/schedules/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Admin'],
    }),
    getAdminWeeklySchedule: builder.query<WeeklyScheduleDayDto[], string>({
      query: (id) => `/admin/masters/${id}/weekly-schedule`,
      providesTags: ['Admin'],
    }),
    updateAdminWeeklySchedule: builder.mutation<{ days: WeeklyScheduleDayDto[]; warnings: unknown[] }, { id: string; days: WeeklyScheduleDayDto[] }>({
      query: ({ id, days }) => ({ url: `/admin/masters/${id}/weekly-schedule`, method: 'PUT', body: { days } }),
      invalidatesTags: ['Admin'],
    }),
    getAdminDateAvailability: builder.query<DateAvailabilityDto[], { id: string; from?: string; to?: string }>({
      query: ({ id, ...params }) => ({ url: `/admin/masters/${id}/date-availability`, params }),
      providesTags: ['Admin'],
    }),
    createAdminDateAvailability: builder.mutation<DateAvailabilityDto, { id: string; body: Partial<DateAvailabilityDto> & { date: string; status: DateAvailabilityDto['status']; studioId?: string } }>({
      query: ({ id, body }) => ({ url: `/admin/masters/${id}/date-availability`, method: 'POST', body }),
      invalidatesTags: ['Admin'],
    }),
    updateAdminDateAvailability: builder.mutation<DateAvailabilityDto, { masterId: string; availabilityId: string; body: Partial<DateAvailabilityDto> }>({
      query: ({ masterId, availabilityId, body }) => ({ url: `/admin/masters/${masterId}/date-availability/${availabilityId}`, method: 'PATCH', body }),
      invalidatesTags: ['Admin'],
    }),
    deleteAdminDateAvailability: builder.mutation<{ deleted: boolean }, { masterId: string; availabilityId: string }>({
      query: ({ masterId, availabilityId }) => ({ url: `/admin/masters/${masterId}/date-availability/${availabilityId}`, method: 'DELETE' }),
      invalidatesTags: ['Admin'],
    }),
    getAdminScheduleOverview: builder.query<ScheduleOverviewDto, { from?: string; to?: string; studioId?: string; masterId?: string; serviceId?: string } | void>({
      query: (params) => ({ url: '/admin/schedule/overview', params: params ?? undefined }),
      providesTags: ['Admin', 'Appointments'],
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
    getSuperAdminUsers: builder.query<AdminUserDto[], { search?: string; status?: string } | void>({
      query: (params) => ({ url: '/super-admin/users', params: params ?? undefined }),
      providesTags: ['Admin'],
    }),
    blockSuperAdminUser: builder.mutation<AdminUserDto, string>({
      query: (id) => ({ url: `/super-admin/users/${id}/block`, method: 'PATCH' }),
      invalidatesTags: ['Admin'],
    }),
    unblockSuperAdminUser: builder.mutation<AdminUserDto, string>({
      query: (id) => ({ url: `/super-admin/users/${id}/unblock`, method: 'PATCH' }),
      invalidatesTags: ['Admin'],
    }),
    getSuperAdminAppointments: builder.query<AppointmentDto[], { date?: string; studioId?: string; masterId?: string; status?: string } | void>({
      query: (params) => ({ url: '/super-admin/appointments', params: params ?? undefined }),
      providesTags: ['Admin', 'Appointments'],
    }),
    updateSuperAdminAppointment: builder.mutation<AppointmentDto, { id: string; body: UpdateAppointmentPayload }>({
      query: ({ id, body }) => ({ url: `/super-admin/appointments/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Admin', 'Appointments'],
    }),
    cancelSuperAdminAppointment: builder.mutation<AppointmentDto, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({ url: `/super-admin/appointments/${id}/cancel`, method: 'PATCH', body: { reason } }),
      invalidatesTags: ['Admin', 'Appointments'],
    }),
    getSuperAdminAuditLog: builder.query<AuditLogDto[], void>({
      query: () => '/super-admin/audit-log',
      providesTags: ['Admin'],
    }),
    getSuperAdminSiteContent: builder.query<SiteContentDto[], void>({
      query: () => '/super-admin/site-content',
      providesTags: ['SiteContent'],
    }),
    updateSuperAdminSiteContent: builder.mutation<SiteContentDto, { key: string; body: Partial<SiteContentDto> }>({
      query: ({ key, body }) => ({ url: `/super-admin/site-content/${encodeURIComponent(key)}`, method: 'PATCH', body }),
      invalidatesTags: ['SiteContent'],
    }),
    uploadAdminImage: builder.mutation<{ url: string }, File>({
      query: (file) => {
        const body = new FormData();
        body.append('file', file);
        return { url: '/uploads', method: 'POST', body };
      },
    }),
  }),
});

export const {
  useBlockSuperAdminUserMutation,
  useCancelSuperAdminAppointmentMutation,
  useCreateAdminDateAvailabilityMutation,
  useCreateAdminMasterMutation,
  useCreateAdminScheduleMutation,
  useCreateAdminStudioMutation,
  useCreateSuperAdminServiceMutation,
  useDeactivateSuperAdminServiceMutation,
  useDeactivateAdminMasterMutation,
  useDeleteAdminDateAvailabilityMutation,
  useDeleteAdminScheduleMutation,
  useGetAdminAppointmentsQuery,
  useGetAdminDateAvailabilityQuery,
  useGetAdminDashboardQuery,
  useGetAdminGiftCertificatesQuery,
  useGetAdminMasterQuery,
  useGetAdminMastersQuery,
  useGetAdminMembershipEntryFeeQuery,
  useGetAdminSchedulesQuery,
  useGetAdminServicesQuery,
  useGetAdminScheduleOverviewQuery,
  useGetAdminStudiosQuery,
  useGetAdminSubscriptionPlansQuery,
  useGetAdminSubscriptionsQuery,
  useGetAdminSummaryQuery,
  useGetAdminUsersQuery,
  useGetAdminWeeklyScheduleQuery,
  useGetSuperAdminAppointmentsQuery,
  useGetSuperAdminAuditLogQuery,
  useGetSuperAdminServiceQuery,
  useGetSuperAdminServicesQuery,
  useGetSuperAdminSiteContentQuery,
  useGetSuperAdminUsersQuery,
  useUnblockSuperAdminUserMutation,
  useUpdateAdminDateAvailabilityMutation,
  useUpdateAdminMasterMutation,
  useUpdateAdminMasterPhotoMutation,
  useUpdateAdminMasterServicesMutation,
  useUpdateAdminMasterStudiosMutation,
  useUpdateAdminMembershipEntryFeeMutation,
  useUpdateAdminScheduleMutation,
  useUpdateAdminStudioMutation,
  useUpdateAdminWeeklyScheduleMutation,
  useUpdateSuperAdminAppointmentMutation,
  useUpdateSuperAdminServiceGalleryMutation,
  useUpdateSuperAdminServiceMutation,
  useUpdateSuperAdminServicePhotoMutation,
  useUpdateSuperAdminSiteContentMutation,
  useUploadAdminImageMutation,
} = adminApi;
