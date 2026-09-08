import type { ReactNode } from 'react';

/**
 * Props for the reusable EmptyState component.
 */
export interface EmptyStateProps {
  /**
   * Icon displayed above the empty-state content.
   */
  readonly icon: ReactNode;

  /**
   * Main title describing the empty state.
   */
  readonly title: string;

  /**
   * Additional information displayed below the title.
   */
  readonly description: string;

  /**
   * Optional call-to-action content, usually a Button.
   */
  readonly action?: ReactNode;

  /**
   * Additional CSS classes for customizing the empty state.
   */
  readonly className?: string;
}

/**
 * Reusable empty-state component for pages without content.
 */
export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div
      className={['flex flex-col items-center justify-center px-6 py-12 text-center', className]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-500"
        aria-hidden="true"
      >
        {icon}
      </div>

      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>

      <p className="mt-2 max-w-md text-sm text-gray-500">{description}</p>

      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
