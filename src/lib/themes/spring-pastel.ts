/**
 * Spring Pastel Theme
 * Soft pastel colors inspired by spring flowers
 */

import type { Theme } from "./types";

export const springPastelTheme: Theme = {
  id: "spring-pastel",
  name: "Spring Pastel",
  description: "Soft pastel colors inspired by spring flowers",
  category: "light",

  colors: {
    background: "#FFF8F0",
    backgroundAlt: "#FFF0E5",
    surface: "#FFFFFF",
    surfaceHover: "#FFFAF5",
    text: "#4A4A4A",
    textMuted: "#7A7A7A",
    textInverse: "#FFFFFF",
    heading: "#3A3A3A",
    primary: "#FFB5BA",
    primaryHover: "#FF9DA3",
    secondary: "#B5D8EB",
    secondaryHover: "#9DCCE5",
    accent: "#C5E8B7",
    border: "#E8D5C4",
    borderStrong: "#D4C0AF",
    borderHover: "#FFB5BA",
    shadow: "rgba(74, 74, 74, 0.08)",
    overlay: "rgba(58, 58, 58, 0.4)",
    glow: "rgba(255, 181, 186, 0.3)",
    link: "#E89AAA",
    linkHover: "#D88595",
    success: "#C5E8B7",
    warning: "#FFE5A0",
    error: "#FF9DA3",
  },

  fonts: {
    heading: {
      family: "'Quicksand', system-ui, sans-serif",
      weight: 600,
      letterSpacing: "0em",
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
      "https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap",
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
      small: "0 1px 3px rgba(74, 74, 74, 0.06)",
      medium: "0 4px 6px rgba(74, 74, 74, 0.08)",
      large: "0 10px 25px rgba(74, 74, 74, 0.1)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #FFB5BA 0%, #B5D8EB 50%, #C5E8B7 100%)",
      pattern: "radial-gradient(circle at 80% 20%, rgba(197, 232, 183, 0.3) 0%, transparent 50%)",
    },
    content: {
      background: "#FFF8F0",
      bulletStyle: "circle",
    },
    image: {
      borderRadius: "1rem",
      shadow: "0 8px 30px rgba(74, 74, 74, 0.1)",
      overlay: "linear-gradient(to top, rgba(58, 58, 58, 0.15), transparent)",
    },
  },

  slideShape: {
    type: "soft",
    borderRadius: "16px",
    shadow: "subtle",
  },

  cardBox: {
    background: "#FFF8F0",
    borderColor: "#E8D5C4",
    titleColor: "#3A3A3A",
    bodyColor: "#4A4A4A",
    accentColor: "#FFB5BA",
    shadow: "0 2px 8px rgba(74, 74, 74, 0.06)",
    hoverBackground: "#FFF0E5",
    hoverBorderColor: "#D4C0AF",
  },

  layoutElements: {
    background: "#FFFFFF",
    borderColor: "#E8D5C4",
    hoverBackground: "#FFFAF5",
  },

  gradients: {
    primary: "linear-gradient(135deg, #FFB5BA 0%, #B5D8EB 50%, #C5E8B7 100%)",
    secondary: "linear-gradient(135deg, #FFF8F0 0%, #FFF0E5 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(58, 58, 58, 0.2) 100%)",
    text: "linear-gradient(135deg, #FFB5BA 0%, #B5D8EB 100%)",
  },

  preview: {
    titleBg: "#FFB5BA",
    bodyBg: "#FFF8F0",
    textColor: "#4A4A4A",
    accentColor: "#FFB5BA",
  },

  pageBackground: "#FFF8F0",
};

export default springPastelTheme;
