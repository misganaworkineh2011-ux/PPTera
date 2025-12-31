// Theme exports - centralized theme management

// Re-export types
export type {
  Theme,
  ThemeColors,
  ThemeFonts,
  ThemeDesign,
  ThemeSlideStyles,
} from "./types";

// Import theme
import { corporateClean } from "./corporate-clean";

// Re-export theme for direct imports
export { corporateClean };

// All themes array
export const themes = [corporateClean];

// Helper functions
export const getThemeById = (id: string) => {
  return themes.find((theme) => theme.id === id) || corporateClean;
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
