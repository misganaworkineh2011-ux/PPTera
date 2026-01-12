/**
 * Forest Mist Theme
 * Deep forest greens with misty undertones
 */

import type { Theme } from "./types";

export const forestMistTheme: Theme = {
  id: "forest-mist",
  name: "Forest Mist",
  description: "Deep forest greens with misty undertones",
  category: "light",

  colors: {
    background: "#EBF4DD",
    backgroundAlt: "#DCE9CC",
    surface: "#FFFFFF",
    surfaceHover: "#F2F8E8",
    text: "#3B4953",
    textMuted: "#5A7863",
    textInverse: "#FFFFFF",
    heading: "#2A3840",
    primary: "#5A7863",
    primaryHover: "#4A6853",
    secondary: "#3B4953",
    secondaryHover: "#2A3840",
    accent: "#90AB8B",
    border: "#90AB8B",
    borderStrong: "#5A7863",
    borderHover: "#3B4953",
    shadow: "rgba(59, 73, 83, 0.1)",
    overlay: "rgba(42, 56, 64, 0.5)",
    glow: "rgba(90, 120, 99, 0.3)",
    link: "#5A7863",
    linkHover: "#4A6853",
    success: "#5A7863",
    warning: "#E5BA41",
    error: "#D32F2F",
  },

  fonts: {
    heading: {
      family: "Georgia, serif",
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
      small: "0 1px 3px rgba(59, 73, 83, 0.08)",
      medium: "0 4px 6px rgba(59, 73, 83, 0.1)",
      large: "0 10px 25px rgba(59, 73, 83, 0.15)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #3B4953 0%, #5A7863 50%, #90AB8B 100%)",
      pattern: "radial-gradient(circle at 80% 20%, rgba(144, 171, 139, 0.2) 0%, transparent 50%)",
    },
    content: {
      background: "#EBF4DD",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "0.5rem",
      shadow: "0 8px 30px rgba(59, 73, 83, 0.12)",
      overlay: "linear-gradient(to top, rgba(42, 56, 64, 0.2), transparent)",
    },
  },

  slideShape: {
    type: "rounded",
    borderRadius: "8px",
    shadow: "medium",
  },

  cardBox: {
    background: "#EBF4DD",
    borderColor: "#90AB8B",
    titleColor: "#2A3840",
    bodyColor: "#3B4953",
    accentColor: "#5A7863",
    shadow: "0 2px 8px rgba(59, 73, 83, 0.08)",
    hoverBackground: "#DCE9CC",
    hoverBorderColor: "#5A7863",
  },

  layoutElements: {
    background: "#FFFFFF",
    borderColor: "#90AB8B",
    hoverBackground: "#F2F8E8",
  },

  gradients: {
    primary: "linear-gradient(135deg, #3B4953 0%, #5A7863 50%, #90AB8B 100%)",
    secondary: "linear-gradient(135deg, #EBF4DD 0%, #DCE9CC 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(42, 56, 64, 0.3) 100%)",
    text: "linear-gradient(135deg, #2A3840 0%, #5A7863 100%)",
  },

  preview: {
    titleBg: "#5A7863",
    bodyBg: "#EBF4DD",
    textColor: "#3B4953",
    accentColor: "#5A7863",
  },

  pageBackground: "#EBF4DD",
};

export default forestMistTheme;
