import type { ReactNode } from 'react';

/**
 * Visual variants supported by the Badge component.
 */
export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

/**
 * Props for the reusable Badge component.
 */
export interface BadgeProps {
  /**
   * Visual style of the badge.
   *
   * @default "default"
   */
  readonly variant?: BadgeVariant;

  /**
   * Content displayed inside the badge.
   */
  readonly children: ReactNode;

  /**
   * Additional CSS classes for customizing the badge.
   */
  readonly className?: string;
}

/**
 * Reusable badge component for statuses, counts, and labels.
 */
export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  const variantClasses: Record<BadgeVariant, string> = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
  };

  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-1',
        'text-xs font-medium',
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  );
}
