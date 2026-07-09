"use client";

import ContentLayoutPanel from "~/components/presentation/ContentLayoutPanel";
import PricingModal from "~/components/dashboard/PricingModal";
import type { SlideData, CoverLayoutId } from "~/components/presentation/types";
import type { Theme } from "~/lib/themes";
import { ThemeSidebar } from "./ThemeSidebar";
import { AgentPanel } from "./AgentPanel";

interface PresentationPanelsProps {
  theme: Theme;
  currentThemeId: string;
  presentationId: string;
  presentationTitle: string;
  subscriptionPlan?: string | null;
  slidesData: SlideData[];
  activeSlideIndex: number | null;
  showContentLayoutPanel: boolean;
  showThemeSidebar: boolean;
  showAgentPanel: boolean;
  showPricingModal: boolean;
  lastHoveredSlideIndex: number;
  onThemeChange: (themeId: string) => void;
  onCloseThemeSidebar: () => void;
  onCloseAgentPanel: () => void;
  onCloseContentLayoutPanel: () => void;
  onUpdateSlide: (index: number, slide: SlideData) => void;
  onReplaceSlides?: (slides: SlideData[]) => void;
  onSetEditingSlide: (index: number | null) => void;
  onSelectContentLayout: (layoutId: string) => void;
  onSelectCoverLayout: (layoutId: CoverLayoutId) => void;
  onClosePricingModal: () => void;
  onUpgrade?: () => void;
}

export function PresentationPanels({
  theme,
  currentThemeId,
  presentationId,
  presentationTitle,
  subscriptionPlan,
  slidesData,
  activeSlideIndex,
  showContentLayoutPanel,
  showThemeSidebar,
  showAgentPanel,
  showPricingModal,
  lastHoveredSlideIndex,
  onThemeChange,
  onCloseThemeSidebar,
  onCloseAgentPanel,
  onCloseContentLayoutPanel,
  onUpdateSlide,
  onReplaceSlides,
  onSetEditingSlide,
  onSelectContentLayout,
  onSelectCoverLayout,
  onClosePricingModal,
  onUpgrade,
}: PresentationPanelsProps) {
  const activeSlide = activeSlideIndex !== null ? slidesData[activeSlideIndex] : null;
  // Title slides pick a cover composition instead of a content layout — even
  // when an older deck's title slide carries a slideLayout (side-image split);
  // selecting a cover style clears it and switches to the cover system.
  const isCoverSlide = !!activeSlide && activeSlide.type === "title";
  // While a slideLayout-based cover is active, no cover style is "current".
  const currentCoverLayout = activeSlide?.slideLayout
    ? undefined
    : (activeSlide?.coverLayout ?? "signature");
  return (
    <>
      <ThemeSidebar
        isOpen={showThemeSidebar}
        onClose={onCloseThemeSidebar}
        currentThemeId={currentThemeId}
        onThemeChange={onThemeChange}
        presentationId={presentationId}
        theme={theme}
        subscriptionPlan={subscriptionPlan}
        onUpgrade={onUpgrade}
      />

      <AgentPanel
        isOpen={showAgentPanel}
        onClose={onCloseAgentPanel}
        theme={theme}
        slides={slidesData}
        currentSlideIndex={lastHoveredSlideIndex}
        presentationTitle={presentationTitle}
        presentationId={presentationId}
        onUpdateSlide={onUpdateSlide}
        onReplaceSlides={onReplaceSlides}
        onSetEditingSlide={onSetEditingSlide}
        subscriptionPlan={subscriptionPlan}
      />

      <ContentLayoutPanel
        isOpen={showContentLayoutPanel && activeSlideIndex !== null}
        currentContentLayout={activeSlideIndex !== null ? (slidesData[activeSlideIndex]?.contentLayout || "box-style-1") : "box-style-1"}
        contentItems={(() => {
          if (activeSlideIndex === null) return [];
          const slide = slidesData[activeSlideIndex];
          if (!slide) return [];

          if (slide.sections && slide.sections.length > 0) {
            return slide.sections.map((section) => ({
              label: section.heading,
              text: section.description,
            }));
          }

          if (slide.transformedContent?.items) {
            return slide.transformedContent.items
              .filter(item => item.label)
              .map((item) => ({
                label: item.label,
                text: item.text,
              }));
          }

          if (slide.bulletPoints && slide.bulletPoints.length > 0) {
            return slide.bulletPoints.map((bullet) => {
              let bp = typeof bullet === "string" ? bullet : (bullet as { text?: string }).text || "";
              bp = bp.replace(/\(max\s+\d+\s+words?[^)]*\)/gi, "").trim();
              bp = bp.replace(/\(\d+\s+words?[^)]*\)/gi, "").trim();
              bp = bp.replace(/\(visually\s+equal\s+length[^)]*\)/gi, "").trim();
              bp = bp.replace(/\s+/g, " ").trim();

              const colonIndex = bp.indexOf(":");
              if (colonIndex > 0 && colonIndex < 50) {
                const label = bp.substring(0, colonIndex).trim();
                const text = bp.substring(colonIndex + 1).trim();
                if (label && text) {
                  return { label, text };
                }
              }
              const words = bp.split(" ");
              if (words.length > 5) {
                return { label: words.slice(0, 3).join(" "), text: bp };
              }
              return { label: bp, text: bp };
            });
          }
          return [];
        })()}
        theme={theme}
        onSelectContentLayout={(layoutId) => {
          if (activeSlideIndex !== null) {
            onSelectContentLayout(layoutId);
          }
        }}
        onClose={onCloseContentLayoutPanel}
        coverSlide={isCoverSlide}
        currentCoverLayout={currentCoverLayout}
        onSelectCoverLayout={(layoutId) => {
          if (activeSlideIndex !== null) {
            onSelectCoverLayout(layoutId);
          }
        }}
      />

      <PricingModal
        isOpen={showPricingModal}
        onClose={onClosePricingModal}
        currentPlan={subscriptionPlan}
      />
    </>
  );
}
