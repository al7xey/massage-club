export interface SiteContentDto {
  id: string;
  key: string;
  title: string;
  value: unknown;
  type: 'text' | 'image' | 'html' | 'json';
  updatedAt: string;
}
