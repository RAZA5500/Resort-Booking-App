import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Runs `fetcher` whenever `deps` change and exposes { data, error, loading, refetch }.
 * Late responses from superseded requests are ignored, so fast typing in a
 * filter cannot leave stale results on screen.
 *
 * A real product would reach for React Query here; this is the same contract in
 * about forty lines and no extra dependency.
 */
export const useApi = (fetcher, deps = [], { skip = false, initial = null } = {}) => {
  const [data, setData] = useState(initial);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!skip);
  const requestId = useRef(0);
  const fetcherRef = useRef(fetcher);

  // Keep the latest fetcher without making it a dependency of the run effect —
  // callers pass a fresh closure on every render.
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  const run = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const result = await fetcherRef.current();
      if (id === requestId.current) setData(result);
      return result;
    } catch (err) {
      if (id === requestId.current) setError(err);
      return null;
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (skip) return;
    // Deferred by a microtask so the fetch is not a synchronous cascade out of
    // the effect body (react-hooks/set-state-in-effect).
    queueMicrotask(run);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- callers supply their own dep list
  }, [skip, run, ...deps]);

  // Derived rather than stored, so a skipped hook never has to write state.
  return { data, error, loading: skip ? false : loading, refetch: run, setData };
};

export const useDebounced = (value, delay = 350) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};

/** Closes a popover on outside click or Escape. */
export const useDismiss = (open, onClose) => {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);
  return ref;
};
