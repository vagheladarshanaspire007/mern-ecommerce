import { StarRating } from './StarRating';

export interface ProductReview {
  id: string;
  rating: number;
  reviewerFirstName: string;
  date: string;
  comment: string;
}

interface ReviewListProps {
  readonly reviews: ProductReview[];
  readonly loading?: boolean;
  readonly hasMore?: boolean;
  readonly onLoadMore?: () => void;
}

export function ReviewList({
  reviews,
  loading = false,
  hasMore = false,
  onLoadMore,
}: ReviewListProps) {
  if (!loading && reviews.length === 0) {
    return (
      <div className="rounded-lg border p-6 text-center">
        <p className="text-sm text-gray-500">No reviews yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <article key={review.id} className="rounded-lg border p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">{review.reviewerFirstName}</p>
              <StarRating rating={review.rating} />
            </div>

            <time dateTime={review.date} className="text-sm text-gray-500">
              {new Date(review.date).toLocaleDateString()}
            </time>
          </div>

          <p className="mt-3 text-sm text-gray-700">{review.comment}</p>
        </article>
      ))}

      {loading && <div className="py-4 text-center text-sm text-gray-500">Loading reviews...</div>}

      {!loading && hasMore && onLoadMore && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={onLoadMore}
            className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
