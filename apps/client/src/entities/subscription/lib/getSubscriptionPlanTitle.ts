export function getSubscriptionPlanTitle(code: string, fallbackName: string) {
  const titleByCode: Record<string, string> = {
    LADY: 'Леди',
    LADY_SUPER: 'Леди Супер',
    FAMILY: 'Фэмили',
    FAMILY_SUPER: 'Фэмили Супер',
    MISTER: 'Мистер',
    MISTER_SUPER: 'Мистер Супер',
  };

  return titleByCode[code] ?? fallbackName;
}
