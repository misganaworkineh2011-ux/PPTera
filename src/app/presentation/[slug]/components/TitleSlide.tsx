"use client";

import type { Theme } from "~/lib/themes";
import type { SlideData, EditingState } from "~/components/presentation/types";
import EditableText from "~/components/presentation/EditableText";
import { getThemeType } from "./types";

interface TitleSlideProps {
  slide: SlideData;
  index: number;
  totalSlides: number;
  theme: Theme;
  hasImage: boolean;
  isOwner: boolean;
  isFullscreen: boolean;
  isHovered: boolean;
  isEditing: boolean;
  editingText: EditingState | null;
  onStartEditing: (i: number, f: string, b?: number) => void;
  onUpdateContent: (i: number, f: string, v: string, b?: number) => void;
  onFinishEditing: () => void;
}

interface TitleSlideVariantProps {
  slide: SlideData;
  index: number;
  totalSlides: number;
  theme: Theme;
  hasImage: boolean;
  canEdit: boolean;
  isHovered: boolean;
  isEditing: boolean;
  editingText: EditingState | null;
  onStartEditing: (i: number, f: string, b?: number) => void;
  onUpdateContent: (i: number, f: string, v: string, b?: number) => void;
  onFinishEditing: () => void;
}

export function TitleSlide({
  slide, index, totalSlides, theme, hasImage, isOwner, isFullscreen, isHovered, isEditing, editingText,
  onStartEditing, onUpdateContent, onFinishEditing,
}: TitleSlideProps) {
  const canEdit = isOwner && !isFullscreen;
  const themeType = getThemeType(theme);
  const props = { slide, index, totalSlides, theme, hasImage, canEdit, isHovered, isEditing, editingText, onStartEditing, onUpdateContent, onFinishEditing };

  switch (themeType) {
    case "dark": return <DarkTitleSlide {...props} />;
    case "light": return <LightTitleSlide {...props} />;
    case "sunset": return <SunsetTitleSlide {...props} />;
    case "ocean": return <OceanTitleSlide {...props} />;
    case "aurora": return <AuroraTitleSlide {...props} />;
    case "ember": return <EmberTitleSlide {...props} />;
    case "midnight": return <MidnightTitleSlide {...props} />;
    case "cyber": return <CyberTitleSlide {...props} />;
    case "alien": return <AlienTitleSlide {...props} />;
    default: return <DarkTitleSlide {...props} />;
  }
}

// ELEGANT NOIR - Sophisticated dark with geometric accents
function DarkTitleSlide({ slide, index, totalSlides, theme, hasImage, canEdit, isHovered, isEditing, editingText, onStartEditing, onUpdateContent, onFinishEditing }: TitleSlideVariantProps) {
  return (
    <div className="h-full relative overflow-hidden">
      {!hasImage && (
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-black to-zinc-900">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl" />
          <div className="absolute top-0 left-1/4 w-px h-32 bg-gradient-to-b from-amber-500/30 to-transparent" />
          <div className="absolute top-0 left-1/4 w-32 h-px bg-gradient-to-r from-amber-500/30 to-transparent" />
          <div className="absolute bottom-0 right-1/4 w-px h-24 bg-gradient-to-t from-indigo-500/20 to-transparent" />
          <div className="absolute bottom-0 right-1/4 w-24 h-px bg-gradient-to-l from-indigo-500/20 to-transparent" />
        </div>
      )}
      {hasImage && <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />}
      
      <div className="relative h-full flex flex-col items-center justify-center p-12 text-center">
        <div className="absolute top-8 left-8 flex items-center gap-3">
          <span className="font-mono text-sm font-medium text-amber-500">{String(index + 1).padStart(2, "0")}</span>
          <div className="w-16 h-px bg-gradient-to-r from-amber-500 to-transparent" />
          <span className="text-xs font-medium uppercase tracking-widest text-zinc-600">/ {String(totalSlides).padStart(2, "0")}</span>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] border border-zinc-800/50 rounded-lg pointer-events-none" />
        
        <EditableText value={slide.title} isEditing={isEditing && editingText?.field === "title"} onStartEdit={() => onStartEditing(index, "title")} onChange={(val) => onUpdateContent(index, "title", val)} onFinish={onFinishEditing} className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 max-w-5xl leading-tight" style={{ fontFamily: theme.fonts.heading.family, color: "#fafafa", letterSpacing: "-0.03em" }} isOwner={canEdit} isHovered={isHovered} />
        {slide.subtitle && (
          <EditableText value={slide.subtitle} isEditing={isEditing && editingText?.field === "subtitle"} onStartEdit={() => onStartEditing(index, "subtitle")} onChange={(val) => onUpdateContent(index, "subtitle", val)} onFinish={onFinishEditing} className="text-xl md:text-2xl max-w-3xl" style={{ fontFamily: theme.fonts.body.family, color: "#a1a1aa" }} isOwner={canEdit} isHovered={isHovered} />
        )}
        
        <div className="flex items-center gap-4 mt-12">
          <div className="w-20 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
          <div className="w-2 h-2 rotate-45 bg-amber-500/60" />
          <div className="w-20 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
    </div>
  );
}

// ARCTIC FROST - Clean, airy with floating elements
function LightTitleSlide({ slide, index, totalSlides, theme, hasImage, canEdit, isHovered, isEditing, editingText, onStartEditing, onUpdateContent, onFinishEditing }: TitleSlideVariantProps) {
  return (
    <div className="h-full relative overflow-hidden">
      {!hasImage && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-cyan-50">
          <div className="absolute top-10 right-10 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-[350px] h-[350px] bg-violet-500/8 rounded-full blur-3xl" />
          <div className="absolute top-20 right-20 w-4 h-4 rounded-full border-2 border-cyan-400/30" />
          <div className="absolute top-32 right-32 w-6 h-6 rounded-full border-2 border-cyan-400/20" />
          <div className="absolute bottom-24 left-24 w-5 h-5 rounded-full bg-cyan-400/20" />
          <div className="absolute top-1/4 left-16 w-3 h-3 rounded-full bg-violet-400/20" />
        </div>
      )}
      {hasImage && <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/50 to-white/30" />}
      
      <div className="relative h-full flex flex-col items-center justify-center p-12 text-center">
        <div className="absolute top-8 left-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-cyan-500/30 flex items-center justify-center">
            <span className="font-mono text-sm font-bold text-cyan-600">{index + 1}</span>
          </div>
          <div className="w-12 h-px bg-gradient-to-r from-cyan-500/50 to-transparent" />
          <span className="text-xs font-medium text-slate-400">of {totalSlides}</span>
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent rounded-full" />
        
        <EditableText value={slide.title} isEditing={isEditing && editingText?.field === "title"} onStartEdit={() => onStartEditing(index, "title")} onChange={(val) => onUpdateContent(index, "title", val)} onFinish={onFinishEditing} className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 max-w-5xl leading-tight" style={{ fontFamily: theme.fonts.heading.family, color: "#0f172a", letterSpacing: "-0.03em" }} isOwner={canEdit} isHovered={isHovered} />
        {slide.subtitle && (
          <EditableText value={slide.subtitle} isEditing={isEditing && editingText?.field === "subtitle"} onStartEdit={() => onStartEditing(index, "subtitle")} onChange={(val) => onUpdateContent(index, "subtitle", val)} onFinish={onFinishEditing} className="text-xl md:text-2xl max-w-3xl" style={{ fontFamily: theme.fonts.body.family, color: "#64748b" }} isOwner={canEdit} isHovered={isHovered} />
        )}
        
        <div className="flex items-center gap-3 mt-12">
          <div className="w-3 h-3 rounded-full bg-cyan-500/40" />
          <div className="w-16 h-0.5 bg-gradient-to-r from-cyan-500/60 to-violet-500/40 rounded-full" />
          <div className="w-2 h-2 rounded-full bg-violet-500/40" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
    </div>
  );
}

// SUNSET GRADIENT - Warm, dramatic with glowing accents
function SunsetTitleSlide({ slide, index, totalSlides, theme, hasImage, canEdit, isHovered, isEditing, editingText, onStartEditing, onUpdateContent, onFinishEditing }: TitleSlideVariantProps) {
  return (
    <div className="h-full relative overflow-hidden">
      {!hasImage && (
        <div className="absolute inset-0 bg-gradient-to-br from-rose-950 via-[#1c1017] to-[#261520]">
          <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-pink-500/15 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/4 left-0 w-48 h-px bg-gradient-to-r from-pink-500/40 to-transparent" />
          <div className="absolute bottom-1/3 right-0 w-32 h-px bg-gradient-to-l from-orange-500/30 to-transparent" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-pink-500/10 to-transparent" />
        </div>
      )}
      {hasImage && <div className="absolute inset-0 bg-gradient-to-t from-[#1c1017]/95 via-[#1c1017]/60 to-[#1c1017]/30" />}
      
      <div className="relative h-full flex flex-col items-center justify-center p-12 text-center">
        <div className="absolute top-8 left-8 flex items-center gap-3">
          <div className="px-3 py-1 rounded-full bg-pink-500/20 border border-pink-500/30">
            <span className="font-mono text-sm font-bold text-pink-300">{String(index + 1).padStart(2, "0")}</span>
          </div>
          <div className="w-12 h-px bg-gradient-to-r from-pink-500/50 to-transparent" />
          <span className="text-xs font-medium text-pink-300/50">/ {String(totalSlides).padStart(2, "0")}</span>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-32 bg-gradient-to-r from-pink-500/10 via-orange-500/10 to-pink-500/10 blur-2xl rounded-full pointer-events-none" />
        
        <EditableText value={slide.title} isEditing={isEditing && editingText?.field === "title"} onStartEdit={() => onStartEditing(index, "title")} onChange={(val) => onUpdateContent(index, "title", val)} onFinish={onFinishEditing} className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 max-w-5xl leading-tight relative" style={{ fontFamily: theme.fonts.heading.family, color: "#ffffff", letterSpacing: "-0.03em" }} isOwner={canEdit} isHovered={isHovered} />
        {slide.subtitle && (
          <EditableText value={slide.subtitle} isEditing={isEditing && editingText?.field === "subtitle"} onStartEdit={() => onStartEditing(index, "subtitle")} onChange={(val) => onUpdateContent(index, "subtitle", val)} onFinish={onFinishEditing} className="text-xl md:text-2xl max-w-3xl" style={{ fontFamily: theme.fonts.body.family, color: "#f9a8d4" }} isOwner={canEdit} isHovered={isHovered} />
        )}
        
        <div className="flex items-center gap-4 mt-12">
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent to-pink-500/60 rounded-full" />
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-pink-400 to-orange-400" />
          <div className="w-16 h-0.5 bg-gradient-to-l from-transparent to-orange-500/60 rounded-full" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-900/40 to-transparent" />
    </div>
  );
}


// OCEAN DEPTHS - Deep teal with flowing waves and circular accents
function OceanTitleSlide({ slide, index, totalSlides, theme, hasImage, canEdit, isHovered, isEditing, editingText, onStartEditing, onUpdateContent, onFinishEditing }: TitleSlideVariantProps) {
  return (
    <div className="h-full relative overflow-hidden">
      {!hasImage && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0d1f35] to-[#122a45]">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-cyan-500/8 rounded-full blur-3xl" />
          <div className="absolute top-20 right-20 w-32 h-32 rounded-full border border-teal-500/20" />
          <div className="absolute top-28 right-28 w-24 h-24 rounded-full border border-cyan-500/15" />
          <div className="absolute bottom-32 left-16 w-20 h-20 rounded-full border border-teal-500/15" />
          <svg className="absolute bottom-0 left-0 right-0 h-32 opacity-20" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="#14b8a6" d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,138.7C672,128,768,160,864,181.3C960,203,1056,213,1152,197.3C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
          </svg>
        </div>
      )}
      {hasImage && <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628]/95 via-[#0a1628]/60 to-[#0a1628]/30" />}
      
      <div className="relative h-full flex flex-col items-center justify-center p-12 text-center">
        <div className="absolute top-8 left-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-teal-500/40 flex items-center justify-center bg-[#0a1628]/50 backdrop-blur-sm">
            <span className="font-mono text-sm font-bold text-teal-400">{String(index + 1).padStart(2, "0")}</span>
          </div>
          <div className="w-16 h-px bg-gradient-to-r from-teal-500/50 to-transparent" />
          <span className="text-xs font-medium text-cyan-400/50">/ {String(totalSlides).padStart(2, "0")}</span>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-40 bg-gradient-to-r from-teal-500/10 via-cyan-500/15 to-teal-500/10 blur-3xl rounded-full pointer-events-none" />
        
        <EditableText value={slide.title} isEditing={isEditing && editingText?.field === "title"} onStartEdit={() => onStartEditing(index, "title")} onChange={(val) => onUpdateContent(index, "title", val)} onFinish={onFinishEditing} className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 max-w-5xl leading-tight relative" style={{ fontFamily: theme.fonts.heading.family, color: "#ffffff", letterSpacing: "-0.02em" }} isOwner={canEdit} isHovered={isHovered} />
        {slide.subtitle && (
          <EditableText value={slide.subtitle || ""} isEditing={isEditing && editingText?.field === "subtitle"} onStartEdit={() => onStartEditing(index, "subtitle")} onChange={(val) => onUpdateContent(index, "subtitle", val)} onFinish={onFinishEditing} className="text-xl md:text-2xl max-w-3xl" style={{ fontFamily: theme.fonts.body.family, color: "#7dd3fc" }} isOwner={canEdit} isHovered={isHovered} />
        )}
        
        <div className="flex items-center gap-4 mt-12">
          <div className="w-4 h-4 rounded-full border-2 border-teal-500/40" />
          <div className="w-20 h-0.5 bg-gradient-to-r from-teal-500/60 via-cyan-500/40 to-teal-500/60 rounded-full" />
          <div className="w-3 h-3 rounded-full bg-teal-500/60" />
          <div className="w-20 h-0.5 bg-gradient-to-r from-teal-500/60 via-cyan-500/40 to-teal-500/60 rounded-full" />
          <div className="w-4 h-4 rounded-full border-2 border-cyan-500/40" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-teal-500/30 to-transparent" />
    </div>
  );
}

// AURORA BOREALIS - Magical purple/green with hexagonal frames
function AuroraTitleSlide({ slide, index, totalSlides, theme, hasImage, canEdit, isHovered, isEditing, editingText, onStartEditing, onUpdateContent, onFinishEditing }: TitleSlideVariantProps) {
  return (
    <div className="h-full relative overflow-hidden">
      {!hasImage && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f0a1a] via-[#1a1030] to-[#150d24]">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-500/15 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-violet-500/10 rounded-full blur-3xl" />
          {/* Hexagonal decorations */}
          <div className="absolute top-16 right-16 w-16 h-16 border border-purple-500/30 rotate-45" style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }} />
          <div className="absolute bottom-20 left-20 w-12 h-12 border border-emerald-500/20 rotate-12" style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }} />
        </div>
      )}
      {hasImage && <div className="absolute inset-0 bg-gradient-to-t from-[#0f0a1a]/95 via-[#0f0a1a]/60 to-[#0f0a1a]/30" />}
      
      <div className="relative h-full flex flex-col items-center justify-center p-12 text-center">
        <div className="absolute top-8 left-8 flex items-center gap-3">
          <div className="w-10 h-10 border-2 border-purple-500/40 flex items-center justify-center bg-[#0f0a1a]/50 backdrop-blur-sm" style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}>
            <span className="font-mono text-sm font-bold text-purple-400">{String(index + 1).padStart(2, "0")}</span>
          </div>
          <div className="w-16 h-px bg-gradient-to-r from-purple-500/50 via-emerald-500/30 to-transparent" />
          <span className="text-xs font-medium text-purple-400/50">/ {String(totalSlides).padStart(2, "0")}</span>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-40 bg-gradient-to-r from-purple-500/10 via-emerald-500/10 to-purple-500/10 blur-3xl rounded-full pointer-events-none" />
        
        <EditableText value={slide.title} isEditing={isEditing && editingText?.field === "title"} onStartEdit={() => onStartEditing(index, "title")} onChange={(val) => onUpdateContent(index, "title", val)} onFinish={onFinishEditing} className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 max-w-5xl leading-tight relative" style={{ fontFamily: theme.fonts.heading.family, color: "#ffffff", letterSpacing: "-0.02em" }} isOwner={canEdit} isHovered={isHovered} />
        {slide.subtitle && (
          <EditableText value={slide.subtitle || ""} isEditing={isEditing && editingText?.field === "subtitle"} onStartEdit={() => onStartEditing(index, "subtitle")} onChange={(val) => onUpdateContent(index, "subtitle", val)} onFinish={onFinishEditing} className="text-xl md:text-2xl max-w-3xl" style={{ fontFamily: theme.fonts.body.family, color: "#c4b5fd" }} isOwner={canEdit} isHovered={isHovered} />
        )}
        
        <div className="flex items-center gap-4 mt-12">
          <div className="w-4 h-4 border border-purple-500/40" style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }} />
          <div className="w-20 h-0.5 bg-gradient-to-r from-purple-500/60 via-emerald-500/40 to-purple-500/60 rounded-full" />
          <div className="w-3 h-3 bg-emerald-500/60 rounded-full" />
          <div className="w-20 h-0.5 bg-gradient-to-r from-purple-500/60 via-emerald-500/40 to-purple-500/60 rounded-full" />
          <div className="w-4 h-4 border border-emerald-500/40" style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }} />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
    </div>
  );
}

// EMBER FORGE - Fiery red/orange with diamond frames
function EmberTitleSlide({ slide, index, totalSlides, theme, hasImage, canEdit, isHovered, isEditing, editingText, onStartEditing, onUpdateContent, onFinishEditing }: TitleSlideVariantProps) {
  return (
    <div className="h-full relative overflow-hidden">
      {!hasImage && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0a0a] via-[#2a1010] to-[#3a1515]">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-red-500/15 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-3xl" />
          {/* Diamond decorations */}
          <div className="absolute top-16 right-20 w-8 h-8 border border-red-500/30 rotate-45" />
          <div className="absolute bottom-24 left-16 w-6 h-6 border border-orange-500/20 rotate-45" />
          <div className="absolute top-1/3 right-1/3 w-4 h-4 bg-amber-500/20 rotate-45" />
        </div>
      )}
      {hasImage && <div className="absolute inset-0 bg-gradient-to-t from-[#1a0a0a]/95 via-[#1a0a0a]/60 to-[#1a0a0a]/30" />}
      
      <div className="relative h-full flex flex-col items-center justify-center p-12 text-center">
        <div className="absolute top-8 left-8 flex items-center gap-3">
          <div className="w-10 h-10 border-2 border-red-500/40 rotate-45 flex items-center justify-center bg-[#1a0a0a]/50 backdrop-blur-sm">
            <span className="font-mono text-sm font-bold text-red-400 -rotate-45">{String(index + 1).padStart(2, "0")}</span>
          </div>
          <div className="w-16 h-px bg-gradient-to-r from-red-500/50 via-orange-500/30 to-transparent" />
          <span className="text-xs font-medium text-red-400/50">/ {String(totalSlides).padStart(2, "0")}</span>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-40 bg-gradient-to-r from-red-500/10 via-orange-500/15 to-red-500/10 blur-3xl rounded-full pointer-events-none" />
        
        <EditableText value={slide.title} isEditing={isEditing && editingText?.field === "title"} onStartEdit={() => onStartEditing(index, "title")} onChange={(val) => onUpdateContent(index, "title", val)} onFinish={onFinishEditing} className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 max-w-5xl leading-tight relative" style={{ fontFamily: theme.fonts.heading.family, color: "#ffffff", letterSpacing: "-0.02em" }} isOwner={canEdit} isHovered={isHovered} />
        {slide.subtitle && (
          <EditableText value={slide.subtitle || ""} isEditing={isEditing && editingText?.field === "subtitle"} onStartEdit={() => onStartEditing(index, "subtitle")} onChange={(val) => onUpdateContent(index, "subtitle", val)} onFinish={onFinishEditing} className="text-xl md:text-2xl max-w-3xl" style={{ fontFamily: theme.fonts.body.family, color: "#fca5a5" }} isOwner={canEdit} isHovered={isHovered} />
        )}
        
        <div className="flex items-center gap-4 mt-12">
          <div className="w-3 h-3 border border-red-500/40 rotate-45" />
          <div className="w-20 h-0.5 bg-gradient-to-r from-red-500/60 via-orange-500/40 to-red-500/60 rounded-full" />
          <div className="w-4 h-4 bg-orange-500/60 rotate-45" />
          <div className="w-20 h-0.5 bg-gradient-to-r from-red-500/60 via-orange-500/40 to-red-500/60 rounded-full" />
          <div className="w-3 h-3 border border-orange-500/40 rotate-45" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />
    </div>
  );
}


// MIDNIGHT GARDEN - Deep indigo with rose gold accents
function MidnightTitleSlide({ slide, index, totalSlides, theme, hasImage, canEdit, isHovered, isEditing, editingText, onStartEditing, onUpdateContent, onFinishEditing }: TitleSlideVariantProps) {
  return (
    <div className="h-full relative overflow-hidden">
      {!hasImage && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0c0a1d] via-[#1a1735] to-[#12102a]">
          <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-indigo-500/15 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-rose-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/4 right-1/3 w-[300px] h-[300px] bg-violet-500/10 rounded-full blur-3xl" />
          {/* Botanical/floral decorations */}
          <div className="absolute top-16 right-16 w-20 h-20 border border-rose-500/20 rounded-full" />
          <div className="absolute top-20 right-20 w-12 h-12 border border-rose-500/15 rounded-full" />
          <div className="absolute bottom-20 left-16 w-16 h-16 border border-indigo-500/20 rounded-full" />
        </div>
      )}
      {hasImage && <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a1d]/95 via-[#0c0a1d]/60 to-[#0c0a1d]/30" />}
      
      <div className="relative h-full flex flex-col items-center justify-center p-12 text-center">
        <div className="absolute top-8 left-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-rose-500/40 flex items-center justify-center bg-[#0c0a1d]/50 backdrop-blur-sm">
            <span className="font-mono text-sm font-bold text-rose-400">{String(index + 1).padStart(2, "0")}</span>
          </div>
          <div className="w-16 h-px bg-gradient-to-r from-rose-500/50 via-indigo-500/30 to-transparent" />
          <span className="text-xs font-medium text-rose-400/50">/ {String(totalSlides).padStart(2, "0")}</span>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-40 bg-gradient-to-r from-indigo-500/10 via-rose-500/10 to-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
        
        <EditableText value={slide.title} isEditing={isEditing && editingText?.field === "title"} onStartEdit={() => onStartEditing(index, "title")} onChange={(val) => onUpdateContent(index, "title", val)} onFinish={onFinishEditing} className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 max-w-5xl leading-tight relative" style={{ fontFamily: theme.fonts.heading.family, color: "#ffffff", letterSpacing: "-0.02em" }} isOwner={canEdit} isHovered={isHovered} />
        {slide.subtitle && (
          <EditableText value={slide.subtitle || ""} isEditing={isEditing && editingText?.field === "subtitle"} onStartEdit={() => onStartEditing(index, "subtitle")} onChange={(val) => onUpdateContent(index, "subtitle", val)} onFinish={onFinishEditing} className="text-xl md:text-2xl max-w-3xl" style={{ fontFamily: theme.fonts.body.family, color: "#fda4af" }} isOwner={canEdit} isHovered={isHovered} />
        )}
        
        <div className="flex items-center gap-4 mt-12">
          <div className="w-4 h-4 rounded-full border border-rose-500/40" />
          <div className="w-20 h-0.5 bg-gradient-to-r from-rose-500/60 via-indigo-500/40 to-rose-500/60 rounded-full" />
          <div className="w-3 h-3 bg-rose-500/60 rounded-full" />
          <div className="w-20 h-0.5 bg-gradient-to-r from-rose-500/60 via-indigo-500/40 to-rose-500/60 rounded-full" />
          <div className="w-4 h-4 rounded-full border border-indigo-500/40" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-rose-500/30 to-transparent" />
    </div>
  );
}

// CYBER NEON - Futuristic with electric cyan, neon pink, lime green
function CyberTitleSlide({ slide, index, totalSlides, theme, hasImage, canEdit, isHovered, isEditing, editingText, onStartEditing, onUpdateContent, onFinishEditing }: TitleSlideVariantProps) {
  return (
    <div className="h-full relative overflow-hidden">
      {!hasImage && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#0f0f18] to-[#151520]">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-pink-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-lime-500/10 rounded-full blur-3xl" />
          {/* Grid lines */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(to right, #22d3ee 1px, transparent 1px), linear-gradient(to bottom, #22d3ee 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
          {/* Neon accents */}
          <div className="absolute top-16 right-16 w-24 h-1 bg-gradient-to-r from-cyan-500 to-transparent" />
          <div className="absolute top-16 right-16 w-1 h-24 bg-gradient-to-b from-cyan-500 to-transparent" />
          <div className="absolute bottom-16 left-16 w-20 h-1 bg-gradient-to-l from-pink-500 to-transparent" />
        </div>
      )}
      {hasImage && <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f]/95 via-[#0a0a0f]/60 to-[#0a0a0f]/30" />}
      
      <div className="relative h-full flex flex-col items-center justify-center p-12 text-center">
        <div className="absolute top-8 left-8 flex items-center gap-3">
          <div className="px-3 py-1 border border-cyan-500/50 bg-cyan-500/10 backdrop-blur-sm" style={{ clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)" }}>
            <span className="font-mono text-sm font-bold text-cyan-400">{String(index + 1).padStart(2, "0")}</span>
          </div>
          <div className="w-16 h-px bg-gradient-to-r from-cyan-500/50 via-pink-500/30 to-transparent" />
          <span className="text-xs font-medium text-cyan-400/50">/ {String(totalSlides).padStart(2, "0")}</span>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-40 bg-gradient-to-r from-cyan-500/10 via-pink-500/10 to-cyan-500/10 blur-3xl rounded-full pointer-events-none" />
        
        <EditableText value={slide.title} isEditing={isEditing && editingText?.field === "title"} onStartEdit={() => onStartEditing(index, "title")} onChange={(val) => onUpdateContent(index, "title", val)} onFinish={onFinishEditing} className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 max-w-5xl leading-tight relative" style={{ fontFamily: theme.fonts.heading.family, color: "#ffffff", letterSpacing: "-0.02em", textShadow: "0 0 30px rgba(34, 211, 238, 0.3)" }} isOwner={canEdit} isHovered={isHovered} />
        {slide.subtitle && (
          <EditableText value={slide.subtitle || ""} isEditing={isEditing && editingText?.field === "subtitle"} onStartEdit={() => onStartEditing(index, "subtitle")} onChange={(val) => onUpdateContent(index, "subtitle", val)} onFinish={onFinishEditing} className="text-xl md:text-2xl max-w-3xl" style={{ fontFamily: theme.fonts.body.family, color: "#67e8f9" }} isOwner={canEdit} isHovered={isHovered} />
        )}
        
        <div className="flex items-center gap-4 mt-12">
          <div className="w-4 h-1 bg-cyan-500/60" />
          <div className="w-20 h-0.5 bg-gradient-to-r from-cyan-500/60 via-pink-500/40 to-cyan-500/60 rounded-full" />
          <div className="w-2 h-2 bg-pink-500/80" />
          <div className="w-20 h-0.5 bg-gradient-to-r from-cyan-500/60 via-lime-500/40 to-cyan-500/60 rounded-full" />
          <div className="w-4 h-1 bg-lime-500/60" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
    </div>
  );
}


// ALIEN TECH - Extraterrestrial sci-fi with bioluminescent greens and scanning effects
function AlienTitleSlide({ slide, index, totalSlides, theme, hasImage, canEdit, isHovered, isEditing, editingText, onStartEditing, onUpdateContent, onFinishEditing }: TitleSlideVariantProps) {
  return (
    <div className="h-full relative overflow-hidden">
      {!hasImage && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f0a] via-[#0d140d] to-[#121a12]">
          {/* Bioluminescent orbs */}
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-lime-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "4s" }} />
          <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "6s" }} />
          <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-green-400/8 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "5s" }} />
          
          {/* Scanning lines effect */}
          <div className="absolute inset-0 overflow-hidden opacity-20">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-lime-400 to-transparent animate-pulse" style={{ animationDuration: "2s" }} />
            <div className="absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-lime-400/50 to-transparent" />
            <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-lime-400/30 to-transparent" />
            <div className="absolute top-3/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-lime-400/50 to-transparent" />
          </div>
          
          {/* Corner tech elements */}
          <div className="absolute top-8 right-8 w-24 h-24">
            <div className="absolute top-0 right-0 w-full h-px bg-gradient-to-l from-lime-400/60 to-transparent" />
            <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-lime-400/60 to-transparent" />
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-lime-400/80 animate-pulse" />
          </div>
          <div className="absolute bottom-8 left-8 w-20 h-20">
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-lime-400/40 to-transparent" />
            <div className="absolute bottom-0 left-0 w-px h-full bg-gradient-to-t from-lime-400/40 to-transparent" />
          </div>
          
          {/* Alien glyphs/circles */}
          <div className="absolute top-16 left-16 w-8 h-8 rounded-full border border-lime-500/30" />
          <div className="absolute top-20 left-20 w-4 h-4 rounded-full border border-lime-500/20" />
          <div className="absolute bottom-20 right-20 w-6 h-6 rounded-full border-2 border-lime-500/25" />
        </div>
      )}
      {hasImage && <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f0a]/95 via-[#0a0f0a]/60 to-[#0a0f0a]/30" />}
      
      <div className="relative h-full flex flex-col items-center justify-center p-12 text-center">
        {/* Slide indicator with alien tech style */}
        <div className="absolute top-8 left-8 flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-lg border border-lime-500/50 bg-[#0a0f0a]/70 backdrop-blur-sm flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-lime-500/10 to-transparent" />
              <span className="font-mono text-sm font-bold text-lime-400 relative z-10" style={{ fontFamily: "'Orbitron', monospace" }}>{String(index + 1).padStart(2, "0")}</span>
            </div>
            <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-px bg-gradient-to-r from-lime-500/60 to-transparent" />
            <div className="w-1 h-1 rounded-full bg-lime-500/60" />
            <div className="w-4 h-px bg-gradient-to-r from-lime-500/40 to-transparent" />
          </div>
          <span className="text-xs font-medium text-lime-400/50 font-mono">/ {String(totalSlides).padStart(2, "0")}</span>
        </div>

        {/* Central glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-48 bg-gradient-to-r from-lime-500/5 via-lime-400/15 to-lime-500/5 blur-3xl rounded-full pointer-events-none" />
        
        {/* Decorative frame */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[65%] border border-lime-500/10 rounded-2xl pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-[#0a0f0a] text-lime-500/40 text-[10px] font-mono uppercase tracking-widest">transmission</div>
        </div>
        
        <EditableText value={slide.title} isEditing={isEditing && editingText?.field === "title"} onStartEdit={() => onStartEditing(index, "title")} onChange={(val) => onUpdateContent(index, "title", val)} onFinish={onFinishEditing} className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 max-w-5xl leading-tight relative" style={{ fontFamily: theme.fonts.heading.family, color: "#ffffff", letterSpacing: "0.02em", textShadow: "0 0 40px rgba(163, 255, 0, 0.3)" }} isOwner={canEdit} isHovered={isHovered} />
        {slide.subtitle && (
          <EditableText value={slide.subtitle || ""} isEditing={isEditing && editingText?.field === "subtitle"} onStartEdit={() => onStartEditing(index, "subtitle")} onChange={(val) => onUpdateContent(index, "subtitle", val)} onFinish={onFinishEditing} className="text-xl md:text-2xl max-w-3xl" style={{ fontFamily: theme.fonts.body.family, color: "#a3ff00" }} isOwner={canEdit} isHovered={isHovered} />
        )}
        
        {/* Bottom decorative element */}
        <div className="flex items-center gap-4 mt-12">
          <div className="w-3 h-3 rounded-full border border-lime-500/40 animate-pulse" style={{ animationDuration: "3s" }} />
          <div className="w-24 h-0.5 bg-gradient-to-r from-lime-500/60 via-emerald-400/40 to-lime-500/60 rounded-full" />
          <div className="w-2 h-2 bg-lime-400/80 rounded-sm rotate-45" />
          <div className="w-24 h-0.5 bg-gradient-to-r from-lime-500/60 via-emerald-400/40 to-lime-500/60 rounded-full" />
          <div className="w-3 h-3 rounded-full border border-emerald-500/40 animate-pulse" style={{ animationDuration: "4s" }} />
        </div>
      </div>
      
      {/* Bottom scanning line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-lime-500/40 to-transparent" />
    </div>
  );
}
