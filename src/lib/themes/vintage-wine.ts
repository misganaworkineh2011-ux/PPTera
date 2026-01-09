/**
 * Vintage Wine Theme
 * A rich elegant theme with warm beige, deep brown, and burgundy red with vintage background
 */

import type { Theme } from "./types";

const THEME_ID = "vintage-wine";

export const vintageWineTheme: Theme = {
  id: THEME_ID,
  name: "Vintage Wine",
  description: "Rich elegant theme with warm beige, deep brown, and burgundy red accents",
  category: "creative",

  colors: {
    background: "#D0BA98",
    backgroundAlt: "#c5ad88",
    surface: "#ffffff",
    surfaceHover: "#faf6f0",

    text: "#23140C",
    textMuted: "#4a3525",
    textInverse: "#ffffff",
    heading: "#91040C",

    primary: "#91040C",
    primaryHover: "#7a0309",
    secondary: "#23140C",
    secondaryHover: "#1a0e08",
    accent: "#91040C",

    border: "#b8a580",
    borderStrong: "#91040C",
    borderHover: "#7a0309",

    shadow: "rgba(145, 4, 12, 0.15)",
    overlay: "rgba(35, 20, 12, 0.6)",
    glow: "rgba(145, 4, 12, 0.3)",

    link: "#91040C",
    linkHover: "#7a0309",

    success: "#5a7a4a",
    warning: "#d4a03c",
    error: "#91040C",
  },

  fonts: {
    heading: {
      family: "'Playfair Display', serif",
      weight: 700,
      letterSpacing: "-0.01em",
    },
    body: {
      family: "'Crimson Text', serif",
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
      "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Crimson+Text:wght@400;600;700&display=swap",
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
      small: "0 2px 4px rgba(145, 4, 12, 0.1)",
      medium: "0 4px 12px rgba(145, 4, 12, 0.15)",
      large: "0 8px 24px rgba(145, 4, 12, 0.2)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #D0BA98 0%, #c5ad88 100%)",
      pattern:
        "radial-gradient(circle at 80% 20%, rgba(145, 4, 12, 0.08) 0%, transparent 50%)",
    },
    content: {
      background: "#ffffff",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "0.75rem",
      shadow: "0 8px 24px rgba(145, 4, 12, 0.2)",
      overlay: "linear-gradient(to top, rgba(35, 20, 12, 0.4), transparent)",
    },
  },

  slideShape: {
    type: "soft",
    borderRadius: "16px",
    shadow: "deep",
    border: {
      width: "2px",
      color: "#91040C",
      style: "solid",
    },
  },

  cardBox: {
    background: "#ffffff",
    borderColor: "#b8a580",
    titleColor: "#91040C",
    bodyColor: "#23140C",
    accentColor: "#91040C",
    shadow: "0 4px 12px rgba(145, 4, 12, 0.1)",
    hoverBackground: "#faf6f0",
    hoverBorderColor: "#91040C",
  },

  layoutElements: {
    background: "#ffffff",
    borderColor: "#b8a580",
    hoverBackground: "#faf6f0",
  },

  gradients: {
    primary: "linear-gradient(135deg, #91040C 0%, #23140C 100%)",
    secondary: "linear-gradient(135deg, #D0BA98 0%, #c5ad88 100%)",
    overlay:
      "linear-gradient(to bottom, transparent 0%, rgba(35, 20, 12, 0.5) 100%)",
    text: "linear-gradient(135deg, #91040C 0%, #23140C 100%)",
  },

  preview: {
    titleBg: "#D0BA98",
    bodyBg: "#ffffff",
    textColor: "#23140C",
    accentColor: "#91040C",
  },

  backgroundImage:
    "https://res.cloudinary.com/di76ibrro/image/upload/v1767952483/Generated_Image_January_09_2026_-_1_54AM_xchsub.jpg",
  previewBackgroundImage:
    "https://res.cloudinary.com/di76ibrro/image/upload/v1767952483/Generated_Image_January_09_2026_-_1_54AM_xchsub.jpg",
  backgroundPosition: "center",
  backgroundSize: "cover",
  overlay: "rgba(208, 186, 152, 0.75)",
  pageBackground: undefined,
};

export default vintageWineTheme;
