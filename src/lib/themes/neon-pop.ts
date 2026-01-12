/**
 * Neon Pop Theme
 * Bold neon pink and cyan on dark background
 */

import type { Theme } from "./types";

const THEME_ID = "neon-pop";

export const neonPopTheme: Theme = {
  id: THEME_ID,
  name: "Neon Pop",
  description: "Bold neon pink and cyan on dark background",
  category: "creative",

  colors: {
    background: "#0A0A0A",
    backgroundAlt: "#151515",
    surface: "#1A1A1A",
    surfaceHover: "#252525",

    text: "#FFFFFF",
    textMuted: "#B0FFFA",
    textInverse: "#0A0A0A",
    heading: "#FFFFFF",

    primary: "#FF0087",
    primaryHover: "#E00077",
    secondary: "#00F7FF",
    secondaryHover: "#00D7DF",
    accent: "#FF7DB0",

    border: "#FF0087",
    borderStrong: "#00F7FF",
    borderHover: "#FF7DB0",

    shadow: "rgba(255, 0, 135, 0.3)",
    overlay: "rgba(10, 10, 10, 0.8)",
    glow: "rgba(0, 247, 255, 0.4)",

    link: "#00F7FF",
    linkHover: "#FF0087",

    success: "#00F7FF",
    warning: "#FF7DB0",
    error: "#FF0087",
  },

  fonts: {
    heading: {
      family: "'Inter', var(--font-geist-sans), sans-serif",
      weight: 800,
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
      small: "0",
      medium: "0",
      large: "0",
      full: "9999px",
    },
    shadows: {
      small: "0 0 10px rgba(255, 0, 135, 0.3)",
      medium: "0 0 20px rgba(255, 0, 135, 0.4)",
      large: "0 0 40px rgba(0, 247, 255, 0.4)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #FF0087 0%, #00F7FF 100%)",
    },
    content: {
      background: "#0A0A0A",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "0",
      shadow: "0 0 30px rgba(255, 0, 135, 0.4)",
    },
  },

  cardBox: {
    background: "#1A1A1A",
    borderColor: "#FF0087",
    titleColor: "#FFFFFF",
    bodyColor: "#FFFFFF",
    accentColor: "#00F7FF",
    shadow: "0 0 20px rgba(255, 0, 135, 0.3)",
  },

  gradients: {
    primary: "linear-gradient(135deg, #FF0087 0%, #00F7FF 100%)",
    secondary: "linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(10, 10, 10, 0.8) 100%)",
    text: "linear-gradient(135deg, #FF0087 0%, #00F7FF 100%)",
  },

  preview: {
    titleBg: "#FF0087",
    bodyBg: "#0A0A0A",
    textColor: "#FFFFFF",
    accentColor: "#00F7FF",
  },

  pageBackground: "#0A0A0A",
};

export default neonPopTheme;
