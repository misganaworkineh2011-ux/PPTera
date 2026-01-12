/**
 * Modern Slate Theme
 * Clean modern design with slate and blue accents
 */

import type { Theme } from "./types";

const THEME_ID = "modern-slate";

export const modernSlateTheme: Theme = {
  id: THEME_ID,
  name: "Modern Slate",
  description: "Clean modern design with slate and blue accents",
  category: "professional",

  colors: {
    background: "#F5F2F2",
    backgroundAlt: "#E8E5E5",
    surface: "#FFFFFF",
    surfaceHover: "#FAFAFA",

    text: "#2B2A2A",
    textMuted: "#5A5A5A",
    textInverse: "#FFFFFF",
    heading: "#2B2A2A",

    primary: "#5A7ACD",
    primaryHover: "#4A6ABD",
    secondary: "#2B2A2A",
    secondaryHover: "#1B1A1A",
    accent: "#FEB05D",

    border: "#E0E0E0",
    borderStrong: "#CCCCCC",
    borderHover: "#5A7ACD",

    shadow: "rgba(43, 42, 42, 0.15)",
    overlay: "rgba(43, 42, 42, 0.5)",
    glow: "rgba(90, 122, 205, 0.3)",

    link: "#5A7ACD",
    linkHover: "#4A6ABD",

    success: "#4CAF50",
    warning: "#FEB05D",
    error: "#D32F2F",
  },

  fonts: {
    heading: {
      family: "'Inter', var(--font-geist-sans), sans-serif",
      weight: 700,
      letterSpacing: "-0.02em",
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
      small: "0.25rem",
      medium: "0.5rem",
      large: "0.75rem",
      full: "9999px",
    },
    shadows: {
      small: "0 2px 4px rgba(43, 42, 42, 0.1)",
      medium: "0 4px 12px rgba(43, 42, 42, 0.15)",
      large: "0 8px 24px rgba(43, 42, 42, 0.2)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #2B2A2A 0%, #5A7ACD 100%)",
    },
    content: {
      background: "#F5F2F2",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "0.5rem",
      shadow: "0 8px 24px rgba(43, 42, 42, 0.2)",
    },
  },

  cardBox: {
    background: "#FFFFFF",
    borderColor: "#E0E0E0",
    titleColor: "#2B2A2A",
    bodyColor: "#2B2A2A",
    accentColor: "#FEB05D",
    shadow: "0 4px 12px rgba(43, 42, 42, 0.15)",
  },

  gradients: {
    primary: "linear-gradient(135deg, #2B2A2A 0%, #5A7ACD 100%)",
    secondary: "linear-gradient(135deg, #F5F2F2 0%, #E8E5E5 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(43, 42, 42, 0.5) 100%)",
    text: "linear-gradient(135deg, #2B2A2A 0%, #5A7ACD 100%)",
  },

  preview: {
    titleBg: "#2B2A2A",
    bodyBg: "#F5F2F2",
    textColor: "#2B2A2A",
    accentColor: "#FEB05D",
  },

  pageBackground: "#F5F2F2",
};

export default modernSlateTheme;
