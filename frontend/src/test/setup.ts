/**
 * ============================================================
 * Vitest / Testing Setup — src/test/setup.ts
 * ============================================================
 * Runs before EVERY test file.
 *
 * WHY @testing-library/jest-dom:
 *   Adds custom matchers like toBeInTheDocument(), toHaveClass(),
 *   toBeDisabled() — much more readable than raw DOM assertions.
 *
 * WHY cleanup after each:
 *   React Testing Library renders components into a real DOM node.
 *   Without cleanup, rendered components from one test leak into
 *   the next — causing false positives and mysterious failures.
 * ============================================================
 */

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Automatically unmount and clean up DOM after each test
afterEach(() => {
  cleanup();
});

// ─── Global Mocks ────────────────────────────────────────────

// Mock matchMedia — not available in jsdom (test environment)
// WHY: Components that use window.matchMedia (responsive hooks) would crash
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver — not available in jsdom
// WHY: Used by our useIntersectionObserver hook (infinite scroll)
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn(),
}));

// Suppress console.error in tests (expected errors from error boundaries etc.)
// Remove this if you want to see all console errors during testing
const originalConsoleError = console.error;
console.error = (...args: unknown[]) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactDOM.render') ||
      args[0].includes('act(...)'))
  ) {
    return;
  }
  originalConsoleError(...args);
};
