import { HomeBreadcrumb } from '@/shared/ui/breadcrumbs/HomeBreadcrumb';
import { repeatToLength } from '@/shared/lib/collection/repeatToLength';
import { createMasterCardModel, MasterCard, useGetMastersQuery } from '@/entities/master';

export function MastersPage() {
  const { data = [], isLoading } = useGetMastersQuery();
  const cards = repeatToLength(data, 4).map(createMasterCardModel);

  return (
    <main className="page">
      <section className="page-heading">
        <HomeBreadcrumb />
        <h1>Наши мастера</h1>
        <p>
          Откройте для себя мир осознанного ухода. Профессиональные массажи,
          SPA-ритуалы и эстетическая косметология для вашей гармонии.
        </p>
      </section>

      {isLoading ? <p className="state-line">Загрузка мастеров...</p> : null}

      <section className="masters-grid">
        {cards.map((master, index) => (
          <MasterCard key={`${master.id}-${index}`} master={master} imageVariant={index % 2 === 0 ? 'a' : 'b'} />
        ))}
      </section>
    </main>
  );
}
