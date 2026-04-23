import clsx from 'clsx';
import { cva, type VariantProps } from 'class-variance-authority';

const emptyStateStyles = cva(
  'flex w-full flex-col items-center justify-center px-4 py-12 text-center',
  {
    variants: {
      density: {
        comfortable: 'gap-0',
        compact: 'gap-0 py-8',
      },
    },
    defaultVariants: {
      density: 'comfortable',
    },
  }
);

/**
 * Props for the EmptyState component.
 */
export interface EmptyStateProps {
  /** Icon or visual element displayed at the top. */
  icon?: React.ReactNode;
  /** Primary heading text. */
  title: string;
  /** Supporting description text. */
  description: string;
  /** Optional action element such as a button or link. */
  action?: React.ReactNode;
  /** Layout density for the empty state. */
  density?: VariantProps<typeof emptyStateStyles>['density'];
  /** Additional classes for the outer container. */
  className?: string;
}

/**
 * Centered empty-state UI for no-data screens.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  density = 'comfortable',
  className,
}: EmptyStateProps) {
  return (
    <div className={clsx(emptyStateStyles({ density }), className)}>
      {icon ? (
        <div className="mb-4 text-slate-400" aria-hidden="true">
          {icon}
        </div>
      ) : null}
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-slate-600">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
