// Theme exports - centralized theme management
// Each theme is in its own file for better organization and scalability

// Re-export types
export type {
  Theme,
  ThemeColors,
  ThemeFonts,
  ThemeDesign,
  ThemeSlideStyles,
} from "./types";

// Import all themes
import { elegantNoir } from "./elegant-noir";
import { arcticFrost } from "./arctic-frost";
import { sunsetGradient } from "./sunset-gradient";
import { oceanDepths } from "./ocean-depths";
import { auroraBorealis } from "./aurora-borealis";
import { emberForge } from "./ember-forge";
import { midnightGarden } from "./midnight-garden";
import { cyberNeon } from "./cyber-neon";
import { alienTech } from "./alien-tech";
import { corporateClean } from "./corporate-clean";

// Re-export individual themes for direct imports
export {
  elegantNoir,
  arcticFrost,
  sunsetGradient,
  oceanDepths,
  auroraBorealis,
  emberForge,
  midnightGarden,
  cyberNeon,
  alienTech,
  corporateClean,
};

// All themes array - add new themes here
export const themes = [
  elegantNoir,
  arcticFrost,
  sunsetGradient,
  oceanDepths,
  auroraBorealis,
  emberForge,
  midnightGarden,
  cyberNeon,
  alienTech,
  corporateClean,
];

// Helper functions
export const getThemeById = (id: string) => {
  return themes.find((theme) => theme.id === id) || elegantNoir;
};

export const getDefaultTheme = () => {
  return elegantNoir;
};
