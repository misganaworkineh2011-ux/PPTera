"use client";

import { useCallback, useContext } from "react";
import type { ReactNode } from "react";
import { RevealContext } from "./item-animations";
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
import type { BeforeAfterLayoutType } from "~/lib/layouts/content/beforeafter";
import type { ComparisonLayoutType } from "~/lib/layouts/content/comparison";
import type { ImageLayoutType, ImageContentItem } from "~/lib/layouts/content/images";
import type { BentoLayoutType } from "~/lib/layouts/content/bento";
import type { TimelineLayoutType } from "~/lib/layouts/content/timeline";
import type { SpotlightLayoutType } from "~/lib/layouts/content/spotlight";
import type { AgendaLayoutType } from "~/lib/layouts/content/agenda";
import type { PyramidLayoutType } from "~/lib/layouts/content/pyramid";
import type { MatrixLayoutType } from "~/lib/layouts/content/matrix";
import type { CalloutLayoutType } from "~/lib/layouts/content/callout";
import type { TableLayoutType } from "~/lib/layouts/content/table";
import type { DashboardLayoutType } from "~/lib/layouts/content/dashboard";
import type { TeamLayoutType } from "~/lib/layouts/content/team";
import type { IconGridLayoutType } from "~/lib/layouts/content/icongrid";
import type { HubSpokeLayoutType } from "~/lib/layouts/content/hubspoke";
import type { CycleLayoutType } from "~/lib/layouts/content/cycle";
import type { ShowcaseLayoutType } from "~/lib/layouts/content/showcase";
import type { ChecklistLayoutType } from "~/lib/layouts/content/checklist";
import type { RoadmapLayoutType } from "~/lib/layouts/content/roadmap";
import type { ZigzagLayoutType } from "~/lib/layouts/content/zigzag";
import type { DefinitionListLayoutType } from "~/lib/layouts/content/definitionlist";
import type { EditorialLayoutType } from "~/lib/layouts/content/editorial";
import type { OrbitLayoutType } from "~/lib/layouts/content/orbit";
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
import { BentoGridRenderer } from "~/components/layouts/BentoGridRenderer";
import { TimelineRoadmapRenderer } from "~/components/layouts/TimelineRoadmapRenderer";
import { SpotlightStatementRenderer } from "~/components/layouts/SpotlightStatementRenderer";
import { AgendaListRenderer } from "~/components/layouts/AgendaListRenderer";
import { PyramidRenderer } from "~/components/layouts/PyramidRenderer";
import { QuadrantMatrixRenderer } from "~/components/layouts/QuadrantMatrixRenderer";
import { PricingRenderer } from "~/components/layouts/PricingRenderer";
import { FeatureMatrixRenderer } from "~/components/layouts/FeatureMatrixRenderer";
import { KanbanRenderer } from "~/components/layouts/KanbanRenderer";
import { OrgChartRenderer } from "~/components/layouts/OrgChartRenderer";
import { CalloutBoxRenderer } from "~/components/layouts/CalloutBoxRenderer";
import { DataTableRenderer } from "~/components/layouts/DataTableRenderer";
import { StatDashboardRenderer } from "~/components/layouts/StatDashboardRenderer";
import { TeamGridRenderer } from "~/components/layouts/TeamGridRenderer";
import { IconGridRenderer } from "~/components/layouts/IconGridRenderer";
import { HubSpokeRenderer } from "~/components/layouts/HubSpokeRenderer";
import { CycleDiagramRenderer } from "~/components/layouts/CycleDiagramRenderer";
import { FeatureShowcaseRenderer } from "~/components/layouts/FeatureShowcaseRenderer";
import { ChecklistRenderer } from "~/components/layouts/ChecklistRenderer";
import { RoadmapRenderer } from "~/components/layouts/RoadmapRenderer";
import { ZigzagRenderer } from "~/components/layouts/ZigzagRenderer";
import { DefinitionListRenderer } from "~/components/layouts/DefinitionListRenderer";
import { EditorialListRenderer } from "~/components/layouts/EditorialListRenderer";
import { OrbitDiagramRenderer } from "~/components/layouts/OrbitDiagramRenderer";
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
  // Present-mode item entrance animations + click-to-reveal builds
  isPresenting?: boolean;
  itemAnimation?: string;
  revealCount?: number;
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
  isPresenting = false,
  itemAnimation,
  revealCount: revealCountProp,
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
  // Reveal counter arrives via context so the memoized SlideRenderer above
  // never re-renders on a reveal press (its inline content components would
  // get new identities and remount, replaying already-revealed items). The
  // prop form remains as an override for tests / direct embedding.
  const revealCountCtx = useContext(RevealContext);
  const revealCount = revealCountProp ?? revealCountCtx;

  // Stable identity across re-renders (useCallback): if this were recreated
  // per render, a context-driven reveal update would remount the whole
  // renderer subtree and replay every already-revealed item's entrance.
  const ContentWrapper = useCallback(
    ({ children }: { children: ReactNode }) => (
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
    ),
    [canEdit, hasBoxContent, theme, onOpenLayoutSelector, onOpenContentLayoutPanel],
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
        // Present-mode entrance animations: forwarding these activates each
        // renderer's staggered item animation and (where supported) the
        // user-picked style + click-to-reveal builds.
        isPresenting,
        animationKey: `s${index}`,
        itemAnimation,
        revealCount,
      };

      // TEMP DIAGNOSTIC: proves the new animation code is what the browser is
      // actually running. Remove once animations are confirmed working.
      if (isPresenting && typeof window !== "undefined") {
        console.log(
          `[item-anim] slide ${index + 1} presenting · style=${itemAnimation ?? "fade-up"} · reveal=${revealCount ?? "auto"} · layout=${slide.contentLayout ?? "?"}`
        );
      }

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
              layoutId={slide.contentLayout}
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
              layoutId={slide.contentLayout}
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
              layoutId={slide.contentLayout}
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
              layoutId={slide.contentLayout as ProsConsLayoutType}
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
              layoutId={slide.contentLayout as BeforeAfterLayoutType}
              items={boxContentItems}
              theme={theme}
              accentColor={accentColor}
              centerText={slide.introText || slide.title}
              className="w-full min-h-[300px]"
              {...editingProps}
            />
          );

        case "comparison":
          return (
            <ComparisonRenderer
              layoutId={slide.contentLayout as ComparisonLayoutType}
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

        case "bento":
          return (
            <BentoGridRenderer
              layoutId={slide.contentLayout as BentoLayoutType}
              items={boxContentItems}
              theme={theme}
              accentColor={accentColor}
              {...editingProps}
            />
          );

        case "timeline":
          return (
            <TimelineRoadmapRenderer
              layoutId={slide.contentLayout as TimelineLayoutType}
              items={boxContentItems}
              theme={theme}
              accentColor={accentColor}
              {...editingProps}
            />
          );

        case "spotlight":
          return (
            <SpotlightStatementRenderer
              layoutId={slide.contentLayout as SpotlightLayoutType}
              items={boxContentItems}
              theme={theme}
              accentColor={accentColor}
              {...editingProps}
            />
          );

        case "agenda":
          return (
            <AgendaListRenderer
              layoutId={slide.contentLayout as AgendaLayoutType}
              items={boxContentItems}
              theme={theme}
              accentColor={accentColor}
              {...editingProps}
            />
          );

        case "pyramid":
          return (
            <PyramidRenderer
              layoutId={slide.contentLayout as PyramidLayoutType}
              items={boxContentItems}
              theme={theme}
              accentColor={accentColor}
              {...editingProps}
            />
          );

        case "matrix":
          return (
            <QuadrantMatrixRenderer
              layoutId={slide.contentLayout as MatrixLayoutType}
              items={boxContentItems}
              theme={theme}
              accentColor={accentColor}
              {...editingProps}
            />
          );

        case "pricing":
          return (
            <PricingRenderer
              layoutId={slide.contentLayout}
              items={boxContentItems}
              theme={theme}
              accentColor={accentColor}
              className="w-full min-h-[300px]"
              {...editingProps}
            />
          );

        case "featurematrix":
          return (
            <FeatureMatrixRenderer
              layoutId={slide.contentLayout}
              items={boxContentItems}
              theme={theme}
              accentColor={accentColor}
              className="w-full min-h-[300px]"
              {...editingProps}
            />
          );

        case "kanban":
          return (
            <KanbanRenderer
              layoutId={slide.contentLayout}
              items={boxContentItems}
              theme={theme}
              accentColor={accentColor}
              className="w-full min-h-[300px]"
              {...editingProps}
            />
          );

        case "orgchart":
          return (
            <OrgChartRenderer
              layoutId={slide.contentLayout}
              items={boxContentItems}
              theme={theme}
              accentColor={accentColor}
              className="w-full min-h-[300px]"
              {...editingProps}
            />
          );

        case "callout":
          return (
            <CalloutBoxRenderer
              layoutId={slide.contentLayout as CalloutLayoutType}
              items={boxContentItems}
              theme={theme}
              accentColor={accentColor}
              {...editingProps}
            />
          );

        case "table":
          return (
            <DataTableRenderer
              layoutId={slide.contentLayout as TableLayoutType}
              items={boxContentItems}
              theme={theme}
              accentColor={accentColor}
              {...editingProps}
            />
          );

        case "dashboard":
          return (
            <StatDashboardRenderer
              layoutId={slide.contentLayout as DashboardLayoutType}
              items={boxContentItems}
              theme={theme}
              accentColor={accentColor}
              {...editingProps}
            />
          );

        case "team":
          return (
            <TeamGridRenderer
              layoutId={slide.contentLayout as TeamLayoutType}
              items={boxContentItems}
              theme={theme}
              accentColor={accentColor}
              {...editingProps}
            />
          );

        case "icongrid":
          return (
            <IconGridRenderer
              layoutId={slide.contentLayout as IconGridLayoutType}
              items={boxContentItems}
              theme={theme}
              accentColor={accentColor}
              {...editingProps}
            />
          );

        case "hubspoke":
          return (
            <HubSpokeRenderer
              layoutId={slide.contentLayout as HubSpokeLayoutType}
              items={boxContentItems}
              theme={theme}
              accentColor={accentColor}
              {...editingProps}
            />
          );

        case "cycle":
          return (
            <CycleDiagramRenderer
              layoutId={slide.contentLayout as CycleLayoutType}
              items={boxContentItems}
              theme={theme}
              accentColor={accentColor}
              {...editingProps}
            />
          );

        case "showcase":
          return (
            <FeatureShowcaseRenderer
              layoutId={slide.contentLayout as ShowcaseLayoutType}
              items={boxContentItems}
              theme={theme}
              accentColor={accentColor}
              {...editingProps}
            />
          );

        case "checklist":
          return (
            <ChecklistRenderer
              layoutId={slide.contentLayout as ChecklistLayoutType}
              items={boxContentItems}
              theme={theme}
              accentColor={accentColor}
              {...editingProps}
            />
          );

        case "roadmap":
          return (
            <RoadmapRenderer
              layoutId={slide.contentLayout as RoadmapLayoutType}
              items={boxContentItems}
              theme={theme}
              accentColor={accentColor}
              {...editingProps}
            />
          );

        case "zigzag":
          return (
            <ZigzagRenderer
              layoutId={slide.contentLayout as ZigzagLayoutType}
              items={boxContentItems}
              theme={theme}
              accentColor={accentColor}
              {...editingProps}
            />
          );

        case "definitionlist":
          return (
            <DefinitionListRenderer
              layoutId={slide.contentLayout as DefinitionListLayoutType}
              items={boxContentItems}
              theme={theme}
              accentColor={accentColor}
              {...editingProps}
            />
          );

        case "editorial":
          return (
            <EditorialListRenderer
              layoutId={slide.contentLayout as EditorialLayoutType}
              items={boxContentItems}
              theme={theme}
              accentColor={accentColor}
              {...editingProps}
            />
          );

        case "orbit":
          return (
            <OrbitDiagramRenderer
              layoutId={slide.contentLayout as OrbitLayoutType}
              items={boxContentItems}
              theme={theme}
              accentColor={accentColor}
              centerText={slide.introText || slide.title}
              {...editingProps}
            />
          );

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
