/**
 * Midnight Border Theme
 * Dark blue theme with rounded border and golden accents
 */

import type { Theme } from "./types";
import { getSlideBackgroundUrl, getThemePreviewUrl } from "./cloudinary";

const THEME_ID = "midnight-border";

export const midnightBorderTheme: Theme = {
  id: THEME_ID,
  name: "Midnight Border",
  description: "Dark blue theme with elegant border and golden accents",
  category: "bold",

  colors: {
    background: "#0f1729",
    backgroundAlt: "#1a2540",
    surface: "#1a2540",
    surfaceHover: "#243050",

    text: "#c8d0e0",
    textMuted: "#8090b0",
    textInverse: "#0f1729",
    heading: "#ffffff",

    primary: "#4a6090",
    primaryHover: "#5a70a0",
    secondary: "#6080b0",
    secondaryHover: "#7090c0",
    accent: "#d4a03c",

    border: "#3a4a70",
    borderStrong: "#4a5a80",
    borderHover: "#5a6a90",

    shadow: "rgba(15, 23, 41, 0.4)",
    overlay: "rgba(15, 23, 41, 0.85)",
    glow: "rgba(74, 96, 144, 0.3)",

    link: "#d4a03c",
    linkHover: "#e4b04c",

    success: "#4ade80",
    warning: "#d4a03c",
    error: "#ef4444",
  },

  fonts: {
    heading: {
      family: "'Inter', var(--font-geist-sans), sans-serif",
      weight: 500,
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
      small: "0 2px 8px rgba(15, 23, 41, 0.3)",
      medium: "0 4px 16px rgba(15, 23, 41, 0.4)",
      large: "0 8px 32px rgba(15, 23, 41, 0.5)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "#0f1729",
      pattern: "radial-gradient(ellipse at 30% 70%, rgba(74, 96, 144, 0.15) 0%, transparent 50%)",
    },
    content: {
      background: "#1a2540",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "1rem",
      shadow: "0 8px 32px rgba(15, 23, 41, 0.5)",
      overlay: "linear-gradient(to top, rgba(15, 23, 41, 0.6), transparent)",
    },
  },

  slideShape: {
    type: "soft",
    borderRadius: "24px",
    shadow: "none",
    border: {
      width: "4px",
      color: "#4a5a80",
      style: "solid",
    },
  },

  cardBox: {
    background: "#1a2540",
    borderColor: "#4a5a80",
    titleColor: "#ffffff",
    bodyColor: "#c8d0e0",
    accentColor: "#d4a03c",
    shadow: "none",
    hoverBackground: "#243050",
    hoverBorderColor: "#5a6a90",
  },

  layoutElements: {
    background: "#1a2540",
    borderColor: "#4a5a80",
    hoverBackground: "#243050",
  },

  gradients: {
    primary: "linear-gradient(135deg, #4a6090 0%, #6080b0 100%)",
    secondary: "linear-gradient(135deg, #0f1729 0%, #1a2540 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(15, 23, 41, 0.8) 100%)",
    text: "linear-gradient(135deg, #ffffff 0%, #c8d0e0 100%)",
  },

  preview: {
    titleBg: "#0f1729",
    bodyBg: "#1a2540",
    textColor: "#c8d0e0",
    accentColor: "#d4a03c",
  },

  backgroundImage: getSlideBackgroundUrl(THEME_ID),
  previewBackgroundImage: getThemePreviewUrl(THEME_ID),
  backgroundPosition: "center",
  backgroundSize: "cover",
  overlay: "rgba(15, 23, 41, 0.75)",
  pageBackground: "radial-gradient(ellipse at 20% 30%, rgba(74, 96, 144, 0.15) 0%, transparent 45%), radial-gradient(ellipse at 80% 70%, rgba(212, 160, 60, 0.08) 0%, transparent 40%), radial-gradient(ellipse at 50% 100%, rgba(74, 96, 144, 0.1) 0%, transparent 50%), linear-gradient(180deg, #0f1729 0%, #1a2540 50%, #0f1729 100%)",
};

export default midnightBorderTheme;
