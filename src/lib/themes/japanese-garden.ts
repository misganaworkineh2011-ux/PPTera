/**
 * Japanese Garden Theme
 * A serene theme with teal, red accents, and soft mint tones inspired by traditional Japanese aesthetics
 */

import type { Theme } from "./types";

const THEME_ID = "japanese-garden";

export const japaneseGardenTheme: Theme = {
  id: THEME_ID,
  name: "Japanese Garden",
  description: "Serene theme with teal, red accents, and soft mint tones",
  category: "creative",

  colors: {
    background: "#F5FAFA",
    backgroundAlt: "#e8f4f3",
    surface: "#ffffff",
    surfaceHover: "#f0f9f8",

    text: "#1a3a38",
    textMuted: "#4a6b68",
    textInverse: "#ffffff",
    heading: "#E12826",

    primary: "#299F93",
    primaryHover: "#238a80",
    secondary: "#E12826",
    secondaryHover: "#c92220",
    accent: "#E12826",

    border: "#c5e0dd",
    borderStrong: "#299F93",
    borderHover: "#238a80",

    shadow: "rgba(225, 40, 38, 0.12)",
    overlay: "rgba(26, 58, 56, 0.6)",
    glow: "rgba(41, 159, 147, 0.3)",

    link: "#E12826",
    linkHover: "#c92220",

    success: "#299F93",
    warning: "#d4a03c",
    error: "#E12826",
  },

  fonts: {
    heading: {
      family: "'Noto Serif JP', serif",
      weight: 700,
      letterSpacing: "0.02em",
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
      "https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;500;600;700&display=swap",
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
      small: "0 2px 4px rgba(225, 40, 38, 0.06)",
      medium: "0 4px 12px rgba(225, 40, 38, 0.1)",
      large: "0 8px 24px rgba(225, 40, 38, 0.14)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #F5FAFA 0%, #e8f4f3 100%)",
      pattern: "radial-gradient(circle at 80% 20%, rgba(225, 40, 38, 0.05) 0%, transparent 50%)",
    },
    content: {
      background: "#ffffff",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "0.5rem",
      shadow: "0 8px 24px rgba(225, 40, 38, 0.14)",
      overlay: "linear-gradient(to top, rgba(26, 58, 56, 0.4), transparent)",
    },
  },

  slideShape: {
    type: "rounded",
    borderRadius: "4px",
    shadow: "subtle",
  },

  cardBox: {
    background: "#ffffff",
    borderColor: "#c5e0dd",
    titleColor: "#E12826",
    bodyColor: "#1a3a38",
    accentColor: "#299F93",
    shadow: "0 4px 12px rgba(225, 40, 38, 0.08)",
    hoverBackground: "#f0f9f8",
    hoverBorderColor: "#299F93",
  },

  layoutElements: {
    background: "#ffffff",
    borderColor: "#c5e0dd",
    hoverBackground: "#f0f9f8",
  },

  gradients: {
    primary: "linear-gradient(135deg, #299F93 0%, #E12826 100%)",
    secondary: "linear-gradient(135deg, #F5FAFA 0%, #e8f4f3 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(26, 58, 56, 0.5) 100%)",
    text: "linear-gradient(135deg, #E12826 0%, #299F93 100%)",
  },

  preview: {
    titleBg: "#F5FAFA",
    bodyBg: "#ffffff",
    textColor: "#1a3a38",
    accentColor: "#E12826",
  },

  backgroundImage: "https://res.cloudinary.com/di76ibrro/image/upload/v1767955595/Generated_Image_January_09_2026_-_2_45AM_towkie.jpg",
  previewBackgroundImage: "https://res.cloudinary.com/di76ibrro/image/upload/v1767955595/Generated_Image_January_09_2026_-_2_45AM_towkie.jpg",
  backgroundPosition: "center",
  backgroundSize: "cover",
  overlay: "rgba(245, 250, 250, 0.7)",
  pageBackground: undefined,
};

export default japaneseGardenTheme;
