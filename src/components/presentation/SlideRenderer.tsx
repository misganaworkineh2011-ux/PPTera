"use client";

import { ImageIcon, Plus } from "lucide-react";
import { type Theme } from "~/lib/themes";
import { type SlideData, type EditingState } from "./types";
import EditableText from "./EditableText";

interface SlideRendererProps {
  slide: SlideData;
  index: number;
  totalSlides: number;
  theme: Theme;
  isOwner: boolean;
  isFullscreen: boolean;
  isHovered: boolean;
  isEditing: boolean;
  editingText: EditingState | null;
  onStartEditing: (slideIndex: number, field: string, bulletIndex?: number) => void;
  onUpdateContent: (slideIndex: number, field: string, value: string, bulletIndex?: number) => void;
  onFinishEditing: () => void;
  onAddBullet: (slideIndex: number) => void;
  onDeleteBullet: (slideIndex: number, bulletIndex: number) => void;
}

type LayoutVariant = "left-content" | "right-content" | "centered" | "split-diagonal" | "image-focus" | "minimal-left" | "cards-grid" | "quote-style" | "timeline";

// Theme type detection
type ThemeType = "dark" | "light" | "sunset";
function getThemeType(theme: Theme): ThemeType {
  if (theme.id === "elegant-noir") return "dark";
  if (theme.id === "arctic-frost") return "light";
  if (theme.id === "sunset-gradient") return "sunset";
  return "dark";
}

// Different layout sequences per theme for variety
function getLayoutVariant(index: number, themeType: ThemeType): LayoutVariant {
  const layoutsByTheme: Record<ThemeType, LayoutVariant[]> = {
    dark: ["left-content", "image-focus", "right-content", "split-diagonal", "minimal-left", "centered"],
    light: ["centered", "left-content", "cards-grid", "right-content", "quote-style", "minimal-left"],
    sunset: ["image-focus", "split-diagonal", "timeline", "left-content", "centered", "right-content"],
  };
  const layouts = layoutsByTheme[themeType];
  return layouts[index % layouts.length]!;
}

export default function SlideRenderer({
  slide, index, totalSlides, theme, isOwner, isFullscreen, isHovered, isEditing,
  editingText, onStartEditing, onUpdateContent, onFinishEditing, onAddBullet, onDeleteBullet,
}: SlideRendererProps) {
  const hasImage = slide.image?.url && slide.image.source !== "placeholder";
  const bulletPoints = slide.bulletPoints || [];
  const canEdit = isOwner && !isFullscreen;
  const themeType = getThemeType(theme);
  const layout = getLayoutVariant(index, themeType);

  // Theme-aware colors for all three themes
  const colorMap = {
    dark: {
      bg: "from-zinc-900 via-zinc-950 to-black",
      bgSolid: "bg-zinc-950",
      orb1: "bg-amber-500/5",
      orb2: "bg-indigo-500/5",
      orb1Strong: "bg-amber-500/10",
      orb2Strong: "bg-indigo-500/10",
      accentMuted: "bg-amber-500/80",
      accentLine: "from-amber-500",
      accentBorder: "from-amber-500/20 via-transparent to-indigo-500/20",
      accentGlow: "from-amber-500/30 to-indigo-500/30",
      border: "border-zinc-700",
      borderLine: "via-zinc-800",
      surface: "bg-zinc-950",
      surfaceAlt: "bg-zinc-900/50",
      overlay: "from-zinc-950/40",
      cardBg: "bg-black/40 border-zinc-800/50",
      indicatorMuted: "text-zinc-600",
      hoverAccent: "hover:text-amber-500",
      imgOverlay: "bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent",
      fullOverlay: "bg-gradient-to-t from-black via-black/60 to-black/30",
      sideOverlay: "bg-gradient-to-r from-black/80 via-transparent to-transparent",
      topOverlay: "bg-gradient-to-b from-black/50 to-transparent",
    },
    light: {
      bg: "from-slate-50 via-white to-slate-100",
      bgSolid: "bg-white",
      orb1: "bg-cyan-500/10",
      orb2: "bg-violet-500/8",
      orb1Strong: "bg-cyan-500/15",
      orb2Strong: "bg-violet-500/12",
      accentMuted: "bg-cyan-600/80",
      accentLine: "from-cyan-500",
      accentBorder: "from-cyan-500/20 via-transparent to-violet-500/20",
      accentGlow: "from-cyan-500/30 to-violet-500/30",
      border: "border-slate-200",
      borderLine: "via-slate-300",
      surface: "bg-white",
      surfaceAlt: "bg-slate-100/50",
      overlay: "from-white/40",
      cardBg: "bg-white/80 border-slate-200/50",
      indicatorMuted: "text-slate-400",
      hoverAccent: "hover:text-cyan-600",
      imgOverlay: "bg-gradient-to-r from-white via-white/90 to-transparent",
      fullOverlay: "bg-gradient-to-t from-white via-white/70 to-white/40",
      sideOverlay: "bg-gradient-to-r from-white/90 via-transparent to-transparent",
      topOverlay: "bg-gradient-to-b from-white/50 to-transparent",
    },
    sunset: {
      bg: "from-rose-950 via-[#1c1017] to-[#261520]",
      bgSolid: "bg-[#1c1017]",
      orb1: "bg-pink-500/10",
      orb2: "bg-orange-500/8",
      orb1Strong: "bg-pink-500/15",
      orb2Strong: "bg-orange-500/12",
      accentMuted: "bg-pink-400/80",
      accentLine: "from-pink-400",
      accentBorder: "from-pink-500/25 via-transparent to-orange-500/20",
      accentGlow: "from-pink-500/35 to-orange-500/30",
      border: "border-pink-900/50",
      borderLine: "via-pink-900/40",
      surface: "bg-[#2d1a24]",
      surfaceAlt: "bg-rose-950/50",
      overlay: "from-[#1c1017]/50",
      cardBg: "bg-[#2d1a24]/80 border-pink-800/30",
      indicatorMuted: "text-pink-300/50",
      hoverAccent: "hover:text-pink-400",
      imgOverlay: "bg-gradient-to-r from-[#1c1017] via-[#1c1017]/80 to-transparent",
      fullOverlay: "bg-gradient-to-t from-[#1c1017] via-[#1c1017]/70 to-[#1c1017]/30",
      sideOverlay: "bg-gradient-to-r from-[#1c1017]/90 via-transparent to-transparent",
      topOverlay: "bg-gradient-to-b from-[#1c1017]/60 to-transparent",
    },
  };

  const colors = {
    ...colorMap[themeType],
    accent: theme.colors.primary,
    text: theme.colors.heading,
    textMuted: theme.colors.textMuted,
  };

  const SlideIndicator = ({ position = "top-left" }: { position?: "top-left" | "top-right" | "bottom-left" }) => {
    const posClass = position === "top-left" ? "top-8 left-8" : position === "top-right" ? "top-8 right-8" : "bottom-8 left-8";
    return (
      <div className={`absolute ${posClass} flex items-center gap-3 z-10`}>
        <span className="font-mono text-sm font-medium" style={{ color: colors.accent }}>{String(index + 1).padStart(2, "0")}</span>
        <div className={`w-12 h-px bg-gradient-to-r ${colors.accentLine} to-transparent`} />
        <span className={`text-xs font-medium uppercase tracking-widest ${colors.indicatorMuted}`}>/ {String(totalSlides).padStart(2, "0")}</span>
      </div>
    );
  };

  const Title = ({ className = "", align = "left" }: { className?: string; align?: "left" | "center" | "right" }) => (
    <EditableText
      value={slide.title}
      isEditing={isEditing && editingText?.field === "title"}
      onStartEdit={() => onStartEditing(index, "title")}
      onChange={(val) => onUpdateContent(index, "title", val)}
      onFinish={onFinishEditing}
      className={`font-bold leading-tight ${className}`}
      style={{ fontFamily: theme.fonts.heading.family, color: colors.text, letterSpacing: "-0.03em", textAlign: align }}
      isOwner={canEdit}
      isHovered={isHovered}
    />
  );

  const BulletPoints = ({ compact = false }: { compact?: boolean }) => (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      {bulletPoints.map((point, i) => (
        <div key={i} className="flex items-start gap-4 group/bullet">
          <div className={`${compact ? "mt-1.5" : "mt-2"} flex items-center gap-2 shrink-0`}>
            <div className={`${compact ? "w-1.5 h-1.5" : "w-2 h-2"} rounded-full ${colors.accentMuted}`} />
            <div className={`${compact ? "w-4" : "w-8"} h-px ${themeType === "dark" ? "bg-zinc-700" : themeType === "sunset" ? "bg-pink-900/50" : "bg-slate-300"}`} />
          </div>
          <EditableText
            value={point}
            isEditing={isEditing && editingText?.field === "bullet" && editingText?.bulletIndex === i}
            onStartEdit={() => onStartEditing(index, "bullet", i)}
            onChange={(val) => onUpdateContent(index, "bullet", val, i)}
            onFinish={onFinishEditing}
            className={`flex-1 ${compact ? "text-base" : "text-lg"} leading-relaxed`}
            style={{ fontFamily: theme.fonts.body.family, color: colors.textMuted }}
            isOwner={canEdit}
            isHovered={isHovered}
            onDelete={() => onDeleteBullet(index, i)}
          />
        </div>
      ))}
      {canEdit && isHovered && (
        <button onClick={() => onAddBullet(index)} className={`flex items-center gap-2 text-sm ${colors.indicatorMuted} ${colors.hoverAccent} transition-colors ml-10`}>
          <Plus size={14} /> Add point
        </button>
      )}
    </div>
  );

  const ImageBlock = ({ className = "", size = "large" }: { className?: string; size?: "small" | "medium" | "large" }) => {
    if (!hasImage) return null;
    const sizeClass = size === "small" ? "max-h-[50%]" : size === "medium" ? "max-h-[70%]" : "max-h-[85%]";
    return (
      <div className={`relative ${sizeClass} ${className}`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.accentBorder} rounded-lg`} />
        <div className={`absolute inset-[1px] ${colors.surface} rounded-lg overflow-hidden`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={slide.image!.url} alt={slide.image!.alt || slide.title} className="absolute inset-0 w-full h-full object-cover" />
          <div className={`absolute inset-0 bg-gradient-to-t ${colors.overlay} via-transparent to-transparent`} />
        </div>
        {slide.image?.source === "pexels" && slide.image.photographer && (
          <div className={`absolute bottom-3 right-3 backdrop-blur-sm text-xs px-2 py-1 rounded ${themeType === "light" ? "bg-white/80" : "bg-black/60"}`} style={{ color: colors.textMuted }}>
            <a href={slide.image.photographerUrl} target="_blank" rel="noopener noreferrer" style={{ color: colors.accent }}>{slide.image.photographer}</a>
          </div>
        )}
      </div>
    );
  };

  const Placeholder = () => (
    <div className={`w-full h-full rounded-lg border border-dashed ${colors.border} flex items-center justify-center ${colors.surfaceAlt}`}>
      <div className={`text-center ${colors.indicatorMuted}`}>
        <ImageIcon size={40} className="mx-auto mb-2 opacity-40" />
        <p className="text-sm">Image placeholder</p>
      </div>
    </div>
  );


  // LAYOUT 1: Left Content - Image Right
  if (layout === "left-content") {
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg}`} />
        <div className={`absolute top-0 right-0 w-96 h-96 ${colors.orb1} rounded-full blur-3xl`} />
        <div className={`absolute bottom-0 left-0 w-80 h-80 ${colors.orb2} rounded-full blur-3xl`} />
        
        <SlideIndicator position="top-left" />
        
        <div className="relative h-full flex">
          <div className={`flex flex-col justify-center p-12 pt-20 ${hasImage ? "w-[55%]" : "w-full"}`}>
            <Title className="text-4xl md:text-5xl mb-8" />
            {bulletPoints.length > 0 && <BulletPoints />}
          </div>
          
          {hasImage && (
            <div className="w-[45%] relative flex items-center justify-center p-8">
              <ImageBlock className="w-full h-full" />
            </div>
          )}
          {slide.image?.source === "placeholder" && <div className="w-[45%] p-8"><Placeholder /></div>}
        </div>
        <div className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${colors.borderLine} to-transparent`} />
      </div>
    );
  }

  // LAYOUT 2: Right Content - Image Left
  if (layout === "right-content") {
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-bl ${colors.bg}`} />
        <div className={`absolute top-0 left-0 w-96 h-96 ${colors.orb2} rounded-full blur-3xl`} />
        <div className={`absolute bottom-0 right-0 w-80 h-80 ${colors.orb1} rounded-full blur-3xl`} />
        
        <SlideIndicator position="top-right" />
        
        <div className="relative h-full flex flex-row-reverse">
          <div className={`flex flex-col justify-center p-12 pt-20 ${hasImage ? "w-[55%]" : "w-full"}`}>
            <Title className="text-4xl md:text-5xl mb-8" />
            {bulletPoints.length > 0 && <BulletPoints />}
          </div>
          
          {hasImage && (
            <div className="w-[45%] relative flex items-center justify-center p-8">
              <ImageBlock className="w-full h-full" />
            </div>
          )}
          {slide.image?.source === "placeholder" && <div className="w-[45%] p-8"><Placeholder /></div>}
        </div>
        <div className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${colors.borderLine} to-transparent`} />
      </div>
    );
  }

  // LAYOUT 3: Centered - Image Top, Content Bottom
  if (layout === "centered") {
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-b ${colors.bg}`} />
        <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] ${colors.orb1} rounded-full blur-3xl`} />
        
        <SlideIndicator position="top-left" />
        
        <div className="relative h-full flex flex-col items-center justify-center p-12 text-center">
          {hasImage && (
            <div className="w-full max-w-2xl h-48 mb-8 relative">
              <ImageBlock className="w-full h-full" size="medium" />
            </div>
          )}
          
          <Title className="text-4xl md:text-5xl mb-6 max-w-4xl" align="center" />
          
          {bulletPoints.length > 0 && (
            <div className="max-w-2xl w-full text-left mt-4">
              <BulletPoints compact />
            </div>
          )}
        </div>
        <div className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${colors.borderLine} to-transparent`} />
      </div>
    );
  }

  // LAYOUT 4: Split Diagonal
  if (layout === "split-diagonal") {
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg}`} />
        
        {hasImage && (
          <div className="absolute inset-0 clip-diagonal">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={slide.image!.url} alt={slide.image!.alt || slide.title} className={`absolute inset-0 w-full h-full object-cover ${themeType === "light" ? "opacity-20" : "opacity-30"}`} />
            <div className={`absolute inset-0 ${colors.imgOverlay}`} />
          </div>
        )}
        
        <div className={`absolute top-0 right-1/4 w-72 h-72 ${colors.orb1Strong} rounded-full blur-3xl`} />
        <div className={`absolute bottom-0 left-1/4 w-64 h-64 ${colors.orb2Strong} rounded-full blur-3xl`} />
        
        <SlideIndicator position="bottom-left" />
        
        <div className="relative h-full flex">
          <div className="w-[60%] flex flex-col justify-center p-12">
            <div className="mb-4">
              <div className={`w-16 h-1 bg-gradient-to-r ${colors.accentLine} to-transparent mb-6`} />
            </div>
            <Title className="text-4xl md:text-5xl lg:text-6xl mb-8" />
            {bulletPoints.length > 0 && <BulletPoints />}
          </div>
          
          {hasImage && (
            <div className="w-[40%] relative flex items-center justify-end p-8">
              <div className="relative w-[90%] h-[70%]">
                <div className={`absolute -inset-2 bg-gradient-to-br ${colors.accentGlow} rounded-lg blur-sm`} />
                <ImageBlock className="w-full h-full" size="large" />
              </div>
            </div>
          )}
        </div>
        
        <style jsx>{`.clip-diagonal { clip-path: polygon(50% 0, 100% 0, 100% 100%, 30% 100%); }`}</style>
      </div>
    );
  }

  // LAYOUT 5: Image Focus - Full bleed with overlay
  if (layout === "image-focus") {
    return (
      <div className="h-full relative overflow-hidden">
        {hasImage ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={slide.image!.url} alt={slide.image!.alt || slide.title} className="absolute inset-0 w-full h-full object-cover" />
            <div className={`absolute inset-0 ${colors.fullOverlay}`} />
            <div className={`absolute inset-0 ${colors.sideOverlay}`} />
          </>
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg}`} />
        )}
        
        <div className={`absolute top-0 left-0 w-full h-32 ${colors.topOverlay}`} />
        
        <SlideIndicator position="top-left" />
        
        <div className="relative h-full flex flex-col justify-end p-12 pb-16">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.accent }} />
              <div className={`w-20 h-px bg-gradient-to-r ${colors.accentLine} to-transparent opacity-50`} />
            </div>
            <Title className="text-4xl md:text-5xl lg:text-6xl mb-6" />
            {bulletPoints.length > 0 && (
              <div className={`mt-6 backdrop-blur-sm rounded-lg p-6 border ${colors.cardBg}`}>
                <BulletPoints compact />
              </div>
            )}
          </div>
        </div>
        
        {slide.image?.source === "pexels" && slide.image.photographer && (
          <div className={`absolute bottom-4 right-4 backdrop-blur-sm text-xs px-3 py-1.5 rounded ${themeType === "light" ? "bg-white/80" : "bg-black/60"}`} style={{ color: colors.textMuted }}>
            <a href={slide.image.photographerUrl} target="_blank" rel="noopener noreferrer" style={{ color: colors.accent }}>{slide.image.photographer}</a>
          </div>
        )}
      </div>
    );
  }

  // LAYOUT 6: Minimal Left - Clean asymmetric
  if (layout === "minimal-left") {
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 ${colors.bgSolid}`} />
        
        {/* Accent corner */}
        <div className={`absolute top-0 left-0 w-2 h-32 bg-gradient-to-b ${colors.accentLine} to-transparent`} />
        <div className={`absolute top-0 left-0 w-32 h-2 bg-gradient-to-r ${colors.accentLine} to-transparent`} />
        
        <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 ${colors.orb2} rounded-full blur-3xl`} />
        
        <SlideIndicator position="top-right" />
        
        <div className="relative h-full flex">
          <div className="w-[50%] flex flex-col justify-center pl-16 pr-8 py-12">
            <Title className="text-3xl md:text-4xl lg:text-5xl mb-8" />
            {bulletPoints.length > 0 && <BulletPoints />}
          </div>
          
          <div className="w-[50%] relative flex items-center justify-center p-8">
            {hasImage ? (
              <div className="relative w-full h-[85%]">
                {/* Stacked frame effect */}
                <div className={`absolute top-4 left-4 right-0 bottom-0 border ${colors.border} rounded-lg`} />
                <div className={`absolute top-2 left-2 right-2 bottom-2 border ${themeType === "dark" ? "border-zinc-800" : themeType === "sunset" ? "border-pink-900/40" : "border-slate-300"} rounded-lg`} />
                <ImageBlock className="w-full h-full relative z-10" />
              </div>
            ) : (
              <div className={`w-full h-[70%] border border-dashed ${colors.border} rounded-lg flex items-center justify-center`}>
                <div className={`text-center ${colors.indicatorMuted}`}>
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full border-2 border-dashed ${colors.border} flex items-center justify-center`}>
                    <ImageIcon size={24} />
                  </div>
                  <p className="text-sm">Visual element</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Bottom accent */}
        <div className={`absolute bottom-0 right-0 w-1/3 h-px bg-gradient-to-l ${colors.accentLine} to-transparent opacity-50`} />
      </div>
    );
  }

  // LAYOUT 7: Cards Grid - Content as cards (great for light theme)
  if (layout === "cards-grid") {
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg}`} />
        <div className={`absolute top-1/3 right-0 w-80 h-80 ${colors.orb1} rounded-full blur-3xl`} />
        
        <SlideIndicator position="top-left" />
        
        <div className="relative h-full p-12 pt-20">
          <Title className="text-3xl md:text-4xl mb-8" />
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            {bulletPoints.map((point, i) => (
              <div key={i} className={`p-5 rounded-xl border backdrop-blur-sm ${colors.cardBg}`}>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ backgroundColor: colors.accent, color: themeType === "light" ? "#fff" : "#000" }}>
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
          
          {canEdit && isHovered && (
            <button onClick={() => onAddBullet(index)} className={`mt-4 flex items-center gap-2 text-sm ${colors.indicatorMuted} ${colors.hoverAccent} transition-colors`}>
              <Plus size={14} /> Add card
            </button>
          )}
        </div>
        
        {hasImage && (
          <div className="absolute bottom-8 right-8 w-48 h-32">
            <ImageBlock className="w-full h-full" size="small" />
          </div>
        )}
      </div>
    );
  }

  // LAYOUT 8: Quote Style - Large quote with attribution
  if (layout === "quote-style") {
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg}`} />
        <div className={`absolute top-0 left-1/4 w-96 h-96 ${colors.orb1Strong} rounded-full blur-3xl`} />
        <div className={`absolute bottom-0 right-1/4 w-72 h-72 ${colors.orb2Strong} rounded-full blur-3xl`} />
        
        <SlideIndicator position="top-right" />
        
        <div className="relative h-full flex items-center justify-center p-12">
          <div className="max-w-4xl text-center">
            {/* Large quote mark */}
            <div className="text-8xl font-serif leading-none mb-4" style={{ color: colors.accent, opacity: 0.3 }}>"</div>
            
            <Title className="text-3xl md:text-4xl lg:text-5xl mb-8 italic" align="center" />
            
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
            
            {/* Accent line */}
            <div className="flex items-center justify-center gap-3 mt-10">
              <div className="w-12 h-px" style={{ backgroundColor: colors.accent }} />
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.accent }} />
              <div className="w-12 h-px" style={{ backgroundColor: colors.accent }} />
            </div>
          </div>
        </div>
        
        {hasImage && (
          <div className="absolute bottom-8 left-8 w-24 h-24 rounded-full overflow-hidden border-2" style={{ borderColor: colors.accent }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={slide.image!.url} alt="" className="absolute inset-0 w-full h-full object-cover" />
          </div>
        )}
      </div>
    );
  }

  // LAYOUT 9: Timeline - Vertical timeline style (great for sunset theme)
  if (layout === "timeline") {
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-b ${colors.bg}`} />
        <div className={`absolute top-0 right-1/3 w-64 h-64 ${colors.orb1Strong} rounded-full blur-3xl`} />
        
        <SlideIndicator position="top-left" />
        
        <div className="relative h-full flex">
          {/* Timeline line */}
          <div className="absolute left-24 top-24 bottom-12 w-px" style={{ backgroundColor: colors.accent, opacity: 0.3 }} />
          
          <div className="flex-1 p-12 pt-20 pl-32">
            <Title className="text-3xl md:text-4xl mb-10" />
            
            <div className="space-y-6">
              {bulletPoints.map((point, i) => (
                <div key={i} className="flex items-start gap-6 relative">
                  {/* Timeline dot */}
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
            
            {canEdit && isHovered && (
              <button onClick={() => onAddBullet(index)} className={`mt-4 ml-6 flex items-center gap-2 text-sm ${colors.indicatorMuted} ${colors.hoverAccent} transition-colors`}>
                <Plus size={14} /> Add step
              </button>
            )}
          </div>
          
          {hasImage && (
            <div className="w-[35%] p-8 flex items-center">
              <ImageBlock className="w-full h-[70%]" />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className={`h-full relative overflow-hidden ${colors.bgSolid} flex items-center justify-center`}>
      <p style={{ color: colors.textMuted }}>Slide {index + 1}</p>
    </div>
  );
}
