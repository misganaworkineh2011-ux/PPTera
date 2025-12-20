"use client";

import { useEffect } from "react";
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
}

export default function DashboardContentWrapper({ presentations: initialPresentations, userName }: DashboardContentWrapperProps) {
  const { searchQuery } = useStickyContext();
  const { presentations, setPresentations, pagination, loadMorePresentations, isLoadingMore } = useDashboard();

  // Initialize presentations from server-side data if context is empty
  useEffect(() => {
    if (presentations.length === 0 && initialPresentations.length > 0) {
      setPresentations(initialPresentations as typeof presentations);
    }
  }, [initialPresentations, presentations.length, setPresentations]);

  // Use context presentations if available, otherwise use initial
  const displayPresentations = presentations.length > 0 ? presentations : initialPresentations;

  return (
    <DashboardContent
      presentations={displayPresentations as Presentation[]}
      userName={userName}
      searchQuery={searchQuery}
      pagination={pagination ?? undefined}
      onLoadMore={loadMorePresentations}
      isLoadingMore={isLoadingMore}
    />
  );
}
