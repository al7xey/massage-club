import type { ReactNode } from 'react';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  actions?: ReactNode;
  description?: string;
  title: string;
}

export function EmptyState({ actions, description, title }: EmptyStateProps) {
  return (
    <div className={styles.empty}>
      <h2 className={styles.title}>{title}</h2>
      {description ? <p className={styles.description}>{description}</p> : null}
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </div>
  );
}

