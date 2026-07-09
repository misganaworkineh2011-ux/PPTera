"use client";

import type { ReactNode, CSSProperties } from "react";
import { Plus } from "lucide-react";
import type { Theme } from "~/lib/themes";
import type { SlideData, EditingState, SlideImage } from "../types";
import type { LayoutVariant } from "../slide-layout-utils";
import EditableText from "../EditableText";
import SlideImg from "../SlideImage";

interface SlideLayoutSetCProps {
  layout: LayoutVariant;
  slide: SlideData;
  theme: Theme;
  themeType: string;
  index: number;
  bulletPoints: string[];
  colors: {
    bg: string;
    orb1Strong: string;
    orb2Strong: string;
    accent: string;
    fullOverlay: string;
    textMuted: string;
    indicatorMuted: string;
    hoverAccent: string;
    cardBg: string;
  };
  useGradientClasses: boolean;
  customBgStyle?: CSSProperties;
  hasImage: boolean;
  allImages: SlideImage[];
  canEdit: boolean;
  isHovered: boolean;
  isEditing: boolean;
  editingText: EditingState | null;
  onStartEditing: (slideIndex: number, field: string, bulletIndex?: number) => void;
  onUpdateContent: (slideIndex: number, field: string, value: string, bulletIndex?: number) => void;
  onFinishEditing: () => void;
  onAddBullet: (slideIndex: number) => void;
  onDeleteBullet: (slideIndex: number, bulletIndex: number) => void;
  renderTitle: (props: { className?: string; align?: "left" | "center" | "right"; showSubtitle?: boolean }) => ReactNode;
  renderDescription: (props?: { className?: string; align?: "left" | "center" | "right" }) => ReactNode;
  renderIndicator: (position: "top-left" | "top-right") => ReactNode;
  renderImageBlock: (props: { className?: string; size?: "small" | "medium" | "large"; imageIndex?: number }) => ReactNode;
}

export function renderLayoutSetC(props: SlideLayoutSetCProps): ReactNode | null {
  const {
    layout,
    slide,
    theme,
    themeType,
    index,
    bulletPoints,
    colors,
    useGradientClasses,
    customBgStyle,
    hasImage,
    allImages,
    canEdit,
    isHovered,
    isEditing,
    editingText,
    onStartEditing,
    onUpdateContent,
    onFinishEditing,
    onAddBullet,
    onDeleteBullet,
    renderTitle,
    renderDescription,
    renderIndicator,
    renderImageBlock,
  } = props;

  if (layout === "feature-showcase") {
    const firstImage = allImages[0];
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 ${useGradientClasses ? `bg-gradient-to-br ${colors.bg}` : ""}`} style={customBgStyle} />

        {renderIndicator("top-left")}

        <div className="relative h-full flex flex-col justify-center overflow-visible">
          {hasImage && firstImage && (
            <div className="relative h-1/3 sm:h-2/5 shrink-0">
              <SlideImg image={firstImage} alt={firstImage.alt || slide.title} className="w-full h-full object-cover" />
              <div className={`absolute inset-0 ${colors.fullOverlay}`} />
              <div className="absolute inset-0 flex items-center justify-center p-4">
                {renderTitle({ className: "text-xl sm:text-2xl md:text-3xl lg:text-4xl text-center", align: "center" })}
              </div>
            </div>
          )}

          {!hasImage && (
            <div className="p-4 sm:p-8 md:p-12 pt-12 sm:pt-16 md:pt-20">
              {renderTitle({ className: "text-xl sm:text-2xl md:text-3xl lg:text-4xl text-center", align: "center", showSubtitle: isTitleSlide })}
              {!isTitleSlide && renderDescription({ className: "mt-3 sm:mt-4", align: "center" })}
            </div>
          )}

          <div className="p-4 sm:p-6 md:p-8">
            {bulletPoints.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-5xl mx-auto">
                {bulletPoints.map((point, i) => (
                  <div key={i} className={`p-4 sm:p-5 rounded-xl border backdrop-blur-sm text-center ${colors.cardBg}`}>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: `${colors.accent}20` }}>
                      <span className="text-lg sm:text-xl font-bold" style={{ color: colors.accent }}>{i + 1}</span>
                    </div>
                    <EditableText
                      value={point}
                      isEditing={isEditing && editingText?.field === "bullet" && editingText?.bulletIndex === i}
                      onStartEdit={() => onStartEditing(index, "bullet", i)}
                      onChange={(val) => onUpdateContent(index, "bullet", val, i)}
                      onFinish={onFinishEditing}
                      className="text-sm sm:text-base leading-relaxed"
                      style={{ fontFamily: theme.fonts.body.family, color: colors.textMuted }}
                      isOwner={canEdit}
                      isHovered={isHovered}
                      onDelete={() => onDeleteBullet(index, i)}
                    />
                  </div>
                ))}
              </div>
            )}

            {canEdit && (
              <div className={`transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"} ${isHovered ? "" : "pointer-events-none"}`}>
                <button type="button" onClick={(e) => { e.stopPropagation(); onAddBullet(index); }} className={`mt-4 mx-auto flex items-center gap-2 text-xs sm:text-sm ${colors.indicatorMuted} ${colors.hoverAccent} transition-colors`}>
                  <Plus size={14} /> Add feature
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (layout === "quote-style") {
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 ${useGradientClasses ? `bg-gradient-to-br ${colors.bg}` : ""}`} style={customBgStyle} />
        <div className={`absolute top-0 left-1/4 w-96 h-96 ${colors.orb1Strong} rounded-full blur-3xl`} />
        <div className={`absolute bottom-0 right-1/4 w-72 h-72 ${colors.orb2Strong} rounded-full blur-3xl`} />

        {renderIndicator("top-right")}

        <div className="relative h-full flex items-center justify-center p-12">
          <div className="max-w-4xl text-center">
            <div className="text-8xl font-serif leading-none mb-4" style={{ color: colors.accent, opacity: 0.3 }}>
              "
            </div>

            {renderTitle({ className: "text-3xl md:text-4xl lg:text-5xl mb-8 italic", align: "center", showSubtitle: isTitleSlide })}
            {!isTitleSlide && renderDescription({ className: "mt-4", align: "center" })}

            {bulletPoints.length > 0 && (
              <div className="mt-8 space-y-2">
                {bulletPoints.map((point, i) => (
                  <EditableText
                    key={i}
                    value={point}
                    isEditing={isEditing && editingText?.field === "bullet" && editingText?.bulletIndex === i}
                    onStartEdit={() => onStartEditing(index, "bullet", i)}
                    onChange={(val) => onUpdateContent(index, "bullet", val, i)}
                    onFinish={onFinishEditing}
                    className="text-lg"
                    style={{ fontFamily: theme.fonts.body.family, color: colors.textMuted }}
                    isOwner={canEdit}
                    isHovered={isHovered}
                    onDelete={() => onDeleteBullet(index, i)}
                  />
                ))}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 mt-10">
              <div className="w-12 h-px" style={{ backgroundColor: colors.accent }} />
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.accent }} />
              <div className="w-12 h-px" style={{ backgroundColor: colors.accent }} />
            </div>
          </div>
        </div>

        {hasImage && slide.image && (
          <div className="absolute bottom-8 left-8 w-24 h-24 rounded-full overflow-hidden border-2" style={{ borderColor: colors.accent }}>
            <SlideImg image={slide.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
          </div>
        )}
      </div>
    );
  }

  if (layout === "timeline") {
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 ${useGradientClasses ? `bg-gradient-to-b ${colors.bg}` : ""}`} style={customBgStyle} />
        <div className={`absolute top-0 right-1/3 w-64 h-64 ${colors.orb1Strong} rounded-full blur-3xl`} />

        {renderIndicator("top-left")}

        <div className="relative h-full flex items-center">
          <div className="absolute left-24 top-24 bottom-12 w-px" style={{ backgroundColor: colors.accent, opacity: 0.3 }} />

          <div className="flex-1 p-12 pt-20 pl-32">
            {renderTitle({ className: "text-3xl md:text-4xl mb-10", showSubtitle: isTitleSlide })}
            {!isTitleSlide && renderDescription({ className: "mb-6" })}

            <div className="space-y-6">
              {bulletPoints.map((point, i) => (
                <div key={i} className="flex items-start gap-6 relative">
                  <div className="absolute -left-[2.5rem] w-4 h-4 rounded-full border-2" style={{ backgroundColor: colors.accent, borderColor: colors.accent }} />

                  <div className={`flex-1 p-4 rounded-lg border ${colors.cardBg}`}>
                    <EditableText
                      value={point}
                      isEditing={isEditing && editingText?.field === "bullet" && editingText?.bulletIndex === i}
                      onStartEdit={() => onStartEditing(index, "bullet", i)}
                      onChange={(val) => onUpdateContent(index, "bullet", val, i)}
                      onFinish={onFinishEditing}
                      className="text-base leading-relaxed"
                      style={{ fontFamily: theme.fonts.body.family, color: colors.textMuted }}
                      isOwner={canEdit}
                      isHovered={isHovered}
                      onDelete={() => onDeleteBullet(index, i)}
                    />
                  </div>
                </div>
              ))}
            </div>

            {canEdit && (
              <div className={`transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"} ${isHovered ? "" : "pointer-events-none"}`}>
                <button type="button" onClick={(e) => { e.stopPropagation(); onAddBullet(index); }} className={`mt-4 ml-6 flex items-center gap-2 text-sm ${colors.indicatorMuted} ${colors.hoverAccent} transition-colors`}>
                  <Plus size={14} /> Add step
                </button>
              </div>
            )}
          </div>

          {hasImage && (
            <div className="w-[35%] p-8 flex items-center">
              {renderImageBlock({ className: "w-full h-[70%]" })}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
