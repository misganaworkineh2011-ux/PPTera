/**
 * Royal Purple Theme
 * Rich purple gradient with golden yellow accent
 */

import type { Theme } from "./types";

const THEME_ID = "royal-purple";

export const royalPurpleTheme: Theme = {
  id: THEME_ID,
  name: "Royal Purple",
  description: "Rich purple gradient with golden yellow accent",
  category: "creative",

  colors: {
    background: "#F8F5FF",
    backgroundAlt: "#EDE8F5",
    surface: "#FFFFFF",
    surfaceHover: "#F5F0FF",

    text: "#2D1B4E",
    textMuted: "#85409D",
    textInverse: "#FFFFFF",
    heading: "#2D1B4E",

    primary: "#4D2B8C",
    primaryHover: "#3D1B7C",
    secondary: "#85409D",
    secondaryHover: "#75308D",
    accent: "#FFEF5F",

    border: "#85409D",
    borderStrong: "#4D2B8C",
    borderHover: "#3D1B7C",

    shadow: "rgba(45, 27, 78, 0.15)",
    overlay: "rgba(45, 27, 78, 0.5)",
    glow: "rgba(77, 43, 140, 0.3)",

    link: "#4D2B8C",
    linkHover: "#3D1B7C",

    success: "#4CAF50",
    warning: "#EEA727",
    error: "#D32F2F",
  },

  fonts: {
    heading: {
      family: "Georgia, serif",
      weight: 700,
      letterSpacing: "-0.01em",
    },
    body: {
      family: "'Inter', var(--font-geist-sans), sans-serif",
      weight: 400,
      lineHeight: "1.6",
    },
    caption: {
      family: "'Inter', var(--font-geist-sans), sans-serif",
      weight: 500,
      size: "0.875rem",
    },
    mono: {
      family: "'JetBrains Mono', monospace",
    },
  },

  design: {
    borderRadius: {
      small: "0.5rem",
      medium: "0.75rem",
      large: "1rem",
      full: "9999px",
    },
    shadows: {
      small: "0 2px 4px rgba(45, 27, 78, 0.1)",
      medium: "0 4px 12px rgba(45, 27, 78, 0.15)",
      large: "0 8px 24px rgba(45, 27, 78, 0.2)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #4D2B8C 0%, #85409D 50%, #FFEF5F 100%)",
    },
    content: {
      background: "#F8F5FF",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "0.75rem",
      shadow: "0 8px 24px rgba(45, 27, 78, 0.2)",
    },
  },

  cardBox: {
    background: "#FFFFFF",
    borderColor: "#85409D",
    titleColor: "#2D1B4E",
    bodyColor: "#2D1B4E",
    accentColor: "#FFEF5F",
    shadow: "0 4px 12px rgba(45, 27, 78, 0.15)",
  },

  gradients: {
    primary: "linear-gradient(135deg, #4D2B8C 0%, #85409D 50%, #FFEF5F 100%)",
    secondary: "linear-gradient(135deg, #F8F5FF 0%, #EDE8F5 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(45, 27, 78, 0.5) 100%)",
    text: "linear-gradient(135deg, #4D2B8C 0%, #85409D 100%)",
  },

  preview: {
    titleBg: "#4D2B8C",
    bodyBg: "#F8F5FF",
    textColor: "#2D1B4E",
    accentColor: "#FFEF5F",
  },

  pageBackground: "#F8F5FF",
};

export default royalPurpleTheme;
