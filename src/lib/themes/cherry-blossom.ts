/**
 * Cherry Blossom Theme
 * A romantic theme with deep crimson, coral pink, and soft blush tones
 */

import type { Theme } from "./types";

const THEME_ID = "cherry-blossom";

export const cherryBlossomTheme: Theme = {
  id: THEME_ID,
  name: "Cherry Blossom",
  description: "Romantic theme with deep crimson, coral pink, and soft blush",
  category: "creative",

  colors: {
    background: "#FFE5E0",
    backgroundAlt: "#ffd9d2",
    surface: "#ffffff",
    surfaceHover: "#fff5f3",

    text: "#4a2c2a",
    textMuted: "#7a5552",
    textInverse: "#ffffff",
    heading: "#A10207",

    primary: "#A10207",
    primaryHover: "#8a0106",
    secondary: "#FF4C71",
    secondaryHover: "#e8405f",
    accent: "#FF4C71",

    border: "#f5ccc6",
    borderStrong: "#A10207",
    borderHover: "#8a0106",

    shadow: "rgba(161, 2, 7, 0.15)",
    overlay: "rgba(74, 44, 42, 0.6)",
    glow: "rgba(255, 76, 113, 0.25)",

    link: "#A10207",
    linkHover: "#8a0106",

    success: "#5cb85c",
    warning: "#f0ad4e",
    error: "#A10207",
  },

  fonts: {
    heading: {
      family: "'Libre Baskerville', serif",
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
      "https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&display=swap",
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
      small: "0 2px 4px rgba(161, 2, 7, 0.08)",
      medium: "0 4px 12px rgba(161, 2, 7, 0.12)",
      large: "0 8px 24px rgba(161, 2, 7, 0.18)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #FFE5E0 0%, #ffd9d2 100%)",
      pattern: "radial-gradient(circle at 80% 20%, rgba(255, 76, 113, 0.1) 0%, transparent 50%)",
    },
    content: {
      background: "#ffffff",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "1rem",
      shadow: "0 8px 24px rgba(161, 2, 7, 0.18)",
      overlay: "linear-gradient(to top, rgba(74, 44, 42, 0.4), transparent)",
    },
  },

  slideShape: {
    type: "rounded",
    borderRadius: "20px",
    shadow: "medium",
  },

  cardBox: {
    background: "#ffffff",
    borderColor: "#f5ccc6",
    titleColor: "#A10207",
    bodyColor: "#4a2c2a",
    accentColor: "#FF4C71",
    shadow: "0 4px 12px rgba(161, 2, 7, 0.1)",
    hoverBackground: "#fff5f3",
    hoverBorderColor: "#A10207",
  },

  layoutElements: {
    background: "#ffffff",
    borderColor: "#f5ccc6",
    hoverBackground: "#fff5f3",
  },

  gradients: {
    primary: "linear-gradient(135deg, #A10207 0%, #FF4C71 100%)",
    secondary: "linear-gradient(135deg, #FFE5E0 0%, #ffd9d2 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(74, 44, 42, 0.5) 100%)",
    text: "linear-gradient(135deg, #A10207 0%, #FF4C71 100%)",
  },

  preview: {
    titleBg: "#FFE5E0",
    bodyBg: "#ffffff",
    textColor: "#4a2c2a",
    accentColor: "#A10207",
  },

  backgroundImage: "https://res.cloudinary.com/di76ibrro/image/upload/v1767957624/Generated_Image_January_09_2026_-_3_19AM_r6pbce.jpg",
  previewBackgroundImage: "https://res.cloudinary.com/di76ibrro/image/upload/v1767957624/Generated_Image_January_09_2026_-_3_19AM_r6pbce.jpg",
  backgroundPosition: "center",
  backgroundSize: "cover",
  overlay: "rgba(255, 229, 224, 0.72)",
  pageBackground: undefined,
};

export default cherryBlossomTheme;
