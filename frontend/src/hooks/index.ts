/**
 * ============================================================
 * Custom Hooks — src/hooks/
 * ============================================================
 * Centralized reusable hooks used across the e-commerce platform.
 * Day 4 concepts applied here: useRef, useCallback, useEffect cleanup.
 * ============================================================
 */

import { useState, useEffect, useRef, useCallback } from 'react';

// ── useDebounce ───────────────────────────────────────────────
/**
 * Delays updating a value until the user stops typing.
 *
 * WHY: Without debounce, every keystroke in a search box fires an
 * API request. With 300ms debounce, only fires after user pauses.
 * Reduces API calls from ~20 to ~1 for a typical search.
 *
 * WHY useRef for timeout (not state):
 * State update causes re-render. A timeout ID is mutable internal
 * bookkeeping — storing in ref avoids unnecessary re-renders.
 *
 * @example
 *   const debouncedSearch = useDebounce(searchQuery, 300);
 *   useEffect(() => { fetchResults(debouncedSearch) }, [debouncedSearch]);
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    // WHY cleanup: If value changes before delay expires, cancel previous timer.
    // Without cleanup: stale timers fire and override newer values.
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// ── useIntersectionObserver ───────────────────────────────────
/**
 * Triggers a callback when an element enters the viewport.
 * Used for infinite scroll — load more when last item is visible.
 *
 * WHY IntersectionObserver over scroll events:
 *   Scroll events fire hundreds of times per second (layout thrashing).
 *   IntersectionObserver is asynchronous and browser-optimized.
 *
 * @example
 *   const { ref } = useIntersectionObserver(() => fetchNextPage(), { threshold: 0.5 });
 *   return <div ref={ref}>Load more trigger</div>
 */
export function useIntersectionObserver(
  callback: () => void,
  options: IntersectionObserverInit = {}
) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) callback();
    }, { threshold: 0.1, ...options });

    observer.observe(element);
    return () => observer.disconnect(); // WHY cleanup: Prevent memory leaks
  }, [callback, options]);

  return { ref };
}

// ── useLocalStorage ───────────────────────────────────────────
/**
 * useState that persists to localStorage.
 * WHY: Great for user preferences (theme, language) — not tokens!
 *
 * @example
 *   const [theme, setTheme] = useLocalStorage('theme', 'light');
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.warn(`useLocalStorage: Could not save key "${key}"`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue] as const;
}

// ── useAsync ─────────────────────────────────────────────────
/**
 * Wraps an async function with loading/error/data state.
 * WHY: Avoids repeating isLoading/error/data boilerplate in every component.
 * Use React Query for server data; use this for one-off async operations.
 *
 * @example
 *   const { execute, isLoading, error } = useAsync(uploadFile);
 *   <button onClick={() => execute(file)} disabled={isLoading}>Upload</button>
 */
export function useAsync<T, Args extends unknown[]>(
  asyncFn: (...args: Args) => Promise<T>
) {
  const [state, setState] = useState<{
    data: T | null;
    isLoading: boolean;
    error: Error | null;
  }>({ data: null, isLoading: false, error: null });

  const execute = useCallback(
    async (...args: Args) => {
      setState({ data: null, isLoading: true, error: null });
      try {
        const result = await asyncFn(...args);
        setState({ data: result, isLoading: false, error: null });
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setState({ data: null, isLoading: false, error });
        throw error;
      }
    },
    [asyncFn]
  );

  return { ...state, execute };
}

// ── useWindowSize ─────────────────────────────────────────────
/**
 * Returns current window dimensions. Re-renders on resize (debounced).
 * WHY: Conditional rendering based on screen size without CSS media queries.
 */
export function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setSize({ width: window.innerWidth, height: window.innerHeight });
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeout);
    };
  }, []);

  return size;
}
