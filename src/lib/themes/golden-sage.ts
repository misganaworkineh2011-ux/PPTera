/**
 * Golden Sage Theme
 * Warm golden yellows with sage green accents
 */

import type { Theme } from "./types";

export const goldenSageTheme: Theme = {
  id: "golden-sage",
  name: "Golden Sage",
  description: "Warm golden yellows with sage green accents",
  category: "light",

  colors: {
    background: "#FFFBEB",
    backgroundAlt: "#FFF5D6",
    surface: "#FFFFFF",
    surfaceHover: "#FFFDF5",
    text: "#4A4528",
    textMuted: "#7A7550",
    textInverse: "#FFFFFF",
    heading: "#3A3520",
    primary: "#D4A84B",
    primaryHover: "#C49A40",
    secondary: "#8B9A6B",
    secondaryHover: "#7A8A5A",
    accent: "#E8D5A0",
    border: "#E8D5A0",
    borderStrong: "#D4A84B",
    borderHover: "#8B9A6B",
    shadow: "rgba(74, 69, 40, 0.1)",
    overlay: "rgba(58, 53, 32, 0.5)",
    glow: "rgba(212, 168, 75, 0.3)",
    link: "#D4A84B",
    linkHover: "#C49A40",
    success: "#8B9A6B",
    warning: "#D4A84B",
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
      small: "0.375rem",
      medium: "0.75rem",
      large: "1rem",
      full: "9999px",
    },
    shadows: {
      small: "0 1px 3px rgba(74, 69, 40, 0.08)",
      medium: "0 4px 6px rgba(74, 69, 40, 0.1)",
      large: "0 10px 25px rgba(74, 69, 40, 0.15)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #D4A84B 0%, #8B9A6B 100%)",
      pattern: "radial-gradient(circle at 80% 20%, rgba(232, 213, 160, 0.3) 0%, transparent 50%)",
    },
    content: {
      background: "#FFFBEB",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "0.75rem",
      shadow: "0 8px 30px rgba(74, 69, 40, 0.12)",
      overlay: "linear-gradient(to top, rgba(58, 53, 32, 0.2), transparent)",
    },
  },

  slideShape: {
    type: "rounded",
    borderRadius: "12px",
    shadow: "medium",
  },

  cardBox: {
    background: "#FFFBEB",
    borderColor: "#E8D5A0",
    titleColor: "#3A3520",
    bodyColor: "#4A4528",
    accentColor: "#D4A84B",
    shadow: "0 2px 8px rgba(74, 69, 40, 0.08)",
    hoverBackground: "#FFF5D6",
    hoverBorderColor: "#D4A84B",
  },

  layoutElements: {
    background: "#FFFFFF",
    borderColor: "#E8D5A0",
    hoverBackground: "#FFFDF5",
  },

  gradients: {
    primary: "linear-gradient(135deg, #D4A84B 0%, #8B9A6B 100%)",
    secondary: "linear-gradient(135deg, #FFFBEB 0%, #FFF5D6 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(58, 53, 32, 0.3) 100%)",
    text: "linear-gradient(135deg, #D4A84B 0%, #8B9A6B 100%)",
  },

  preview: {
    titleBg: "#D4A84B",
    bodyBg: "#FFFBEB",
    textColor: "#4A4528",
    accentColor: "#D4A84B",
  },

  pageBackground: "#FFFBEB",
};

export default goldenSageTheme;
