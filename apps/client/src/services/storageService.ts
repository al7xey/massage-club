import { demoUsers } from '@/data/mockData';
import type { Appointment, GiftCertificate, Payment, UserSubscription } from '@/types';

export type StoredUser = (typeof demoUsers)[number];

const keys = {
  users: 'massageClub.users',
  sessionUserId: 'massageClub.sessionUserId',
  subscriptions: 'massageClub.subscriptions',
  payments: 'massageClub.payments',
  appointments: 'massageClub.appointments',
  certificates: 'massageClub.certificates',
} as const;

export const mockStorageEvent = 'massage-club-storage';

export function notifyMockStorageChanged() {
  window.dispatchEvent(new Event(mockStorageEvent));
}

export function createId(prefix: string) {
  const random = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  return `${prefix}-${random}`;
}

export function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJson<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
  notifyMockStorageChanged();
}

export function ensureSeedData() {
  const currentUsers = readJson<StoredUser[]>(keys.users, []);
  const userMap = new Map(currentUsers.map((user) => [user.email.toLowerCase(), user]));

  demoUsers.forEach((user) => {
    if (!userMap.has(user.email.toLowerCase())) {
      currentUsers.push(user);
    }
  });

  writeJson(keys.users, currentUsers);
  if (!localStorage.getItem(keys.subscriptions)) writeJson<UserSubscription[]>(keys.subscriptions, []);
  if (!localStorage.getItem(keys.payments)) writeJson<Payment[]>(keys.payments, []);
  if (!localStorage.getItem(keys.appointments)) writeJson<Appointment[]>(keys.appointments, []);
  if (!localStorage.getItem(keys.certificates)) writeJson<GiftCertificate[]>(keys.certificates, []);
}

export const mockKeys = keys;
