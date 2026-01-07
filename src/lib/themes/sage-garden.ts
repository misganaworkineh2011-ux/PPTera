/**
 * Sage Garden Theme
 * A calming sage green theme with solid shadow effect and organic feel
 */

import type { Theme } from "./types";

const THEME_ID = "sage-garden";

export const sageGardenTheme: Theme = {
  id: THEME_ID,
  name: "Sage Garden",
  description: "Calming sage green theme with solid shadow and organic aesthetics",
  category: "creative",

  colors: {
    background: "#d4e4d4",
    backgroundAlt: "#c8dcc8",
    surface: "#f5f9f5",
    surfaceHover: "#eef4ee",

    text: "#2d4a3a",
    textMuted: "#4a6b5a",
    textInverse: "#ffffff",
    heading: "#1a3328",

    primary: "#4a7c59",
    primaryHover: "#3d6a4a",
    secondary: "#6b9b7a",
    secondaryHover: "#5a8a69",
    accent: "#3d8b5a",

    border: "#a8c8b8",
    borderStrong: "#7aa88a",
    borderHover: "#5a8a6a",

    shadow: "rgba(45, 74, 58, 0.15)",
    overlay: "rgba(26, 51, 40, 0.5)",
    glow: "rgba(74, 124, 89, 0.3)",

    link: "#3d8b5a",
    linkHover: "#2d7a4a",

    success: "#4a7c59",
    warning: "#d4a03c",
    error: "#c45a5a",
  },

  fonts: {
    heading: {
      family: "'Playfair Display', serif",
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
      "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap",
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
      small: "0 2px 4px rgba(45, 74, 58, 0.1)",
      medium: "0 4px 12px rgba(45, 74, 58, 0.15)",
      large: "0 8px 24px rgba(45, 74, 58, 0.2)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #d4e4d4 0%, #c8dcc8 100%)",
      pattern: "radial-gradient(circle at 30% 70%, rgba(74, 124, 89, 0.08) 0%, transparent 50%)",
    },
    content: {
      background: "#f5f9f5",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "1rem",
      shadow: "0 8px 24px rgba(45, 74, 58, 0.2)",
      overlay: "linear-gradient(to top, rgba(26, 51, 40, 0.4), transparent)",
    },
  },

  slideShape: {
    type: "soft",
    borderRadius: "16px",
    shadow: "solid",
    solidShadowColor: "#4a7c59",
  },

  cardBox: {
    background: "#f5f9f5",
    borderColor: "#a8c8b8",
    titleColor: "#1a3328",
    bodyColor: "#2d4a3a",
    accentColor: "#3d8b5a",
    shadow: "none",
    hoverBackground: "#eef4ee",
    hoverBorderColor: "#7aa88a",
  },

  layoutElements: {
    background: "#ffffff",
    borderColor: "#a8c8b8",
    hoverBackground: "#f5f9f5",
  },

  gradients: {
    primary: "linear-gradient(135deg, #4a7c59 0%, #6b9b7a 100%)",
    secondary: "linear-gradient(135deg, #d4e4d4 0%, #c8dcc8 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(26, 51, 40, 0.5) 100%)",
    text: "linear-gradient(135deg, #1a3328 0%, #4a7c59 100%)",
  },

  preview: {
    titleBg: "#d4e4d4",
    bodyBg: "#f5f9f5",
    textColor: "#2d4a3a",
    accentColor: "#3d8b5a",
  },

  backgroundImage: undefined,
  previewBackgroundImage: undefined,
  backgroundPosition: "center",
  backgroundSize: "cover",
  overlay: "rgba(212, 228, 212, 0.9)",
  pageBackground: "#d4e4d4",
};

export default sageGardenTheme;
