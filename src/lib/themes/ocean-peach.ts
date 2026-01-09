/**
 * Ocean Peach Theme
 * A serene theme with soft peach, sky blue, and deep ocean blue tones
 */

import type { Theme } from "./types";

const THEME_ID = "ocean-peach";

export const oceanPeachTheme: Theme = {
  id: THEME_ID,
  name: "Ocean Peach",
  description: "Serene theme with soft peach, sky blue, and deep ocean blue",
  category: "creative",

  colors: {
    background: "#FFE9D2",
    backgroundAlt: "#f5dfc5",
    surface: "#ffffff",
    surfaceHover: "#fff9f5",

    text: "#1a3a4a",
    textMuted: "#4a6a7a",
    textInverse: "#ffffff",
    heading: "#017CC3",

    primary: "#017CC3",
    primaryHover: "#0168a5",
    secondary: "#ADD4E5",
    secondaryHover: "#9ac5d8",
    accent: "#ADD4E5",

    border: "#c8e0ec",
    borderStrong: "#017CC3",
    borderHover: "#0168a5",

    shadow: "rgba(1, 124, 195, 0.12)",
    overlay: "rgba(26, 58, 74, 0.6)",
    glow: "rgba(173, 212, 229, 0.3)",

    link: "#017CC3",
    linkHover: "#0168a5",

    success: "#5cb85c",
    warning: "#f0ad4e",
    error: "#d9534f",
  },

  fonts: {
    heading: {
      family: "'Poppins', sans-serif",
      weight: 600,
      letterSpacing: "-0.01em",
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
      "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap",
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
      small: "0 2px 4px rgba(1, 124, 195, 0.08)",
      medium: "0 4px 12px rgba(1, 124, 195, 0.12)",
      large: "0 8px 24px rgba(1, 124, 195, 0.16)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #FFE9D2 0%, #f5dfc5 100%)",
      pattern: "radial-gradient(circle at 80% 20%, rgba(173, 212, 229, 0.2) 0%, transparent 50%)",
    },
    content: {
      background: "#ffffff",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "1rem",
      shadow: "0 8px 24px rgba(1, 124, 195, 0.16)",
      overlay: "linear-gradient(to top, rgba(26, 58, 74, 0.4), transparent)",
    },
  },

  slideShape: {
    type: "rounded",
    borderRadius: "16px",
    shadow: "subtle",
  },

  cardBox: {
    background: "#ffffff",
    borderColor: "#c8e0ec",
    titleColor: "#017CC3",
    bodyColor: "#1a3a4a",
    accentColor: "#ADD4E5",
    shadow: "0 4px 12px rgba(1, 124, 195, 0.1)",
    hoverBackground: "#fff9f5",
    hoverBorderColor: "#017CC3",
  },

  layoutElements: {
    background: "#ffffff",
    borderColor: "#c8e0ec",
    hoverBackground: "#fff9f5",
  },

  gradients: {
    primary: "linear-gradient(135deg, #017CC3 0%, #ADD4E5 100%)",
    secondary: "linear-gradient(135deg, #FFE9D2 0%, #f5dfc5 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(26, 58, 74, 0.5) 100%)",
    text: "linear-gradient(135deg, #017CC3 0%, #0168a5 100%)",
  },

  preview: {
    titleBg: "#FFE9D2",
    bodyBg: "#ffffff",
    textColor: "#1a3a4a",
    accentColor: "#017CC3",
  },

  backgroundImage: "https://res.cloudinary.com/di76ibrro/image/upload/v1767959627/Generated_Image_January_09_2026_-_3_53AM_bhr5cj.jpg",
  previewBackgroundImage: "https://res.cloudinary.com/di76ibrro/image/upload/v1767959627/Generated_Image_January_09_2026_-_3_53AM_bhr5cj.jpg",
  backgroundPosition: "center",
  backgroundSize: "cover",
  overlay: "rgba(255, 233, 210, 0.72)",
  pageBackground: undefined,
};

export default oceanPeachTheme;
