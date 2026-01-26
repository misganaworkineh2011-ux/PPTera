import type { Theme } from "~/lib/themes";
import type { ContentLayoutCategory } from "~/lib/layouts/content";

export type LayoutVariant = "left-content" | "right-content" | "image-top" | "image-bottom" | "centered" | "split-diagonal" | "image-focus" | "minimal-left" | "cards-grid" | "quote-style" | "timeline" | "diagonal-cut" | "circle-focus" | "wave-layout" | "hexagon-frame" | "glass-cards" | "aurora-glow" | "diamond-frame" | "ember-cards" | "molten-split" | "arch-frame" | "botanical-cards" | "elegant-split" | "glitch-frame" | "neon-grid" | "holo-cards" | "scan-frame" | "bio-cards" | "transmission-split" | "clean-frame" | "pro-cards" | "executive-split" | "nebula-float" | "orbital-rings" | "starfield-cards" | "cosmic-portal" | "galaxy-split" | "celestial-frame" | "mono-brutalist" | "geometric-slice" | "contrast-blocks" | "angular-frame" | "stripe-accent" | "bold-stack" | "cloud-float" | "sakura-cards" | "dreamy-split" | "soft-bubble" | "twilight-frame" | "pastel-stack" | "terminal-window" | "matrix-cards" | "code-block" | "shell-prompt" | "cyber-grid" | "hack-split" | "grid-2-col" | "grid-3-col" | "grid-4-card" | "cards-2" | "cards-3" | "comparison" | "stats-grid" | "full-image" | "image-background" | "centered-image" | "feature-showcase" | "chart-left" | "chart-right";

export type ThemeType = "dark" | "light" | "sunset" | "ocean" | "aurora" | "ember" | "midnight" | "cyber" | "alien" | "corporate" | "cosmic" | "architectural" | "anime" | "hacker" | "custom-dark" | "custom-light";

export function getLayoutCategory(layoutId: string): ContentLayoutCategory {
  if (layoutId.startsWith("box-")) return "boxes";
  if (layoutId.startsWith("sequence-")) return "sequence";
  if (layoutId.startsWith("bullet-")) return "bullets";
  if (layoutId.startsWith("steps-")) return "steps";
  if (layoutId.startsWith("quote-")) return "quotes";
  if (layoutId.startsWith("circle-")) return "circles";
  if (layoutId.startsWith("image-style-")) return "images";
  return "boxes";
}

function isColorDark(hexColor: string): boolean {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

export function getThemeType(theme: Theme): ThemeType {
  if (theme.id.startsWith("custom-")) {
    return isColorDark(theme.colors.background) ? "custom-dark" : "custom-light";
  }

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

export function getLayoutVariant(index: number, themeType: ThemeType, slideLayout?: string): LayoutVariant {
  if (slideLayout) {
    const layoutMap: Record<string, LayoutVariant> = {
      "title-center": "centered",
      "title-left": "left-content",
      "content-left-image-right": "left-content",
      "content-right-image-left": "right-content",
      "content-grid-2": "grid-2-col",
      "content-grid-3": "grid-3-col",
      "content-grid-4": "grid-4-card",
      "content-cards-2": "cards-2",
      "content-cards-3": "cards-3",
      "content-full-image": "full-image",
      "content-split-diagonal": "split-diagonal",
      "content-timeline": "timeline",
      "content-comparison": "comparison",
      "content-quote": "quote-style",
      "content-stats": "stats-grid",
      "content-centered-image": "centered-image",
      "content-feature-showcase": "feature-showcase",
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
      "nebula-float": "nebula-float",
      "orbital-rings": "orbital-rings",
      "starfield-cards": "starfield-cards",
      "cosmic-portal": "cosmic-portal",
      "galaxy-split": "galaxy-split",
      "celestial-frame": "celestial-frame",
      "mono-brutalist": "mono-brutalist",
      "geometric-slice": "geometric-slice",
      "contrast-blocks": "contrast-blocks",
      "angular-frame": "angular-frame",
      "stripe-accent": "stripe-accent",
      "bold-stack": "bold-stack",
      "cloud-float": "cloud-float",
      "sakura-cards": "sakura-cards",
      "dreamy-split": "dreamy-split",
      "soft-bubble": "soft-bubble",
      "twilight-frame": "twilight-frame",
      "pastel-stack": "pastel-stack",
      "terminal-window": "terminal-window",
      "matrix-cards": "matrix-cards",
      "code-block": "code-block",
      "shell-prompt": "shell-prompt",
      "cyber-grid": "cyber-grid",
      "hack-split": "hack-split",
      "grid-2-col": "grid-2-col",
      "grid-3-col": "grid-3-col",
      "grid-4-card": "grid-4-card",
      "cards-2": "cards-2",
      "cards-3": "cards-3",
      "comparison": "comparison",
      "stats-grid": "stats-grid",
      "full-image": "full-image",
      "image-background": "image-background",
      "centered-image": "centered-image",
      "feature-showcase": "feature-showcase",
      "image-top": "image-top",
      "image-bottom": "image-bottom",
      "image-left": "right-content",
      "image-right": "left-content",
      "no-image": "centered",
      "image-full": "full-image",
      "title-centered": "centered",
      "chart-left": "chart-left",
      "chart-right": "chart-right",
    };
    const mappedLayout = layoutMap[slideLayout];
    if (mappedLayout) return mappedLayout;
  }

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
    "custom-dark": ["left-content", "image-focus", "right-content", "cards-grid", "minimal-left", "centered"],
    "custom-light": ["centered", "left-content", "cards-grid", "right-content", "quote-style", "minimal-left"],
  };
  const layouts = layoutsByTheme[themeType];
  return layouts[index % layouts.length]!;
}
