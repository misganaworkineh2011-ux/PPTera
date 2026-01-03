// Theme exports - centralized theme management

// Re-export types
export type {
  Theme,
  ThemeColors,
  ThemeFonts,
  ThemeDesign,
  ThemeSlideStyles,
  ThemeCardBox,
  ThemeGradients,
  ThemeCSSVariables,
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
import { sproutTheme } from "./sprout";
import { corporateCleanTheme } from "./corporate-clean";
import { nebulaTheme } from "./nebula";
import { auroraTheme } from "./aurora";
import { obsidianTheme } from "./obsidian";
import { emberTheme } from "./ember";
import { frostTheme } from "./frost";
import { sakuraTheme } from "./sakura";
import { midnightTheme } from "./midnight";
import { terracottaTheme } from "./terracotta";

// Re-export themes for direct imports
export {
  sproutTheme,
  corporateCleanTheme,
  nebulaTheme,
  auroraTheme,
  obsidianTheme,
  emberTheme,
  frostTheme,
  sakuraTheme,
  midnightTheme,
  terracottaTheme,
};

// All themes array
export const themes = [
  sproutTheme,
  corporateCleanTheme,
  nebulaTheme,
  auroraTheme,
  obsidianTheme,
  emberTheme,
  frostTheme,
  sakuraTheme,
  midnightTheme,
  terracottaTheme,
];

// Helper functions
export const getThemeById = (id: string) => {
  return themes.find((theme) => theme.id === id) ?? sproutTheme;
};

export const getDefaultTheme = () => {
  return sproutTheme;
};

// Re-export custom theme utilities for convenience
export {
  isCustomThemeId,
  getCustomThemeDbId,
  convertCustomThemeToTheme,
} from "../custom-theme-utils";
