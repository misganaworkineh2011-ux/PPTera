/**
 * Royal Velvet Theme
 * A luxurious theme with rich gold, deep burgundy, and soft lavender tones
 */

import type { Theme } from "./types";

const THEME_ID = "royal-velvet";

export const royalVelvetTheme: Theme = {
  id: THEME_ID,
  name: "Royal Velvet",
  description: "Luxurious theme with rich gold, deep burgundy, and soft lavender",
  category: "creative",

  colors: {
    background: "#B7ADD5",
    backgroundAlt: "#a89cc8",
    surface: "#ffffff",
    surfaceHover: "#faf9fc",

    text: "#3d3548",
    textMuted: "#6b5f78",
    textInverse: "#ffffff",
    heading: "#6D2D55",

    primary: "#6D2D55",
    primaryHover: "#5a2547",
    secondary: "#C49E1C",
    secondaryHover: "#a88818",
    accent: "#C49E1C",

    border: "#d4cce5",
    borderStrong: "#6D2D55",
    borderHover: "#5a2547",

    shadow: "rgba(109, 45, 85, 0.15)",
    overlay: "rgba(61, 53, 72, 0.6)",
    glow: "rgba(196, 158, 28, 0.3)",

    link: "#6D2D55",
    linkHover: "#5a2547",

    success: "#5cb85c",
    warning: "#C49E1C",
    error: "#d9534f",
  },

  fonts: {
    heading: {
      family: "'Cormorant Garamond', serif",
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
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&display=swap",
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
      small: "0 2px 4px rgba(109, 45, 85, 0.08)",
      medium: "0 4px 12px rgba(109, 45, 85, 0.12)",
      large: "0 8px 24px rgba(109, 45, 85, 0.18)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #B7ADD5 0%, #a89cc8 100%)",
      pattern: "radial-gradient(circle at 80% 20%, rgba(196, 158, 28, 0.12) 0%, transparent 50%)",
    },
    content: {
      background: "#ffffff",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "0.5rem",
      shadow: "0 8px 24px rgba(109, 45, 85, 0.18)",
      overlay: "linear-gradient(to top, rgba(61, 53, 72, 0.4), transparent)",
    },
  },

  slideShape: {
    type: "rounded",
    borderRadius: "8px",
    shadow: "solid",
  },

  cardBox: {
    background: "#ffffff",
    borderColor: "#d4cce5",
    titleColor: "#6D2D55",
    bodyColor: "#3d3548",
    accentColor: "#C49E1C",
    shadow: "0 4px 12px rgba(109, 45, 85, 0.1)",
    hoverBackground: "#faf9fc",
    hoverBorderColor: "#6D2D55",
  },

  layoutElements: {
    background: "#ffffff",
    borderColor: "#d4cce5",
    hoverBackground: "#faf9fc",
  },

  gradients: {
    primary: "linear-gradient(135deg, #6D2D55 0%, #C49E1C 100%)",
    secondary: "linear-gradient(135deg, #B7ADD5 0%, #a89cc8 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(61, 53, 72, 0.5) 100%)",
    text: "linear-gradient(135deg, #6D2D55 0%, #C49E1C 100%)",
  },

  preview: {
    titleBg: "#B7ADD5",
    bodyBg: "#ffffff",
    textColor: "#3d3548",
    accentColor: "#6D2D55",
  },

  backgroundImage: "https://res.cloudinary.com/di76ibrro/image/upload/v1767957169/Generated_Image_January_09_2026_-_3_12AM_cuwls8.jpg",
  previewBackgroundImage: "https://res.cloudinary.com/di76ibrro/image/upload/v1767957169/Generated_Image_January_09_2026_-_3_12AM_cuwls8.jpg",
  backgroundPosition: "center",
  backgroundSize: "cover",
  overlay: "rgba(183, 173, 213, 0.7)",
  pageBackground: undefined,
};

export default royalVelvetTheme;
