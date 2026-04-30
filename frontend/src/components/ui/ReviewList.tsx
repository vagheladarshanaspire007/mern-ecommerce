import { useMemo, useState } from 'react';
import type { Review } from '@/types/auth.types';
import { StarRating } from './StarRating';

interface ReviewListProps {
  reviews: Review[];
}

const REVIEWS_PER_PAGE = 5;

function formatReviewDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

export function ReviewList({ reviews }: Readonly<ReviewListProps>) {
  const [visibleCount, setVisibleCount] = useState(REVIEWS_PER_PAGE);
  const visibleReviews = useMemo(() => reviews.slice(0, visibleCount), [reviews, visibleCount]);
  const hasMore = visibleCount < reviews.length;

  if (reviews.length === 0) {
    return (
      <section className="rounded-3xl border border-dashed border-gray-700 bg-gray-800 p-8 text-center">
        <h2 className="text-lg font-semibold text-white">Reviews</h2>
        <p className="mt-2 text-sm text-gray-400">
          No reviews yet. Be the first to leave feedback.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-white">Reviews</h2>
        <span className="text-sm text-gray-400">{reviews.length} total</span>
      </div>

      <div className="space-y-4">
        {visibleReviews.map((review) => (
          <article
            key={review.id}
            className="rounded-3xl border border-gray-700 bg-gray-800 p-5 shadow-md"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">{review.reviewer.firstName}</h3>
                <p className="text-sm text-gray-400">{formatReviewDate(review.createdAt)}</p>
              </div>
              <StarRating rating={review.rating} size={16} showValue={false} />
            </div>
            <p className="mt-3 text-sm leading-6 text-gray-300">{review.comment}</p>
          </article>
        ))}
      </div>

      {hasMore && (
        <button
          type="button"
          onClick={() => setVisibleCount((count) => count + REVIEWS_PER_PAGE)}
          className="inline-flex rounded-full border border-gray-600 px-5 py-2 text-sm font-medium text-gray-100 transition hover:border-indigo-400 hover:text-white"
        >
          Load more
        </button>
      )}
    </section>
  );
}

export default ReviewList;
