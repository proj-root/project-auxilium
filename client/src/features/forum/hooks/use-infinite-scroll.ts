import { useCallback, useEffect, useRef } from 'react';

/**
 * Finds the element that actually scrolls around `node`.
 *
 * The app's root <main> is `h-screen overflow-hidden` and each layout scrolls
 * inside its own container, so an observer rooted at the viewport would never
 * fire. Returns null when nothing above the node scrolls, which falls back to
 * the viewport.
 */
function findScrollParent(node: HTMLElement): HTMLElement | null {
  let current = node.parentElement;

  while (current) {
    const { overflowY } = window.getComputedStyle(current);

    if (
      (overflowY === 'auto' || overflowY === 'scroll') &&
      current.scrollHeight > current.clientHeight
    ) {
      return current;
    }

    current = current.parentElement;
  }

  return null;
}

/**
 * Calls `onLoadMore` when the returned sentinel scrolls into view. Attach the
 * ref to an empty element at the end of the list.
 */
export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
}: {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
}) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Kept in a ref so a new closure each render does not tear down the observer.
  const loadMoreRef = useRef(onLoadMore);
  loadMoreRef.current = onLoadMore;

  const isLoadingRef = useRef(isLoading);
  isLoadingRef.current = isLoading;

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (isLoadingRef.current) return;
      if (!entries.some((entry) => entry.isIntersecting)) return;

      loadMoreRef.current();
    },
    [],
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(handleIntersect, {
      root: findScrollParent(sentinel),
      // Start fetching before the reader reaches the end of the list.
      rootMargin: '400px',
    });

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [handleIntersect, hasMore]);

  return sentinelRef;
}
