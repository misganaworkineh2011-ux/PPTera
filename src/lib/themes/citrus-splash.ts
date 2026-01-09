/**
 * Citrus Splash Theme
 * A vibrant energetic theme with bright orange, light gray, and deep teal with citrus background
 */

import type { Theme } from "./types";

const THEME_ID = "citrus-splash";

export const citrusSplashTheme: Theme = {
  id: THEME_ID,
  name: "Citrus Splash",
  description: "Vibrant energetic theme with bright orange, light gray, and deep teal accents",
  category: "creative",

  colors: {
    background: "#EFEFEF",
    backgroundAlt: "#e5e5e5",
    surface: "#ffffff",
    surfaceHover: "#f8f8f8",

    text: "#315762",
    textMuted: "#4a6d78",
    textInverse: "#ffffff",
    heading: "#E9631A",

    primary: "#E9631A",
    primaryHover: "#d05515",
    secondary: "#315762",
    secondaryHover: "#264650",
    accent: "#E9631A",

    border: "#d5d5d5",
    borderStrong: "#E9631A",
    borderHover: "#d05515",

    shadow: "rgba(233, 99, 26, 0.15)",
    overlay: "rgba(49, 87, 98, 0.6)",
    glow: "rgba(233, 99, 26, 0.3)",

    link: "#315762",
    linkHover: "#264650",

    success: "#4a8a6a",
    warning: "#E9631A",
    error: "#c45a5a",
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
      small: "0 2px 4px rgba(233, 99, 26, 0.1)",
      medium: "0 4px 12px rgba(233, 99, 26, 0.15)",
      large: "0 8px 24px rgba(233, 99, 26, 0.2)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #EFEFEF 0%, #e5e5e5 100%)",
      pattern:
        "radial-gradient(circle at 80% 20%, rgba(233, 99, 26, 0.08) 0%, transparent 50%)",
    },
    content: {
      background: "#ffffff",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "0.75rem",
      shadow: "0 8px 24px rgba(233, 99, 26, 0.2)",
      overlay: "linear-gradient(to top, rgba(49, 87, 98, 0.4), transparent)",
    },
  },

  slideShape: {
    type: "sharp",
    borderRadius: "4px",
    shadow: "solid",
    solidShadowColor: "#E9631A",
  },

  cardBox: {
    background: "#ffffff",
    borderColor: "#d5d5d5",
    titleColor: "#E9631A",
    bodyColor: "#315762",
    accentColor: "#E9631A",
    shadow: "0 4px 12px rgba(233, 99, 26, 0.1)",
    hoverBackground: "#f8f8f8",
    hoverBorderColor: "#E9631A",
  },

  layoutElements: {
    background: "#ffffff",
    borderColor: "#d5d5d5",
    hoverBackground: "#f8f8f8",
  },

  gradients: {
    primary: "linear-gradient(135deg, #E9631A 0%, #315762 100%)",
    secondary: "linear-gradient(135deg, #EFEFEF 0%, #e5e5e5 100%)",
    overlay:
      "linear-gradient(to bottom, transparent 0%, rgba(49, 87, 98, 0.5) 100%)",
    text: "linear-gradient(135deg, #E9631A 0%, #315762 100%)",
  },

  preview: {
    titleBg: "#EFEFEF",
    bodyBg: "#ffffff",
    textColor: "#315762",
    accentColor: "#E9631A",
  },

  backgroundImage:
    "https://res.cloudinary.com/di76ibrro/image/upload/v1767952255/Generated_Image_January_09_2026_-_1_49AM_fkzpwi.jpg",
  previewBackgroundImage:
    "https://res.cloudinary.com/di76ibrro/image/upload/v1767952255/Generated_Image_January_09_2026_-_1_49AM_fkzpwi.jpg",
  backgroundPosition: "center",
  backgroundSize: "cover",
  overlay: "rgba(239, 239, 239, 0.75)",
  pageBackground: undefined,
};

export default citrusSplashTheme;
