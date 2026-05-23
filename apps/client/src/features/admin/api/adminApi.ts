import type { PublicUserDto } from '@massage/shared';
import type { MasterDto } from '@/entities/master';
import type { ServiceDto } from '@/entities/service';
import type { StudioDto } from '@/entities/studio';
import { baseApi } from '@/shared/api/baseApi';

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
    deleteAdminMaster: builder.mutation<DeleteResultDto, string>({
      query: (id) => ({ url: `/admin/masters/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Admin', 'Masters'],
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
    deleteSuperAdminUser: builder.mutation<DeleteResultDto, string>({
      query: (id) => ({ url: `/super-admin/users/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Admin'],
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
  useCreateAdminMasterMutation,
  useCreateAdminStudioMutation,
  useCreateSuperAdminServiceMutation,
  useDeleteAdminMasterMutation,
  useDeleteSuperAdminServiceMutation,
  useDeleteSuperAdminUserMutation,
  useGetAdminDashboardQuery,
  useGetAdminMasterQuery,
  useGetAdminMastersQuery,
  useGetAdminServicesQuery,
  useGetAdminStudiosQuery,
  useGetSuperAdminServiceQuery,
  useGetSuperAdminServicesQuery,
  useGetSuperAdminUsersQuery,
  useUnblockSuperAdminUserMutation,
  useUpdateAdminMasterMutation,
  useUpdateAdminMasterPhotoMutation,
  useUpdateAdminStudioMutation,
  useUpdateSuperAdminServiceMutation,
  useUpdateSuperAdminServicePhotoMutation,
  useUploadAdminImageMutation,
} = adminApi;
