/**
 * Midnight Theme
 * Deep blue night sky theme with silver moonlight accents.
 * Features rich navy blues, soft silvers, and subtle starlight effects.
 * Perfect for elegant, sophisticated, and premium presentations.
 */

import type { Theme } from "./types";

const THEME_ID = "midnight";

export const midnightTheme: Theme = {
  id: THEME_ID,
  name: "Midnight",
  description: "Deep navy night theme with silver moonlight accents",
  category: "dark",

  colors: {
    background: "#0f172a",
    backgroundAlt: "#1e293b",
    surface: "#1e293b",
    surfaceHover: "#334155",

    text: "#e2e8f0",
    textMuted: "#94a3b8",
    textInverse: "#0f172a",
    heading: "#f8fafc",

    primary: "#a5b4fc",
    primaryHover: "#c7d2fe",
    secondary: "#818cf8",
    secondaryHover: "#a5b4fc",
    accent: "#e0e7ff",

    border: "#334155",
    borderStrong: "#475569",
    borderHover: "#64748b",

    shadow: "rgba(165, 180, 252, 0.15)",
    overlay: "rgba(15, 23, 42, 0.9)",
    glow: "rgba(165, 180, 252, 0.4)",

    link: "#c7d2fe",
    linkHover: "#e0e7ff",

    success: "#34d399",
    warning: "#fbbf24",
    error: "#f87171",
  },

  fonts: {
    heading: {
      family: "'Cormorant Garamond', serif",
      weight: 700,
      letterSpacing: "0em",
    },
    body: {
      family: "'Source Sans 3', var(--font-geist-sans), sans-serif",
      weight: 400,
      lineHeight: "1.7",
    },
    caption: {
      family: "'Source Sans 3', var(--font-geist-sans), sans-serif",
      weight: 500,
      size: "0.875rem",
    },
    mono: {
      family: "'JetBrains Mono', monospace",
    },
    googleFontsUrls: [
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Source+Sans+3:wght@400;500;600;700&display=swap",
    ],
  },

  design: {
    borderRadius: {
      small: "0.375rem",
      medium: "0.75rem",
      large: "1.25rem",
      full: "9999px",
    },
    shadows: {
      small: "0 2px 8px rgba(165, 180, 252, 0.1)",
      medium: "0 8px 24px rgba(165, 180, 252, 0.15)",
      large: "0 16px 48px rgba(165, 180, 252, 0.2)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
      pattern: "radial-gradient(ellipse at 25% 25%, rgba(165, 180, 252, 0.1) 0%, transparent 50%), radial-gradient(ellipse at 75% 75%, rgba(129, 140, 248, 0.08) 0%, transparent 50%)",
    },
    content: {
      background: "#1e293b",
      bulletStyle: "circle",
    },
    image: {
      borderRadius: "0.75rem",
      shadow: "0 12px 40px rgba(165, 180, 252, 0.2)",
      overlay: "linear-gradient(to top, rgba(15, 23, 42, 0.8), transparent)",
    },
  },

  cardBox: {
    background: "#1e293b",
    borderColor: "#475569",
    titleColor: "#f8fafc",
    bodyColor: "#e2e8f0",
    accentColor: "#a5b4fc",
    shadow: "none",
    hoverBackground: "#334155",
    hoverBorderColor: "#64748b",
  },

  layoutElements: {
    background: "#334155",
    borderColor: "#475569",
    hoverBackground: "#3f4f66",
  },

  gradients: {
    primary: "linear-gradient(135deg, #a5b4fc 0%, #818cf8 50%, #e0e7ff 100%)",
    secondary: "linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e293b 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(15, 23, 42, 0.95) 100%)",
    text: "linear-gradient(135deg, #a5b4fc 0%, #e0e7ff 100%)",
  },

  preview: {
    titleBg: "#1e293b",
    bodyBg: "#0f172a",
    textColor: "#e2e8f0",
    accentColor: "#a5b4fc",
  },

  backgroundImage: undefined,
  previewBackgroundImage: undefined,
  backgroundPosition: "center",
  backgroundSize: "cover",

  overlay: "rgba(15, 23, 42, 0.85)",

  pageBackground: "radial-gradient(ellipse at 10% 10%, rgba(165, 180, 252, 0.12) 0%, transparent 40%), radial-gradient(ellipse at 90% 90%, rgba(129, 140, 248, 0.08) 0%, transparent 45%), radial-gradient(ellipse at 50% 50%, rgba(224, 231, 255, 0.05) 0%, transparent 50%), linear-gradient(180deg, #0f172a 0%, #1e293b 40%, #0f172a 100%)",

  cssVariables: {
    "--midnight-glow": "0 0 30px rgba(165, 180, 252, 0.3)",
    "--midnight-star": "0 0 10px rgba(224, 231, 255, 0.5)",
  },
};

export default midnightTheme;
