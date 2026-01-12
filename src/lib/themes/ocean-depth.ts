/**
 * Ocean Depth Theme
 * Deep ocean blues from light to dark
 */

import type { Theme } from "./types";

export const oceanDepthTheme: Theme = {
  id: "ocean-depth",
  name: "Ocean Depth",
  description: "Deep ocean blues from light to dark",
  category: "light",

  colors: {
    background: "#BDE8F5",
    backgroundAlt: "#A8DCF0",
    surface: "#FFFFFF",
    surfaceHover: "#D4F0FA",
    text: "#0F2854",
    textMuted: "#1C4D8D",
    textInverse: "#FFFFFF",
    heading: "#0A1E40",
    primary: "#1C4D8D",
    primaryHover: "#153D70",
    secondary: "#0F2854",
    secondaryHover: "#0A1E40",
    accent: "#4988C4",
    border: "#4988C4",
    borderStrong: "#1C4D8D",
    borderHover: "#0F2854",
    shadow: "rgba(15, 40, 84, 0.1)",
    overlay: "rgba(10, 30, 64, 0.5)",
    glow: "rgba(28, 77, 141, 0.3)",
    link: "#1C4D8D",
    linkHover: "#153D70",
    success: "#4988C4",
    warning: "#E5BA41",
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
      small: "0.375rem",
      medium: "0.75rem",
      large: "1rem",
      full: "9999px",
    },
    shadows: {
      small: "0 1px 3px rgba(15, 40, 84, 0.08)",
      medium: "0 4px 6px rgba(15, 40, 84, 0.1)",
      large: "0 10px 25px rgba(15, 40, 84, 0.15)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #0F2854 0%, #1C4D8D 50%, #4988C4 100%)",
      pattern: "radial-gradient(circle at 80% 20%, rgba(73, 136, 196, 0.2) 0%, transparent 50%)",
    },
    content: {
      background: "#BDE8F5",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "0.75rem",
      shadow: "0 8px 30px rgba(15, 40, 84, 0.12)",
      overlay: "linear-gradient(to top, rgba(10, 30, 64, 0.2), transparent)",
    },
  },

  slideShape: {
    type: "rounded",
    borderRadius: "12px",
    shadow: "medium",
  },

  cardBox: {
    background: "#BDE8F5",
    borderColor: "#4988C4",
    titleColor: "#0A1E40",
    bodyColor: "#0F2854",
    accentColor: "#1C4D8D",
    shadow: "0 2px 8px rgba(15, 40, 84, 0.08)",
    hoverBackground: "#A8DCF0",
    hoverBorderColor: "#1C4D8D",
  },

  layoutElements: {
    background: "#FFFFFF",
    borderColor: "#4988C4",
    hoverBackground: "#D4F0FA",
  },

  gradients: {
    primary: "linear-gradient(135deg, #0F2854 0%, #1C4D8D 50%, #4988C4 100%)",
    secondary: "linear-gradient(135deg, #BDE8F5 0%, #A8DCF0 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(10, 30, 64, 0.3) 100%)",
    text: "linear-gradient(135deg, #0A1E40 0%, #1C4D8D 100%)",
  },

  preview: {
    titleBg: "#1C4D8D",
    bodyBg: "#BDE8F5",
    textColor: "#0F2854",
    accentColor: "#1C4D8D",
  },

  pageBackground: "#BDE8F5",
};

export default oceanDepthTheme;
