import clsx from 'clsx';
import { cva, type VariantProps } from 'class-variance-authority';

const skeletonStyles = cva('animate-pulse bg-slate-200', {
  variants: {
    rounded: {
      true: 'rounded-full',
      false: 'rounded-md',
    },
  },
  defaultVariants: {
    rounded: false,
  },
});

/**
 * Props for the Skeleton component.
 */
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Width of the skeleton placeholder (e.g., 120, '100%', '12rem'). */
  width?: number | string;
  /** Height of the skeleton placeholder (e.g., 20, '1.5rem'). */
  height?: number | string;
  /** Applies fully rounded corners when true. */
  rounded?: boolean;
}

type SkeletonRounded = VariantProps<typeof skeletonStyles>['rounded'];

/**
 * Animated skeleton placeholder for loading states.
 */
export function Skeleton({
  width = '100%',
  height = '1rem',
  rounded = false,
  className,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={clsx(skeletonStyles({ rounded: rounded as SkeletonRounded }), className)}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
      aria-hidden="true"
      {...props}
    />
  );
}
