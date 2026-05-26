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
