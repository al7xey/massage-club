const ACCESS_TOKEN_KEY = 'massageClub.accessToken';
const REFRESH_TOKEN_KEY = 'massageClub.refreshToken';
const tokenStorageChangedEvent = 'massage-club-token-storage';

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function notifyChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(tokenStorageChangedEvent));
  }
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export const tokenStorage = {
  eventName: tokenStorageChangedEvent,
  getAccessToken(): string | null {
    if (!canUseStorage()) {
      return null;
    }

    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  getRefreshToken(): string | null {
    if (!canUseStorage()) {
      return null;
    }

    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  getTokens(): AuthTokens | null {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();

    if (!accessToken || !refreshToken) {
      return null;
    }

    return { accessToken, refreshToken };
  },
  setTokens(tokens: AuthTokens) {
    if (!canUseStorage()) {
      return;
    }

    window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    notifyChanged();
  },
  setAccessToken(token: string) {
    if (!canUseStorage()) {
      return;
    }

    window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
    notifyChanged();
  },
  removeTokens() {
    if (!canUseStorage()) {
      return;
    }

    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    notifyChanged();
  },
};
