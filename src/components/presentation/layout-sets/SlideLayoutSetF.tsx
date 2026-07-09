"use client";

import type { ReactNode, CSSProperties } from "react";
import { ImageIcon, Plus } from "lucide-react";
import type { Theme } from "~/lib/themes";
import type { SlideData, EditingState, SlideImage } from "../types";
import type { LayoutVariant } from "../slide-layout-utils";
import EditableText from "../EditableText";
import SlideImg from "../SlideImage";

interface LayoutColors {
  bg: string;
  bgSolid: string;
  orb1: string;
  orb2: string;
  orb1Strong: string;
  orb2Strong: string;
  accentMuted: string;
  accentLine: string;
  accentBorder: string;
  accentGlow: string;
  border: string;
  borderLine: string;
  surface: string;
  surfaceAlt: string;
  overlay: string;
  cardBg: string;
  indicatorMuted: string;
  hoverAccent: string;
  imgOverlay: string;
  fullOverlay: string;
  sideOverlay: string;
  topOverlay: string;
  accent: string;
  text: string;
  textMuted: string;
}

interface SlideLayoutSetFProps {
  layout: LayoutVariant;
  slide: SlideData;
  theme: Theme;
  index: number;
  totalSlides: number;
  bulletPoints: string[];
  colors: LayoutColors;
  useGradientClasses: boolean;
  customBgStyle?: CSSProperties;
  hasImage: boolean;
  hasMultipleImages: boolean;
  allImages: SlideImage[];
  canEdit: boolean;
  isHovered: boolean;
  isEditing: boolean;
  editingText: EditingState | null;
  isTitleSlide: boolean;
  isCustomTheme: boolean;
  onStartEditing: (slideIndex: number, field: string, bulletIndex?: number) => void;
  onUpdateContent: (slideIndex: number, field: string, value: string, bulletIndex?: number) => void;
  onFinishEditing: () => void;
  onAddBullet: (slideIndex: number) => void;
  onDeleteBullet: (slideIndex: number, bulletIndex: number) => void;
  Title: React.ComponentType<{ className?: string; align?: "left" | "center" | "right"; showSubtitle?: boolean }>;
  SlideDescription: React.ComponentType<{ className?: string; align?: "left" | "center" | "right" }>;
  EnhancedContent: React.ComponentType<{ compact?: boolean }>;
  SlideIndicator: React.ComponentType<{ position?: "top-left" | "top-right" }>;
  ImageBlock: React.ComponentType<{ className?: string; size?: "small" | "medium" | "large"; imageIndex?: number }>;
}

export function renderLayoutSetF(props: SlideLayoutSetFProps): ReactNode | null {
  const {
    layout,
    slide,
    theme,
    index,
    totalSlides,
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
    isTitleSlide,
    isCustomTheme,
    onStartEditing,
    onUpdateContent,
    onFinishEditing,
    onAddBullet,
    onDeleteBullet,
    Title,
    SlideDescription,
    EnhancedContent,
    SlideIndicator,
    ImageBlock,
  } = props;

  // LAYOUT 21: Elegant Split - Luxurious split layout with ornate divider (Midnight Garden)
  if (layout === "elegant-split") {
    const firstImage = allImages[0];
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 ${useGradientClasses ? `bg-gradient-to-br ${colors.bg}` : ''}`} style={customBgStyle} />

        {/* Ornate center divider */}
        <div className="absolute top-12 bottom-12 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-transparent via-pink-400/30 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8">
          <div className="w-full h-full rounded-full border border-pink-400/40 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-pink-400/60 to-indigo-500/40" />
          </div>
        </div>

        {/* Decorative corners */}
        <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-pink-400/20 rounded-tl-lg" />
        <div className="absolute top-8 right-8 w-16 h-16 border-r-2 border-t-2 border-pink-400/20 rounded-tr-lg" />
        <div className="absolute bottom-8 left-8 w-16 h-16 border-l-2 border-b-2 border-indigo-500/20 rounded-bl-lg" />
        <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-indigo-500/20 rounded-br-lg" />

        {/* Glowing orbs */}
        <div className={`absolute top-0 left-1/4 w-80 h-80 ${colors.orb1Strong} rounded-full blur-3xl`} />
        <div className={`absolute bottom-0 right-1/4 w-72 h-72 ${colors.orb2Strong} rounded-full blur-3xl`} />

        <SlideIndicator position="top-left" />

        <div className="relative h-full flex">
          {/* Left content side */}
          <div className="w-[48%] flex flex-col justify-center p-12 pr-16">
            <Title className="text-4xl md:text-5xl mb-8" />
            <EnhancedContent />
          </div>

          {/* Right image side */}
          <div className="w-[48%] ml-auto flex items-center justify-center p-12 pl-16">
            {hasImage && firstImage ? (
              <div className="relative w-full h-[80%]">
                {/* Elegant glow */}
                <div className="absolute -inset-4 bg-gradient-to-br from-pink-400/20 via-indigo-500/10 to-pink-400/20 rounded-3xl blur-xl" />

                {/* Image with elegant rounded corners */}
                <div className="relative w-full h-full rounded-3xl overflow-hidden border border-pink-400/25 shadow-2xl" style={{ boxShadow: "0 0 50px rgba(232, 121, 169, 0.2)" }}>
                  <SlideImg image={firstImage} alt={firstImage.alt || slide.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a1d]/50 via-transparent to-transparent" />
                </div>

                {/* Secondary image */}
                {hasMultipleImages && allImages[1] && (
                  <div className="absolute -bottom-4 -left-4 w-24 h-16 rounded-xl overflow-hidden border border-indigo-500/30 shadow-xl">
                    <SlideImg image={allImages[1]} alt={allImages[1].alt || ""} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            ) : (
              <div className={`w-full h-[70%] border-2 border-dashed ${colors.border} rounded-3xl flex items-center justify-center`}>
                <div className="text-center" style={{ color: colors.textMuted }}>
                  <ImageIcon size={48} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Add image</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom elegant line */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-400/30 via-indigo-500/20 to-pink-400/30" />
      </div>
    );
  }

  // LAYOUT 22: Glitch Frame - Cyberpunk glitch effect image frames (Cyber Neon signature)
  if (layout === "glitch-frame") {
    const firstImage = allImages[0];
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 ${useGradientClasses ? `bg-gradient-to-br ${colors.bg}` : ''}`} style={customBgStyle} />

        {/* Scanlines effect */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.1) 2px, rgba(0,255,255,0.1) 4px)" }} />

        {/* Neon grid lines */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
          <div className="absolute top-3/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent" />
          <div className="absolute left-1/4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-cyan-400 to-transparent" />
          <div className="absolute right-1/4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-fuchsia-500 to-transparent" />
        </div>

        {/* Glowing orbs */}
        <div className={`absolute top-0 right-1/4 w-96 h-96 ${colors.orb1Strong} rounded-full blur-3xl`} />
        <div className={`absolute bottom-0 left-1/4 w-80 h-80 ${colors.orb2Strong} rounded-full blur-3xl`} />

        <SlideIndicator position="top-left" />

        <div className="relative h-full flex items-center">
          {/* Content side */}
          <div className="w-[55%] flex flex-col justify-center p-12">
            {/* Cyber accent */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-3 h-3 bg-cyan-400 animate-pulse" />
              <div className="w-3 h-3 bg-fuchsia-500 animate-pulse" style={{ animationDelay: "0.3s" }} />
              <div className={`w-20 h-0.5 bg-gradient-to-r ${colors.accentLine} to-transparent`} />
            </div>

            <Title className="text-4xl md:text-5xl mb-8" />
            <EnhancedContent />
          </div>

          {/* Glitch image frame */}
          {hasImage && firstImage && (
            <div className="w-[45%] relative flex items-center justify-center">
              <div className="relative">
                {/* Glitch offset layers */}
                <div className="absolute inset-0 translate-x-1 -translate-y-0.5 opacity-50">
                  <div className="w-64 h-72 rounded-lg overflow-hidden">
                    <SlideImg image={firstImage} alt="" className="w-full h-full object-cover" style={{ filter: "hue-rotate(90deg)" }} />
                  </div>
                </div>
                <div className="absolute inset-0 -translate-x-1 translate-y-0.5 opacity-50">
                  <div className="w-64 h-72 rounded-lg overflow-hidden">
                    <SlideImg image={firstImage} alt="" className="w-full h-full object-cover" style={{ filter: "hue-rotate(-90deg)" }} />
                  </div>
                </div>

                {/* Main image */}
                <div className="relative w-64 h-72 rounded-lg overflow-hidden border-2 border-cyan-400/50 shadow-2xl" style={{ boxShadow: "0 0 30px rgba(0,255,255,0.4), 0 0 60px rgba(255,0,255,0.2)" }}>
                  <SlideImg image={firstImage} alt={firstImage.alt || slide.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f]/70 to-transparent" />
                </div>

                {/* Corner accents */}
                <div className="absolute -top-2 -left-2 w-6 h-6 border-l-2 border-t-2 border-cyan-400" />
                <div className="absolute -top-2 -right-2 w-6 h-6 border-r-2 border-t-2 border-fuchsia-500" />
                <div className="absolute -bottom-2 -left-2 w-6 h-6 border-l-2 border-b-2 border-fuchsia-500" />
                <div className="absolute -bottom-2 -right-2 w-6 h-6 border-r-2 border-b-2 border-cyan-400" />
              </div>
            </div>
          )}
        </div>

        {/* Bottom neon line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400/60 via-fuchsia-500/40 to-cyan-400/60" />
      </div>
    );
  }

  // LAYOUT 23: Neon Grid - Grid layout with neon borders and cyber effects (Cyber Neon)
  if (layout === "neon-grid") {
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 ${useGradientClasses ? `bg-gradient-to-br ${colors.bg}` : ''}`} style={customBgStyle} />

        {/* Grid background */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(rgba(0,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.1) 1px, transparent 1px)", backgroundSize: "50px 50px" }} />

        {/* Scanlines */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)" }} />

        {/* Glowing orbs */}
        <div className={`absolute top-1/3 right-0 w-80 h-80 ${colors.orb1} rounded-full blur-3xl`} />
        <div className={`absolute bottom-1/3 left-0 w-64 h-64 ${colors.orb2} rounded-full blur-3xl`} />

        <SlideIndicator position="top-left" />

        <div className="relative h-full p-12 pt-20">
          {/* Title with neon underline */}
          <div className="mb-8">
            <Title className="text-3xl md:text-4xl mb-4" />
            <div className="flex items-center gap-2">
              <div className="w-24 h-0.5 bg-cyan-400 shadow-lg" style={{ boxShadow: "0 0 10px rgba(0,255,255,0.8)" }} />
              <div className="w-2 h-2 bg-fuchsia-500 shadow-lg" style={{ boxShadow: "0 0 10px rgba(255,0,255,0.8)" }} />
              <div className="w-12 h-0.5 bg-fuchsia-500 shadow-lg" style={{ boxShadow: "0 0 10px rgba(255,0,255,0.8)" }} />
            </div>
          </div>

          {/* Neon cards grid */}
          {bulletPoints.length > 0 && (
            <div className="grid grid-cols-2 gap-4 max-w-4xl">
              {bulletPoints.map((point, i) => (
                <div key={i} className="relative group">
                  {/* Neon glow on hover */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400/0 to-fuchsia-500/0 rounded-lg blur opacity-0 transition-all duration-300" />

                  <div className={`relative p-5 rounded-lg border ${colors.cardBg} transition-all`} style={{ borderColor: i % 2 === 0 ? "rgba(0,255,255,0.3)" : "rgba(255,0,255,0.3)" }}>
                    <div className="flex items-start gap-4">
                      {/* Cyber number */}
                      <div className="w-10 h-10 rounded flex items-center justify-center text-sm font-bold font-mono shrink-0 border" style={{ borderColor: i % 2 === 0 ? "rgba(0,255,255,0.5)" : "rgba(255,0,255,0.5)", color: i % 2 === 0 ? "#00ffff" : "#ff00ff", boxShadow: i % 2 === 0 ? "0 0 15px rgba(0,255,255,0.3)" : "0 0 15px rgba(255,0,255,0.3)" }}>
                        {String(i + 1).padStart(2, "0")}
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
            <button type="button" onClick={(e) => { e.stopPropagation(); onAddBullet(index) }} className={`mt-4 flex items-center gap-2 text-sm ${colors.indicatorMuted} ${colors.hoverAccent} transition-colors`}>
              <Plus size={14} /> Add card
            </button>
          </div>
        )}
        </div>

        {/* Image with neon frame */}
        {hasImage && (
          <div className="absolute bottom-8 right-8 w-48 h-32">
            <div className="relative w-full h-full rounded-lg overflow-hidden border border-cyan-400/40" style={{ boxShadow: "0 0 20px rgba(0,255,255,0.3)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <SlideImg image={allImages[0]!} alt={allImages[0]!.alt || slide.title} className="w-full h-full object-cover" />
            </div>
          </div>
        )}
      </div>
    );
  }

  // LAYOUT 24: Holo Cards - Holographic card effects with rainbow gradients (Cyber Neon)
  if (layout === "holo-cards") {
    const firstImage = allImages[0];
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 ${useGradientClasses ? `bg-gradient-to-br ${colors.bg}` : ''}`} style={customBgStyle} />

        {/* Holographic shimmer background */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "linear-gradient(135deg, rgba(0,255,255,0.2) 0%, rgba(255,0,255,0.2) 25%, rgba(173,255,47,0.2) 50%, rgba(0,255,255,0.2) 75%, rgba(255,0,255,0.2) 100%)", backgroundSize: "400% 400%" }} />

        {/* Floating particles */}
        <div className="absolute top-20 left-20 w-2 h-2 rounded-full bg-cyan-400/60 animate-pulse" />
        <div className="absolute top-40 right-32 w-1.5 h-1.5 rounded-full bg-fuchsia-500/50 animate-pulse" style={{ animationDelay: "0.5s" }} />
        <div className="absolute bottom-32 left-40 w-2 h-2 rounded-full bg-lime-400/40 animate-pulse" style={{ animationDelay: "1s" }} />

        {/* Glowing orbs */}
        <div className={`absolute top-0 right-1/4 w-96 h-96 ${colors.orb1} rounded-full blur-3xl`} />
        <div className={`absolute bottom-0 left-1/4 w-80 h-80 ${colors.orb2} rounded-full blur-3xl`} />

        <SlideIndicator position="top-left" />

        <div className="relative h-full flex">
          {/* Content side */}
          <div className="w-[55%] flex flex-col justify-center p-12">
            <Title className="text-4xl md:text-5xl mb-8" />

            {/* Holographic bullet cards */}
            {bulletPoints.length > 0 && (
              <div className="space-y-4">
                {bulletPoints.map((point, i) => (
                  <div key={i} className="relative group">
                    {/* Holographic border effect */}
                    <div className="absolute -inset-0.5 rounded-lg opacity-60 transition-opacity" style={{ background: "linear-gradient(135deg, #00ffff, #ff00ff, #adff2f, #00ffff)", backgroundSize: "300% 300%" }} />

                    <div className={`relative p-4 rounded-lg ${colors.cardBg}`}>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 mt-2 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500" />
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
            <button type="button" onClick={(e) => { e.stopPropagation(); onAddBullet(index) }} className={`mt-4 flex items-center gap-2 text-sm ${colors.indicatorMuted} ${colors.hoverAccent} transition-colors`}>
                <Plus size={14} /> Add point
              </button>
          </div>
        )}
          </div>

          {/* Holographic image frame */}
          {hasImage && firstImage && (
            <div className="w-[45%] relative flex items-center justify-center p-8">
              <div className="relative w-full h-[80%]">
                {/* Holographic glow */}
                <div className="absolute -inset-2 rounded-xl opacity-60" style={{ background: "linear-gradient(135deg, rgba(0,255,255,0.3), rgba(255,0,255,0.3), rgba(173,255,47,0.3))", filter: "blur(15px)" }} />

                {/* Image */}
                <div className="relative w-full h-full rounded-xl overflow-hidden border border-cyan-400/30" style={{ boxShadow: "0 0 30px rgba(0,255,255,0.3), 0 0 60px rgba(255,0,255,0.2)" }}>
                  <SlideImg image={firstImage} alt={firstImage.alt || slide.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f]/60 to-transparent" />

                  {/* Holographic overlay */}
                  <div className="absolute inset-0 opacity-20" style={{ background: "linear-gradient(135deg, transparent 0%, rgba(0,255,255,0.1) 25%, transparent 50%, rgba(255,0,255,0.1) 75%, transparent 100%)" }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom holographic line */}
        <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: "linear-gradient(90deg, #00ffff, #ff00ff, #adff2f, #00ffff)" }} />
      </div>
    );
  }

  // LAYOUT 25: Scan Frame - Alien scanning effect with bioluminescent borders (Alien Tech signature)
  if (layout === "scan-frame") {
    const firstImage = allImages[0];
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 ${useGradientClasses ? `bg-gradient-to-br ${colors.bg}` : ''}`} style={customBgStyle} />

        {/* Scanning lines effect */}
        <div className="absolute inset-0 overflow-hidden opacity-15">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-lime-400 to-transparent" style={{ top: `${12.5 * (i + 1)}%` }} />
          ))}
        </div>

        {/* Bioluminescent orbs */}
        <div className={`absolute top-1/4 right-1/4 w-96 h-96 ${colors.orb1Strong} rounded-full blur-3xl animate-pulse`} style={{ animationDuration: "4s" }} />
        <div className={`absolute bottom-1/4 left-1/3 w-80 h-80 ${colors.orb2Strong} rounded-full blur-3xl animate-pulse`} style={{ animationDuration: "6s" }} />

        {/* Corner tech elements */}
        <div className="absolute top-6 right-6 w-20 h-20">
          <div className="absolute top-0 right-0 w-full h-px bg-gradient-to-l from-lime-400/60 to-transparent" />
          <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-lime-400/60 to-transparent" />
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-lime-400/80 animate-pulse" />
        </div>
        <div className="absolute bottom-6 left-6 w-16 h-16">
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-lime-400/40 to-transparent" />
          <div className="absolute bottom-0 left-0 w-px h-full bg-gradient-to-t from-lime-400/40 to-transparent" />
        </div>

        <SlideIndicator position="top-left" />

        <div className="relative h-full flex">
          {/* Content side */}
          <div className="w-[55%] flex flex-col justify-center p-12">
            <Title className="text-4xl md:text-5xl mb-8" />

            {bulletPoints.length > 0 && (
              <div className="space-y-4">
                {bulletPoints.map((point, i) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <div className="relative mt-2">
                      <div className="w-3 h-3 rounded-full border border-lime-400/60 transition-colors" />
                      <div className="absolute inset-0 w-3 h-3 rounded-full bg-lime-400/40 animate-ping" style={{ animationDuration: "3s" }} />
                    </div>
                    <EditableText
                      value={point}
                      isEditing={isEditing && editingText?.field === "bullet" && editingText?.bulletIndex === i}
                      onStartEdit={() => onStartEditing(index, "bullet", i)}
                      onChange={(val) => onUpdateContent(index, "bullet", val, i)}
                      onFinish={onFinishEditing}
                      className="flex-1 text-lg leading-relaxed"
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
            <button type="button" onClick={(e) => { e.stopPropagation(); onAddBullet(index) }} className={`mt-4 flex items-center gap-2 text-sm ${colors.indicatorMuted} ${colors.hoverAccent} transition-colors`}>
                <Plus size={14} /> Add point
              </button>
          </div>
        )}
          </div>

          {/* Scan frame image */}
          {hasImage && firstImage && (
            <div className="w-[45%] relative flex items-center justify-center p-8">
              <div className="relative w-full h-[80%]">
                {/* Scanning glow effect */}
                <div className="absolute -inset-3 rounded-2xl bg-gradient-to-r from-lime-400/20 via-emerald-400/30 to-lime-400/20 blur-xl" />

                {/* Frame with scanning corners */}
                <div className="relative w-full h-full rounded-xl overflow-hidden border-2 border-lime-400/40" style={{ boxShadow: "0 0 40px rgba(163,255,0,0.3), inset 0 0 30px rgba(163,255,0,0.1)" }}>
                  <SlideImg image={firstImage} alt={firstImage.alt || slide.title} className="w-full h-full object-cover" />
                  <div className={`absolute inset-0 ${colors.fullOverlay}`} />

                  {/* Scanning line animation */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-lime-400/60 to-transparent animate-pulse" style={{ top: "50%", animationDuration: "2s" }} />
                  </div>

                  {/* Corner brackets */}
                  <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-lime-400/60" />
                  <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-lime-400/60" />
                  <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-lime-400/60" />
                  <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-lime-400/60" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-lime-400/50 to-transparent" />
      </div>
    );
  }

  // LAYOUT 26: Bio Cards - Organic bioluminescent card design (Alien Tech)
  if (layout === "bio-cards") {
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 ${useGradientClasses ? `bg-gradient-to-br ${colors.bg}` : ''}`} style={customBgStyle} />

        {/* Organic flowing shapes */}
        <div className={`absolute top-0 right-0 w-[500px] h-[500px] ${colors.orb1} rounded-full blur-3xl`} />
        <div className={`absolute bottom-0 left-0 w-[400px] h-[400px] ${colors.orb2} rounded-full blur-3xl`} />

        {/* Floating bio particles */}
        <div className="absolute top-16 left-20 w-3 h-3 rounded-full bg-lime-400/50 animate-pulse" style={{ animationDuration: "3s" }} />
        <div className="absolute top-32 right-24 w-2 h-2 rounded-full bg-emerald-400/40 animate-pulse" style={{ animationDuration: "4s" }} />
        <div className="absolute bottom-24 left-32 w-2.5 h-2.5 rounded-full bg-lime-400/30 animate-pulse" style={{ animationDuration: "5s" }} />

        <SlideIndicator position="top-left" />

        <div className="relative h-full flex flex-col justify-center p-12">
          <Title className="text-4xl md:text-5xl mb-10 text-center" align="center" />

          {/* Bio cards grid */}
          {bulletPoints.length > 0 && (
            <div className="grid grid-cols-2 gap-6 max-w-4xl mx-auto">
              {bulletPoints.map((point, i) => (
                <div key={i} className="relative group">
                  {/* Organic glow */}
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-lime-400/20 to-emerald-500/10 blur-lg opacity-0 transition-opacity" />

                  <div className={`relative p-5 rounded-2xl ${colors.cardBg} backdrop-blur-sm`} style={{ boxShadow: "0 0 20px rgba(163,255,0,0.1)" }}>
                    {/* Bio indicator */}
                    <div className="absolute -top-2 -left-2 w-4 h-4 rounded-full bg-lime-400/60 animate-pulse" style={{ animationDuration: `${3 + i}s` }} />

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-lime-400/30 to-emerald-500/20 flex items-center justify-center border border-lime-400/30">
                        <span className="text-lime-400 font-mono text-sm font-bold">{String(i + 1).padStart(2, "0")}</span>
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
            <button type="button" onClick={(e) => { e.stopPropagation(); onAddBullet(index) }} className={`mt-6 mx-auto flex items-center gap-2 text-sm ${colors.indicatorMuted} ${colors.hoverAccent} transition-colors`}>
              <Plus size={14} /> Add card
            </button>
          </div>
        )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-lime-400/40 to-transparent" />
      </div>
    );
  }

  // LAYOUT 27: Transmission Split - Data transmission style split layout (Alien Tech)
  if (layout === "transmission-split") {
    const firstImage = allImages[0];
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 ${useGradientClasses ? `bg-gradient-to-br ${colors.bg}` : ''}`} style={customBgStyle} />

        {/* Data stream lines */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-lime-400 via-transparent to-lime-400" />
          <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-lime-400 to-transparent" />
          <div className="absolute top-0 left-3/4 w-px h-full bg-gradient-to-b from-lime-400 via-transparent to-lime-400" />
        </div>

        {/* Glowing orbs */}
        <div className={`absolute top-1/3 left-1/4 w-80 h-80 ${colors.orb1Strong} rounded-full blur-3xl`} />
        <div className={`absolute bottom-1/3 right-1/4 w-72 h-72 ${colors.orb2Strong} rounded-full blur-3xl`} />

        <SlideIndicator position="top-left" />

        <div className="relative h-full flex">
          {/* Left: Image with transmission frame */}
          {hasImage && firstImage && (
            <div className="w-[45%] relative flex items-center justify-center p-8">
              <div className="relative w-full h-[85%]">
                {/* Transmission glow */}
                <div className="absolute -inset-4 rounded-xl bg-gradient-to-r from-lime-400/15 via-emerald-400/20 to-lime-400/15 blur-2xl" />

                <div className="relative w-full h-full rounded-xl overflow-hidden border border-lime-400/30" style={{ boxShadow: "0 0 50px rgba(163,255,0,0.25)" }}>
                  <SlideImg image={firstImage} alt={firstImage.alt || slide.title} className="w-full h-full object-cover" />
                  <div className={`absolute inset-0 ${colors.fullOverlay}`} />

                  {/* Transmission overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-lime-400/5 via-transparent to-lime-400/5" />

                  {/* Status indicator */}
                  <div className="absolute top-3 left-3 flex items-center gap-2 px-2 py-1 rounded bg-[#0a0f0a]/80 border border-lime-400/30">
                    <div className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
                    <span className="text-lime-400 text-[10px] font-mono uppercase">Live</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Right: Content */}
          <div className={`${hasImage ? "w-[55%]" : "w-full"} flex flex-col justify-center p-12`}>
            <div className="mb-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
              <span className="text-lime-400/60 text-xs font-mono uppercase tracking-widest">Incoming Transmission</span>
            </div>

            <Title className="text-4xl md:text-5xl mb-8" />

            {bulletPoints.length > 0 && (
              <div className="space-y-4">
                {bulletPoints.map((point, i) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-1 h-1 rounded-full bg-lime-400/60" />
                      <div className="w-6 h-px bg-gradient-to-r from-lime-400/60 to-transparent" />
                    </div>
                    <EditableText
                      value={point}
                      isEditing={isEditing && editingText?.field === "bullet" && editingText?.bulletIndex === i}
                      onStartEdit={() => onStartEditing(index, "bullet", i)}
                      onChange={(val) => onUpdateContent(index, "bullet", val, i)}
                      onFinish={onFinishEditing}
                      className="flex-1 text-lg leading-relaxed"
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
            <button type="button" onClick={(e) => { e.stopPropagation(); onAddBullet(index) }} className={`mt-4 flex items-center gap-2 text-sm ${colors.indicatorMuted} ${colors.hoverAccent} transition-colors`}>
                <Plus size={14} /> Add point
              </button>
          </div>
        )}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-lime-400/30 via-emerald-400/50 to-lime-400/30" />
      </div>
    );
  }

  // LAYOUT 28: Clean Frame - Premium professional image frame (Corporate Clean signature)
  if (layout === "clean-frame") {
    const firstImage = allImages[0];
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 ${useGradientClasses ? `bg-gradient-to-br ${colors.bg}` : ''} pointer-events-none`} style={customBgStyle} />

        {/* Premium corner accents */}
        <div className="absolute top-0 left-0 w-1.5 h-28 bg-gradient-to-b from-blue-500 via-blue-400 to-transparent pointer-events-none" />
        <div className="absolute top-0 left-0 w-28 h-1.5 bg-gradient-to-r from-blue-500 via-blue-400 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-1 h-24 bg-gradient-to-t from-slate-300 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-24 h-1 bg-gradient-to-l from-slate-300 to-transparent pointer-events-none" />

        {/* Elegant gradient orbs */}
        <div className={`absolute top-1/4 right-1/4 w-[500px] h-[500px] ${colors.orb1} rounded-full blur-3xl pointer-events-none`} />
        <div className={`absolute bottom-1/4 left-1/3 w-[400px] h-[400px] ${colors.orb2} rounded-full blur-3xl pointer-events-none`} />

        <SlideIndicator position="top-left" />

        <div className="relative flex items-start p-4 sm:p-6 md:p-8 lg:p-10 z-10">
          {/* Content side */}
          <div className={`${hasImage ? "w-[55%]" : "w-full"} flex flex-col py-4 sm:py-6`}>
            {canEdit && !slide.contentLayout && (
            <div className={`transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"} ${isHovered ? "" : "pointer-events-none"}`}>
              <button type="button" onClick={(e) => { e.stopPropagation(); onAddBullet(index) }} className={`mt-3 flex items-center gap-2 text-xs sm:text-sm ${colors.indicatorMuted} ${colors.hoverAccent} transition-colors`} style={{ fontFamily: "'DM Sans', sans-serif" }}>
                <Plus size={14} /> Add point
              </button>
            </div>
            )}
          </div>

          {/* Premium image frame */}
          {hasImage && firstImage && (
            <div className="w-[45%] flex items-center justify-center p-2 sm:p-4 md:p-6">
              <div className="relative w-full aspect-[4/3]">
                <div className="relative w-full h-full rounded-xl overflow-hidden border border-slate-200/60 shadow-xl shadow-slate-900/10">
                  <SlideImg image={firstImage} alt={firstImage.alt || slide.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent pointer-events-none" />
                </div>
                {/* Premium corner accent */}
                <div className="absolute -bottom-2 -right-2 w-10 h-10 border-b-2 border-r-2 border-blue-500 rounded-br-lg pointer-events-none" />
              </div>
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-slate-300 to-transparent pointer-events-none" />
      </div>
    );
  }

  // LAYOUT 29: Pro Cards - Premium professional card grid layout (Corporate Clean)
  if (layout === "pro-cards") {
    return (
      <div className="relative overflow-hidden py-8 sm:py-10 md:py-12">
        <div className={`absolute inset-0 ${!isCustomTheme ? `bg-gradient-to-br ${colors.bg}` : ''} pointer-events-none`} style={customBgStyle} />

        {/* Elegant background elements */}
        <div className={`absolute top-0 right-0 w-[550px] h-[550px] ${colors.orb1} rounded-full blur-3xl pointer-events-none`} />
        <div className={`absolute bottom-0 left-0 w-[450px] h-[450px] ${colors.orb2} rounded-full blur-3xl pointer-events-none`} />
        
        {/* Subtle dot pattern */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, #3182ce 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

        <SlideIndicator position="top-left" />

        <div className="relative flex flex-col p-4 sm:p-6 md:p-8 lg:p-10 z-10">
          <Title className="text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-4 sm:mb-5 text-center shrink-0" align="center" />

          {/* Content area */}
          {canEdit && !slide.contentLayout && (
          <div className={`transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"} ${isHovered ? "" : "pointer-events-none"}`}>
            <button type="button" onClick={(e) => { e.stopPropagation(); onAddBullet(index) }} className={`mt-4 mx-auto flex items-center gap-2 text-xs sm:text-sm ${colors.indicatorMuted} ${colors.hoverAccent} transition-colors shrink-0`} style={{ fontFamily: "'DM Sans', sans-serif" }}>
              <Plus size={14} /> Add card
            </button>
          </div>
        )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-slate-300 to-transparent pointer-events-none" />
      </div>
    );
  }

  // LAYOUT 30: Executive Split - Premium executive-style split layout (Corporate Clean)
  if (layout === "executive-split") {
    const firstImage = allImages[0];
    return (
      <div className="relative overflow-hidden py-8 sm:py-10 md:py-12">
        <div className={`absolute inset-0 ${!isCustomTheme ? `bg-gradient-to-br ${colors.bg}` : ''} pointer-events-none`} style={customBgStyle} />

        {/* Subtle dot pattern */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, #3182ce 1px, transparent 1px)", backgroundSize: "36px 36px" }} />

        {/* Elegant orbs */}
        <div className={`absolute top-1/3 left-1/4 w-[400px] h-[400px] ${colors.orb1Strong} rounded-full blur-3xl pointer-events-none`} />
        <div className={`absolute bottom-1/3 right-1/4 w-[350px] h-[350px] ${colors.orb2Strong} rounded-full blur-3xl pointer-events-none`} />

        <SlideIndicator position="top-left" />

        <div className="relative flex items-start p-4 sm:p-6 md:p-8 lg:p-10 z-10">
          {/* Left: Premium Image */}
          {hasImage && firstImage && (
            <div className="w-[42%] flex items-center justify-center p-2 sm:p-4 md:p-6">
              <div className="relative w-full aspect-[4/3]">
                <div className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl shadow-slate-900/15 border border-slate-200/50">
                  <SlideImg image={firstImage} alt={firstImage.alt || slide.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/15 to-transparent pointer-events-none" />
                </div>
                {/* Premium accent line */}
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-28 bg-gradient-to-b from-transparent via-blue-500 to-transparent rounded-full pointer-events-none" />
              </div>
            </div>
          )}

          {/* Right: Content */}
          <div className={`${hasImage ? "w-[58%]" : "w-full"} flex flex-col py-4 sm:py-6 px-2 sm:px-4`}>
            <div className="mb-2 sm:mb-3 flex items-center gap-3 shrink-0">
              <div className="w-10 h-0.5 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" />
              <span className="text-blue-600 text-xs font-semibold uppercase tracking-widest" style={{ fontFamily: "'DM Sans', sans-serif" }}>Overview</span>
            </div>

            {canEdit && !slide.contentLayout && (
            <div className={`transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"} ${isHovered ? "" : "pointer-events-none"}`}>
              <button type="button" onClick={(e) => { e.stopPropagation(); onAddBullet(index) }} className={`mt-2 sm:mt-3 flex items-center gap-2 text-xs sm:text-sm ${colors.indicatorMuted} ${colors.hoverAccent} transition-colors shrink-0`} style={{ fontFamily: "'DM Sans', sans-serif" }}>
                <Plus size={14} /> Add point
              </button>
            </div>
            )}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500/30 via-slate-300 to-blue-500/30 pointer-events-none" />
      </div>
    );
  }

  // ============================================
  // COSMIC VOYAGE THEME LAYOUTS (31-36)
  // Unique layouts with space image background
  // ============================================

  // LAYOUT 31: Nebula Float - Floating glass panel with ethereal glow
  if (layout === "nebula-float") {
    const bgImage = theme.backgroundImage;
    return (
      <div className="h-full relative overflow-hidden">
        {/* Space background image */}
        {bgImage && (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${bgImage})` }}
          />
        )}
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0612]/70 via-[#120a1f]/50 to-[#0a0612]/60" />

        {/* Animated cosmic particles effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-violet-400/60 rounded-full animate-pulse" />
          <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-fuchsia-400/50 rounded-full animate-pulse" style={{ animationDelay: "0.5s" }} />
          <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-blue-400/40 rounded-full animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        <SlideIndicator position="top-left" />

        <div className="relative h-full flex items-center justify-center p-12">
          {/* Floating glass panel */}
          <div className="relative max-w-4xl w-full">
            {/* Glow effect behind panel */}
            <div className="absolute -inset-4 bg-gradient-to-r from-violet-500/20 via-fuchsia-500/15 to-blue-500/20 rounded-3xl blur-2xl" />

            {/* Glass panel */}
            <div className="relative bg-[#120a1f]/60 backdrop-blur-xl rounded-2xl border border-violet-500/30 p-10 shadow-2xl">
              {/* Inner glow border */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/10 via-transparent to-fuchsia-500/10 pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-1 bg-gradient-to-r from-violet-400 to-fuchsia-400 rounded-full" />
                  <span className="text-violet-300/80 text-xs font-medium uppercase tracking-[0.3em]">Cosmic Insight</span>
                </div>

                <Title className="text-4xl md:text-5xl mb-8" />

                {bulletPoints.length > 0 && (
                  <div className="space-y-4 mt-8">
                    {bulletPoints.map((point, i) => (
                      <div key={i} className="flex items-start gap-4 group">
                        <div className="mt-2 flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400 shadow-lg shadow-violet-500/50" />
                          <div className="w-8 h-px bg-gradient-to-r from-violet-500/50 to-transparent" />
                        </div>
                        <EditableText
                          value={point}
                          isEditing={isEditing && editingText?.field === "bullet" && editingText?.bulletIndex === i}
                          onStartEdit={() => onStartEditing(index, "bullet", i)}
                          onChange={(val) => onUpdateContent(index, "bullet", val, i)}
                          onFinish={onFinishEditing}
                          className="flex-1 text-lg leading-relaxed"
                          style={{ fontFamily: theme.fonts.body.family, color: "#c4b5fd" }}
                          isOwner={canEdit}
                          isHovered={isHovered}
                          onDelete={() => onDeleteBullet(index, i)}
                        />
                      </div>
                    ))}
                    {canEdit && (
          <div className={`transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"} ${isHovered ? "" : "pointer-events-none"}`}>
            <button type="button" onClick={(e) => { e.stopPropagation(); onAddBullet(index) }} className="flex items-center gap-2 text-sm text-violet-400/60 hover:text-violet-400 transition-colors ml-14">
                        <Plus size={14} /> Add point
                      </button>
          </div>
        )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // LAYOUT 32: Orbital Rings - Content with orbital ring decorations
  if (layout === "orbital-rings") {
    const bgImage = theme.backgroundImage;
    const firstImage = allImages[0];
    return (
      <div className="h-full relative overflow-hidden">
        {bgImage && (
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${bgImage})` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-tl from-[#0a0612]/80 via-[#120a1f]/60 to-[#0a0612]/70" />

        {/* Orbital ring decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-violet-500/10 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-fuchsia-500/15 rounded-full rotate-45" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-blue-500/10 rounded-full -rotate-12" />
        </div>

        <SlideIndicator position="top-right" />

        <div className="relative h-full flex">
          {/* Left: Content */}
          <div className={`${hasImage ? "w-[55%]" : "w-full"} flex flex-col justify-center p-12`}>
            <div className="relative">
              <div className="absolute -left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-violet-500 via-fuchsia-500 to-blue-500 rounded-full" />

              <Title className="text-4xl md:text-5xl mb-8 pl-4" />

              {bulletPoints.length > 0 && (
                <div className="space-y-5 pl-4">
                  {bulletPoints.map((point, i) => (
                    <div key={i} className="flex items-start gap-4 group">
                      <div className="mt-2.5 w-3 h-3 rounded-full border-2 border-violet-400 bg-violet-500/30" />
                      <EditableText
                        value={point}
                        isEditing={isEditing && editingText?.field === "bullet" && editingText?.bulletIndex === i}
                        onStartEdit={() => onStartEditing(index, "bullet", i)}
                        onChange={(val) => onUpdateContent(index, "bullet", val, i)}
                        onFinish={onFinishEditing}
                        className="flex-1 text-lg leading-relaxed"
                        style={{ fontFamily: theme.fonts.body.family, color: "#c4b5fd" }}
                        isOwner={canEdit}
                        isHovered={isHovered}
                        onDelete={() => onDeleteBullet(index, i)}
                      />
                    </div>
                  ))}
                  {canEdit && (
          <div className={`transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"} ${isHovered ? "" : "pointer-events-none"}`}>
            <button type="button" onClick={(e) => { e.stopPropagation(); onAddBullet(index) }} className="flex items-center gap-2 text-sm text-violet-400/60 hover:text-violet-400 transition-colors ml-7">
                      <Plus size={14} /> Add point
                    </button>
          </div>
        )}
                </div>
              )}
            </div>
          </div>

          {/* Right: Image in orbital frame */}
          {hasImage && firstImage && (
            <div className="w-[45%] flex items-center justify-center p-8">
              <div className="relative">
                {/* Orbital glow */}
                <div className="absolute -inset-8 bg-gradient-to-r from-violet-500/20 via-fuchsia-500/15 to-blue-500/20 rounded-full blur-2xl" />
                {/* Orbital ring */}
                <div className="absolute -inset-4 border-2 border-violet-500/30 rounded-full" />
                {/* Image */}
                <div className="relative w-72 h-72 rounded-full overflow-hidden border-4 border-[#120a1f]/80">
                  <SlideImg image={firstImage} alt={firstImage.alt || slide.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0612]/60 to-transparent" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // LAYOUT 33: Starfield Cards - Content in starfield-style cards
  if (layout === "starfield-cards") {
    const bgImage = theme.backgroundImage;
    return (
      <div className="h-full relative overflow-hidden">
        {bgImage && (
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${bgImage})` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0612]/60 via-[#120a1f]/50 to-[#0a0612]/70" />

        <SlideIndicator position="top-left" />

        <div className="relative h-full flex flex-col justify-center p-12">
          <div className="mb-10">
            <Title className="text-4xl md:text-5xl text-center" align="center" />
          </div>

          {bulletPoints.length > 0 && (
            <div className="grid grid-cols-2 gap-6 max-w-5xl mx-auto">
              {bulletPoints.map((point, i) => (
                <div key={i} className="group relative">
                  {/* Card glow */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 rounded-xl blur-lg opacity-0 transition-opacity" />

                  {/* Card */}
                  <div className="relative bg-[#120a1f]/70 backdrop-blur-lg rounded-xl border border-violet-500/20 p-6 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 flex items-center justify-center border border-violet-500/30">
                        <span className="text-violet-300 font-bold">{i + 1}</span>
                      </div>
                      <EditableText
                        value={point}
                        isEditing={isEditing && editingText?.field === "bullet" && editingText?.bulletIndex === i}
                        onStartEdit={() => onStartEditing(index, "bullet", i)}
                        onChange={(val) => onUpdateContent(index, "bullet", val, i)}
                        onFinish={onFinishEditing}
                        className="flex-1 text-base leading-relaxed"
                        style={{ fontFamily: theme.fonts.body.family, color: "#c4b5fd" }}
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
            <button type="button" onClick={(e) => { e.stopPropagation(); onAddBullet(index) }} className="mt-6 mx-auto flex items-center gap-2 text-sm text-violet-400/60 hover:text-violet-400 transition-colors">
              <Plus size={14} /> Add card
            </button>
          </div>
        )}
        </div>
      </div>
    );
  }

  // LAYOUT 34: Cosmic Portal - Content emerging from a portal effect
  if (layout === "cosmic-portal") {
    const bgImage = theme.backgroundImage;
    const firstImage = allImages[0];
    return (
      <div className="h-full relative overflow-hidden">
        {bgImage && (
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${bgImage})` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0612]/80 via-[#120a1f]/50 to-[#0a0612]/80" />

        {/* Portal effect */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-l from-violet-500/20 via-fuchsia-500/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute inset-12 border border-violet-500/20 rounded-full" />
          <div className="absolute inset-24 border border-fuchsia-500/15 rounded-full" />
          <div className="absolute inset-36 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 rounded-full" />
        </div>

        <SlideIndicator position="top-left" />

        <div className="relative h-full flex">
          {/* Left: Content */}
          <div className="w-[60%] flex flex-col justify-center p-12 pr-20">
            <div className="mb-4 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse" style={{ animationDelay: "0.3s" }} />
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: "0.6s" }} />
            </div>

            <Title className="text-4xl md:text-5xl mb-8" />

            {bulletPoints.length > 0 && (
              <div className="space-y-4">
                {bulletPoints.map((point, i) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <div className="mt-2 w-6 h-px bg-gradient-to-r from-violet-500 to-transparent" />
                    <EditableText
                      value={point}
                      isEditing={isEditing && editingText?.field === "bullet" && editingText?.bulletIndex === i}
                      onStartEdit={() => onStartEditing(index, "bullet", i)}
                      onChange={(val) => onUpdateContent(index, "bullet", val, i)}
                      onFinish={onFinishEditing}
                      className="flex-1 text-lg leading-relaxed"
                      style={{ fontFamily: theme.fonts.body.family, color: "#c4b5fd" }}
                      isOwner={canEdit}
                      isHovered={isHovered}
                      onDelete={() => onDeleteBullet(index, i)}
                    />
                  </div>
                ))}
                {canEdit && (
          <div className={`transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"} ${isHovered ? "" : "pointer-events-none"}`}>
            <button type="button" onClick={(e) => { e.stopPropagation(); onAddBullet(index) }} className="flex items-center gap-2 text-sm text-violet-400/60 hover:text-violet-400 transition-colors ml-10">
                    <Plus size={14} /> Add point
                  </button>
          </div>
        )}
              </div>
            )}
          </div>

          {/* Right: Image in portal */}
          {hasImage && firstImage && (
            <div className="w-[40%] flex items-center justify-center">
              <div className="relative w-64 h-64">
                <div className="absolute -inset-4 bg-gradient-to-r from-violet-500/30 to-fuchsia-500/30 rounded-full blur-2xl" />
                <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-violet-500/40">
                  <SlideImg image={firstImage} alt={firstImage.alt || slide.title} className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // LAYOUT 35: Galaxy Split - Diagonal split with galaxy aesthetic
  if (layout === "galaxy-split") {
    const bgImage = theme.backgroundImage;
    const firstImage = allImages[0];
    return (
      <div className="h-full relative overflow-hidden">
        {bgImage && (
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${bgImage})` }} />
        )}

        {/* Diagonal overlay */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0612]/90 via-[#0a0612]/70 to-transparent" style={{ clipPath: "polygon(0 0, 65% 0, 45% 100%, 0 100%)" }} />
        </div>

        {/* Diagonal accent line */}
        <div className="absolute top-0 bottom-0 left-[55%] w-px bg-gradient-to-b from-violet-500/50 via-fuchsia-500/30 to-violet-500/50 transform -skew-x-12" />

        <SlideIndicator position="top-left" />

        <div className="relative h-full flex">
          {/* Left: Content */}
          <div className="w-[55%] flex flex-col justify-center p-12">
            <div className="max-w-lg">
              <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/20 border border-violet-500/30">
                <div className="w-2 h-2 rounded-full bg-violet-400" />
                <span className="text-violet-300 text-xs font-medium uppercase tracking-wider">Stellar</span>
              </div>

              <Title className="text-4xl md:text-5xl mb-8" />

              {bulletPoints.length > 0 && (
                <div className="space-y-4">
                  {bulletPoints.map((point, i) => (
                    <div key={i} className="flex items-start gap-4 group pl-2 border-l-2 border-violet-500/30 transition-colors">
                      <EditableText
                        value={point}
                        isEditing={isEditing && editingText?.field === "bullet" && editingText?.bulletIndex === i}
                        onStartEdit={() => onStartEditing(index, "bullet", i)}
                        onChange={(val) => onUpdateContent(index, "bullet", val, i)}
                        onFinish={onFinishEditing}
                        className="flex-1 text-lg leading-relaxed pl-2"
                        style={{ fontFamily: theme.fonts.body.family, color: "#c4b5fd" }}
                        isOwner={canEdit}
                        isHovered={isHovered}
                        onDelete={() => onDeleteBullet(index, i)}
                      />
                    </div>
                  ))}
                  {canEdit && (
          <div className={`transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"} ${isHovered ? "" : "pointer-events-none"}`}>
            <button type="button" onClick={(e) => { e.stopPropagation(); onAddBullet(index) }} className="flex items-center gap-2 text-sm text-violet-400/60 hover:text-violet-400 transition-colors ml-4">
                      <Plus size={14} /> Add point
                    </button>
          </div>
        )}
                </div>
              )}
            </div>
          </div>

          {/* Right: Image */}
          {hasImage && firstImage && (
            <div className="w-[45%] flex items-center justify-center p-8">
              <div className="relative w-full max-w-md">
                <div className="absolute -inset-4 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-2xl blur-xl" />
                <div className="relative rounded-2xl overflow-hidden border border-violet-500/30" style={{ aspectRatio: "4/3" }}>
                  <SlideImg image={firstImage} alt={firstImage.alt || slide.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0612]/60 to-transparent" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // LAYOUT 36: Celestial Frame - Elegant frame with celestial decorations
  if (layout === "celestial-frame") {
    const bgImage = theme.backgroundImage;
    return (
      <div className="h-full relative overflow-hidden">
        {bgImage && (
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${bgImage})` }} />
        )}
        <div className="absolute inset-0 bg-[#0a0612]/60" />

        {/* Celestial frame corners */}
        <div className="absolute top-8 left-8 w-24 h-24 border-l-2 border-t-2 border-violet-500/40 rounded-tl-lg" />
        <div className="absolute top-8 right-8 w-24 h-24 border-r-2 border-t-2 border-violet-500/40 rounded-tr-lg" />
        <div className="absolute bottom-8 left-8 w-24 h-24 border-l-2 border-b-2 border-violet-500/40 rounded-bl-lg" />
        <div className="absolute bottom-8 right-8 w-24 h-24 border-r-2 border-b-2 border-violet-500/40 rounded-br-lg" />

        {/* Corner stars */}
        <div className="absolute top-12 left-12 w-3 h-3 bg-violet-400/80 rounded-full shadow-lg shadow-violet-500/50" />
        <div className="absolute top-12 right-12 w-2 h-2 bg-fuchsia-400/80 rounded-full shadow-lg shadow-fuchsia-500/50" />
        <div className="absolute bottom-12 left-12 w-2 h-2 bg-blue-400/80 rounded-full shadow-lg shadow-blue-500/50" />
        <div className="absolute bottom-12 right-12 w-3 h-3 bg-violet-400/80 rounded-full shadow-lg shadow-violet-500/50" />

        <SlideIndicator position="top-left" />

        <div className="relative h-full flex flex-col items-center justify-center p-16 text-center">
          {/* Decorative top element */}
          <div className="mb-8 flex items-center gap-4">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-violet-500/50" />
            <div className="w-4 h-4 rotate-45 border border-violet-500/50" />
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-violet-500/50" />
          </div>

          <Title className="text-4xl md:text-6xl mb-10 max-w-4xl" align="center" />

          {bulletPoints.length > 0 && (
            <div className="max-w-3xl w-full">
              <div className="grid grid-cols-1 gap-4">
                {bulletPoints.map((point, i) => (
                  <div key={i} className="flex items-center justify-center gap-4 group">
                    <div className="w-8 h-px bg-gradient-to-r from-transparent to-violet-500/50" />
                    <EditableText
                      value={point}
                      isEditing={isEditing && editingText?.field === "bullet" && editingText?.bulletIndex === i}
                      onStartEdit={() => onStartEditing(index, "bullet", i)}
                      onChange={(val) => onUpdateContent(index, "bullet", val, i)}
                      onFinish={onFinishEditing}
                      className="text-lg leading-relaxed"
                      style={{ fontFamily: theme.fonts.body.family, color: "#c4b5fd" }}
                      isOwner={canEdit}
                      isHovered={isHovered}
                      onDelete={() => onDeleteBullet(index, i)}
                    />
                    <div className="w-8 h-px bg-gradient-to-l from-transparent to-violet-500/50" />
                  </div>
                ))}
              </div>
              {canEdit && (
          <div className={`transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"} ${isHovered ? "" : "pointer-events-none"}`}>
            <button type="button" onClick={(e) => { e.stopPropagation(); onAddBullet(index) }} className="mt-6 flex items-center gap-2 text-sm text-violet-400/60 hover:text-violet-400 transition-colors mx-auto">
                  <Plus size={14} /> Add point
                </button>
          </div>
        )}
            </div>
          )}

          {/* Decorative bottom element */}
          <div className="mt-10 flex items-center gap-4">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-fuchsia-500/50" />
            <div className="w-2 h-2 rounded-full bg-fuchsia-400/60" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-fuchsia-500/50" />
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // ARCHITECTURAL MONOCHROME THEME LAYOUTS (37-42)
  // Bold B&W with geometric precision
  // ============================================

  // LAYOUT 37: Mono Brutalist - Bold brutalist design with stark contrast
  if (layout === "mono-brutalist") {
    const bgImage = theme.backgroundImage;
    return (
      <div className="h-full relative overflow-hidden">
        {bgImage && (
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${bgImage})` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/70" />

        {/* Bold geometric lines */}
        <div className="absolute top-0 left-0 w-full h-2 bg-white" />
        <div className="absolute bottom-0 left-0 w-full h-2 bg-white" />
        <div className="absolute top-0 left-16 w-1 h-full bg-white/20" />

        <SlideIndicator position="top-right" />

        <div className="relative h-full flex items-center p-16">
          <div className="max-w-4xl">
            {/* Bold number indicator */}
            <div className="mb-8 flex items-end gap-6">
              <span className="text-[120px] font-black leading-none text-white/10">{String(index + 1).padStart(2, "0")}</span>
              <div className="mb-4 w-32 h-1 bg-white" />
            </div>

            <Title className="text-5xl md:text-6xl font-black uppercase tracking-tight mb-8" />

            {bulletPoints.length > 0 && (
              <div className="space-y-4 border-l-4 border-white pl-6">
                {bulletPoints.map((point, i) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <span className="text-white/40 font-bold text-sm mt-1">{String(i + 1).padStart(2, "0")}</span>
                    <EditableText
                      value={point}
                      isEditing={isEditing && editingText?.field === "bullet" && editingText?.bulletIndex === i}
                      onStartEdit={() => onStartEditing(index, "bullet", i)}
                      onChange={(val) => onUpdateContent(index, "bullet", val, i)}
                      onFinish={onFinishEditing}
                      className="flex-1 text-lg leading-relaxed"
                      style={{ fontFamily: theme.fonts.body.family, color: "#a3a3a3" }}
                      isOwner={canEdit}
                      isHovered={isHovered}
                      onDelete={() => onDeleteBullet(index, i)}
                    />
                  </div>
                ))}
                {canEdit && (
          <div className={`transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"} ${isHovered ? "" : "pointer-events-none"}`}>
            <button type="button" onClick={(e) => { e.stopPropagation(); onAddBullet(index) }} className="flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors ml-8">
                    <Plus size={14} /> Add point
                  </button>
          </div>
        )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // LAYOUT 38: Geometric Slice - Diagonal slice with geometric precision
  if (layout === "geometric-slice") {
    const bgImage = theme.backgroundImage;
    const firstImage = allImages[0];
    return (
      <div className="h-full relative overflow-hidden">
        {bgImage && (
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${bgImage})` }} />
        )}

        {/* Diagonal slice overlay */}
        <div className="absolute inset-0" style={{ clipPath: "polygon(0 0, 60% 0, 40% 100%, 0 100%)" }}>
          <div className="absolute inset-0 bg-black/90" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

        {/* Diagonal accent line */}
        <div className="absolute top-0 bottom-0 left-[50%] w-px bg-white/30 transform -skew-x-12" />

        <SlideIndicator position="top-left" />

        <div className="relative h-full flex">
          <div className={`${hasImage ? "w-[55%]" : "w-full"} flex flex-col justify-center p-12`}>
            <div className="mb-6">
              <div className="inline-block px-4 py-1 border border-white/30 mb-4">
                <span className="text-white/60 text-xs font-bold uppercase tracking-[0.3em]">Section {index + 1}</span>
              </div>
            </div>

            <Title className="text-4xl md:text-5xl font-extrabold mb-8" />

            {bulletPoints.length > 0 && (
              <div className="space-y-3">
                {bulletPoints.map((point, i) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <div className="mt-2 w-4 h-px bg-white" />
                    <EditableText
                      value={point}
                      isEditing={isEditing && editingText?.field === "bullet" && editingText?.bulletIndex === i}
                      onStartEdit={() => onStartEditing(index, "bullet", i)}
                      onChange={(val) => onUpdateContent(index, "bullet", val, i)}
                      onFinish={onFinishEditing}
                      className="flex-1 text-lg leading-relaxed"
                      style={{ fontFamily: theme.fonts.body.family, color: "#a3a3a3" }}
                      isOwner={canEdit}
                      isHovered={isHovered}
                      onDelete={() => onDeleteBullet(index, i)}
                    />
                  </div>
                ))}
                {canEdit && (
          <div className={`transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"} ${isHovered ? "" : "pointer-events-none"}`}>
            <button type="button" onClick={(e) => { e.stopPropagation(); onAddBullet(index) }} className="flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors ml-8">
                    <Plus size={14} /> Add point
                  </button>
          </div>
        )}
              </div>
            )}
          </div>

          {hasImage && firstImage && (
            <div className="w-[45%] flex items-center justify-center p-8">
              <div className="relative w-full max-w-md">
                <div className="absolute -inset-2 border border-white/20" />
                <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
                  <SlideImg image={firstImage} alt={firstImage.alt || slide.title} className="w-full h-full object-cover grayscale" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // LAYOUT 39: Contrast Blocks - High contrast block layout
  if (layout === "contrast-blocks") {
    const bgImage = theme.backgroundImage;
    return (
      <div className="h-full relative overflow-hidden">
        {bgImage && (
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${bgImage})` }} />
        )}
        <div className="absolute inset-0 bg-black/70" />

        <SlideIndicator position="top-left" />

        <div className="relative h-full flex flex-col justify-center p-12">
          <div className="mb-10">
            <Title className="text-4xl md:text-5xl font-black uppercase tracking-tight text-center" align="center" />
            <SlideDescription className="mt-4 text-center" align="center" />
          </div>

          {bulletPoints.length > 0 && (
            <div className="grid grid-cols-2 gap-4 max-w-5xl mx-auto">
              {bulletPoints.map((point, i) => (
                <div key={i} className={`group relative p-6 ${i % 2 === 0 ? "bg-white text-black" : "bg-transparent border-2 border-white"}`}>
                  <div className="absolute top-2 right-2">
                    <span className={`text-xs font-black ${i % 2 === 0 ? "text-black/30" : "text-white/30"}`}>{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <EditableText
                    value={point}
                    isEditing={isEditing && editingText?.field === "bullet" && editingText?.bulletIndex === i}
                    onStartEdit={() => onStartEditing(index, "bullet", i)}
                    onChange={(val) => onUpdateContent(index, "bullet", val, i)}
                    onFinish={onFinishEditing}
                    className="text-base leading-relaxed font-medium"
                    style={{ fontFamily: theme.fonts.body.family, color: i % 2 === 0 ? "#0a0a0a" : "#ffffff" }}
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
            <button type="button" onClick={(e) => { e.stopPropagation(); onAddBullet(index) }} className="mt-6 mx-auto flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors">
              <Plus size={14} /> Add block
            </button>
          </div>
        )}
        </div>
      </div>
    );
  }

  // LAYOUT 40: Angular Frame - Sharp angular frame design
  if (layout === "angular-frame") {
    const bgImage = theme.backgroundImage;
    return (
      <div className="h-full relative overflow-hidden">
        {bgImage && (
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${bgImage})` }} />
        )}
        <div className="absolute inset-0 bg-black/65" />

        {/* Angular frame corners */}
        <div className="absolute top-8 left-8 w-32 h-32">
          <div className="absolute top-0 left-0 w-full h-1 bg-white" />
          <div className="absolute top-0 left-0 w-1 h-full bg-white" />
        </div>
        <div className="absolute top-8 right-8 w-32 h-32">
          <div className="absolute top-0 right-0 w-full h-1 bg-white" />
          <div className="absolute top-0 right-0 w-1 h-full bg-white" />
        </div>
        <div className="absolute bottom-8 left-8 w-32 h-32">
          <div className="absolute bottom-0 left-0 w-full h-1 bg-white" />
          <div className="absolute bottom-0 left-0 w-1 h-full bg-white" />
        </div>
        <div className="absolute bottom-8 right-8 w-32 h-32">
          <div className="absolute bottom-0 right-0 w-full h-1 bg-white" />
          <div className="absolute bottom-0 right-0 w-1 h-full bg-white" />
        </div>

        <SlideIndicator position="top-left" />

        <div className="relative h-full flex flex-col items-center justify-center p-20 text-center">
          <div className="mb-6 flex items-center gap-6">
            <div className="w-20 h-px bg-white" />
            <span className="text-white/50 text-xs font-bold uppercase tracking-[0.4em]">Chapter {index + 1}</span>
            <div className="w-20 h-px bg-white" />
          </div>

          <Title className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-10 max-w-4xl" align="center" />

          {bulletPoints.length > 0 && (
            <div className="max-w-2xl w-full space-y-3">
              {bulletPoints.map((point, i) => (
                <div key={i} className="flex items-center justify-center gap-4 group">
                  <div className="w-2 h-2 bg-white rotate-45" />
                  <EditableText
                    value={point}
                    isEditing={isEditing && editingText?.field === "bullet" && editingText?.bulletIndex === i}
                    onStartEdit={() => onStartEditing(index, "bullet", i)}
                    onChange={(val) => onUpdateContent(index, "bullet", val, i)}
                    onFinish={onFinishEditing}
                    className="text-lg leading-relaxed"
                    style={{ fontFamily: theme.fonts.body.family, color: "#a3a3a3" }}
                    isOwner={canEdit}
                    isHovered={isHovered}
                    onDelete={() => onDeleteBullet(index, i)}
                  />
                </div>
              ))}
              {canEdit && (
          <div className={`transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"} ${isHovered ? "" : "pointer-events-none"}`}>
            <button type="button" onClick={(e) => { e.stopPropagation(); onAddBullet(index) }} className="mt-4 flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors mx-auto">
                  <Plus size={14} /> Add point
                </button>
          </div>
        )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // LAYOUT 41: Stripe Accent - Bold stripe accent design
  if (layout === "stripe-accent") {
    const bgImage = theme.backgroundImage;
    const firstImage = allImages[0];
    return (
      <div className="h-full relative overflow-hidden">
        {bgImage && (
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${bgImage})` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/50" />

        {/* Bold stripe accents */}
        <div className="absolute top-0 left-0 w-3 h-full bg-white" />
        <div className="absolute top-0 left-6 w-1 h-full bg-white/30" />

        <SlideIndicator position="top-right" />

        <div className="relative h-full flex">
          <div className={`${hasImage ? "w-[55%]" : "w-full"} flex flex-col justify-center p-12 pl-16`}>
            <div className="mb-4">
              <span className="text-white/40 text-sm font-bold uppercase tracking-[0.3em]">0{index + 1} —</span>
            </div>

            <Title className="text-4xl md:text-5xl font-extrabold mb-8" />

            {bulletPoints.length > 0 && (
              <div className="space-y-4">
                {bulletPoints.map((point, i) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <div className="mt-2.5 w-3 h-3 border-2 border-white" />
                    <EditableText
                      value={point}
                      isEditing={isEditing && editingText?.field === "bullet" && editingText?.bulletIndex === i}
                      onStartEdit={() => onStartEditing(index, "bullet", i)}
                      onChange={(val) => onUpdateContent(index, "bullet", val, i)}
                      onFinish={onFinishEditing}
                      className="flex-1 text-lg leading-relaxed"
                      style={{ fontFamily: theme.fonts.body.family, color: "#a3a3a3" }}
                      isOwner={canEdit}
                      isHovered={isHovered}
                      onDelete={() => onDeleteBullet(index, i)}
                    />
                  </div>
                ))}
                {canEdit && (
          <div className={`transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"} ${isHovered ? "" : "pointer-events-none"}`}>
            <button type="button" onClick={(e) => { e.stopPropagation(); onAddBullet(index) }} className="flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors ml-7">
                    <Plus size={14} /> Add point
                  </button>
          </div>
        )}
              </div>
            )}
          </div>

          {hasImage && firstImage && (
            <div className="w-[45%] flex items-center justify-center p-8">
              <div className="relative w-full max-w-sm">
                <div className="absolute -top-3 -left-3 w-full h-full border-2 border-white" />
                <div className="relative overflow-hidden" style={{ aspectRatio: "3/4" }}>
                  <SlideImg image={firstImage} alt={firstImage.alt || slide.title} className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // LAYOUT 42: Bold Stack - Stacked bold typography
  if (layout === "bold-stack") {
    const bgImage = theme.backgroundImage;
    return (
      <div className="h-full relative overflow-hidden">
        {bgImage && (
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${bgImage})` }} />
        )}
        <div className="absolute inset-0 bg-black/75" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)", backgroundSize: "80px 80px" }} />

        <SlideIndicator position="top-left" />

        <div className="relative h-full flex flex-col justify-center p-12">
          <div className="max-w-5xl mx-auto w-full">
            <div className="mb-12">
              <Title className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none" />
            </div>

            {bulletPoints.length > 0 && (
              <div className="space-y-0">
                {bulletPoints.map((point, i) => (
                  <div key={i} className="group border-t border-white/20 py-4 flex items-center gap-6">
                    <span className="text-white font-black text-2xl w-12">{String(i + 1).padStart(2, "0")}</span>
                    <EditableText
                      value={point}
                      isEditing={isEditing && editingText?.field === "bullet" && editingText?.bulletIndex === i}
                      onStartEdit={() => onStartEditing(index, "bullet", i)}
                      onChange={(val) => onUpdateContent(index, "bullet", val, i)}
                      onFinish={onFinishEditing}
                      className="flex-1 text-xl leading-relaxed font-medium"
                      style={{ fontFamily: theme.fonts.body.family, color: "#d4d4d4" }}
                      isOwner={canEdit}
                      isHovered={isHovered}
                      onDelete={() => onDeleteBullet(index, i)}
                    />
                  </div>
                ))}
                <div className="border-t border-white/20" />
              </div>
            )}

            {canEdit && (
          <div className={`transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"} ${isHovered ? "" : "pointer-events-none"}`}>
            <button type="button" onClick={(e) => { e.stopPropagation(); onAddBullet(index) }} className="mt-4 flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors">
                <Plus size={14} /> Add item
              </button>
          </div>
        )}
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // ANIME DREAMSCAPE THEME LAYOUTS (43-48)
  // Soft dreamy anime aesthetic
  // ============================================

  // LAYOUT 43: Cloud Float - Soft floating cloud-like panels
  if (layout === "cloud-float") {
    const bgImage = theme.backgroundImage;
    return (
      <div className="h-full relative overflow-hidden">
        {bgImage && (
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${bgImage})` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1625]/40 via-[#251f35]/30 to-[#1a1625]/50" />

        {/* Soft floating orbs */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-48 h-48 bg-sky-400/10 rounded-full blur-3xl" />

        <SlideIndicator position="top-left" />

        <div className="relative h-full flex items-center justify-center p-12">
          {/* Floating cloud panel */}
          <div className="relative max-w-4xl w-full">
            <div className="absolute -inset-4 bg-gradient-to-r from-fuchsia-500/20 via-pink-400/15 to-sky-400/20 rounded-[2rem] blur-2xl" />

            <div className="relative bg-[#251f35]/60 backdrop-blur-xl rounded-[2rem] border border-fuchsia-500/20 p-10 shadow-2xl">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-fuchsia-500 to-pink-400 rounded-full">
                <span className="text-white text-xs font-medium uppercase tracking-wider">✦ Scene {index + 1} ✦</span>
              </div>

              <div className="mt-4">
                <Title className="text-4xl md:text-5xl mb-8 text-center" align="center" />

                {bulletPoints.length > 0 && (
                  <div className="space-y-4 mt-8">
                    {bulletPoints.map((point, i) => (
                      <div key={i} className="flex items-start gap-4 group">
                        <div className="mt-2 w-3 h-3 rounded-full bg-gradient-to-r from-fuchsia-400 to-pink-400 shadow-lg shadow-fuchsia-500/30" />
                        <EditableText
                          value={point}
                          isEditing={isEditing && editingText?.field === "bullet" && editingText?.bulletIndex === i}
                          onStartEdit={() => onStartEditing(index, "bullet", i)}
                          onChange={(val) => onUpdateContent(index, "bullet", val, i)}
                          onFinish={onFinishEditing}
                          className="flex-1 text-lg leading-relaxed"
                          style={{ fontFamily: theme.fonts.body.family, color: "#d8b4fe" }}
                          isOwner={canEdit}
                          isHovered={isHovered}
                          onDelete={() => onDeleteBullet(index, i)}
                        />
                      </div>
                    ))}
                    {canEdit && (
          <div className={`transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"} ${isHovered ? "" : "pointer-events-none"}`}>
            <button type="button" onClick={(e) => { e.stopPropagation(); onAddBullet(index) }} className="flex items-center gap-2 text-sm text-fuchsia-400/60 hover:text-fuchsia-400 transition-colors ml-7">
                        <Plus size={14} /> Add point
                      </button>
          </div>
        )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // LAYOUT 44: Sakura Cards - Soft card grid with petal-like shapes
  if (layout === "sakura-cards") {
    const bgImage = theme.backgroundImage;
    return (
      <div className="h-full relative overflow-hidden">
        {bgImage && (
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${bgImage})` }} />
        )}
        <div className="absolute inset-0 bg-[#1a1625]/50" />

        {/* Floating petals decoration */}
        <div className="absolute top-20 right-20 w-4 h-4 bg-pink-300/40 rounded-full blur-sm" />
        <div className="absolute top-32 right-32 w-3 h-3 bg-fuchsia-300/30 rounded-full blur-sm" />
        <div className="absolute bottom-24 left-24 w-3 h-3 bg-pink-300/30 rounded-full blur-sm" />

        <SlideIndicator position="top-left" />

        <div className="relative h-full flex flex-col justify-center p-12">
          <div className="mb-10">
            <Title className="text-4xl md:text-5xl text-center" align="center" />
          </div>

          {bulletPoints.length > 0 && (
            <div className="grid grid-cols-2 gap-5 max-w-5xl mx-auto">
              {bulletPoints.map((point, i) => (
                <div key={i} className="group relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-fuchsia-500/20 to-pink-400/20 rounded-2xl blur-lg opacity-0 transition-opacity" />

                  <div className="relative bg-[#251f35]/70 backdrop-blur-lg rounded-2xl border border-fuchsia-500/20 p-5 transition-all">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-fuchsia-400 to-pink-400 flex items-center justify-center shadow-lg shadow-fuchsia-500/20">
                        <span className="text-white text-sm font-medium">{i + 1}</span>
                      </div>
                      <EditableText
                        value={point}
                        isEditing={isEditing && editingText?.field === "bullet" && editingText?.bulletIndex === i}
                        onStartEdit={() => onStartEditing(index, "bullet", i)}
                        onChange={(val) => onUpdateContent(index, "bullet", val, i)}
                        onFinish={onFinishEditing}
                        className="flex-1 text-base leading-relaxed"
                        style={{ fontFamily: theme.fonts.body.family, color: "#d8b4fe" }}
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
            <button type="button" onClick={(e) => { e.stopPropagation(); onAddBullet(index) }} className="mt-6 mx-auto flex items-center gap-2 text-sm text-fuchsia-400/60 hover:text-fuchsia-400 transition-colors">
              <Plus size={14} /> Add card
            </button>
          </div>
        )}
        </div>
      </div>
    );
  }

  // LAYOUT 45: Dreamy Split - Soft split layout with gradient divider
  if (layout === "dreamy-split") {
    const bgImage = theme.backgroundImage;
    const firstImage = allImages[0];
    return (
      <div className="h-full relative overflow-hidden">
        {bgImage && (
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${bgImage})` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a1625]/80 via-[#251f35]/60 to-[#1a1625]/40" />

        {/* Soft gradient divider */}
        <div className="absolute top-0 bottom-0 left-[55%] w-1 bg-gradient-to-b from-fuchsia-500/50 via-pink-400/30 to-sky-400/50 blur-sm" />

        <SlideIndicator position="top-left" />

        <div className="relative h-full flex">
          <div className={`${hasImage ? "w-[55%]" : "w-full"} flex flex-col justify-center p-12`}>
            <div className="mb-6 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse" />
              <span className="text-fuchsia-300/70 text-xs font-medium uppercase tracking-[0.2em]">Episode {index + 1}</span>
            </div>

            <Title className="text-4xl md:text-5xl mb-8" />

            {bulletPoints.length > 0 && (
              <div className="space-y-4">
                {bulletPoints.map((point, i) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <div className="mt-2 w-6 h-px bg-gradient-to-r from-fuchsia-500 to-transparent" />
                    <EditableText
                      value={point}
                      isEditing={isEditing && editingText?.field === "bullet" && editingText?.bulletIndex === i}
                      onStartEdit={() => onStartEditing(index, "bullet", i)}
                      onChange={(val) => onUpdateContent(index, "bullet", val, i)}
                      onFinish={onFinishEditing}
                      className="flex-1 text-lg leading-relaxed"
                      style={{ fontFamily: theme.fonts.body.family, color: "#d8b4fe" }}
                      isOwner={canEdit}
                      isHovered={isHovered}
                      onDelete={() => onDeleteBullet(index, i)}
                    />
                  </div>
                ))}
                {canEdit && (
          <div className={`transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"} ${isHovered ? "" : "pointer-events-none"}`}>
            <button type="button" onClick={(e) => { e.stopPropagation(); onAddBullet(index) }} className="flex items-center gap-2 text-sm text-fuchsia-400/60 hover:text-fuchsia-400 transition-colors ml-10">
                    <Plus size={14} /> Add point
                  </button>
          </div>
        )}
              </div>
            )}
          </div>

          {hasImage && firstImage && (
            <div className="w-[45%] flex items-center justify-center p-8">
              <div className="relative w-full max-w-sm">
                <div className="absolute -inset-3 bg-gradient-to-r from-fuchsia-500/30 to-pink-400/30 rounded-3xl blur-xl" />
                <div className="relative rounded-3xl overflow-hidden border-2 border-fuchsia-500/30" style={{ aspectRatio: "3/4" }}>
                  <SlideImg image={firstImage} alt={firstImage.alt || slide.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a1625]/60 to-transparent" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // LAYOUT 46: Soft Bubble - Bubble-like content containers
  if (layout === "soft-bubble") {
    const bgImage = theme.backgroundImage;
    return (
      <div className="h-full relative overflow-hidden">
        {bgImage && (
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${bgImage})` }} />
        )}
        <div className="absolute inset-0 bg-[#1a1625]/45" />

        <SlideIndicator position="top-right" />

        <div className="relative h-full flex flex-col items-center justify-center p-12 text-center">
          {/* Main bubble */}
          <div className="relative mb-8">
            <div className="absolute -inset-6 bg-gradient-to-br from-fuchsia-500/20 via-pink-400/15 to-sky-400/20 rounded-full blur-2xl" />
            <div className="relative bg-[#251f35]/60 backdrop-blur-xl rounded-full px-12 py-8 border border-fuchsia-500/25">
              <Title className="text-3xl md:text-4xl" align="center" />
            </div>
          </div>

          {bulletPoints.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4 max-w-4xl">
              {bulletPoints.map((point, i) => (
                <div key={i} className="group">
                  <div className="relative bg-[#251f35]/50 backdrop-blur-lg rounded-full px-6 py-3 border border-fuchsia-500/20 hover:border-fuchsia-500/40 transition-all">
                    <EditableText
                      value={point}
                      isEditing={isEditing && editingText?.field === "bullet" && editingText?.bulletIndex === i}
                      onStartEdit={() => onStartEditing(index, "bullet", i)}
                      onChange={(val) => onUpdateContent(index, "bullet", val, i)}
                      onFinish={onFinishEditing}
                      className="text-base"
                      style={{ fontFamily: theme.fonts.body.family, color: "#d8b4fe" }}
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
            <button type="button" onClick={(e) => { e.stopPropagation(); onAddBullet(index) }} className="mt-6 flex items-center gap-2 text-sm text-fuchsia-400/60 hover:text-fuchsia-400 transition-colors">
              <Plus size={14} /> Add bubble
            </button>
          </div>
        )}
        </div>
      </div>
    );
  }

  // LAYOUT 47: Twilight Frame - Elegant frame with twilight colors
  if (layout === "twilight-frame") {
    const bgImage = theme.backgroundImage;
    return (
      <div className="h-full relative overflow-hidden">
        {bgImage && (
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${bgImage})` }} />
        )}
        <div className="absolute inset-0 bg-[#1a1625]/55" />

        {/* Twilight frame */}
        <div className="absolute top-8 left-8 right-8 bottom-8 border-2 border-fuchsia-500/20 rounded-3xl" />
        <div className="absolute top-12 left-12 right-12 bottom-12 border border-pink-400/15 rounded-2xl" />

        {/* Corner decorations */}
        <div className="absolute top-6 left-6 w-6 h-6 border-t-2 border-l-2 border-fuchsia-400/50 rounded-tl-xl" />
        <div className="absolute top-6 right-6 w-6 h-6 border-t-2 border-r-2 border-fuchsia-400/50 rounded-tr-xl" />
        <div className="absolute bottom-6 left-6 w-6 h-6 border-b-2 border-l-2 border-fuchsia-400/50 rounded-bl-xl" />
        <div className="absolute bottom-6 right-6 w-6 h-6 border-b-2 border-r-2 border-fuchsia-400/50 rounded-br-xl" />

        <SlideIndicator position="top-left" />

        <div className="relative h-full flex flex-col items-center justify-center p-20 text-center">
          <div className="mb-6 flex items-center gap-4">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-fuchsia-500/50" />
            <span className="text-fuchsia-300/60 text-xs font-medium">✧ {index + 1} ✧</span>
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-fuchsia-500/50" />
          </div>

          <Title className="text-4xl md:text-5xl mb-10 max-w-4xl" align="center" />

          {bulletPoints.length > 0 && (
            <div className="max-w-2xl w-full space-y-3">
              {bulletPoints.map((point, i) => (
                <div key={i} className="flex items-center justify-center gap-4 group">
                  <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-400/60" />
                  <EditableText
                    value={point}
                    isEditing={isEditing && editingText?.field === "bullet" && editingText?.bulletIndex === i}
                    onStartEdit={() => onStartEditing(index, "bullet", i)}
                    onChange={(val) => onUpdateContent(index, "bullet", val, i)}
                    onFinish={onFinishEditing}
                    className="text-lg leading-relaxed"
                    style={{ fontFamily: theme.fonts.body.family, color: "#d8b4fe" }}
                    isOwner={canEdit}
                    isHovered={isHovered}
                    onDelete={() => onDeleteBullet(index, i)}
                  />
                  <div className="w-1.5 h-1.5 rounded-full bg-pink-400/60" />
                </div>
              ))}
              {canEdit && (
          <div className={`transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"} ${isHovered ? "" : "pointer-events-none"}`}>
            <button type="button" onClick={(e) => { e.stopPropagation(); onAddBullet(index) }} className="mt-4 flex items-center gap-2 text-sm text-fuchsia-400/60 hover:text-fuchsia-400 transition-colors mx-auto">
                  <Plus size={14} /> Add point
                </button>
          </div>
        )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // LAYOUT 48: Pastel Stack - Soft pastel stacked layout
  if (layout === "pastel-stack") {
    const bgImage = theme.backgroundImage;
    return (
      <div className="h-full relative overflow-hidden">
        {bgImage && (
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${bgImage})` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1625]/50 via-[#251f35]/40 to-[#1a1625]/60" />

        <SlideIndicator position="top-left" />

        <div className="relative h-full flex flex-col justify-center p-12">
          <div className="max-w-4xl mx-auto w-full">
            <div className="mb-10 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-fuchsia-500/20 border border-fuchsia-500/30 mb-4">
                <span className="text-fuchsia-300 text-xs font-medium">Chapter {index + 1}</span>
              </div>
              <Title className="text-4xl md:text-5xl" align="center" />
            </div>

            {bulletPoints.length > 0 && (
              <div className="space-y-3">
                {bulletPoints.map((point, i) => (
                  <div key={i} className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/10 to-pink-400/10 rounded-xl opacity-0 transition-opacity" />
                    <div className="relative flex items-center gap-4 p-4 rounded-xl border border-fuchsia-500/15 hover:border-fuchsia-500/30 transition-colors">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500/30 to-pink-400/30 flex items-center justify-center">
                        <span className="text-fuchsia-200 font-medium">{i + 1}</span>
                      </div>
                      <EditableText
                        value={point}
                        isEditing={isEditing && editingText?.field === "bullet" && editingText?.bulletIndex === i}
                        onStartEdit={() => onStartEditing(index, "bullet", i)}
                        onChange={(val) => onUpdateContent(index, "bullet", val, i)}
                        onFinish={onFinishEditing}
                        className="flex-1 text-lg leading-relaxed"
                        style={{ fontFamily: theme.fonts.body.family, color: "#d8b4fe" }}
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
            <button type="button" onClick={(e) => { e.stopPropagation(); onAddBullet(index) }} className="mt-4 flex items-center gap-2 text-sm text-fuchsia-400/60 hover:text-fuchsia-400 transition-colors mx-auto">
                <Plus size={14} /> Add item
              </button>
          </div>
        )}
          </div>
        </div>
      </div>
    );
  }

  // LAYOUT 49: Terminal Window - Hacker terminal with window chrome
  if (layout === "terminal-window") {
    const bgImage = theme.backgroundImage;
    return (
      <div className="h-full relative overflow-hidden">
        {bgImage && (
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${bgImage})` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d0d0d]/85 via-[#141414]/70 to-[#0d0d0d]/80" />

        {/* Scanlines */}
        <div className="absolute inset-0 opacity-5 pointer-events-none hidden sm:block" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 65, 0.1) 2px, rgba(0, 255, 65, 0.1) 4px)" }} />

        {/* Terminal window */}
        <div className="absolute top-2 left-2 right-2 bottom-2 sm:top-4 sm:left-4 sm:right-4 sm:bottom-4 md:top-8 md:left-8 md:right-8 md:bottom-8 border border-[#00ff41]/40 rounded-lg overflow-hidden bg-[#0d0d0d]/60 backdrop-blur-sm">
          {/* Terminal header */}
          <div className="h-7 sm:h-8 md:h-10 bg-[#141414] border-b border-[#00ff41]/30 flex items-center px-2 sm:px-3 md:px-4 gap-2 sm:gap-3">
            <div className="flex gap-1 sm:gap-2">
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full bg-[#ff0040]" />
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full bg-[#ffff00]" />
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full bg-[#00ff41]" />
            </div>
            <span className="ml-2 sm:ml-3 md:ml-4 text-[#00ff41]/70 text-[10px] sm:text-xs font-mono truncate">root@kali:~# ./presentation --slide {index + 1}</span>
          </div>

          <div className="p-3 sm:p-5 md:p-8 h-[calc(100%-1.75rem)] sm:h-[calc(100%-2rem)] md:h-[calc(100%-2.5rem)] flex flex-col justify-center overflow-visible">
            <div className="mb-3 sm:mb-4 md:mb-6">
              <span className="text-[#00ff41]/60 font-mono text-[10px] sm:text-xs md:text-sm">$ cat slide_{index + 1}.txt</span>
            </div>
            <Title className="text-lg sm:text-2xl md:text-4xl lg:text-5xl mb-4 sm:mb-6 md:mb-8" align="left" />

            {bulletPoints.length > 0 && (
              <div className="space-y-2 sm:space-y-3 mt-2 sm:mt-3 md:mt-4">
                {bulletPoints.map((point, i) => (
                  <div key={i} className="flex items-start gap-2 sm:gap-3 group">
                    <span className="text-[#00ff41]/60 font-mono text-[10px] sm:text-xs md:text-sm mt-0.5 sm:mt-1">[{i}]</span>
                    <EditableText
                      value={point}
                      isEditing={isEditing && editingText?.field === "bullet" && editingText?.bulletIndex === i}
                      onStartEdit={() => onStartEditing(index, "bullet", i)}
                      onChange={(val) => onUpdateContent(index, "bullet", val, i)}
                      onFinish={onFinishEditing}
                      className="flex-1 text-sm sm:text-base md:text-lg leading-relaxed font-mono"
                      style={{ fontFamily: theme.fonts.body.family, color: "#39ff14" }}
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
            <button type="button" onClick={(e) => { e.stopPropagation(); onAddBullet(index) }} className="mt-3 sm:mt-4 flex items-center gap-2 text-xs sm:text-sm text-[#00ff41]/60 hover:text-[#00ff41] transition-colors">
                <Plus size={12} className="sm:w-[14px] sm:h-[14px]" /> Add entry
              </button>
          </div>
        )}

            <div className="mt-4 sm:mt-6 md:mt-8 flex items-center gap-2">
              <span className="text-[#00ff41]/60 font-mono text-xs sm:text-sm">$</span>
              <div className="w-2 h-4 sm:w-3 sm:h-5 bg-[#00ff41] animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // LAYOUT 50: Matrix Cards - Hacker cards with matrix rain effect
  if (layout === "matrix-cards") {
    const bgImage = theme.backgroundImage;
    return (
      <div className="h-full relative overflow-hidden">
        {bgImage && (
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${bgImage})` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0d]/80 via-[#141414]/60 to-[#0d0d0d]/85" />

        {/* Matrix rain columns */}
        <div className="absolute inset-0 overflow-hidden opacity-15 pointer-events-none hidden sm:block">
          {[10, 20, 30, 45, 55, 70, 80, 90].map((left, idx) => (
            <div key={idx} className="absolute top-0 w-px bg-gradient-to-b from-[#00ff41] via-[#00ff41]/50 to-transparent" style={{ left: `${left}%`, height: `${30 + idx * 8}%` }} />
          ))}
        </div>

        <SlideIndicator position="top-left" />

        <div className="relative h-full flex flex-col justify-center p-4 sm:p-8 md:p-12 pt-12 sm:pt-8 md:pt-12 overflow-visible">
          <div className="mb-4 sm:mb-6 md:mb-8">
            <span className="text-[#00ff41]/50 font-mono text-[10px] sm:text-xs uppercase tracking-widest">// System Output</span>
            <Title className="text-xl sm:text-3xl md:text-4xl lg:text-5xl mt-1 sm:mt-2" align="left" />
          </div>

          {bulletPoints.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
              {bulletPoints.map((point, i) => (
                <div key={i} className="group relative">
                  <div className="absolute inset-0 bg-[#00ff41]/5 rounded-lg opacity-0 transition-opacity" />
                  <div className="relative p-3 sm:p-4 md:p-5 rounded-lg border border-[#00ff41]/30 bg-[#0d0d0d]/70 backdrop-blur-sm hover:border-[#00ff41]/50 transition-colors">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded border border-[#00ff41]/40 flex items-center justify-center bg-[#00ff41]/10">
                        <span className="text-[#00ff41] font-mono text-xs sm:text-sm font-bold">{String(i).padStart(2, "0")}</span>
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
            <button type="button" onClick={(e) => { e.stopPropagation(); onAddBullet(index) }} className="mt-4 sm:mt-6 flex items-center gap-2 text-xs sm:text-sm text-[#00ff41]/60 hover:text-[#00ff41] transition-colors">
              <Plus size={12} className="sm:w-[14px] sm:h-[14px]" /> Add module
            </button>
          </div>
        )}
        </div>
      </div>
    );
  }

  // LAYOUT 51: Code Block - Syntax highlighted code style
  if (layout === "code-block") {
    const bgImage = theme.backgroundImage;
    return (
      <div className="h-full relative overflow-hidden">
        {bgImage && (
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${bgImage})` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d0d0d]/85 via-[#141414]/75 to-[#0d0d0d]/80" />

        <SlideIndicator position="top-left" />

        <div className="relative h-full flex items-center p-3 sm:p-6 md:p-12 pt-10 sm:pt-6 md:pt-12 overflow-visible">
          <div className="w-full max-w-5xl mx-auto">
            {/* Code editor style container */}
            <div className="rounded-lg sm:rounded-xl border border-[#00ff41]/30 bg-[#0d0d0d]/80 backdrop-blur-sm overflow-hidden">
              {/* Editor tabs */}
              <div className="flex items-center gap-1 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-[#141414] border-b border-[#00ff41]/20">
                <div className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-t bg-[#0d0d0d] border border-[#00ff41]/30 border-b-0">
                  <span className="text-[#00ff41] text-[10px] sm:text-xs font-mono">slide_{index + 1}.md</span>
                </div>
                <div className="px-2 sm:px-3 py-0.5 sm:py-1 text-[#00ff41]/40 text-[10px] sm:text-xs font-mono hidden sm:block">config.yml</div>
              </div>

              {/* Line numbers + content */}
              <div className="flex">
                <div className="py-3 sm:py-4 md:py-6 px-2 sm:px-3 md:px-4 border-r border-[#00ff41]/20 bg-[#0a0a0a]/50 hidden sm:block">
                  <div className="text-[#00ff41]/30 font-mono text-xs sm:text-sm space-y-1">
                    {Array.from({ length: Math.max(bulletPoints.length + 3, 6) }, (_, i) => (
                      <div key={i}>{String(i + 1).padStart(2, " ")}</div>
                    ))}
                  </div>
                </div>

                <div className="flex-1 py-3 sm:py-4 md:py-6 px-3 sm:px-4 md:px-6">
                  <div className="mb-2 sm:mb-3 md:mb-4">
                    <span className="text-[#ff0040] font-mono"># </span>
                    <Title className="text-lg sm:text-2xl md:text-3xl lg:text-4xl inline" align="left" />
                  </div>
                  <div className="text-[#00ff41]/50 font-mono text-xs sm:text-sm mb-2 sm:mb-3 md:mb-4">---</div>

                  {bulletPoints.length > 0 && (
                    <div className="space-y-1.5 sm:space-y-2">
                      {bulletPoints.map((point, i) => (
                        <div key={i} className="flex items-start gap-2 sm:gap-3">
                          <span className="text-[#00d4ff] font-mono">-</span>
                          <EditableText
                            value={point}
                            isEditing={isEditing && editingText?.field === "bullet" && editingText?.bulletIndex === i}
                            onStartEdit={() => onStartEditing(index, "bullet", i)}
                            onChange={(val) => onUpdateContent(index, "bullet", val, i)}
                            onFinish={onFinishEditing}
                            className="flex-1 text-sm sm:text-base leading-relaxed"
                            style={{ fontFamily: theme.fonts.body.family, color: "#39ff14" }}
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
            <button type="button" onClick={(e) => { e.stopPropagation(); onAddBullet(index) }} className="mt-3 sm:mt-4 flex items-center gap-2 text-xs sm:text-sm text-[#00ff41]/60 hover:text-[#00ff41] transition-colors">
                      <Plus size={12} className="sm:w-[14px] sm:h-[14px]" /> Add line
                    </button>
          </div>
        )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // LAYOUT 52: Shell Prompt - Command line interface style
  if (layout === "shell-prompt") {
    const bgImage = theme.backgroundImage;
    return (
      <div className="h-full relative overflow-hidden">
        {bgImage && (
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${bgImage})` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0d]/80 via-[#141414]/65 to-[#0d0d0d]/85" />

        {/* CRT scanline effect */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none hidden sm:block" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0, 255, 65, 0.5) 1px, rgba(0, 255, 65, 0.5) 2px)" }} />

        <SlideIndicator position="top-left" />

        <div className="relative h-full flex flex-col justify-center p-4 sm:p-8 md:p-12 pt-12 sm:pt-8 md:pt-12 overflow-visible">
          <div className="max-w-4xl">
            {/* Command prompt header */}
            <div className="mb-3 sm:mb-4 md:mb-6 flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm md:text-base">
              <span className="text-[#00ff41] font-mono font-bold">root@kali</span>
              <span className="text-white font-mono">:</span>
              <span className="text-[#00d4ff] font-mono">~/slides</span>
              <span className="text-white font-mono">$</span>
              <span className="text-[#39ff14] font-mono ml-1 sm:ml-2">cat README.md</span>
            </div>

            <div className="pl-2 sm:pl-3 md:pl-4 border-l-2 border-[#00ff41]/40">
              <Title className="text-xl sm:text-3xl md:text-4xl lg:text-5xl mb-3 sm:mb-4 md:mb-6" align="left" />

              {bulletPoints.length > 0 && (
                <div className="space-y-2 sm:space-y-3 md:space-y-4 mt-3 sm:mt-4 md:mt-6">
                  {bulletPoints.map((point, i) => (
                    <div key={i} className="flex items-start gap-2 sm:gap-3 md:gap-4">
                      <span className="text-[#ffff00] font-mono text-xs sm:text-sm mt-0.5 sm:mt-1">→</span>
                      <EditableText
                        value={point}
                        isEditing={isEditing && editingText?.field === "bullet" && editingText?.bulletIndex === i}
                        onStartEdit={() => onStartEditing(index, "bullet", i)}
                        onChange={(val) => onUpdateContent(index, "bullet", val, i)}
                        onFinish={onFinishEditing}
                        className="flex-1 text-sm sm:text-base md:text-lg leading-relaxed"
                        style={{ fontFamily: theme.fonts.body.family, color: "#39ff14" }}
                        isOwner={canEdit}
                        isHovered={isHovered}
                        onDelete={() => onDeleteBullet(index, i)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {canEdit && (
          <div className={`transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"} ${isHovered ? "" : "pointer-events-none"}`}>
            <button type="button" onClick={(e) => { e.stopPropagation(); onAddBullet(index) }} className="mt-4 sm:mt-6 ml-2 sm:ml-3 md:ml-4 flex items-center gap-2 text-xs sm:text-sm text-[#00ff41]/60 hover:text-[#00ff41] transition-colors">
                <Plus size={12} className="sm:w-[14px] sm:h-[14px]" /> Add command
              </button>
          </div>
        )}

            {/* Blinking cursor */}
            <div className="mt-4 sm:mt-6 md:mt-8 flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm md:text-base">
              <span className="text-[#00ff41] font-mono font-bold">root@kali</span>
              <span className="text-white font-mono">:</span>
              <span className="text-[#00d4ff] font-mono">~/slides</span>
              <span className="text-white font-mono">$</span>
              <div className="w-2 h-4 sm:w-3 sm:h-5 bg-[#00ff41] animate-pulse ml-1 sm:ml-2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // LAYOUT 53: Cyber Grid - Futuristic grid with neon accents
  if (layout === "cyber-grid") {
    const bgImage = theme.backgroundImage;
    return (
      <div className="h-full relative overflow-hidden">
        {bgImage && (
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${bgImage})` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d0d0d]/85 via-[#141414]/70 to-[#0d0d0d]/80" />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none hidden sm:block" style={{ backgroundImage: "linear-gradient(to right, #00ff41 1px, transparent 1px), linear-gradient(to bottom, #00ff41 1px, transparent 1px)", backgroundSize: "50px 50px" }} />

        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 hidden sm:block">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00ff41] to-transparent" />
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#00ff41] to-transparent" />
        </div>
        <div className="absolute bottom-0 right-0 w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 hidden sm:block">
          <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-l from-[#00ff41] to-transparent" />
          <div className="absolute bottom-0 right-0 w-1 h-full bg-gradient-to-t from-[#00ff41] to-transparent" />
        </div>

        <SlideIndicator position="top-left" />

        <div className="relative h-full flex items-center p-4 sm:p-8 md:p-12 pt-12 sm:pt-8 md:pt-12 overflow-visible">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 w-full max-w-6xl mx-auto">
            {/* Left: Title */}
            <div className="flex flex-col justify-center">
              <div className="mb-2 sm:mb-3 md:mb-4 flex items-center gap-2 sm:gap-3">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-[#00ff41] animate-pulse" />
                <span className="text-[#00ff41]/60 font-mono text-[10px] sm:text-xs uppercase tracking-widest">Active Node</span>
              </div>
              <Title className="text-xl sm:text-3xl md:text-4xl lg:text-5xl" align="left" />

              {hasImage && (
                <div className="mt-4 sm:mt-6 md:mt-8 hidden sm:block">
                  <ImageBlock size="medium" />
                </div>
              )}
            </div>

            {/* Right: Content grid */}
            <div className="space-y-2 sm:space-y-3 md:space-y-4">
              {bulletPoints.length > 0 && bulletPoints.map((point, i) => (
                <div key={i} className="group relative">
                  <div className="absolute -left-2 sm:-left-3 md:-left-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 sm:w-2 sm:h-2 border border-[#00ff41]/50 rotate-45 transition-colors hidden sm:block" />
                  <div className="p-3 sm:p-4 border border-[#00ff41]/25 bg-[#0d0d0d]/60 backdrop-blur-sm hover:border-[#00ff41]/50 transition-colors">
                    <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
                      <span className="text-[#00d4ff] font-mono text-[10px] sm:text-xs">NODE_{String(i).padStart(2, "0")}</span>
                      <div className="flex-1 h-px bg-gradient-to-r from-[#00ff41]/30 to-transparent" />
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

              {canEdit && (
          <div className={`transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"} ${isHovered ? "" : "pointer-events-none"}`}>
            <button type="button" onClick={(e) => { e.stopPropagation(); onAddBullet(index) }} className="flex items-center gap-2 text-xs sm:text-sm text-[#00ff41]/60 hover:text-[#00ff41] transition-colors">
                  <Plus size={12} className="sm:w-[14px] sm:h-[14px]" /> Add node
                </button>
          </div>
        )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // LAYOUT 54: Hack Split - Split layout with hacker aesthetics
  if (layout === "hack-split") {
    const bgImage = theme.backgroundImage;
    return (
      <div className="h-full relative overflow-hidden">
        {bgImage && (
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${bgImage})` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d0d]/90 via-[#141414]/70 to-[#0d0d0d]/60" />

        {/* Diagonal accent line */}
        <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-[#00ff41]/50 via-[#00ff41]/20 to-[#00ff41]/50 transform -skew-x-12 hidden sm:block" />

        <SlideIndicator position="top-left" />

        <div className="relative h-full flex flex-col sm:flex-row pb-8 sm:pb-0">
          {/* Left side - Content */}
          <div className="w-full sm:w-1/2 flex flex-col justify-center p-4 sm:p-8 md:p-12 pt-12 sm:pt-8 md:pt-12 sm:pr-8 md:pr-16 overflow-visible">
            <div className="mb-3 sm:mb-4 md:mb-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 md:mb-4">
                <div className="px-2 sm:px-3 py-0.5 sm:py-1 border border-[#00ff41]/40 bg-[#00ff41]/10 rounded">
                  <span className="text-[#00ff41] font-mono text-[10px] sm:text-xs">ENCRYPTED</span>
                </div>
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#00ff41] animate-pulse" />
              </div>
              <Title className="text-xl sm:text-3xl md:text-4xl lg:text-5xl" align="left" />
            </div>

            {bulletPoints.length > 0 && (
              <div className="space-y-2 sm:space-y-3 md:space-y-4">
                {bulletPoints.map((point, i) => (
                  <div key={i} className="flex items-start gap-2 sm:gap-3 md:gap-4 group">
                    <div className="mt-0.5 sm:mt-1 flex items-center gap-1 sm:gap-2 shrink-0">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 border border-[#00ff41]/40 flex items-center justify-center bg-[#00ff41]/5 transition-colors">
                        <span className="text-[#00ff41] font-mono text-[10px] sm:text-xs">{i + 1}</span>
                      </div>
                      <div className="w-2 sm:w-3 md:w-4 h-px bg-[#00ff41]/40" />
                    </div>
                    <EditableText
                      value={point}
                      isEditing={isEditing && editingText?.field === "bullet" && editingText?.bulletIndex === i}
                      onStartEdit={() => onStartEditing(index, "bullet", i)}
                      onChange={(val) => onUpdateContent(index, "bullet", val, i)}
                      onFinish={onFinishEditing}
                      className="flex-1 text-sm sm:text-base md:text-lg leading-relaxed"
                      style={{ fontFamily: theme.fonts.body.family, color: "#39ff14" }}
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
            <button type="button" onClick={(e) => { e.stopPropagation(); onAddBullet(index) }} className="mt-4 sm:mt-6 flex items-center gap-2 text-xs sm:text-sm text-[#00ff41]/60 hover:text-[#00ff41] transition-colors">
                <Plus size={12} className="sm:w-[14px] sm:h-[14px]" /> Add data
              </button>
          </div>
        )}
          </div>

          {/* Right side - Image or decorative (hidden on mobile) */}
          <div className="hidden sm:flex w-1/2 items-center justify-center p-4 sm:p-8 md:p-12 sm:pl-8 md:pl-16">
            {hasImage ? (
              <div className="relative w-full h-full max-h-[80%]">
                <div className="absolute inset-0 border border-[#00ff41]/30 rounded-lg overflow-hidden">
                  <ImageBlock className="w-full h-full" size="large" />
                  <div className="absolute top-2 sm:top-4 left-2 sm:left-4 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-[#0d0d0d]/80 border border-[#00ff41]/30 rounded">
                    <span className="text-[#00ff41] font-mono text-[10px] sm:text-xs">IMG_LOADED</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-[60%] border border-[#00ff41]/20 rounded-lg flex items-center justify-center bg-[#0d0d0d]/40">
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-4 border-2 border-[#00ff41]/30 rounded-lg flex items-center justify-center">
                    <ImageIcon size={24} className="sm:w-8 sm:h-8 text-[#00ff41]/40" />
                  </div>
                  <span className="text-[#00ff41]/40 font-mono text-xs sm:text-sm">NO_DATA</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom status bar */}
        <div className="absolute bottom-0 left-0 right-0 h-6 sm:h-8 bg-[#0d0d0d]/80 border-t border-[#00ff41]/30 flex items-center px-3 sm:px-6 justify-between">
          <span className="text-[#00ff41]/50 font-mono text-[10px] sm:text-xs">STATUS: ACTIVE</span>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-[#00ff41]/50 font-mono text-[10px] sm:text-xs">SLIDE {index + 1}/{totalSlides}</span>
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#00ff41] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return null;
}
