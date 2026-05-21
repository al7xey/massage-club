import { PropsWithChildren, type ReactNode } from 'react';
import styles from './PageShell.module.css';

interface PageShellProps extends PropsWithChildren {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageShell({ actions, title, description, children }: PageShellProps) {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{title}</h1>
          {description ? <p className={styles.description}>{description}</p> : null}
        </div>
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </header>
      <div className={styles.content}>{children}</div>
    </main>
  );
}
