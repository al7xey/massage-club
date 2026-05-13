import { PropsWithChildren } from 'react';
import { HomeBreadcrumb } from '../breadcrumbs/HomeBreadcrumb';

interface PageShellProps extends PropsWithChildren {
  title: string;
  description?: string;
  showBreadcrumb?: boolean;
}

export function PageShell({ title, description, showBreadcrumb = true, children }: PageShellProps) {
  return (
    <main className="legacy-page">
      {showBreadcrumb ? <HomeBreadcrumb /> : null}
      <h1 className="legacy-page__title">{title}</h1>
      {description ? <p className="legacy-page__description">{description}</p> : null}
      <div className="legacy-content">{children}</div>
    </main>
  );
}
