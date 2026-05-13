import type { MasterCardModel, MasterDto } from '../model/types';

const masterMetaByName: Record<string, Omit<MasterCardModel, 'id' | 'fullName'>> = {
  'Елена Смирнова': {
    experienceLabel: 'Опыт 8 лет',
    roleLabel: 'ТОП-МАСТЕР, СПЕЦИАЛИСТ ПО ЛИМФОДРЕНАЖУ',
    rating: 5,
    reviewsCount: 124,
    nextSlots: ['10:00', '12:30', '15:00'],
  },
  'Роман Петров': {
    experienceLabel: 'Опыт 6 лет',
    roleLabel: 'ТОП-МАСТЕР, СПЕЦИАЛИСТ ПО СПОРТИВНОМУ МАССАЖУ',
    rating: 4.9,
    reviewsCount: 87,
    nextSlots: ['11:00', '14:00', '17:30'],
  },
};

export function createMasterCardModel(master: MasterDto): MasterCardModel {
  const fullName = `${master.firstName} ${master.lastName}`;
  const meta =
    masterMetaByName[fullName] ?? {
      experienceLabel: 'Опыт 7 лет',
      roleLabel: 'ТОП-МАСТЕР, СПЕЦИАЛИСТ ПО МАССАЖУ',
      rating: 4.9,
      reviewsCount: 90,
      nextSlots: ['10:30', '13:00', '16:00'],
    };

  return {
    id: master.id,
    fullName,
    ...meta,
  };
}
