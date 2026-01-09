/**
 * Urban Building Theme
 * A modern architectural theme with deep navy, soft blue, and warm cream with building background
 */

import type { Theme } from "./types";

const THEME_ID = "urban-building";

export const urbanBuildingTheme: Theme = {
  id: THEME_ID,
  name: "Urban Building",
  description: "Modern architectural theme with deep navy, soft blue, and warm cream accents",
  category: "creative",

  colors: {
    background: "#D0E6FD",
    backgroundAlt: "#c0d9f5",
    surface: "#ffffff",
    surfaceHover: "#f5f9fe",

    text: "#162660",
    textMuted: "#3a4a7a",
    textInverse: "#ffffff",
    heading: "#162660",

    primary: "#162660",
    primaryHover: "#0f1a45",
    secondary: "#F1E4D1",
    secondaryHover: "#e8d8c0",
    accent: "#162660",

    border: "#b5d4f5",
    borderStrong: "#162660",
    borderHover: "#0f1a45",

    shadow: "rgba(22, 38, 96, 0.12)",
    overlay: "rgba(22, 38, 96, 0.6)",
    glow: "rgba(208, 230, 253, 0.3)",

    link: "#162660",
    linkHover: "#0f1a45",

    success: "#4a7c59",
    warning: "#d4a03c",
    error: "#c45a5a",
  },

  fonts: {
    heading: {
      family: "'Montserrat', sans-serif",
      weight: 700,
      letterSpacing: "-0.02em",
    },
    body: {
      family: "'Open Sans', sans-serif",
      weight: 400,
      lineHeight: "1.7",
    },
    caption: {
      family: "'Inter', var(--font-geist-sans), sans-serif",
      weight: 500,
      size: "0.875rem",
    },
    mono: {
      family: "'JetBrains Mono', monospace",
    },
    googleFontsUrls: [
      "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Open+Sans:wght@400;500;600&display=swap",
    ],
  },

  design: {
    borderRadius: {
      small: "0.375rem",
      medium: "0.75rem",
      large: "1.25rem",
      full: "9999px",
    },
    shadows: {
      small: "0 2px 4px rgba(22, 38, 96, 0.08)",
      medium: "0 4px 12px rgba(22, 38, 96, 0.12)",
      large: "0 8px 24px rgba(22, 38, 96, 0.16)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #D0E6FD 0%, #c0d9f5 100%)",
      pattern:
        "radial-gradient(circle at 80% 20%, rgba(22, 38, 96, 0.05) 0%, transparent 50%)",
    },
    content: {
      background: "#ffffff",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "0.75rem",
      shadow: "0 8px 24px rgba(22, 38, 96, 0.16)",
      overlay: "linear-gradient(to top, rgba(22, 38, 96, 0.4), transparent)",
    },
  },

  slideShape: {
    type: "sharp",
    borderRadius: "0px",
    shadow: "deep",
  },

  cardBox: {
    background: "#ffffff",
    borderColor: "#b5d4f5",
    titleColor: "#162660",
    bodyColor: "#162660",
    accentColor: "#F1E4D1",
    shadow: "0 4px 12px rgba(22, 38, 96, 0.08)",
    hoverBackground: "#f5f9fe",
    hoverBorderColor: "#162660",
  },

  layoutElements: {
    background: "#ffffff",
    borderColor: "#b5d4f5",
    hoverBackground: "#f5f9fe",
  },

  gradients: {
    primary: "linear-gradient(135deg, #162660 0%, #D0E6FD 100%)",
    secondary: "linear-gradient(135deg, #D0E6FD 0%, #c0d9f5 100%)",
    overlay:
      "linear-gradient(to bottom, transparent 0%, rgba(22, 38, 96, 0.5) 100%)",
    text: "linear-gradient(135deg, #162660 0%, #3a4a7a 100%)",
  },

  preview: {
    titleBg: "#D0E6FD",
    bodyBg: "#ffffff",
    textColor: "#162660",
    accentColor: "#162660",
  },

  backgroundImage:
    "https://res.cloudinary.com/di76ibrro/image/upload/v1767950293/Generated_Image_January_09_2026_-_1_17AM_tmrjkj.jpg",
  previewBackgroundImage:
    "https://res.cloudinary.com/di76ibrro/image/upload/v1767950293/Generated_Image_January_09_2026_-_1_17AM_tmrjkj.jpg",
  backgroundPosition: "center",
  backgroundSize: "cover",
  overlay: "rgba(208, 230, 253, 0.75)",
  pageBackground: undefined,
};

export default urbanBuildingTheme;
