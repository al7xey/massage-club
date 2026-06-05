import type { StudioCardModel, StudioDto } from '../model/types';

export function createStudioCardModel(studio: StudioDto): StudioCardModel {
  return {
    id: studio.id,
    title: studio.name,
    address: studio.address,
    photoUrl: studio.photoUrl,
    photoUrls: studio.photoUrls ?? (studio.photoUrl ? [studio.photoUrl] : []),
    phone: studio.phone,
    openLabel: undefined,
    cityChip: studio.city,
    coordinates: studio.coordinates,
  };
}
