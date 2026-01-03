/**
 * Terracotta Theme
 * Earthy Mediterranean theme with warm terracotta, olive greens, and sandy tones.
 * Features natural earth colors with a rustic, organic feel.
 * Perfect for lifestyle, travel, food, and nature presentations.
 */

import type { Theme } from "./types";

const THEME_ID = "terracotta";

export const terracottaTheme: Theme = {
  id: THEME_ID,
  name: "Terracotta",
  description: "Earthy Mediterranean theme with warm terracotta and olive tones",
  category: "light",

  colors: {
    background: "#faf7f5",
    backgroundAlt: "#f5f0eb",
    surface: "#ffffff",
    surfaceHover: "#f5f0eb",

    text: "#3d3229",
    textMuted: "#6b5d52",
    textInverse: "#ffffff",
    heading: "#2d241d",

    primary: "#c2410c",
    primaryHover: "#ea580c",
    secondary: "#65a30d",
    secondaryHover: "#84cc16",
    accent: "#b45309",

    border: "#e8ddd4",
    borderStrong: "#d4c4b5",
    borderHover: "#c0ab96",

    shadow: "rgba(194, 65, 12, 0.12)",
    overlay: "rgba(45, 36, 29, 0.6)",
    glow: "rgba(194, 65, 12, 0.3)",

    link: "#9a3412",
    linkHover: "#7c2d12",

    success: "#16a34a",
    warning: "#ca8a04",
    error: "#dc2626",
  },

  fonts: {
    heading: {
      family: "'Libre Baskerville', serif",
      weight: 700,
      letterSpacing: "-0.01em",
    },
    body: {
      family: "'Nunito Sans', var(--font-geist-sans), sans-serif",
      weight: 400,
      lineHeight: "1.75",
    },
    caption: {
      family: "'Nunito Sans', var(--font-geist-sans), sans-serif",
      weight: 600,
      size: "0.875rem",
    },
    mono: {
      family: "'JetBrains Mono', monospace",
    },
    googleFontsUrls: [
      "https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Nunito+Sans:wght@400;500;600;700&display=swap",
    ],
  },

  design: {
    borderRadius: {
      small: "0.375rem",
      medium: "0.625rem",
      large: "1rem",
      full: "9999px",
    },
    shadows: {
      small: "0 2px 6px rgba(194, 65, 12, 0.08)",
      medium: "0 6px 16px rgba(194, 65, 12, 0.12)",
      large: "0 12px 32px rgba(194, 65, 12, 0.16)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #faf7f5 0%, #fef3c7 30%, #f5f0eb 100%)",
      pattern: "radial-gradient(ellipse at 20% 80%, rgba(194, 65, 12, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(101, 163, 13, 0.06) 0%, transparent 45%)",
    },
    content: {
      background: "#ffffff",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "0.625rem",
      shadow: "0 8px 24px rgba(194, 65, 12, 0.15)",
      overlay: "linear-gradient(to top, rgba(45, 36, 29, 0.6), transparent)",
    },
  },

  cardBox: {
    background: "#ffffff",
    borderColor: "#e8ddd4",
    titleColor: "#2d241d",
    bodyColor: "#4a3f35",
    accentColor: "#c2410c",
    shadow: "0 4px 16px rgba(194, 65, 12, 0.08)",
    hoverBackground: "#faf7f5",
    hoverBorderColor: "#d4c4b5",
  },

  layoutElements: {
    background: "#f5f0eb",
    borderColor: "#d4c4b5",
    hoverBackground: "#efe8e0",
  },

  gradients: {
    primary: "linear-gradient(135deg, #c2410c 0%, #65a30d 100%)",
    secondary: "linear-gradient(135deg, #faf7f5 0%, #fef3c7 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(45, 36, 29, 0.75) 100%)",
    text: "linear-gradient(135deg, #c2410c 0%, #b45309 100%)",
  },

  preview: {
    titleBg: "#fef3c7",
    bodyBg: "#ffffff",
    textColor: "#3d3229",
    accentColor: "#c2410c",
  },

  backgroundImage: undefined,
  previewBackgroundImage: undefined,
  backgroundPosition: "center",
  backgroundSize: "cover",

  overlay: "rgba(250, 247, 245, 0.9)",

  pageBackground: "radial-gradient(ellipse at 15% 85%, rgba(194, 65, 12, 0.08) 0%, transparent 45%), radial-gradient(ellipse at 85% 15%, rgba(101, 163, 13, 0.06) 0%, transparent 40%), radial-gradient(ellipse at 50% 50%, rgba(180, 83, 9, 0.04) 0%, transparent 50%), linear-gradient(180deg, #faf7f5 0%, #f5f0eb 40%, #faf7f5 100%)",

  cssVariables: {
    "--terracotta-glow": "0 0 20px rgba(194, 65, 12, 0.2)",
  },
};

export default terracottaTheme;
