import { PropsWithChildren } from 'react';

interface PageProps extends PropsWithChildren {
  title: string;
  description?: string;
}

export function Page({ title, description, children }: PageProps) {
  return (
    <main className="page">
      <h1>{title}</h1>
      {description ? <p className="lead">{description}</p> : null}
      {children}
    </main>
  );
}
