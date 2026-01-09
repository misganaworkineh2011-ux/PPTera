/**
 * Cozy Cottage Theme
 * A warm earthy theme with copper orange, soft gray, and olive green with cozy house background
 */

import type { Theme } from "./types";

const THEME_ID = "cozy-cottage";

export const cozyCottageTheme: Theme = {
  id: THEME_ID,
  name: "Cozy Cottage",
  description: "Warm earthy theme with copper orange, soft gray, and olive green accents",
  category: "creative",

  colors: {
    background: "#E8E7E3",
    backgroundAlt: "#dddcd8",
    surface: "#ffffff",
    surfaceHover: "#f9f9f8",

    text: "#3d3d2d",
    textMuted: "#5a5a48",
    textInverse: "#ffffff",
    heading: "#525333",

    primary: "#CF8852",
    primaryHover: "#c07842",
    secondary: "#525333",
    secondaryHover: "#454628",
    accent: "#CF8852",

    border: "#d0cfc9",
    borderStrong: "#525333",
    borderHover: "#454628",

    shadow: "rgba(82, 83, 51, 0.12)",
    overlay: "rgba(82, 83, 51, 0.6)",
    glow: "rgba(207, 136, 82, 0.3)",

    link: "#CF8852",
    linkHover: "#c07842",

    success: "#525333",
    warning: "#CF8852",
    error: "#c45a5a",
  },

  fonts: {
    heading: {
      family: "'Libre Baskerville', serif",
      weight: 700,
      letterSpacing: "-0.01em",
    },
    body: {
      family: "'Source Sans 3', sans-serif",
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
      "https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Source+Sans+3:wght@400;500;600&display=swap",
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
      small: "0 2px 4px rgba(82, 83, 51, 0.08)",
      medium: "0 4px 12px rgba(82, 83, 51, 0.12)",
      large: "0 8px 24px rgba(82, 83, 51, 0.16)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #E8E7E3 0%, #dddcd8 100%)",
      pattern:
        "radial-gradient(circle at 80% 20%, rgba(207, 136, 82, 0.08) 0%, transparent 50%)",
    },
    content: {
      background: "#ffffff",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "0.75rem",
      shadow: "0 8px 24px rgba(82, 83, 51, 0.16)",
      overlay: "linear-gradient(to top, rgba(82, 83, 51, 0.4), transparent)",
    },
  },

  slideShape: {
    type: "soft",
    borderRadius: "20px",
    shadow: "subtle",
  },

  cardBox: {
    background: "#ffffff",
    borderColor: "#d0cfc9",
    titleColor: "#525333",
    bodyColor: "#3d3d2d",
    accentColor: "#CF8852",
    shadow: "0 4px 12px rgba(82, 83, 51, 0.08)",
    hoverBackground: "#f9f9f8",
    hoverBorderColor: "#525333",
  },

  layoutElements: {
    background: "#ffffff",
    borderColor: "#d0cfc9",
    hoverBackground: "#f9f9f8",
  },

  gradients: {
    primary: "linear-gradient(135deg, #CF8852 0%, #525333 100%)",
    secondary: "linear-gradient(135deg, #E8E7E3 0%, #dddcd8 100%)",
    overlay:
      "linear-gradient(to bottom, transparent 0%, rgba(82, 83, 51, 0.5) 100%)",
    text: "linear-gradient(135deg, #525333 0%, #CF8852 100%)",
  },

  preview: {
    titleBg: "#E8E7E3",
    bodyBg: "#ffffff",
    textColor: "#3d3d2d",
    accentColor: "#CF8852",
  },

  backgroundImage:
    "https://res.cloudinary.com/di76ibrro/image/upload/v1767950013/Generated_Image_January_09_2026_-_1_13AM_ijepzw.jpg",
  previewBackgroundImage:
    "https://res.cloudinary.com/di76ibrro/image/upload/v1767950013/Generated_Image_January_09_2026_-_1_13AM_ijepzw.jpg",
  backgroundPosition: "center",
  backgroundSize: "cover",
  overlay: "rgba(232, 231, 227, 0.75)",
  pageBackground: undefined,
};

export default cozyCottageTheme;
