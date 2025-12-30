"use client";

import { useState, useCallback } from "react";
import UpgradeModal from "~/components/dashboard/UpgradeModal";

interface UpgradeModalConfig {
  feature: string;
  requiredPlan: 'plus' | 'pro' | 'ultra';
  currentPlan?: string | null;
  description?: string;
  onOpenPricing?: () => void;
}

export function useUpgradeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<UpgradeModalConfig>({
    feature: '',
    requiredPlan: 'pro',
  });

  const showUpgradeModal = useCallback((modalConfig: UpgradeModalConfig) => {
    setConfig(modalConfig);
    setIsOpen(true);
  }, []);

  const hideUpgradeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const UpgradeModalComponent = useCallback(() => (
    <UpgradeModal
      isOpen={isOpen}
      onClose={hideUpgradeModal}
      feature={config.feature}
      requiredPlan={config.requiredPlan}
      currentPlan={config.currentPlan}
      description={config.description}
      onOpenPricing={config.onOpenPricing}
    />
  ), [isOpen, config, hideUpgradeModal]);

  return {
    showUpgradeModal,
    hideUpgradeModal,
    UpgradeModal: UpgradeModalComponent,
  };
}
