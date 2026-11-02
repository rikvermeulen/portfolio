import { useEffect, useRef } from "react";

/**
 * Observe an element's size and run `onResize` whenever it changes (and once
 * when observation starts). The callback is stored in a ref, so passing a fresh
 * inline function each render never re-subscribes the observer — the observer is
 * only re-created if the `ref` object itself changes.
 */
export function useResizeObserver<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  onResize: (entry: ResizeObserverEntry) => void,
): void {
  const onResizeRef = useRef(onResize);

  useEffect(() => {
    onResizeRef.current = onResize;
  }, [onResize]);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        onResizeRef.current(entry);
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
}
