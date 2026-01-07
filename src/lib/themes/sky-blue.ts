/**
 * Sky Blue Theme
 * Clean blue gradient theme with white cards and professional feel
 */

import type { Theme } from "./types";

const THEME_ID = "sky-blue";

export const skyBlueTheme: Theme = {
  id: THEME_ID,
  name: "Sky Blue",
  description: "Clean blue gradient theme with white cards and professional feel",
  category: "professional",

  colors: {
    background: "#7cb8dc",
    backgroundAlt: "#6ca8cc",
    surface: "#ffffff",
    surfaceHover: "#f8fafc",

    text: "#1e3a5f",
    textMuted: "#4a6a8a",
    textInverse: "#ffffff",
    heading: "#0f2a4f",

    primary: "#2a7ab8",
    primaryHover: "#1a6aa8",
    secondary: "#4a9ad8",
    secondaryHover: "#3a8ac8",
    accent: "#0ea5e9",

    border: "#a8d0e8",
    borderStrong: "#88c0d8",
    borderHover: "#68b0c8",

    shadow: "rgba(30, 58, 95, 0.12)",
    overlay: "rgba(15, 42, 79, 0.5)",
    glow: "rgba(42, 122, 184, 0.3)",

    link: "#0ea5e9",
    linkHover: "#0284c7",

    success: "#4ade80",
    warning: "#f4b03f",
    error: "#ef4444",
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
    googleFontsUrls: [],
  },

  design: {
    borderRadius: {
      small: "0.5rem",
      medium: "1rem",
      large: "1.5rem",
      full: "9999px",
    },
    shadows: {
      small: "0 2px 8px rgba(30, 58, 95, 0.1)",
      medium: "0 4px 16px rgba(30, 58, 95, 0.15)",
      large: "0 8px 32px rgba(30, 58, 95, 0.2)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(180deg, #7cb8dc 0%, #9cc8e8 50%, #bcd8f0 100%)",
      pattern: "radial-gradient(ellipse at 50% 0%, rgba(255, 255, 255, 0.2) 0%, transparent 60%)",
    },
    content: {
      background: "#ffffff",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "1rem",
      shadow: "0 8px 24px rgba(30, 58, 95, 0.2)",
      overlay: "linear-gradient(to top, rgba(15, 42, 79, 0.4), transparent)",
    },
  },

  slideShape: {
    type: "soft",
    borderRadius: "16px",
    shadow: "medium",
  },

  cardBox: {
    background: "#ffffff",
    borderColor: "#a8d0e8",
    titleColor: "#0f2a4f",
    bodyColor: "#1e3a5f",
    accentColor: "#0ea5e9",
    shadow: "0 4px 16px rgba(30, 58, 95, 0.15)",
    hoverBackground: "#f8fafc",
    hoverBorderColor: "#88c0d8",
  },

  layoutElements: {
    background: "#ffffff",
    borderColor: "#a8d0e8",
    hoverBackground: "#f8fafc",
  },

  gradients: {
    primary: "linear-gradient(135deg, #2a7ab8 0%, #4a9ad8 100%)",
    secondary: "linear-gradient(180deg, #7cb8dc 0%, #9cc8e8 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(15, 42, 79, 0.5) 100%)",
    text: "linear-gradient(135deg, #0f2a4f 0%, #2a7ab8 100%)",
  },

  preview: {
    titleBg: "#7cb8dc",
    bodyBg: "#ffffff",
    textColor: "#1e3a5f",
    accentColor: "#0ea5e9",
  },

  backgroundImage: undefined,
  previewBackgroundImage: undefined,
  backgroundPosition: "center",
  backgroundSize: "cover",
  overlay: "rgba(124, 184, 220, 0.9)",
  pageBackground: "linear-gradient(180deg, #7cb8dc 0%, #9cc8e8 50%, #bcd8f0 100%)",
  pageBackgroundGradient: "linear-gradient(180deg, #7cb8dc 0%, #9cc8e8 50%, #bcd8f0 100%)",
};

export default skyBlueTheme;
