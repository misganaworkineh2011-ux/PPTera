/**
 * Fire Gradient Theme
 * Bold fire colors from red to orange to yellow
 */

import type { Theme } from "./types";

export const fireGradientTheme: Theme = {
  id: "fire-gradient",
  name: "Fire Gradient",
  description: "Bold fire colors from red to orange to yellow",
  category: "bold",

  colors: {
    background: "#FFF8F0",
    backgroundAlt: "#FFEDE0",
    surface: "#FFFFFF",
    surfaceHover: "#FFFAF5",
    text: "#4A2A1A",
    textMuted: "#8A5A3A",
    textInverse: "#FFFFFF",
    heading: "#3A1A0A",
    primary: "#E63946",
    primaryHover: "#D32F3D",
    secondary: "#FF6B35",
    secondaryHover: "#E85A28",
    accent: "#FFB347",
    border: "#FFB347",
    borderStrong: "#FF6B35",
    borderHover: "#E63946",
    shadow: "rgba(74, 42, 26, 0.1)",
    overlay: "rgba(58, 26, 10, 0.5)",
    glow: "rgba(230, 57, 70, 0.3)",
    link: "#E63946",
    linkHover: "#D32F3D",
    success: "#4CAF50",
    warning: "#FFB347",
    error: "#E63946",
  },

  fonts: {
    heading: {
      family: "'Montserrat', system-ui, sans-serif",
      weight: 800,
      letterSpacing: "-0.02em",
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
      "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap",
    ],
  },

  design: {
    borderRadius: {
      small: "0.25rem",
      medium: "0.5rem",
      large: "0.75rem",
      full: "9999px",
    },
    shadows: {
      small: "0 1px 3px rgba(74, 42, 26, 0.08)",
      medium: "0 4px 6px rgba(74, 42, 26, 0.1)",
      large: "0 10px 25px rgba(74, 42, 26, 0.15)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #E63946 0%, #FF6B35 50%, #FFB347 100%)",
      pattern: "radial-gradient(circle at 80% 20%, rgba(255, 179, 71, 0.3) 0%, transparent 50%)",
    },
    content: {
      background: "#FFF8F0",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "0.5rem",
      shadow: "0 8px 30px rgba(74, 42, 26, 0.12)",
      overlay: "linear-gradient(to top, rgba(58, 26, 10, 0.2), transparent)",
    },
  },

  slideShape: {
    type: "rounded",
    borderRadius: "8px",
    shadow: "medium",
  },

  cardBox: {
    background: "#FFF8F0",
    borderColor: "#FFB347",
    titleColor: "#3A1A0A",
    bodyColor: "#4A2A1A",
    accentColor: "#E63946",
    shadow: "0 2px 8px rgba(74, 42, 26, 0.08)",
    hoverBackground: "#FFEDE0",
    hoverBorderColor: "#FF6B35",
  },

  layoutElements: {
    background: "#FFFFFF",
    borderColor: "#FFB347",
    hoverBackground: "#FFFAF5",
  },

  gradients: {
    primary: "linear-gradient(135deg, #E63946 0%, #FF6B35 50%, #FFB347 100%)",
    secondary: "linear-gradient(135deg, #FFF8F0 0%, #FFEDE0 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(58, 26, 10, 0.3) 100%)",
    text: "linear-gradient(135deg, #E63946 0%, #FFB347 100%)",
  },

  preview: {
    titleBg: "#E63946",
    bodyBg: "#FFF8F0",
    textColor: "#4A2A1A",
    accentColor: "#E63946",
  },

  pageBackground: "#FFF8F0",
};

export default fireGradientTheme;
