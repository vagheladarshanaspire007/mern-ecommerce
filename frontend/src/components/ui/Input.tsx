import clsx from 'clsx';
import { forwardRef, useId } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const inputStyles = cva(
  'block w-full rounded-md border bg-white text-slate-900 shadow-xs transition placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500',
  {
    variants: {
      state: {
        default: 'border-slate-300 focus-visible:border-blue-500 focus-visible:ring-blue-500',
        error: 'border-rose-500 focus-visible:border-rose-500 focus-visible:ring-rose-500',
      },
      paddingLeft: {
        true: 'pl-10',
        false: 'pl-3',
      },
      paddingRight: {
        true: 'pr-10',
        false: 'pr-3',
      },
    },
    defaultVariants: {
      state: 'default',
      paddingLeft: false,
      paddingRight: false,
    },
  }
);

/**
 * Props for the Input component.
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label text displayed above the input. */
  label?: string;
  /** Error message shown below the input; also applies error styles. */
  error?: string;
  /** Helper text shown below the input when no error is present. */
  helperText?: string;
  /** Optional icon/content rendered on the left side inside the input. */
  leftIcon?: React.ReactNode;
  /** Optional icon/content rendered on the right side inside the input. */
  rightIcon?: React.ReactNode;
}

type InputState = VariantProps<typeof inputStyles>['state'];

/**
 * Reusable text input with optional label, helper/error text, and icon slots.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { id, label, error, helperText, leftIcon, rightIcon, className, type = 'text', ...props },
  ref
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;

  const describedBy = error ? errorId : helperText ? helperId : undefined;

  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      ) : null}

      <div className="relative">
        {leftIcon ? (
          <span
            className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-500"
            aria-hidden="true"
          >
            {leftIcon}
          </span>
        ) : null}

        <input
          ref={ref}
          id={inputId}
          type={type}
          className={clsx(
            inputStyles({
              state: (error ? 'error' : 'default') as InputState,
              paddingLeft: Boolean(leftIcon),
              paddingRight: Boolean(rightIcon),
            }),
            'py-2',
            className
          )}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          {...props}
        />

        {rightIcon ? (
          <span
            className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-500"
            aria-hidden="true"
          >
            {rightIcon}
          </span>
        ) : null}
      </div>

      {error ? (
        <p id={errorId} className="mt-1.5 text-sm text-rose-600" role="alert">
          {error}
        </p>
      ) : null}

      {!error && helperText ? (
        <p id={helperId} className="mt-1.5 text-sm text-slate-500">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});
