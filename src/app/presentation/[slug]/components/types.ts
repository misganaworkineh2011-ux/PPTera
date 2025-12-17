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
  
  if (theme.id === "arctic-frost") return "light";
  if (theme.id === "sunset-gradient") return "sunset";
  if (theme.id === "ocean-depths") return "ocean";
  if (theme.id === "aurora-borealis") return "aurora";
  if (theme.id === "ember-forge") return "ember";
  if (theme.id === "midnight-garden") return "midnight";
  if (theme.id === "cyber-neon") return "cyber";
  if (theme.id === "alien-tech") return "alien";
  if (theme.id === "corporate-clean") return "corporate";
  if (theme.id === "cosmic-voyage") return "cosmic";
  if (theme.id === "architectural-mono") return "architectural";
  if (theme.id === "anime-dreamscape") return "anime";
  if (theme.id === "hacker-terminal") return "hacker";
  return "dark"; // elegant-noir and default
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
