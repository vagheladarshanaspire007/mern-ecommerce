import { Star } from 'lucide-react';

interface StarRatingProps {
  readonly rating: number;
  readonly maxRating?: number;
  readonly showValue?: boolean;
}

export function StarRating({ rating, maxRating = 5, showValue = false }: StarRatingProps) {
  const normalizedRating = Math.min(Math.max(rating, 0), maxRating);

  return (
    <div
      className="flex items-center gap-1"
      aria-label={`Rating: ${normalizedRating} out of ${maxRating}`}
    >
      <div className="flex" aria-hidden="true">
        {Array.from({ length: maxRating }, (_, index) => {
          const starNumber = index + 1;
          const isFilled = starNumber <= Math.round(normalizedRating);

          return (
            <Star
              key={starNumber}
              className="h-4 w-4"
              fill={isFilled ? 'currentColor' : 'none'}
              strokeWidth={1.5}
            />
          );
        })}
      </div>

      {showValue && (
        <span className="ml-1 text-sm text-gray-600">{normalizedRating.toFixed(1)}</span>
      )}
    </div>
  );
}
