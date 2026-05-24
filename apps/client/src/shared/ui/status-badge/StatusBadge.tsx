import type { HTMLAttributes } from 'react';
import { cx } from '@/shared/ui/button';
import styles from './StatusBadge.module.css';

export type StatusBadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'muted';
export type AppStatus =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  | 'paid'
  | 'unpaid'
  | 'expired'
  | 'used'
  | 'error';

interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status?: AppStatus | string;
  tone?: StatusBadgeTone;
}

export function StatusBadge({ children, className, status, tone, ...props }: StatusBadgeProps) {
  const resolved = status ? resolveStatus(status) : { label: children, tone: tone ?? 'neutral' };
  return (
    <span className={cx(styles.badge, styles[resolved.tone], className)} {...props}>
      {children ?? resolved.label}
    </span>
  );
}

function resolveStatus(status: string): { label: string; tone: StatusBadgeTone } {
  const normalized = status.toLowerCase();
  const map: Record<string, { label: string; tone: StatusBadgeTone }> = {
    active: { label: 'active', tone: 'success' },
    confirmed: { label: 'confirmed', tone: 'success' },
    paid: { label: 'paid', tone: 'success' },
    completed: { label: 'completed', tone: 'success' },
    pending: { label: 'pending', tone: 'warning' },
    unpaid: { label: 'unpaid', tone: 'warning' },
    inactive: { label: 'inactive', tone: 'muted' },
    cancelled: { label: 'cancelled', tone: 'muted' },
    expired: { label: 'expired', tone: 'muted' },
    used: { label: 'used', tone: 'muted' },
    no_show: { label: 'no show', tone: 'danger' },
    error: { label: 'error', tone: 'danger' },
  };

  return map[normalized] ?? { label: normalized, tone: toneForUnknown(normalized) };
}

function toneForUnknown(status: string): StatusBadgeTone {
  if (['scheduled', 'open', 'in_progress'].includes(status)) return 'warning';
  if (['failed', 'blocked'].includes(status)) return 'danger';
  return 'neutral';
}

