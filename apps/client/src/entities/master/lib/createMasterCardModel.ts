import type { MasterCardModel, MasterDto } from '../model/types';

export function createMasterCardModel(master: MasterDto, index: number): MasterCardModel {
  const fullName = `${master.firstName} ${master.lastName}`;
  const servicesCount = master.services?.length ?? 0;

  return {
    id: master.id,
    fullName,
    experienceLabel: 'Стаж 5+ лет',
    roleLabel: 'Мастер массажа и SPA',
    summary: master.bio ?? `Работает со всем стартовым каталогом RelaxUp: ${servicesCount} услуг.`,
    rating: index % 2 === 0 ? 5 : 4.9,
    reviewsCount: 40 + index * 11,
    nextSlots: [],
  };
}
