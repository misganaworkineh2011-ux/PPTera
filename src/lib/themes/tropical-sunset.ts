/**
 * Tropical Sunset Theme
 * Warm tropical colors with sunset orange and pink hues
 */

import type { Theme } from "./types";

export const tropicalSunsetTheme: Theme = {
  id: "tropical-sunset",
  name: "Amber Professional",
  description: "Warm tropical colors with sunset orange and pink hues",
  category: "creative",

  colors: {
    background: "#FFF5E6",
    backgroundAlt: "#FFE8D0",
    surface: "#FFFFFF",
    surfaceHover: "#FFF9F0",
    text: "#4A3728",
    textMuted: "#7A5D4A",
    textInverse: "#FFFFFF",
    heading: "#3A2A1E",
    primary: "#FF6B35",
    primaryHover: "#E85A28",
    secondary: "#FF8E72",
    secondaryHover: "#FF7A5A",
    accent: "#FFB347",
    border: "#FFB347",
    borderStrong: "#FF8E72",
    borderHover: "#FF6B35",
    shadow: "rgba(74, 55, 40, 0.1)",
    overlay: "rgba(58, 42, 30, 0.5)",
    glow: "rgba(255, 107, 53, 0.3)",
    link: "#FF6B35",
    linkHover: "#E85A28",
    success: "#4CAF50",
    warning: "#FFB347",
    error: "#E85A28",
  },

  fonts: {
    heading: {
      family: "'Poppins', system-ui, sans-serif",
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
      "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap",
    ],
  },

  design: {
    borderRadius: {
      small: "0.5rem",
      medium: "1rem",
      large: "1.5rem",
      full: "9999px",
    },
    shadows: {
      small: "0 1px 3px rgba(74, 55, 40, 0.08)",
      medium: "0 4px 6px rgba(74, 55, 40, 0.1)",
      large: "0 10px 25px rgba(74, 55, 40, 0.15)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #FF6B35 0%, #FF8E72 50%, #FFB347 100%)",
      pattern: "radial-gradient(circle at 80% 20%, rgba(255, 179, 71, 0.3) 0%, transparent 50%)",
    },
    content: {
      background: "#FFF5E6",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "1rem",
      shadow: "0 8px 30px rgba(74, 55, 40, 0.12)",
      overlay: "linear-gradient(to top, rgba(58, 42, 30, 0.2), transparent)",
    },
  },

  slideShape: {
    type: "soft",
    borderRadius: "16px",
    shadow: "medium",
  },

  cardBox: {
    background: "#FFF5E6",
    borderColor: "#FFB347",
    titleColor: "#3A2A1E",
    bodyColor: "#4A3728",
    accentColor: "#FF6B35",
    shadow: "0 2px 8px rgba(74, 55, 40, 0.08)",
    hoverBackground: "#FFE8D0",
    hoverBorderColor: "#FF8E72",
  },

  layoutElements: {
    background: "#FFFFFF",
    borderColor: "#FFB347",
    hoverBackground: "#FFF9F0",
  },

  gradients: {
    primary: "linear-gradient(135deg, #FF6B35 0%, #FF8E72 50%, #FFB347 100%)",
    secondary: "linear-gradient(135deg, #FFF5E6 0%, #FFE8D0 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(58, 42, 30, 0.3) 100%)",
    text: "linear-gradient(135deg, #FF6B35 0%, #FFB347 100%)",
  },

  preview: {
    titleBg: "#FF6B35",
    bodyBg: "#FFF5E6",
    textColor: "#4A3728",
    accentColor: "#FF6B35",
  },

  pageBackground: "#FFF5E6",
};

export default tropicalSunsetTheme;
