/**
 * Coral Teal Theme
 * Vibrant coral orange with refreshing teal accents
 */

import type { Theme } from "./types";

export const coralTealTheme: Theme = {
  id: "coral-teal",
  name: "Coral Teal",
  description: "Vibrant coral orange with refreshing teal accents",
  category: "creative",

  colors: {
    background: "#F6F3C2",
    backgroundAlt: "#EDE9B0",
    surface: "#FFFFFF",
    surfaceHover: "#FAF8D8",
    text: "#2D3C3E",
    textMuted: "#4B9DA9",
    textInverse: "#FFFFFF",
    heading: "#1E2A2C",
    primary: "#E37434",
    primaryHover: "#D0652A",
    secondary: "#4B9DA9",
    secondaryHover: "#3D8A95",
    accent: "#91C6BC",
    border: "#91C6BC",
    borderStrong: "#4B9DA9",
    borderHover: "#E37434",
    shadow: "rgba(45, 60, 62, 0.1)",
    overlay: "rgba(30, 42, 44, 0.5)",
    glow: "rgba(227, 116, 52, 0.3)",
    link: "#E37434",
    linkHover: "#D0652A",
    success: "#4B9DA9",
    warning: "#E37434",
    error: "#D32F2F",
  },

  fonts: {
    heading: {
      family: "system-ui, sans-serif",
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
  },

  design: {
    borderRadius: {
      small: "0.5rem",
      medium: "1rem",
      large: "1.25rem",
      full: "9999px",
    },
    shadows: {
      small: "0 1px 3px rgba(45, 60, 62, 0.08)",
      medium: "0 4px 6px rgba(45, 60, 62, 0.1)",
      large: "0 10px 25px rgba(45, 60, 62, 0.15)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #E37434 0%, #4B9DA9 100%)",
      pattern: "radial-gradient(circle at 80% 20%, rgba(145, 198, 188, 0.2) 0%, transparent 50%)",
    },
    content: {
      background: "#F6F3C2",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "1rem",
      shadow: "0 8px 30px rgba(45, 60, 62, 0.12)",
      overlay: "linear-gradient(to top, rgba(30, 42, 44, 0.2), transparent)",
    },
  },

  slideShape: {
    type: "soft",
    borderRadius: "16px",
    shadow: "medium",
  },

  cardBox: {
    background: "#F6F3C2",
    borderColor: "#91C6BC",
    titleColor: "#1E2A2C",
    bodyColor: "#2D3C3E",
    accentColor: "#E37434",
    shadow: "0 2px 8px rgba(45, 60, 62, 0.08)",
    hoverBackground: "#EDE9B0",
    hoverBorderColor: "#4B9DA9",
  },

  layoutElements: {
    background: "#FFFFFF",
    borderColor: "#91C6BC",
    hoverBackground: "#FAF8D8",
  },

  gradients: {
    primary: "linear-gradient(135deg, #E37434 0%, #4B9DA9 100%)",
    secondary: "linear-gradient(135deg, #F6F3C2 0%, #EDE9B0 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(30, 42, 44, 0.3) 100%)",
    text: "linear-gradient(135deg, #E37434 0%, #4B9DA9 100%)",
  },

  preview: {
    titleBg: "#E37434",
    bodyBg: "#F6F3C2",
    textColor: "#2D3C3E",
    accentColor: "#E37434",
  },

  pageBackground: "#F6F3C2",
};

export default coralTealTheme;
