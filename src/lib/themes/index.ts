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
// New themes from color palettes
import { sageOliveTheme } from "./sage-olive";
import { forestMistTheme } from "./forest-mist";
import { oceanDepthTheme } from "./ocean-depth";
import { coralTealTheme } from "./coral-teal";
import { tealNavyTheme } from "./teal-navy";
import { warmCrimsonTheme } from "./warm-crimson";
import { springPastelTheme } from "./spring-pastel";
import { earthForestTheme } from "./earth-forest";
import { tropicalSunsetTheme } from "./tropical-sunset";
import { goldenSageTheme } from "./golden-sage";
import { fireGradientTheme } from "./fire-gradient";
import { modernSlateTheme } from "./modern-slate";
import { neonPopTheme } from "./neon-pop";
import { royalPurpleTheme } from "./royal-purple";
import { sunsetWarmTheme } from "./sunset-warm";
import { dustyRoseTheme } from "./dusty-rose";
import { oceanBlueSerenityTheme } from "./ocean-blue-serenity";
import { watermelonSorbetTheme } from "./watermelon-sorbet";

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
  // New themes from color palettes
  sageOliveTheme,
  forestMistTheme,
  oceanDepthTheme,
  coralTealTheme,
  tealNavyTheme,
  warmCrimsonTheme,
  springPastelTheme,
  earthForestTheme,
  tropicalSunsetTheme,
  goldenSageTheme,
  fireGradientTheme,
  modernSlateTheme,
  neonPopTheme,
  royalPurpleTheme,
  sunsetWarmTheme,
  dustyRoseTheme,
  oceanBlueSerenityTheme,
  watermelonSorbetTheme,
};

// Themes with background images (need to be distributed evenly)
const themesWithBgImage = [
  retroMotorbikeTheme,      // vintage-botanical
  roseStripesTheme,         // rose-garden
  botanicalGardenTheme,     // golden-meadow
  cozyCottageTheme,         // autumn-harvest
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
];

// Themes without background images (solid colors/gradients only)
const themesWithoutBgImage = [
  corporateCleanTheme,
  watermelonSorbetTheme,
  oceanBlueSerenityTheme,
  forestMistTheme,
  blackGoldLuxuryTheme,
  coralTealTheme,
  modernSlateTheme,
  sageGardenTheme,
  tropicalSunsetTheme,
  royalPurpleTheme,
  lavenderDreamTheme,
  oceanDepthTheme,
  fireGradientTheme,
  paperCraftTheme,
  tealNavyTheme,
  goldenSageTheme,
  skyBlueTheme,
  warmCrimsonTheme,
  sageOliveTheme,
  coastalBreezeTheme,
  neonPopTheme,
  springPastelTheme,
  frostTheme,
  earthForestTheme,
  dustyRoseTheme,
  nebulaTheme,
  sunsetWarmTheme,
  primaryBoldTheme,
  oceanPeachTheme,
  emberTheme,
  violetDreamTheme,
  auroraTheme,
  rusticEarthTheme,
  sakuraTheme,
  copperSpiceTheme,
  terracottaTheme,
  mintTangerineTheme,
  obsidianTheme,
  vintageCreamTheme,
  midnightTheme,
  sunsetGradientTheme,
  hackerTerminalTheme,
  cyberpunkNeonTheme,
  neonMatrixTheme,
  midnightBorderTheme,
  dnaBlueprintTheme,
  animeDreamscapeTheme,
  auroraBorealisTechTheme,
];

// Interleave themes: distribute bg image themes evenly among non-bg themes
// Pattern: 2-3 non-bg themes, then 1 bg theme (with occasional 2 consecutive bg themes for variety)
function interleaveThemes() {
  const result: typeof corporateCleanTheme[] = [];
  const bgThemes = [...themesWithBgImage];
  const nonBgThemes = [...themesWithoutBgImage];
  
  let bgIndex = 0;
  let nonBgIndex = 0;
  let patternCounter = 0;
  
  while (bgIndex < bgThemes.length || nonBgIndex < nonBgThemes.length) {
    // Add 2-3 non-bg themes
    const nonBgCount = patternCounter % 5 === 0 ? 2 : 3; // Vary between 2 and 3
    for (let i = 0; i < nonBgCount && nonBgIndex < nonBgThemes.length; i++) {
      const theme = nonBgThemes[nonBgIndex];
      if (theme) result.push(theme);
      nonBgIndex++;
    }
    
    // Add 1 bg theme (occasionally 2 for variety - every 4th pattern)
    if (bgIndex < bgThemes.length) {
      const theme = bgThemes[bgIndex];
      if (theme) result.push(theme);
      bgIndex++;
      
      // Every 4th pattern, add a second consecutive bg theme if available
      if (patternCounter % 4 === 3 && bgIndex < bgThemes.length) {
        const theme2 = bgThemes[bgIndex];
        if (theme2) result.push(theme2);
        bgIndex++;
      }
    }
    
    patternCounter++;
  }
  
  return result;
}

// All themes array - interleaved for even distribution of bg image themes
export const themes = interleaveThemes();

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
