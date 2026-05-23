import { StudioCard, type StudioCardModel } from '@/entities/studio';
import { appRoutes } from '@/shared/routes';
import { SectionHeader } from '@/shared/ui/section-header/SectionHeader';
import styles from './StudioShowcase.module.css';

interface StudioShowcaseProps {
  title: string;
  studios: StudioCardModel[];
  actionLabel?: string;
}

export function StudioShowcase({ title, studios, actionLabel }: StudioShowcaseProps) {
  return (
    <section className={styles.section}>
      <SectionHeader title={title} actionLabel={actionLabel} actionHref={actionLabel ? appRoutes.studios() : undefined} />
      <div className={styles.list}>
        {studios.map((studio) => (
          <StudioCard key={studio.id} studio={studio} variant="compact" />
        ))}
      </div>
    </section>
  );
}
