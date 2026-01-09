/**
 * Misty Forest Theme
 * A serene natural theme with soft cream, sky blue, and forest green with misty background
 */

import type { Theme } from "./types";

const THEME_ID = "misty-forest";

export const mistyForestTheme: Theme = {
  id: THEME_ID,
  name: "Misty Forest",
  description: "Serene natural theme with soft cream, sky blue, and forest green accents",
  category: "creative",

  colors: {
    background: "#F3F3E3",
    backgroundAlt: "#eaeada",
    surface: "#ffffff",
    surfaceHover: "#f9f9f3",

    text: "#3a4540",
    textMuted: "#606F69",
    textInverse: "#ffffff",
    heading: "#606F69",

    primary: "#A9CFE0",
    primaryHover: "#95c2d6",
    secondary: "#606F69",
    secondaryHover: "#505e58",
    accent: "#A9CFE0",

    border: "#d8d8c8",
    borderStrong: "#606F69",
    borderHover: "#505e58",

    shadow: "rgba(96, 111, 105, 0.12)",
    overlay: "rgba(96, 111, 105, 0.6)",
    glow: "rgba(169, 207, 224, 0.3)",

    link: "#606F69",
    linkHover: "#505e58",

    success: "#7a9a7a",
    warning: "#d4a03c",
    error: "#c45a5a",
  },

  fonts: {
    heading: {
      family: "'Cormorant Garamond', serif",
      weight: 600,
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
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Nunito:wght@400;500;600&display=swap",
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
      small: "0 2px 4px rgba(96, 111, 105, 0.08)",
      medium: "0 4px 12px rgba(96, 111, 105, 0.12)",
      large: "0 8px 24px rgba(96, 111, 105, 0.16)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #F3F3E3 0%, #eaeada 100%)",
      pattern:
        "radial-gradient(circle at 80% 20%, rgba(169, 207, 224, 0.1) 0%, transparent 50%)",
    },
    content: {
      background: "#ffffff",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "0.75rem",
      shadow: "0 8px 24px rgba(96, 111, 105, 0.16)",
      overlay: "linear-gradient(to top, rgba(96, 111, 105, 0.4), transparent)",
    },
  },

  slideShape: {
    type: "soft",
    borderRadius: "18px",
    shadow: "subtle",
  },

  cardBox: {
    background: "#ffffff",
    borderColor: "#d8d8c8",
    titleColor: "#606F69",
    bodyColor: "#3a4540",
    accentColor: "#A9CFE0",
    shadow: "0 4px 12px rgba(96, 111, 105, 0.08)",
    hoverBackground: "#f9f9f3",
    hoverBorderColor: "#606F69",
  },

  layoutElements: {
    background: "#ffffff",
    borderColor: "#d8d8c8",
    hoverBackground: "#f9f9f3",
  },

  gradients: {
    primary: "linear-gradient(135deg, #A9CFE0 0%, #606F69 100%)",
    secondary: "linear-gradient(135deg, #F3F3E3 0%, #eaeada 100%)",
    overlay:
      "linear-gradient(to bottom, transparent 0%, rgba(96, 111, 105, 0.5) 100%)",
    text: "linear-gradient(135deg, #606F69 0%, #A9CFE0 100%)",
  },

  preview: {
    titleBg: "#F3F3E3",
    bodyBg: "#ffffff",
    textColor: "#3a4540",
    accentColor: "#A9CFE0",
  },

  backgroundImage:
    "https://res.cloudinary.com/di76ibrro/image/upload/v1767951740/Generated_Image_January_09_2026_-_1_42AM_swfdp8.jpg",
  previewBackgroundImage:
    "https://res.cloudinary.com/di76ibrro/image/upload/v1767951740/Generated_Image_January_09_2026_-_1_42AM_swfdp8.jpg",
  backgroundPosition: "center",
  backgroundSize: "cover",
  overlay: "rgba(243, 243, 227, 0.75)",
  pageBackground: undefined,
};

export default mistyForestTheme;
