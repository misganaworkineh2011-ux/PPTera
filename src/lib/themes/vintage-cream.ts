/**
 * Vintage Cream Theme
 * A cozy theme with sage gray, dark espresso, and soft butter cream tones
 */

import type { Theme } from "./types";

const THEME_ID = "vintage-cream";

export const vintageCreamTheme: Theme = {
  id: THEME_ID,
  name: "Vintage Cream",
  description: "Cozy theme with sage gray, dark espresso, and soft butter cream",
  category: "creative",

  colors: {
    background: "#FFEFB5",
    backgroundAlt: "#f5e5a5",
    surface: "#ffffff",
    surfaceHover: "#fffdf5",

    text: "#472D1F",
    textMuted: "#6a5040",
    textInverse: "#ffffff",
    heading: "#472D1F",

    primary: "#472D1F",
    primaryHover: "#3a2518",
    secondary: "#BEB9A9",
    secondaryHover: "#aea99a",
    accent: "#BEB9A9",

    border: "#d5d0c0",
    borderStrong: "#472D1F",
    borderHover: "#3a2518",

    shadow: "rgba(71, 45, 31, 0.12)",
    overlay: "rgba(71, 45, 31, 0.6)",
    glow: "rgba(190, 185, 169, 0.3)",

    link: "#472D1F",
    linkHover: "#3a2518",

    success: "#5cb85c",
    warning: "#FFEFB5",
    error: "#d9534f",
  },

  fonts: {
    heading: {
      family: "'Lora', serif",
      weight: 600,
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
      "https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap",
    ],
  },

  design: {
    borderRadius: {
      small: "0.25rem",
      medium: "0.5rem",
      large: "1rem",
      full: "9999px",
    },
    shadows: {
      small: "0 2px 4px rgba(71, 45, 31, 0.08)",
      medium: "0 4px 12px rgba(71, 45, 31, 0.12)",
      large: "0 8px 24px rgba(71, 45, 31, 0.16)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #FFEFB5 0%, #f5e5a5 100%)",
      pattern: "radial-gradient(circle at 80% 20%, rgba(190, 185, 169, 0.15) 0%, transparent 50%)",
    },
    content: {
      background: "#ffffff",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "0.5rem",
      shadow: "0 8px 24px rgba(71, 45, 31, 0.16)",
      overlay: "linear-gradient(to top, rgba(71, 45, 31, 0.4), transparent)",
    },
  },

  slideShape: {
    type: "rounded",
    borderRadius: "8px",
    shadow: "medium",
  },

  cardBox: {
    background: "#ffffff",
    borderColor: "#d5d0c0",
    titleColor: "#472D1F",
    bodyColor: "#472D1F",
    accentColor: "#BEB9A9",
    shadow: "0 4px 12px rgba(71, 45, 31, 0.1)",
    hoverBackground: "#fffdf5",
    hoverBorderColor: "#472D1F",
  },

  layoutElements: {
    background: "#ffffff",
    borderColor: "#d5d0c0",
    hoverBackground: "#fffdf5",
  },

  gradients: {
    primary: "linear-gradient(135deg, #472D1F 0%, #BEB9A9 100%)",
    secondary: "linear-gradient(135deg, #FFEFB5 0%, #f5e5a5 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(71, 45, 31, 0.5) 100%)",
    text: "linear-gradient(135deg, #472D1F 0%, #6a5040 100%)",
  },

  preview: {
    titleBg: "#FFEFB5",
    bodyBg: "#ffffff",
    textColor: "#472D1F",
    accentColor: "#BEB9A9",
  },

  backgroundImage: "https://res.cloudinary.com/di76ibrro/image/upload/v1767959249/Generated_Image_January_09_2026_-_3_46AM_qftwbw.jpg",
  previewBackgroundImage: "https://res.cloudinary.com/di76ibrro/image/upload/v1767959249/Generated_Image_January_09_2026_-_3_46AM_qftwbw.jpg",
  backgroundPosition: "center",
  backgroundSize: "cover",
  overlay: "rgba(255, 239, 181, 0.72)",
  pageBackground: undefined,
};

export default vintageCreamTheme;
