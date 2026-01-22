import { useEffect, useRef, useCallback } from "react";

interface UseInfiniteScrollOptions {
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  threshold?: number;
}

export function useInfiniteScroll({
  loading,
  hasMore,
  onLoadMore,
  threshold = 300,
}: UseInfiniteScrollOptions) {
  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      console.log(
        "IntersectionObserver triggered - isIntersecting:",
        target.isIntersecting,
        "loading:",
        loading,
        "hasMore:",
        hasMore,
      );
      if (target.isIntersecting && !loading && hasMore) {
        console.log("Calling onLoadMore");
        onLoadMore();
      }
    },
    [loading, hasMore, onLoadMore],
  );

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) {
      console.log("useInfiniteScroll: No element to observe");
      return;
    }

    console.log("useInfiniteScroll: Setting up observer for element", element);

    observer.current = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: `${threshold}px`,
      threshold: 0,
    });

    observer.current.observe(element);
    console.log("useInfiniteScroll: Observer attached");

    return () => {
      if (observer.current && element) {
        console.log("useInfiniteScroll: Cleaning up observer");
        observer.current.unobserve(element);
      }
    };
  }, [handleObserver, threshold]);

  return { loadMoreRef };
}
