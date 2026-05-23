import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import type { AuthResponseDto, PublicUserDto, UserGender } from '@massage/shared';
import { API_BASE_URL } from '@/shared/config/env';
import { formatUserDisplayName } from '@/shared/lib/auth/formatUserDisplayName';
import { tokenStorage } from '@/shared/lib/storage/tokenStorage';

type ApiRequestInit = RequestInit & { accessToken?: string | null };

interface RegisterPayload {
  fullName: string;
  email?: string;
  phone?: string;
  gender: UserGender;
  password: string;
}

interface UpdateProfilePayload {
  fullName: string;
  email?: string;
  phone?: string;
  avatarUrl?: string | null;
}

interface AuthContextValue {
  user: PublicUserDto | null;
  userDisplayName: string;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  login: (identifier: string, password: string) => Promise<PublicUserDto>;
  register: (data: RegisterPayload) => Promise<void>;
  updateProfile: (data: UpdateProfilePayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<PublicUserDto | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const syncSession = useCallback(async () => {
    const tokens = tokenStorage.getTokens();

    if (!tokens) {
      setUser(null);
      return;
    }

    try {
      const currentUser = await apiRequest<PublicUserDto>('/users/me', { accessToken: tokens.accessToken });
      setUser(currentUser);
    } catch (error) {
      const status = typeof error === 'object' && error !== null && 'status' in error ? Number(error.status) : null;

      if (status !== 401) {
        throw error;
      }

      try {
        const authResponse = await apiRequest<AuthResponseDto>('/auth/refresh', {
          method: 'POST',
          body: JSON.stringify({ refreshToken: tokens.refreshToken }),
        });

        tokenStorage.setTokens({
          accessToken: authResponse.accessToken,
          refreshToken: authResponse.refreshToken,
        });
        setUser(authResponse.user);
      } catch {
        tokenStorage.removeTokens();
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      setIsAuthLoading(true);

      try {
        await syncSession();
      } finally {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      }
    };

    const handleTokenStorageChanged = () => {
      if (!tokenStorage.getTokens()) {
        setUser(null);
        setIsAuthLoading(false);
      }
    };

    void bootstrap();
    window.addEventListener(tokenStorage.eventName, handleTokenStorageChanged);

    return () => {
      isMounted = false;
      window.removeEventListener(tokenStorage.eventName, handleTokenStorageChanged);
    };
  }, [syncSession]);

  const login = useCallback(async (identifier: string, password: string) => {
    const authResponse = await apiRequest<AuthResponseDto>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });

    tokenStorage.setTokens({
      accessToken: authResponse.accessToken,
      refreshToken: authResponse.refreshToken,
    });
    setUser(authResponse.user);
    return authResponse.user;
  }, []);

  const register = useCallback(async (data: RegisterPayload) => {
    const authResponse = await apiRequest<AuthResponseDto>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    tokenStorage.setTokens({
      accessToken: authResponse.accessToken,
      refreshToken: authResponse.refreshToken,
    });
    setUser(authResponse.user);
  }, []);

  const updateProfile = useCallback(async (data: UpdateProfilePayload) => {
    const nextUser = await authenticatedApiRequest<PublicUserDto>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });

    setUser(nextUser);
  }, []);

  const logout = useCallback(async () => {
    const accessToken = tokenStorage.getAccessToken();

    try {
      if (accessToken) {
        await apiRequest('/auth/logout', {
          method: 'POST',
          accessToken,
        });
      }
    } catch {
      // Ignore logout transport errors and always clear local session.
    } finally {
      tokenStorage.removeTokens();
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authenticatedApiRequest<PublicUserDto>('/users/me');
      setUser(currentUser);
    } catch (error) {
      const status = typeof error === 'object' && error !== null && 'status' in error ? Number(error.status) : null;
      if (status === 401) {
        setUser(null);
      }
      throw error;
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      userDisplayName: user ? formatUserDisplayName(user) : '',
      isAuthenticated: Boolean(user),
      isAuthLoading,
      login,
      register,
      updateProfile,
      logout,
      refreshUser,
    }),
    [isAuthLoading, login, logout, refreshUser, register, updateProfile, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}

async function apiRequest<T = void>(path: string, init: ApiRequestInit = {}) {
  const headers = new Headers(init.headers);
  const accessToken = init.accessToken ?? null;

  if (!headers.has('content-type') && init.body) {
    headers.set('content-type', 'application/json');
  }

  if (accessToken) {
    headers.set('authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const payload = await readJsonBody(response);
    const message = extractMessage(payload) ?? response.statusText ?? 'Request failed';
    const error = new Error(message) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await readJsonBody(response)) as T;
}

async function authenticatedApiRequest<T = void>(path: string, init: RequestInit = {}) {
  const tokens = tokenStorage.getTokens();

  if (!tokens) {
    throw createApiError('Пользователь не авторизован', 401);
  }

  try {
    return await apiRequest<T>(path, { ...init, accessToken: tokens.accessToken });
  } catch (error) {
    const status = typeof error === 'object' && error !== null && 'status' in error ? Number(error.status) : null;

    if (status !== 401) {
      throw error;
    }

    const refreshed = await refreshTokens(tokens.refreshToken);
    return apiRequest<T>(path, { ...init, accessToken: refreshed.accessToken });
  }
}

async function refreshTokens(refreshToken: string) {
  try {
    const authResponse = await apiRequest<AuthResponseDto>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    tokenStorage.setTokens({
      accessToken: authResponse.accessToken,
      refreshToken: authResponse.refreshToken,
    });

    return authResponse;
  } catch (error) {
    tokenStorage.removeTokens();
    throw error;
  }
}

async function readJsonBody(response: Response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function extractMessage(payload: unknown) {
  if (typeof payload === 'string') {
    return payload;
  }

  if (typeof payload !== 'object' || payload === null) {
    return null;
  }

  const maybeMessage = payload as { message?: string | string[] };

  if (Array.isArray(maybeMessage.message)) {
    return maybeMessage.message.join(', ');
  }

  return typeof maybeMessage.message === 'string' ? maybeMessage.message : null;
}

function createApiError(message: string, status: number) {
  const error = new Error(message) as Error & { status?: number };
  error.status = status;
  return error;
}
