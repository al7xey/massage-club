export interface ServiceCategoryDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface ServiceDto {
  id: string;
  title: string;
  slug?: string;
  description: string;
  durationMinutes: number;
  durationLabel?: string | null;
  composition?: string | null;
  externalSource?: string | null;
  externalId?: string | null;
  priceRub: number;
  category?: ServiceCategoryDto | null;
}

export interface ServicesPageDto {
  items: ServiceDto[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface ServicesQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  categories?: string;
  duration?: number;
  minDuration?: number;
  maxDuration?: number;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'popular' | 'priceAsc' | 'priceDesc' | 'durationAsc' | 'durationDesc' | 'titleAsc';
}

export interface ServiceCardModel extends ServiceDto {
  categoryLabel: string;
  badgeText: string;
}
