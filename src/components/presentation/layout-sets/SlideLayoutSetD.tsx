"use client";

import type { ReactNode, CSSProperties } from "react";
import { ImageIcon, Plus } from "lucide-react";
import type { Theme } from "~/lib/themes";
import type { SlideData, EditingState, SlideImage } from "../types";
import type { LayoutVariant } from "../slide-layout-utils";
import EditableText from "../EditableText";
import SlideImg from "../SlideImage";

interface SlideLayoutSetDProps {
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
    borderLine: string;
    textMuted: string;
    indicatorMuted: string;
    hoverAccent: string;
    cardBg: string;
  };
  useGradientClasses: boolean;
  customBgStyle?: CSSProperties;
  hasImage: boolean;
  hasMultipleImages: boolean;
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
  renderEnhanced: (props?: { compact?: boolean }) => ReactNode;
  renderIndicator: (position: "top-left" | "top-right") => ReactNode;
}

export function renderLayoutSetD(props: SlideLayoutSetDProps): ReactNode | null {
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
    hasMultipleImages,
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
    renderEnhanced,
    renderIndicator,
  } = props;

  if (layout === "diagonal-cut") {
    const firstImage = allImages[0];
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 ${useGradientClasses ? `bg-gradient-to-br ${colors.bg}` : ""}`} style={customBgStyle} />

        {hasImage && firstImage && (
          <div className="absolute right-0 top-0 bottom-0 w-[55%]" style={{ clipPath: "polygon(20% 0, 100% 0, 100% 100%, 0% 100%)" }}>
            <SlideImg image={firstImage} alt={firstImage.alt || slide.title} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628] via-transparent to-transparent" />
          </div>
        )}

        <div className="absolute top-20 right-[45%] w-32 h-32 border-2 border-teal-500/20 rotate-45" />
        <div className="absolute bottom-20 right-[50%] w-20 h-20 border border-cyan-500/15 rotate-12" />
        <div className={`absolute top-1/3 left-8 w-1 h-32 bg-gradient-to-b ${colors.accentLine} to-transparent`} />

        <div className={`absolute top-0 left-1/4 w-96 h-96 ${colors.orb1Strong} rounded-full blur-3xl`} />
        <div className={`absolute bottom-0 right-1/3 w-72 h-72 ${colors.orb2Strong} rounded-full blur-3xl`} />

        {renderIndicator("top-left")}

        <div className="relative h-full flex">
          <div className="w-[50%] flex flex-col justify-center p-12 pt-20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.accent }} />
              <div className={`w-24 h-0.5 bg-gradient-to-r ${colors.accentLine} to-transparent`} />
            </div>

            {renderTitle({ className: "text-4xl md:text-5xl mb-8", showSubtitle: isTitleSlide })}
            {!isTitleSlide && renderDescription({ className: "mb-6" })}
            {renderEnhanced({})}
          </div>
        </div>

        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500/50 ${colors.borderLine} to-transparent`} />
      </div>
    );
  }

  if (layout === "circle-focus") {
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 ${useGradientClasses ? `bg-gradient-to-br ${colors.bg}` : ""}`} style={customBgStyle} />

        <div className="absolute top-10 right-10 w-64 h-64 rounded-full border border-teal-500/10" />
        <div className="absolute top-16 right-16 w-52 h-52 rounded-full border border-cyan-500/15" />
        <div className="absolute bottom-20 left-20 w-40 h-40 rounded-full border border-teal-500/10" />

        <div className={`absolute top-1/4 right-1/4 w-80 h-80 ${colors.orb1Strong} rounded-full blur-3xl`} />
        <div className={`absolute bottom-1/4 left-1/3 w-64 h-64 ${colors.orb2} rounded-full blur-3xl`} />

        {renderIndicator("top-left")}

        <div className="relative h-full flex items-center">
          <div className="w-[55%] flex flex-col justify-center p-12">
            {renderTitle({ className: "text-4xl md:text-5xl mb-8", showSubtitle: isTitleSlide })}
            {!isTitleSlide && renderDescription({ className: "mb-6" })}
            {renderEnhanced({})}
          </div>

          <div className="w-[45%] relative flex items-center justify-center">
            {hasImage && (
              <div className="relative">
                <div className="w-72 h-72 rounded-full overflow-hidden border-4 shadow-2xl relative z-10" style={{ borderColor: colors.accent, boxShadow: `0 0 60px ${colors.accent}30` }}>
                  <SlideImg image={allImages[0]!} alt={allImages[0]!.alt || slide.title} className="w-full h-full object-cover" />
                </div>

                {hasMultipleImages && allImages[1] && (
                  <div className="absolute -bottom-8 -left-16 w-32 h-32 rounded-full overflow-hidden border-2 shadow-xl z-20" style={{ borderColor: `${colors.accent}80` }}>
                    <SlideImg image={allImages[1]} alt={allImages[1].alt || ""} className="w-full h-full object-cover" />
                  </div>
                )}
                {allImages.length > 2 && allImages[2] && (
                  <div className="absolute -top-4 -right-12 w-24 h-24 rounded-full overflow-hidden border-2 shadow-xl z-20" style={{ borderColor: `${colors.accent}60` }}>
                    <SlideImg image={allImages[2]} alt={allImages[2].alt || ""} className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="absolute inset-0 w-72 h-72 rounded-full border-2 border-dashed animate-spin-slow" style={{ borderColor: `${colors.accent}20`, animationDuration: "30s" }} />
              </div>
            )}

            {!hasImage && (
              <div className="w-64 h-64 rounded-full border-2 border-dashed flex items-center justify-center" style={{ borderColor: `${colors.accent}40` }}>
                <div className="text-center" style={{ color: colors.textMuted }}>
                  <ImageIcon size={48} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Add image</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-teal-500/30 to-transparent" />
      </div>
    );
  }

  if (layout === "wave-layout") {
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 ${useGradientClasses ? `bg-gradient-to-b ${colors.bg}` : ""}`} style={customBgStyle} />

        <svg className="absolute bottom-0 left-0 right-0 h-48 opacity-20" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="#14b8a6" d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,138.7C672,128,768,160,864,181.3C960,203,1056,213,1152,197.3C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
        </svg>
        <svg className="absolute bottom-0 left-0 right-0 h-32 opacity-10" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="#06b6d4" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,218.7C672,235,768,245,864,234.7C960,224,1056,192,1152,181.3C1248,171,1344,181,1392,186.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
        </svg>

        <div className="absolute top-20 right-20 w-6 h-6 rounded-full bg-teal-500/20" />
        <div className="absolute top-40 right-40 w-4 h-4 rounded-full bg-cyan-500/15" />
        <div className="absolute top-32 right-60 w-3 h-3 rounded-full bg-teal-400/25" />
        <div className="absolute bottom-40 left-20 w-5 h-5 rounded-full bg-cyan-500/20" />

        <div className={`absolute top-0 right-1/4 w-96 h-96 ${colors.orb1} rounded-full blur-3xl`} />

        {renderIndicator("top-left")}

        <div className="relative h-full flex flex-col justify-center p-12 pt-20">
          <div className="flex items-start gap-8">
            <div className={`${hasImage ? "w-[50%]" : "w-full"}`}>
              {renderTitle({ className: "text-4xl md:text-5xl mb-8" })}
            </div>

            {hasImage && (
              <div className="w-[45%] relative">
                <div className="rounded-3xl overflow-hidden shadow-2xl border" style={{ borderColor: `${colors.accent}30` }}>
                  <div className="aspect-video">
                    <SlideImg image={allImages[0]!} alt={allImages[0]!.alt || slide.title} className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-teal-500/20 to-cyan-500/10 blur-xl -z-10" />
              </div>
            )}
          </div>

          {bulletPoints.length > 0 && (
            <div className="mt-8 grid grid-cols-2 gap-4 max-w-3xl">
              {bulletPoints.map((point, i) => (
                <div key={i} className={`p-5 rounded-2xl backdrop-blur-sm border ${colors.cardBg}`} style={{ borderColor: `${colors.accent}20` }}>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ backgroundColor: `${colors.accent}20`, color: colors.accent }}>
                      {i + 1}
                    </div>
                    <EditableText
                      value={point}
                      isEditing={isEditing && editingText?.field === "bullet" && editingText?.bulletIndex === i}
                      onStartEdit={() => onStartEditing(index, "bullet", i)}
                      onChange={(val) => onUpdateContent(index, "bullet", val, i)}
                      onFinish={onFinishEditing}
                      className="flex-1 text-base leading-relaxed"
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

          {canEdit && bulletPoints.length > 0 && (
            <div className={`transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"} ${isHovered ? "" : "pointer-events-none"}`}>
              <button type="button" onClick={(e) => { e.stopPropagation(); onAddBullet(index); }} className={`mt-4 flex items-center gap-2 text-sm ${colors.indicatorMuted} ${colors.hoverAccent} transition-colors`}>
                <Plus size={14} /> Add card
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (layout === "hexagon-frame") {
    const firstImage = allImages[0];
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 ${useGradientClasses ? `bg-gradient-to-br ${colors.bg}` : ""}`} style={customBgStyle} />

        <div className="absolute top-0 left-0 right-0 h-full overflow-hidden">
          <div className="absolute top-10 left-1/4 w-96 h-2 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent rotate-12 blur-sm" />
          <div className="absolute top-32 right-1/4 w-80 h-1.5 bg-gradient-to-r from-transparent via-green-500/25 to-transparent -rotate-6 blur-sm" />
          <div className="absolute bottom-40 left-1/3 w-72 h-1 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent rotate-3 blur-sm" />
        </div>

        <div className={`absolute top-0 right-1/4 w-96 h-96 ${colors.orb1Strong} rounded-full blur-3xl`} />
        <div className={`absolute bottom-0 left-1/4 w-80 h-80 ${colors.orb2Strong} rounded-full blur-3xl`} />

        {renderIndicator("top-left")}

        <div className="relative h-full flex items-center">
          <div className="w-[55%] flex flex-col justify-center p-12">
            <div className="flex items-center gap-4 mb-6">
              <svg width="24" height="28" viewBox="0 0 24 28" fill="none" className="opacity-80">
                <path d="M12 0L24 7V21L12 28L0 21V7L12 0Z" fill={colors.accent} fillOpacity="0.6" />
              </svg>
              <div className={`w-20 h-0.5 bg-gradient-to-r ${colors.accentLine} to-transparent`} />
            </div>

            {renderTitle({ className: "text-4xl md:text-5xl mb-8" })}
            {renderEnhanced({})}
          </div>

          {hasImage && firstImage && (
            <div className="w-[45%] relative flex items-center justify-center">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-purple-500/30 via-green-500/20 to-cyan-500/30 blur-xl" style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }} />

                <div className="relative w-72 h-80 overflow-hidden" style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}>
                  <SlideImg image={firstImage} alt={firstImage.alt || slide.title} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 to-transparent" />
                </div>

                <svg className="absolute inset-0 w-72 h-80" viewBox="0 0 288 320" fill="none">
                  <path d="M144 4L284 84V236L144 316L4 236V84L144 4Z" stroke="url(#hexGrad)" strokeWidth="2" fill="none" />
                  <defs>
                    <linearGradient id="hexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity="0.6" />
                      <stop offset="50%" stopColor="#22c55e" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.6" />
                    </linearGradient>
                  </defs>
                </svg>

                {hasMultipleImages && allImages[1] && (
                  <div className="absolute -bottom-8 -left-12 w-24 h-28 overflow-hidden shadow-xl" style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}>
                    <SlideImg image={allImages[1]} alt={allImages[1].alt || ""} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500/50 via-green-500/30 to-cyan-500/50" />
      </div>
    );
  }

  if (layout === "glass-cards") {
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 ${useGradientClasses ? `bg-gradient-to-br ${colors.bg}` : ""}`} style={customBgStyle} />

        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[300px] bg-gradient-to-r from-purple-600/20 via-green-500/15 to-cyan-500/20 rounded-full blur-3xl rotate-12" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[250px] bg-gradient-to-l from-purple-500/15 via-pink-500/10 to-green-500/15 rounded-full blur-3xl -rotate-12" />
        </div>

        <div className="absolute top-20 left-20 w-2 h-2 rounded-full bg-purple-400/40" />
        <div className="absolute top-40 right-32 w-3 h-3 rounded-full bg-green-400/30" />
        <div className="absolute bottom-32 left-40 w-2 h-2 rounded-full bg-cyan-400/35" />
        <div className="absolute top-60 left-1/2 w-1.5 h-1.5 rounded-full bg-purple-300/40" />

        {renderIndicator("top-left")}

        <div className="relative h-full flex flex-col justify-center p-12 pt-20">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 max-w-2xl shadow-2xl">
            {renderTitle({ className: "text-3xl md:text-4xl" })}
          </div>

          {bulletPoints.length > 0 && (
            <div className="grid grid-cols-2 gap-4 max-w-4xl">
              {bulletPoints.map((point, i) => (
                <div key={i} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-5 shadow-xl transition-all group">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 bg-gradient-to-br from-purple-500/30 to-green-500/20 border border-purple-500/30" style={{ color: colors.accent }}>
                      {i + 1}
                    </div>
                    <EditableText
                      value={point}
                      isEditing={isEditing && editingText?.field === "bullet" && editingText?.bulletIndex === i}
                      onStartEdit={() => onStartEditing(index, "bullet", i)}
                      onChange={(val) => onUpdateContent(index, "bullet", val, i)}
                      onFinish={onFinishEditing}
                      className="flex-1 text-base leading-relaxed"
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
              <button type="button" onClick={(e) => { e.stopPropagation(); onAddBullet(index); }} className={`mt-4 flex items-center gap-2 text-sm ${colors.indicatorMuted} ${colors.hoverAccent} transition-colors`}>
                <Plus size={14} /> Add card
              </button>
            </div>
          )}
        </div>

        {hasImage && (
          <div className="absolute bottom-8 right-8 w-56 h-40 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-2 shadow-2xl">
            <div className="w-full h-full rounded-xl overflow-hidden">
              <SlideImg image={allImages[0]!} alt={allImages[0]!.alt || slide.title} className="w-full h-full object-cover" />
            </div>
          </div>
        )}
      </div>
    );
  }

  if (layout === "aurora-glow") {
    const firstImage = allImages[0];
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 ${useGradientClasses ? `bg-gradient-to-b ${colors.bg}` : ""}`} style={customBgStyle} />

        {hasImage && firstImage ? (
          <>
            <SlideImg image={firstImage} alt={firstImage.alt || slide.title} className="absolute inset-0 w-full h-full object-cover opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f0a1a] via-[#0f0a1a]/80 to-[#0f0a1a]/60" />
          </>
        ) : null}

        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-purple-500/40 via-purple-500/10 to-transparent blur-sm" />
          <div className="absolute top-0 left-1/3 w-0.5 h-3/4 bg-gradient-to-b from-green-500/30 via-green-500/5 to-transparent blur-sm" />
          <div className="absolute top-0 right-1/3 w-1 h-2/3 bg-gradient-to-b from-cyan-500/35 via-cyan-500/10 to-transparent blur-sm" />
          <div className="absolute top-0 right-1/4 w-0.5 h-1/2 bg-gradient-to-b from-purple-400/25 via-transparent to-transparent blur-sm" />
        </div>

        <div className={`absolute top-0 left-1/3 w-[600px] h-[400px] ${colors.orb1Strong} rounded-full blur-3xl`} />
        <div className={`absolute bottom-1/4 right-1/4 w-[400px] h-[300px] ${colors.orb2Strong} rounded-full blur-3xl`} />

        {renderIndicator("top-left")}

        <div className="relative h-full flex flex-col justify-center items-center p-12 text-center">
          <div className="relative mb-8">
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 via-green-500/10 to-purple-500/20 rounded-2xl blur-xl" />
            <div className="relative">
              {renderTitle({ className: "text-4xl md:text-5xl lg:text-6xl", align: "center" })}
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-purple-500 to-green-500" />
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-green-500 to-transparent" />
          </div>

          {bulletPoints.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4 max-w-4xl">
              {bulletPoints.map((point, i) => (
                <div key={i} className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/30 to-green-500/30 rounded-xl blur opacity-50 transition-opacity" />
                  <div className={`relative px-6 py-4 rounded-xl backdrop-blur-sm ${colors.cardBg}`}>
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
          )}

          {canEdit && (
            <div className={`transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"} ${isHovered ? "" : "pointer-events-none"}`}>
              <button type="button" onClick={(e) => { e.stopPropagation(); onAddBullet(index); }} className={`mt-6 flex items-center gap-2 text-sm ${colors.indicatorMuted} ${colors.hoverAccent} transition-colors`}>
                <Plus size={14} /> Add point
              </button>
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-purple-500/10 via-green-500/5 to-transparent" />
      </div>
    );
  }

  return null;
}
