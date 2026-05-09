import type { MasterDto, ServiceDto, StudioDto, SubscriptionPlanDto } from '@/shared/types/domain';
import type {
  ServiceTone,
  UiLandingContent,
  UiMasterMeta,
  UiPlanMeta,
  UiServiceCard,
  UiStudioMeta,
} from '@/shared/types/publicUi';

const serviceTones: ServiceTone[] = ['massage', 'care', 'spa', 'neutral'];
const serviceLabels = ['РњР°СЃСЃР°Р¶', 'РЈС…РѕРґ', 'SPA', 'РџСЂРѕС†РµРґСѓСЂР°'];

const planTitles = ['Lady', 'Lady Super', 'Family Super'];

export const landingContent: UiLandingContent = {
  reviews: [
    {
      id: 'r1',
      author: 'РђРЅРЅР° РљСѓР·РЅРµС†РѕРІР°',
      role: 'РџРѕСЃС‚РѕСЏРЅРЅС‹Р№ РіРѕСЃС‚СЊ',
      text: 'РџРѕС‚СЂСЏСЃР°СЋС‰РёР№ СЌС„С„РµРєС‚ СѓР¶Рµ РїРѕСЃР»Рµ РїРµСЂРІРѕРіРѕ СЃРµР°РЅСЃР°. Р›РµРіРєРѕСЃС‚СЊ РІ С‚РµР»Рµ Рё РѕС‡РµРЅСЊ РІРЅРёРјР°С‚РµР»СЊРЅС‹Р№ РјР°СЃС‚РµСЂ.',
      date: '15 РЅРѕСЏР±СЂСЏ 2025',
      rating: 5,
    },
    {
      id: 'r2',
      author: 'РњРёС…Р°РёР» РџРµС‚СЂРѕРІ',
      role: 'Р’Р»Р°РґРµР»РµС† С‚Р°СЂРёС„Р° Master',
      text: 'РЈСЋС‚РЅР°СЏ СЃС‚СѓРґРёСЏ Рё СѓРґРѕР±РЅР°СЏ Р·Р°РїРёСЃСЊ. РџРѕ РїРѕРґРїРёСЃРєРµ СЃС‚Р°Р» С…РѕРґРёС‚СЊ РЅР° РјР°СЃСЃР°Р¶ СЂРµРіСѓР»СЏСЂРЅРѕ.',
      date: '4 РґРµРєР°Р±СЂСЏ 2025',
      rating: 5,
    },
    {
      id: 'r3',
      author: 'Р•Р»РµРЅР° РЎР°РјРѕР№Р»РѕРІР°',
      role: 'Р“РѕСЃС‚СЊ РєР»СѓР±Р°',
      text: 'РЎ РїРѕРґРїРёСЃРєРѕР№ СЃС‚Р°Р»Рѕ РіРѕСЂР°Р·РґРѕ РІС‹РіРѕРґРЅРµРµ. РќСЂР°РІРёС‚СЃСЏ СЃС‚Р°Р±РёР»СЊРЅС‹Р№ СЃРµСЂРІРёСЃ Рё Р°С‚РјРѕСЃС„РµСЂР°.',
      date: '21 СЏРЅРІР°СЂСЏ 2026',
      rating: 5,
    },
  ],
  certificatePresets: [
    { value: 1000, label: '1000 в‚Ѕ' },
    { value: 3000, label: '3000 в‚Ѕ' },
    { value: 5000, label: '5000 в‚Ѕ' },
    { value: 10000, label: '10000 в‚Ѕ' },
  ],
};

const studioMetaByName: Record<string, UiStudioMeta> = {
  'Massage Club Р¦РµРЅС‚СЂ': {
    phone: '+7 (812) 44-10-10',
    openLabel: 'Р•Р¶РµРґРЅРµРІРЅРѕ: 10:00 - 20:00',
    cityChip: 'РђСЃС‚СЂР°С…Р°РЅСЊ',
  },
  'Massage Club РџР°СЂРє': {
    phone: '+7 (812) 38-11-20',
    openLabel: 'Р•Р¶РµРґРЅРµРІРЅРѕ: 10:00 - 20:00',
    cityChip: 'РђСЃС‚СЂР°С…Р°РЅСЊ',
  },
};

const masterMetaByName: Record<string, UiMasterMeta> = {
  'Р•Р»РµРЅР° РЎРјРёСЂРЅРѕРІР°': {
    experienceLabel: 'РћРїС‹С‚ 8 Р»РµС‚',
    roleLabel: 'РўРћРџ-РњРђРЎРўР•Р , РЎРџР•Р¦РРђР›РРЎРў РџРћ Р›РРњР¤РћР”Р Р•РќРђР–РЈ',
    rating: 5,
    reviewsCount: 124,
    nextSlots: ['10:00', '12:30', '15:00'],
  },
  'Р РѕРјР°РЅ РџРµС‚СЂРѕРІ': {
    experienceLabel: 'РћРїС‹С‚ 6 Р»РµС‚',
    roleLabel: 'РўРћРџ-РњРђРЎРўР•Р , РЎРџР•Р¦РРђР›РРЎРў РџРћ РЎРџРћР РўРР’РќРћРњРЈ РњРђРЎРЎРђР–РЈ',
    rating: 4.9,
    reviewsCount: 87,
    nextSlots: ['11:00', '14:00', '17:30'],
  },
};

export function formatPrice(price: number): string {
  return `${price.toLocaleString('ru-RU')} в‚Ѕ`;
}

export function createUiServiceCard(service: ServiceDto, index: number): UiServiceCard {
  const tone = serviceTones[index % serviceTones.length];
  const label = serviceLabels[index % serviceLabels.length];

  return {
    ...service,
    tone,
    categoryLabel: label,
    oldPriceRub: Math.round(service.priceRub * 1.25),
    badgeText: `${service.durationMinutes} мин`,
  };
}

export function createUiPlanMeta(plan: SubscriptionPlanDto, index: number): UiPlanMeta {
  const title = planTitles[index] ?? plan.name;
  return {
    title,
    subtitle: `РґРѕ ${plan.discountPercent}% РЅР° СѓСЃР»СѓРіРё`,
    features: [
      `${plan.includedCredits} РїРѕСЃРµС‰РµРЅРёСЏ`,
      `РЎРєРёРґРєР° ${plan.discountPercent}% РЅР° СѓСЃР»СѓРіРё`,
      'РЎРєРёРґРєР° 20% РЅР° СЃРµСЂС‚РёС„РёРєР°С‚С‹',
    ],
  };
}

export function createUiStudioMeta(studio: StudioDto): UiStudioMeta {
  return (
    studioMetaByName[studio.name] ?? {
      phone: studio.phone ?? '+7 (800) 555-35-35',
      openLabel: 'Р•Р¶РµРґРЅРµРІРЅРѕ: 10:00 - 20:00',
      cityChip: studio.city,
    }
  );
}

export function createUiMasterMeta(master: MasterDto): UiMasterMeta {
  const fullName = `${master.firstName} ${master.lastName}`;
  return (
    masterMetaByName[fullName] ?? {
      experienceLabel: 'РћРїС‹С‚ 7 Р»РµС‚',
      roleLabel: 'РўРћРџ-РњРђРЎРўР•Р , РЎРџР•Р¦РРђР›РРЎРў РџРћ РњРђРЎРЎРђР–РЈ',
      rating: 4.9,
      reviewsCount: 90,
      nextSlots: ['10:30', '13:00', '16:00'],
    }
  );
}

export function repeatToLength<T>(items: T[], length: number): T[] {
  if (items.length === 0 || length <= 0) return [];
  const result: T[] = [];
  for (let i = 0; i < length; i += 1) {
    result.push(items[i % items.length]);
  }
  return result;
}
