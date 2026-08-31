import type { ReactNode } from 'react';

/**
 * Props for the reusable Card component.
 */
export interface CardProps {
  /**
   * Main content displayed inside the card.
   */
  readonly children: ReactNode;

  /**
   * Optional content displayed in the card header.
   */
  readonly header?: ReactNode;

  /**
   * Optional content displayed in the card footer.
   */
  readonly footer?: ReactNode;

  /**
   * Adds a shadow effect when the user hovers over the card.
   *
   * @default false
   */
  readonly hoverable?: boolean;

  /**
   * Additional CSS classes for customizing the card.
   */
  readonly className?: string;
}

/**
 * Reusable card container for grouping related content.
 */
export function Card({
  children,
  header,
  footer,
  hoverable = false,
  className = '',
}: CardProps) {
  return (
    <div
      className={[
        'overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm',
        'transition-shadow duration-200',
        hoverable ? 'hover:shadow-lg' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {header && (
        <div className="border-b border-gray-200 px-4 py-3">
          {header}
        </div>
      )}

      <div className="p-4">{children}</div>

      {footer && (
        <div className="border-t border-gray-200 px-4 py-3">
          {footer}
        </div>
      )}
    </div>
  );
}