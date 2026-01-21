/**
 * Watermelon Sorbet Theme
 * Fresh watermelon pink with teal and golden accents
 */

import type { Theme } from "./types";

const THEME_ID = "watermelon-sorbet";

export const watermelonSorbetTheme: Theme = {
  id: THEME_ID,
  name: "Executive Clarity",
  description: "Fresh watermelon pink with teal and golden accents",
  category: "creative",

  colors: {
    background: "#F8FFFE",
    backgroundAlt: "#E8F5F3",
    surface: "#FFFFFF",
    surfaceHover: "#F0FAF8",

    text: "#073B4C",
    textMuted: "#118AB2",
    textInverse: "#FFFFFF",
    heading: "#073B4C",

    primary: "#EF476F",
    primaryHover: "#DF375F",
    secondary: "#118AB2",
    secondaryHover: "#0A7AA2",
    accent: "#FFD166",

    border: "#06D6A0",
    borderStrong: "#118AB2",
    borderHover: "#EF476F",

    shadow: "rgba(7, 59, 76, 0.15)",
    overlay: "rgba(7, 59, 76, 0.5)",
    glow: "rgba(239, 71, 111, 0.3)",

    link: "#118AB2",
    linkHover: "#EF476F",

    success: "#06D6A0",
    warning: "#FFD166",
    error: "#EF476F",
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
      small: "0.75rem",
      medium: "1rem",
      large: "1.5rem",
      full: "9999px",
    },
    shadows: {
      small: "0 2px 4px rgba(7, 59, 76, 0.1)",
      medium: "0 4px 12px rgba(7, 59, 76, 0.15)",
      large: "0 8px 24px rgba(7, 59, 76, 0.2)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #EF476F 0%, #FFD166 33%, #06D6A0 66%, #118AB2 100%)",
    },
    content: {
      background: "#F8FFFE",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "1rem",
      shadow: "0 8px 24px rgba(7, 59, 76, 0.2)",
    },
  },

  cardBox: {
    background: "#FFFFFF",
    borderColor: "#06D6A0",
    titleColor: "#073B4C",
    bodyColor: "#073B4C",
    accentColor: "#FFD166",
    shadow: "0 4px 12px rgba(7, 59, 76, 0.15)",
  },

  layoutElements: {
    background: "#E8F5F3",
    borderColor: "#06D6A0",
    hoverBackground: "#DFF2EF",
  },

  gradients: {
    primary: "linear-gradient(135deg, #EF476F 0%, #FFD166 33%, #06D6A0 66%, #118AB2 100%)",
    secondary: "linear-gradient(135deg, #F8FFFE 0%, #E8F5F3 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(7, 59, 76, 0.5) 100%)",
    text: "linear-gradient(135deg, #EF476F 0%, #118AB2 100%)",
  },

  preview: {
    titleBg: "#F8FFFE",
    bodyBg: "#F8FFFE",
    textColor: "#073B4C",
    accentColor: "#FFD166",
  },

  pageBackground: "#F8FFFE",
};

export default watermelonSorbetTheme;
