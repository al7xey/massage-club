import { Link } from 'react-router-dom';
import styles from './SectionHeader.module.css';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionHref?: string;
}

export function SectionHeader({ title, subtitle, actionLabel, actionHref }: SectionHeaderProps) {
  const action = actionLabel ? (
    actionHref ? (
      <Link className={styles.button} to={actionHref}>
        {actionLabel}
      </Link>
    ) : (
      <button className={styles.button} type="button">
        {actionLabel}
      </button>
    )
  ) : null;

  return (
    <div className={styles.header}>
      <div>
        <h2 className={styles.title}>{title}</h2>
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}
