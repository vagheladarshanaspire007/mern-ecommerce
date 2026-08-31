import type { CSSProperties } from 'react';

/**
 * Props for the reusable Skeleton component.
 */
export interface SkeletonProps {
  /**
   * Width of the skeleton.
   *
   * Accepts any valid CSS width value.
   *
   * @default "100%"
   */
  readonly width?: string | number;

  /**
   * Height of the skeleton.
   *
   * Accepts any valid CSS height value.
   *
   * @default "1rem"
   */
  readonly height?: string | number;

  /**
   * Controls the border radius of the skeleton.
   *
   * @default "md"
   */
  readonly rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';

  /**
   * Additional CSS classes for customizing the skeleton.
   */
  readonly className?: string;
}

/**
 * Reusable animated placeholder for loading states.
 */
export function Skeleton({
  width = '100%',
  height = '1rem',
  rounded = 'md',
  className = '',
}: SkeletonProps) {
  const roundedClasses: Record<
    NonNullable<SkeletonProps['rounded']>,
    string
  > = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  const style: CSSProperties = {
    width,
    height,
  };

  return (
    <div
      aria-hidden="true"
      className={[
        'animate-pulse bg-gray-200',
        roundedClasses[rounded],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
    />
  );
}