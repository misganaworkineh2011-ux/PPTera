// Re-export everything from the themes folder for backward compatibility
// This file maintains the same API while themes are now organized in separate files

export {
  // Types
  type Theme,
  type ThemeColors,
  type ThemeFonts,
  type ThemeDesign,
  type ThemeSlideStyles,
  // Themes array and helpers
  themes,
  getThemeById,
  getDefaultTheme,
  // Individual themes (for direct imports if needed)
  elegantNoir,
  arcticFrost,
  sunsetGradient,
  oceanDepths,
  auroraBorealis,
  emberForge,
  midnightGarden,
  cyberNeon,
} from "./themes/index";
