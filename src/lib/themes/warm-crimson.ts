/**
 * Warm Crimson Theme
 * Rich crimson reds with warm undertones
 */

import type { Theme } from "./types";

export const warmCrimsonTheme: Theme = {
  id: "warm-crimson",
  name: "Warm Crimson",
  description: "Rich crimson reds with warm undertones",
  category: "bold",

  colors: {
    background: "#FFF5F5",
    backgroundAlt: "#FFE8E8",
    surface: "#FFFFFF",
    surfaceHover: "#FFF0F0",
    text: "#4A1A1A",
    textMuted: "#8B4545",
    textInverse: "#FFFFFF",
    heading: "#3A0F0F",
    primary: "#C41E3A",
    primaryHover: "#A8182F",
    secondary: "#E63946",
    secondaryHover: "#D32F3D",
    accent: "#FF6B6B",
    border: "#FF6B6B",
    borderStrong: "#E63946",
    borderHover: "#C41E3A",
    shadow: "rgba(74, 26, 26, 0.1)",
    overlay: "rgba(58, 15, 15, 0.5)",
    glow: "rgba(196, 30, 58, 0.3)",
    link: "#C41E3A",
    linkHover: "#A8182F",
    success: "#4CAF50",
    warning: "#E5BA41",
    error: "#C41E3A",
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
      small: "0 1px 3px rgba(74, 26, 26, 0.08)",
      medium: "0 4px 6px rgba(74, 26, 26, 0.1)",
      large: "0 10px 25px rgba(74, 26, 26, 0.15)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #C41E3A 0%, #E63946 50%, #FF6B6B 100%)",
      pattern: "radial-gradient(circle at 80% 20%, rgba(255, 107, 107, 0.2) 0%, transparent 50%)",
    },
    content: {
      background: "#FFF5F5",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "0.5rem",
      shadow: "0 8px 30px rgba(74, 26, 26, 0.12)",
      overlay: "linear-gradient(to top, rgba(58, 15, 15, 0.2), transparent)",
    },
  },

  slideShape: {
    type: "rounded",
    borderRadius: "8px",
    shadow: "medium",
  },

  cardBox: {
    background: "#FFF5F5",
    borderColor: "#FF6B6B",
    titleColor: "#3A0F0F",
    bodyColor: "#4A1A1A",
    accentColor: "#C41E3A",
    shadow: "0 2px 8px rgba(74, 26, 26, 0.08)",
    hoverBackground: "#FFE8E8",
    hoverBorderColor: "#E63946",
  },

  layoutElements: {
    background: "#FFFFFF",
    borderColor: "#FF6B6B",
    hoverBackground: "#FFF0F0",
  },

  gradients: {
    primary: "linear-gradient(135deg, #C41E3A 0%, #E63946 50%, #FF6B6B 100%)",
    secondary: "linear-gradient(135deg, #FFF5F5 0%, #FFE8E8 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(58, 15, 15, 0.3) 100%)",
    text: "linear-gradient(135deg, #3A0F0F 0%, #C41E3A 100%)",
  },

  preview: {
    titleBg: "#C41E3A",
    bodyBg: "#FFF5F5",
    textColor: "#4A1A1A",
    accentColor: "#C41E3A",
  },

  pageBackground: "#FFF5F5",
};

export default warmCrimsonTheme;
