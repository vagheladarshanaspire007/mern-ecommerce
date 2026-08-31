import type { InputHTMLAttributes, ReactNode } from 'react';

/**
 * Props for the reusable Input component.
 */
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /**
   * Text displayed above the input.
   */
  label?: string;

  /**
   * Error message displayed below the input.
   * When provided, the input receives an error state.
   */
  error?: string;

  /**
   * Helper text displayed below the input.
   */
  helperText?: string;

  /**
   * Optional content displayed on the left side of the input.
   */
  leftIcon?: ReactNode;

  /**
   * Optional content displayed on the right side of the input.
   */
  rightIcon?: ReactNode;
}

/**
 * Reusable input component with label, helper text,
 * validation error, and optional icon slots.
 */
export function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  id,
  className = '',
  ...props
}: InputProps) {
  const inputId = id ?? `input-${Math.random().toString(36).slice(2, 9)}`;

  const hasError = Boolean(error);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <span
            className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"
            aria-hidden="true"
          >
            {leftIcon}
          </span>
        )}

        <input
          id={inputId}
          aria-invalid={hasError}
          aria-describedby={
            error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
          className={[
            'w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900',
            'placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            'disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60',
            leftIcon ? 'pl-10' : '',
            rightIcon ? 'pr-10' : '',
            hasError
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />

        {rightIcon && (
          <span
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
            aria-hidden="true"
          >
            {rightIcon}
          </span>
        )}
      </div>

      {error ? (
        <p id={`${inputId}-error`} className="mt-1.5 text-sm text-red-600">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${inputId}-helper`} className="mt-1.5 text-sm text-gray-500">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
