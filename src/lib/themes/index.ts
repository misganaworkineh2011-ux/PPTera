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

// Import themes
import { corporateClean } from "./corporate-clean";
import { elegantNoir } from "./elegant-noir";

// Re-export themes for direct imports
export { corporateClean, elegantNoir };

// All themes array
export const themes = [corporateClean, elegantNoir];

// Helper functions
export const getThemeById = (id: string) => {
  return themes.find((theme) => theme.id === id) ?? corporateClean;
};

export const getDefaultTheme = () => {
  return corporateClean;
};

// Re-export custom theme utilities for convenience
export {
  isCustomThemeId,
  getCustomThemeDbId,
  convertCustomThemeToTheme,
} from "../custom-theme-utils";
