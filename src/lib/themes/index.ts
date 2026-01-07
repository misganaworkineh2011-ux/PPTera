// Theme exports - centralized theme management

// Re-export types
export type {
  Theme,
  ThemeColors,
  ThemeFonts,
  ThemeDesign,
  ThemeSlideStyles,
  ThemeSlideShape,
  SlideShapeType,
  ThemeCardBox,
  ThemeGradients,
  ThemeCSSVariables,
} from "./types";

// Re-export slide shape utilities
export {
  DEFAULT_SLIDE_SHAPES,
  getSlideShapeStyles,
} from "./types";

// Re-export base design system
export {
  baseDesignSystem,
  spacing,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  borderRadius,
  boxShadow,
  zIndex,
  breakpoints,
  transitionDuration,
  transitionTimingFunction,
  opacity,
  blur,
  aspectRatio,
  slideBase,
  cssVarNames,
} from "./base";

// Re-export theme utilities
export {
  themeToCSSVariables,
  applyThemeToElement,
  getThemeStyleObject,
  generateThemeCSS,
  isColorDark,
  getContrastingTextColor,
  lightenColor,
  darkenColor,
  hexToRgba,
} from "./theme-utils";

// Re-export Cloudinary helpers for theme assets
export {
  getSlideBackgroundUrl,
  getThemePreviewUrl,
  getThemeBackgroundPath,
} from "./cloudinary";

// Import themes
import { corporateCleanTheme } from "./corporate-clean";
import { nebulaTheme } from "./nebula";
import { auroraTheme } from "./aurora";
import { obsidianTheme } from "./obsidian";
import { emberTheme } from "./ember";
import { frostTheme } from "./frost";
import { sakuraTheme } from "./sakura";
import { midnightTheme } from "./midnight";
import { terracottaTheme } from "./terracotta";
import { animeDreamscapeTheme } from "./anime-dreamscape";
import { hackerTerminalTheme } from "./hacker-terminal";
import { cyberpunkNeonTheme } from "./cyberpunk-neon";
import { dnaBlueprintTheme } from "./dna-blueprint";
import { sunsetGradientTheme } from "./sunset-gradient";
import { auroraBorealisTechTheme } from "./aurora-borealis-tech";
import { sageGardenTheme } from "./sage-garden";
import { blackGoldLuxuryTheme } from "./black-gold-luxury";
import { lavenderDreamTheme } from "./lavender-dream";
import { paperCraftTheme } from "./paper-craft";
import { skyBlueTheme } from "./sky-blue";
import { coastalBreezeTheme } from "./coastal-breeze";
import { neonMatrixTheme } from "./neon-matrix";
import { midnightBorderTheme } from "./midnight-border";

// Re-export themes for direct imports
export {
  corporateCleanTheme,
  nebulaTheme,
  auroraTheme,
  obsidianTheme,
  emberTheme,
  frostTheme,
  sakuraTheme,
  midnightTheme,
  terracottaTheme,
  animeDreamscapeTheme,
  hackerTerminalTheme,
  cyberpunkNeonTheme,
  dnaBlueprintTheme,
  sunsetGradientTheme,
  auroraBorealisTechTheme,
  sageGardenTheme,
  blackGoldLuxuryTheme,
  lavenderDreamTheme,
  paperCraftTheme,
  skyBlueTheme,
  coastalBreezeTheme,
  neonMatrixTheme,
  midnightBorderTheme,
};

// All themes array - shuffled for variety
export const themes = [
  blackGoldLuxuryTheme,
  corporateCleanTheme,
  sunsetGradientTheme,
  obsidianTheme,
  sageGardenTheme,
  cyberpunkNeonTheme,
  frostTheme,
  midnightBorderTheme,
  nebulaTheme,
  paperCraftTheme,
  hackerTerminalTheme,
  coastalBreezeTheme,
  auroraTheme,
  lavenderDreamTheme,
  emberTheme,
  neonMatrixTheme,
  sakuraTheme,
  dnaBlueprintTheme,
  terracottaTheme,
  skyBlueTheme,
  midnightTheme,
  animeDreamscapeTheme,
  auroraBorealisTechTheme,
];

// Helper functions
export const getThemeById = (id: string) => {
  return themes.find((theme) => theme.id === id) ?? corporateCleanTheme;
};

export const getDefaultTheme = () => {
  return corporateCleanTheme;
};

// Re-export custom theme utilities for convenience
export {
  isCustomThemeId,
  getCustomThemeDbId,
  convertCustomThemeToTheme,
} from "../custom-theme-utils";
