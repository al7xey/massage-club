import { API_BASE_URL } from '../config/env';

const apiOrigin = API_BASE_URL.replace(/\/api\/?$/, '');

export function resolveMediaUrl(url?: null | string) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url) || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  if (url.startsWith('/uploads/')) {
    return `${apiOrigin}${url}`;
  }
  return url;
}
