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
        <ActionArrow />
      </LinkButton>
    ) : (
      <Button className={actionClassName} size="sm" variant="secondary">
        <span className={styles.actionText}>{actionLabel}</span>
        <ActionArrow />
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

function ActionArrow() {
  return (
    <svg className={styles.actionArrow} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}
