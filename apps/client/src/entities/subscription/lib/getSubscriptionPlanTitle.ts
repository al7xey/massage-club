export function getSubscriptionPlanTitle(code: string, fallbackName: string) {
  const titleByCode: Record<string, string> = {
    LADY: 'LADY',
    LADY_SUPER: 'LADY SUPER',
    MISTER: 'MISTER',
    MISTER_SUPER: 'MISTER SUPER',
    FAMILY: 'FAMILY',
    FAMILY_SUPER: 'FAMILY SUPER',
  };

  return titleByCode[code] ?? fallbackName;
}

const subscriptionPlanOrder = ['LADY', 'LADY_SUPER', 'MISTER', 'MISTER_SUPER', 'FAMILY', 'FAMILY_SUPER'] as const;

export function getSubscriptionPlanSortIndex(code: string) {
  const index = subscriptionPlanOrder.indexOf(code as (typeof subscriptionPlanOrder)[number]);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

export function getSubscriptionPlanSlug(code: string) {
  const slugByCode: Record<string, string> = {
    LADY: 'lady',
    LADY_SUPER: 'lady-super',
    MISTER: 'mister',
    MISTER_SUPER: 'mister-super',
    FAMILY: 'family',
    FAMILY_SUPER: 'family-super',
  };

  return slugByCode[code] ?? code.toLowerCase().replace(/_/g, '-');
}

export function normalizeSubscriptionPlanSlug(value: string) {
  return value.trim().toLowerCase();
}
