import type { HTMLAttributes } from 'react';
import { cx } from '@/shared/ui/button';
import styles from './StatusBadge.module.css';

export type StatusBadgeTone = 'neutral' | 'success' | 'warning' | 'danger';

interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: StatusBadgeTone;
}

export function StatusBadge({ className, tone = 'neutral', ...props }: StatusBadgeProps) {
  return <span className={cx(styles.badge, styles[tone], className)} {...props} />;
}

