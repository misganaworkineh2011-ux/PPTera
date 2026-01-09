/**
 * Rose Stripes Theme
 * A romantic theme with rose pink, olive gold, and deep burgundy with rose stripes background
 */

import type { Theme } from "./types";

const THEME_ID = "rose-stripes";

export const roseStripesTheme: Theme = {
  id: THEME_ID,
  name: "Rose Stripes",
  description: "Romantic theme with rose pink, olive gold, and deep burgundy accents",
  category: "creative",

  colors: {
    background: "#fdf2f4",
    backgroundAlt: "#fce7eb",
    surface: "#ffffff",
    surfaceHover: "#fef7f8",

    text: "#461312",
    textMuted: "#6b3a39",
    textInverse: "#ffffff",
    heading: "#461312",

    primary: "#ED809D",
    primaryHover: "#e5607f",
    secondary: "#C9C769",
    secondaryHover: "#b8b654",
    accent: "#461312",

    border: "#f5d5db",
    borderStrong: "#ED809D",
    borderHover: "#e5607f",

    shadow: "rgba(70, 19, 18, 0.12)",
    overlay: "rgba(70, 19, 18, 0.6)",
    glow: "rgba(237, 128, 157, 0.3)",

    link: "#461312",
    linkHover: "#6b3a39",

    success: "#C9C769",
    warning: "#d4a03c",
    error: "#461312",
  },

  fonts: {
    heading: {
      family: "'Cormorant Garamond', serif",
      weight: 700,
      letterSpacing: "-0.01em",
    },
    body: {
      family: "'Lora', serif",
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
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Lora:wght@400;500;600&display=swap",
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
      small: "0 2px 4px rgba(70, 19, 18, 0.08)",
      medium: "0 4px 12px rgba(70, 19, 18, 0.12)",
      large: "0 8px 24px rgba(70, 19, 18, 0.16)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #fdf2f4 0%, #fce7eb 100%)",
      pattern:
        "radial-gradient(circle at 80% 20%, rgba(237, 128, 157, 0.08) 0%, transparent 50%)",
    },
    content: {
      background: "#ffffff",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "0.75rem",
      shadow: "0 8px 24px rgba(70, 19, 18, 0.16)",
      overlay: "linear-gradient(to top, rgba(70, 19, 18, 0.4), transparent)",
    },
  },

  slideShape: {
    type: "soft",
    borderRadius: "16px",
    shadow: "deep",
  },

  cardBox: {
    background: "#ffffff",
    borderColor: "#f5d5db",
    titleColor: "#461312",
    bodyColor: "#461312",
    accentColor: "#ED809D",
    shadow: "0 4px 12px rgba(70, 19, 18, 0.08)",
    hoverBackground: "#fef7f8",
    hoverBorderColor: "#ED809D",
  },

  layoutElements: {
    background: "#ffffff",
    borderColor: "#f5d5db",
    hoverBackground: "#fef7f8",
  },

  gradients: {
    primary: "linear-gradient(135deg, #ED809D 0%, #C9C769 100%)",
    secondary: "linear-gradient(135deg, #fdf2f4 0%, #fce7eb 100%)",
    overlay:
      "linear-gradient(to bottom, transparent 0%, rgba(70, 19, 18, 0.5) 100%)",
    text: "linear-gradient(135deg, #461312 0%, #ED809D 100%)",
  },

  preview: {
    titleBg: "#fdf2f4",
    bodyBg: "#ffffff",
    textColor: "#461312",
    accentColor: "#ED809D",
  },

  backgroundImage:
    "https://res.cloudinary.com/di76ibrro/image/upload/v1767949566/Generated_Image_January_09_2026_-_1_04AM_lq0dec.jpg",
  previewBackgroundImage:
    "https://res.cloudinary.com/di76ibrro/image/upload/v1767949566/Generated_Image_January_09_2026_-_1_04AM_lq0dec.jpg",
  backgroundPosition: "center",
  backgroundSize: "cover",
  overlay: "rgba(253, 242, 244, 0.75)",
  pageBackground: undefined,
};

export default roseStripesTheme;
