import clsx from 'clsx';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: number;
  showValue?: boolean;
  className?: string;
}

export function StarRating({
  rating,
  reviewCount,
  size = 18,
  showValue = true,
  className,
}: Readonly<StarRatingProps>) {
  const boundedRating = Math.max(0, Math.min(5, rating));

  return (
    <div
      className={clsx('flex items-center gap-3', className)}
      aria-label={`Rated ${boundedRating} out of 5`}
    >
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, index) => {
          const fillPercent = Math.max(0, Math.min(1, boundedRating - index));

          return (
            <span
              key={index}
              className="relative inline-flex"
              style={{ width: size, height: size }}
            >
              <Star size={size} className="text-gray-300" aria-hidden="true" />
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fillPercent * 100}%` }}
                aria-hidden="true"
              >
                <Star size={size} className="fill-amber-400 text-amber-400" />
              </span>
            </span>
          );
        })}
      </div>
      {(showValue || typeof reviewCount === 'number') && (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          {showValue && (
            <span className="font-medium text-white">{boundedRating.toFixed(1)}</span>
          )}
          {typeof reviewCount === 'number' && <span>({reviewCount} reviews)</span>}
        </div>
      )}
    </div>
  );
}

export default StarRating;
