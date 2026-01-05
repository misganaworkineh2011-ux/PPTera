/**
 * Anime Dreamscape Theme
 * Inspired by Japanese anime aesthetics - featuring soft teals, cyans, and dreamy pastels
 * with ethereal gradients. Perfect for creative, artistic, and cultural presentations.
 */

import type { Theme } from "./types";

const THEME_ID = "anime-dreamscape";

export const animeDreamscapeTheme: Theme = {
  id: THEME_ID,
  name: "Anime Dreamscape",
  description: "Dreamy anime-inspired theme with soft teals and ethereal gradients",
  category: "creative",

  colors: {
    background: "#0d1f2d",
    backgroundAlt: "#122a3a",
    surface: "#163545",
    surfaceHover: "#1d4255",

    text: "#e8f4f8",
    textMuted: "#9ec5d1",
    textInverse: "#0d1f2d",
    heading: "#ffffff",

    primary: "#2dd4bf",
    primaryHover: "#5eead4",
    secondary: "#38bdf8",
    secondaryHover: "#7dd3fc",
    accent: "#f472b6",

    border: "#1e4a5f",
    borderStrong: "#2a6580",
    borderHover: "#3580a0",

    shadow: "rgba(45, 212, 191, 0.15)",
    overlay: "rgba(13, 31, 45, 0.88)",
    glow: "rgba(45, 212, 191, 0.4)",

    link: "#5eead4",
    linkHover: "#99f6e4",

    success: "#34d399",
    warning: "#fbbf24",
    error: "#fb7185",
  },

  fonts: {
    heading: {
      family: "'Quicksand', sans-serif",
      weight: 700,
      letterSpacing: "-0.01em",
    },
    body: {
      family: "'Inter', var(--font-geist-sans), sans-serif",
      weight: 400,
      lineHeight: "1.7",
    },
    caption: {
      family: "'Inter', var(--font-geist-sans), sans-serif",
      weight: 500,
      size: "0.875rem",
    },
    mono: {
      family: "'JetBrains Mono', monospace",
    },
    googleFontsUrls: [
      "https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap",
    ],
  },

  design: {
    borderRadius: {
      small: "0.75rem",
      medium: "1.25rem",
      large: "2rem",
      full: "9999px",
    },
    shadows: {
      small: "0 2px 10px rgba(45, 212, 191, 0.1)",
      medium: "0 8px 28px rgba(45, 212, 191, 0.15)",
      large: "0 16px 50px rgba(45, 212, 191, 0.2)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #0d1f2d 0%, #163545 50%, #122a3a 100%)",
      pattern: "radial-gradient(ellipse at 25% 25%, rgba(45, 212, 191, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 75% 75%, rgba(56, 189, 248, 0.12) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(244, 114, 182, 0.08) 0%, transparent 60%)",
    },
    content: {
      background: "#122a3a",
      bulletStyle: "circle",
    },
    image: {
      borderRadius: "1.25rem",
      shadow: "0 12px 40px rgba(45, 212, 191, 0.2)",
      overlay: "linear-gradient(to top, rgba(13, 31, 45, 0.8), transparent)",
    },
  },

  cardBox: {
    background: "#163545",
    borderColor: "#2a6580",
    titleColor: "#ffffff",
    bodyColor: "#e8f4f8",
    accentColor: "#2dd4bf",
    shadow: "none",
    hoverBackground: "#1d4255",
    hoverBorderColor: "#3580a0",
  },

  layoutElements: {
    background: "#1a3d50",
    borderColor: "#2a6580",
    hoverBackground: "#224860",
  },

  gradients: {
    primary: "linear-gradient(135deg, #2dd4bf 0%, #38bdf8 50%, #f472b6 100%)",
    secondary: "linear-gradient(135deg, #163545 0%, #1e4a5f 50%, #163545 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(13, 31, 45, 0.95) 100%)",
    text: "linear-gradient(135deg, #2dd4bf 0%, #38bdf8 100%)",
  },

  preview: {
    titleBg: "#163545",
    bodyBg: "#122a3a",
    textColor: "#e8f4f8",
    accentColor: "#2dd4bf",
  },

  backgroundImage: undefined,
  previewBackgroundImage: undefined,
  backgroundPosition: "center",
  backgroundSize: "cover",
  overlay: "rgba(13, 31, 45, 0.85)",

  pageBackground: "radial-gradient(ellipse at 15% 20%, rgba(45, 212, 191, 0.18) 0%, transparent 45%), radial-gradient(ellipse at 85% 80%, rgba(56, 189, 248, 0.14) 0%, transparent 45%), radial-gradient(ellipse at 50% 100%, rgba(244, 114, 182, 0.1) 0%, transparent 50%), linear-gradient(180deg, #0d1f2d 0%, #122a3a 50%, #0d1f2d 100%)",

  cssVariables: {
    "--anime-glow-teal": "0 0 30px rgba(45, 212, 191, 0.35)",
    "--anime-glow-blue": "0 0 25px rgba(56, 189, 248, 0.3)",
    "--anime-glow-pink": "0 0 20px rgba(244, 114, 182, 0.3)",
  },
};

export default animeDreamscapeTheme;
