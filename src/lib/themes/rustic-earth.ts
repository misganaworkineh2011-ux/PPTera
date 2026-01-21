/**
 * Rustic Earth Theme
 * An earthy theme with dark brown, olive green, and burnt orange tones
 */

import type { Theme } from "./types";

const THEME_ID = "rustic-earth";

export const rusticEarthTheme: Theme = {
  id: THEME_ID,
  name: "Botanical Fusion (or Organic Vibrant)",
  description: "Earthy theme with dark brown, olive green, and burnt orange",
  category: "creative",

  colors: {
    background: "#C7CE69",
    backgroundAlt: "#b8bf5a",
    surface: "#ffffff",
    surfaceHover: "#fdfdf5",

    text: "#402C1C",
    textMuted: "#6a5040",
    textInverse: "#ffffff",
    heading: "#402C1C",

    primary: "#402C1C",
    primaryHover: "#352418",
    secondary: "#BE361D",
    secondaryHover: "#a02e18",
    accent: "#BE361D",

    border: "#b5bc58",
    borderStrong: "#402C1C",
    borderHover: "#352418",

    shadow: "rgba(64, 44, 28, 0.15)",
    overlay: "rgba(64, 44, 28, 0.6)",
    glow: "rgba(190, 54, 29, 0.25)",

    link: "#BE361D",
    linkHover: "#a02e18",

    success: "#5cb85c",
    warning: "#C7CE69",
    error: "#BE361D",
  },

  fonts: {
    heading: {
      family: "'Bitter', serif",
      weight: 700,
      letterSpacing: "0em",
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
      "https://fonts.googleapis.com/css2?family=Bitter:wght@400;500;600;700&display=swap",
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
      small: "0 2px 4px rgba(64, 44, 28, 0.1)",
      medium: "0 4px 12px rgba(64, 44, 28, 0.15)",
      large: "0 8px 24px rgba(64, 44, 28, 0.2)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #C7CE69 0%, #b8bf5a 100%)",
      pattern: "radial-gradient(circle at 80% 20%, rgba(190, 54, 29, 0.08) 0%, transparent 50%)",
    },
    content: {
      background: "#ffffff",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "0.5rem",
      shadow: "0 8px 24px rgba(64, 44, 28, 0.2)",
      overlay: "linear-gradient(to top, rgba(64, 44, 28, 0.4), transparent)",
    },
  },

  slideShape: {
    type: "rounded",
    borderRadius: "10px",
    shadow: "solid",
  },

  cardBox: {
    background: "#ffffff",
    borderColor: "#b5bc58",
    titleColor: "#402C1C",
    bodyColor: "#402C1C",
    accentColor: "#BE361D",
    shadow: "0 4px 12px rgba(64, 44, 28, 0.12)",
    hoverBackground: "#fdfdf5",
    hoverBorderColor: "#402C1C",
  },

  layoutElements: {
    background: "#ffffff",
    borderColor: "#b5bc58",
    hoverBackground: "#fdfdf5",
  },

  gradients: {
    primary: "linear-gradient(135deg, #402C1C 0%, #BE361D 100%)",
    secondary: "linear-gradient(135deg, #C7CE69 0%, #b8bf5a 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(64, 44, 28, 0.5) 100%)",
    text: "linear-gradient(135deg, #402C1C 0%, #BE361D 100%)",
  },

  preview: {
    titleBg: "#C7CE69",
    bodyBg: "#ffffff",
    textColor: "#402C1C",
    accentColor: "#BE361D",
  },

  backgroundImage: "https://res.cloudinary.com/di76ibrro/image/upload/v1767958329/Generated_Image_January_09_2026_-_3_31AM_anpep9.jpg",
  previewBackgroundImage: "https://res.cloudinary.com/di76ibrro/image/upload/v1767958329/Generated_Image_January_09_2026_-_3_31AM_anpep9.jpg",
  backgroundPosition: "center",
  backgroundSize: "cover",
  overlay: "rgba(199, 206, 105, 0.7)",
  pageBackground: undefined,
};

export default rusticEarthTheme;
