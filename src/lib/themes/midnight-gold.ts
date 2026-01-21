/**
 * Midnight Gold Theme
 * A sophisticated dark theme with steel gray, deep black, and golden amber accents
 */

import type { Theme } from "./types";

const THEME_ID = "midnight-gold";

export const midnightGoldTheme: Theme = {
  id: THEME_ID,
  name: "Midnight Gold",
  description: "Sophisticated dark theme with steel gray, deep black, and golden amber",
  category: "dark",

  colors: {
    background: "#071011",
    backgroundAlt: "#0f1a1c",
    surface: "#1a2628",
    surfaceHover: "#243032",

    text: "#e8eced",
    textMuted: "#91A0AA",
    textInverse: "#071011",
    heading: "#E6A835",

    primary: "#E6A835",
    primaryHover: "#d4962a",
    secondary: "#91A0AA",
    secondaryHover: "#a8b5be",
    accent: "#E6A835",

    border: "#2d3e42",
    borderStrong: "#E6A835",
    borderHover: "#d4962a",

    shadow: "rgba(230, 168, 53, 0.15)",
    overlay: "rgba(7, 16, 17, 0.8)",
    glow: "rgba(230, 168, 53, 0.25)",

    link: "#E6A835",
    linkHover: "#d4962a",

    success: "#4ade80",
    warning: "#E6A835",
    error: "#f87171",
  },

  fonts: {
    heading: {
      family: "'Bebas Neue', sans-serif",
      weight: 400,
      letterSpacing: "0.05em",
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
      "https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap",
    ],
  },

  design: {
    borderRadius: {
      small: "0.25rem",
      medium: "0.5rem",
      large: "0.75rem",
      full: "9999px",
    },
    shadows: {
      small: "0 2px 4px rgba(0, 0, 0, 0.3)",
      medium: "0 4px 12px rgba(0, 0, 0, 0.4)",
      large: "0 8px 24px rgba(0, 0, 0, 0.5)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #071011 0%, #0f1a1c 100%)",
      pattern: "radial-gradient(circle at 80% 20%, rgba(230, 168, 53, 0.08) 0%, transparent 50%)",
    },
    content: {
      background: "#1a2628",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "0.5rem",
      shadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
      overlay: "linear-gradient(to top, rgba(7, 16, 17, 0.6), transparent)",
    },
  },

  slideShape: {
    type: "rounded",
    borderRadius: "6px",
    shadow: "subtle",
  },

  cardBox: {
    background: "#1a2628",
    borderColor: "#2d3e42",
    titleColor: "#E6A835",
    bodyColor: "#e8eced",
    accentColor: "#91A0AA",
    shadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
    hoverBackground: "#243032",
    hoverBorderColor: "#E6A835",
  },

  layoutElements: {
    background: "#1a2628",
    borderColor: "#2d3e42",
    hoverBackground: "#243032",
  },

  gradients: {
    primary: "linear-gradient(135deg, #E6A835 0%, #91A0AA 100%)",
    secondary: "linear-gradient(135deg, #071011 0%, #1a2628 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(7, 16, 17, 0.7) 100%)",
    text: "linear-gradient(135deg, #E6A835 0%, #d4962a 100%)",
  },

  preview: {
    titleBg: "#071011",
    bodyBg: "#1a2628",
    textColor: "#e8eced",
    accentColor: "#E6A835",
  },

  backgroundImage: "https://res.cloudinary.com/di76ibrro/image/upload/v1767957412/Generated_Image_January_09_2026_-_3_15AM_twlner.jpg",
  previewBackgroundImage: "https://res.cloudinary.com/di76ibrro/image/upload/v1767957412/Generated_Image_January_09_2026_-_3_15AM_twlner.jpg",
  backgroundPosition: "center",
  backgroundSize: "cover",
  overlay: "rgba(7, 16, 17, 0.75)",
  pageBackground: undefined,
};

export default midnightGoldTheme;
