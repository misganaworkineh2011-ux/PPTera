/**
 * Lavender Dream Theme
 * Soft purple gradient theme with dreamy aesthetics and gentle transitions
 */

import type { Theme } from "./types";

const THEME_ID = "lavender-dream";

export const lavenderDreamTheme: Theme = {
  id: THEME_ID,
  name: "Lavender Dream",
  description: "Soft purple gradient theme with dreamy aesthetics",
  category: "creative",

  colors: {
    background: "#e8e0f0",
    backgroundAlt: "#d8c8e8",
    surface: "#f8f4fc",
    surfaceHover: "#f0e8f8",

    text: "#2d2840",
    textMuted: "#5a5070",
    textInverse: "#ffffff",
    heading: "#1a1530",

    primary: "#7c5cbc",
    primaryHover: "#6a4aa8",
    secondary: "#9878d0",
    secondaryHover: "#8668c0",
    accent: "#5048e5",

    border: "#c8b8e0",
    borderStrong: "#a898c8",
    borderHover: "#8878b0",

    shadow: "rgba(45, 40, 64, 0.12)",
    overlay: "rgba(26, 21, 48, 0.5)",
    glow: "rgba(124, 92, 188, 0.3)",

    link: "#5048e5",
    linkHover: "#4038d5",

    success: "#4ade80",
    warning: "#f4b03f",
    error: "#ef4444",
  },

  fonts: {
    heading: {
      family: "'Plus Jakarta Sans', sans-serif",
      weight: 700,
      letterSpacing: "-0.02em",
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
      "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap",
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
      small: "0 2px 8px rgba(45, 40, 64, 0.08)",
      medium: "0 4px 16px rgba(45, 40, 64, 0.12)",
      large: "0 8px 32px rgba(45, 40, 64, 0.16)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #c8a8f0 0%, #a888e8 50%, #9070d8 100%)",
      pattern: "radial-gradient(ellipse at 30% 20%, rgba(255, 255, 255, 0.3) 0%, transparent 50%)",
    },
    content: {
      background: "#f8f4fc",
      bulletStyle: "circle",
    },
    image: {
      borderRadius: "1rem",
      shadow: "0 8px 24px rgba(45, 40, 64, 0.2)",
      overlay: "linear-gradient(to top, rgba(26, 21, 48, 0.4), transparent)",
    },
  },

  slideShape: {
    type: "soft",
    borderRadius: "16px",
    shadow: "medium",
  },

  cardBox: {
    background: "#f8f4fc",
    borderColor: "#c8b8e0",
    titleColor: "#1a1530",
    bodyColor: "#2d2840",
    accentColor: "#5048e5",
    shadow: "0 4px 16px rgba(45, 40, 64, 0.12)",
    hoverBackground: "#f0e8f8",
    hoverBorderColor: "#a898c8",
  },

  layoutElements: {
    background: "#ffffff",
    borderColor: "#c8b8e0",
    hoverBackground: "#f8f4fc",
  },

  gradients: {
    primary: "linear-gradient(135deg, #7c5cbc 0%, #9878d0 100%)",
    secondary: "linear-gradient(135deg, #e8e0f0 0%, #d8c8e8 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(26, 21, 48, 0.5) 100%)",
    text: "linear-gradient(135deg, #1a1530 0%, #7c5cbc 100%)",
  },

  preview: {
    titleBg: "#c8a8f0",
    bodyBg: "#f8f4fc",
    textColor: "#2d2840",
    accentColor: "#5048e5",
  },

  backgroundImage: undefined,
  previewBackgroundImage: undefined,
  backgroundPosition: "center",
  backgroundSize: "cover",
  overlay: "rgba(232, 224, 240, 0.9)",
  pageBackground: "linear-gradient(135deg, #c8a8f0 0%, #a888e8 50%, #9070d8 100%)",
  pageBackgroundGradient: "linear-gradient(135deg, #c8a8f0 0%, #a888e8 50%, #9070d8 100%)",
};

export default lavenderDreamTheme;
