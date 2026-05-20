import { YANDEX_METRIKA_ID } from '@/shared/config/env';

declare global {
  interface Window {
    ym?: (counterId: number, method: string, target?: string, params?: Record<string, unknown>) => void;
  }
}

export type AnalyticsGoal =
  | 'tariff_select'
  | 'payment_start'
  | 'payment_success'
  | 'payment_error'
  | 'yclients_click'
  | 'branch_select'
  | 'form_submit'
  | 'certificate_purchase'
  | 'account_login'
  | 'subscription_cancel'
  | 'subscription_freeze';

export function initYandexMetrika() {
  const counterId = Number(YANDEX_METRIKA_ID);
  if (!Number.isInteger(counterId) || counterId <= 0 || typeof document === 'undefined') {
    return;
  }

  if (document.querySelector(`[data-yandex-metrika="${counterId}"]`)) {
    return;
  }

  window.ym =
    window.ym ||
    ((...args: unknown[]) => {
      const ymQueue = window.ym as unknown as { a?: unknown[] };
      ymQueue.a = ymQueue.a || [];
      ymQueue.a.push(args);
    });

  window.ym(counterId, 'init', undefined, {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    webvisor: true,
  });

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://mc.yandex.ru/metrika/tag.js';
  script.dataset.yandexMetrika = String(counterId);
  document.head.append(script);
}

export function reachGoal(goal: AnalyticsGoal, params?: Record<string, unknown>) {
  const counterId = Number(YANDEX_METRIKA_ID);
  if (!Number.isInteger(counterId) || counterId <= 0 || !window.ym) {
    return;
  }

  window.ym(counterId, 'reachGoal', goal, params);
}
