/**
 * Desert Sand Theme
 * A warm earthy theme with olive brown, golden tan, and soft cream with desert background
 */

import type { Theme } from "./types";

const THEME_ID = "desert-sand";

export const desertSandTheme: Theme = {
  id: THEME_ID,
  name: "Estate Professional",
  description: "Warm earthy theme with olive brown, golden tan, and soft cream accents",
  category: "creative",

  colors: {
    background: "#FAE7C9",
    backgroundAlt: "#f5ddb8",
    surface: "#ffffff",
    surfaceHover: "#fdf8f0",

    text: "#4a4230",
    textMuted: "#6a6050",
    textInverse: "#ffffff",
    heading: "#6F6134",

    primary: "#6F6134",
    primaryHover: "#5a5028",
    secondary: "#E1C68F",
    secondaryHover: "#d4b67a",
    accent: "#E1C68F",

    border: "#e8d8b8",
    borderStrong: "#6F6134",
    borderHover: "#5a5028",

    shadow: "rgba(111, 97, 52, 0.12)",
    overlay: "rgba(111, 97, 52, 0.6)",
    glow: "rgba(225, 198, 143, 0.3)",

    link: "#6F6134",
    linkHover: "#5a5028",

    success: "#7a8a5a",
    warning: "#E1C68F",
    error: "#c45a5a",
  },

  fonts: {
    heading: {
      family: "'Libre Baskerville', serif",
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
      "https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Source+Sans+3:wght@400;500;600&display=swap",
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
      small: "0 2px 4px rgba(111, 97, 52, 0.08)",
      medium: "0 4px 12px rgba(111, 97, 52, 0.12)",
      large: "0 8px 24px rgba(111, 97, 52, 0.16)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #FAE7C9 0%, #f5ddb8 100%)",
      pattern:
        "radial-gradient(circle at 80% 20%, rgba(225, 198, 143, 0.15) 0%, transparent 50%)",
    },
    content: {
      background: "#ffffff",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "0.75rem",
      shadow: "0 8px 24px rgba(111, 97, 52, 0.16)",
      overlay: "linear-gradient(to top, rgba(111, 97, 52, 0.4), transparent)",
    },
  },

  slideShape: {
    type: "rounded",
    borderRadius: "6px",
    shadow: "deep",
  },

  cardBox: {
    background: "#ffffff",
    borderColor: "#e8d8b8",
    titleColor: "#6F6134",
    bodyColor: "#4a4230",
    accentColor: "#E1C68F",
    shadow: "0 4px 12px rgba(111, 97, 52, 0.08)",
    hoverBackground: "#fdf8f0",
    hoverBorderColor: "#6F6134",
  },

  layoutElements: {
    background: "#ffffff",
    borderColor: "#e8d8b8",
    hoverBackground: "#fdf8f0",
  },

  gradients: {
    primary: "linear-gradient(135deg, #6F6134 0%, #E1C68F 100%)",
    secondary: "linear-gradient(135deg, #FAE7C9 0%, #f5ddb8 100%)",
    overlay:
      "linear-gradient(to bottom, transparent 0%, rgba(111, 97, 52, 0.5) 100%)",
    text: "linear-gradient(135deg, #6F6134 0%, #E1C68F 100%)",
  },

  preview: {
    titleBg: "#FAE7C9",
    bodyBg: "#ffffff",
    textColor: "#4a4230",
    accentColor: "#6F6134",
  },

  backgroundImage:
    "https://res.cloudinary.com/di76ibrro/image/upload/v1767951191/Generated_Image_January_09_2026_-_1_32AM_znxjzh.jpg",
  previewBackgroundImage:
    "https://res.cloudinary.com/di76ibrro/image/upload/v1767951191/Generated_Image_January_09_2026_-_1_32AM_znxjzh.jpg",
  backgroundPosition: "center",
  backgroundSize: "cover",
  overlay: "rgba(250, 231, 201, 0.75)",
  pageBackground: undefined,
};

export default desertSandTheme;
