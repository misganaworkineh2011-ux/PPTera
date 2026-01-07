/**
 * Paper Craft Theme
 * Warm beige/cream theme with black solid shadow for a handcrafted paper look
 */

import type { Theme } from "./types";

const THEME_ID = "paper-craft";

export const paperCraftTheme: Theme = {
  id: THEME_ID,
  name: "Paper Craft",
  description: "Warm beige theme with black solid shadow for a handcrafted look",
  category: "creative",

  colors: {
    background: "#f5ebe0",
    backgroundAlt: "#ede4d8",
    surface: "#faf6f0",
    surfaceHover: "#f5f0e8",

    text: "#2a2520",
    textMuted: "#5a5550",
    textInverse: "#faf6f0",
    heading: "#1a1510",

    primary: "#1a1510",
    primaryHover: "#2a2520",
    secondary: "#4a4540",
    secondaryHover: "#3a3530",
    accent: "#1a1510",

    border: "#d4ccc0",
    borderStrong: "#1a1510",
    borderHover: "#2a2520",

    shadow: "rgba(26, 21, 16, 0.15)",
    overlay: "rgba(26, 21, 16, 0.5)",
    glow: "rgba(26, 21, 16, 0.2)",

    link: "#1a1510",
    linkHover: "#4a4540",

    success: "#4a8a4a",
    warning: "#c4943c",
    error: "#c45a5a",
  },

  fonts: {
    heading: {
      family: "'Space Grotesk', sans-serif",
      weight: 700,
      letterSpacing: "-0.02em",
    },
    body: {
      family: "'Source Code Pro', monospace",
      weight: 400,
      lineHeight: "1.6",
    },
    caption: {
      family: "'Source Code Pro', monospace",
      weight: 500,
      size: "0.875rem",
    },
    mono: {
      family: "'Source Code Pro', monospace",
    },
    googleFontsUrls: [
      "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Source+Code+Pro:wght@400;500;600&display=swap",
    ],
  },

  design: {
    borderRadius: {
      small: "0.25rem",
      medium: "0.5rem",
      large: "0.75rem",
      full: "9999px",
    },
    shadows: {
      small: "4px 4px 0px 0px #1a1510",
      medium: "6px 6px 0px 0px #1a1510",
      large: "8px 8px 0px 0px #1a1510",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "#f5ebe0",
      pattern: "none",
    },
    content: {
      background: "#faf6f0",
      bulletStyle: "square",
    },
    image: {
      borderRadius: "0.5rem",
      shadow: "6px 6px 0px 0px #1a1510",
      overlay: "none",
    },
  },

  slideShape: {
    type: "rounded",
    borderRadius: "8px",
    shadow: "solid",
    solidShadowColor: "#1a1510",
    border: {
      width: "2px",
      color: "#1a1510",
      style: "solid",
    },
  },

  cardBox: {
    background: "#faf6f0",
    borderColor: "#1a1510",
    titleColor: "#1a1510",
    bodyColor: "#2a2520",
    accentColor: "#1a1510",
    shadow: "6px 6px 0px 0px #1a1510",
    hoverBackground: "#f5f0e8",
    hoverBorderColor: "#1a1510",
  },

  layoutElements: {
    background: "#faf6f0",
    borderColor: "#1a1510",
    hoverBackground: "#f5f0e8",
  },

  gradients: {
    primary: "linear-gradient(135deg, #1a1510 0%, #4a4540 100%)",
    secondary: "linear-gradient(135deg, #f5ebe0 0%, #ede4d8 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(26, 21, 16, 0.3) 100%)",
    text: "linear-gradient(135deg, #1a1510 0%, #4a4540 100%)",
  },

  preview: {
    titleBg: "#f5ebe0",
    bodyBg: "#faf6f0",
    textColor: "#2a2520",
    accentColor: "#1a1510",
  },

  backgroundImage: undefined,
  previewBackgroundImage: undefined,
  backgroundPosition: "center",
  backgroundSize: "cover",
  overlay: "rgba(245, 235, 224, 0.95)",
  pageBackground: "#f5ebe0",
};

export default paperCraftTheme;
