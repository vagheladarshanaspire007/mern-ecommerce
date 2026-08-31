import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Props for the reusable Modal component.
 */
export interface ModalProps {
  /**
   * Controls whether the modal is visible.
   */
  isOpen: boolean;

  /**
   * Callback invoked when the modal should close.
   */
  onClose: () => void;

  /**
   * Content displayed inside the modal.
   */
  children: ReactNode;

  /**
   * Optional modal title.
   */
  title?: string;

  /**
   * Prevents closing the modal when clicking the backdrop.
   *
   * @default false
   */
  preventBackdropClose?: boolean;
}

/**
 * Reusable accessible modal dialog with focus trapping,
 * Escape-key handling, and backdrop-click support.
 */
export function Modal({
  isOpen,
  onClose,
  children,
  title,
  preventBackdropClose = false,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    previouslyFocusedElement.current = document.activeElement as HTMLElement | null;

    const modal = modalRef.current;

    if (!modal) {
      return;
    }

    const focusableSelector = [
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      "[tabindex]:not([tabindex='-1'])",
    ].join(',');

    const getFocusableElements = () =>
      Array.from(modal.querySelectorAll<HTMLElement>(focusableSelector));

    const focusableElements = getFocusableElements();

    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    } else {
      modal.focus();
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

      const elements = getFocusableElements();

      if (elements.length === 0) {
        event.preventDefault();
        modal.focus();
        return;
      }

      const firstElement = elements[0];
      const lastElement = elements[elements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      previouslyFocusedElement.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && !preventBackdropClose) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={handleBackdropClick}
      aria-hidden="false"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        tabIndex={-1}
        className="w-full max-w-lg rounded-lg bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          {title ? (
            <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
              {title}
            </h2>
          ) : (
            <span />
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span aria-hidden="true" className="text-xl">
              ×
            </span>
          </button>
        </div>

        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
