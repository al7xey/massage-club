import { Button, LinkButton } from '@/shared/ui/button';
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
      <LinkButton size="sm" to={actionHref} variant="secondary">
        {actionLabel}
      </LinkButton>
    ) : (
      <Button size="sm" variant="secondary">
        {actionLabel}
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
