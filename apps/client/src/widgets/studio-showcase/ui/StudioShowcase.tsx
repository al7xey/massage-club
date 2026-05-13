import { StudioCard, type StudioCardModel } from '@/entities/studio';
import { SectionHeader } from '@/shared/ui/section-header/SectionHeader';

interface StudioShowcaseProps {
  title: string;
  studios: StudioCardModel[];
  actionLabel?: string;
  sectionClassName?: string;
  listClassName?: string;
}

export function StudioShowcase({
  title,
  studios,
  actionLabel,
  sectionClassName = 'section',
  listClassName = 'studios-list',
}: StudioShowcaseProps) {
  return (
    <section className={sectionClassName}>
      <SectionHeader title={title} actionLabel={actionLabel} />
      <div className={listClassName}>
        {studios.map((studio) => (
          <StudioCard key={studio.id} studio={studio} />
        ))}
      </div>
    </section>
  );
}
