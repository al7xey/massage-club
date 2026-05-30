const pendingCartServiceIdKey = 'relaxup:pending-cart-service-id';

export const pendingCartStorage = {
  clear() {
    getSessionStorage()?.removeItem(pendingCartServiceIdKey);
  },
  get() {
    return getSessionStorage()?.getItem(pendingCartServiceIdKey) ?? null;
  },
  set(serviceId: string) {
    getSessionStorage()?.setItem(pendingCartServiceIdKey, serviceId);
  },
};

function getSessionStorage() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}
