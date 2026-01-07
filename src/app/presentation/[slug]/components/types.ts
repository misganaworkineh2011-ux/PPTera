import type { Theme } from "~/lib/themes";

// Theme type helper
export type ThemeType =
  | "dark"
  | "light"
  | "sunset"
  | "ocean"
  | "aurora"
  | "ember"
  | "midnight"
  | "cyber"
  | "alien"
  | "corporate"
  | "cosmic"
  | "architectural"
  | "anime"
  | "hacker"
  | "custom-dark"
  | "custom-light";

// Helper to determine if a color is dark
function isColorDark(hexColor: string): boolean {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

export function getThemeType(theme: Theme): ThemeType {
  // Check for custom themes first
  if (theme.id.startsWith("custom-")) {
    return isColorDark(theme.colors.background) ? "custom-dark" : "custom-light";
  }
  
  // Light background themes - need dark text in navbar
  if (theme.id === "arctic-frost") return "light";
  if (theme.id === "sage-garden") return "light";
  if (theme.id === "paper-craft") return "light";
  if (theme.id === "sky-blue") return "light";
  if (theme.id === "coastal-breeze") return "light";
  if (theme.id === "lavender-dream") return "light";
  if (theme.id === "frost") return "light";
  if (theme.id === "sakura") return "light";
  if (theme.id === "terracotta") return "light";
  
  // Corporate/professional themes
  if (theme.id === "corporate-clean") return "corporate";
  
  // Dark themes with specific color schemes
  if (theme.id === "sunset-gradient") return "sunset";
  if (theme.id === "ocean-depths") return "ocean";
  if (theme.id === "aurora-borealis") return "aurora";
  if (theme.id === "aurora-borealis-tech") return "aurora";
  if (theme.id === "ember-forge") return "ember";
  if (theme.id === "ember") return "ember";
  if (theme.id === "midnight-garden") return "midnight";
  if (theme.id === "midnight") return "midnight";
  if (theme.id === "midnight-border") return "midnight";
  if (theme.id === "cyber-neon") return "cyber";
  if (theme.id === "cyberpunk-neon") return "cyber";
  if (theme.id === "alien-tech") return "alien";
  if (theme.id === "neon-matrix") return "alien";
  if (theme.id === "cosmic-voyage") return "cosmic";
  if (theme.id === "nebula") return "cosmic";
  if (theme.id === "architectural-mono") return "architectural";
  if (theme.id === "obsidian") return "architectural";
  if (theme.id === "black-gold-luxury") return "architectural";
  if (theme.id === "anime-dreamscape") return "anime";
  if (theme.id === "hacker-terminal") return "hacker";
  if (theme.id === "dna-blueprint") return "cyber";
  
  // For any unknown theme, check if background is dark or light
  return isColorDark(theme.colors.background) ? "dark" : "light";
}

export function getGoogleFontsUrl(theme: Theme): string {
  const fonts = new Set<string>();
  const extractFontName = (family: string) =>
    family.split(",")[0]?.replace(/['"]/g, "").trim() || "";
  fonts.add(extractFontName(theme.fonts.heading.family));
  fonts.add(extractFontName(theme.fonts.body.family));
  const fontParams = Array.from(fonts)
    .filter(
      (f) =>
        f && !["sans-serif", "serif", "monospace"].includes(f.toLowerCase())
    )
    .map((f) => `family=${f.replace(/\s+/g, "+")}:wght@400;500;600;700`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${fontParams}&display=swap`;
}
