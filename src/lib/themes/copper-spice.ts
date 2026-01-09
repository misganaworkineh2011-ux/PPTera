/**
 * Copper Spice Theme
 * A warm theme with terracotta orange, golden amber, and deep mahogany tones
 */

import type { Theme } from "./types";

const THEME_ID = "copper-spice";

export const copperSpiceTheme: Theme = {
  id: THEME_ID,
  name: "Copper Spice",
  description: "Warm theme with terracotta orange, golden amber, and deep mahogany",
  category: "creative",

  colors: {
    background: "#DD9047",
    backgroundAlt: "#d08038",
    surface: "#ffffff",
    surfaceHover: "#fff8f2",

    text: "#602314",
    textMuted: "#8a4a38",
    textInverse: "#ffffff",
    heading: "#602314",

    primary: "#602314",
    primaryHover: "#4d1c10",
    secondary: "#BC552A",
    secondaryHover: "#a04824",
    accent: "#BC552A",

    border: "#c87a35",
    borderStrong: "#602314",
    borderHover: "#4d1c10",

    shadow: "rgba(96, 35, 20, 0.15)",
    overlay: "rgba(96, 35, 20, 0.6)",
    glow: "rgba(188, 85, 42, 0.25)",

    link: "#602314",
    linkHover: "#4d1c10",

    success: "#5cb85c",
    warning: "#DD9047",
    error: "#BC552A",
  },

  fonts: {
    heading: {
      family: "'Josefin Sans', sans-serif",
      weight: 700,
      letterSpacing: "0.02em",
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
      "https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@400;500;600;700&display=swap",
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
      small: "0 2px 4px rgba(96, 35, 20, 0.1)",
      medium: "0 4px 12px rgba(96, 35, 20, 0.15)",
      large: "0 8px 24px rgba(96, 35, 20, 0.2)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #DD9047 0%, #d08038 100%)",
      pattern: "radial-gradient(circle at 80% 20%, rgba(188, 85, 42, 0.1) 0%, transparent 50%)",
    },
    content: {
      background: "#ffffff",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "0.75rem",
      shadow: "0 8px 24px rgba(96, 35, 20, 0.2)",
      overlay: "linear-gradient(to top, rgba(96, 35, 20, 0.4), transparent)",
    },
  },

  slideShape: {
    type: "rounded",
    borderRadius: "14px",
    shadow: "deep",
  },

  cardBox: {
    background: "#ffffff",
    borderColor: "#c87a35",
    titleColor: "#602314",
    bodyColor: "#602314",
    accentColor: "#BC552A",
    shadow: "0 4px 12px rgba(96, 35, 20, 0.12)",
    hoverBackground: "#fff8f2",
    hoverBorderColor: "#602314",
  },

  layoutElements: {
    background: "#ffffff",
    borderColor: "#c87a35",
    hoverBackground: "#fff8f2",
  },

  gradients: {
    primary: "linear-gradient(135deg, #602314 0%, #BC552A 100%)",
    secondary: "linear-gradient(135deg, #DD9047 0%, #d08038 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(96, 35, 20, 0.5) 100%)",
    text: "linear-gradient(135deg, #602314 0%, #BC552A 100%)",
  },

  preview: {
    titleBg: "#DD9047",
    bodyBg: "#ffffff",
    textColor: "#602314",
    accentColor: "#BC552A",
  },

  backgroundImage: "https://res.cloudinary.com/di76ibrro/image/upload/v1767958571/Generated_Image_January_09_2026_-_3_35AM_fbo3zt.jpg",
  previewBackgroundImage: "https://res.cloudinary.com/di76ibrro/image/upload/v1767958571/Generated_Image_January_09_2026_-_3_35AM_fbo3zt.jpg",
  backgroundPosition: "center",
  backgroundSize: "cover",
  overlay: "rgba(221, 144, 71, 0.7)",
  pageBackground: undefined,
};

export default copperSpiceTheme;
