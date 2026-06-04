import { API_BASE_URL } from '@/shared/config/env';

export function buildYandexOAuthUrl(returnTo = '/account') {
  const params = new URLSearchParams({ returnTo });
  return `${API_BASE_URL}/auth/yandex?${params.toString()}`;
}
