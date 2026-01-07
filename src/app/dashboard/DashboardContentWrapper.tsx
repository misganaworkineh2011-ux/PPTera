"use client";

import { useEffect, useMemo, useRef } from "react";
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
  const { presentations: additionalPresentations, pagination, setPagination, loadMorePresentations, isLoadingMore } = useDashboard();
  
  // Track if pagination has been set to avoid re-setting on every render
  const paginationSetRef = useRef(false);

  // Set pagination only once on mount
  useEffect(() => {
    if (!paginationSetRef.current && initialPresentations.length > 0) {
      const hasMore = initialPresentations.length < totalCount;
      setPagination({
        total: totalCount,
        limit: 12,
        offset: initialPresentations.length,
        hasMore,
      });
      paginationSetRef.current = true;
    }
  }, [initialPresentations.length, totalCount, setPagination]);

  // Combine SSR presentations with any additional ones loaded via "load more"
  // SSR data is always the base, additional presentations are appended
  const displayPresentations = useMemo(() => {
    if (additionalPresentations.length > 0) {
      // Combine SSR data with loaded more data, avoiding duplicates
      const ssrIds = new Set(initialPresentations.map(p => p.id));
      const newPresentations = additionalPresentations.filter(p => !ssrIds.has(p.id));
      return [...initialPresentations, ...newPresentations];
    }
    return initialPresentations;
  }, [additionalPresentations, initialPresentations]);

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
