import { PropsWithChildren, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './PageShell.module.css';

interface PageShellProps extends PropsWithChildren {
  title?: string;
  description?: string;
  actions?: ReactNode;
  beforeTitle?: ReactNode;
  hideTitle?: boolean;
}

export function PageShell({ actions, beforeTitle, title, description, children, hideTitle = false }: PageShellProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const backControl = beforeTitle ?? (pathname !== '/' ? <DefaultBackButton onClick={() => navigate(-1)} /> : null);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          {backControl ? <div className={styles.beforeTitle}>{backControl}</div> : null}
          {!hideTitle && title ? <h1 className={styles.title}>{title}</h1> : null}
          {description ? <p className={styles.description}>{description}</p> : null}
        </div>
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </header>
      <div className={styles.content}>{children}</div>
    </main>
  );
}

function DefaultBackButton({ onClick }: { onClick: () => void }) {
  return (
    <button className={styles.backButton} type="button" aria-label="Назад" onClick={onClick}>
      <svg className={styles.backIcon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M19 12H5" />
        <path d="m11 6-6 6 6 6" />
      </svg>
    </button>
  );
}
