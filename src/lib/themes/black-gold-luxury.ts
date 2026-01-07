/**
 * Black Gold Luxury Theme
 * Elegant black and gold theme with geometric patterns for premium presentations
 */

import type { Theme } from "./types";
import { getSlideBackgroundUrl, getThemePreviewUrl } from "./cloudinary";

const THEME_ID = "black-gold-luxury";

export const blackGoldLuxuryTheme: Theme = {
  id: THEME_ID,
  name: "Black Gold Luxury",
  description: "Elegant black and gold theme with geometric patterns for premium presentations",
  category: "bold",

  colors: {
    background: "#0a0a0a",
    backgroundAlt: "#141414",
    surface: "#1a1a1a",
    surfaceHover: "#242424",

    text: "#e8e4dc",
    textMuted: "#a8a49c",
    textInverse: "#0a0a0a",
    heading: "#d4af37",

    primary: "#d4af37",
    primaryHover: "#e8c44a",
    secondary: "#b8962e",
    secondaryHover: "#c8a63e",
    accent: "#f4d03f",

    border: "#2a2520",
    borderStrong: "#3a352a",
    borderHover: "#4a453a",

    shadow: "rgba(212, 175, 55, 0.15)",
    overlay: "rgba(10, 10, 10, 0.85)",
    glow: "rgba(212, 175, 55, 0.3)",

    link: "#f4d03f",
    linkHover: "#ffe066",

    success: "#4ade80",
    warning: "#f4d03f",
    error: "#ef4444",
  },

  fonts: {
    heading: {
      family: "'Cormorant Garamond', serif",
      weight: 500,
      letterSpacing: "0.02em",
    },
    body: {
      family: "'Cormorant Garamond', serif",
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
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&display=swap",
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
      small: "0 2px 8px rgba(0, 0, 0, 0.3)",
      medium: "0 4px 16px rgba(0, 0, 0, 0.4)",
      large: "0 8px 32px rgba(0, 0, 0, 0.5)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "#0a0a0a",
      pattern: "linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, transparent 50%)",
    },
    content: {
      background: "#0a0a0a",
      bulletStyle: "square",
    },
    image: {
      borderRadius: "0.5rem",
      shadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
      overlay: "linear-gradient(to top, rgba(10, 10, 10, 0.8), transparent)",
    },
  },

  slideShape: {
    type: "rounded",
    borderRadius: "8px",
    shadow: "subtle",
  },

  cardBox: {
    background: "#1a1a1a",
    borderColor: "#2a2520",
    titleColor: "#d4af37",
    bodyColor: "#e8e4dc",
    accentColor: "#f4d03f",
    shadow: "0 4px 16px rgba(0, 0, 0, 0.4)",
    hoverBackground: "#242424",
    hoverBorderColor: "#3a352a",
  },

  layoutElements: {
    background: "#1a1a1a",
    borderColor: "#3a352a",
    hoverBackground: "#242424",
  },

  gradients: {
    primary: "linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)",
    secondary: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(10, 10, 10, 0.9) 100%)",
    text: "linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)",
  },

  preview: {
    titleBg: "#0a0a0a",
    bodyBg: "#1a1a1a",
    textColor: "#e8e4dc",
    accentColor: "#d4af37",
  },

  backgroundImage: getSlideBackgroundUrl(THEME_ID),
  previewBackgroundImage: getThemePreviewUrl(THEME_ID),
  backgroundPosition: "center",
  backgroundSize: "cover",
  overlay: "rgba(10, 10, 10, 0.75)",
  pageBackground: "radial-gradient(ellipse at 20% 20%, rgba(212, 175, 55, 0.08) 0%, transparent 40%), radial-gradient(ellipse at 80% 80%, rgba(244, 208, 63, 0.05) 0%, transparent 40%), linear-gradient(180deg, #0a0a0a 0%, #141414 50%, #0a0a0a 100%)",
};

export default blackGoldLuxuryTheme;
