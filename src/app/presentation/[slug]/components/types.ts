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
  | "alien";

export function getThemeType(theme: Theme): ThemeType {
  if (theme.id === "arctic-frost") return "light";
  if (theme.id === "sunset-gradient") return "sunset";
  if (theme.id === "ocean-depths") return "ocean";
  if (theme.id === "aurora-borealis") return "aurora";
  if (theme.id === "ember-forge") return "ember";
  if (theme.id === "midnight-garden") return "midnight";
  if (theme.id === "cyber-neon") return "cyber";
  if (theme.id === "alien-tech") return "alien";
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
