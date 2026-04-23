import clsx from 'clsx';
import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonStyles = cva(
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
  {
    variants: {
      variant: {
        primary:
          'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500 disabled:hover:bg-blue-600',
        secondary:
          'bg-slate-100 text-slate-900 hover:bg-slate-200 focus-visible:ring-slate-400 disabled:hover:bg-slate-100',
        ghost:
          'bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-400 disabled:hover:bg-transparent',
        danger:
          'bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500 disabled:hover:bg-rose-600',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-5 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

/**
 * Props for the Button component.
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant for the button. */
  variant?: VariantProps<typeof buttonStyles>['variant'];
  /** Size variant for the button. */
  size?: VariantProps<typeof buttonStyles>['size'];
  /** Shows a spinner and disables interaction while loading. */
  isLoading?: boolean;
  /** Shows customized icon in left side of button */
  leftIcon?: React.ReactNode;
  /** Shows customized icon in right side of button */
  rightIcon?: React.ReactNode;
}

/**
 * Reusable button component with variants, sizes, and loading state.
 */
export const Button = forwardRef<HTMLButtonElement, Readonly<ButtonProps>>(function Button(
  {
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled,
    children,
    leftIcon,
    rightIcon,
    ...props
  },
  ref
) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      ref={ref}
      className={clsx(buttonStyles({ variant, size }), className)}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {leftIcon && <span className="flex items-center">{leftIcon}</span>}

      {isLoading ? (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      ) : null}
      <span>{children}</span>

      {rightIcon && <span className="flex items-center">{rightIcon}</span>}
    </button>
  );
});
