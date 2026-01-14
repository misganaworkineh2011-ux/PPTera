// Re-export everything from the themes folder for backward compatibility
// This file maintains the same API while themes are now organized in separate files

export {
  // Types
  type Theme,
  type ThemeColors,
  type ThemeFonts,
  type ThemeDesign,
  type ThemeSlideStyles,
  type ThemeSlideShape,
  type SlideShapeType,
  type ThemeCardBox,
  type ThemeGradients,
  type ThemeCSSVariables,
  // Slide shape utilities
  DEFAULT_SLIDE_SHAPES,
  getSlideShapeStyles,
  // Base design system
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
  // Theme utilities
  themeToCSSVariables,
  applyThemeToElement,
  getThemeStyleObject,
  generateThemeCSS,
  isColorDark,
  getContrastingTextColor,
  lightenColor,
  darkenColor,
  hexToRgba,
  // Themes array and helpers
  themes,
  getThemeById,
  getDefaultTheme,
  // Individual themes
  corporateCleanTheme,
  nebulaTheme,
  auroraTheme,
  obsidianTheme,
  emberTheme,
  frostTheme,
  sakuraTheme,
  midnightTheme,
  terracottaTheme,
} from "./themes/index";

// Re-export theme provider
export {
  SlideThemeProvider,
  useSlideTheme,
  useThemeColors,
  useThemeFonts,
  useThemeCardBox,
  useThemeGradients,
} from "./themes/ThemeProvider";

