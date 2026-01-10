"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ThemesStickyHeader from "./ThemesStickyHeader";
import ThemesContent from "./ThemesContent";
import CustomThemeCreator from "./CustomThemeCreator";
import PricingModal from "~/components/dashboard/PricingModal";
import { useUpgradeModal } from "~/hooks/useUpgradeModal";
import { useDashboard } from "~/contexts/DashboardContext";

interface ThemeData {
  id: string;
  name: string;
  colors: any;
  fonts: any;
  designElements?: any;
  isDefault: boolean;
}

interface ThemesPageClientProps {
  initialThemes: ThemeData[];
}

export default function ThemesPageClient({ initialThemes }: ThemesPageClientProps) {
  const [showCreator, setShowCreator] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [themes, setThemes] = useState(initialThemes);
  const { user } = useDashboard();
  const router = useRouter();
  const { showUpgradeModal, UpgradeModal } = useUpgradeModal();

  const handleCreateClick = () => {
    const userPlan = user?.subscriptionPlan?.toLowerCase();
    
    // Check if user has Pro or Ultra plan
    if (!userPlan || !['pro', 'ultra'].includes(userPlan)) {
      // Show upgrade modal
      showUpgradeModal({
        feature: "Custom Themes & Branding",
        requiredPlan: "pro",
        currentPlan: user?.subscriptionPlan,
        description: "Create custom themes with your own colors, fonts, and branding. Available for Pro and Ultra plans.",
        onOpenPricing: () => setShowPricing(true),
      });
      return;
    }
    
    setShowCreator(true);
  };

  const handleSaveTheme = async (themeData: any) => {
    try {
      const response = await fetch("/api/themes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(themeData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create theme");
      }

      const data = await response.json();
      setThemes(prev => [data.theme, ...prev]);
      setShowCreator(false);
    } catch (error) {
      console.error("Error saving theme:", error);
      alert(error instanceof Error ? error.message : "Failed to create theme");
      throw error;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 h-full">
      {/* Sticky Header Section */}
      <ThemesStickyHeader onCreateClick={handleCreateClick} />

      {/* Themes Content */}
      <ThemesContent initialThemes={themes} />

      {/* Custom Theme Creator Modal */}
      <CustomThemeCreator
        isOpen={showCreator}
        onClose={() => setShowCreator(false)}
        onSave={handleSaveTheme}
        subscriptionPlan={user?.subscriptionPlan}
      />

      {/* Pricing Modal */}
      <PricingModal
        isOpen={showPricing}
        onClose={() => setShowPricing(false)}
        currentPlan={user?.subscriptionPlan}
      />

      {/* Upgrade Modal */}
      <UpgradeModal />
    </div>
  );
}
