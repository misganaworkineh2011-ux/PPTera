/**
 * Violet Dream Theme
 * A dreamy theme with rich violet, deep magenta, and warm peach tones
 */

import type { Theme } from "./types";

const THEME_ID = "violet-dream";

export const violetDreamTheme: Theme = {
  id: THEME_ID,
  name: "Violet Dream",
  description: "Dreamy theme with rich violet, deep magenta, and warm peach",
  category: "creative",

  colors: {
    background: "#FFD7B1",
    backgroundAlt: "#f5cba0",
    surface: "#ffffff",
    surfaceHover: "#fff9f5",

    text: "#3a2845",
    textMuted: "#6a5075",
    textInverse: "#ffffff",
    heading: "#5A40BC",

    primary: "#5A40BC",
    primaryHover: "#4a35a0",
    secondary: "#780DA7",
    secondaryHover: "#650b8f",
    accent: "#780DA7",

    border: "#e8c9a5",
    borderStrong: "#5A40BC",
    borderHover: "#4a35a0",

    shadow: "rgba(90, 64, 188, 0.15)",
    overlay: "rgba(58, 40, 69, 0.6)",
    glow: "rgba(120, 13, 167, 0.25)",

    link: "#5A40BC",
    linkHover: "#4a35a0",

    success: "#5cb85c",
    warning: "#f0ad4e",
    error: "#d9534f",
  },

  fonts: {
    heading: {
      family: "'DM Serif Display', serif",
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
      "https://fonts.googleapis.com/css2?family=DM+Serif+Display&display=swap",
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
      small: "0 2px 4px rgba(90, 64, 188, 0.08)",
      medium: "0 4px 12px rgba(90, 64, 188, 0.12)",
      large: "0 8px 24px rgba(90, 64, 188, 0.18)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #FFD7B1 0%, #f5cba0 100%)",
      pattern: "radial-gradient(circle at 80% 20%, rgba(120, 13, 167, 0.08) 0%, transparent 50%)",
    },
    content: {
      background: "#ffffff",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "1rem",
      shadow: "0 8px 24px rgba(90, 64, 188, 0.18)",
      overlay: "linear-gradient(to top, rgba(58, 40, 69, 0.4), transparent)",
    },
  },

  slideShape: {
    type: "rounded",
    borderRadius: "24px",
    shadow: "medium",
  },

  cardBox: {
    background: "#ffffff",
    borderColor: "#e8c9a5",
    titleColor: "#5A40BC",
    bodyColor: "#3a2845",
    accentColor: "#780DA7",
    shadow: "0 4px 12px rgba(90, 64, 188, 0.1)",
    hoverBackground: "#fff9f5",
    hoverBorderColor: "#5A40BC",
  },

  layoutElements: {
    background: "#ffffff",
    borderColor: "#e8c9a5",
    hoverBackground: "#fff9f5",
  },

  gradients: {
    primary: "linear-gradient(135deg, #5A40BC 0%, #780DA7 100%)",
    secondary: "linear-gradient(135deg, #FFD7B1 0%, #f5cba0 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(58, 40, 69, 0.5) 100%)",
    text: "linear-gradient(135deg, #5A40BC 0%, #780DA7 100%)",
  },

  preview: {
    titleBg: "#FFD7B1",
    bodyBg: "#ffffff",
    textColor: "#3a2845",
    accentColor: "#5A40BC",
  },

  backgroundImage: "https://res.cloudinary.com/di76ibrro/image/upload/v1767958042/Generated_Image_January_09_2026_-_3_26AM_rqwlir.jpg",
  previewBackgroundImage: "https://res.cloudinary.com/di76ibrro/image/upload/v1767958042/Generated_Image_January_09_2026_-_3_26AM_rqwlir.jpg",
  backgroundPosition: "center",
  backgroundSize: "cover",
  overlay: "rgba(255, 215, 177, 0.7)",
  pageBackground: undefined,
};

export default violetDreamTheme;
