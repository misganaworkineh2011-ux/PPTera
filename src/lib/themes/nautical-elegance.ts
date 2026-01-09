/**
 * Nautical Elegance Theme
 * A sophisticated theme with soft sage, deep navy, and warm gold accents
 */

import type { Theme } from "./types";

const THEME_ID = "nautical-elegance";

export const nauticalEleganceTheme: Theme = {
  id: THEME_ID,
  name: "Nautical Elegance",
  description: "Sophisticated theme with soft sage, deep navy, and warm gold",
  category: "creative",

  colors: {
    background: "#BCD4CC",
    backgroundAlt: "#a8c7be",
    surface: "#ffffff",
    surfaceHover: "#f5f9f8",

    text: "#002F45",
    textMuted: "#3d5a6b",
    textInverse: "#ffffff",
    heading: "#002F45",

    primary: "#002F45",
    primaryHover: "#00405e",
    secondary: "#E3A750",
    secondaryHover: "#d49640",
    accent: "#E3A750",

    border: "#9bc4b8",
    borderStrong: "#002F45",
    borderHover: "#00405e",

    shadow: "rgba(0, 47, 69, 0.15)",
    overlay: "rgba(0, 47, 69, 0.6)",
    glow: "rgba(227, 167, 80, 0.3)",

    link: "#002F45",
    linkHover: "#00405e",

    success: "#4a9f7e",
    warning: "#E3A750",
    error: "#c94a4a",
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
      "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap",
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
      small: "0 2px 4px rgba(0, 47, 69, 0.08)",
      medium: "0 4px 12px rgba(0, 47, 69, 0.12)",
      large: "0 8px 24px rgba(0, 47, 69, 0.18)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #BCD4CC 0%, #a8c7be 100%)",
      pattern: "radial-gradient(circle at 80% 20%, rgba(227, 167, 80, 0.08) 0%, transparent 50%)",
    },
    content: {
      background: "#ffffff",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "0.75rem",
      shadow: "0 8px 24px rgba(0, 47, 69, 0.18)",
      overlay: "linear-gradient(to top, rgba(0, 47, 69, 0.4), transparent)",
    },
  },

  slideShape: {
    type: "rounded",
    borderRadius: "12px",
    shadow: "medium",
  },

  cardBox: {
    background: "#ffffff",
    borderColor: "#9bc4b8",
    titleColor: "#002F45",
    bodyColor: "#002F45",
    accentColor: "#E3A750",
    shadow: "0 4px 12px rgba(0, 47, 69, 0.1)",
    hoverBackground: "#f5f9f8",
    hoverBorderColor: "#002F45",
  },

  layoutElements: {
    background: "#ffffff",
    borderColor: "#9bc4b8",
    hoverBackground: "#f5f9f8",
  },

  gradients: {
    primary: "linear-gradient(135deg, #002F45 0%, #E3A750 100%)",
    secondary: "linear-gradient(135deg, #BCD4CC 0%, #a8c7be 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(0, 47, 69, 0.5) 100%)",
    text: "linear-gradient(135deg, #002F45 0%, #E3A750 100%)",
  },

  preview: {
    titleBg: "#BCD4CC",
    bodyBg: "#ffffff",
    textColor: "#002F45",
    accentColor: "#E3A750",
  },

  backgroundImage: "https://res.cloudinary.com/di76ibrro/image/upload/v1767956014/Generated_Image_January_09_2026_-_2_52AM_ac1ttj.jpg",
  previewBackgroundImage: "https://res.cloudinary.com/di76ibrro/image/upload/v1767956014/Generated_Image_January_09_2026_-_2_52AM_ac1ttj.jpg",
  backgroundPosition: "center",
  backgroundSize: "cover",
  overlay: "rgba(188, 212, 204, 0.72)",
  pageBackground: undefined,
};

export default nauticalEleganceTheme;
