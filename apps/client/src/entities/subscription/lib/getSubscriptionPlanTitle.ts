export function getSubscriptionPlanTitle(code: string, fallbackName: string) {
  const titleByCode: Record<string, string> = {
    LADY: 'LADY',
    LADY_SUPER: 'LADY SUPER',
    FAMILY: 'FAMILY',
    FAMILY_SUPER: 'FAMILY SUPER',
    MISTER: 'MISTER',
    MISTER_SUPER: 'MISTER SUPER',
  };

  return titleByCode[code] ?? fallbackName;
}
