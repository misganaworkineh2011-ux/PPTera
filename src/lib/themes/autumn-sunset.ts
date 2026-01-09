/**
 * Autumn Sunset Theme
 * A warm theme with vibrant red, soft cream, and golden amber tones
 */

import type { Theme } from "./types";

const THEME_ID = "autumn-sunset";

export const autumnSunsetTheme: Theme = {
  id: THEME_ID,
  name: "Autumn Sunset",
  description: "Warm theme with vibrant red, soft cream, and golden amber",
  category: "creative",

  colors: {
    background: "#FCEEC9",
    backgroundAlt: "#f5e6b8",
    surface: "#ffffff",
    surfaceHover: "#fffdf5",

    text: "#4a3728",
    textMuted: "#7a6555",
    textInverse: "#ffffff",
    heading: "#E4281F",

    primary: "#E4281F",
    primaryHover: "#c9221a",
    secondary: "#FFBE54",
    secondaryHover: "#f0ad42",
    accent: "#FFBE54",

    border: "#e8dcc0",
    borderStrong: "#E4281F",
    borderHover: "#c9221a",

    shadow: "rgba(228, 40, 31, 0.15)",
    overlay: "rgba(74, 55, 40, 0.6)",
    glow: "rgba(255, 190, 84, 0.3)",

    link: "#E4281F",
    linkHover: "#c9221a",

    success: "#5cb85c",
    warning: "#FFBE54",
    error: "#E4281F",
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
      small: "0 2px 4px rgba(228, 40, 31, 0.08)",
      medium: "0 4px 12px rgba(228, 40, 31, 0.12)",
      large: "0 8px 24px rgba(228, 40, 31, 0.18)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #FCEEC9 0%, #f5e6b8 100%)",
      pattern: "radial-gradient(circle at 80% 20%, rgba(255, 190, 84, 0.15) 0%, transparent 50%)",
    },
    content: {
      background: "#ffffff",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "0.75rem",
      shadow: "0 8px 24px rgba(228, 40, 31, 0.18)",
      overlay: "linear-gradient(to top, rgba(74, 55, 40, 0.4), transparent)",
    },
  },

  slideShape: {
    type: "rounded",
    borderRadius: "12px",
    shadow: "deep",
  },

  cardBox: {
    background: "#ffffff",
    borderColor: "#e8dcc0",
    titleColor: "#E4281F",
    bodyColor: "#4a3728",
    accentColor: "#FFBE54",
    shadow: "0 4px 12px rgba(228, 40, 31, 0.1)",
    hoverBackground: "#fffdf5",
    hoverBorderColor: "#E4281F",
  },

  layoutElements: {
    background: "#ffffff",
    borderColor: "#e8dcc0",
    hoverBackground: "#fffdf5",
  },

  gradients: {
    primary: "linear-gradient(135deg, #E4281F 0%, #FFBE54 100%)",
    secondary: "linear-gradient(135deg, #FCEEC9 0%, #f5e6b8 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(74, 55, 40, 0.5) 100%)",
    text: "linear-gradient(135deg, #E4281F 0%, #FFBE54 100%)",
  },

  preview: {
    titleBg: "#FCEEC9",
    bodyBg: "#ffffff",
    textColor: "#4a3728",
    accentColor: "#E4281F",
  },

  backgroundImage: "https://res.cloudinary.com/di76ibrro/image/upload/v1767957007/Generated_Image_January_09_2026_-_3_09AM_niqslv.jpg",
  previewBackgroundImage: "https://res.cloudinary.com/di76ibrro/image/upload/v1767957007/Generated_Image_January_09_2026_-_3_09AM_niqslv.jpg",
  backgroundPosition: "center",
  backgroundSize: "cover",
  overlay: "rgba(252, 238, 201, 0.72)",
  pageBackground: undefined,
};

export default autumnSunsetTheme;
