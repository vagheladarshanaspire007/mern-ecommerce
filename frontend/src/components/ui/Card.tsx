import clsx from 'clsx';
import { cva, type VariantProps } from 'class-variance-authority';

const cardStyles = cva('rounded-xl border border-slate-200 bg-white', {
  variants: {
    hoverable: {
      true: 'transition-shadow hover:shadow-md',
      false: '',
    },
    density: {
      comfortable: '',
      compact: '',
    },
  },
  defaultVariants: {
    hoverable: false,
    density: 'comfortable',
  },
});

/**
 * Props for the Card component.
 */
export interface CardProps {
  /** Optional header content rendered above the body. */
  header?: React.ReactNode;
  /** Main content of the card. */
  children: React.ReactNode;
  /** Optional footer content rendered below the body. */
  footer?: React.ReactNode;
  /** Enables hover shadow styling for interactive contexts. */
  hoverable?: VariantProps<typeof cardStyles>['hoverable'];
  /** Adds denser spacing for compact layouts. */
  compact?: boolean;
  /** Additional classes for the card container. */
  className?: string;
  /** Additional classes for the body section. */
  contentClassName?: string;
}

/**
 * Reusable card container with optional header and footer slots.
 */
export function Card({
  header,
  children,
  footer,
  hoverable = false,
  compact = false,
  className,
  contentClassName,
}: CardProps) {
  const paddingClassName = compact ? 'p-4' : 'p-5';

  return (
    <section
      className={clsx(
        cardStyles({ hoverable, density: compact ? 'compact' : 'comfortable' }),
        className
      )}
    >
      {header ? (
        <div className={clsx(paddingClassName, 'border-b border-slate-200')}>{header}</div>
      ) : null}
      <div className={clsx(paddingClassName, contentClassName)}>{children}</div>
      {footer ? (
        <div className={clsx(paddingClassName, 'border-t border-slate-200')}>{footer}</div>
      ) : null}
    </section>
  );
}
