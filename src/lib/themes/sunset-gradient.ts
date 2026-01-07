/**
 * Sunset Gradient Theme
 * Inspired by warm sunset skies - featuring rich oranges, pinks, and purples
 * with smooth gradient transitions. Perfect for creative and design presentations.
 */

import type { Theme } from "./types";

const THEME_ID = "sunset-gradient";

export const sunsetGradientTheme: Theme = {
  id: THEME_ID,
  name: "Sunset Gradient",
  description: "Warm sunset theme with rich oranges, pinks, and purple gradients",
  category: "creative",

  colors: {
    background: "#1a0f1e",
    backgroundAlt: "#241428",
    surface: "#2e1a32",
    surfaceHover: "#3a2240",

    text: "#fce7f3",
    textMuted: "#d4a5c9",
    textInverse: "#1a0f1e",
    heading: "#ffffff",

    primary: "#f97316",
    primaryHover: "#fb923c",
    secondary: "#ec4899",
    secondaryHover: "#f472b6",
    accent: "#a855f7",

    border: "#4a2850",
    borderStrong: "#6a3870",
    borderHover: "#8a4890",

    shadow: "rgba(249, 115, 22, 0.15)",
    overlay: "rgba(26, 15, 30, 0.9)",
    glow: "rgba(249, 115, 22, 0.4)",

    link: "#fb923c",
    linkHover: "#fdba74",

    success: "#22c55e",
    warning: "#fbbf24",
    error: "#f43f5e",
  },

  fonts: {
    heading: {
      family: "'Poppins', sans-serif",
      weight: 700,
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
      small: "0.75rem",
      medium: "1.25rem",
      large: "2rem",
      full: "9999px",
    },
    shadows: {
      small: "0 2px 10px rgba(249, 115, 22, 0.12)",
      medium: "0 8px 28px rgba(236, 72, 153, 0.18)",
      large: "0 16px 50px rgba(168, 85, 247, 0.22)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #1a0f1e 0%, #2e1a32 50%, #241428 100%)",
      pattern: "radial-gradient(ellipse at 20% 80%, rgba(249, 115, 22, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(236, 72, 153, 0.12) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(168, 85, 247, 0.08) 0%, transparent 60%)",
    },
    content: {
      background: "#241428",
      bulletStyle: "circle",
    },
    image: {
      borderRadius: "1.25rem",
      shadow: "0 12px 40px rgba(236, 72, 153, 0.25)",
      overlay: "linear-gradient(to top, rgba(26, 15, 30, 0.85), transparent)",
    },
  },

  // Slide shape - soft rounded with warm glow
  slideShape: {
    type: "soft",
    borderRadius: "18px",
    shadow: "deep",
  },

  cardBox: {
    background: "#2e1a32",
    borderColor: "#6a3870",
    titleColor: "#ffffff",
    bodyColor: "#fce7f3",
    accentColor: "#f97316",
    shadow: "none",
    hoverBackground: "#3a2240",
    hoverBorderColor: "#8a4890",
  },

  layoutElements: {
    background: "#361e3a",
    borderColor: "#6a3870",
    hoverBackground: "#422648",
  },

  gradients: {
    primary: "linear-gradient(135deg, #f97316 0%, #ec4899 50%, #a855f7 100%)",
    secondary: "linear-gradient(135deg, #2e1a32 0%, #3a2240 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(26, 15, 30, 0.95) 100%)",
    text: "linear-gradient(135deg, #f97316 0%, #ec4899 100%)",
  },

  preview: {
    titleBg: "#2e1a32",
    bodyBg: "#241428",
    textColor: "#fce7f3",
    accentColor: "#f97316",
  },

  backgroundImage: undefined,
  previewBackgroundImage: undefined,
  backgroundPosition: "center",
  backgroundSize: "cover",
  overlay: "rgba(26, 15, 30, 0.88)",

  pageBackground: "radial-gradient(ellipse at 10% 90%, rgba(249, 115, 22, 0.18) 0%, transparent 45%), radial-gradient(ellipse at 90% 10%, rgba(236, 72, 153, 0.15) 0%, transparent 45%), radial-gradient(ellipse at 50% 50%, rgba(168, 85, 247, 0.1) 0%, transparent 50%), linear-gradient(180deg, #1a0f1e 0%, #241428 40%, #1a0f1e 100%)",

  cssVariables: {
    "--sunset-glow-orange": "0 0 30px rgba(249, 115, 22, 0.4)",
    "--sunset-glow-pink": "0 0 25px rgba(236, 72, 153, 0.35)",
    "--sunset-glow-purple": "0 0 20px rgba(168, 85, 247, 0.3)",
  },
};

export default sunsetGradientTheme;
