"use client";

import type { ReactNode, CSSProperties } from "react";
import { Plus } from "lucide-react";
import type { Theme } from "~/lib/themes";
import type { SlideData, EditingState, SlideImage } from "../types";
import type { LayoutVariant } from "../slide-layout-utils";
import EditableText from "../EditableText";
import SlideImg from "../SlideImage";

interface SlideLayoutSetBProps {
  layout: LayoutVariant;
  slide: SlideData;
  theme: Theme;
  themeType: string;
  index: number;
  bulletPoints: string[];
  colors: {
    bg: string;
    orb1: string;
    orb2: string;
    orb1Strong: string;
    orb2Strong: string;
    accent: string;
    accentLine: string;
    accentGlow: string;
    border: string;
    borderLine: string;
    imgOverlay: string;
    fullOverlay: string;
    sideOverlay: string;
    topOverlay: string;
    textMuted: string;
    indicatorMuted: string;
    hoverAccent: string;
    cardBg: string;
  };
  useGradientClasses: boolean;
  customBgStyle?: CSSProperties;
  hasImage: boolean;
  allImages: SlideImage[];
  isTitleSlide: boolean;
  canEdit: boolean;
  isHovered: boolean;
  isEditing: boolean;
  editingText: EditingState | null;
  getCardBgProps: (additionalClasses?: string) => { className: string; style?: CSSProperties };
  onStartEditing: (slideIndex: number, field: string, bulletIndex?: number) => void;
  onUpdateContent: (slideIndex: number, field: string, value: string, bulletIndex?: number) => void;
  onFinishEditing: () => void;
  onAddBullet: (slideIndex: number) => void;
  onDeleteBullet: (slideIndex: number, bulletIndex: number) => void;
  renderTitle: (props: { className?: string; align?: "left" | "center" | "right"; showSubtitle?: boolean }) => ReactNode;
  renderDescription: (props?: { className?: string; align?: "left" | "center" | "right" }) => ReactNode;
  renderEnhanced: (props?: { compact?: boolean }) => ReactNode;
  renderIndicator: (position: "top-left" | "top-right") => ReactNode;
  renderCardBox: (props: { children: ReactNode; className?: string; style?: CSSProperties }) => ReactNode;
}

export function renderLayoutSetB(props: SlideLayoutSetBProps): ReactNode | null {
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
    isTitleSlide,
    canEdit,
    isHovered,
    isEditing,
    editingText,
    getCardBgProps,
    onStartEditing,
    onUpdateContent,
    onFinishEditing,
    onAddBullet,
    onDeleteBullet,
    renderTitle,
    renderDescription,
    renderEnhanced,
    renderIndicator,
    renderCardBox,
  } = props;

  if (layout === "cards-grid") {
    if (themeType === "hacker") {
      const bgImage = theme.backgroundImage;
      return (
        <div className="h-full relative overflow-hidden">
          {bgImage && (
            <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${bgImage})` }} />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0d]/80 via-[#141414]/60 to-[#0d0d0d]/85" />

          <div className="absolute inset-0 overflow-hidden opacity-15 pointer-events-none hidden sm:block">
            {[10, 20, 30, 45, 55, 70, 80, 90].map((left, idx) => (
              <div key={idx} className="absolute top-0 w-px bg-gradient-to-b from-[#00ff41] via-[#00ff41]/50 to-transparent" style={{ left: `${left}%`, height: `${30 + idx * 8}%` }} />
            ))}
          </div>

          {renderIndicator("top-left")}

          <div className="relative h-full flex flex-col justify-center p-4 sm:p-8 md:p-12 pt-12 sm:pt-8 md:pt-12 overflow-visible">
            <div className="mb-4 sm:mb-6 md:mb-8">
              <span className="text-[#00ff41]/50 font-mono text-[10px] sm:text-xs uppercase tracking-widest">// System Output</span>
              {renderTitle({ className: "text-xl sm:text-3xl md:text-4xl lg:text-5xl mt-1 sm:mt-2", align: "left" })}
            </div>

            {bulletPoints.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                {bulletPoints.map((point, i) => (
                  <div key={i} className="group relative">
                    <div className="absolute inset-0 bg-[#00ff41]/5 rounded-lg opacity-0 transition-opacity" />
                    <div className="relative p-3 sm:p-4 md:p-5 rounded-lg border border-[#00ff41]/30 bg-[#0d0d0d]/70 backdrop-blur-sm transition-colors">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                        <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded border border-[#00ff41]/40 flex items-center justify-center bg-[#00ff41]/10">
                          <span className="text-[#00ff41] font-mono text-xs sm:text-sm font-bold">{String(i + 1).padStart(2, "0")}</span>
                        </div>
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#00ff41] animate-pulse" />
                      </div>
                      <EditableText
                        value={point}
                        isEditing={isEditing && editingText?.field === "bullet" && editingText?.bulletIndex === i}
                        onStartEdit={() => onStartEditing(index, "bullet", i)}
                        onChange={(val) => onUpdateContent(index, "bullet", val, i)}
                        onFinish={onFinishEditing}
                        className="text-sm sm:text-base leading-relaxed"
                        style={{ fontFamily: theme.fonts.body.family, color: "#39ff14" }}
                        isOwner={canEdit}
                        isHovered={isHovered}
                        onDelete={() => onDeleteBullet(index, i)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {canEdit && (
              <div className={`transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"} ${isHovered ? "" : "pointer-events-none"}`}>
                <button type="button" onClick={(e) => { e.stopPropagation(); onAddBullet(index); }} className="mt-4 sm:mt-6 flex items-center gap-2 text-xs sm:text-sm text-[#00ff41]/60 hover:text-[#00ff41] transition-colors">
                  <Plus size={12} className="sm:w-[14px] sm:h-[14px]" /> Add module
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 ${useGradientClasses ? `bg-gradient-to-br ${colors.bg}` : ""}`} style={customBgStyle} />
        <div className={`absolute top-1/3 right-0 w-80 h-80 ${colors.orb1} rounded-full blur-3xl hidden sm:block`} />

        {renderIndicator("top-left")}

        <div className="relative h-full flex flex-col justify-center p-4 sm:p-8 md:p-12 pt-12 sm:pt-16 md:pt-20 overflow-visible">
          {renderTitle({ className: "text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-4 sm:mb-6 md:mb-8", showSubtitle: isTitleSlide })}
          {!isTitleSlide && renderDescription({ className: "mb-3 sm:mb-4" })}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4 mt-3 sm:mt-4 md:mt-6">
            {bulletPoints.map((point, i) => {
              const cardBgProps = getCardBgProps("p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl border backdrop-blur-sm");
              return (
                <div key={i} className={cardBgProps.className} style={cardBgProps.style}>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-md sm:rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold shrink-0" style={{ backgroundColor: colors.accent, color: themeType === "light" || themeType === "corporate" ? "#fff" : "#000" }}>
                      {i + 1}
                    </div>
                    <EditableText
                      value={point}
                      isEditing={isEditing && editingText?.field === "bullet" && editingText?.bulletIndex === i}
                      onStartEdit={() => onStartEditing(index, "bullet", i)}
                      onChange={(val) => onUpdateContent(index, "bullet", val, i)}
                      onFinish={onFinishEditing}
                      className="flex-1 text-sm sm:text-base leading-relaxed"
                      style={{ fontFamily: theme.fonts.body.family, color: colors.textMuted }}
                      isOwner={canEdit}
                      isHovered={isHovered}
                      onDelete={() => onDeleteBullet(index, i)}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {canEdit && (
            <div className={`transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"} ${isHovered ? "" : "pointer-events-none"}`}>
              <button type="button" onClick={(e) => { e.stopPropagation(); onAddBullet(index); }} className={`mt-3 sm:mt-4 flex items-center gap-2 text-xs sm:text-sm ${colors.indicatorMuted} ${colors.hoverAccent} transition-colors`}>
                <Plus size={12} className="sm:w-[14px] sm:h-[14px]" /> Add card
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (layout === "grid-2-col") {
    const midPoint = Math.ceil(bulletPoints.length / 2);
    const leftColumn = bulletPoints.slice(0, midPoint);
    const rightColumn = bulletPoints.slice(midPoint);

    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 ${useGradientClasses ? `bg-gradient-to-br ${colors.bg}` : ""}`} style={customBgStyle} />
        <div className={`absolute top-1/4 right-1/4 w-64 h-64 ${colors.orb1} rounded-full blur-3xl hidden sm:block`} />

        {renderIndicator("top-left")}

        <div className="relative h-full flex flex-col justify-center p-4 sm:p-8 md:p-12 pt-12 sm:pt-16 md:pt-20 overflow-visible">
          {renderTitle({ className: "text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-4 sm:mb-6 md:mb-8", showSubtitle: isTitleSlide })}
          {!isTitleSlide && renderDescription({ className: "mb-3 sm:mb-4" })}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {renderCardBox({
              className: "p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl border backdrop-blur-sm",
              children: (
                <div className="space-y-3 sm:space-y-4">
                  {leftColumn.map((point, i) => (
                    <div key={i} className="flex items-start gap-2 sm:gap-3">
                      <div className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ backgroundColor: colors.accent }} />
                      <EditableText
                        value={point}
                        isEditing={isEditing && editingText?.field === "bullet" && editingText?.bulletIndex === i}
                        onStartEdit={() => onStartEditing(index, "bullet", i)}
                        onChange={(val) => onUpdateContent(index, "bullet", val, i)}
                        onFinish={onFinishEditing}
                        className="flex-1 text-sm sm:text-base leading-relaxed"
                        style={{ fontFamily: theme.fonts.body.family, color: colors.textMuted }}
                        isOwner={canEdit}
                        isHovered={isHovered}
                        onDelete={() => onDeleteBullet(index, i)}
                      />
                    </div>
                  ))}
                </div>
              ),
            })}

            {renderCardBox({
              className: "p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl border backdrop-blur-sm",
              children: (
                <div className="space-y-3 sm:space-y-4">
                  {rightColumn.map((point, i) => (
                    <div key={i} className="flex items-start gap-2 sm:gap-3">
                      <div className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ backgroundColor: colors.accent }} />
                      <EditableText
                        value={point}
                        isEditing={isEditing && editingText?.field === "bullet" && editingText?.bulletIndex === midPoint + i}
                        onStartEdit={() => onStartEditing(index, "bullet", midPoint + i)}
                        onChange={(val) => onUpdateContent(index, "bullet", val, midPoint + i)}
                        onFinish={onFinishEditing}
                        className="flex-1 text-sm sm:text-base leading-relaxed"
                        style={{ fontFamily: theme.fonts.body.family, color: colors.textMuted }}
                        isOwner={canEdit}
                        isHovered={isHovered}
                        onDelete={() => onDeleteBullet(index, midPoint + i)}
                      />
                    </div>
                  ))}
                </div>
              ),
            })}
          </div>

          {canEdit && (
            <div className={`transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"} ${isHovered ? "" : "pointer-events-none"}`}>
              <button type="button" onClick={(e) => { e.stopPropagation(); onAddBullet(index); }} className={`mt-4 flex items-center gap-2 text-xs sm:text-sm ${colors.indicatorMuted} ${colors.hoverAccent} transition-colors`}>
                <Plus size={14} /> Add point
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (layout === "grid-3-col") {
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 ${useGradientClasses ? `bg-gradient-to-br ${colors.bg}` : ""}`} style={customBgStyle} />
        <div className={`absolute bottom-0 left-1/3 w-72 h-72 ${colors.orb2} rounded-full blur-3xl hidden sm:block`} />

        {renderIndicator("top-left")}

        <div className="relative h-full flex flex-col justify-center p-4 sm:p-8 md:p-12 pt-12 sm:pt-16 md:pt-20 overflow-visible">
          {renderTitle({ className: "text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-4 sm:mb-6 md:mb-8 text-center", align: "center", showSubtitle: isTitleSlide })}
          {!isTitleSlide && renderDescription({ className: "mb-3 sm:mb-4", align: "center" })}

          <div className="max-w-5xl mx-auto">
            {renderEnhanced({})}
          </div>

          {canEdit && (
            <div className={`transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"} ${isHovered ? "" : "pointer-events-none"}`}>
              <button type="button" onClick={(e) => { e.stopPropagation(); onAddBullet(index); }} className={`mt-4 mx-auto flex items-center gap-2 text-xs sm:text-sm ${colors.indicatorMuted} ${colors.hoverAccent} transition-colors`}>
                <Plus size={14} /> Add point
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (layout === "grid-4-card") {
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 ${useGradientClasses ? `bg-gradient-to-br ${colors.bg}` : ""}`} style={customBgStyle} />
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 ${colors.orb1} rounded-full blur-3xl hidden sm:block`} />

        {renderIndicator("top-left")}

        <div className="relative h-full flex flex-col justify-center p-4 sm:p-8 md:p-12 pt-12 sm:pt-16 md:pt-20 overflow-visible">
          {renderTitle({ className: "text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-4 sm:mb-6 md:mb-8" })}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5 max-w-4xl">
            {bulletPoints.slice(0, 4).map((point, i) => {
              const cardBgProps = getCardBgProps("p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl border backdrop-blur-sm");
              return (
                <div key={i} className={cardBgProps.className} style={cardBgProps.style}>
                  <div className="flex items-center gap-3 mb-2 sm:mb-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center font-bold text-sm sm:text-base" style={{ backgroundColor: colors.accent, color: themeType === "light" || themeType === "corporate" ? "#fff" : "#000" }}>
                      {i + 1}
                    </div>
                    <div className="h-px flex-1" style={{ backgroundColor: `${colors.accent}30` }} />
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
                    onDelete={() => onDeleteBullet(index, i)}
                  />
                </div>
              );
            })}
          </div>

          {canEdit && bulletPoints.length < 4 && (
            <div className={`transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"} ${isHovered ? "" : "pointer-events-none"}`}>
              <button type="button" onClick={(e) => { e.stopPropagation(); onAddBullet(index); }} className={`mt-4 flex items-center gap-2 text-xs sm:text-sm ${colors.indicatorMuted} ${colors.hoverAccent} transition-colors`}>
                <Plus size={14} /> Add card
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (layout === "cards-2") {
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 ${useGradientClasses ? `bg-gradient-to-br ${colors.bg}` : ""}`} style={customBgStyle} />
        <div className={`absolute top-0 right-0 w-80 h-80 ${colors.orb1Strong} rounded-full blur-3xl hidden sm:block`} />
        <div className={`absolute bottom-0 left-0 w-64 h-64 ${colors.orb2} rounded-full blur-3xl hidden sm:block`} />

        {renderIndicator("top-left")}

        <div className="relative h-full p-4 sm:p-8 md:p-12 pt-12 sm:pt-16 md:pt-20 flex flex-col justify-center overflow-visible">
          {renderTitle({ className: "text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-4 sm:mb-6 md:mb-8" })}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {bulletPoints.slice(0, 2).map((point, i) => {
              const cardBgProps = getCardBgProps("p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl border-2 backdrop-blur-sm flex flex-col");
              return (
                <div key={i} className={cardBgProps.className} style={{ ...cardBgProps.style, borderColor: `${colors.accent}40` }}>
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl mb-4 sm:mb-5 flex items-center justify-center" style={{ backgroundColor: `${colors.accent}15` }}>
                    <span className="text-2xl sm:text-3xl font-bold" style={{ color: colors.accent }}>{i + 1}</span>
                  </div>
                  <EditableText
                    value={point}
                    isEditing={isEditing && editingText?.field === "bullet" && editingText?.bulletIndex === i}
                    onStartEdit={() => onStartEditing(index, "bullet", i)}
                    onChange={(val) => onUpdateContent(index, "bullet", val, i)}
                    onFinish={onFinishEditing}
                    className="text-base sm:text-lg leading-relaxed flex-1"
                    style={{ fontFamily: theme.fonts.body.family, color: colors.textMuted }}
                    isOwner={canEdit}
                    isHovered={isHovered}
                    onDelete={() => onDeleteBullet(index, i)}
                  />
                </div>
              );
            })}
          </div>

          {canEdit && bulletPoints.length < 2 && (
            <div className={`transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"} ${isHovered ? "" : "pointer-events-none"}`}>
              <button type="button" onClick={(e) => { e.stopPropagation(); onAddBullet(index); }} className={`mt-4 flex items-center gap-2 text-xs sm:text-sm ${colors.indicatorMuted} ${colors.hoverAccent} transition-colors`}>
                <Plus size={14} /> Add card
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (layout === "cards-3") {
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 ${useGradientClasses ? `bg-gradient-to-br ${colors.bg}` : ""}`} style={customBgStyle} />
        <div className={`absolute top-1/3 left-1/4 w-72 h-72 ${colors.orb1} rounded-full blur-3xl hidden sm:block`} />

        {renderIndicator("top-left")}

        <div className="relative h-full p-4 sm:p-8 md:p-12 pt-12 sm:pt-16 md:pt-20 flex flex-col justify-center overflow-visible">
          {renderTitle({ className: "text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-4 sm:mb-6 md:mb-8 text-center", align: "center" })}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {bulletPoints.slice(0, 3).map((point, i) => {
              const cardBgProps = getCardBgProps("p-4 sm:p-5 md:p-6 rounded-xl border backdrop-blur-sm flex flex-col items-center text-center");
              return (
                <div key={i} className={cardBgProps.className} style={cardBgProps.style}>
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full mb-3 sm:mb-4 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${colors.accent}30, ${colors.accent}10)`, border: `2px solid ${colors.accent}40` }}>
                    <span className="text-xl sm:text-2xl font-bold" style={{ color: colors.accent }}>{i + 1}</span>
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
              );
            })}
          </div>

          {canEdit && bulletPoints.length < 3 && (
            <div className={`transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"} ${isHovered ? "" : "pointer-events-none"}`}>
              <button type="button" onClick={(e) => { e.stopPropagation(); onAddBullet(index); }} className={`mt-4 mx-auto flex items-center gap-2 text-xs sm:text-sm ${colors.indicatorMuted} ${colors.hoverAccent} transition-colors`}>
                <Plus size={14} /> Add card
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (layout === "comparison") {
    const midPoint = Math.ceil(bulletPoints.length / 2);
    const leftItems = bulletPoints.slice(0, midPoint);
    const rightItems = bulletPoints.slice(midPoint);
    const comparisonCardProps = getCardBgProps("p-4 sm:p-5 md:p-6 rounded-xl border-2");

    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 ${useGradientClasses ? `bg-gradient-to-br ${colors.bg}` : ""}`} style={customBgStyle} />

        {renderIndicator("top-left")}

        <div className="relative h-full flex flex-col justify-center p-4 sm:p-8 md:p-12 pt-12 sm:pt-16 md:pt-20 overflow-visible">
          {renderTitle({ className: "text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-4 sm:mb-6 md:mb-8 text-center", align: "center", showSubtitle: isTitleSlide })}
          {!isTitleSlide && renderDescription({ className: "mb-3 sm:mb-4", align: "center" })}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-5xl mx-auto">
            <div className={comparisonCardProps.className} style={{ ...comparisonCardProps.style, borderColor: `${colors.accent}50` }}>
              <div className="text-center mb-4 pb-3 border-b" style={{ borderColor: `${colors.accent}30` }}>
                <span className="text-sm sm:text-base font-semibold uppercase tracking-wider" style={{ color: colors.accent }}>Option A</span>
              </div>
              <div className="space-y-3">
                {leftItems.map((point, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span style={{ color: colors.accent }}>✓</span>
                    <EditableText
                      value={point}
                      isEditing={isEditing && editingText?.field === "bullet" && editingText?.bulletIndex === i}
                      onStartEdit={() => onStartEditing(index, "bullet", i)}
                      onChange={(val) => onUpdateContent(index, "bullet", val, i)}
                      onFinish={onFinishEditing}
                      className="flex-1 text-sm sm:text-base"
                      style={{ fontFamily: theme.fonts.body.family, color: colors.textMuted }}
                      isOwner={canEdit}
                      isHovered={isHovered}
                      onDelete={() => onDeleteBullet(index, i)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className={comparisonCardProps.className} style={{ ...comparisonCardProps.style, borderColor: `${colors.accent}30` }}>
              <div className="text-center mb-4 pb-3 border-b" style={{ borderColor: `${colors.accent}20` }}>
                <span className="text-sm sm:text-base font-semibold uppercase tracking-wider" style={{ color: colors.textMuted }}>Option B</span>
              </div>
              <div className="space-y-3">
                {rightItems.map((point, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span style={{ color: colors.textMuted }}>✓</span>
                    <EditableText
                      value={point}
                      isEditing={isEditing && editingText?.field === "bullet" && editingText?.bulletIndex === midPoint + i}
                      onStartEdit={() => onStartEditing(index, "bullet", midPoint + i)}
                      onChange={(val) => onUpdateContent(index, "bullet", val, midPoint + i)}
                      onFinish={onFinishEditing}
                      className="flex-1 text-sm sm:text-base"
                      style={{ fontFamily: theme.fonts.body.family, color: colors.textMuted }}
                      isOwner={canEdit}
                      isHovered={isHovered}
                      onDelete={() => onDeleteBullet(index, midPoint + i)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {canEdit && (
            <div className={`transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"} ${isHovered ? "" : "pointer-events-none"}`}>
              <button type="button" onClick={(e) => { e.stopPropagation(); onAddBullet(index); }} className={`mt-4 mx-auto flex items-center gap-2 text-xs sm:text-sm ${colors.indicatorMuted} ${colors.hoverAccent} transition-colors`}>
                <Plus size={14} /> Add item
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (layout === "stats-grid") {
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 ${useGradientClasses ? `bg-gradient-to-br ${colors.bg}` : ""}`} style={customBgStyle} />
        <div className={`absolute top-0 left-1/2 w-96 h-96 ${colors.orb1Strong} rounded-full blur-3xl hidden sm:block`} />

        {renderIndicator("top-left")}

        <div className="relative h-full flex flex-col justify-center p-4 sm:p-8 md:p-12 pt-12 sm:pt-16 md:pt-20 overflow-visible">
          {renderTitle({ className: "text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-6 sm:mb-8 md:mb-10 text-center", align: "center" })}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {bulletPoints.map((point, i) => {
              const statsCardProps = getCardBgProps("p-4 sm:p-5 md:p-6 rounded-xl border text-center");
              return (
                <div key={i} className={statsCardProps.className} style={statsCardProps.style}>
                  <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2" style={{ color: colors.accent }}>
                    {i + 1}
                  </div>
                  <EditableText
                    value={point}
                    isEditing={isEditing && editingText?.field === "bullet" && editingText?.bulletIndex === i}
                    onStartEdit={() => onStartEditing(index, "bullet", i)}
                    onChange={(val) => onUpdateContent(index, "bullet", val, i)}
                    onFinish={onFinishEditing}
                    className="text-xs sm:text-sm uppercase tracking-wider"
                    style={{ fontFamily: theme.fonts.body.family, color: colors.textMuted }}
                    isOwner={canEdit}
                    isHovered={isHovered}
                    onDelete={() => onDeleteBullet(index, i)}
                  />
                </div>
              );
            })}
          </div>

          {canEdit && (
            <div className={`transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"} ${isHovered ? "" : "pointer-events-none"}`}>
              <button type="button" onClick={(e) => { e.stopPropagation(); onAddBullet(index); }} className={`mt-4 mx-auto flex items-center gap-2 text-xs sm:text-sm ${colors.indicatorMuted} ${colors.hoverAccent} transition-colors`}>
                <Plus size={14} /> Add stat
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (layout === "full-image") {
    const firstImage = allImages[0];
    return (
      <div className="h-full relative overflow-hidden">
        {hasImage && firstImage && (
          <SlideImg image={firstImage} alt={firstImage.alt || slide.title} className="absolute inset-0 w-full h-full object-cover" />
        )}
        {!hasImage && (
          <div className={`absolute inset-0 ${useGradientClasses ? `bg-gradient-to-br ${colors.bg}` : ""}`} style={customBgStyle}>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-dashed flex items-center justify-center mb-4" style={{ borderColor: colors.textMuted }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: colors.textMuted }}>
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </div>
              <span className="text-sm opacity-60" style={{ color: colors.textMuted }}>No image selected</span>
            </div>
          </div>
        )}

        {renderIndicator("top-left")}
      </div>
    );
  }

  if (layout === "image-background") {
    const firstImage = allImages[0];
    return (
      <div className="h-full relative overflow-hidden">
        {hasImage && firstImage && (
          <>
            <SlideImg image={firstImage} alt={firstImage.alt || slide.title} className="absolute inset-0 w-full h-full object-cover" />
            <div className={`absolute inset-0 ${colors.fullOverlay}`} />
          </>
        )}
        {!hasImage && (
          <div className={`absolute inset-0 ${useGradientClasses ? `bg-gradient-to-br ${colors.bg}` : ""}`} style={customBgStyle} />
        )}

        {renderIndicator("top-left")}

        <div className="relative h-full flex flex-col items-center justify-center p-6 sm:p-8 md:p-12">
          {renderTitle({
            className: "text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-6 sm:mb-8 md:mb-10 text-center max-w-5xl",
            align: "center",
            showSubtitle: isTitleSlide,
          })}

          {!isTitleSlide && (
            <div className="w-full max-w-4xl mx-auto">
              {renderEnhanced({ compact: false })}
            </div>
          )}

          {canEdit && !isTitleSlide && (
            <div className={`transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"} ${isHovered ? "" : "pointer-events-none"}`}>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onAddBullet(index); }}
                className={`mt-6 flex items-center gap-2 text-sm sm:text-base ${hasImage ? "text-white/80 hover:text-white" : `${colors.indicatorMuted} ${colors.hoverAccent}`} transition-colors`}
              >
                <Plus size={16} /> Add point
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (layout === "centered-image") {
    const firstImage = allImages[0];
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 ${useGradientClasses ? `bg-gradient-to-br ${colors.bg}` : ""}`} style={customBgStyle} />
        <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 ${colors.orb1} rounded-full blur-3xl hidden sm:block`} />

        {renderIndicator("top-left")}

        <div className="relative h-full p-4 sm:p-8 md:p-12 pt-12 sm:pt-16 md:pt-20 flex flex-col justify-center overflow-visible">
          {renderTitle({ className: "text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-4 sm:mb-6 text-center", align: "center" })}

          {hasImage && firstImage && (
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="w-full max-w-md sm:max-w-lg md:max-w-xl h-40 sm:h-48 md:h-56 rounded-xl overflow-hidden shadow-lg">
                <SlideImg image={firstImage} alt={firstImage.alt || slide.title} className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          {bulletPoints.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-3xl mx-auto">
              {bulletPoints.map((point, i) => (
                <div key={i} className={`p-3 sm:p-4 rounded-lg border backdrop-blur-sm ${colors.cardBg}`}>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: colors.accent, color: themeType === "light" || themeType === "corporate" ? "#fff" : "#000" }}>
                      {i + 1}
                    </div>
                    <EditableText
                      value={point}
                      isEditing={isEditing && editingText?.field === "bullet" && editingText?.bulletIndex === i}
                      onStartEdit={() => onStartEditing(index, "bullet", i)}
                      onChange={(val) => onUpdateContent(index, "bullet", val, i)}
                      onFinish={onFinishEditing}
                      className="flex-1 text-sm sm:text-base leading-relaxed"
                      style={{ fontFamily: theme.fonts.body.family, color: colors.textMuted }}
                      isOwner={canEdit}
                      isHovered={isHovered}
                      onDelete={() => onDeleteBullet(index, i)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {canEdit && (
            <div className={`transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"} ${isHovered ? "" : "pointer-events-none"}`}>
              <button type="button" onClick={(e) => { e.stopPropagation(); onAddBullet(index); }} className={`mt-4 mx-auto flex items-center gap-2 text-xs sm:text-sm ${colors.indicatorMuted} ${colors.hoverAccent} transition-colors`}>
                <Plus size={14} /> Add card
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
