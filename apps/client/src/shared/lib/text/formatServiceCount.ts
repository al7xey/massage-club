export function formatServiceCount(count: number) {
  const absCount = Math.abs(count);
  const lastTwoDigits = absCount % 100;
  const lastDigit = absCount % 10;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return `${count} услуг`;
  }

  if (lastDigit === 1) {
    return `${count} услуга`;
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return `${count} услуги`;
  }

  return `${count} услуг`;
}
