/**
 * Lavender Fields Theme
 * A soft natural theme with olive green, cream, and lavender purple with floral background
 */

import type { Theme } from "./types";

const THEME_ID = "lavender-fields";

export const lavenderFieldsTheme: Theme = {
  id: THEME_ID,
  name: "Lavender Fields",
  description: "Soft natural theme with olive green, cream, and lavender purple accents",
  category: "creative",

  colors: {
    background: "#FCF9D8",
    backgroundAlt: "#f5f2cc",
    surface: "#ffffff",
    surfaceHover: "#fdfcf0",

    text: "#3D402F",
    textMuted: "#5a5d4a",
    textInverse: "#ffffff",
    heading: "#3D402F",

    primary: "#C99FCD",
    primaryHover: "#b88dbc",
    secondary: "#3D402F",
    secondaryHover: "#2e3022",
    accent: "#C99FCD",

    border: "#e5e2c8",
    borderStrong: "#C99FCD",
    borderHover: "#b88dbc",

    shadow: "rgba(61, 64, 47, 0.12)",
    overlay: "rgba(61, 64, 47, 0.6)",
    glow: "rgba(201, 159, 205, 0.3)",

    link: "#C99FCD",
    linkHover: "#b88dbc",

    success: "#6a8a5a",
    warning: "#d4a03c",
    error: "#c45a5a",
  },

  fonts: {
    heading: {
      family: "'Playfair Display', serif",
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
      "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Lora:wght@400;500;600&display=swap",
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
      small: "0 2px 4px rgba(61, 64, 47, 0.08)",
      medium: "0 4px 12px rgba(61, 64, 47, 0.12)",
      large: "0 8px 24px rgba(61, 64, 47, 0.16)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #FCF9D8 0%, #f5f2cc 100%)",
      pattern:
        "radial-gradient(circle at 80% 20%, rgba(201, 159, 205, 0.1) 0%, transparent 50%)",
    },
    content: {
      background: "#ffffff",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "0.75rem",
      shadow: "0 8px 24px rgba(61, 64, 47, 0.16)",
      overlay: "linear-gradient(to top, rgba(61, 64, 47, 0.4), transparent)",
    },
  },

  slideShape: {
    type: "soft",
    borderRadius: "24px",
    shadow: "medium",
  },

  cardBox: {
    background: "#ffffff",
    borderColor: "#e5e2c8",
    titleColor: "#3D402F",
    bodyColor: "#3D402F",
    accentColor: "#C99FCD",
    shadow: "0 4px 12px rgba(61, 64, 47, 0.08)",
    hoverBackground: "#fdfcf0",
    hoverBorderColor: "#C99FCD",
  },

  layoutElements: {
    background: "#ffffff",
    borderColor: "#e5e2c8",
    hoverBackground: "#fdfcf0",
  },

  gradients: {
    primary: "linear-gradient(135deg, #C99FCD 0%, #3D402F 100%)",
    secondary: "linear-gradient(135deg, #FCF9D8 0%, #f5f2cc 100%)",
    overlay:
      "linear-gradient(to bottom, transparent 0%, rgba(61, 64, 47, 0.5) 100%)",
    text: "linear-gradient(135deg, #3D402F 0%, #C99FCD 100%)",
  },

  preview: {
    titleBg: "#FCF9D8",
    bodyBg: "#ffffff",
    textColor: "#3D402F",
    accentColor: "#C99FCD",
  },

  backgroundImage:
    "https://res.cloudinary.com/di76ibrro/image/upload/v1767951042/Generated_Image_January_09_2026_-_1_30AM_cjca0g.jpg",
  previewBackgroundImage:
    "https://res.cloudinary.com/di76ibrro/image/upload/v1767951042/Generated_Image_January_09_2026_-_1_30AM_cjca0g.jpg",
  backgroundPosition: "center",
  backgroundSize: "cover",
  overlay: "rgba(252, 249, 216, 0.75)",
  pageBackground: undefined,
};

export default lavenderFieldsTheme;
