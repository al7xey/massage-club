import type { StudioCardModel, StudioDto } from '../model/types';

const studioMetaByName: Record<string, Omit<StudioCardModel, 'id' | 'title' | 'address'>> = {
  'Massage Club Центр': {
    phone: '+7 (812) 44-10-10',
    openLabel: 'Ежедневно: 10:00 - 20:00',
    cityChip: 'Астрахань',
    coordinates: { lat: 46.3492, lon: 48.0409 },
  },
  'Massage Club Парк': {
    phone: '+7 (812) 38-11-20',
    openLabel: 'Ежедневно: 10:00 - 20:00',
    cityChip: 'Астрахань',
    coordinates: { lat: 46.3551, lon: 48.0554 },
  },
};

export function createStudioCardModel(studio: StudioDto, index = 0): StudioCardModel {
  const meta =
    studioMetaByName[studio.name] ?? {
      phone: studio.phone ?? '+7 (800) 555-35-35',
      openLabel: 'Ежедневно: 10:00 - 20:00',
      cityChip: studio.city,
      coordinates: studio.coordinates ?? { lat: 46.3492 + index * 0.006, lon: 48.0409 + index * 0.014 },
    };

  return {
    id: studio.id,
    title: studio.name,
    address: studio.address,
    ...meta,
  };
}
