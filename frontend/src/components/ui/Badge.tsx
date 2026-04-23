import clsx from 'clsx';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeStyles = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium leading-5',
  {
    variants: {
      variant: {
        success: 'bg-emerald-100 text-emerald-800',
        warning: 'bg-amber-100 text-amber-800',
        danger: 'bg-rose-100 text-rose-800',
        neutral: 'bg-slate-100 text-slate-700',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  }
);

/**
 * Props for the Badge component.
 */
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Visual variant used to represent status levels. */
  variant?: VariantProps<typeof badgeStyles>['variant'];
}

/**
 * Compact status badge for counts, stock, and semantic states.
 */
export function Badge({ variant = 'neutral', className, children, ...props }: BadgeProps) {
  return (
    <span className={clsx(badgeStyles({ variant }), className)} {...props}>
      {children}
    </span>
  );
}
