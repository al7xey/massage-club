import { ReviewCard, type ReviewCardModel } from '@/entities/review';
import { SectionHeader } from '@/shared/ui/section-header/SectionHeader';

interface ReviewsShowcaseProps {
  title: string;
  reviews: ReviewCardModel[];
  subtitle?: string;
  actionLabel?: string;
  sectionClassName?: string;
  gridClassName?: string;
}

export function ReviewsShowcase({
  title,
  reviews,
  subtitle,
  actionLabel,
  sectionClassName = 'section',
  gridClassName = 'reviews-grid',
}: ReviewsShowcaseProps) {
  return (
    <section className={sectionClassName}>
      <SectionHeader title={title} subtitle={subtitle} actionLabel={actionLabel} />
      <div className={gridClassName}>
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </section>
  );
}
