/**
 * Botanical Garden Theme
 * A warm nature theme with olive green, golden yellow, and cream with plants background
 */

import type { Theme } from "./types";

const THEME_ID = "botanical-garden";

export const botanicalGardenTheme: Theme = {
  id: THEME_ID,
  name: "Botanical Garden",
  description: "Warm nature theme with olive green, golden yellow, and cream accents",
  category: "creative",

  colors: {
    background: "#F0EADC",
    backgroundAlt: "#e8e0cf",
    surface: "#ffffff",
    surfaceHover: "#faf8f3",

    text: "#3d4a2d",
    textMuted: "#5a6b45",
    textInverse: "#ffffff",
    heading: "#576238",

    primary: "#FFD95D",
    primaryHover: "#f5cc3d",
    secondary: "#576238",
    secondaryHover: "#4a5430",
    accent: "#576238",

    border: "#d4cbb5",
    borderStrong: "#576238",
    borderHover: "#4a5430",

    shadow: "rgba(87, 98, 56, 0.12)",
    overlay: "rgba(87, 98, 56, 0.6)",
    glow: "rgba(255, 217, 93, 0.3)",

    link: "#576238",
    linkHover: "#4a5430",

    success: "#576238",
    warning: "#FFD95D",
    error: "#c45a5a",
  },

  fonts: {
    heading: {
      family: "'Playfair Display', serif",
      weight: 700,
      letterSpacing: "-0.01em",
    },
    body: {
      family: "'Source Sans 3', sans-serif",
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
      "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Source+Sans+3:wght@400;500;600&display=swap",
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
      small: "0 2px 4px rgba(87, 98, 56, 0.08)",
      medium: "0 4px 12px rgba(87, 98, 56, 0.12)",
      large: "0 8px 24px rgba(87, 98, 56, 0.16)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #F0EADC 0%, #e8e0cf 100%)",
      pattern:
        "radial-gradient(circle at 80% 20%, rgba(255, 217, 93, 0.1) 0%, transparent 50%)",
    },
    content: {
      background: "#ffffff",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "0.75rem",
      shadow: "0 8px 24px rgba(87, 98, 56, 0.16)",
      overlay: "linear-gradient(to top, rgba(87, 98, 56, 0.4), transparent)",
    },
  },

  slideShape: {
    type: "sharp",
    borderRadius: "0px",
    shadow: "medium",
  },

  cardBox: {
    background: "#ffffff",
    borderColor: "#d4cbb5",
    titleColor: "#576238",
    bodyColor: "#3d4a2d",
    accentColor: "#FFD95D",
    shadow: "0 4px 12px rgba(87, 98, 56, 0.08)",
    hoverBackground: "#faf8f3",
    hoverBorderColor: "#576238",
  },

  layoutElements: {
    background: "#ffffff",
    borderColor: "#d4cbb5",
    hoverBackground: "#faf8f3",
  },

  gradients: {
    primary: "linear-gradient(135deg, #FFD95D 0%, #576238 100%)",
    secondary: "linear-gradient(135deg, #F0EADC 0%, #e8e0cf 100%)",
    overlay:
      "linear-gradient(to bottom, transparent 0%, rgba(87, 98, 56, 0.5) 100%)",
    text: "linear-gradient(135deg, #576238 0%, #FFD95D 100%)",
  },

  preview: {
    titleBg: "#F0EADC",
    bodyBg: "#ffffff",
    textColor: "#3d4a2d",
    accentColor: "#FFD95D",
  },

  backgroundImage:
    "https://res.cloudinary.com/di76ibrro/image/upload/v1767949801/Generated_Image_January_09_2026_-_1_09AM_eeqslc.jpg",
  previewBackgroundImage:
    "https://res.cloudinary.com/di76ibrro/image/upload/v1767949801/Generated_Image_January_09_2026_-_1_09AM_eeqslc.jpg",
  backgroundPosition: "center",
  backgroundSize: "cover",
  overlay: "rgba(240, 234, 220, 0.75)",
  pageBackground: undefined,
};

export default botanicalGardenTheme;
