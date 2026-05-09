import { PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';

interface PageProps extends PropsWithChildren {
  title: string;
  description?: string;
}

export function Page({ title, description, children }: PageProps) {
  return (
    <main className="legacy-page">
      <p className="home-crumb">
        <Link to="/">Главная</Link>
      </p>
      <h1 className="legacy-page__title">{title}</h1>
      {description ? <p className="legacy-page__description">{description}</p> : null}
      <div className="legacy-content">{children}</div>
    </main>
  );
}
