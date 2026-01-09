/**
 * Industrial Steel Theme
 * A bold industrial theme with slate gray, light silver, and burnt orange with steel background
 */

import type { Theme } from "./types";

const THEME_ID = "industrial-steel";

export const industrialSteelTheme: Theme = {
  id: THEME_ID,
  name: "Industrial Steel",
  description: "Bold industrial theme with slate gray, light silver, and burnt orange accents",
  category: "creative",

  colors: {
    background: "#D1D3CE",
    backgroundAlt: "#c5c7c2",
    surface: "#ffffff",
    surfaceHover: "#f5f5f3",

    text: "#626675",
    textMuted: "#7a7e8a",
    textInverse: "#ffffff",
    heading: "#BB4500",

    primary: "#BB4500",
    primaryHover: "#a03c00",
    secondary: "#626675",
    secondaryHover: "#525565",
    accent: "#BB4500",

    border: "#b8bab5",
    borderStrong: "#BB4500",
    borderHover: "#a03c00",

    shadow: "rgba(187, 69, 0, 0.15)",
    overlay: "rgba(98, 102, 117, 0.6)",
    glow: "rgba(187, 69, 0, 0.3)",

    link: "#BB4500",
    linkHover: "#a03c00",

    success: "#5a8a6a",
    warning: "#BB4500",
    error: "#c45a5a",
  },

  fonts: {
    heading: {
      family: "'Oswald', sans-serif",
      weight: 600,
      letterSpacing: "0.02em",
    },
    body: {
      family: "'Roboto', sans-serif",
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
      "https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Roboto:wght@400;500;700&display=swap",
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
      small: "0 2px 4px rgba(187, 69, 0, 0.1)",
      medium: "0 4px 12px rgba(187, 69, 0, 0.15)",
      large: "0 8px 24px rgba(187, 69, 0, 0.2)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #D1D3CE 0%, #c5c7c2 100%)",
      pattern:
        "radial-gradient(circle at 80% 20%, rgba(187, 69, 0, 0.08) 0%, transparent 50%)",
    },
    content: {
      background: "#ffffff",
      bulletStyle: "square",
    },
    image: {
      borderRadius: "0.5rem",
      shadow: "0 8px 24px rgba(187, 69, 0, 0.2)",
      overlay: "linear-gradient(to top, rgba(98, 102, 117, 0.4), transparent)",
    },
  },

  slideShape: {
    type: "sharp",
    borderRadius: "2px",
    shadow: "deep",
    border: {
      width: "3px",
      color: "#BB4500",
      style: "solid",
    },
  },

  cardBox: {
    background: "#ffffff",
    borderColor: "#b8bab5",
    titleColor: "#BB4500",
    bodyColor: "#626675",
    accentColor: "#BB4500",
    shadow: "0 4px 12px rgba(187, 69, 0, 0.1)",
    hoverBackground: "#f5f5f3",
    hoverBorderColor: "#BB4500",
  },

  layoutElements: {
    background: "#ffffff",
    borderColor: "#b8bab5",
    hoverBackground: "#f5f5f3",
  },

  gradients: {
    primary: "linear-gradient(135deg, #BB4500 0%, #626675 100%)",
    secondary: "linear-gradient(135deg, #D1D3CE 0%, #c5c7c2 100%)",
    overlay:
      "linear-gradient(to bottom, transparent 0%, rgba(98, 102, 117, 0.5) 100%)",
    text: "linear-gradient(135deg, #BB4500 0%, #626675 100%)",
  },

  preview: {
    titleBg: "#D1D3CE",
    bodyBg: "#ffffff",
    textColor: "#626675",
    accentColor: "#BB4500",
  },

  backgroundImage:
    "https://res.cloudinary.com/di76ibrro/image/upload/v1767953066/Generated_Image_January_09_2026_-_2_03AM_doqjrx.jpg",
  previewBackgroundImage:
    "https://res.cloudinary.com/di76ibrro/image/upload/v1767953066/Generated_Image_January_09_2026_-_2_03AM_doqjrx.jpg",
  backgroundPosition: "center",
  backgroundSize: "cover",
  overlay: "rgba(209, 211, 206, 0.75)",
  pageBackground: undefined,
};

export default industrialSteelTheme;
