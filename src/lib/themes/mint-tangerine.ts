/**
 * Mint Tangerine Theme
 * A fresh theme with soft mint, vibrant tangerine orange, and warm cream tones
 */

import type { Theme } from "./types";

const THEME_ID = "mint-tangerine";

export const mintTangerineTheme: Theme = {
  id: THEME_ID,
  name: "Mint Tangerine",
  description: "Fresh theme with soft mint, vibrant tangerine orange, and warm cream",
  category: "creative",

  colors: {
    background: "#FFFFEB",
    backgroundAlt: "#f5f5e0",
    surface: "#ffffff",
    surfaceHover: "#fefef8",

    text: "#2a3a35",
    textMuted: "#5a6a65",
    textInverse: "#ffffff",
    heading: "#EB4600",

    primary: "#EB4600",
    primaryHover: "#d03e00",
    secondary: "#A2C2BE",
    secondaryHover: "#8fb3ae",
    accent: "#A2C2BE",

    border: "#d5e5e2",
    borderStrong: "#EB4600",
    borderHover: "#d03e00",

    shadow: "rgba(235, 70, 0, 0.12)",
    overlay: "rgba(42, 58, 53, 0.6)",
    glow: "rgba(162, 194, 190, 0.3)",

    link: "#EB4600",
    linkHover: "#d03e00",

    success: "#5cb85c",
    warning: "#f0ad4e",
    error: "#EB4600",
  },

  fonts: {
    heading: {
      family: "'Nunito', sans-serif",
      weight: 800,
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
      "https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap",
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
      small: "0 2px 4px rgba(235, 70, 0, 0.08)",
      medium: "0 4px 12px rgba(235, 70, 0, 0.12)",
      large: "0 8px 24px rgba(235, 70, 0, 0.16)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #FFFFEB 0%, #f5f5e0 100%)",
      pattern: "radial-gradient(circle at 80% 20%, rgba(162, 194, 190, 0.15) 0%, transparent 50%)",
    },
    content: {
      background: "#ffffff",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "1rem",
      shadow: "0 8px 24px rgba(235, 70, 0, 0.16)",
      overlay: "linear-gradient(to top, rgba(42, 58, 53, 0.4), transparent)",
    },
  },

  slideShape: {
    type: "rounded",
    borderRadius: "18px",
    shadow: "subtle",
  },

  cardBox: {
    background: "#ffffff",
    borderColor: "#d5e5e2",
    titleColor: "#EB4600",
    bodyColor: "#2a3a35",
    accentColor: "#A2C2BE",
    shadow: "0 4px 12px rgba(235, 70, 0, 0.1)",
    hoverBackground: "#fefef8",
    hoverBorderColor: "#EB4600",
  },

  layoutElements: {
    background: "#ffffff",
    borderColor: "#d5e5e2",
    hoverBackground: "#fefef8",
  },

  gradients: {
    primary: "linear-gradient(135deg, #EB4600 0%, #A2C2BE 100%)",
    secondary: "linear-gradient(135deg, #FFFFEB 0%, #f5f5e0 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(42, 58, 53, 0.5) 100%)",
    text: "linear-gradient(135deg, #EB4600 0%, #d03e00 100%)",
  },

  preview: {
    titleBg: "#FFFFEB",
    bodyBg: "#ffffff",
    textColor: "#2a3a35",
    accentColor: "#EB4600",
  },

  backgroundImage: "https://res.cloudinary.com/di76ibrro/image/upload/v1767958888/Generated_Image_January_09_2026_-_3_40AM_p5tmc3.jpg",
  previewBackgroundImage: "https://res.cloudinary.com/di76ibrro/image/upload/v1767958888/Generated_Image_January_09_2026_-_3_40AM_p5tmc3.jpg",
  backgroundPosition: "center",
  backgroundSize: "cover",
  overlay: "rgba(255, 255, 235, 0.72)",
  pageBackground: undefined,
};

export default mintTangerineTheme;
