import type { MasterCardModel, MasterDto } from '../model/types';

export function createMasterCardModel(master: MasterDto): MasterCardModel {
  const fullName = `${master.firstName} ${master.lastName}`;

  return {
    id: master.id,
    fullName,
    specialization: master.specialization,
    photoUrl: master.photoUrl ?? master.photoUrls?.[0] ?? null,
  };
}
