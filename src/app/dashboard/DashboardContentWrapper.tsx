"use client";

import { useStickyContext } from "~/components/dashboard/DashboardLayout";
import DashboardContent from "./DashboardContent";

interface SlideData {
  type: string;
  title: string;
  image?: {
    url: string;
    alt?: string;
  } | null;
}

interface Presentation {
  id: string;
  title: string;
  isPublic: boolean;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  slides: SlideData[];
  shareToken?: string | null;
}

interface DashboardContentWrapperProps {
  presentations: Presentation[];
  userName: string | null;
}

export default function DashboardContentWrapper({ presentations, userName }: DashboardContentWrapperProps) {
  const { searchQuery } = useStickyContext();

  return (
    <DashboardContent 
      presentations={presentations} 
      userName={userName}
      searchQuery={searchQuery}
    />
  );
}
