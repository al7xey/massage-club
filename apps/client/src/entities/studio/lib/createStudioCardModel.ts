import type { StudioCardModel, StudioDto } from '../model/types';

const studioMetaByName: Record<string, Omit<StudioCardModel, 'id' | 'title' | 'address' | 'photoUrl' | 'photoUrls'>> = {
  'Massage Club Центр': {
    phone: '+7 (495) 000-00-01',
    openLabel: 'Ежедневно: 10:00 - 20:00',
    cityChip: 'Москва',
    coordinates: { lat: 55.7603, lon: 37.6138 },
  },
  'Massage Club Парк': {
    phone: '+7 (495) 000-00-02',
    openLabel: 'Ежедневно: 10:00 - 20:00',
    cityChip: 'Москва',
    coordinates: { lat: 55.7068, lon: 37.5752 },
  },
};

export function createStudioCardModel(studio: StudioDto, index = 0): StudioCardModel {
  const meta = studioMetaByName[studio.name] ?? {
    phone: studio.phone ?? '+7 (800) 555-35-35',
    openLabel: 'Ежедневно: 10:00 - 20:00',
    cityChip: studio.city,
    coordinates: studio.coordinates ?? { lat: 55.75 + index * 0.006, lon: 37.61 + index * 0.014 },
  };

  return {
    id: studio.id,
    title: studio.name,
    address: studio.address,
    photoUrl: studio.photoUrl,
    photoUrls: studio.photoUrls ?? (studio.photoUrl ? [studio.photoUrl] : []),
    ...meta,
  };
}
