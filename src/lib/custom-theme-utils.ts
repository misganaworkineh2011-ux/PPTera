import type { Theme } from "~/lib/themes/types";

// Font family mapping for custom themes
const fontFamilyMap: Record<string, string> = {
  inter: "'Inter', sans-serif",
  roboto: "'Roboto', sans-serif",
  poppins: "'Poppins', sans-serif",
  montserrat: "'Montserrat', sans-serif",
  lato: "'Lato', sans-serif",
  "open-sans": "'Open Sans', sans-serif",
  playfair: "'Playfair Display', serif",
  merriweather: "'Merriweather', serif",
  "source-code": "'Source Code Pro', monospace",
  "space-grotesk": "'Space Grotesk', sans-serif",
};

// Curated color palettes - fallback for older themes
const CURATED_PALETTES: Record<string, { background: string; backgroundAlt: string; text: string; heading: string; primary: string; accent: string }> = {
  "clean-white": { background: "#ffffff", backgroundAlt: "#f8fafc", text: "#334155", heading: "#0f172a", primary: "#3b82f6", accent: "#06b6d4" },
  "soft-cream": { background: "#fefce8", backgroundAlt: "#fef9c3", text: "#713f12", heading: "#422006", primary: "#ca8a04", accent: "#eab308" },
  "elegant-noir": { background: "#0a0a0b", backgroundAlt: "#1a1a1d", text: "#e4e4e7", heading: "#fafafa", primary: "#f59e0b", accent: "#6366f1" },
  "midnight-blue": { background: "#0f172a", backgroundAlt: "#1e293b", text: "#cbd5e1", heading: "#f1f5f9", primary: "#3b82f6", accent: "#06b6d4" },
  "forest-green": { background: "#052e16", backgroundAlt: "#14532d", text: "#bbf7d0", heading: "#dcfce7", primary: "#22c55e", accent: "#4ade80" },
  "ocean-depths": { background: "#0c4a6e", backgroundAlt: "#075985", text: "#bae6fd", heading: "#e0f2fe", primary: "#0ea5e9", accent: "#38bdf8" },
  "sunset-warm": { background: "#fff7ed", backgroundAlt: "#ffedd5", text: "#9a3412", heading: "#7c2d12", primary: "#f97316", accent: "#fb923c" },
  "rose-garden": { background: "#fff1f2", backgroundAlt: "#ffe4e6", text: "#9f1239", heading: "#881337", primary: "#f43f5e", accent: "#fb7185" },
  "purple-haze": { background: "#2e1065", backgroundAlt: "#4c1d95", text: "#e9d5ff", heading: "#f3e8ff", primary: "#a855f7", accent: "#c084fc" },
  "cyber-neon": { background: "#020617", backgroundAlt: "#0f172a", text: "#22d3ee", heading: "#67e8f9", primary: "#06b6d4", accent: "#f0abfc" },
  "corporate-gray": { background: "#f8fafc", backgroundAlt: "#f1f5f9", text: "#475569", heading: "#1e293b", primary: "#64748b", accent: "#94a3b8" },
  "warm-earth": { background: "#faf5f0", backgroundAlt: "#f5ebe0", text: "#78350f", heading: "#451a03", primary: "#b45309", accent: "#d97706" },
};

// Check if a theme ID is a custom theme
export function isCustomThemeId(id: string): boolean {
  return id.startsWith("custom-");
}

// Extract the database ID from a custom theme ID
export function getCustomThemeDbId(customThemeId: string): string {
  return customThemeId.replace("custom-", "");
}

// Helper to determine if a color is dark
function isColorDark(hexColor: string): boolean {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  // Using relative luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

// Helper to lighten/darken a color
function adjustColor(hexColor: string, amount: number): string {
  const hex = hexColor.replace("#", "");
  const r = Math.min(255, Math.max(0, parseInt(hex.substring(0, 2), 16) + amount));
  const g = Math.min(255, Math.max(0, parseInt(hex.substring(2, 4), 16) + amount));
  const b = Math.min(255, Math.max(0, parseInt(hex.substring(4, 6), 16) + amount));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

// Helper to add alpha to a hex color
function hexToRgba(hexColor: string, alpha: number): string {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Convert a custom theme from database format to Theme format
export function convertCustomThemeToTheme(dbTheme: {
  id: string;
  name: string;
  colors: any;
  fonts: any;
  designElements?: any;
}): Theme {
  // Try to get colors from custom field first, then fall back to curated palette
  let colors = dbTheme.colors?.custom;
  
  // If custom colors are missing or incomplete, try to resolve from curated palette
  if (!colors || !colors.background) {
    const paletteId = dbTheme.colors?.palette;
    if (paletteId && CURATED_PALETTES[paletteId]) {
      colors = CURATED_PALETTES[paletteId];
    }
  }
  
  // Final fallback to default colors
  if (!colors || !colors.background) {
    colors = {
      background: "#ffffff",
      backgroundAlt: "#f8fafc",
      text: "#334155",
      heading: "#0f172a",
      primary: "#3b82f6",
      accent: "#06b6d4",
    };
  }

  const headingFont = fontFamilyMap[dbTheme.fonts?.heading] || "'Inter', sans-serif";
  const bodyFont = fontFamilyMap[dbTheme.fonts?.body] || "'Inter', sans-serif";
  
  // Determine if this is a dark theme
  const isDark = isColorDark(colors.background);
  
  // Generate derived colors
  const primaryHover = adjustColor(colors.primary, isDark ? 20 : -20);
  const accentHover = adjustColor(colors.accent, isDark ? 20 : -20);
  const textMuted = hexToRgba(colors.text, 0.7);
  const borderColor = isDark ? adjustColor(colors.backgroundAlt, 20) : adjustColor(colors.backgroundAlt, -20);
  const borderHover = isDark ? adjustColor(colors.backgroundAlt, 40) : adjustColor(colors.backgroundAlt, -40);
  const shadowColor = isDark ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.1)";
  
  // Shadow intensities based on theme darkness
  const shadowSmall = isDark ? "0 2px 8px rgba(0, 0, 0, 0.3)" : "0 2px 8px rgba(0, 0, 0, 0.1)";
  const shadowMedium = isDark ? "0 8px 24px rgba(0, 0, 0, 0.4)" : "0 8px 24px rgba(0, 0, 0, 0.15)";
  const shadowLarge = isDark ? "0 16px 48px rgba(0, 0, 0, 0.5)" : "0 16px 48px rgba(0, 0, 0, 0.2)";

  return {
    id: `custom-${dbTheme.id}`,
    name: dbTheme.name,
    description: "Your custom theme",
    category: isDark ? "bold" : "creative",
    colors: {
      background: colors.background,
      backgroundAlt: colors.backgroundAlt,
      surface: colors.backgroundAlt,
      text: colors.text,
      textMuted: textMuted,
      heading: colors.heading,
      link: colors.accent,
      linkHover: accentHover,
      primary: colors.primary,
      primaryHover: primaryHover,
      secondary: colors.accent,
      secondaryHover: accentHover,
      accent: colors.accent,
      border: borderColor,
      borderHover: borderHover,
      shadow: shadowColor,
      success: "#22c55e",
      warning: "#f59e0b",
      error: "#ef4444",
    },
    fonts: {
      heading: { family: headingFont, weight: 700, letterSpacing: "-0.02em" },
      body: { family: bodyFont, weight: 400, lineHeight: "1.7" },
      caption: { family: bodyFont, weight: 500, size: "0.875rem" },
    },
    design: {
      borderRadius: { small: "0.5rem", medium: "0.75rem", large: "1rem", full: "9999px" },
      shadows: {
        small: shadowSmall,
        medium: shadowMedium,
        large: shadowLarge,
      },
      spacing: { tight: "0.5rem", normal: "1.25rem", relaxed: "2rem" },
    },
    slideStyles: {
      title: {
        background: `linear-gradient(135deg, ${colors.background} 0%, ${colors.backgroundAlt} 50%, ${colors.background} 100%)`,
        pattern: `radial-gradient(ellipse at 30% 20%, ${hexToRgba(colors.primary, 0.15)} 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, ${hexToRgba(colors.accent, 0.1)} 0%, transparent 40%)`,
      },
      content: {
        background: `linear-gradient(180deg, ${colors.background} 0%, ${colors.backgroundAlt} 100%)`,
        bulletStyle: "circle",
      },
      image: {
        borderRadius: "0.75rem",
        shadow: shadowLarge,
        overlay: `linear-gradient(to top, ${hexToRgba(colors.background, 0.9)} 0%, transparent 60%)`,
      },
    },
    preview: {
      titleBg: `linear-gradient(135deg, ${colors.backgroundAlt} 0%, ${colors.background} 100%)`,
      bodyBg: colors.background,
      textColor: colors.text,
      accentColor: colors.accent,
    },
    overlay: `linear-gradient(180deg, ${hexToRgba(colors.background, 0.4)} 0%, ${hexToRgba(colors.background, 0.2)} 100%)`,
    cardBox: {
      background: hexToRgba(colors.backgroundAlt, 0.8),
      borderColor: hexToRgba(colors.primary, 0.2),
      titleColor: colors.heading,
      bodyColor: colors.text,
      accentColor: colors.accent,
      shadow: shadowMedium,
    },
    // Page background gradient for the presentation viewer - matches built-in theme pattern
    // Pattern: from-[background] via-[backgroundAlt] to-[background] for a subtle but visible gradient
    pageBackground: isDark
      ? `linear-gradient(to bottom right, ${colors.background}, ${colors.backgroundAlt}, ${colors.background})`
      : `linear-gradient(to bottom right, ${colors.background}, ${colors.backgroundAlt}, ${colors.background})`,
  };
}
