import type { StudioCardModel, StudioDto } from '../model/types';

const studioMetaByName: Record<string, Omit<StudioCardModel, 'id' | 'title' | 'address'>> = {
  'Massage Club Центр': {
    phone: '+7 (812) 44-10-10',
    openLabel: 'Ежедневно: 10:00 - 20:00',
    cityChip: 'Астрахань',
  },
  'Massage Club Парк': {
    phone: '+7 (812) 38-11-20',
    openLabel: 'Ежедневно: 10:00 - 20:00',
    cityChip: 'Астрахань',
  },
};

export function createStudioCardModel(studio: StudioDto): StudioCardModel {
  const meta =
    studioMetaByName[studio.name] ?? {
      phone: studio.phone ?? '+7 (800) 555-35-35',
      openLabel: 'Ежедневно: 10:00 - 20:00',
      cityChip: studio.city,
    };

  return {
    id: studio.id,
    title: studio.name,
    address: studio.address,
    ...meta,
  };
}
