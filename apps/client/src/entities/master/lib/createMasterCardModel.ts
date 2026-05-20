import type { MasterCardModel, MasterDto } from '../model/types';

const masterCardPresets: Array<Omit<MasterCardModel, 'fullName' | 'id'>> = [
  {
    experienceLabel: 'Опыт 8 лет',
    roleLabel: 'ТОП-МАСТЕР, СПЕЦИАЛИСТ ПО ЛИМФОДРЕНАЖУ',
    summary: 'Мягко работает с отечностью, восстановлением после нагрузок и глубоким расслаблением.',
    rating: 5,
    reviewsCount: 124,
    nextSlots: ['10:00', '12:30', '15:00'],
  },
  {
    experienceLabel: 'Опыт 6 лет',
    roleLabel: 'ТОП-МАСТЕР, СПЕЦИАЛИСТ ПО СПОРТИВНОМУ МАССАЖУ',
    summary: 'Помогает снять мышечные зажимы, вернуть подвижность и восстановиться после тренировок.',
    rating: 4.9,
    reviewsCount: 87,
    nextSlots: ['11:00', '14:00', '17:30'],
  },
  {
    experienceLabel: 'Опыт 7 лет',
    roleLabel: 'ТОП-МАСТЕР, СПЕЦИАЛИСТ ПО SPA-ПРОГРАММАМ',
    summary: 'Выстраивает ритуалы ухода для глубокой перезагрузки и комфортного восстановления.',
    rating: 5,
    reviewsCount: 101,
    nextSlots: ['09:30', '13:30', '16:30'],
  },
];

export function createMasterCardModel(master: MasterDto, index: number): MasterCardModel {
  const fullName = `${master.firstName} ${master.lastName}`;
  const preset = masterCardPresets[index % masterCardPresets.length];

  return {
    id: master.id,
    fullName,
    ...preset,
    summary: master.bio ?? preset.summary,
  };
}
