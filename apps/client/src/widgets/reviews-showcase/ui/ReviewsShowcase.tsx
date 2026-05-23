import { ReviewCard, type ReviewCardModel } from '@/entities/review';
import { appRoutes } from '@/shared/routes';
import { SectionHeader } from '@/shared/ui/section-header/SectionHeader';
import styles from './ReviewsShowcase.module.css';

interface ReviewsShowcaseProps {
  title: string;
  reviews: ReviewCardModel[];
  subtitle?: string;
  actionLabel?: string;
}

export function ReviewsShowcase({ title, reviews, subtitle, actionLabel }: ReviewsShowcaseProps) {
  return (
    <section className={styles.section}>
      <SectionHeader title={title} actionLabel={actionLabel} actionHref={actionLabel ? appRoutes.reviews() : undefined} />
      <div className={styles.grid}>
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </section>
  );
}
