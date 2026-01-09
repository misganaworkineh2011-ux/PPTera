/**
 * Tropical Jungle Theme
 * A warm tropical theme with emerald green, golden peach, and deep brown with jungle background
 */

import type { Theme } from "./types";

const THEME_ID = "tropical-jungle";

export const tropicalJungleTheme: Theme = {
  id: THEME_ID,
  name: "Tropical Jungle",
  description: "Warm tropical theme with emerald green, golden peach, and deep brown accents",
  category: "creative",

  colors: {
    background: "#FFCB82",
    backgroundAlt: "#f5be70",
    surface: "#ffffff",
    surfaceHover: "#fff8ed",

    text: "#381E05",
    textMuted: "#5a4020",
    textInverse: "#ffffff",
    heading: "#387B66",

    primary: "#387B66",
    primaryHover: "#2d6654",
    secondary: "#381E05",
    secondaryHover: "#2a1604",
    accent: "#387B66",

    border: "#e8c090",
    borderStrong: "#387B66",
    borderHover: "#2d6654",

    shadow: "rgba(56, 123, 102, 0.15)",
    overlay: "rgba(56, 30, 5, 0.6)",
    glow: "rgba(56, 123, 102, 0.3)",

    link: "#387B66",
    linkHover: "#2d6654",

    success: "#387B66",
    warning: "#FFCB82",
    error: "#c45a5a",
  },

  fonts: {
    heading: {
      family: "'Abril Fatface', serif",
      weight: 400,
      letterSpacing: "0em",
    },
    body: {
      family: "'Lato', sans-serif",
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
      "https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Lato:wght@400;500;700&display=swap",
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
      small: "0 2px 4px rgba(56, 123, 102, 0.1)",
      medium: "0 4px 12px rgba(56, 123, 102, 0.15)",
      large: "0 8px 24px rgba(56, 123, 102, 0.2)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #FFCB82 0%, #f5be70 100%)",
      pattern:
        "radial-gradient(circle at 80% 20%, rgba(56, 123, 102, 0.1) 0%, transparent 50%)",
    },
    content: {
      background: "#ffffff",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "0.75rem",
      shadow: "0 8px 24px rgba(56, 123, 102, 0.2)",
      overlay: "linear-gradient(to top, rgba(56, 30, 5, 0.4), transparent)",
    },
  },

  slideShape: {
    type: "rounded",
    borderRadius: "14px",
    shadow: "solid",
    solidShadowColor: "#387B66",
  },

  cardBox: {
    background: "#ffffff",
    borderColor: "#e8c090",
    titleColor: "#387B66",
    bodyColor: "#381E05",
    accentColor: "#387B66",
    shadow: "0 4px 12px rgba(56, 123, 102, 0.1)",
    hoverBackground: "#fff8ed",
    hoverBorderColor: "#387B66",
  },

  layoutElements: {
    background: "#ffffff",
    borderColor: "#e8c090",
    hoverBackground: "#fff8ed",
  },

  gradients: {
    primary: "linear-gradient(135deg, #387B66 0%, #FFCB82 100%)",
    secondary: "linear-gradient(135deg, #FFCB82 0%, #f5be70 100%)",
    overlay:
      "linear-gradient(to bottom, transparent 0%, rgba(56, 30, 5, 0.5) 100%)",
    text: "linear-gradient(135deg, #387B66 0%, #381E05 100%)",
  },

  preview: {
    titleBg: "#FFCB82",
    bodyBg: "#ffffff",
    textColor: "#381E05",
    accentColor: "#387B66",
  },

  backgroundImage:
    "https://res.cloudinary.com/di76ibrro/image/upload/v1767951934/Generated_Image_January_09_2026_-_1_45AM_axfs27.jpg",
  previewBackgroundImage:
    "https://res.cloudinary.com/di76ibrro/image/upload/v1767951934/Generated_Image_January_09_2026_-_1_45AM_axfs27.jpg",
  backgroundPosition: "center",
  backgroundSize: "cover",
  overlay: "rgba(255, 203, 130, 0.75)",
  pageBackground: undefined,
};

export default tropicalJungleTheme;
