/**
 * Sakura Theme
 * Elegant Japanese-inspired theme with soft cherry blossom pinks,
 * warm creams, and delicate rose gold accents.
 * Perfect for creative, lifestyle, and elegant presentations.
 */

import type { Theme } from "./types";

const THEME_ID = "sakura";

export const sakuraTheme: Theme = {
  id: THEME_ID,
  name: "Sakura",
  description: "Elegant cherry blossom theme with soft pinks and warm creams",
  category: "light",

  colors: {
    background: "#fdf8f6",
    backgroundAlt: "#faf5f3",
    surface: "#ffffff",
    surfaceHover: "#fdf2ef",

    text: "#44403c",
    textMuted: "#78716c",
    textInverse: "#ffffff",
    heading: "#292524",

    primary: "#ec4899",
    primaryHover: "#f472b6",
    secondary: "#f43f5e",
    secondaryHover: "#fb7185",
    accent: "#d946ef",

    border: "#f5e6e0",
    borderStrong: "#e8d5ce",
    borderHover: "#dbc4bb",

    shadow: "rgba(236, 72, 153, 0.12)",
    overlay: "rgba(41, 37, 36, 0.6)",
    glow: "rgba(236, 72, 153, 0.35)",

    link: "#db2777",
    linkHover: "#be185d",

    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
  },

  fonts: {
    heading: {
      family: "'Playfair Display', serif",
      weight: 700,
      letterSpacing: "-0.01em",
    },
    body: {
      family: "'Lato', var(--font-geist-sans), sans-serif",
      weight: 400,
      lineHeight: "1.75",
    },
    caption: {
      family: "'Lato', var(--font-geist-sans), sans-serif",
      weight: 500,
      size: "0.875rem",
    },
    mono: {
      family: "'JetBrains Mono', monospace",
    },
    googleFontsUrls: [
      "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Lato:wght@400;500;700&display=swap",
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
      small: "0 2px 6px rgba(236, 72, 153, 0.08)",
      medium: "0 6px 16px rgba(236, 72, 153, 0.12)",
      large: "0 12px 32px rgba(236, 72, 153, 0.16)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #fdf8f6 0%, #fce7f3 50%, #fdf2f8 100%)",
      pattern: "radial-gradient(ellipse at 30% 70%, rgba(236, 72, 153, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 30%, rgba(244, 63, 94, 0.06) 0%, transparent 45%)",
    },
    content: {
      background: "#ffffff",
      bulletStyle: "circle",
    },
    image: {
      borderRadius: "1rem",
      shadow: "0 8px 24px rgba(236, 72, 153, 0.15)",
      overlay: "linear-gradient(to top, rgba(41, 37, 36, 0.5), transparent)",
    },
  },

  cardBox: {
    background: "#ffffff",
    borderColor: "#f5e6e0",
    titleColor: "#292524",
    bodyColor: "#57534e",
    accentColor: "#ec4899",
    shadow: "0 4px 16px rgba(236, 72, 153, 0.08)",
    hoverBackground: "#fdf8f6",
    hoverBorderColor: "#e8d5ce",
  },

  layoutElements: {
    background: "#fdf2ef",
    borderColor: "#e8d5ce",
    hoverBackground: "#fce7f3",
  },

  gradients: {
    primary: "linear-gradient(135deg, #ec4899 0%, #f43f5e 50%, #d946ef 100%)",
    secondary: "linear-gradient(135deg, #fdf8f6 0%, #fce7f3 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(41, 37, 36, 0.7) 100%)",
    text: "linear-gradient(135deg, #ec4899 0%, #d946ef 100%)",
  },

  preview: {
    titleBg: "#fce7f3",
    bodyBg: "#ffffff",
    textColor: "#44403c",
    accentColor: "#ec4899",
  },

  backgroundImage: undefined,
  previewBackgroundImage: undefined,
  backgroundPosition: "center",
  backgroundSize: "cover",

  overlay: "rgba(253, 248, 246, 0.9)",

  pageBackground: "radial-gradient(ellipse at 20% 20%, rgba(236, 72, 153, 0.08) 0%, transparent 45%), radial-gradient(ellipse at 80% 80%, rgba(244, 63, 94, 0.06) 0%, transparent 50%), radial-gradient(ellipse at 50% 100%, rgba(217, 70, 239, 0.05) 0%, transparent 45%), linear-gradient(180deg, #fdf8f6 0%, #faf5f3 40%, #fdf8f6 100%)",

  cssVariables: {
    "--sakura-glow": "0 0 25px rgba(236, 72, 153, 0.25)",
  },
};

export default sakuraTheme;
