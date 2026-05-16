import { ServiceCard, type ServiceCardModel } from '@/entities/service';
import { appRoutes } from '@/shared/routes';
import { SectionHeader } from '@/shared/ui/section-header/SectionHeader';
import styles from './ServiceShowcase.module.css';

interface ServiceShowcaseProps {
  title: string;
  services: ServiceCardModel[];
  actionLabel?: string;
}

export function ServiceShowcase({ title, services, actionLabel }: ServiceShowcaseProps) {
  return (
    <section className={styles.section}>
      <SectionHeader title={title} actionLabel={actionLabel} actionHref={actionLabel ? appRoutes.services() : undefined} />
      <div className={styles.grid}>
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </section>
  );
}
