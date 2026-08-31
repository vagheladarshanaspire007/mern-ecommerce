import { useEffect, useRef, type MouseEvent, type ReactNode } from 'react';
export interface ModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly children: ReactNode;
  readonly title?: string;
  readonly preventBackdropClose?: boolean;
}

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

    modal.addEventListener('keydown', handleKeyDown);

    return () => {
      modal.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget && !preventBackdropClose) {
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
      onMouseDown={handleBackdropClick}
      className="w-full max-w-lg rounded-lg bg-white p-0 shadow-xl backdrop:bg-black/50"
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
    </dialog>
  );
}
