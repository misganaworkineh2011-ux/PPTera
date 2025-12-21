"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock, Calendar, ChevronDown, ChevronUp, Loader2, BookOpen, FileText } from "lucide-react";

interface Outline {
  id: string;
  title: string;
  createdAt: Date;
  mode?: string;
  presentationCount?: number;
}

interface RecentOutlinesProps {
  outlines: Outline[];
  mode?: string;
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    // Show date if more than 24 hours
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  } else if (diffHours > 0) {
    return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
  } else {
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffMinutes > 0) {
      return `${diffMinutes} ${diffMinutes === 1 ? "minute" : "minutes"} ago`;
    }
    return "Just now";
  }
}

export default function RecentOutlines({ outlines: initialOutlines, mode = "ai" }: RecentOutlinesProps) {
  const router = useRouter();
  const [outlines, setOutlines] = useState<Outline[]>(initialOutlines);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isNavigating, setIsNavigating] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(initialOutlines.length === 3);
  const [showAll, setShowAll] = useState(false);

  if (outlines.length === 0) {
    return null;
  }

  const displayedOutlines = showAll ? outlines : outlines.slice(0, 3);

  const handleLoadMore = async () => {
    if (isLoadingMore) return;
    
    setIsLoadingMore(true);
    try {
      const response = await fetch(`/api/outlines/recent?skip=${outlines.length}&take=5`);
      if (!response.ok) throw new Error("Failed to fetch outlines");
      
      const data = await response.json();
      const newOutlines = data.outlines.map((o: { id: string; title: string; createdAt: string; presentationCount?: number }) => ({
        ...o,
        createdAt: new Date(o.createdAt),
      }));
      
      setOutlines((prev) => [...prev, ...newOutlines]);
      setHasMore(data.hasMore);
      setShowAll(true); // Show all outlines after loading more
    } catch (error) {
      console.error("Error loading more outlines:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleOutlineClick = async (outlineId: string) => {
    setIsNavigating(outlineId);
    router.push(`/createpresentation/outline/${outlineId}?mode=${mode}`);
    // Clear loading state after a delay (page will load and component will unmount)
    // This is a fallback in case navigation doesn't complete
    setTimeout(() => {
      setIsNavigating(null);
    }, 10000); // 10 second timeout
  };

  // Clear loading state on unmount
  useEffect(() => {
    return () => {
      setIsNavigating(null);
    };
  }, []);

  return (
    <>
      {/* Full-page loading overlay when navigating */}
      {isNavigating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={32} className="text-[#06b6d4] animate-spin" />
            <p className="text-sm font-medium text-slate-700">Loading outline...</p>
          </div>
        </div>
      )}
      
      <div className="mt-12 mb-8">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-white/30 bg-white/40 backdrop-blur-md px-6 py-5 shadow-lg">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wide">
            Your Recent Outlines
          </h3>
          
          <div className="space-y-2">
            {displayedOutlines.map((outline) => {
              const outlineDate = new Date(outline.createdAt);
              const timeAgo = formatTimeAgo(outlineDate);
              const now = new Date();
              const diffMs = now.getTime() - outlineDate.getTime();
              const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
              const diffDays = Math.floor(diffHours / 24);
              const isDays = diffDays > 0;
              const isNavigatingToThis = isNavigating === outline.id;
              const presentationCount = outline.presentationCount ?? 0;
              const hasPresentation = presentationCount > 0;

              return (
                <button
                  key={outline.id}
                  onClick={() => handleOutlineClick(outline.id)}
                  disabled={isNavigating !== null}
                  className="w-full text-left group disabled:opacity-50 disabled:cursor-wait"
                >
                  <div className="relative flex items-center justify-between p-3 rounded-lg bg-white/60 hover:bg-white/80 transition-all duration-200 hover:shadow-md border border-white/50 group-hover:border-[#06b6d4]/30">
                    {/* Status badge - inside card, top right corner */}
                    <div className="absolute top-2 right-2 z-10">
                      {hasPresentation ? (
                        <div className="relative group/badge">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-600 cursor-help">
                            <BookOpen size={11} className="text-emerald-500" />
                            {presentationCount}
                          </span>
                          {/* Tooltip */}
                          <div className="absolute bottom-full right-0 mb-1.5 px-2 py-1 bg-slate-800 text-white text-[10px] rounded-md whitespace-nowrap opacity-0 invisible group-hover/badge:opacity-100 group-hover/badge:visible transition-all duration-200 shadow-lg">
                            {presentationCount === 1 
                              ? "You created 1 presentation from this outline" 
                              : `You created ${presentationCount} presentations from this outline`}
                            <div className="absolute top-full right-3 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
                          </div>
                        </div>
                      ) : (
                        <div className="relative group/badge">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-600 cursor-help">
                            <FileText size={11} className="text-amber-500" />
                            Draft
                          </span>
                          {/* Tooltip */}
                          <div className="absolute bottom-full right-0 mb-1.5 px-2 py-1 bg-slate-800 text-white text-[10px] rounded-md whitespace-nowrap opacity-0 invisible group-hover/badge:opacity-100 group-hover/badge:visible transition-all duration-200 shadow-lg">
                            No presentation created yet
                            <div className="absolute top-full right-3 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 pr-6">
                      <p className="text-sm font-medium text-slate-800 truncate group-hover:text-[#1e3a8a] transition-colors">
                        {outline.title}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {isDays ? (
                          <>
                            <Calendar size={12} className="text-slate-400" />
                            <span className="text-xs text-slate-500">{timeAgo}</span>
                          </>
                        ) : (
                          <>
                            <Clock size={12} className="text-slate-400" />
                            <span className="text-xs text-slate-500">{timeAgo}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="ml-3 flex items-center">
                      {isNavigatingToThis ? (
                        <Loader2 size={16} className="text-[#06b6d4] animate-spin" />
                      ) : (
                        <svg
                          className="w-4 h-4 text-[#06b6d4] opacity-0 group-hover:opacity-100 transition-opacity"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Show "See More" when not showing all - will either expand or load more */}
          {!showAll && (
            <button
              onClick={async () => {
                // If we have more than 3 loaded, just expand
                if (outlines.length > 3) {
                  setShowAll(true);
                } else if (hasMore) {
                  // Load more from server
                  await handleLoadMore();
                } else {
                  // No more to load, just show all we have
                  setShowAll(true);
                }
              }}
              disabled={isLoadingMore}
              className="mt-4 w-full flex items-center justify-center gap-2 text-sm font-medium text-[#06b6d4] hover:text-[#1e3a8a] transition-colors py-2 rounded-lg hover:bg-white/60 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <ChevronDown size={16} />
                  <span>See More</span>
                </>
              )}
            </button>
          )}
          
          {/* Show "Load More" when showing all but there are more on server */}
          {showAll && hasMore && (
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="mt-4 w-full flex items-center justify-center gap-2 text-sm font-medium text-[#06b6d4] hover:text-[#1e3a8a] transition-colors py-2 rounded-lg hover:bg-white/60 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <ChevronDown size={16} />
                  <span>Load More</span>
                </>
              )}
            </button>
          )}
          
          {showAll && outlines.length > 3 && (
            <button
              onClick={() => setShowAll(false)}
              className="mt-2 w-full flex items-center justify-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors py-2 rounded-lg hover:bg-white/60"
            >
              <ChevronUp size={16} />
              <span>Show Less</span>
            </button>
          )}
        </div>
      </div>
    </div>
    </>
  );
}

