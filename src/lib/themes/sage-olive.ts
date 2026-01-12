/**
 * Sage Olive Theme
 * Natural earthy tones with sage and olive greens
 */

import type { Theme } from "./types";

export const sageOliveTheme: Theme = {
  id: "sage-olive",
  name: "Sage Olive",
  description: "Natural earthy tones with sage and olive greens",
  category: "light",

  colors: {
    background: "#F6F0D7",
    backgroundAlt: "#EDE7C7",
    surface: "#FFFFFF",
    surfaceHover: "#F9F5E8",
    text: "#3D4A3A",
    textMuted: "#6B7A68",
    textInverse: "#FFFFFF",
    heading: "#2D3A2A",
    primary: "#89986D",
    primaryHover: "#7A8960",
    secondary: "#9CAB84",
    secondaryHover: "#8D9C75",
    accent: "#C5D89D",
    border: "#C5D89D",
    borderStrong: "#9CAB84",
    borderHover: "#89986D",
    shadow: "rgba(61, 74, 58, 0.1)",
    overlay: "rgba(45, 58, 42, 0.5)",
    glow: "rgba(137, 152, 109, 0.3)",
    link: "#89986D",
    linkHover: "#7A8960",
    success: "#89986D",
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
      small: "0.375rem",
      medium: "0.75rem",
      large: "1rem",
      full: "9999px",
    },
    shadows: {
      small: "0 1px 3px rgba(61, 74, 58, 0.08)",
      medium: "0 4px 6px rgba(61, 74, 58, 0.1)",
      large: "0 10px 25px rgba(61, 74, 58, 0.15)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #89986D 0%, #9CAB84 50%, #C5D89D 100%)",
      pattern: "radial-gradient(circle at 80% 20%, rgba(197, 216, 157, 0.2) 0%, transparent 50%)",
    },
    content: {
      background: "#F6F0D7",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "0.75rem",
      shadow: "0 8px 30px rgba(61, 74, 58, 0.12)",
      overlay: "linear-gradient(to top, rgba(45, 58, 42, 0.2), transparent)",
    },
  },

  slideShape: {
    type: "rounded",
    borderRadius: "12px",
    shadow: "medium",
  },

  cardBox: {
    background: "#F6F0D7",
    borderColor: "#C5D89D",
    titleColor: "#2D3A2A",
    bodyColor: "#3D4A3A",
    accentColor: "#89986D",
    shadow: "0 2px 8px rgba(61, 74, 58, 0.08)",
    hoverBackground: "#EDE7C7",
    hoverBorderColor: "#9CAB84",
  },

  layoutElements: {
    background: "#FFFFFF",
    borderColor: "#C5D89D",
    hoverBackground: "#F9F5E8",
  },

  gradients: {
    primary: "linear-gradient(135deg, #89986D 0%, #9CAB84 50%, #C5D89D 100%)",
    secondary: "linear-gradient(135deg, #F6F0D7 0%, #EDE7C7 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(45, 58, 42, 0.3) 100%)",
    text: "linear-gradient(135deg, #2D3A2A 0%, #89986D 100%)",
  },

  preview: {
    titleBg: "#89986D",
    bodyBg: "#F6F0D7",
    textColor: "#3D4A3A",
    accentColor: "#89986D",
  },

  pageBackground: "#F6F0D7",
};

export default sageOliveTheme;
