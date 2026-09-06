import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Props for the Modal component.
 */
export interface ModalProps {
  /** Controls whether the modal is open. */
  readonly isOpen: boolean;

  /** Called when the modal should be closed. */
  readonly onClose: () => void;

  /** Content rendered inside the modal. */
  readonly children: ReactNode;

  /** Optional title displayed in the modal header. */
  readonly title?: string;

  /** Prevents the modal from closing when the backdrop is clicked. */
  readonly preventBackdropClose?: boolean;
}

/**
 * Accessible modal dialog component with focus management,
 * keyboard navigation, and optional backdrop closing.
 */
export function Modal({
  isOpen,
  onClose,
  children,
  title,
  preventBackdropClose = false,
}: ModalProps) {
  const modalRef = useRef<HTMLDialogElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const modal = modalRef.current;

    if (!modal) {
      return;
    }

    if (!isOpen) {
      if (modal.open) {
        modal.close();
      }

      previouslyFocusedElement.current?.focus();
      previouslyFocusedElement.current = null;

      return;
    }

    previouslyFocusedElement.current = document.activeElement as HTMLElement | null;

    if (!modal.open) {
      modal.showModal();
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

    /**
     * Prevents the native dialog Escape behavior from closing
     * the dialog independently of the custom Escape handler.
     */
    const handleCancel = (event: Event) => {
      event.preventDefault();
      onClose();
    };

    modal.addEventListener('keydown', handleKeyDown);
    modal.addEventListener('cancel', handleCancel);

    return () => {
      modal.removeEventListener('keydown', handleKeyDown);
      modal.removeEventListener('cancel', handleCancel);
    };
  }, [isOpen, onClose]);

  /**
   * Closes the modal when the dedicated backdrop button is clicked.
   */
  const handleBackdropClick = () => {
    if (!preventBackdropClose) {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <dialog
      ref={modalRef}
      aria-labelledby={title ? 'modal-title' : undefined}
      className="fixed inset-0 m-0 h-screen max-h-none w-screen max-w-none bg-transparent p-0"
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close modal backdrop"
        onClick={handleBackdropClick}
        className="absolute inset-0 h-full w-full cursor-default bg-transparent"
      />

      <div className="relative z-10 mx-auto mt-[10vh] w-full max-w-lg rounded-lg bg-white p-0 shadow-xl">
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
    </dialog>
  );
}
