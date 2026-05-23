import type { ServiceDto } from '@/entities/service/@x/master';
import type { StudioDto } from '@/entities/studio/@x/master';

export interface MasterDto {
  id: string;
  firstName: string;
  lastName: string;
  bio?: string;
  phone?: string | null;
  specialization?: string | null;
  experienceYears?: number;
  photoUrl?: string | null;
  studio?: StudioDto;
  studios?: StudioDto[];
  services: ServiceDto[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
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
