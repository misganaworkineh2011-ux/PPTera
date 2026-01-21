/**
 * Sunset Coast Theme
 * A warm coastal theme with vibrant orange, charcoal, and ocean blue with sunset background
 */

import type { Theme } from "./types";

const THEME_ID = "sunset-coast";

export const sunsetCoastTheme: Theme = {
  id: THEME_ID,
  name: "Onyx & Ember",
  description: "Warm coastal theme with vibrant orange, charcoal, and ocean blue accents",
  category: "creative",

  colors: {
    background: "#282B2B",
    backgroundAlt: "#1f2222",
    surface: "#363a3a",
    surfaceHover: "#404545",

    text: "#f5f5f5",
    textMuted: "#b0b5b5",
    textInverse: "#282B2B",
    heading: "#EE6C29",

    primary: "#EE6C29",
    primaryHover: "#d55d1f",
    secondary: "#7AA6B3",
    secondaryHover: "#6a96a3",
    accent: "#7AA6B3",

    border: "#404545",
    borderStrong: "#EE6C29",
    borderHover: "#d55d1f",

    shadow: "rgba(238, 108, 41, 0.15)",
    overlay: "rgba(40, 43, 43, 0.8)",
    glow: "rgba(238, 108, 41, 0.3)",

    link: "#7AA6B3",
    linkHover: "#8ab6c3",

    success: "#7AA6B3",
    warning: "#EE6C29",
    error: "#e05555",
  },

  fonts: {
    heading: {
      family: "'Poppins', sans-serif",
      weight: 700,
      letterSpacing: "-0.02em",
    },
    body: {
      family: "'Inter', sans-serif",
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
      "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap",
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
      small: "0 2px 4px rgba(238, 108, 41, 0.1)",
      medium: "0 4px 12px rgba(238, 108, 41, 0.15)",
      large: "0 8px 24px rgba(238, 108, 41, 0.2)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #282B2B 0%, #1f2222 100%)",
      pattern:
        "radial-gradient(circle at 80% 20%, rgba(238, 108, 41, 0.1) 0%, transparent 50%)",
    },
    content: {
      background: "#363a3a",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "0.75rem",
      shadow: "0 8px 24px rgba(238, 108, 41, 0.2)",
      overlay: "linear-gradient(to top, rgba(40, 43, 43, 0.6), transparent)",
    },
  },

  slideShape: {
    type: "rounded",
    borderRadius: "12px",
    shadow: "solid",
    solidShadowColor: "#EE6C29",
  },

  cardBox: {
    background: "#363a3a",
    borderColor: "#505555",
    titleColor: "#EE6C29",
    bodyColor: "#f5f5f5",
    accentColor: "#7AA6B3",
    shadow: "0 4px 12px rgba(238, 108, 41, 0.1)",
    hoverBackground: "#404545",
    hoverBorderColor: "#EE6C29",
  },

  layoutElements: {
    background: "#363a3a",
    borderColor: "#505555",
    hoverBackground: "#404545",
  },

  gradients: {
    primary: "linear-gradient(135deg, #EE6C29 0%, #7AA6B3 100%)",
    secondary: "linear-gradient(135deg, #282B2B 0%, #1f2222 100%)",
    overlay:
      "linear-gradient(to bottom, transparent 0%, rgba(40, 43, 43, 0.7) 100%)",
    text: "linear-gradient(135deg, #EE6C29 0%, #7AA6B3 100%)",
  },

  preview: {
    titleBg: "#282B2B",
    bodyBg: "#363a3a",
    textColor: "#f5f5f5",
    accentColor: "#EE6C29",
  },

  backgroundImage:
    "https://res.cloudinary.com/di76ibrro/image/upload/v1767950527/Generated_Image_January_08_2026_-_1_27PM_uc00en.jpg",
  previewBackgroundImage:
    "https://res.cloudinary.com/di76ibrro/image/upload/v1767950527/Generated_Image_January_08_2026_-_1_27PM_uc00en.jpg",
  backgroundPosition: "center",
  backgroundSize: "cover",
  overlay: "rgba(40, 43, 43, 0.7)",
  pageBackground: undefined,
};

export default sunsetCoastTheme;
