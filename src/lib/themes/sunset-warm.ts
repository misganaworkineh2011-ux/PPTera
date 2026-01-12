/**
 * Sunset Warm Theme
 * Warm sunset colors with orange, coral, and golden hues
 */

import type { Theme } from "./types";

export const sunsetWarmTheme: Theme = {
  id: "sunset-warm",
  name: "Sunset Warm",
  description: "Warm sunset colors with orange, coral, and golden hues",
  category: "creative",

  colors: {
    background: "#FFF8F2",
    backgroundAlt: "#FFEEE0",
    surface: "#FFFFFF",
    surfaceHover: "#FFFAF6",
    text: "#4A3525",
    textMuted: "#8A6550",
    textInverse: "#FFFFFF",
    heading: "#3A2515",
    primary: "#E07A5F",
    primaryHover: "#D06A4F",
    secondary: "#F2A65A",
    secondaryHover: "#E29648",
    accent: "#F4D35E",
    border: "#F4D35E",
    borderStrong: "#F2A65A",
    borderHover: "#E07A5F",
    shadow: "rgba(74, 53, 37, 0.1)",
    overlay: "rgba(58, 37, 21, 0.5)",
    glow: "rgba(224, 122, 95, 0.3)",
    link: "#E07A5F",
    linkHover: "#D06A4F",
    success: "#4CAF50",
    warning: "#F2A65A",
    error: "#D06A4F",
  },

  fonts: {
    heading: {
      family: "'Playfair Display', Georgia, serif",
      weight: 700,
      letterSpacing: "-0.01em",
    },
    body: {
      family: "system-ui, sans-serif",
      weight: 400,
      lineHeight: "1.6",
    },
    caption: {
      family: "system-ui, sans-serif",
      weight: 500,
      size: "0.875rem",
    },
    mono: {
      family: "monospace",
    },
    googleFontsUrls: [
      "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap",
    ],
  },

  design: {
    borderRadius: {
      small: "0.375rem",
      medium: "0.75rem",
      large: "1rem",
      full: "9999px",
    },
    shadows: {
      small: "0 1px 3px rgba(74, 53, 37, 0.08)",
      medium: "0 4px 6px rgba(74, 53, 37, 0.1)",
      large: "0 10px 25px rgba(74, 53, 37, 0.15)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #E07A5F 0%, #F2A65A 50%, #F4D35E 100%)",
      pattern: "radial-gradient(circle at 80% 20%, rgba(244, 211, 94, 0.3) 0%, transparent 50%)",
    },
    content: {
      background: "#FFF8F2",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "0.75rem",
      shadow: "0 8px 30px rgba(74, 53, 37, 0.12)",
      overlay: "linear-gradient(to top, rgba(58, 37, 21, 0.2), transparent)",
    },
  },

  slideShape: {
    type: "rounded",
    borderRadius: "12px",
    shadow: "medium",
  },

  cardBox: {
    background: "#FFF8F2",
    borderColor: "#F4D35E",
    titleColor: "#3A2515",
    bodyColor: "#4A3525",
    accentColor: "#E07A5F",
    shadow: "0 2px 8px rgba(74, 53, 37, 0.08)",
    hoverBackground: "#FFEEE0",
    hoverBorderColor: "#F2A65A",
  },

  layoutElements: {
    background: "#FFFFFF",
    borderColor: "#F4D35E",
    hoverBackground: "#FFFAF6",
  },

  gradients: {
    primary: "linear-gradient(135deg, #E07A5F 0%, #F2A65A 50%, #F4D35E 100%)",
    secondary: "linear-gradient(135deg, #FFF8F2 0%, #FFEEE0 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(58, 37, 21, 0.3) 100%)",
    text: "linear-gradient(135deg, #E07A5F 0%, #F4D35E 100%)",
  },

  preview: {
    titleBg: "#E07A5F",
    bodyBg: "#FFF8F2",
    textColor: "#4A3525",
    accentColor: "#E07A5F",
  },

  pageBackground: "#FFF8F2",
};

export default sunsetWarmTheme;
