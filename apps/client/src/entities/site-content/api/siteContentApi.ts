import { baseApi } from '@/shared/api/baseApi';
import type { SiteContentDto } from '../model/types';

export const siteContentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPublicSiteContent: builder.query<SiteContentDto[], void>({
      async queryFn(_arg, _api, _extraOptions, fetchWithBaseQuery) {
        const result = await fetchWithBaseQuery('/site-content');
        if (result.error) {
          return { data: [] };
        }

        return { data: (result.data as SiteContentDto[]) ?? [] };
      },
      providesTags: ['SiteContent'],
    }),
  }),
});

export const { useGetPublicSiteContentQuery } = siteContentApi;

export function getSiteContentText(items: SiteContentDto[] | undefined, key: string, fallback: string) {
  const value = items?.find((item) => item.key === key)?.value;
  return typeof value === 'string' && value.trim() ? value : fallback;
}
