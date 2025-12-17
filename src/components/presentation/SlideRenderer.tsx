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

type LayoutVariant = "left-content" | "right-content" | "centered" | "split-diagonal" | "image-focus" | "minimal-left" | "cards-grid" | "quote-style" | "timeline" | "diagonal-cut" | "circle-focus" | "wave-layout" | "hexagon-frame" | "glass-cards" | "aurora-glow" | "diamond-frame" | "ember-cards" | "molten-split" | "arch-frame" | "botanical-cards" | "elegant-split" | "glitch-frame" | "neon-grid" | "holo-cards" | "scan-frame" | "bio-cards" | "transmission-split" | "clean-frame" | "pro-cards" | "executive-split" | "nebula-float" | "orbital-rings" | "starfield-cards" | "cosmic-portal" | "galaxy-split" | "celestial-frame" | "mono-brutalist" | "geometric-slice" | "contrast-blocks" | "angular-frame" | "stripe-accent" | "bold-stack" | "cloud-float" | "sakura-cards" | "dreamy-split" | "soft-bubble" | "twilight-frame" | "pastel-stack" | "terminal-window" | "matrix-cards" | "code-block" | "shell-prompt" | "cyber-grid" | "hack-split";

// Theme type detection
type ThemeType = "dark" | "light" | "sunset" | "ocean" | "aurora" | "ember" | "midnight" | "cyber" | "alien" | "corporate" | "cosmic" | "architectural" | "anime" | "hacker";
function getThemeType(theme: Theme): ThemeType {
  if (theme.id === "elegant-noir") return "dark";
  if (theme.id === "arctic-frost") return "light";
  if (theme.id === "sunset-gradient") return "sunset";
  if (theme.id === "ocean-depths") return "ocean";
  if (theme.id === "aurora-borealis") return "aurora";
  if (theme.id === "ember-forge") return "ember";
  if (theme.id === "midnight-garden") return "midnight";
  if (theme.id === "cyber-neon") return "cyber";
  if (theme.id === "alien-tech") return "alien";
  if (theme.id === "corporate-clean") return "corporate";
  if (theme.id === "cosmic-voyage") return "cosmic";
  if (theme.id === "architectural-mono") return "architectural";
  if (theme.id === "anime-dreamscape") return "anime";
  if (theme.id === "hacker-terminal") return "hacker";
  return "dark";
}

// Different layout sequences per theme for variety
function getLayoutVariant(index: number, themeType: ThemeType, slideLayout?: string): LayoutVariant {
  // If slide has a specific layout set, map it to our layout variants
  if (slideLayout) {
    const layoutMap: Record<string, LayoutVariant> = {
      // From slide-layouts.ts LayoutType
      "title-center": "centered",
      "title-left": "left-content",
      "content-left-image-right": "left-content",
      "content-right-image-left": "right-content",
      "content-grid-2": "cards-grid",
      "content-grid-3": "cards-grid",
      "content-grid-4": "cards-grid",
      "content-cards-2": "cards-grid",
      "content-cards-3": "cards-grid",
      "content-full-image": "image-focus",
      "content-split-diagonal": "split-diagonal",
      "content-timeline": "timeline",
      "content-comparison": "cards-grid",
      "content-quote": "quote-style",
      "content-stats": "cards-grid",
      "content-centered-image": "centered",
      "content-feature-showcase": "image-focus",
      // Direct mappings for internal layout variants
      "left-content": "left-content",
      "right-content": "right-content",
      "centered": "centered",
      "split-diagonal": "split-diagonal",
      "image-focus": "image-focus",
      "minimal-left": "minimal-left",
      "cards-grid": "cards-grid",
      "quote-style": "quote-style",
      "timeline": "timeline",
      "diagonal-cut": "diagonal-cut",
      "circle-focus": "circle-focus",
      "wave-layout": "wave-layout",
      "hexagon-frame": "hexagon-frame",
      "glass-cards": "glass-cards",
      "aurora-glow": "aurora-glow",
      "diamond-frame": "diamond-frame",
      "ember-cards": "ember-cards",
      "molten-split": "molten-split",
      "arch-frame": "arch-frame",
      "botanical-cards": "botanical-cards",
      "elegant-split": "elegant-split",
      "glitch-frame": "glitch-frame",
      "neon-grid": "neon-grid",
      "holo-cards": "holo-cards",
      "scan-frame": "scan-frame",
      "bio-cards": "bio-cards",
      "transmission-split": "transmission-split",
      "clean-frame": "clean-frame",
      "pro-cards": "pro-cards",
      "executive-split": "executive-split",
      // Cosmic theme layouts
      "nebula-float": "nebula-float",
      "orbital-rings": "orbital-rings",
      "starfield-cards": "starfield-cards",
      "cosmic-portal": "cosmic-portal",
      "galaxy-split": "galaxy-split",
      "celestial-frame": "celestial-frame",
      // Architectural theme layouts
      "mono-brutalist": "mono-brutalist",
      "geometric-slice": "geometric-slice",
      "contrast-blocks": "contrast-blocks",
      "angular-frame": "angular-frame",
      "stripe-accent": "stripe-accent",
      "bold-stack": "bold-stack",
      // Anime theme layouts
      "cloud-float": "cloud-float",
      "sakura-cards": "sakura-cards",
      "dreamy-split": "dreamy-split",
      "soft-bubble": "soft-bubble",
      "twilight-frame": "twilight-frame",
      "pastel-stack": "pastel-stack",
      // Hacker theme layouts
      "terminal-window": "terminal-window",
      "matrix-cards": "matrix-cards",
      "code-block": "code-block",
      "shell-prompt": "shell-prompt",
      "cyber-grid": "cyber-grid",
      "hack-split": "hack-split",
    };
    const mappedLayout = layoutMap[slideLayout];
    if (mappedLayout) return mappedLayout;
  }
  
  // Default: cycle through theme-specific layouts
  const layoutsByTheme: Record<ThemeType, LayoutVariant[]> = {
    dark: ["left-content", "image-focus", "right-content", "split-diagonal", "minimal-left", "centered"],
    light: ["centered", "left-content", "cards-grid", "right-content", "quote-style", "minimal-left"],
    sunset: ["image-focus", "split-diagonal", "timeline", "left-content", "centered", "right-content"],
    ocean: ["diagonal-cut", "circle-focus", "wave-layout", "left-content", "cards-grid", "centered"],
    aurora: ["hexagon-frame", "glass-cards", "aurora-glow", "left-content", "centered", "image-focus"],
    ember: ["diamond-frame", "ember-cards", "molten-split", "left-content", "image-focus", "centered"],
    midnight: ["arch-frame", "botanical-cards", "elegant-split", "left-content", "quote-style", "centered"],
    cyber: ["glitch-frame", "neon-grid", "holo-cards", "left-content", "cards-grid", "image-focus"],
    alien: ["scan-frame", "bio-cards", "transmission-split", "left-content", "image-focus", "centered"],
    corporate: ["clean-frame", "pro-cards", "executive-split", "left-content", "centered", "cards-grid"],
    cosmic: ["nebula-float", "orbital-rings", "starfield-cards", "cosmic-portal", "galaxy-split", "celestial-frame"],
    architectural: ["mono-brutalist", "geometric-slice", "contrast-blocks", "angular-frame", "stripe-accent", "bold-stack"],
    anime: ["cloud-float", "sakura-cards", "dreamy-split", "soft-bubble", "twilight-frame", "pastel-stack"],
    hacker: ["terminal-window", "matrix-cards", "code-block", "shell-prompt", "cyber-grid", "hack-split"],
  };
  const layouts = layoutsByTheme[themeType];
  return layouts[index % layouts.length]!;
}

// Helper to get all images from a slide (combines legacy image with images array)
function getSlideImages(slide: SlideData) {
  const images = [...(slide.images || [])];
  // Include legacy single image if it exists and isn't already in images array
  if (slide.image?.url && slide.image.source !== "placeholder" && !images.some(img => img.url === slide.image?.url)) {
    images.unshift(slide.image);
  }
  return images.filter(img => img.url && img.source !== "placeholder");
}

export default function SlideRenderer({
  slide, index, totalSlides, theme, isOwner, isFullscreen, isHovered, isEditing,
  editingText, onStartEditing, onUpdateContent, onFinishEditing, onAddBullet, onDeleteBullet,
}: SlideRendererProps) {
  const allImages = getSlideImages(slide);
  const hasImage = allImages.length > 0;
  const hasMultipleImages = allImages.length > 1;
  const bulletPoints = slide.bulletPoints || [];
  const canEdit = isOwner && !isFullscreen;
  const themeType = getThemeType(theme);
  const layout = getLayoutVariant(index, themeType, slide.layout);

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
    ocean: {
      bg: "from-[#0a1628] via-[#0d1f35] to-[#122a45]",
      bgSolid: "bg-[#0a1628]",
      orb1: "bg-teal-500/12",
      orb2: "bg-cyan-500/10",
      orb1Strong: "bg-teal-500/20",
      orb2Strong: "bg-cyan-500/15",
      accentMuted: "bg-teal-500/80",
      accentLine: "from-teal-400",
      accentBorder: "from-teal-500/30 via-transparent to-cyan-500/25",
      accentGlow: "from-teal-500/40 to-cyan-500/35",
      border: "border-[#1e3a5f]",
      borderLine: "via-[#1e3a5f]",
      surface: "bg-[#122a45]",
      surfaceAlt: "bg-[#0d1f35]/80",
      overlay: "from-[#0a1628]/50",
      cardBg: "bg-[#122a45]/80 border-teal-500/20",
      indicatorMuted: "text-cyan-400/50",
      hoverAccent: "hover:text-teal-400",
      imgOverlay: "bg-gradient-to-r from-[#0a1628] via-[#0a1628]/80 to-transparent",
      fullOverlay: "bg-gradient-to-t from-[#0a1628] via-[#0a1628]/70 to-[#0a1628]/30",
      sideOverlay: "bg-gradient-to-r from-[#0a1628]/90 via-transparent to-transparent",
      topOverlay: "bg-gradient-to-b from-[#0a1628]/60 to-transparent",
    },
    aurora: {
      bg: "from-[#0f0a1a] via-[#1a1030] to-[#150d24]",
      bgSolid: "bg-[#0f0a1a]",
      orb1: "bg-purple-500/15",
      orb2: "bg-green-500/12",
      orb1Strong: "bg-purple-500/25",
      orb2Strong: "bg-green-500/20",
      accentMuted: "bg-purple-500/80",
      accentLine: "from-purple-400",
      accentBorder: "from-purple-500/35 via-transparent to-green-500/30",
      accentGlow: "from-purple-500/45 to-green-500/40",
      border: "border-[#2d1f4a]",
      borderLine: "via-[#2d1f4a]",
      surface: "bg-[#1a1030]",
      surfaceAlt: "bg-[#150d24]/80",
      overlay: "from-[#0f0a1a]/50",
      cardBg: "bg-[#1a1030]/80 border-purple-500/25",
      indicatorMuted: "text-purple-400/50",
      hoverAccent: "hover:text-purple-400",
      imgOverlay: "bg-gradient-to-r from-[#0f0a1a] via-[#0f0a1a]/80 to-transparent",
      fullOverlay: "bg-gradient-to-t from-[#0f0a1a] via-[#0f0a1a]/70 to-[#0f0a1a]/30",
      sideOverlay: "bg-gradient-to-r from-[#0f0a1a]/90 via-transparent to-transparent",
      topOverlay: "bg-gradient-to-b from-[#0f0a1a]/60 to-transparent",
    },
    ember: {
      bg: "from-[#1a0a0a] via-[#2a1010] to-[#3a1515]",
      bgSolid: "bg-[#1a0a0a]",
      orb1: "bg-red-500/18",
      orb2: "bg-orange-500/15",
      orb1Strong: "bg-red-500/28",
      orb2Strong: "bg-orange-500/22",
      accentMuted: "bg-red-500/80",
      accentLine: "from-red-500",
      accentBorder: "from-red-500/40 via-transparent to-orange-500/35",
      accentGlow: "from-red-500/50 to-orange-500/45",
      border: "border-[#7f1d1d]",
      borderLine: "via-[#7f1d1d]",
      surface: "bg-[#3a1515]",
      surfaceAlt: "bg-[#2a1010]/80",
      overlay: "from-[#1a0a0a]/50",
      cardBg: "bg-[#3a1515]/80 border-red-500/30",
      indicatorMuted: "text-red-400/50",
      hoverAccent: "hover:text-red-400",
      imgOverlay: "bg-gradient-to-r from-[#1a0a0a] via-[#1a0a0a]/80 to-transparent",
      fullOverlay: "bg-gradient-to-t from-[#1a0a0a] via-[#1a0a0a]/70 to-[#1a0a0a]/30",
      sideOverlay: "bg-gradient-to-r from-[#1a0a0a]/90 via-transparent to-transparent",
      topOverlay: "bg-gradient-to-b from-[#1a0a0a]/60 to-transparent",
    },
    midnight: {
      bg: "from-[#0c0a1d] via-[#1a1735] to-[#12102a]",
      bgSolid: "bg-[#0c0a1d]",
      orb1: "bg-pink-400/15",
      orb2: "bg-indigo-500/12",
      orb1Strong: "bg-pink-400/25",
      orb2Strong: "bg-indigo-500/20",
      accentMuted: "bg-pink-400/80",
      accentLine: "from-pink-400",
      accentBorder: "from-pink-400/35 via-transparent to-indigo-500/30",
      accentGlow: "from-pink-400/45 to-indigo-500/40",
      border: "border-[#312e81]",
      borderLine: "via-[#312e81]",
      surface: "bg-[#1a1735]",
      surfaceAlt: "bg-[#12102a]/80",
      overlay: "from-[#0c0a1d]/50",
      cardBg: "bg-[#1a1735]/80 border-pink-400/25",
      indicatorMuted: "text-pink-300/50",
      hoverAccent: "hover:text-pink-400",
      imgOverlay: "bg-gradient-to-r from-[#0c0a1d] via-[#0c0a1d]/80 to-transparent",
      fullOverlay: "bg-gradient-to-t from-[#0c0a1d] via-[#0c0a1d]/70 to-[#0c0a1d]/30",
      sideOverlay: "bg-gradient-to-r from-[#0c0a1d]/90 via-transparent to-transparent",
      topOverlay: "bg-gradient-to-b from-[#0c0a1d]/60 to-transparent",
    },
    cyber: {
      bg: "from-[#0a0a0f] via-[#0f0f18] to-[#151520]",
      bgSolid: "bg-[#0a0a0f]",
      orb1: "bg-cyan-400/20",
      orb2: "bg-fuchsia-500/15",
      orb1Strong: "bg-cyan-400/30",
      orb2Strong: "bg-fuchsia-500/25",
      accentMuted: "bg-cyan-400/80",
      accentLine: "from-cyan-400",
      accentBorder: "from-cyan-400/40 via-transparent to-fuchsia-500/35",
      accentGlow: "from-cyan-400/50 to-fuchsia-500/45",
      border: "border-[#1a1a2e]",
      borderLine: "via-[#1a1a2e]",
      surface: "bg-[#151520]",
      surfaceAlt: "bg-[#0f0f18]/80",
      overlay: "from-[#0a0a0f]/50",
      cardBg: "bg-[#151520]/90 border-cyan-400/30",
      indicatorMuted: "text-cyan-400/50",
      hoverAccent: "hover:text-cyan-400",
      imgOverlay: "bg-gradient-to-r from-[#0a0a0f] via-[#0a0a0f]/80 to-transparent",
      fullOverlay: "bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/70 to-[#0a0a0f]/30",
      sideOverlay: "bg-gradient-to-r from-[#0a0a0f]/90 via-transparent to-transparent",
      topOverlay: "bg-gradient-to-b from-[#0a0a0f]/60 to-transparent",
    },
    alien: {
      bg: "from-[#0a0f0a] via-[#0d140d] to-[#121a12]",
      bgSolid: "bg-[#0a0f0a]",
      orb1: "bg-lime-400/20",
      orb2: "bg-emerald-500/15",
      orb1Strong: "bg-lime-400/30",
      orb2Strong: "bg-emerald-500/25",
      accentMuted: "bg-lime-400/80",
      accentLine: "from-lime-400",
      accentBorder: "from-lime-400/40 via-transparent to-emerald-500/35",
      accentGlow: "from-lime-400/50 to-emerald-500/45",
      border: "border-[#1a2a1a]",
      borderLine: "via-[#1a2a1a]",
      surface: "bg-[#121a12]",
      surfaceAlt: "bg-[#0d140d]/80",
      overlay: "from-[#0a0f0a]/50",
      cardBg: "bg-[#121a12]/90 border-lime-400/30",
      indicatorMuted: "text-lime-400/50",
      hoverAccent: "hover:text-lime-400",
      imgOverlay: "bg-gradient-to-r from-[#0a0f0a] via-[#0a0f0a]/80 to-transparent",
      fullOverlay: "bg-gradient-to-t from-[#0a0f0a] via-[#0a0f0a]/70 to-[#0a0f0a]/30",
      sideOverlay: "bg-gradient-to-r from-[#0a0f0a]/90 via-transparent to-transparent",
      topOverlay: "bg-gradient-to-b from-[#0a0f0a]/60 to-transparent",
    },
    corporate: {
      bg: "from-white via-gray-50 to-gray-100",
      bgSolid: "bg-white",
      orb1: "bg-blue-500/5",
      orb2: "bg-sky-500/4",
      orb1Strong: "bg-blue-500/8",
      orb2Strong: "bg-sky-500/6",
      accentMuted: "bg-blue-500/80",
      accentLine: "from-blue-500",
      accentBorder: "from-blue-500/15 via-transparent to-sky-500/10",
      accentGlow: "from-blue-500/20 to-sky-500/15",
      border: "border-gray-200",
      borderLine: "via-gray-200",
      surface: "bg-gray-50",
      surfaceAlt: "bg-white",
      overlay: "from-white/50",
      cardBg: "bg-white border-gray-200 shadow-sm",
      indicatorMuted: "text-gray-400",
      hoverAccent: "hover:text-blue-600",
      imgOverlay: "bg-gradient-to-r from-white via-white/90 to-transparent",
      fullOverlay: "bg-gradient-to-t from-white via-white/80 to-white/50",
      sideOverlay: "bg-gradient-to-r from-white/95 via-transparent to-transparent",
      topOverlay: "bg-gradient-to-b from-white/60 to-transparent",
    },
    cosmic: {
      bg: "from-[#0a0612] via-[#120a1f] to-[#1a0a2e]",
      bgSolid: "bg-[#0a0612]",
      orb1: "bg-violet-500/20",
      orb2: "bg-fuchsia-500/15",
      orb1Strong: "bg-violet-500/30",
      orb2Strong: "bg-fuchsia-500/25",
      accentMuted: "bg-violet-400/80",
      accentLine: "from-violet-400",
      accentBorder: "from-violet-500/40 via-transparent to-fuchsia-500/35",
      accentGlow: "from-violet-500/50 to-fuchsia-500/45",
      border: "border-violet-500/30",
      borderLine: "via-violet-500/30",
      surface: "bg-[#120a1f]/80",
      surfaceAlt: "bg-[#1a0a2e]/60",
      overlay: "from-[#0a0612]/60",
      cardBg: "bg-[#120a1f]/70 border-violet-500/25 backdrop-blur-xl",
      indicatorMuted: "text-violet-300/60",
      hoverAccent: "hover:text-violet-400",
      imgOverlay: "bg-gradient-to-r from-[#0a0612] via-[#0a0612]/80 to-transparent",
      fullOverlay: "bg-gradient-to-t from-[#0a0612] via-[#0a0612]/60 to-[#0a0612]/20",
      sideOverlay: "bg-gradient-to-r from-[#0a0612]/85 via-transparent to-transparent",
      topOverlay: "bg-gradient-to-b from-[#0a0612]/50 to-transparent",
    },
    architectural: {
      bg: "from-[#0a0a0a] via-[#141414] to-[#0a0a0a]",
      bgSolid: "bg-[#0a0a0a]",
      orb1: "bg-white/5",
      orb2: "bg-neutral-500/8",
      orb1Strong: "bg-white/10",
      orb2Strong: "bg-neutral-500/12",
      accentMuted: "bg-white/90",
      accentLine: "from-white",
      accentBorder: "from-white/20 via-transparent to-neutral-500/15",
      accentGlow: "from-white/25 to-neutral-500/20",
      border: "border-white/15",
      borderLine: "via-white/20",
      surface: "bg-[#141414]/90",
      surfaceAlt: "bg-[#1a1a1a]/80",
      overlay: "from-[#0a0a0a]/70",
      cardBg: "bg-[#0a0a0a]/85 border-white/15 backdrop-blur-lg",
      indicatorMuted: "text-neutral-500",
      hoverAccent: "hover:text-white",
      imgOverlay: "bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent",
      fullOverlay: "bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-[#0a0a0a]/20",
      sideOverlay: "bg-gradient-to-r from-[#0a0a0a]/90 via-transparent to-transparent",
      topOverlay: "bg-gradient-to-b from-[#0a0a0a]/60 to-transparent",
    },
    anime: {
      bg: "from-[#1a1625] via-[#251f35] to-[#1a1625]",
      bgSolid: "bg-[#1a1625]",
      orb1: "bg-fuchsia-500/20",
      orb2: "bg-sky-400/15",
      orb1Strong: "bg-fuchsia-500/30",
      orb2Strong: "bg-sky-400/25",
      accentMuted: "bg-fuchsia-400/80",
      accentLine: "from-fuchsia-400",
      accentBorder: "from-fuchsia-500/40 via-transparent to-sky-400/35",
      accentGlow: "from-fuchsia-500/50 to-sky-400/45",
      border: "border-fuchsia-500/25",
      borderLine: "via-fuchsia-500/25",
      surface: "bg-[#251f35]/80",
      surfaceAlt: "bg-[#2d2640]/70",
      overlay: "from-[#1a1625]/50",
      cardBg: "bg-[#251f35]/70 border-fuchsia-500/25 backdrop-blur-xl",
      indicatorMuted: "text-fuchsia-300/60",
      hoverAccent: "hover:text-fuchsia-400",
      imgOverlay: "bg-gradient-to-r from-[#1a1625] via-[#1a1625]/80 to-transparent",
      fullOverlay: "bg-gradient-to-t from-[#1a1625] via-[#1a1625]/60 to-[#1a1625]/20",
      sideOverlay: "bg-gradient-to-r from-[#1a1625]/85 via-transparent to-transparent",
      topOverlay: "bg-gradient-to-b from-[#1a1625]/50 to-transparent",
    },
    hacker: {
      bg: "from-[#0d0d0d] via-[#141414] to-[#0d0d0d]",
      bgSolid: "bg-[#0d0d0d]",
      orb1: "bg-[#00ff41]/15",
      orb2: "bg-[#00d4ff]/10",
      orb1Strong: "bg-[#00ff41]/25",
      orb2Strong: "bg-[#00d4ff]/20",
      accentMuted: "bg-[#00ff41]/80",
      accentLine: "from-[#00ff41]",
      accentBorder: "from-[#00ff41]/40 via-transparent to-[#00d4ff]/30",
      accentGlow: "from-[#00ff41]/50 to-[#00d4ff]/40",
      border: "border-[#00ff41]/30",
      borderLine: "via-[#00ff41]/30",
      surface: "bg-[#141414]/90",
      surfaceAlt: "bg-[#1a1a1a]/80",
      overlay: "from-[#0d0d0d]/70",
      cardBg: "bg-[#0d0d0d]/90 border-[#00ff41]/30 backdrop-blur-lg",
      indicatorMuted: "text-[#00ff41]/60",
      hoverAccent: "hover:text-[#00ff41]",
      imgOverlay: "bg-gradient-to-r from-[#0d0d0d] via-[#0d0d0d]/80 to-transparent",
      fullOverlay: "bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/60 to-[#0d0d0d]/20",
      sideOverlay: "bg-gradient-to-r from-[#0d0d0d]/90 via-transparent to-transparent",
      topOverlay: "bg-gradient-to-b from-[#0d0d0d]/60 to-transparent",
    },
  };

  const colors = {
    ...colorMap[themeType as keyof typeof colorMap] || colorMap.dark,
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

  // Single image block (uses first image)
  const ImageBlock = ({ className = "", size = "large", imageIndex = 0 }: { className?: string; size?: "small" | "medium" | "large"; imageIndex?: number }) => {
    const img = allImages[imageIndex];
    if (!img) return null;
    const sizeClass = size === "small" ? "max-h-[50%]" : size === "medium" ? "max-h-[70%]" : "max-h-[85%]";
    return (
      <div className={`relative ${sizeClass} ${className}`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.accentBorder} rounded-lg`} />
        <div className={`absolute inset-[1px] ${colors.surface} rounded-lg overflow-hidden`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img.url} alt={img.alt || slide.title} className="absolute inset-0 w-full h-full object-cover" />
          <div className={`absolute inset-0 bg-gradient-to-t ${colors.overlay} via-transparent to-transparent`} />
        </div>
        {img.source === "pexels" && img.photographer && (
          <div className={`absolute bottom-3 right-3 backdrop-blur-sm text-xs px-2 py-1 rounded ${themeType === "light" ? "bg-white/80" : "bg-black/60"}`} style={{ color: colors.textMuted }}>
            <a href={img.photographerUrl} target="_blank" rel="noopener noreferrer" style={{ color: colors.accent }}>{img.photographer}</a>
          </div>
        )}
      </div>
    );
  };

  // Image gallery for multiple images
  const ImageGallery = ({ className = "", layout: galleryLayout = "grid" }: { className?: string; layout?: "grid" | "row" | "stack" }) => {
    if (allImages.length === 0) return null;
    
    // Single image - just show it
    if (allImages.length === 1) {
      return <ImageBlock className={className} />;
    }
    
    // Multiple images - show in gallery
    if (galleryLayout === "row") {
      return (
        <div className={`flex gap-3 ${className}`}>
          {allImages.slice(0, 3).map((img, idx) => (
            <div key={idx} className="flex-1 relative rounded-lg overflow-hidden" style={{ aspectRatio: "4/3" }}>
              <div className={`absolute inset-0 bg-gradient-to-br ${colors.accentBorder} rounded-lg`} />
              <div className={`absolute inset-[1px] ${colors.surface} rounded-lg overflow-hidden`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.alt || slide.title} className="absolute inset-0 w-full h-full object-cover" />
              </div>
            </div>
          ))}
        </div>
      );
    }
    
    if (galleryLayout === "stack") {
      // Stacked/overlapping style
      return (
        <div className={`relative ${className}`} style={{ height: "100%" }}>
          {allImages.slice(0, 3).map((img, idx) => (
            <div 
              key={idx} 
              className={`absolute rounded-lg overflow-hidden shadow-xl border ${colors.border}`}
              style={{ 
                width: `${85 - idx * 10}%`, 
                height: `${85 - idx * 10}%`,
                top: `${idx * 8}%`,
                left: `${idx * 8}%`,
                zIndex: allImages.length - idx,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.alt || slide.title} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      );
    }
    
    // Grid layout (default)
    const gridCols = allImages.length === 2 ? "grid-cols-2" : allImages.length === 3 ? "grid-cols-3" : "grid-cols-2";
    return (
      <div className={`grid ${gridCols} gap-3 ${className}`}>
        {allImages.slice(0, 4).map((img, idx) => (
          <div key={idx} className="relative rounded-lg overflow-hidden" style={{ aspectRatio: allImages.length <= 2 ? "16/9" : "4/3" }}>
            <div className={`absolute inset-0 bg-gradient-to-br ${colors.accentBorder} rounded-lg`} />
            <div className={`absolute inset-[1px] ${colors.surface} rounded-lg overflow-hidden`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.alt || slide.title} className="absolute inset-0 w-full h-full object-cover" />
            </div>
          </div>
        ))}
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


  // LAYOUT 1: Left Content - Image Right (supports multiple images in stack layout)
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
              {hasMultipleImages ? (
                <ImageGallery className="w-full h-full" layout="stack" />
              ) : (
                <ImageBlock className="w-full h-full" />
              )}
            </div>
          )}
          {slide.image?.source === "placeholder" && <div className="w-[45%] p-8"><Placeholder /></div>}
        </div>
        <div className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${colors.borderLine} to-transparent`} />
      </div>
    );
  }

  // LAYOUT 2: Right Content - Image Left (supports multiple images in stack layout)
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
              {hasMultipleImages ? (
                <ImageGallery className="w-full h-full" layout="stack" />
              ) : (
                <ImageBlock className="w-full h-full" />
              )}
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
            <div className={`w-full ${hasMultipleImages ? "max-w-4xl" : "max-w-2xl"} mb-8 relative`}>
              {hasMultipleImages ? (
                <ImageGallery className="w-full" layout="row" />
              ) : (
                <div className="h-48">
                  <ImageBlock className="w-full h-full" size="medium" />
                </div>
              )}
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
    const firstImage = allImages[0];
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg}`} />
        
        {hasImage && firstImage && (
          <div className="absolute inset-0 clip-diagonal">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={firstImage.url} alt={firstImage.alt || slide.title} className={`absolute inset-0 w-full h-full object-cover ${themeType === "light" ? "opacity-20" : "opacity-30"}`} />
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
                {hasMultipleImages ? (
                  <ImageGallery className="w-full h-full" layout="grid" />
                ) : (
                  <ImageBlock className="w-full h-full" size="large" />
                )}
              </div>
            </div>
          )}
        </div>
        
        <style jsx>{`.clip-diagonal { clip-path: polygon(50% 0, 100% 0, 100% 100%, 30% 100%); }`}</style>
      </div>
    );
  }

  // LAYOUT 5: Image Focus - Full bleed with overlay (multiple images show as thumbnails)
  if (layout === "image-focus") {
    const firstImage = allImages[0];
    return (
      <div className="h-full relative overflow-hidden">
        {hasImage && firstImage ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={firstImage.url} alt={firstImage.alt || slide.title} className="absolute inset-0 w-full h-full object-cover" />
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
        
        {/* Show additional images as thumbnails in corner */}
        {hasMultipleImages && (
          <div className="absolute top-4 right-4 flex gap-2">
            {allImages.slice(1, 4).map((img, idx) => (
              <div key={idx} className="w-16 h-12 rounded-lg overflow-hidden border-2 border-white/30 shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.alt || ""} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
        
        {firstImage?.source === "pexels" && firstImage.photographer && (
          <div className={`absolute bottom-4 right-4 backdrop-blur-sm text-xs px-3 py-1.5 rounded ${themeType === "light" ? "bg-white/80" : "bg-black/60"}`} style={{ color: colors.textMuted }}>
            <a href={firstImage.photographerUrl} target="_blank" rel="noopener noreferrer" style={{ color: colors.accent }}>{firstImage.photographer}</a>
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
          <div className={`absolute bottom-8 right-8 ${hasMultipleImages ? "w-64" : "w-48"} h-32`}>
            {hasMultipleImages ? (
              <ImageGallery className="w-full h-full" layout="row" />
            ) : (
              <ImageBlock className="w-full h-full" size="small" />
            )}
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

  // LAYOUT 10: Diagonal Cut - Slanted image with geometric accents (Ocean theme signature)
  if (layout === "diagonal-cut") {
    const firstImage = allImages[0];
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg}`} />
        
        {/* Diagonal image section */}
        {hasImage && firstImage && (
          <div className="absolute right-0 top-0 bottom-0 w-[55%]" style={{ clipPath: "polygon(20% 0, 100% 0, 100% 100%, 0% 100%)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={firstImage.url} alt={firstImage.alt || slide.title} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628] via-transparent to-transparent" />
          </div>
        )}
        
        {/* Geometric accent shapes */}
        <div className="absolute top-20 right-[45%] w-32 h-32 border-2 border-teal-500/20 rotate-45" />
        <div className="absolute bottom-20 right-[50%] w-20 h-20 border border-cyan-500/15 rotate-12" />
        <div className={`absolute top-1/3 left-8 w-1 h-32 bg-gradient-to-b ${colors.accentLine} to-transparent`} />
        
        {/* Glowing orbs */}
        <div className={`absolute top-0 left-1/4 w-96 h-96 ${colors.orb1Strong} rounded-full blur-3xl`} />
        <div className={`absolute bottom-0 right-1/3 w-72 h-72 ${colors.orb2Strong} rounded-full blur-3xl`} />
        
        <SlideIndicator position="top-left" />
        
        <div className="relative h-full flex">
          <div className="w-[50%] flex flex-col justify-center p-12 pt-20">
            {/* Decorative line above title */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.accent }} />
              <div className={`w-24 h-0.5 bg-gradient-to-r ${colors.accentLine} to-transparent`} />
            </div>
            
            <Title className="text-4xl md:text-5xl mb-8" />
            {bulletPoints.length > 0 && <BulletPoints />}
          </div>
        </div>
        
        {/* Bottom accent line */}
        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500/50 ${colors.borderLine} to-transparent`} />
      </div>
    );
  }

  // LAYOUT 11: Circle Focus - Circular image frames with floating elements (Ocean theme)
  if (layout === "circle-focus") {
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg}`} />
        
        {/* Decorative circles */}
        <div className="absolute top-10 right-10 w-64 h-64 rounded-full border border-teal-500/10" />
        <div className="absolute top-16 right-16 w-52 h-52 rounded-full border border-cyan-500/15" />
        <div className="absolute bottom-20 left-20 w-40 h-40 rounded-full border border-teal-500/10" />
        
        {/* Glowing orbs */}
        <div className={`absolute top-1/4 right-1/4 w-80 h-80 ${colors.orb1Strong} rounded-full blur-3xl`} />
        <div className={`absolute bottom-1/4 left-1/3 w-64 h-64 ${colors.orb2} rounded-full blur-3xl`} />
        
        <SlideIndicator position="top-left" />
        
        <div className="relative h-full flex items-center">
          {/* Content side */}
          <div className="w-[55%] flex flex-col justify-center p-12">
            <Title className="text-4xl md:text-5xl mb-8" />
            {bulletPoints.length > 0 && <BulletPoints />}
          </div>
          
          {/* Circular images */}
          <div className="w-[45%] relative flex items-center justify-center">
            {hasImage && (
              <div className="relative">
                {/* Main circular image */}
                <div className="w-72 h-72 rounded-full overflow-hidden border-4 shadow-2xl relative z-10" style={{ borderColor: colors.accent, boxShadow: `0 0 60px ${colors.accent}30` }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={allImages[0]!.url} alt={allImages[0]!.alt || slide.title} className="w-full h-full object-cover" />
                </div>
                
                {/* Secondary circular images if multiple */}
                {hasMultipleImages && allImages[1] && (
                  <div className="absolute -bottom-8 -left-16 w-32 h-32 rounded-full overflow-hidden border-2 shadow-xl z-20" style={{ borderColor: `${colors.accent}80` }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={allImages[1].url} alt={allImages[1].alt || ""} className="w-full h-full object-cover" />
                  </div>
                )}
                {allImages.length > 2 && allImages[2] && (
                  <div className="absolute -top-4 -right-12 w-24 h-24 rounded-full overflow-hidden border-2 shadow-xl z-20" style={{ borderColor: `${colors.accent}60` }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={allImages[2].url} alt={allImages[2].alt || ""} className="w-full h-full object-cover" />
                  </div>
                )}
                
                {/* Decorative ring */}
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
        
        {/* Bottom wave accent */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-teal-500/30 to-transparent" />
      </div>
    );
  }

  // LAYOUT 12: Wave Layout - Flowing curves with content cards (Ocean theme)
  if (layout === "wave-layout") {
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-b ${colors.bg}`} />
        
        {/* Wave SVG background */}
        <svg className="absolute bottom-0 left-0 right-0 h-48 opacity-20" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="#14b8a6" d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,138.7C672,128,768,160,864,181.3C960,203,1056,213,1152,197.3C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
        </svg>
        <svg className="absolute bottom-0 left-0 right-0 h-32 opacity-10" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="#06b6d4" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,218.7C672,235,768,245,864,234.7C960,224,1056,192,1152,181.3C1248,171,1344,181,1392,186.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
        </svg>
        
        {/* Floating bubbles */}
        <div className="absolute top-20 right-20 w-6 h-6 rounded-full bg-teal-500/20" />
        <div className="absolute top-40 right-40 w-4 h-4 rounded-full bg-cyan-500/15" />
        <div className="absolute top-32 right-60 w-3 h-3 rounded-full bg-teal-400/25" />
        <div className="absolute bottom-40 left-20 w-5 h-5 rounded-full bg-cyan-500/20" />
        
        {/* Glowing orbs */}
        <div className={`absolute top-0 right-1/4 w-96 h-96 ${colors.orb1} rounded-full blur-3xl`} />
        
        <SlideIndicator position="top-left" />
        
        <div className="relative h-full p-12 pt-20">
          <div className="flex items-start gap-8">
            {/* Title section */}
            <div className={`${hasImage ? "w-[50%]" : "w-full"}`}>
              <Title className="text-4xl md:text-5xl mb-8" />
            </div>
            
            {/* Image in rounded card */}
            {hasImage && (
              <div className="w-[45%] relative">
                <div className="rounded-3xl overflow-hidden shadow-2xl border" style={{ borderColor: `${colors.accent}30` }}>
                  <div className="aspect-video">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={allImages[0]!.url} alt={allImages[0]!.alt || slide.title} className="w-full h-full object-cover" />
                  </div>
                </div>
                {/* Glow effect */}
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-teal-500/20 to-cyan-500/10 blur-xl -z-10" />
              </div>
            )}
          </div>
          
          {/* Content cards */}
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
          
          {canEdit && isHovered && bulletPoints.length > 0 && (
            <button onClick={() => onAddBullet(index)} className={`mt-4 flex items-center gap-2 text-sm ${colors.indicatorMuted} ${colors.hoverAccent} transition-colors`}>
              <Plus size={14} /> Add card
            </button>
          )}
        </div>
      </div>
    );
  }

  // LAYOUT 13: Hexagon Frame - Hexagonal image frames with aurora effects (Aurora theme signature)
  if (layout === "hexagon-frame") {
    const firstImage = allImages[0];
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg}`} />
        
        {/* Aurora gradient streaks */}
        <div className="absolute top-0 left-0 right-0 h-full overflow-hidden">
          <div className="absolute top-10 left-1/4 w-96 h-2 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent rotate-12 blur-sm" />
          <div className="absolute top-32 right-1/4 w-80 h-1.5 bg-gradient-to-r from-transparent via-green-500/25 to-transparent -rotate-6 blur-sm" />
          <div className="absolute bottom-40 left-1/3 w-72 h-1 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent rotate-3 blur-sm" />
        </div>
        
        {/* Glowing orbs */}
        <div className={`absolute top-0 right-1/4 w-96 h-96 ${colors.orb1Strong} rounded-full blur-3xl`} />
        <div className={`absolute bottom-0 left-1/4 w-80 h-80 ${colors.orb2Strong} rounded-full blur-3xl`} />
        
        <SlideIndicator position="top-left" />
        
        <div className="relative h-full flex items-center">
          {/* Content side */}
          <div className="w-[55%] flex flex-col justify-center p-12">
            {/* Decorative hexagon accent */}
            <div className="flex items-center gap-4 mb-6">
              <svg width="24" height="28" viewBox="0 0 24 28" fill="none" className="opacity-80">
                <path d="M12 0L24 7V21L12 28L0 21V7L12 0Z" fill={colors.accent} fillOpacity="0.6" />
              </svg>
              <div className={`w-20 h-0.5 bg-gradient-to-r ${colors.accentLine} to-transparent`} />
            </div>
            
            <Title className="text-4xl md:text-5xl mb-8" />
            {bulletPoints.length > 0 && <BulletPoints />}
          </div>
          
          {/* Hexagonal image frame */}
          {hasImage && firstImage && (
            <div className="w-[45%] relative flex items-center justify-center">
              <div className="relative">
                {/* Outer glow */}
                <div className="absolute -inset-4 bg-gradient-to-br from-purple-500/30 via-green-500/20 to-cyan-500/30 blur-xl" style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }} />
                
                {/* Hexagonal image container */}
                <div className="relative w-72 h-80 overflow-hidden" style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={firstImage.url} alt={firstImage.alt || slide.title} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 to-transparent" />
                </div>
                
                {/* Border hexagon */}
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
                
                {/* Secondary smaller hexagon if multiple images */}
                {hasMultipleImages && allImages[1] && (
                  <div className="absolute -bottom-8 -left-12 w-24 h-28 overflow-hidden shadow-xl" style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={allImages[1].url} alt={allImages[1].alt || ""} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Bottom aurora line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500/50 via-green-500/30 to-cyan-500/50" />
      </div>
    );
  }

  // LAYOUT 14: Glass Cards - Glassmorphism cards with aurora backdrop (Aurora theme)
  if (layout === "glass-cards") {
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg}`} />
        
        {/* Aurora background effect */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[300px] bg-gradient-to-r from-purple-600/20 via-green-500/15 to-cyan-500/20 rounded-full blur-3xl rotate-12" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[250px] bg-gradient-to-l from-purple-500/15 via-pink-500/10 to-green-500/15 rounded-full blur-3xl -rotate-12" />
        </div>
        
        {/* Floating particles */}
        <div className="absolute top-20 left-20 w-2 h-2 rounded-full bg-purple-400/40" />
        <div className="absolute top-40 right-32 w-3 h-3 rounded-full bg-green-400/30" />
        <div className="absolute bottom-32 left-40 w-2 h-2 rounded-full bg-cyan-400/35" />
        <div className="absolute top-60 left-1/2 w-1.5 h-1.5 rounded-full bg-purple-300/40" />
        
        <SlideIndicator position="top-left" />
        
        <div className="relative h-full p-12 pt-20">
          {/* Title in glass card */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 max-w-2xl shadow-2xl">
            <Title className="text-3xl md:text-4xl" />
          </div>
          
          {/* Content in glass cards grid */}
          {bulletPoints.length > 0 && (
            <div className="grid grid-cols-2 gap-4 max-w-4xl">
              {bulletPoints.map((point, i) => (
                <div key={i} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-5 shadow-xl hover:bg-white/10 transition-all group">
                  <div className="flex items-start gap-4">
                    {/* Glowing number */}
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
          
          {canEdit && isHovered && (
            <button onClick={() => onAddBullet(index)} className={`mt-4 flex items-center gap-2 text-sm ${colors.indicatorMuted} ${colors.hoverAccent} transition-colors`}>
              <Plus size={14} /> Add card
            </button>
          )}
        </div>
        
        {/* Image in corner glass frame */}
        {hasImage && (
          <div className="absolute bottom-8 right-8 w-56 h-40 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-2 shadow-2xl">
            <div className="w-full h-full rounded-xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={allImages[0]!.url} alt={allImages[0]!.alt || slide.title} className="w-full h-full object-cover" />
            </div>
          </div>
        )}
      </div>
    );
  }

  // LAYOUT 15: Aurora Glow - Full aurora effect with glowing content (Aurora theme)
  if (layout === "aurora-glow") {
    const firstImage = allImages[0];
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-b ${colors.bg}`} />
        
        {/* Full aurora effect background */}
        {hasImage && firstImage ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={firstImage.url} alt={firstImage.alt || slide.title} className="absolute inset-0 w-full h-full object-cover opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f0a1a] via-[#0f0a1a]/80 to-[#0f0a1a]/60" />
          </>
        ) : null}
        
        {/* Aurora light rays */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-purple-500/40 via-purple-500/10 to-transparent blur-sm" />
          <div className="absolute top-0 left-1/3 w-0.5 h-3/4 bg-gradient-to-b from-green-500/30 via-green-500/5 to-transparent blur-sm" />
          <div className="absolute top-0 right-1/3 w-1 h-2/3 bg-gradient-to-b from-cyan-500/35 via-cyan-500/10 to-transparent blur-sm" />
          <div className="absolute top-0 right-1/4 w-0.5 h-1/2 bg-gradient-to-b from-purple-400/25 via-transparent to-transparent blur-sm" />
        </div>
        
        {/* Glowing orbs */}
        <div className={`absolute top-0 left-1/3 w-[600px] h-[400px] ${colors.orb1Strong} rounded-full blur-3xl`} />
        <div className={`absolute bottom-1/4 right-1/4 w-[400px] h-[300px] ${colors.orb2Strong} rounded-full blur-3xl`} />
        
        <SlideIndicator position="top-left" />
        
        <div className="relative h-full flex flex-col justify-center items-center p-12 text-center">
          {/* Glowing title container */}
          <div className="relative mb-8">
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 via-green-500/10 to-purple-500/20 rounded-2xl blur-xl" />
            <div className="relative">
              <Title className="text-4xl md:text-5xl lg:text-6xl" align="center" />
            </div>
          </div>
          
          {/* Decorative aurora line */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-purple-500 to-green-500" />
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-green-500 to-transparent" />
          </div>
          
          {/* Content in glowing cards */}
          {bulletPoints.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4 max-w-4xl">
              {bulletPoints.map((point, i) => (
                <div key={i} className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/30 to-green-500/30 rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity" />
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
          
          {canEdit && isHovered && (
            <button onClick={() => onAddBullet(index)} className={`mt-6 flex items-center gap-2 text-sm ${colors.indicatorMuted} ${colors.hoverAccent} transition-colors`}>
              <Plus size={14} /> Add point
            </button>
          )}
        </div>
        
        {/* Bottom aurora glow */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-purple-500/10 via-green-500/5 to-transparent" />
      </div>
    );
  }

  // LAYOUT 16: Diamond Frame - Diamond-shaped image frames with ember particles (Ember theme signature)
  if (layout === "diamond-frame") {
    const firstImage = allImages[0];
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg}`} />
        
        {/* Ember particles floating */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-1/4 w-2 h-2 rounded-full bg-orange-500/60 animate-pulse" />
          <div className="absolute top-40 right-1/3 w-1.5 h-1.5 rounded-full bg-red-500/50 animate-pulse" style={{ animationDelay: "0.5s" }} />
          <div className="absolute bottom-32 left-1/3 w-2 h-2 rounded-full bg-yellow-500/40 animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-60 right-1/4 w-1 h-1 rounded-full bg-orange-400/50 animate-pulse" style={{ animationDelay: "1.5s" }} />
          <div className="absolute bottom-48 right-1/2 w-1.5 h-1.5 rounded-full bg-red-400/45 animate-pulse" style={{ animationDelay: "0.7s" }} />
        </div>
        
        {/* Heat distortion gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-red-900/20 via-orange-900/10 to-transparent" />
        
        {/* Glowing orbs */}
        <div className={`absolute top-0 right-1/4 w-96 h-96 ${colors.orb1Strong} rounded-full blur-3xl`} />
        <div className={`absolute bottom-0 left-1/4 w-80 h-80 ${colors.orb2Strong} rounded-full blur-3xl`} />
        
        <SlideIndicator position="top-left" />
        
        <div className="relative h-full flex items-center">
          {/* Content side */}
          <div className="w-[55%] flex flex-col justify-center p-12">
            {/* Fire accent */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-4 h-4 rotate-45 bg-gradient-to-br from-red-500 to-orange-500" />
              <div className={`w-20 h-0.5 bg-gradient-to-r ${colors.accentLine} to-transparent`} />
            </div>
            
            <Title className="text-4xl md:text-5xl mb-8" />
            {bulletPoints.length > 0 && <BulletPoints />}
          </div>
          
          {/* Diamond image frame */}
          {hasImage && firstImage && (
            <div className="w-[45%] relative flex items-center justify-center">
              <div className="relative">
                {/* Outer glow */}
                <div className="absolute -inset-6 bg-gradient-to-br from-red-500/30 via-orange-500/20 to-yellow-500/30 blur-xl rotate-45" style={{ width: "320px", height: "320px" }} />
                
                {/* Diamond image container */}
                <div className="relative w-72 h-72 overflow-hidden rotate-45 shadow-2xl" style={{ borderRadius: "24px" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={firstImage.url} alt={firstImage.alt || slide.title} className="absolute inset-0 w-[141%] h-[141%] object-cover -rotate-45 scale-100" style={{ top: "-20%", left: "-20%" }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-red-900/50 to-transparent -rotate-45" />
                </div>
                
                {/* Border diamond */}
                <div className="absolute inset-0 w-72 h-72 rotate-45 border-2 border-red-500/40" style={{ borderRadius: "24px" }} />
                
                {/* Secondary smaller diamond if multiple images */}
                {hasMultipleImages && allImages[1] && (
                  <div className="absolute -bottom-12 -left-8 w-20 h-20 overflow-hidden rotate-45 shadow-xl" style={{ borderRadius: "12px" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={allImages[1].url} alt={allImages[1].alt || ""} className="w-[141%] h-[141%] object-cover -rotate-45" style={{ marginTop: "-20%", marginLeft: "-20%" }} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Bottom ember line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500/60 via-orange-500/40 to-red-500/60" />
      </div>
    );
  }

  // LAYOUT 17: Ember Cards - Glowing ember-styled cards with fire effects (Ember theme)
  if (layout === "ember-cards") {
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg}`} />
        
        {/* Ember background effect */}
        <div className="absolute inset-0">
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-red-900/30 via-orange-900/15 to-transparent" />
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[300px] bg-gradient-to-r from-red-600/15 via-orange-500/10 to-red-600/15 rounded-full blur-3xl" />
        </div>
        
        {/* Floating embers */}
        <div className="absolute top-32 left-20 w-1.5 h-1.5 rounded-full bg-orange-400/50 animate-bounce" style={{ animationDuration: "3s" }} />
        <div className="absolute top-48 right-32 w-2 h-2 rounded-full bg-red-400/40 animate-bounce" style={{ animationDuration: "4s", animationDelay: "1s" }} />
        <div className="absolute bottom-40 left-40 w-1 h-1 rounded-full bg-yellow-400/45 animate-bounce" style={{ animationDuration: "3.5s", animationDelay: "0.5s" }} />
        
        <SlideIndicator position="top-left" />
        
        <div className="relative h-full p-12 pt-20">
          {/* Title with ember underline */}
          <div className="mb-8">
            <Title className="text-3xl md:text-4xl mb-3" />
            <div className="w-32 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-transparent rounded-full" />
          </div>
          
          {/* Ember-styled cards grid */}
          {bulletPoints.length > 0 && (
            <div className="grid grid-cols-2 gap-4 max-w-4xl">
              {bulletPoints.map((point, i) => (
                <div key={i} className="relative group">
                  {/* Card glow on hover */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500/0 via-orange-500/0 to-red-500/0 rounded-xl blur opacity-0 group-hover:opacity-50 group-hover:from-red-500/30 group-hover:via-orange-500/20 group-hover:to-red-500/30 transition-all duration-300" />
                  
                  <div className={`relative p-5 rounded-xl border backdrop-blur-sm ${colors.cardBg} transition-all group-hover:border-red-500/40`}>
                    <div className="flex items-start gap-4">
                      {/* Fire icon number */}
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
          
          {canEdit && isHovered && (
            <button onClick={() => onAddBullet(index)} className={`mt-4 flex items-center gap-2 text-sm ${colors.indicatorMuted} ${colors.hoverAccent} transition-colors`}>
              <Plus size={14} /> Add card
            </button>
          )}
        </div>
        
        {/* Image in corner with ember frame */}
        {hasImage && (
          <div className="absolute bottom-8 right-8 w-52 h-36">
            <div className="absolute -inset-1 bg-gradient-to-br from-red-500/30 to-orange-500/20 rounded-xl blur" />
            <div className="relative w-full h-full rounded-xl overflow-hidden border border-red-500/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={allImages[0]!.url} alt={allImages[0]!.alt || slide.title} className="w-full h-full object-cover" />
            </div>
          </div>
        )}
      </div>
    );
  }

  // LAYOUT 18: Molten Split - Split layout with molten lava effect divider (Ember theme)
  if (layout === "molten-split") {
    const firstImage = allImages[0];
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg}`} />
        
        {/* Molten divider effect */}
        <div className="absolute top-0 bottom-0 left-1/2 w-2 -translate-x-1/2">
          <div className="absolute inset-0 bg-gradient-to-b from-red-500/80 via-orange-500/60 to-yellow-500/80 blur-sm" />
          <div className="absolute inset-0 bg-gradient-to-b from-red-400 via-orange-400 to-red-400 w-0.5 left-1/2 -translate-x-1/2" />
        </div>
        
        {/* Heat waves */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-full">
          <div className="absolute top-20 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500/20 to-transparent animate-pulse" />
          <div className="absolute top-40 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-red-500/15 to-transparent animate-pulse" style={{ animationDelay: "0.5s" }} />
          <div className="absolute top-60 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent animate-pulse" style={{ animationDelay: "1s" }} />
        </div>
        
        {/* Glowing orbs */}
        <div className={`absolute top-0 left-1/4 w-80 h-80 ${colors.orb1Strong} rounded-full blur-3xl`} />
        <div className={`absolute bottom-0 right-1/4 w-72 h-72 ${colors.orb2Strong} rounded-full blur-3xl`} />
        
        <SlideIndicator position="top-left" />
        
        <div className="relative h-full flex">
          {/* Left content side */}
          <div className="w-[48%] flex flex-col justify-center p-12 pr-16">
            <Title className="text-4xl md:text-5xl mb-8" />
            {bulletPoints.length > 0 && <BulletPoints />}
          </div>
          
          {/* Right image side */}
          <div className="w-[48%] ml-auto flex items-center justify-center p-12 pl-16">
            {hasImage && firstImage ? (
              <div className="relative w-full h-[80%]">
                {/* Molten glow behind image */}
                <div className="absolute -inset-4 bg-gradient-to-br from-red-500/25 via-orange-500/15 to-yellow-500/25 rounded-2xl blur-xl" />
                
                {/* Image with irregular border */}
                <div className="relative w-full h-full rounded-2xl overflow-hidden border-2 border-red-500/30 shadow-2xl" style={{ boxShadow: "0 0 40px rgba(239, 68, 68, 0.3)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={firstImage.url} alt={firstImage.alt || slide.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a0a0a]/60 via-transparent to-transparent" />
                </div>
                
                {/* Secondary image overlay */}
                {hasMultipleImages && allImages[1] && (
                  <div className="absolute -bottom-6 -left-6 w-28 h-20 rounded-xl overflow-hidden border border-orange-500/40 shadow-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={allImages[1].url} alt={allImages[1].alt || ""} className="w-full h-full object-cover" />
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
        
        {/* Bottom molten line */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500/50 via-orange-500/70 to-red-500/50" />
      </div>
    );
  }

  // LAYOUT 19: Arch Frame - Elegant arch-shaped image frames with rose gold accents (Midnight Garden signature)
  if (layout === "arch-frame") {
    const firstImage = allImages[0];
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg}`} />
        
        {/* Botanical decorative elements */}
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
        
        {/* Glowing orbs */}
        <div className={`absolute top-0 right-1/4 w-96 h-96 ${colors.orb1Strong} rounded-full blur-3xl`} />
        <div className={`absolute bottom-0 left-1/4 w-80 h-80 ${colors.orb2Strong} rounded-full blur-3xl`} />
        
        <SlideIndicator position="top-left" />
        
        <div className="relative h-full flex items-center">
          {/* Content side */}
          <div className="w-[55%] flex flex-col justify-center p-12">
            {/* Rose gold accent */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-8 h-8 rounded-full border-2 border-pink-400/50 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-gradient-to-br from-pink-400 to-pink-500" />
              </div>
              <div className={`w-20 h-0.5 bg-gradient-to-r ${colors.accentLine} to-transparent`} />
            </div>
            
            <Title className="text-4xl md:text-5xl mb-8" />
            {bulletPoints.length > 0 && <BulletPoints />}
          </div>
          
          {/* Arch image frame */}
          {hasImage && firstImage && (
            <div className="w-[45%] relative flex items-center justify-center">
              <div className="relative">
                {/* Outer glow */}
                <div className="absolute -inset-4 bg-gradient-to-br from-pink-400/25 via-indigo-500/15 to-pink-400/25 blur-xl" style={{ borderRadius: "50% 50% 0 0 / 60% 60% 0 0" }} />
                
                {/* Arch image container */}
                <div className="relative w-64 h-80 overflow-hidden shadow-2xl" style={{ borderRadius: "50% 50% 8px 8px / 40% 40% 8px 8px" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={firstImage.url} alt={firstImage.alt || slide.title} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a1d]/60 to-transparent" />
                </div>
                
                {/* Border arch */}
                <div className="absolute inset-0 w-64 h-80 border-2 border-pink-400/40" style={{ borderRadius: "50% 50% 8px 8px / 40% 40% 8px 8px" }} />
                
                {/* Secondary smaller arch if multiple images */}
                {hasMultipleImages && allImages[1] && (
                  <div className="absolute -bottom-4 -left-12 w-20 h-28 overflow-hidden shadow-xl border border-indigo-500/30" style={{ borderRadius: "50% 50% 4px 4px / 40% 40% 4px 4px" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={allImages[1].url} alt={allImages[1].alt || ""} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Bottom elegant line */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-pink-400/40 to-transparent" />
      </div>
    );
  }

  // LAYOUT 20: Botanical Cards - Elegant cards with botanical corner accents (Midnight Garden)
  if (layout === "botanical-cards") {
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg}`} />
        
        {/* Botanical corner decorations */}
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
        
        {/* Glowing orbs */}
        <div className={`absolute top-1/3 right-0 w-80 h-80 ${colors.orb1} rounded-full blur-3xl`} />
        <div className={`absolute bottom-1/3 left-0 w-64 h-64 ${colors.orb2} rounded-full blur-3xl`} />
        
        <SlideIndicator position="top-left" />
        
        <div className="relative h-full p-12 pt-20">
          {/* Title with elegant underline */}
          <div className="mb-8">
            <Title className="text-3xl md:text-4xl mb-4" />
            <div className="flex items-center gap-3">
              <div className="w-24 h-0.5 bg-gradient-to-r from-pink-400 to-transparent" />
              <div className="w-2 h-2 rounded-full bg-pink-400/60" />
              <div className="w-12 h-0.5 bg-gradient-to-r from-indigo-500/60 to-transparent" />
            </div>
          </div>
          
          {/* Elegant botanical cards */}
          {bulletPoints.length > 0 && (
            <div className="grid grid-cols-2 gap-5 max-w-4xl">
              {bulletPoints.map((point, i) => (
                <div key={i} className="relative group">
                  {/* Card with botanical corner */}
                  <div className={`relative p-6 rounded-2xl border backdrop-blur-sm ${colors.cardBg} transition-all group-hover:border-pink-400/40`}>
                    {/* Corner botanical accent */}
                    <div className="absolute top-2 right-2 w-8 h-8 opacity-30">
                      <svg viewBox="0 0 30 30" className="w-full h-full">
                        <path d="M30,0 Q15,10 15,20 Q25,15 30,0" fill="none" stroke="#e879a9" strokeWidth="1" />
                      </svg>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      {/* Elegant number */}
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
          
          {canEdit && isHovered && (
            <button onClick={() => onAddBullet(index)} className={`mt-4 flex items-center gap-2 text-sm ${colors.indicatorMuted} ${colors.hoverAccent} transition-colors`}>
              <Plus size={14} /> Add card
            </button>
          )}
        </div>
        
        {/* Image in elegant frame */}
        {hasImage && (
          <div className="absolute bottom-8 right-8 w-48 h-32">
            <div className="absolute -inset-1 bg-gradient-to-br from-pink-400/20 to-indigo-500/15 rounded-2xl blur" />
            <div className="relative w-full h-full rounded-2xl overflow-hidden border border-pink-400/25">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={allImages[0]!.url} alt={allImages[0]!.alt || slide.title} className="w-full h-full object-cover" />
            </div>
          </div>
        )}
      </div>
    );
  }

  // LAYOUT 21: Elegant Split - Luxurious split layout with ornate divider (Midnight Garden)
  if (layout === "elegant-split") {
    const firstImage = allImages[0];
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg}`} />
        
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
            {bulletPoints.length > 0 && <BulletPoints />}
          </div>
          
          {/* Right image side */}
          <div className="w-[48%] ml-auto flex items-center justify-center p-12 pl-16">
            {hasImage && firstImage ? (
              <div className="relative w-full h-[80%]">
                {/* Elegant glow */}
                <div className="absolute -inset-4 bg-gradient-to-br from-pink-400/20 via-indigo-500/10 to-pink-400/20 rounded-3xl blur-xl" />
                
                {/* Image with elegant rounded corners */}
                <div className="relative w-full h-full rounded-3xl overflow-hidden border border-pink-400/25 shadow-2xl" style={{ boxShadow: "0 0 50px rgba(232, 121, 169, 0.2)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={firstImage.url} alt={firstImage.alt || slide.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a1d]/50 via-transparent to-transparent" />
                </div>
                
                {/* Secondary image */}
                {hasMultipleImages && allImages[1] && (
                  <div className="absolute -bottom-4 -left-4 w-24 h-16 rounded-xl overflow-hidden border border-indigo-500/30 shadow-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={allImages[1].url} alt={allImages[1].alt || ""} className="w-full h-full object-cover" />
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
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg}`} />
        
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
            {bulletPoints.length > 0 && <BulletPoints />}
          </div>
          
          {/* Glitch image frame */}
          {hasImage && firstImage && (
            <div className="w-[45%] relative flex items-center justify-center">
              <div className="relative">
                {/* Glitch offset layers */}
                <div className="absolute inset-0 translate-x-1 -translate-y-0.5 opacity-50">
                  <div className="w-64 h-72 rounded-lg overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={firstImage.url} alt="" className="w-full h-full object-cover" style={{ filter: "hue-rotate(90deg)" }} />
                  </div>
                </div>
                <div className="absolute inset-0 -translate-x-1 translate-y-0.5 opacity-50">
                  <div className="w-64 h-72 rounded-lg overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={firstImage.url} alt="" className="w-full h-full object-cover" style={{ filter: "hue-rotate(-90deg)" }} />
                  </div>
                </div>
                
                {/* Main image */}
                <div className="relative w-64 h-72 rounded-lg overflow-hidden border-2 border-cyan-400/50 shadow-2xl" style={{ boxShadow: "0 0 30px rgba(0,255,255,0.4), 0 0 60px rgba(255,0,255,0.2)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={firstImage.url} alt={firstImage.alt || slide.title} className="w-full h-full object-cover" />
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
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg}`} />
        
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
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400/0 to-fuchsia-500/0 rounded-lg blur opacity-0 group-hover:opacity-100 group-hover:from-cyan-400/40 group-hover:to-fuchsia-500/40 transition-all duration-300" />
                  
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
          
          {canEdit && isHovered && (
            <button onClick={() => onAddBullet(index)} className={`mt-4 flex items-center gap-2 text-sm ${colors.indicatorMuted} ${colors.hoverAccent} transition-colors`}>
              <Plus size={14} /> Add card
            </button>
          )}
        </div>
        
        {/* Image with neon frame */}
        {hasImage && (
          <div className="absolute bottom-8 right-8 w-48 h-32">
            <div className="relative w-full h-full rounded-lg overflow-hidden border border-cyan-400/40" style={{ boxShadow: "0 0 20px rgba(0,255,255,0.3)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={allImages[0]!.url} alt={allImages[0]!.alt || slide.title} className="w-full h-full object-cover" />
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
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg}`} />
        
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
                    <div className="absolute -inset-0.5 rounded-lg opacity-60 group-hover:opacity-100 transition-opacity" style={{ background: "linear-gradient(135deg, #00ffff, #ff00ff, #adff2f, #00ffff)", backgroundSize: "300% 300%" }} />
                    
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
            
            {canEdit && isHovered && (
              <button onClick={() => onAddBullet(index)} className={`mt-4 flex items-center gap-2 text-sm ${colors.indicatorMuted} ${colors.hoverAccent} transition-colors`}>
                <Plus size={14} /> Add point
              </button>
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
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={firstImage.url} alt={firstImage.alt || slide.title} className="w-full h-full object-cover" />
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
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg}`} />
        
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
                      <div className="w-3 h-3 rounded-full border border-lime-400/60 group-hover:bg-lime-400/30 transition-colors" />
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
            
            {canEdit && isHovered && (
              <button onClick={() => onAddBullet(index)} className={`mt-4 flex items-center gap-2 text-sm ${colors.indicatorMuted} ${colors.hoverAccent} transition-colors`}>
                <Plus size={14} /> Add point
              </button>
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
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={firstImage.url} alt={firstImage.alt || slide.title} className="w-full h-full object-cover" />
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
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg}`} />
        
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
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-lime-400/20 to-emerald-500/10 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                  
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
          
          {canEdit && isHovered && (
            <button onClick={() => onAddBullet(index)} className={`mt-6 mx-auto flex items-center gap-2 text-sm ${colors.indicatorMuted} ${colors.hoverAccent} transition-colors`}>
              <Plus size={14} /> Add card
            </button>
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
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg}`} />
        
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
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={firstImage.url} alt={firstImage.alt || slide.title} className="w-full h-full object-cover" />
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
            
            {canEdit && isHovered && (
              <button onClick={() => onAddBullet(index)} className={`mt-4 flex items-center gap-2 text-sm ${colors.indicatorMuted} ${colors.hoverAccent} transition-colors`}>
                <Plus size={14} /> Add point
              </button>
            )}
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-lime-400/30 via-emerald-400/50 to-lime-400/30" />
      </div>
    );
  }

  // LAYOUT 28: Clean Frame - Professional minimalist image frame (Corporate Clean signature)
  if (layout === "clean-frame") {
    const firstImage = allImages[0];
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg}`} />
        
        {/* Subtle geometric accents */}
        <div className="absolute top-0 left-0 w-1 h-24 bg-gradient-to-b from-blue-500 to-transparent" />
        <div className="absolute top-0 left-0 w-24 h-1 bg-gradient-to-r from-blue-500 to-transparent" />
        <div className="absolute bottom-0 right-0 w-1 h-20 bg-gradient-to-t from-gray-300 to-transparent" />
        <div className="absolute bottom-0 right-0 w-20 h-1 bg-gradient-to-l from-gray-300 to-transparent" />
        
        {/* Subtle orbs */}
        <div className={`absolute top-1/4 right-1/4 w-96 h-96 ${colors.orb1} rounded-full blur-3xl`} />
        <div className={`absolute bottom-1/4 left-1/3 w-80 h-80 ${colors.orb2} rounded-full blur-3xl`} />
        
        <SlideIndicator position="top-left" />
        
        <div className="relative h-full flex">
          {/* Content side */}
          <div className="w-[55%] flex flex-col justify-center p-12">
            <Title className="text-4xl md:text-5xl mb-8" />
            
            {bulletPoints.length > 0 && (
              <div className="space-y-4">
                {bulletPoints.map((point, i) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <div className="w-2 h-2 mt-2.5 rounded-full bg-blue-500" />
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
            
            {canEdit && isHovered && (
              <button onClick={() => onAddBullet(index)} className={`mt-4 flex items-center gap-2 text-sm ${colors.indicatorMuted} ${colors.hoverAccent} transition-colors`}>
                <Plus size={14} /> Add point
              </button>
            )}
          </div>
          
          {/* Clean professional image frame */}
          {hasImage && firstImage && (
            <div className="w-[45%] relative flex items-center justify-center p-8">
              <div className="relative w-full h-[80%]">
                <div className="relative w-full h-full rounded-lg overflow-hidden border border-gray-200 shadow-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={firstImage.url} alt={firstImage.alt || slide.title} className="w-full h-full object-cover" />
                  <div className={`absolute inset-0 ${colors.fullOverlay}`} />
                </div>
                {/* Corner accent */}
                <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-blue-500" />
              </div>
            </div>
          )}
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
      </div>
    );
  }

  // LAYOUT 29: Pro Cards - Professional card grid layout (Corporate Clean)
  if (layout === "pro-cards") {
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg}`} />
        
        {/* Subtle background elements */}
        <div className={`absolute top-0 right-0 w-[500px] h-[500px] ${colors.orb1} rounded-full blur-3xl`} />
        <div className={`absolute bottom-0 left-0 w-[400px] h-[400px] ${colors.orb2} rounded-full blur-3xl`} />
        
        <SlideIndicator position="top-left" />
        
        <div className="relative h-full flex flex-col justify-center p-12">
          <Title className="text-4xl md:text-5xl mb-10 text-center" align="center" />
          
          {/* Professional cards grid */}
          {bulletPoints.length > 0 && (
            <div className="grid grid-cols-2 gap-5 max-w-4xl mx-auto">
              {bulletPoints.map((point, i) => (
                <div key={i} className="group">
                  <div className={`p-5 rounded-lg ${colors.cardBg} hover:shadow-md transition-shadow`}>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                        <span className="text-blue-600 font-semibold text-sm">{String(i + 1).padStart(2, "0")}</span>
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
          
          {canEdit && isHovered && (
            <button onClick={() => onAddBullet(index)} className={`mt-6 mx-auto flex items-center gap-2 text-sm ${colors.indicatorMuted} ${colors.hoverAccent} transition-colors`}>
              <Plus size={14} /> Add card
            </button>
          )}
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
      </div>
    );
  }

  // LAYOUT 30: Executive Split - Professional executive-style split layout (Corporate Clean)
  if (layout === "executive-split") {
    const firstImage = allImages[0];
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg}`} />
        
        {/* Subtle geometric grid */}
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: "linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)", backgroundSize: "50px 50px" }} />
        
        {/* Orbs */}
        <div className={`absolute top-1/3 left-1/4 w-80 h-80 ${colors.orb1Strong} rounded-full blur-3xl`} />
        <div className={`absolute bottom-1/3 right-1/4 w-72 h-72 ${colors.orb2Strong} rounded-full blur-3xl`} />
        
        <SlideIndicator position="top-left" />
        
        <div className="relative h-full flex">
          {/* Left: Image */}
          {hasImage && firstImage && (
            <div className="w-[45%] relative flex items-center justify-center p-8">
              <div className="relative w-full h-[85%]">
                <div className="relative w-full h-full rounded-lg overflow-hidden shadow-xl border border-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={firstImage.url} alt={firstImage.alt || slide.title} className="w-full h-full object-cover" />
                  <div className={`absolute inset-0 ${colors.fullOverlay}`} />
                </div>
                {/* Accent line */}
                <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-24 bg-gradient-to-b from-transparent via-blue-500 to-transparent" />
              </div>
            </div>
          )}
          
          {/* Right: Content */}
          <div className={`${hasImage ? "w-[55%]" : "w-full"} flex flex-col justify-center p-12`}>
            <div className="mb-3 flex items-center gap-3">
              <div className="w-8 h-px bg-blue-500" />
              <span className="text-blue-600 text-xs font-medium uppercase tracking-widest">Overview</span>
            </div>
            
            <Title className="text-4xl md:text-5xl mb-8" />
            
            {bulletPoints.length > 0 && (
              <div className="space-y-4">
                {bulletPoints.map((point, i) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <div className="w-4 h-px bg-gray-300" />
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
            
            {canEdit && isHovered && (
              <button onClick={() => onAddBullet(index)} className={`mt-4 flex items-center gap-2 text-sm ${colors.indicatorMuted} ${colors.hoverAccent} transition-colors`}>
                <Plus size={14} /> Add point
              </button>
            )}
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-blue-500/30 via-gray-300 to-blue-500/30" />
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
                    {canEdit && isHovered && (
                      <button onClick={() => onAddBullet(index)} className="flex items-center gap-2 text-sm text-violet-400/60 hover:text-violet-400 transition-colors ml-14">
                        <Plus size={14} /> Add point
                      </button>
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
                  {canEdit && isHovered && (
                    <button onClick={() => onAddBullet(index)} className="flex items-center gap-2 text-sm text-violet-400/60 hover:text-violet-400 transition-colors ml-7">
                      <Plus size={14} /> Add point
                    </button>
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
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={firstImage.url} alt={firstImage.alt || slide.title} className="w-full h-full object-cover" />
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
                  <div className="absolute -inset-1 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Card */}
                  <div className="relative bg-[#120a1f]/70 backdrop-blur-lg rounded-xl border border-violet-500/20 p-6 hover:border-violet-500/40 transition-colors">
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
          
          {canEdit && isHovered && (
            <button onClick={() => onAddBullet(index)} className="mt-6 mx-auto flex items-center gap-2 text-sm text-violet-400/60 hover:text-violet-400 transition-colors">
              <Plus size={14} /> Add card
            </button>
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
                {canEdit && isHovered && (
                  <button onClick={() => onAddBullet(index)} className="flex items-center gap-2 text-sm text-violet-400/60 hover:text-violet-400 transition-colors ml-10">
                    <Plus size={14} /> Add point
                  </button>
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
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={firstImage.url} alt={firstImage.alt || slide.title} className="w-full h-full object-cover" />
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
                    <div key={i} className="flex items-start gap-4 group pl-2 border-l-2 border-violet-500/30 hover:border-violet-500/60 transition-colors">
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
                  {canEdit && isHovered && (
                    <button onClick={() => onAddBullet(index)} className="flex items-center gap-2 text-sm text-violet-400/60 hover:text-violet-400 transition-colors ml-4">
                      <Plus size={14} /> Add point
                    </button>
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
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={firstImage.url} alt={firstImage.alt || slide.title} className="w-full h-full object-cover" />
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
        
        <SlideIndicator position="bottom-left" />
        
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
              {canEdit && isHovered && (
                <button onClick={() => onAddBullet(index)} className="mt-6 flex items-center gap-2 text-sm text-violet-400/60 hover:text-violet-400 transition-colors mx-auto">
                  <Plus size={14} /> Add point
                </button>
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
                {canEdit && isHovered && (
                  <button onClick={() => onAddBullet(index)} className="flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors ml-8">
                    <Plus size={14} /> Add point
                  </button>
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
                {canEdit && isHovered && (
                  <button onClick={() => onAddBullet(index)} className="flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors ml-8">
                    <Plus size={14} /> Add point
                  </button>
                )}
              </div>
            )}
          </div>
          
          {hasImage && firstImage && (
            <div className="w-[45%] flex items-center justify-center p-8">
              <div className="relative w-full max-w-md">
                <div className="absolute -inset-2 border border-white/20" />
                <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={firstImage.url} alt={firstImage.alt || slide.title} className="w-full h-full object-cover grayscale" />
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
          
          {canEdit && isHovered && (
            <button onClick={() => onAddBullet(index)} className="mt-6 mx-auto flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors">
              <Plus size={14} /> Add block
            </button>
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
        
        <SlideIndicator position="bottom-left" />
        
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
              {canEdit && isHovered && (
                <button onClick={() => onAddBullet(index)} className="mt-4 flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors mx-auto">
                  <Plus size={14} /> Add point
                </button>
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
                {canEdit && isHovered && (
                  <button onClick={() => onAddBullet(index)} className="flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors ml-7">
                    <Plus size={14} /> Add point
                  </button>
                )}
              </div>
            )}
          </div>
          
          {hasImage && firstImage && (
            <div className="w-[45%] flex items-center justify-center p-8">
              <div className="relative w-full max-w-sm">
                <div className="absolute -top-3 -left-3 w-full h-full border-2 border-white" />
                <div className="relative overflow-hidden" style={{ aspectRatio: "3/4" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={firstImage.url} alt={firstImage.alt || slide.title} className="w-full h-full object-cover" />
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
            
            {canEdit && isHovered && (
              <button onClick={() => onAddBullet(index)} className="mt-4 flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors">
                <Plus size={14} /> Add item
              </button>
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
                    {canEdit && isHovered && (
                      <button onClick={() => onAddBullet(index)} className="flex items-center gap-2 text-sm text-fuchsia-400/60 hover:text-fuchsia-400 transition-colors ml-7">
                        <Plus size={14} /> Add point
                      </button>
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
                  <div className="absolute -inset-1 bg-gradient-to-r from-fuchsia-500/20 to-pink-400/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative bg-[#251f35]/70 backdrop-blur-lg rounded-2xl border border-fuchsia-500/20 p-5 hover:border-fuchsia-500/40 transition-all">
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
          
          {canEdit && isHovered && (
            <button onClick={() => onAddBullet(index)} className="mt-6 mx-auto flex items-center gap-2 text-sm text-fuchsia-400/60 hover:text-fuchsia-400 transition-colors">
              <Plus size={14} /> Add card
            </button>
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
                {canEdit && isHovered && (
                  <button onClick={() => onAddBullet(index)} className="flex items-center gap-2 text-sm text-fuchsia-400/60 hover:text-fuchsia-400 transition-colors ml-10">
                    <Plus size={14} /> Add point
                  </button>
                )}
              </div>
            )}
          </div>
          
          {hasImage && firstImage && (
            <div className="w-[45%] flex items-center justify-center p-8">
              <div className="relative w-full max-w-sm">
                <div className="absolute -inset-3 bg-gradient-to-r from-fuchsia-500/30 to-pink-400/30 rounded-3xl blur-xl" />
                <div className="relative rounded-3xl overflow-hidden border-2 border-fuchsia-500/30" style={{ aspectRatio: "3/4" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={firstImage.url} alt={firstImage.alt || slide.title} className="w-full h-full object-cover" />
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
          
          {canEdit && isHovered && (
            <button onClick={() => onAddBullet(index)} className="mt-6 flex items-center gap-2 text-sm text-fuchsia-400/60 hover:text-fuchsia-400 transition-colors">
              <Plus size={14} /> Add bubble
            </button>
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
        
        <SlideIndicator position="bottom-left" />
        
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
              {canEdit && isHovered && (
                <button onClick={() => onAddBullet(index)} className="mt-4 flex items-center gap-2 text-sm text-fuchsia-400/60 hover:text-fuchsia-400 transition-colors mx-auto">
                  <Plus size={14} /> Add point
                </button>
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
                    <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/10 to-pink-400/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
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
            
            {canEdit && isHovered && (
              <button onClick={() => onAddBullet(index)} className="mt-4 flex items-center gap-2 text-sm text-fuchsia-400/60 hover:text-fuchsia-400 transition-colors mx-auto">
                <Plus size={14} /> Add item
              </button>
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
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 65, 0.1) 2px, rgba(0, 255, 65, 0.1) 4px)" }} />
        
        {/* Terminal window */}
        <div className="absolute top-8 left-8 right-8 bottom-8 border border-[#00ff41]/40 rounded-lg overflow-hidden bg-[#0d0d0d]/60 backdrop-blur-sm">
          {/* Terminal header */}
          <div className="h-10 bg-[#141414] border-b border-[#00ff41]/30 flex items-center px-4 gap-3">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff0040]" />
              <div className="w-3 h-3 rounded-full bg-[#ffff00]" />
              <div className="w-3 h-3 rounded-full bg-[#00ff41]" />
            </div>
            <span className="ml-4 text-[#00ff41]/70 text-xs font-mono">root@kali:~# ./presentation --slide {index + 1}</span>
          </div>
          
          <div className="p-8 h-[calc(100%-2.5rem)] flex flex-col justify-center">
            <div className="mb-6">
              <span className="text-[#00ff41]/60 font-mono text-sm">$ cat slide_{index + 1}.txt</span>
            </div>
            <Title className="text-4xl md:text-5xl mb-8" align="left" />
            
            {bulletPoints.length > 0 && (
              <div className="space-y-3 mt-4">
                {bulletPoints.map((point, i) => (
                  <div key={i} className="flex items-start gap-3 group">
                    <span className="text-[#00ff41]/60 font-mono text-sm mt-1">[{i}]</span>
                    <EditableText
                      value={point}
                      isEditing={isEditing && editingText?.field === "bullet" && editingText?.bulletIndex === i}
                      onStartEdit={() => onStartEditing(index, "bullet", i)}
                      onChange={(val) => onUpdateContent(index, "bullet", val, i)}
                      onFinish={onFinishEditing}
                      className="flex-1 text-lg leading-relaxed font-mono"
                      style={{ fontFamily: theme.fonts.body.family, color: "#39ff14" }}
                      isOwner={canEdit}
                      isHovered={isHovered}
                      onDelete={() => onDeleteBullet(index, i)}
                    />
                  </div>
                ))}
              </div>
            )}
            
            {canEdit && isHovered && (
              <button onClick={() => onAddBullet(index)} className="mt-4 flex items-center gap-2 text-sm text-[#00ff41]/60 hover:text-[#00ff41] transition-colors">
                <Plus size={14} /> Add entry
              </button>
            )}
            
            <div className="mt-8 flex items-center gap-2">
              <span className="text-[#00ff41]/60 font-mono text-sm">$</span>
              <div className="w-3 h-5 bg-[#00ff41] animate-pulse" />
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
        <div className="absolute inset-0 overflow-hidden opacity-15 pointer-events-none">
          {[10, 20, 30, 45, 55, 70, 80, 90].map((left, idx) => (
            <div key={idx} className="absolute top-0 w-px bg-gradient-to-b from-[#00ff41] via-[#00ff41]/50 to-transparent" style={{ left: `${left}%`, height: `${30 + idx * 8}%` }} />
          ))}
        </div>
        
        <SlideIndicator position="top-left" />
        
        <div className="relative h-full flex flex-col justify-center p-12">
          <div className="mb-8">
            <span className="text-[#00ff41]/50 font-mono text-xs uppercase tracking-widest">// System Output</span>
            <Title className="text-4xl md:text-5xl mt-2" align="left" />
          </div>
          
          {bulletPoints.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {bulletPoints.map((point, i) => (
                <div key={i} className="group relative">
                  <div className="absolute inset-0 bg-[#00ff41]/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative p-5 rounded-lg border border-[#00ff41]/30 bg-[#0d0d0d]/70 backdrop-blur-sm hover:border-[#00ff41]/50 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded border border-[#00ff41]/40 flex items-center justify-center bg-[#00ff41]/10">
                        <span className="text-[#00ff41] font-mono text-sm font-bold">{String(i).padStart(2, "0")}</span>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-[#00ff41] animate-pulse" />
                    </div>
                    <EditableText
                      value={point}
                      isEditing={isEditing && editingText?.field === "bullet" && editingText?.bulletIndex === i}
                      onStartEdit={() => onStartEditing(index, "bullet", i)}
                      onChange={(val) => onUpdateContent(index, "bullet", val, i)}
                      onFinish={onFinishEditing}
                      className="text-base leading-relaxed"
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
          
          {canEdit && isHovered && (
            <button onClick={() => onAddBullet(index)} className="mt-6 flex items-center gap-2 text-sm text-[#00ff41]/60 hover:text-[#00ff41] transition-colors">
              <Plus size={14} /> Add module
            </button>
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
        
        <div className="relative h-full flex items-center p-12">
          <div className="w-full max-w-5xl mx-auto">
            {/* Code editor style container */}
            <div className="rounded-xl border border-[#00ff41]/30 bg-[#0d0d0d]/80 backdrop-blur-sm overflow-hidden">
              {/* Editor tabs */}
              <div className="flex items-center gap-1 px-4 py-2 bg-[#141414] border-b border-[#00ff41]/20">
                <div className="px-3 py-1 rounded-t bg-[#0d0d0d] border border-[#00ff41]/30 border-b-0">
                  <span className="text-[#00ff41] text-xs font-mono">slide_{index + 1}.md</span>
                </div>
                <div className="px-3 py-1 text-[#00ff41]/40 text-xs font-mono">config.yml</div>
              </div>
              
              {/* Line numbers + content */}
              <div className="flex">
                <div className="py-6 px-4 border-r border-[#00ff41]/20 bg-[#0a0a0a]/50">
                  <div className="text-[#00ff41]/30 font-mono text-sm space-y-1">
                    {Array.from({ length: Math.max(bulletPoints.length + 3, 6) }, (_, i) => (
                      <div key={i}>{String(i + 1).padStart(2, " ")}</div>
                    ))}
                  </div>
                </div>
                
                <div className="flex-1 py-6 px-6">
                  <div className="mb-4">
                    <span className="text-[#ff0040] font-mono"># </span>
                    <Title className="text-3xl md:text-4xl inline" align="left" />
                  </div>
                  <div className="text-[#00ff41]/50 font-mono text-sm mb-4">---</div>
                  
                  {bulletPoints.length > 0 && (
                    <div className="space-y-2">
                      {bulletPoints.map((point, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <span className="text-[#00d4ff] font-mono">-</span>
                          <EditableText
                            value={point}
                            isEditing={isEditing && editingText?.field === "bullet" && editingText?.bulletIndex === i}
                            onStartEdit={() => onStartEditing(index, "bullet", i)}
                            onChange={(val) => onUpdateContent(index, "bullet", val, i)}
                            onFinish={onFinishEditing}
                            className="flex-1 text-base leading-relaxed"
                            style={{ fontFamily: theme.fonts.body.family, color: "#39ff14" }}
                            isOwner={canEdit}
                            isHovered={isHovered}
                            onDelete={() => onDeleteBullet(index, i)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {canEdit && isHovered && (
                    <button onClick={() => onAddBullet(index)} className="mt-4 flex items-center gap-2 text-sm text-[#00ff41]/60 hover:text-[#00ff41] transition-colors">
                      <Plus size={14} /> Add line
                    </button>
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
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0, 255, 65, 0.5) 1px, rgba(0, 255, 65, 0.5) 2px)" }} />
        
        <SlideIndicator position="top-left" />
        
        <div className="relative h-full flex flex-col justify-center p-12">
          <div className="max-w-4xl">
            {/* Command prompt header */}
            <div className="mb-6 flex items-center gap-2">
              <span className="text-[#00ff41] font-mono font-bold">root@kali</span>
              <span className="text-white font-mono">:</span>
              <span className="text-[#00d4ff] font-mono">~/slides</span>
              <span className="text-white font-mono">$</span>
              <span className="text-[#39ff14] font-mono ml-2">cat README.md</span>
            </div>
            
            <div className="pl-4 border-l-2 border-[#00ff41]/40">
              <Title className="text-4xl md:text-5xl mb-6" align="left" />
              
              {bulletPoints.length > 0 && (
                <div className="space-y-4 mt-6">
                  {bulletPoints.map((point, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <span className="text-[#ffff00] font-mono text-sm mt-1">→</span>
                      <EditableText
                        value={point}
                        isEditing={isEditing && editingText?.field === "bullet" && editingText?.bulletIndex === i}
                        onStartEdit={() => onStartEditing(index, "bullet", i)}
                        onChange={(val) => onUpdateContent(index, "bullet", val, i)}
                        onFinish={onFinishEditing}
                        className="flex-1 text-lg leading-relaxed"
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
            
            {canEdit && isHovered && (
              <button onClick={() => onAddBullet(index)} className="mt-6 ml-4 flex items-center gap-2 text-sm text-[#00ff41]/60 hover:text-[#00ff41] transition-colors">
                <Plus size={14} /> Add command
              </button>
            )}
            
            {/* Blinking cursor */}
            <div className="mt-8 flex items-center gap-2">
              <span className="text-[#00ff41] font-mono font-bold">root@kali</span>
              <span className="text-white font-mono">:</span>
              <span className="text-[#00d4ff] font-mono">~/slides</span>
              <span className="text-white font-mono">$</span>
              <div className="w-3 h-5 bg-[#00ff41] animate-pulse ml-2" />
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
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "linear-gradient(to right, #00ff41 1px, transparent 1px), linear-gradient(to bottom, #00ff41 1px, transparent 1px)", backgroundSize: "50px 50px" }} />
        
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-32 h-32">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00ff41] to-transparent" />
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#00ff41] to-transparent" />
        </div>
        <div className="absolute bottom-0 right-0 w-32 h-32">
          <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-l from-[#00ff41] to-transparent" />
          <div className="absolute bottom-0 right-0 w-1 h-full bg-gradient-to-t from-[#00ff41] to-transparent" />
        </div>
        
        <SlideIndicator position="top-left" />
        
        <div className="relative h-full flex items-center p-12">
          <div className="grid grid-cols-2 gap-8 w-full max-w-6xl mx-auto">
            {/* Left: Title */}
            <div className="flex flex-col justify-center">
              <div className="mb-4 flex items-center gap-3">
                <div className="w-3 h-3 bg-[#00ff41] animate-pulse" />
                <span className="text-[#00ff41]/60 font-mono text-xs uppercase tracking-widest">Active Node</span>
              </div>
              <Title className="text-4xl md:text-5xl" align="left" />
              
              {hasImage && (
                <div className="mt-8">
                  <ImageBlock size="medium" />
                </div>
              )}
            </div>
            
            {/* Right: Content grid */}
            <div className="space-y-4">
              {bulletPoints.length > 0 && bulletPoints.map((point, i) => (
                <div key={i} className="group relative">
                  <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-2 h-2 border border-[#00ff41]/50 rotate-45 group-hover:bg-[#00ff41]/50 transition-colors" />
                  <div className="p-4 border border-[#00ff41]/25 bg-[#0d0d0d]/60 backdrop-blur-sm hover:border-[#00ff41]/50 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[#00d4ff] font-mono text-xs">NODE_{String(i).padStart(2, "0")}</span>
                      <div className="flex-1 h-px bg-gradient-to-r from-[#00ff41]/30 to-transparent" />
                      <div className="w-2 h-2 rounded-full bg-[#00ff41] animate-pulse" />
                    </div>
                    <EditableText
                      value={point}
                      isEditing={isEditing && editingText?.field === "bullet" && editingText?.bulletIndex === i}
                      onStartEdit={() => onStartEditing(index, "bullet", i)}
                      onChange={(val) => onUpdateContent(index, "bullet", val, i)}
                      onFinish={onFinishEditing}
                      className="text-base leading-relaxed"
                      style={{ fontFamily: theme.fonts.body.family, color: "#39ff14" }}
                      isOwner={canEdit}
                      isHovered={isHovered}
                      onDelete={() => onDeleteBullet(index, i)}
                    />
                  </div>
                </div>
              ))}
              
              {canEdit && isHovered && (
                <button onClick={() => onAddBullet(index)} className="flex items-center gap-2 text-sm text-[#00ff41]/60 hover:text-[#00ff41] transition-colors">
                  <Plus size={14} /> Add node
                </button>
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
        <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-[#00ff41]/50 via-[#00ff41]/20 to-[#00ff41]/50 transform -skew-x-12" />
        
        <SlideIndicator position="top-left" />
        
        <div className="relative h-full flex">
          {/* Left side - Content */}
          <div className="w-1/2 flex flex-col justify-center p-12 pr-16">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="px-3 py-1 border border-[#00ff41]/40 bg-[#00ff41]/10 rounded">
                  <span className="text-[#00ff41] font-mono text-xs">ENCRYPTED</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-[#00ff41] animate-pulse" />
              </div>
              <Title className="text-4xl md:text-5xl" align="left" />
            </div>
            
            {bulletPoints.length > 0 && (
              <div className="space-y-4">
                {bulletPoints.map((point, i) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <div className="mt-1 flex items-center gap-2">
                      <div className="w-6 h-6 border border-[#00ff41]/40 flex items-center justify-center bg-[#00ff41]/5 group-hover:bg-[#00ff41]/20 transition-colors">
                        <span className="text-[#00ff41] font-mono text-xs">{i + 1}</span>
                      </div>
                      <div className="w-4 h-px bg-[#00ff41]/40" />
                    </div>
                    <EditableText
                      value={point}
                      isEditing={isEditing && editingText?.field === "bullet" && editingText?.bulletIndex === i}
                      onStartEdit={() => onStartEditing(index, "bullet", i)}
                      onChange={(val) => onUpdateContent(index, "bullet", val, i)}
                      onFinish={onFinishEditing}
                      className="flex-1 text-lg leading-relaxed"
                      style={{ fontFamily: theme.fonts.body.family, color: "#39ff14" }}
                      isOwner={canEdit}
                      isHovered={isHovered}
                      onDelete={() => onDeleteBullet(index, i)}
                    />
                  </div>
                ))}
              </div>
            )}
            
            {canEdit && isHovered && (
              <button onClick={() => onAddBullet(index)} className="mt-6 flex items-center gap-2 text-sm text-[#00ff41]/60 hover:text-[#00ff41] transition-colors">
                <Plus size={14} /> Add data
              </button>
            )}
          </div>
          
          {/* Right side - Image or decorative */}
          <div className="w-1/2 flex items-center justify-center p-12 pl-16">
            {hasImage ? (
              <div className="relative w-full h-full max-h-[80%]">
                <div className="absolute inset-0 border border-[#00ff41]/30 rounded-lg overflow-hidden">
                  <ImageBlock className="w-full h-full" size="large" />
                  <div className="absolute top-4 left-4 px-2 py-1 bg-[#0d0d0d]/80 border border-[#00ff41]/30 rounded">
                    <span className="text-[#00ff41] font-mono text-xs">IMG_LOADED</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-[60%] border border-[#00ff41]/20 rounded-lg flex items-center justify-center bg-[#0d0d0d]/40">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 border-2 border-[#00ff41]/30 rounded-lg flex items-center justify-center">
                    <ImageIcon size={32} className="text-[#00ff41]/40" />
                  </div>
                  <span className="text-[#00ff41]/40 font-mono text-sm">NO_DATA</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Bottom status bar */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-[#0d0d0d]/80 border-t border-[#00ff41]/30 flex items-center px-6 justify-between">
          <span className="text-[#00ff41]/50 font-mono text-xs">STATUS: ACTIVE</span>
          <div className="flex items-center gap-4">
            <span className="text-[#00ff41]/50 font-mono text-xs">SLIDE {index + 1}/{totalSlides}</span>
            <div className="w-2 h-2 rounded-full bg-[#00ff41] animate-pulse" />
          </div>
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
