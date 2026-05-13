import { ServiceCard, type ServiceCardModel } from '@/entities/service';
import { SectionHeader } from '@/shared/ui/section-header/SectionHeader';

interface ServiceShowcaseProps {
  title: string;
  services: ServiceCardModel[];
  actionLabel?: string;
  sectionClassName?: string;
  gridClassName?: string;
}

export function ServiceShowcase({
  title,
  services,
  actionLabel,
  sectionClassName = 'section',
  gridClassName = 'services-grid',
}: ServiceShowcaseProps) {
  return (
    <section className={sectionClassName}>
      <SectionHeader title={title} actionLabel={actionLabel} />
      <div className={gridClassName}>
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </section>
  );
}
