import { Button, LinkButton } from '@/shared/ui/button';
import styles from './SectionHeader.module.css';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionHref?: string;
}

export function SectionHeader({ title, subtitle, actionLabel, actionHref }: SectionHeaderProps) {
  const actionClassName = actionLabel ? styles.compactAction : undefined;
  const action = actionLabel ? (
    actionHref ? (
      <LinkButton className={actionClassName} size="sm" to={actionHref} variant="secondary">
        <span className={styles.actionText}>{actionLabel}</span>
        <span className={styles.actionArrow} aria-hidden="true">→</span>
      </LinkButton>
    ) : (
      <Button className={actionClassName} size="sm" variant="secondary">
        <span className={styles.actionText}>{actionLabel}</span>
        <span className={styles.actionArrow} aria-hidden="true">→</span>
      </Button>
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
