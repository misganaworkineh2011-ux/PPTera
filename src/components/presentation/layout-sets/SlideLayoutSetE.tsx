"use client";

import type { ReactNode, CSSProperties } from "react";
import { ImageIcon, Plus } from "lucide-react";
import type { Theme } from "~/lib/themes";
import type { SlideData, EditingState, SlideImage } from "../types";
import type { LayoutVariant } from "../slide-layout-utils";
import EditableText from "../EditableText";
import SlideImg from "../SlideImage";

interface SlideLayoutSetEProps {
  layout: LayoutVariant;
  slide: SlideData;
  theme: Theme;
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
    border: string;
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
  renderEnhanced: (props?: { compact?: boolean }) => ReactNode;
  renderIndicator: (position: "top-left" | "top-right") => ReactNode;
}

export function renderLayoutSetE(props: SlideLayoutSetEProps): ReactNode | null {
  const {
    layout,
    slide,
    theme,
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
    renderEnhanced,
    renderIndicator,
  } = props;

  if (layout === "diamond-frame") {
    const firstImage = allImages[0];
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 ${useGradientClasses ? `bg-gradient-to-br ${colors.bg}` : ""}`} style={customBgStyle} />

        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-1/4 w-2 h-2 rounded-full bg-orange-500/60 animate-pulse" />
          <div className="absolute top-40 right-1/3 w-1.5 h-1.5 rounded-full bg-red-500/50 animate-pulse" style={{ animationDelay: "0.5s" }} />
          <div className="absolute bottom-32 left-1/3 w-2 h-2 rounded-full bg-yellow-500/40 animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-60 right-1/4 w-1 h-1 rounded-full bg-orange-400/50 animate-pulse" style={{ animationDelay: "1.5s" }} />
          <div className="absolute bottom-48 right-1/2 w-1.5 h-1.5 rounded-full bg-red-400/45 animate-pulse" style={{ animationDelay: "0.7s" }} />
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-red-900/20 via-orange-900/10 to-transparent" />

        <div className={`absolute top-0 right-1/4 w-96 h-96 ${colors.orb1Strong} rounded-full blur-3xl`} />
        <div className={`absolute bottom-0 left-1/4 w-80 h-80 ${colors.orb2Strong} rounded-full blur-3xl`} />

        {renderIndicator("top-left")}

        <div className="relative h-full flex items-center">
          <div className="w-[55%] flex flex-col justify-center p-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-4 h-4 rotate-45 bg-gradient-to-br from-red-500 to-orange-500" />
              <div className={`w-20 h-0.5 bg-gradient-to-r ${colors.accentLine} to-transparent`} />
            </div>

            {renderTitle({ className: "text-4xl md:text-5xl mb-8" })}
            {renderEnhanced({})}
          </div>

          {hasImage && firstImage && (
            <div className="w-[45%] relative flex items-center justify-center">
              <div className="relative">
                <div className="absolute -inset-6 bg-gradient-to-br from-red-500/30 via-orange-500/20 to-yellow-500/30 blur-xl rotate-45" style={{ width: "320px", height: "320px" }} />

                <div className="relative w-72 h-72 overflow-hidden rotate-45 shadow-2xl" style={{ borderRadius: "24px" }}>
                  <SlideImg image={firstImage} alt={firstImage.alt || slide.title} className="absolute inset-0 w-[141%] h-[141%] object-cover -rotate-45 scale-100" style={{ top: "-20%", left: "-20%" }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-red-900/50 to-transparent -rotate-45" />
                </div>

                <div className="absolute inset-0 w-72 h-72 rotate-45 border-2 border-red-500/40" style={{ borderRadius: "24px" }} />

                {hasMultipleImages && allImages[1] && (
                  <div className="absolute -bottom-12 -left-8 w-20 h-20 overflow-hidden rotate-45 shadow-xl" style={{ borderRadius: "12px" }}>
                    <SlideImg image={allImages[1]} alt={allImages[1].alt || ""} className="w-[141%] h-[141%] object-cover -rotate-45" style={{ marginTop: "-20%", marginLeft: "-20%" }} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500/60 via-orange-500/40 to-red-500/60" />
      </div>
    );
  }

  if (layout === "ember-cards") {
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 ${useGradientClasses ? `bg-gradient-to-br ${colors.bg}` : ""}`} style={customBgStyle} />

        <div className="absolute inset-0">
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-red-900/30 via-orange-900/15 to-transparent" />
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[300px] bg-gradient-to-r from-red-600/15 via-orange-500/10 to-red-600/15 rounded-full blur-3xl" />
        </div>

        <div className="absolute top-32 left-20 w-1.5 h-1.5 rounded-full bg-orange-400/50 animate-bounce" style={{ animationDuration: "3s" }} />
        <div className="absolute top-48 right-32 w-2 h-2 rounded-full bg-red-400/40 animate-bounce" style={{ animationDuration: "4s", animationDelay: "1s" }} />
        <div className="absolute bottom-40 left-40 w-1 h-1 rounded-full bg-yellow-400/45 animate-bounce" style={{ animationDuration: "3.5s", animationDelay: "0.5s" }} />

        {renderIndicator("top-left")}

        <div className="relative h-full p-12 pt-20">
          <div className="mb-8">
            {renderTitle({ className: "text-3xl md:text-4xl mb-3" })}
            <div className="w-32 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-transparent rounded-full" />
          </div>

          {bulletPoints.length > 0 && (
            <div className="grid grid-cols-2 gap-4 max-w-4xl">
              {bulletPoints.map((point, i) => (
                <div key={i} className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500/0 via-orange-500/0 to-red-500/0 rounded-xl blur opacity-0 transition-all duration-300" />

                  <div className={`relative p-5 rounded-xl border backdrop-blur-sm ${colors.cardBg} transition-all`}>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 bg-gradient-to-br from-red-500/30 to-orange-500/20 border border-red-500/30" style={{ color: colors.accent }}>
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
          <div className="absolute bottom-8 right-8 w-52 h-36">
            <div className="absolute -inset-1 bg-gradient-to-br from-red-500/30 to-orange-500/20 rounded-xl blur" />
            <div className="relative w-full h-full rounded-xl overflow-hidden border border-red-500/30">
              <SlideImg image={allImages[0]!} alt={allImages[0]!.alt || slide.title} className="w-full h-full object-cover" />
            </div>
          </div>
        )}
      </div>
    );
  }

  if (layout === "molten-split") {
    const firstImage = allImages[0];
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 ${useGradientClasses ? `bg-gradient-to-br ${colors.bg}` : ""}`} style={customBgStyle} />

        <div className="absolute top-0 bottom-0 left-1/2 w-2 -translate-x-1/2">
          <div className="absolute inset-0 bg-gradient-to-b from-red-500/80 via-orange-500/60 to-yellow-500/80 blur-sm" />
          <div className="absolute inset-0 bg-gradient-to-b from-red-400 via-orange-400 to-red-400 w-0.5 left-1/2 -translate-x-1/2" />
        </div>

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-full">
          <div className="absolute top-20 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500/20 to-transparent animate-pulse" />
          <div className="absolute top-40 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-red-500/15 to-transparent animate-pulse" style={{ animationDelay: "0.5s" }} />
          <div className="absolute top-60 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        <div className={`absolute top-0 left-1/4 w-80 h-80 ${colors.orb1Strong} rounded-full blur-3xl`} />
        <div className={`absolute bottom-0 right-1/4 w-72 h-72 ${colors.orb2Strong} rounded-full blur-3xl`} />

        {renderIndicator("top-left")}

        <div className="relative h-full flex">
          <div className="w-[48%] flex flex-col justify-center p-12 pr-16">
            {renderTitle({ className: "text-4xl md:text-5xl mb-8" })}
            {renderEnhanced({})}
          </div>

          <div className="w-[48%] ml-auto flex items-center justify-center p-12 pl-16">
            {hasImage && firstImage ? (
              <div className="relative w-full h-[80%]">
                <div className="absolute -inset-4 bg-gradient-to-br from-red-500/25 via-orange-500/15 to-yellow-500/25 rounded-2xl blur-xl" />

                <div className="relative w-full h-full rounded-2xl overflow-hidden border-2 border-red-500/30 shadow-2xl" style={{ boxShadow: "0 0 40px rgba(239, 68, 68, 0.3)" }}>
                  <SlideImg image={firstImage} alt={firstImage.alt || slide.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a0a0a]/60 via-transparent to-transparent" />
                </div>

                {hasMultipleImages && allImages[1] && (
                  <div className="absolute -bottom-6 -left-6 w-28 h-20 rounded-xl overflow-hidden border border-orange-500/40 shadow-xl">
                    <SlideImg image={allImages[1]} alt={allImages[1].alt || ""} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            ) : (
              <div className={`w-full h-[70%] border-2 border-dashed ${colors.border} rounded-2xl flex items-center justify-center`}>
                <div className="text-center" style={{ color: colors.textMuted }}>
                  <ImageIcon size={48} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Add image</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500/50 via-orange-500/70 to-red-500/50" />
      </div>
    );
  }

  if (layout === "arch-frame") {
    const firstImage = allImages[0];
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 ${useGradientClasses ? `bg-gradient-to-br ${colors.bg}` : ""}`} style={customBgStyle} />

        <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <path d="M100,10 Q150,50 140,100 Q130,150 100,190 Q70,150 60,100 Q50,50 100,10" fill="none" stroke="#e879a9" strokeWidth="1" />
            <path d="M100,30 Q130,60 125,100 Q120,140 100,170 Q80,140 75,100 Q70,60 100,30" fill="none" stroke="#818cf8" strokeWidth="0.5" />
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 w-48 h-48 opacity-10 rotate-180">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <path d="M100,10 Q150,50 140,100 Q130,150 100,190 Q70,150 60,100 Q50,50 100,10" fill="none" stroke="#e879a9" strokeWidth="1" />
          </svg>
        </div>

        <div className={`absolute top-0 right-1/4 w-96 h-96 ${colors.orb1Strong} rounded-full blur-3xl`} />
        <div className={`absolute bottom-0 left-1/4 w-80 h-80 ${colors.orb2Strong} rounded-full blur-3xl`} />

        {renderIndicator("top-left")}

        <div className="relative h-full flex items-center">
          <div className="w-[55%] flex flex-col justify-center p-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-8 h-8 rounded-full border-2 border-pink-400/50 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-gradient-to-br from-pink-400 to-pink-500" />
              </div>
              <div className={`w-20 h-0.5 bg-gradient-to-r ${colors.accentLine} to-transparent`} />
            </div>

            {renderTitle({ className: "text-4xl md:text-5xl mb-8" })}
            {renderEnhanced({})}
          </div>

          {hasImage && firstImage && (
            <div className="w-[45%] relative flex items-center justify-center">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-pink-400/25 via-indigo-500/15 to-pink-400/25 blur-xl" style={{ borderRadius: "50% 50% 0 0 / 60% 60% 0 0" }} />

                <div className="relative w-64 h-80 overflow-hidden shadow-2xl" style={{ borderRadius: "50% 50% 8px 8px / 40% 40% 8px 8px" }}>
                  <SlideImg image={firstImage} alt={firstImage.alt || slide.title} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a1d]/60 to-transparent" />
                </div>

                <div className="absolute inset-0 w-64 h-80 border-2 border-pink-400/40" style={{ borderRadius: "50% 50% 8px 8px / 40% 40% 8px 8px" }} />

                {hasMultipleImages && allImages[1] && (
                  <div className="absolute -bottom-4 -left-12 w-20 h-28 overflow-hidden shadow-xl border border-indigo-500/30" style={{ borderRadius: "50% 50% 4px 4px / 40% 40% 4px 4px" }}>
                    <SlideImg image={allImages[1]} alt={allImages[1].alt || ""} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-pink-400/40 to-transparent" />
      </div>
    );
  }

  if (layout === "botanical-cards") {
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 ${useGradientClasses ? `bg-gradient-to-br ${colors.bg}` : ""}`} style={customBgStyle} />

        <div className="absolute top-0 left-0 w-32 h-32 opacity-15">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path d="M0,0 Q50,20 50,50 Q20,50 0,0" fill="none" stroke="#e879a9" strokeWidth="1" />
            <path d="M0,0 Q30,30 30,60 Q10,40 0,0" fill="none" stroke="#818cf8" strokeWidth="0.5" />
          </svg>
        </div>
        <div className="absolute bottom-0 right-0 w-32 h-32 opacity-15 rotate-180">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path d="M0,0 Q50,20 50,50 Q20,50 0,0" fill="none" stroke="#e879a9" strokeWidth="1" />
            <path d="M0,0 Q30,30 30,60 Q10,40 0,0" fill="none" stroke="#818cf8" strokeWidth="0.5" />
          </svg>
        </div>

        <div className={`absolute top-1/3 right-0 w-80 h-80 ${colors.orb1} rounded-full blur-3xl`} />
        <div className={`absolute bottom-1/3 left-0 w-64 h-64 ${colors.orb2} rounded-full blur-3xl`} />

        {renderIndicator("top-left")}

        <div className="relative h-full p-12 pt-20">
          <div className="mb-8">
            {renderTitle({ className: "text-3xl md:text-4xl mb-4" })}
            <div className="flex items-center gap-3">
              <div className="w-24 h-0.5 bg-gradient-to-r from-pink-400 to-transparent" />
              <div className="w-2 h-2 rounded-full bg-pink-400/60" />
              <div className="w-12 h-0.5 bg-gradient-to-r from-indigo-500/60 to-transparent" />
            </div>
          </div>

          {bulletPoints.length > 0 && (
            <div className="grid grid-cols-2 gap-5 max-w-4xl">
              {bulletPoints.map((point, i) => (
                <div key={i} className="relative group">
                  <div className={`relative p-6 rounded-2xl border backdrop-blur-sm ${colors.cardBg} transition-all`}>
                    <div className="absolute top-2 right-2 w-8 h-8 opacity-30">
                      <svg viewBox="0 0 30 30" className="w-full h-full">
                        <path d="M30,0 Q15,10 15,20 Q25,15 30,0" fill="none" stroke="#e879a9" strokeWidth="1" />
                      </svg>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 border-2 border-pink-400/40 bg-pink-400/10" style={{ color: colors.accent }}>
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
          <div className="absolute bottom-8 right-8 w-48 h-32">
            <div className="absolute -inset-1 bg-gradient-to-br from-pink-400/20 to-indigo-500/15 rounded-2xl blur" />
            <div className="relative w-full h-full rounded-2xl overflow-hidden border border-pink-400/25">
              <SlideImg image={allImages[0]!} alt={allImages[0]!.alt || slide.title} className="w-full h-full object-cover" />
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
