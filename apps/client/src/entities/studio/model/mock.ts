import type { StudioDto } from './types';

export const mockStudios: StudioDto[] = [
  {
    id: 'studio-center',
    name: 'Massage Club Центр',
    address: 'Астрахань, ул. Советская, 10',
    city: 'Астрахань',
    phone: '+7 (812) 44-10-10',
    coordinates: { lat: 46.3492, lon: 48.0409 },
  },
  {
    id: 'studio-park',
    name: 'Massage Club Парк',
    address: 'Астрахань, ул. Набережная, 23',
    city: 'Астрахань',
    phone: '+7 (812) 38-11-20',
    coordinates: { lat: 46.3551, lon: 48.0554 },
  },
];
