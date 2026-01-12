/**
 * Dusty Rose Theme
 * Soft dusty rose with muted purple undertones
 */

import type { Theme } from "./types";

const THEME_ID = "dusty-rose";

export const dustyRoseTheme: Theme = {
  id: THEME_ID,
  name: "Dusty Rose",
  description: "Soft dusty rose with muted purple undertones",
  category: "creative",

  colors: {
    background: "#FFF9F5",
    backgroundAlt: "#F5EDE8",
    surface: "#FFFFFF",
    surfaceHover: "#FFF5F0",

    text: "#574964",
    textMuted: "#9F8383",
    textInverse: "#FFFFFF",
    heading: "#574964",

    primary: "#9F8383",
    primaryHover: "#8A7070",
    secondary: "#C8AAAA",
    secondaryHover: "#B89999",
    accent: "#FFDAB3",

    border: "#C8AAAA",
    borderStrong: "#9F8383",
    borderHover: "#8A7070",

    shadow: "rgba(87, 73, 100, 0.15)",
    overlay: "rgba(87, 73, 100, 0.5)",
    glow: "rgba(159, 131, 131, 0.3)",

    link: "#9F8383",
    linkHover: "#8A7070",

    success: "#4CAF50",
    warning: "#FFDAB3",
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
      small: "0 2px 4px rgba(87, 73, 100, 0.1)",
      medium: "0 4px 12px rgba(87, 73, 100, 0.15)",
      large: "0 8px 24px rgba(87, 73, 100, 0.2)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #574964 0%, #9F8383 50%, #FFDAB3 100%)",
    },
    content: {
      background: "#FFF9F5",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "0.75rem",
      shadow: "0 8px 24px rgba(87, 73, 100, 0.2)",
    },
  },

  cardBox: {
    background: "#FFFFFF",
    borderColor: "#C8AAAA",
    titleColor: "#574964",
    bodyColor: "#574964",
    accentColor: "#FFDAB3",
    shadow: "0 4px 12px rgba(87, 73, 100, 0.15)",
  },

  gradients: {
    primary: "linear-gradient(135deg, #574964 0%, #9F8383 50%, #FFDAB3 100%)",
    secondary: "linear-gradient(135deg, #FFF9F5 0%, #F5EDE8 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(87, 73, 100, 0.5) 100%)",
    text: "linear-gradient(135deg, #574964 0%, #9F8383 100%)",
  },

  preview: {
    titleBg: "#574964",
    bodyBg: "#FFF9F5",
    textColor: "#574964",
    accentColor: "#FFDAB3",
  },

  pageBackground: "#FFF9F5",
};

export default dustyRoseTheme;
