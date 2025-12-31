"use client";

import { useEffect, useMemo } from "react";
import { useStickyContext } from "~/components/dashboard/DashboardLayout";
import { useDashboard } from "~/contexts/DashboardContext";
import DashboardContent from "./DashboardContent";

interface Presentation {
  id: string;
  title: string;
  isPublic: boolean;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  thumbnailUrl: string | null;
  shareToken?: string | null;
}

interface DashboardContentWrapperProps {
  presentations: Presentation[];
  userName: string | null;
  totalCount: number;
}

export default function DashboardContentWrapper({ presentations: initialPresentations, userName, totalCount }: DashboardContentWrapperProps) {
  const { searchQuery } = useStickyContext();
  const { presentations, setPresentations, pagination, setPagination, loadMorePresentations, isLoadingMore } = useDashboard();

  // Sync SSR data to context on every render where SSR data is available
  // This ensures fresh data is always used when navigating back to dashboard
  useEffect(() => {
    if (initialPresentations.length > 0) {
      // Always sync SSR data - it's the source of truth from the server
      setPresentations(initialPresentations as unknown as typeof presentations);
      
      // Set pagination based on SSR data
      const hasMore = initialPresentations.length < totalCount;
      
      setPagination({
        total: totalCount,
        limit: 12,
        offset: initialPresentations.length,
        hasMore,
      });
    }
  }, [initialPresentations, totalCount, setPresentations, setPagination]);

  // Determine which presentations to display
  // Use context if it has more items (from load more), otherwise use SSR
  const displayPresentations = useMemo(() => {
    // If context has more presentations than SSR (user loaded more), use context
    if (presentations.length > initialPresentations.length) {
      return presentations;
    }
    // Otherwise use SSR data (fresh from server)
    return initialPresentations;
  }, [presentations, initialPresentations]);

  // Calculate remaining count properly
  const remainingCount = pagination 
    ? Math.max(0, pagination.total - displayPresentations.length)
    : Math.max(0, totalCount - displayPresentations.length);

  return (
    <DashboardContent
      presentations={displayPresentations as Presentation[]}
      userName={userName}
      searchQuery={searchQuery}
      pagination={pagination ? { ...pagination, hasMore: remainingCount > 0 } : { total: totalCount, limit: 12, offset: displayPresentations.length, hasMore: remainingCount > 0 }}
      onLoadMore={loadMorePresentations}
      isLoadingMore={isLoadingMore}
    />
  );
}
