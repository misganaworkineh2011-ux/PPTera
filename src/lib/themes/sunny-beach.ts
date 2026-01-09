/**
 * Sunny Beach Theme
 * A bright cheerful theme with golden yellow, ocean blue, and deep navy with beach background
 */

import type { Theme } from "./types";

const THEME_ID = "sunny-beach";

export const sunnyBeachTheme: Theme = {
  id: THEME_ID,
  name: "Sunny Beach",
  description: "Bright cheerful theme with golden yellow, ocean blue, and deep navy accents",
  category: "creative",

  colors: {
    background: "#FFE16D",
    backgroundAlt: "#f5d55a",
    surface: "#ffffff",
    surfaceHover: "#fffdf0",

    text: "#253E4C",
    textMuted: "#3a5565",
    textInverse: "#ffffff",
    heading: "#253E4C",

    primary: "#6EABC6",
    primaryHover: "#5a9ab5",
    secondary: "#253E4C",
    secondaryHover: "#1c303a",
    accent: "#6EABC6",

    border: "#e8d050",
    borderStrong: "#6EABC6",
    borderHover: "#5a9ab5",

    shadow: "rgba(37, 62, 76, 0.15)",
    overlay: "rgba(37, 62, 76, 0.6)",
    glow: "rgba(110, 171, 198, 0.3)",

    link: "#6EABC6",
    linkHover: "#5a9ab5",

    success: "#5a9a7a",
    warning: "#FFE16D",
    error: "#c45a5a",
  },

  fonts: {
    heading: {
      family: "'Quicksand', sans-serif",
      weight: 700,
      letterSpacing: "-0.01em",
    },
    body: {
      family: "'Nunito', sans-serif",
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
      "https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&family=Nunito:wght@400;500;600&display=swap",
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
      small: "0 2px 4px rgba(37, 62, 76, 0.1)",
      medium: "0 4px 12px rgba(37, 62, 76, 0.15)",
      large: "0 8px 24px rgba(37, 62, 76, 0.2)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #FFE16D 0%, #f5d55a 100%)",
      pattern:
        "radial-gradient(circle at 80% 20%, rgba(110, 171, 198, 0.1) 0%, transparent 50%)",
    },
    content: {
      background: "#ffffff",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "0.75rem",
      shadow: "0 8px 24px rgba(37, 62, 76, 0.2)",
      overlay: "linear-gradient(to top, rgba(37, 62, 76, 0.4), transparent)",
    },
  },

  slideShape: {
    type: "soft",
    borderRadius: "22px",
    shadow: "medium",
  },

  cardBox: {
    background: "#ffffff",
    borderColor: "#e8d050",
    titleColor: "#253E4C",
    bodyColor: "#253E4C",
    accentColor: "#6EABC6",
    shadow: "0 4px 12px rgba(37, 62, 76, 0.1)",
    hoverBackground: "#fffdf0",
    hoverBorderColor: "#6EABC6",
  },

  layoutElements: {
    background: "#ffffff",
    borderColor: "#e8d050",
    hoverBackground: "#fffdf0",
  },

  gradients: {
    primary: "linear-gradient(135deg, #FFE16D 0%, #6EABC6 100%)",
    secondary: "linear-gradient(135deg, #FFE16D 0%, #f5d55a 100%)",
    overlay:
      "linear-gradient(to bottom, transparent 0%, rgba(37, 62, 76, 0.5) 100%)",
    text: "linear-gradient(135deg, #253E4C 0%, #6EABC6 100%)",
  },

  preview: {
    titleBg: "#FFE16D",
    bodyBg: "#ffffff",
    textColor: "#253E4C",
    accentColor: "#6EABC6",
  },

  backgroundImage:
    "https://res.cloudinary.com/di76ibrro/image/upload/v1767952841/Generated_Image_January_09_2026_-_1_59AM_witpmo.jpg",
  previewBackgroundImage:
    "https://res.cloudinary.com/di76ibrro/image/upload/v1767952841/Generated_Image_January_09_2026_-_1_59AM_witpmo.jpg",
  backgroundPosition: "center",
  backgroundSize: "cover",
  overlay: "rgba(255, 225, 109, 0.75)",
  pageBackground: undefined,
};

export default sunnyBeachTheme;
