/**
 * Golden Horizon Theme
 * A warm vibrant theme with steel blue, burnt orange, and golden yellow with horizon background
 */

import type { Theme } from "./types";

const THEME_ID = "golden-horizon";

export const goldenHorizonTheme: Theme = {
  id: THEME_ID,
  name: "Golden Horizon",
  description: "Warm vibrant theme with steel blue, burnt orange, and golden yellow accents",
  category: "creative",

  colors: {
    background: "#f8f6f2",
    backgroundAlt: "#f0ede6",
    surface: "#ffffff",
    surfaceHover: "#faf9f7",

    text: "#2a2520",
    textMuted: "#5a5550",
    textInverse: "#ffffff",
    heading: "#D3622C",

    primary: "#D3622C",
    primaryHover: "#b85420",
    secondary: "#6D8EC5",
    secondaryHover: "#5a7bb2",
    accent: "#F0C845",

    border: "#e5e0d8",
    borderStrong: "#D3622C",
    borderHover: "#b85420",

    shadow: "rgba(211, 98, 44, 0.12)",
    overlay: "rgba(42, 37, 32, 0.6)",
    glow: "rgba(240, 200, 69, 0.3)",

    link: "#6D8EC5",
    linkHover: "#5a7bb2",

    success: "#6D8EC5",
    warning: "#F0C845",
    error: "#D3622C",
  },

  fonts: {
    heading: {
      family: "'Merriweather', serif",
      weight: 700,
      letterSpacing: "-0.01em",
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
      "https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Open+Sans:wght@400;500;600&display=swap",
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
      small: "0 2px 4px rgba(211, 98, 44, 0.08)",
      medium: "0 4px 12px rgba(211, 98, 44, 0.12)",
      large: "0 8px 24px rgba(211, 98, 44, 0.16)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #f8f6f2 0%, #f0ede6 100%)",
      pattern:
        "radial-gradient(circle at 80% 20%, rgba(240, 200, 69, 0.1) 0%, transparent 50%)",
    },
    content: {
      background: "#ffffff",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "0.75rem",
      shadow: "0 8px 24px rgba(211, 98, 44, 0.16)",
      overlay: "linear-gradient(to top, rgba(42, 37, 32, 0.4), transparent)",
    },
  },

  slideShape: {
    type: "rounded",
    borderRadius: "10px",
    shadow: "solid",
    solidShadowColor: "#D3622C",
  },

  cardBox: {
    background: "#ffffff",
    borderColor: "#e5e0d8",
    titleColor: "#D3622C",
    bodyColor: "#2a2520",
    accentColor: "#F0C845",
    shadow: "0 4px 12px rgba(211, 98, 44, 0.08)",
    hoverBackground: "#faf9f7",
    hoverBorderColor: "#D3622C",
  },

  layoutElements: {
    background: "#ffffff",
    borderColor: "#e5e0d8",
    hoverBackground: "#faf9f7",
  },

  gradients: {
    primary: "linear-gradient(135deg, #D3622C 0%, #F0C845 100%)",
    secondary: "linear-gradient(135deg, #6D8EC5 0%, #D3622C 100%)",
    overlay:
      "linear-gradient(to bottom, transparent 0%, rgba(42, 37, 32, 0.5) 100%)",
    text: "linear-gradient(135deg, #D3622C 0%, #F0C845 100%)",
  },

  preview: {
    titleBg: "#f8f6f2",
    bodyBg: "#ffffff",
    textColor: "#2a2520",
    accentColor: "#D3622C",
  },

  backgroundImage:
    "https://res.cloudinary.com/di76ibrro/image/upload/v1767950880/Generated_Image_January_09_2026_-_1_27AM_bnwzbr.jpg",
  previewBackgroundImage:
    "https://res.cloudinary.com/di76ibrro/image/upload/v1767950880/Generated_Image_January_09_2026_-_1_27AM_bnwzbr.jpg",
  backgroundPosition: "center",
  backgroundSize: "cover",
  overlay: "rgba(248, 246, 242, 0.75)",
  pageBackground: undefined,
};

export default goldenHorizonTheme;
