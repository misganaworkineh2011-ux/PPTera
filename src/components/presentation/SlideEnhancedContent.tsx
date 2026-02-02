"use client";

import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import type { Theme } from "~/lib/themes";
import type { BoxContentItem, BoxLayoutType } from "~/lib/layouts/content/boxes";
import type { SequenceLayoutType } from "~/lib/layouts/content/sequence";
import type { BulletLayoutType } from "~/lib/layouts/content/bullets";
import type { StepsLayoutType } from "~/lib/layouts/content/steps";
import type { QuotesLayoutType } from "~/lib/layouts/content/quotes";
import type { CircleLayoutType } from "~/lib/layouts/content/circles";
import type { CascadingLayoutType } from "~/lib/layouts/content/cascading";
import type { ChevronLayoutType } from "~/lib/layouts/content/chevron";
import type { FunnelLayoutType } from "~/lib/layouts/content/funnel";
import type { ProsConsLayoutType } from "~/lib/layouts/content/proscons";
import type { ImageLayoutType, ImageContentItem } from "~/lib/layouts/content/images";
import type { SlideData, EditingState, SlideImage } from "./types";
import { getLayoutCategory, type LayoutVariant } from "./slide-layout-utils";
import ChartRenderer from "./ChartRenderer";
import BoxLayoutRenderer from "./BoxLayoutRenderer";
import SequenceLayoutRenderer from "./SequenceLayoutRenderer";
import { BulletLayoutRenderer } from "~/components/layouts/BulletLayoutRenderer";
import { StepsLayoutRenderer } from "~/components/layouts/StepsLayoutRenderer";
import { QuotesLayoutRenderer } from "~/components/layouts/QuotesLayoutRenderer";
import { CircleLayoutRenderer } from "~/components/layouts/CircleLayoutRenderer";
import { CascadingWorkflowRenderer } from "~/components/layouts/CascadingWorkflowRenderer";
import { ChevronFlowRenderer } from "~/components/layouts/ChevronFlowRenderer";
import { FunnelStepsRenderer } from "~/components/layouts/FunnelStepsRenderer";
import { ProsConsRenderer } from "~/components/layouts/ProsConsRenderer";
import { BeforeAfterRenderer } from "~/components/layouts/BeforeAfterRenderer";
import { ComparisonRenderer } from "~/components/layouts/ComparisonRenderer";
import { ImageLayoutRenderer } from "~/components/layouts/ImageLayoutRenderer";
import { ChangeLayoutButton } from "./SlideChrome";

interface SlideEnhancedContentProps {
  slide: SlideData;
  index: number;
  theme: Theme;
  layout: LayoutVariant;
  colors: {
    indicatorMuted: string;
    hoverAccent: string;
  };
  canEdit: boolean;
  isHovered: boolean;
  isEditing: boolean;
  editingText: EditingState | null;
  spotlightIndex?: number;
  isSpotlightMode: boolean;
  hasBoxContent: boolean;
  hasImage: boolean;
  boxContentItems: BoxContentItem[];
  allImages: SlideImage[];
  compact?: boolean;
  onStartEditing: (slideIndex: number, field: string, bulletIndex?: number) => void;
  onUpdateContent: (slideIndex: number, field: string, value: string, bulletIndex?: number) => void;
  onFinishEditing: () => void;
  onAddBullet: (slideIndex: number) => void;
  onDeleteBullet: (slideIndex: number, bulletIndex: number) => void;
  onReorderContent?: (slideIndex: number, fromIndex: number, toIndex: number) => void;
  onOpenContentLayoutPanel?: () => void;
  onOpenLayoutSelector: () => void;
  onOpenImageModal?: (slideIndex: number, imageIndex?: number) => void;
  onChartTitleChange: (newTitle: string) => void;
  renderBulletPoints: (compact: boolean) => ReactNode;
}

export default function SlideEnhancedContent({
  slide,
  index,
  theme,
  layout,
  colors,
  canEdit,
  isHovered,
  isEditing,
  editingText,
  spotlightIndex,
  isSpotlightMode,
  hasBoxContent,
  hasImage,
  boxContentItems,
  allImages,
  compact = false,
  onStartEditing,
  onUpdateContent,
  onFinishEditing,
  onAddBullet,
  onDeleteBullet,
  onReorderContent,
  onOpenContentLayoutPanel,
  onOpenLayoutSelector,
  onOpenImageModal,
  onChartTitleChange,
  renderBulletPoints,
}: SlideEnhancedContentProps) {
  const ContentWrapper = ({ children }: { children: ReactNode }) => (
    <div className="relative">
      <ChangeLayoutButton
        placement="inline"
        canEdit={canEdit}
        hasBoxContent={hasBoxContent}
        theme={theme}
        onOpenSelector={onOpenLayoutSelector}
        onOpenContentLayoutPanel={onOpenContentLayoutPanel}
      />
      {children}
    </div>
  );

  if (slide.contentLayout && boxContentItems.length > 0) {
    const isNarrowSpace = layout === "left-content" || layout === "right-content";
    const layoutCategory = getLayoutCategory(slide.contentLayout);

    const handleStartEditLabel = (boxIndex: number) => {
      onStartEditing(index, `content-label-${boxIndex}`);
    };

    const handleStartEditText = (boxIndex: number) => {
      onStartEditing(index, `content-text-${boxIndex}`);
    };

    const handleUpdateLabel = (boxIndex: number, newLabel: string) => {
      if (slide.sections && slide.sections.length > 0 && slide.sections[boxIndex]) {
        onUpdateContent(index, "sectionHeading", newLabel, boxIndex);
        return;
      }

      const bullet = slide.bulletPoints?.[boxIndex] || "";
      const colonIndex = bullet.indexOf(":");
      let currentText = "";
      if (colonIndex > 0 && colonIndex < 50) {
        currentText = bullet.substring(colonIndex + 1).trim();
      } else {
        currentText = bullet;
      }
      const newBullet = `${newLabel}: ${currentText}`;
      onUpdateContent(index, "bullet", newBullet, boxIndex);
    };

    const handleUpdateText = (boxIndex: number, newText: string) => {
      if (slide.sections && slide.sections.length > 0 && slide.sections[boxIndex]) {
        onUpdateContent(index, "sectionDescription", newText, boxIndex);
        return;
      }

      const bullet = slide.bulletPoints?.[boxIndex] || "";
      const colonIndex = bullet.indexOf(":");
      let currentLabel = "";
      if (colonIndex > 0 && colonIndex < 50) {
        currentLabel = bullet.substring(0, colonIndex).trim();
      }
      const newBullet = currentLabel ? `${currentLabel}: ${newText}` : newText;
      onUpdateContent(index, "bullet", newBullet, boxIndex);
    };

    const renderContentLayout = () => {
      const accentColor = theme.colors.accent;
      const headerOffset = (slide.title ? 1 : 0) + (slide.subtitle ? 1 : 0);

      const editingProps = {
        isEditing,
        editingText,
        onStartEditLabel: canEdit ? handleStartEditLabel : undefined,
        onStartEditText: canEdit ? handleStartEditText : undefined,
        onUpdateLabel: canEdit ? handleUpdateLabel : undefined,
        onUpdateText: canEdit ? handleUpdateText : undefined,
        onFinishEditing,
        onDeleteItem: canEdit ? (itemIndex: number) => onDeleteBullet(index, itemIndex) : undefined,
        onReorderItems: canEdit && onReorderContent ? (fromIdx: number, toIdx: number) => onReorderContent(index, fromIdx, toIdx) : undefined,
        isOwner: canEdit,
        isHovered,
        spotlightIndex: isSpotlightMode ? (spotlightIndex !== undefined ? spotlightIndex - headerOffset : undefined) : undefined,
        isSpotlightMode,
      };

      switch (layoutCategory) {
        case "sequence":
          return (
            <SequenceLayoutRenderer
              layoutId={slide.contentLayout as SequenceLayoutType}
              items={boxContentItems}
              theme={theme}
              compact={compact}
              isNarrowSpace={isNarrowSpace}
              {...editingProps}
            />
          );

        case "bullets":
          return (
            <BulletLayoutRenderer
              layoutId={slide.contentLayout as BulletLayoutType}
              items={boxContentItems}
              theme={theme}
              accentColor={accentColor}
              isNarrowSpace={isNarrowSpace}
              {...editingProps}
            />
          );

        case "steps":
          return (
            <StepsLayoutRenderer
              layoutId={slide.contentLayout as StepsLayoutType}
              items={boxContentItems}
              theme={theme}
              accentColor={accentColor}
              isNarrowSpace={isNarrowSpace}
              {...editingProps}
            />
          );

        case "quotes":
          return (
            <QuotesLayoutRenderer
              layoutId={slide.contentLayout as QuotesLayoutType}
              items={boxContentItems}
              theme={theme}
              accentColor={accentColor}
              isNarrowSpace={isNarrowSpace}
              hasImage={hasImage}
              {...editingProps}
            />
          );

        case "circles":
          return (
            <CircleLayoutRenderer
              layoutId={slide.contentLayout as CircleLayoutType}
              items={boxContentItems}
              theme={theme}
              accentColor={accentColor}
              className="w-full min-h-[300px]"
              centerText={slide.introText || slide.title}
              {...editingProps}
              onStartEditCenterText={canEdit ? () => onStartEditing(index, 'introText') : undefined}
              onUpdateCenterText={canEdit ? (value: string) => onUpdateContent(index, 'introText', value) : undefined}
            />
          );

        case "cascading":
          return (
            <CascadingWorkflowRenderer
              items={boxContentItems}
              theme={theme}
              accentColor={accentColor}
              className="w-full min-h-[300px]"
              {...editingProps}
            />
          );

        case "chevron":
          return (
            <ChevronFlowRenderer
              items={boxContentItems}
              theme={theme}
              accentColor={accentColor}
              className="w-full min-h-[300px]"
              {...editingProps}
            />
          );

        case "funnel":
          return (
            <FunnelStepsRenderer
              items={boxContentItems}
              theme={theme}
              accentColor={accentColor}
              className="w-full min-h-[300px]"
              {...editingProps}
            />
          );

        case "proscons":
          return (
            <ProsConsRenderer
              items={boxContentItems}
              theme={theme}
              accentColor={accentColor}
              className="w-full min-h-[300px]"
              {...editingProps}
            />
          );

        case "beforeafter":
          return (
            <BeforeAfterRenderer
              items={boxContentItems}
              theme={theme}
              accentColor={accentColor}
              className="w-full min-h-[300px]"
              {...editingProps}
            />
          );

        case "comparison":
          return (
            <ComparisonRenderer
              items={boxContentItems}
              theme={theme}
              accentColor={accentColor}
              className="w-full min-h-[300px]"
              {...editingProps}
            />
          );

        case "images": {
          const imageContentItems: ImageContentItem[] = boxContentItems.length > 0
            ? boxContentItems.map((item, idx) => ({
                label: item.label,
                text: item.text,
                image: allImages[idx]?.url,
              }))
            : [];

          if (allImages.length > boxContentItems.length) {
            for (let i = boxContentItems.length; i < allImages.length; i++) {
              imageContentItems.push({
                label: undefined,
                text: allImages[i]?.alt || slide.title,
                image: allImages[i]?.url,
              });
            }
          }

          if (imageContentItems.length === 0) {
            return null;
          }

          return (
            <ImageLayoutRenderer
              layoutId={slide.contentLayout as ImageLayoutType}
              items={imageContentItems}
              theme={theme}
              accentColor={accentColor}
              isNarrowSpace={isNarrowSpace}
              onChangeImage={onOpenImageModal ? (itemIndex) => onOpenImageModal(index, itemIndex) : undefined}
              {...editingProps}
            />
          );
        }

        case "boxes":
        default:
          return (
            <BoxLayoutRenderer
              layoutId={slide.contentLayout as BoxLayoutType}
              items={boxContentItems}
              theme={theme}
              compact={compact}
              showIcons={true}
              isNarrowSpace={isNarrowSpace}
              hasImage={hasImage}
              {...editingProps}
            />
          );
      }
    };

    return (
      <ContentWrapper>
        <div className={compact ? "space-y-3" : "space-y-4"}>
          {renderContentLayout()}
          {canEdit && (
            <div className={`transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"} ${isHovered ? "" : "pointer-events-none"}`}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddBullet(index);
                }}
                className={`mt-4 flex items-center gap-2 text-xs sm:text-sm ${colors.indicatorMuted} ${colors.hoverAccent} transition-colors`}
              >
                <Plus size={14} /> Add point
              </button>
            </div>
          )}
          {slide.chart && (
            <div className="mt-4">
              <ChartRenderer
                chart={slide.chart}
                theme={theme}
                compact={compact}
                editable={canEdit}
                onTitleChange={onChartTitleChange}
              />
            </div>
          )}
        </div>
      </ContentWrapper>
    );
  }

  return (
    <ContentWrapper>
      <div className={compact ? "space-y-3" : "space-y-4"}>
        {renderBulletPoints(compact)}
        {slide.chart && (
          <div className="mt-4">
            <ChartRenderer
              chart={slide.chart}
              theme={theme}
              compact={compact}
              editable={canEdit}
              onTitleChange={onChartTitleChange}
            />
          </div>
        )}
      </div>
    </ContentWrapper>
  );
}
