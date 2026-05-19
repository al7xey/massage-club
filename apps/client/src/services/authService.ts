import type { User } from '@/types';
import { ensureSeedData, mockKeys, readJson, writeJson, type StoredUser } from './storageService';

function sanitizeUser(user: StoredUser): User {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

export const authService = {
  getCurrentUser(): User | null {
    ensureSeedData();
    const sessionUserId = localStorage.getItem(mockKeys.sessionUserId);
    if (!sessionUserId) return null;

    const user = readJson<StoredUser[]>(mockKeys.users, []).find((item) => item.id === sessionUserId);
    return user ? sanitizeUser(user) : null;
  },

  login(email: string, password: string): User {
    ensureSeedData();
    const normalizedEmail = email.trim().toLowerCase();
    const users = readJson<StoredUser[]>(mockKeys.users, []);
    const user = users.find((item) => item.email.toLowerCase() === normalizedEmail);

    if (!user) {
      throw new Error('Пользователь не найден');
    }

    if (user.password !== password) {
      throw new Error('Неверный пароль');
    }

    localStorage.setItem(mockKeys.sessionUserId, user.id);
    return sanitizeUser(user);
  },

  register(data: { name: string; email: string; phone: string; password: string }): User {
    ensureSeedData();
    const normalizedEmail = data.email.trim().toLowerCase();
    const users = readJson<StoredUser[]>(mockKeys.users, []);

    if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
      throw new Error('Пользователь уже существует');
    }

    const user: StoredUser = {
      id: `user-${Date.now()}`,
      name: data.name.trim(),
      email: normalizedEmail,
      phone: data.phone.trim(),
      role: 'client',
      password: data.password,
      createdAt: new Date().toISOString(),
    };

    writeJson(mockKeys.users, [...users, user]);
    localStorage.setItem(mockKeys.sessionUserId, user.id);
    return sanitizeUser(user);
  },

  updateProfile(userId: string, data: { name: string; phone: string }): User {
    const users = readJson<StoredUser[]>(mockKeys.users, []);
    const nextUsers = users.map((user) => (user.id === userId ? { ...user, name: data.name.trim(), phone: data.phone.trim() } : user));
    writeJson(mockKeys.users, nextUsers);

    const nextUser = nextUsers.find((user) => user.id === userId);
    if (!nextUser) {
      throw new Error('Пользователь не найден');
    }

    return sanitizeUser(nextUser);
  },

  logout() {
    localStorage.removeItem(mockKeys.sessionUserId);
  },

  getUsers(): User[] {
    ensureSeedData();
    return readJson<StoredUser[]>(mockKeys.users, []).map(sanitizeUser);
  },
};
