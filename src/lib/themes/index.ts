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
import { retroMotorbikeTheme } from "./vintage-botanical";
import { roseStripesTheme } from "./rose-garden";
import { botanicalGardenTheme } from "./golden-meadow";
import { cozyCottageTheme } from "./autumn-harvest";
import { urbanBuildingTheme } from "./urban-building";
import { sunsetCoastTheme } from "./sunset-coast";
import { goldenHorizonTheme } from "./golden-horizon";
import { lavenderFieldsTheme } from "./lavender-fields";
import { desertSandTheme } from "./desert-sand";
import { mistyForestTheme } from "./misty-forest";
import { tropicalJungleTheme } from "./tropical-jungle";
import { citrusSplashTheme } from "./citrus-splash";
import { vintageWineTheme } from "./vintage-wine";
import { sunnyBeachTheme } from "./sunny-beach";
import { industrialSteelTheme } from "./industrial-steel";
import { japaneseGardenTheme } from "./japanese-garden";
import { nauticalEleganceTheme } from "./nautical-elegance";
import { springBlossomTheme } from "./spring-blossom";
import { autumnSunsetTheme } from "./autumn-sunset";
import { royalVelvetTheme } from "./royal-velvet";
import { midnightGoldTheme } from "./midnight-gold";
import { cherryBlossomTheme } from "./cherry-blossom";
import { primaryBoldTheme } from "./primary-bold";
import { violetDreamTheme } from "./violet-dream";
import { rusticEarthTheme } from "./rustic-earth";
import { copperSpiceTheme } from "./copper-spice";
import { mintTangerineTheme } from "./mint-tangerine";
import { vintageCreamTheme } from "./vintage-cream";
import { oceanPeachTheme } from "./ocean-peach";

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
  retroMotorbikeTheme,
  roseStripesTheme,
  botanicalGardenTheme,
  cozyCottageTheme,
  urbanBuildingTheme,
  sunsetCoastTheme,
  goldenHorizonTheme,
  lavenderFieldsTheme,
  desertSandTheme,
  mistyForestTheme,
  tropicalJungleTheme,
  citrusSplashTheme,
  vintageWineTheme,
  sunnyBeachTheme,
  industrialSteelTheme,
  japaneseGardenTheme,
  nauticalEleganceTheme,
  springBlossomTheme,
  autumnSunsetTheme,
  royalVelvetTheme,
  midnightGoldTheme,
  cherryBlossomTheme,
  primaryBoldTheme,
  violetDreamTheme,
  rusticEarthTheme,
  copperSpiceTheme,
  mintTangerineTheme,
  vintageCreamTheme,
  oceanPeachTheme,
};

// All themes array - alternating non-image and image background themes for variety
export const themes = [
  // Non-image, Image, Non-image, Image pattern
  corporateCleanTheme,        // non-image
  oceanPeachTheme,            // image
  blackGoldLuxuryTheme,       // non-image
  japaneseGardenTheme,        // image
  sageGardenTheme,            // non-image
  nauticalEleganceTheme,      // image
  lavenderDreamTheme,         // non-image
  springBlossomTheme,         // image
  paperCraftTheme,            // non-image
  autumnSunsetTheme,          // image
  skyBlueTheme,               // non-image
  royalVelvetTheme,           // image
  coastalBreezeTheme,         // non-image
  midnightGoldTheme,          // image
  frostTheme,                 // non-image
  cherryBlossomTheme,         // image
  nebulaTheme,                // non-image
  primaryBoldTheme,           // image
  emberTheme,                 // non-image
  violetDreamTheme,           // image
  auroraTheme,                // non-image
  rusticEarthTheme,           // image
  sakuraTheme,                // non-image
  copperSpiceTheme,           // image
  terracottaTheme,            // non-image
  mintTangerineTheme,         // image
  obsidianTheme,              // non-image
  vintageCreamTheme,          // image
  midnightTheme,              // non-image
  retroMotorbikeTheme,        // image
  sunsetGradientTheme,        // non-image
  roseStripesTheme,           // image
  hackerTerminalTheme,        // non-image
  botanicalGardenTheme,       // image
  cyberpunkNeonTheme,         // non-image
  cozyCottageTheme,           // image
  neonMatrixTheme,            // non-image
  urbanBuildingTheme,         // image
  midnightBorderTheme,        // non-image
  sunsetCoastTheme,           // image
  dnaBlueprintTheme,          // non-image
  goldenHorizonTheme,         // image
  animeDreamscapeTheme,       // non-image
  lavenderFieldsTheme,        // image
  auroraBorealisTechTheme,    // non-image
  desertSandTheme,            // image
  mistyForestTheme,           // image
  tropicalJungleTheme,        // image
  citrusSplashTheme,          // image
  vintageWineTheme,           // image
  sunnyBeachTheme,            // image
  industrialSteelTheme,       // image
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
