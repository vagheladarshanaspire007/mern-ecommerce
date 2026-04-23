import clsx from 'clsx';
import { useEffect, useId, useRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const FOCUSABLE_SELECTOR =
  'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';

const modalOverlayStyles = cva(
  'fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4',
  {
    variants: {
      align: {
        center: 'items-center',
        start: 'items-start',
      },
    },
    defaultVariants: {
      align: 'center',
    },
  }
);

const modalPanelStyles = cva(
  'w-full max-w-lg rounded-xl bg-white p-5 shadow-xl focus-visible:outline-none',
  {
    variants: {
      size: {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

/**
 * Props for the Modal component.
 */
export interface ModalProps {
  /** Controls whether the modal is visible. */
  isOpen: boolean;
  /** Called when the user requests to close the modal. */
  onClose: () => void;
  /** Title shown in the modal header and announced by screen readers. */
  title: string;
  /** Content rendered inside the modal body. */
  children: React.ReactNode;
  /** Additional classes for the modal panel. */
  className?: string;
  /** Controls panel width. */
  size?: VariantProps<typeof modalPanelStyles>['size'];
  /** Controls vertical alignment of the dialog. */
  align?: VariantProps<typeof modalOverlayStyles>['align'];
}

/**
 * Accessible modal dialog with focus trap, escape handling, and scroll locking.
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className,
  size = 'md',
  align = 'center',
}: Readonly<ModalProps>) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else if (dialog.open) {
      dialog.close();
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    previousActiveElementRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const dialogElement = dialogRef.current;
    const focusable = dialogElement?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    const firstFocusable = focusable?.[0];

    if (firstFocusable) {
      firstFocusable.focus();
    } else {
      dialogElement?.focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const activeDialog = dialogRef.current;
      if (!activeDialog) {
        return;
      }

      const focusableElements = activeDialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusableElements.length === 0) {
        event.preventDefault();
        activeDialog.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      previousActiveElementRef.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className={modalOverlayStyles({ align })}>
      <button
        type="button"
        aria-label="Close modal"
        tabIndex={-1}
        className="fixed inset-0 w-full h-full cursor-default bg-transparent border-0 p-0"
        onClick={onClose}
      />
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClose={onClose}
        className={clsx(modalPanelStyles({ size }), className)}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id={titleId} className="text-lg font-semibold text-slate-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Close modal"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div className="text-sm text-slate-700">{children}</div>
      </dialog>
    </div>
  );
}
