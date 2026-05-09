import type { ServiceDto, StudioDto, SubscriptionPlanDto } from './domain';

export type ServiceTone = 'massage' | 'care' | 'spa' | 'neutral';

export interface UiServiceCard extends ServiceDto {
  tone: ServiceTone;
  categoryLabel: string;
  oldPriceRub?: number;
  badgeText?: string;
}

export interface UiMasterMeta {
  experienceLabel: string;
  roleLabel: string;
  rating: number;
  reviewsCount: number;
  nextSlots: string[];
}

export interface UiReview {
  id: string;
  author: string;
  role: string;
  text: string;
  date: string;
  rating: number;
}

export interface UiStudioMeta {
  phone: string;
  openLabel: string;
  cityChip: string;
}

export interface UiPlanMeta {
  title: string;
  subtitle: string;
  features: string[];
}

export interface UiCertificatePreset {
  value: number;
  label: string;
}

export interface UiLandingContent {
  reviews: UiReview[];
  certificatePresets: UiCertificatePreset[];
}

export interface UiServiceCardFactoryInput {
  service: ServiceDto;
  index: number;
}

export interface UiPlanFactoryInput {
  plan: SubscriptionPlanDto;
  index: number;
}

export interface UiStudioFactoryInput {
  studio: StudioDto;
  index: number;
}
