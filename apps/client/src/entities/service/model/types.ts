export type ServiceTone = 'massage' | 'care' | 'spa' | 'neutral';

export interface ServiceDto {
  id: string;
  title: string;
  slug?: string;
  description: string;
  durationMinutes: number;
  priceRub: number;
}

export interface ServiceCardModel extends ServiceDto {
  tone: ServiceTone;
  categoryLabel: string;
  goalLabel: string;
  studioLabel: string;
  rating: number;
  reviewCount: number;
  isAvailableToday: boolean;
  clubLabel: string;
  benefit: string;
  oldPriceRub: number;
  badgeText: string;
}
