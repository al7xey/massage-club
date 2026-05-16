import type { ServiceDto } from '@/entities/service/@x/master';
import type { StudioDto } from '@/entities/studio/@x/master';

export interface MasterDto {
  id: string;
  firstName: string;
  lastName: string;
  bio?: string;
  studio?: StudioDto;
  services: ServiceDto[];
  isActive: boolean;
}

export interface MasterCardModel {
  id: string;
  fullName: string;
  roleLabel: string;
  summary: string;
  experienceLabel: string;
  rating: number;
  reviewsCount: number;
  nextSlots: string[];
}
