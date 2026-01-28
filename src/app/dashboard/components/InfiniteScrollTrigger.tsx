"use client";

import { useEffect, useRef } from "react";

interface InfiniteScrollTriggerProps {
  onLoadMore: () => void;
  isLoading: boolean;
  remainingCount: number;
  moreText: string;
}

export default function InfiniteScrollTrigger({
  onLoadMore,
  isLoading,
  remainingCount,
  moreText,
}: InfiniteScrollTriggerProps) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const hasTriggered = useRef(false);
  const isInitialized = useRef(false);

  useEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    isInitialized.current = false;
    hasTriggered.current = false;

    const initTimeout = setTimeout(() => {
      isInitialized.current = true;
    }, 500);

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && !isLoading && !hasTriggered.current && isInitialized.current && remainingCount > 0) {
          hasTriggered.current = true;
          onLoadMore();
        }
      },
      { 
        rootMargin: "100px",
        threshold: 0.1,
      }
    );

    observer.observe(trigger);
    return () => {
      clearTimeout(initTimeout);
      observer.disconnect();
    };
  }, [onLoadMore, isLoading, remainingCount]);

  useEffect(() => {
    if (!isLoading) {
      const resetTimeout = setTimeout(() => {
        hasTriggered.current = false;
      }, 100);
      return () => clearTimeout(resetTimeout);
    }
  }, [isLoading]);

  if (remainingCount <= 0 && !isLoading) {
    return null;
  }

  return (
    <div ref={triggerRef} className="col-span-full">
      {!isLoading && remainingCount > 0 && (
        <button 
          onClick={onLoadMore}
          className="flex flex-col items-center gap-2 text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer group w-full py-6"
        >
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-[2px] bg-gradient-to-r from-transparent via-slate-300 to-transparent dark:via-slate-600 rounded-full group-hover:via-slate-400" />
            <span className="text-xs font-medium">{remainingCount} {moreText}</span>
            <div className="w-8 h-[2px] bg-gradient-to-r from-transparent via-slate-300 to-transparent dark:via-slate-600 rounded-full group-hover:via-slate-400" />
          </div>
        </button>
      )}
    </div>
  );
}
