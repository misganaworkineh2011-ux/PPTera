/**
 * Retro Motorbike Theme
 * A vintage theme with sage green, cream, and burgundy accents with classic motorbike background
 */

import type { Theme } from "./types";

const THEME_ID = "retro-motorbike";

export const retroMotorbikeTheme: Theme = {
  id: THEME_ID,
  name: "Retro Motorbike",
  description: "Vintage theme with sage green, cream, and burgundy accents",
  category: "creative",

  colors: {
    background: "#E7EDEB",
    backgroundAlt: "#dce5e2",
    surface: "#ffffff",
    surfaceHover: "#f8faf9",

    text: "#2d3b35",
    textMuted: "#5a6b62",
    textInverse: "#ffffff",
    heading: "#7C1F31",

    primary: "#69A481",
    primaryHover: "#5a9372",
    secondary: "#7C1F31",
    secondaryHover: "#6a1a2a",
    accent: "#7C1F31",

    border: "#c5d4cc",
    borderStrong: "#69A481",
    borderHover: "#5a9372",

    shadow: "rgba(124, 31, 49, 0.12)",
    overlay: "rgba(45, 59, 53, 0.6)",
    glow: "rgba(105, 164, 129, 0.3)",

    link: "#7C1F31",
    linkHover: "#6a1a2a",

    success: "#69A481",
    warning: "#d4a03c",
    error: "#7C1F31",
  },

  fonts: {
    heading: {
      family: "'Playfair Display', serif",
      weight: 700,
      letterSpacing: "-0.01em",
    },
    body: {
      family: "'Lora', serif",
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
      "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Lora:wght@400;500;600&display=swap",
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
      small: "0 2px 4px rgba(124, 31, 49, 0.08)",
      medium: "0 4px 12px rgba(124, 31, 49, 0.12)",
      large: "0 8px 24px rgba(124, 31, 49, 0.16)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #E7EDEB 0%, #dce5e2 100%)",
      pattern: "radial-gradient(circle at 80% 20%, rgba(124, 31, 49, 0.05) 0%, transparent 50%)",
    },
    content: {
      background: "#ffffff",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "0.75rem",
      shadow: "0 8px 24px rgba(124, 31, 49, 0.16)",
      overlay: "linear-gradient(to top, rgba(45, 59, 53, 0.4), transparent)",
    },
  },

  slideShape: {
    type: "rounded",
    borderRadius: "8px",
    shadow: "medium",
  },

  cardBox: {
    background: "#ffffff",
    borderColor: "#c5d4cc",
    titleColor: "#7C1F31",
    bodyColor: "#2d3b35",
    accentColor: "#69A481",
    shadow: "0 4px 12px rgba(124, 31, 49, 0.08)",
    hoverBackground: "#f8faf9",
    hoverBorderColor: "#69A481",
  },

  layoutElements: {
    background: "#ffffff",
    borderColor: "#c5d4cc",
    hoverBackground: "#f8faf9",
  },

  gradients: {
    primary: "linear-gradient(135deg, #69A481 0%, #7C1F31 100%)",
    secondary: "linear-gradient(135deg, #E7EDEB 0%, #dce5e2 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(45, 59, 53, 0.5) 100%)",
    text: "linear-gradient(135deg, #7C1F31 0%, #69A481 100%)",
  },

  preview: {
    titleBg: "#E7EDEB",
    bodyBg: "#ffffff",
    textColor: "#2d3b35",
    accentColor: "#7C1F31",
  },

  backgroundImage: "https://res.cloudinary.com/di76ibrro/image/upload/v1767949353/Generated_Image_January_09_2026_-_12_49AM_eztygi.jpg",
  previewBackgroundImage: "https://res.cloudinary.com/di76ibrro/image/upload/v1767949353/Generated_Image_January_09_2026_-_12_49AM_eztygi.jpg",
  backgroundPosition: "center",
  backgroundSize: "cover",
  overlay: "rgba(231, 237, 235, 0.75)",
  pageBackground: undefined, // Let backgroundImage show through
};

export default retroMotorbikeTheme;
