/**
 * Spring Blossom Theme
 * A playful theme with lime green, lavender purple, and soft cream tones
 */

import type { Theme } from "./types";

const THEME_ID = "spring-blossom";

export const springBlossomTheme: Theme = {
  id: THEME_ID,
  name: "Spring Blossom",
  description: "Playful theme with lime green, lavender purple, and soft cream",
  category: "creative",

  colors: {
    background: "#FFFEEC",
    backgroundAlt: "#f5f4e0",
    surface: "#ffffff",
    surfaceHover: "#fdfcf2",

    text: "#3d3a2e",
    textMuted: "#6b6758",
    textInverse: "#ffffff",
    heading: "#A88AED",

    primary: "#A88AED",
    primaryHover: "#9678d9",
    secondary: "#CBD83B",
    secondaryHover: "#b8c435",
    accent: "#CBD83B",

    border: "#e5e3d0",
    borderStrong: "#A88AED",
    borderHover: "#9678d9",

    shadow: "rgba(168, 138, 237, 0.15)",
    overlay: "rgba(61, 58, 46, 0.6)",
    glow: "rgba(203, 216, 59, 0.3)",

    link: "#A88AED",
    linkHover: "#9678d9",

    success: "#CBD83B",
    warning: "#e8c547",
    error: "#e85a5a",
  },

  fonts: {
    heading: {
      family: "'Quicksand', sans-serif",
      weight: 700,
      letterSpacing: "0em",
    },
    body: {
      family: "'Inter', var(--font-geist-sans), sans-serif",
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
      "https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap",
    ],
  },

  design: {
    borderRadius: {
      small: "0.5rem",
      medium: "1rem",
      large: "1.5rem",
      full: "9999px",
    },
    shadows: {
      small: "0 2px 4px rgba(168, 138, 237, 0.08)",
      medium: "0 4px 12px rgba(168, 138, 237, 0.12)",
      large: "0 8px 24px rgba(168, 138, 237, 0.18)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #FFFEEC 0%, #f5f4e0 100%)",
      pattern: "radial-gradient(circle at 80% 20%, rgba(203, 216, 59, 0.1) 0%, transparent 50%)",
    },
    content: {
      background: "#ffffff",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "1rem",
      shadow: "0 8px 24px rgba(168, 138, 237, 0.18)",
      overlay: "linear-gradient(to top, rgba(61, 58, 46, 0.4), transparent)",
    },
  },

  slideShape: {
    type: "rounded",
    borderRadius: "16px",
    shadow: "medium",
  },

  cardBox: {
    background: "#ffffff",
    borderColor: "#e5e3d0",
    titleColor: "#A88AED",
    bodyColor: "#3d3a2e",
    accentColor: "#CBD83B",
    shadow: "0 4px 12px rgba(168, 138, 237, 0.1)",
    hoverBackground: "#fdfcf2",
    hoverBorderColor: "#A88AED",
  },

  layoutElements: {
    background: "#ffffff",
    borderColor: "#e5e3d0",
    hoverBackground: "#fdfcf2",
  },

  gradients: {
    primary: "linear-gradient(135deg, #A88AED 0%, #CBD83B 100%)",
    secondary: "linear-gradient(135deg, #FFFEEC 0%, #f5f4e0 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(61, 58, 46, 0.5) 100%)",
    text: "linear-gradient(135deg, #A88AED 0%, #CBD83B 100%)",
  },

  preview: {
    titleBg: "#FFFEEC",
    bodyBg: "#ffffff",
    textColor: "#3d3a2e",
    accentColor: "#A88AED",
  },

  backgroundImage: "https://res.cloudinary.com/di76ibrro/image/upload/v1767956806/Generated_Image_January_09_2026_-_3_06AM_ot8jws.jpg",
  previewBackgroundImage: "https://res.cloudinary.com/di76ibrro/image/upload/v1767956806/Generated_Image_January_09_2026_-_3_06AM_ot8jws.jpg",
  backgroundPosition: "center",
  backgroundSize: "cover",
  overlay: "rgba(255, 254, 236, 0.75)",
  pageBackground: undefined,
};

export default springBlossomTheme;
