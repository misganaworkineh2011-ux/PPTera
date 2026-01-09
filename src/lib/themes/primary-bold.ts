/**
 * Primary Bold Theme
 * A vibrant theme with ocean blue, sunny yellow, and bold red accents
 */

import type { Theme } from "./types";

const THEME_ID = "primary-bold";

export const primaryBoldTheme: Theme = {
  id: THEME_ID,
  name: "Primary Bold",
  description: "Vibrant theme with ocean blue, sunny yellow, and bold red",
  category: "creative",

  colors: {
    background: "#FDEA6F",
    backgroundAlt: "#f5e25a",
    surface: "#ffffff",
    surfaceHover: "#fffef5",

    text: "#1a2a3a",
    textMuted: "#4a5a6a",
    textInverse: "#ffffff",
    heading: "#036D9A",

    primary: "#036D9A",
    primaryHover: "#025a80",
    secondary: "#CF0000",
    secondaryHover: "#b00000",
    accent: "#CF0000",

    border: "#e8dc5a",
    borderStrong: "#036D9A",
    borderHover: "#025a80",

    shadow: "rgba(3, 109, 154, 0.15)",
    overlay: "rgba(26, 42, 58, 0.6)",
    glow: "rgba(207, 0, 0, 0.25)",

    link: "#036D9A",
    linkHover: "#025a80",

    success: "#28a745",
    warning: "#FDEA6F",
    error: "#CF0000",
  },

  fonts: {
    heading: {
      family: "'Archivo Black', sans-serif",
      weight: 400,
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
      "https://fonts.googleapis.com/css2?family=Archivo+Black&display=swap",
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
      small: "0 2px 4px rgba(3, 109, 154, 0.1)",
      medium: "0 4px 12px rgba(3, 109, 154, 0.15)",
      large: "0 8px 24px rgba(3, 109, 154, 0.2)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #FDEA6F 0%, #f5e25a 100%)",
      pattern: "radial-gradient(circle at 80% 20%, rgba(207, 0, 0, 0.08) 0%, transparent 50%)",
    },
    content: {
      background: "#ffffff",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "0.5rem",
      shadow: "0 8px 24px rgba(3, 109, 154, 0.2)",
      overlay: "linear-gradient(to top, rgba(26, 42, 58, 0.4), transparent)",
    },
  },

  slideShape: {
    type: "rounded",
    borderRadius: "4px",
    shadow: "deep",
  },

  cardBox: {
    background: "#ffffff",
    borderColor: "#e8dc5a",
    titleColor: "#036D9A",
    bodyColor: "#1a2a3a",
    accentColor: "#CF0000",
    shadow: "0 4px 12px rgba(3, 109, 154, 0.12)",
    hoverBackground: "#fffef5",
    hoverBorderColor: "#036D9A",
  },

  layoutElements: {
    background: "#ffffff",
    borderColor: "#e8dc5a",
    hoverBackground: "#fffef5",
  },

  gradients: {
    primary: "linear-gradient(135deg, #036D9A 0%, #CF0000 100%)",
    secondary: "linear-gradient(135deg, #FDEA6F 0%, #f5e25a 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(26, 42, 58, 0.5) 100%)",
    text: "linear-gradient(135deg, #036D9A 0%, #CF0000 100%)",
  },

  preview: {
    titleBg: "#FDEA6F",
    bodyBg: "#ffffff",
    textColor: "#1a2a3a",
    accentColor: "#036D9A",
  },

  backgroundImage: "https://res.cloudinary.com/di76ibrro/image/upload/v1767957793/Generated_Image_January_09_2026_-_3_22AM_idcmla.jpg",
  previewBackgroundImage: "https://res.cloudinary.com/di76ibrro/image/upload/v1767957793/Generated_Image_January_09_2026_-_3_22AM_idcmla.jpg",
  backgroundPosition: "center",
  backgroundSize: "cover",
  overlay: "rgba(253, 234, 111, 0.7)",
  pageBackground: undefined,
};

export default primaryBoldTheme;
