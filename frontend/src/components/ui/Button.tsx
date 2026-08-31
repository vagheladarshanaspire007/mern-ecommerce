import type { ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * Visual variants supported by the Button component.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

/**
 * Sizes supported by the Button component.
 */
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Props for the reusable Button component.
 */
export type ButtonProps = Readonly<
  ButtonHTMLAttributes<HTMLButtonElement>
> & {
  /**
   * Visual style of the button.
   *
   * @default "primary"
   */
  readonly variant?: ButtonVariant;

  /**
   * Controls the size of the button.
   *
   * @default "md"
   */
  readonly size?: ButtonSize;

  /**
   * Displays a loading spinner and prevents user interaction.
   *
   * @default false
   */
  readonly isLoading?: boolean;

  /**
   * Optional button content.
   */
  readonly children?: ReactNode;
};

/**
 * Reusable button component for application-wide actions.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus-visible:ring-gray-500',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
  };

  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const isDisabled = disabled || isLoading;

  return (
    <button
      type="button"
      disabled={isDisabled}
      aria-busy={isLoading}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-md font-medium',
        'transition-colors duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(' ')}
      {...props}
    >
      {isLoading && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
          aria-hidden="true"
        />
      )}

      {children}
    </button>
  );
}