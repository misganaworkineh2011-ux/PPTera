/**
 * Earth Forest Theme
 * Rich earthy browns with forest green accents
 */

import type { Theme } from "./types";

export const earthForestTheme: Theme = {
  id: "earth-forest",
  name: "Earth Forest",
  description: "Rich earthy browns with forest green accents",
  category: "professional",

  colors: {
    background: "#F5F0E8",
    backgroundAlt: "#EBE5DA",
    surface: "#FFFFFF",
    surfaceHover: "#FAF7F2",
    text: "#3D3225",
    textMuted: "#6B5D4D",
    textInverse: "#FFFFFF",
    heading: "#2A2318",
    primary: "#5D4E37",
    primaryHover: "#4A3E2C",
    secondary: "#4A7C59",
    secondaryHover: "#3D6A4A",
    accent: "#8FBC8F",
    border: "#C4B8A5",
    borderStrong: "#A89B88",
    borderHover: "#5D4E37",
    shadow: "rgba(61, 50, 37, 0.1)",
    overlay: "rgba(42, 35, 24, 0.5)",
    glow: "rgba(93, 78, 55, 0.3)",
    link: "#4A7C59",
    linkHover: "#3D6A4A",
    success: "#4A7C59",
    warning: "#D4A574",
    error: "#C45C4A",
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
      small: "0 1px 3px rgba(61, 50, 37, 0.08)",
      medium: "0 4px 6px rgba(61, 50, 37, 0.1)",
      large: "0 10px 25px rgba(61, 50, 37, 0.15)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #5D4E37 0%, #4A7C59 100%)",
      pattern: "radial-gradient(circle at 80% 20%, rgba(143, 188, 143, 0.2) 0%, transparent 50%)",
    },
    content: {
      background: "#F5F0E8",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "0.5rem",
      shadow: "0 8px 30px rgba(61, 50, 37, 0.12)",
      overlay: "linear-gradient(to top, rgba(42, 35, 24, 0.2), transparent)",
    },
  },

  slideShape: {
    type: "rounded",
    borderRadius: "8px",
    shadow: "medium",
  },

  cardBox: {
    background: "#F5F0E8",
    borderColor: "#C4B8A5",
    titleColor: "#2A2318",
    bodyColor: "#3D3225",
    accentColor: "#5D4E37",
    shadow: "0 2px 8px rgba(61, 50, 37, 0.08)",
    hoverBackground: "#EBE5DA",
    hoverBorderColor: "#A89B88",
  },

  layoutElements: {
    background: "#FFFFFF",
    borderColor: "#C4B8A5",
    hoverBackground: "#FAF7F2",
  },

  gradients: {
    primary: "linear-gradient(135deg, #5D4E37 0%, #4A7C59 100%)",
    secondary: "linear-gradient(135deg, #F5F0E8 0%, #EBE5DA 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(42, 35, 24, 0.3) 100%)",
    text: "linear-gradient(135deg, #2A2318 0%, #4A7C59 100%)",
  },

  preview: {
    titleBg: "#5D4E37",
    bodyBg: "#F5F0E8",
    textColor: "#3D3225",
    accentColor: "#5D4E37",
  },

  pageBackground: "#F5F0E8",
};

export default earthForestTheme;
