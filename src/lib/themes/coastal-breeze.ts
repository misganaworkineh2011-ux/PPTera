/**
 * Coastal Breeze Theme
 * Light teal/mint theme with soft borders and calming ocean-inspired aesthetics
 */

import type { Theme } from "./types";

const THEME_ID = "coastal-breeze";

export const coastalBreezeTheme: Theme = {
  id: THEME_ID,
  name: "Coastal Breeze",
  description: "Light teal theme with soft borders and calming ocean aesthetics",
  category: "minimal",

  colors: {
    background: "#d8ebe8",
    backgroundAlt: "#c8e0dc",
    surface: "#f5faf9",
    surfaceHover: "#eef6f4",

    text: "#2a4a48",
    textMuted: "#4a6a68",
    textInverse: "#ffffff",
    heading: "#1a3a38",

    primary: "#3a8a88",
    primaryHover: "#2a7a78",
    secondary: "#5aaa98",
    secondaryHover: "#4a9a88",
    accent: "#2a8a7a",

    border: "#a8ccc8",
    borderStrong: "#88b8b4",
    borderHover: "#68a8a4",

    shadow: "rgba(42, 74, 72, 0.1)",
    overlay: "rgba(26, 58, 56, 0.5)",
    glow: "rgba(58, 138, 136, 0.3)",

    link: "#2a8a7a",
    linkHover: "#1a7a6a",

    success: "#4ade80",
    warning: "#f4b03f",
    error: "#ef4444",
  },

  fonts: {
    heading: {
      family: "'Libre Baskerville', serif",
      weight: 700,
      letterSpacing: "-0.01em",
    },
    body: {
      family: "'Inter', var(--font-geist-sans), sans-serif",
      weight: 400,
      lineHeight: "1.6",
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
      "https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&display=swap",
    ],
  },

  design: {
    borderRadius: {
      small: "0.5rem",
      medium: "1rem",
      large: "1.5rem",
      full: "9999px",
    },
    shadows: {
      small: "0 2px 6px rgba(42, 74, 72, 0.08)",
      medium: "0 4px 12px rgba(42, 74, 72, 0.12)",
      large: "0 8px 24px rgba(42, 74, 72, 0.16)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #d8ebe8 0%, #c8e0dc 100%)",
      pattern: "radial-gradient(circle at 70% 30%, rgba(58, 138, 136, 0.06) 0%, transparent 50%)",
    },
    content: {
      background: "#f5faf9",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "1rem",
      shadow: "0 8px 24px rgba(42, 74, 72, 0.15)",
      overlay: "linear-gradient(to top, rgba(26, 58, 56, 0.4), transparent)",
    },
  },

  slideShape: {
    type: "soft",
    borderRadius: "16px",
    shadow: "none",
    border: {
      width: "2px",
      color: "#88b8b4",
      style: "solid",
    },
  },

  cardBox: {
    background: "#f5faf9",
    borderColor: "#a8ccc8",
    titleColor: "#1a3a38",
    bodyColor: "#2a4a48",
    accentColor: "#2a8a7a",
    shadow: "none",
    hoverBackground: "#eef6f4",
    hoverBorderColor: "#88b8b4",
  },

  layoutElements: {
    background: "#ffffff",
    borderColor: "#a8ccc8",
    hoverBackground: "#f5faf9",
  },

  gradients: {
    primary: "linear-gradient(135deg, #3a8a88 0%, #5aaa98 100%)",
    secondary: "linear-gradient(135deg, #d8ebe8 0%, #c8e0dc 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(26, 58, 56, 0.5) 100%)",
    text: "linear-gradient(135deg, #1a3a38 0%, #3a8a88 100%)",
  },

  preview: {
    titleBg: "#d8ebe8",
    bodyBg: "#f5faf9",
    textColor: "#2a4a48",
    accentColor: "#2a8a7a",
  },

  backgroundImage: undefined,
  previewBackgroundImage: undefined,
  backgroundPosition: "center",
  backgroundSize: "cover",
  overlay: "rgba(216, 235, 232, 0.9)",
  pageBackground: "#d8ebe8",
};

export default coastalBreezeTheme;
