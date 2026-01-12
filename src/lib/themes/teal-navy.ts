/**
 * Teal Navy Theme
 * Deep navy blues with teal accents
 */

import type { Theme } from "./types";

export const tealNavyTheme: Theme = {
  id: "teal-navy",
  name: "Teal Navy",
  description: "Deep navy blues with teal accents",
  category: "professional",

  colors: {
    background: "#E8F4F8",
    backgroundAlt: "#D8EBF0",
    surface: "#FFFFFF",
    surfaceHover: "#F0F8FA",
    text: "#1A3A4A",
    textMuted: "#2D6A7A",
    textInverse: "#FFFFFF",
    heading: "#0F2A38",
    primary: "#1A5F7A",
    primaryHover: "#144D64",
    secondary: "#2D8A9A",
    secondaryHover: "#247A88",
    accent: "#5BC0BE",
    border: "#5BC0BE",
    borderStrong: "#2D8A9A",
    borderHover: "#1A5F7A",
    shadow: "rgba(26, 58, 74, 0.1)",
    overlay: "rgba(15, 42, 56, 0.5)",
    glow: "rgba(26, 95, 122, 0.3)",
    link: "#1A5F7A",
    linkHover: "#144D64",
    success: "#2D8A9A",
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
      small: "0.25rem",
      medium: "0.5rem",
      large: "0.75rem",
      full: "9999px",
    },
    shadows: {
      small: "0 1px 3px rgba(26, 58, 74, 0.08)",
      medium: "0 4px 6px rgba(26, 58, 74, 0.1)",
      large: "0 10px 25px rgba(26, 58, 74, 0.15)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #1A5F7A 0%, #2D8A9A 50%, #5BC0BE 100%)",
      pattern: "radial-gradient(circle at 80% 20%, rgba(91, 192, 190, 0.2) 0%, transparent 50%)",
    },
    content: {
      background: "#E8F4F8",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "0.5rem",
      shadow: "0 8px 30px rgba(26, 58, 74, 0.12)",
      overlay: "linear-gradient(to top, rgba(15, 42, 56, 0.2), transparent)",
    },
  },

  slideShape: {
    type: "rounded",
    borderRadius: "8px",
    shadow: "medium",
  },

  cardBox: {
    background: "#E8F4F8",
    borderColor: "#5BC0BE",
    titleColor: "#0F2A38",
    bodyColor: "#1A3A4A",
    accentColor: "#1A5F7A",
    shadow: "0 2px 8px rgba(26, 58, 74, 0.08)",
    hoverBackground: "#D8EBF0",
    hoverBorderColor: "#2D8A9A",
  },

  layoutElements: {
    background: "#FFFFFF",
    borderColor: "#5BC0BE",
    hoverBackground: "#F0F8FA",
  },

  gradients: {
    primary: "linear-gradient(135deg, #1A5F7A 0%, #2D8A9A 50%, #5BC0BE 100%)",
    secondary: "linear-gradient(135deg, #E8F4F8 0%, #D8EBF0 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(15, 42, 56, 0.3) 100%)",
    text: "linear-gradient(135deg, #0F2A38 0%, #1A5F7A 100%)",
  },

  preview: {
    titleBg: "#1A5F7A",
    bodyBg: "#E8F4F8",
    textColor: "#1A3A4A",
    accentColor: "#1A5F7A",
  },

  pageBackground: "#E8F4F8",
};

export default tealNavyTheme;
