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

  // Use callback ref to handle element mounting/unmounting
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      // Clean up previous observer
      if (observer.current) {
        console.log("useInfiniteScroll: Disconnecting previous observer");
        observer.current.disconnect();
      }

      // If no node, we're done
      if (!node) {
        console.log("useInfiniteScroll: No element to observe (unmounted)");
        return;
      }

      console.log("useInfiniteScroll: Setting up observer for element", node);

      // Create new observer
      observer.current = new IntersectionObserver(handleObserver, {
        root: null,
        rootMargin: `${threshold}px`,
        threshold: 0,
      });

      observer.current.observe(node);
      console.log("useInfiniteScroll: Observer attached successfully");
    },
    [handleObserver, threshold],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (observer.current) {
        console.log("useInfiniteScroll: Cleaning up observer on unmount");
        observer.current.disconnect();
      }
    };
  }, []);

  return { loadMoreRef };
}
