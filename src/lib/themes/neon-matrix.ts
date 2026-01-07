/**
 * Neon Matrix Theme
 * Dark theme with neon green accents and futuristic matrix-style aesthetics
 */

import type { Theme } from "./types";
import { getSlideBackgroundUrl, getThemePreviewUrl } from "./cloudinary";

const THEME_ID = "neon-matrix";

export const neonMatrixTheme: Theme = {
  id: THEME_ID,
  name: "Neon Matrix",
  description: "Dark theme with neon green accents and futuristic aesthetics",
  category: "bold",

  colors: {
    background: "#0a0f0a",
    backgroundAlt: "#121a12",
    surface: "#1a251a",
    surfaceHover: "#223022",

    text: "#c8e8c8",
    textMuted: "#88b888",
    textInverse: "#0a0f0a",
    heading: "#ffffff",

    primary: "#84cc16",
    primaryHover: "#a3e635",
    secondary: "#65a30d",
    secondaryHover: "#84cc16",
    accent: "#84cc16",

    border: "#2a3a2a",
    borderStrong: "#3a4a3a",
    borderHover: "#4a5a4a",

    shadow: "rgba(10, 15, 10, 0.4)",
    overlay: "rgba(10, 15, 10, 0.85)",
    glow: "rgba(132, 204, 22, 0.3)",

    link: "#84cc16",
    linkHover: "#a3e635",

    success: "#84cc16",
    warning: "#eab308",
    error: "#ef4444",
  },

  fonts: {
    heading: {
      family: "'Space Grotesk', sans-serif",
      weight: 700,
      letterSpacing: "-0.02em",
    },
    body: {
      family: "'Inter', var(--font-geist-sans), sans-serif",
      weight: 400,
      lineHeight: "1.6",
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
      "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap",
    ],
  },

  design: {
    borderRadius: {
      small: "0.5rem",
      medium: "0.75rem",
      large: "1rem",
      full: "9999px",
    },
    shadows: {
      small: "0 2px 8px rgba(10, 15, 10, 0.3)",
      medium: "0 4px 16px rgba(10, 15, 10, 0.4)",
      large: "0 8px 32px rgba(10, 15, 10, 0.5)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "#0a0f0a",
      pattern: "radial-gradient(ellipse at 70% 30%, rgba(132, 204, 22, 0.1) 0%, transparent 50%)",
    },
    content: {
      background: "#121a12",
      bulletStyle: "square",
    },
    image: {
      borderRadius: "0.75rem",
      shadow: "0 8px 32px rgba(10, 15, 10, 0.5)",
      overlay: "linear-gradient(to top, rgba(10, 15, 10, 0.6), transparent)",
    },
  },

  slideShape: {
    type: "rounded",
    borderRadius: "12px",
    shadow: "subtle",
    border: {
      width: "1px",
      color: "#3a4a3a",
      style: "solid",
    },
  },

  cardBox: {
    background: "#1a251a",
    borderColor: "#3a4a3a",
    titleColor: "#ffffff",
    bodyColor: "#c8e8c8",
    accentColor: "#84cc16",
    shadow: "0 4px 16px rgba(10, 15, 10, 0.4)",
    hoverBackground: "#223022",
    hoverBorderColor: "#4a5a4a",
  },

  layoutElements: {
    background: "#1a251a",
    borderColor: "#3a4a3a",
    hoverBackground: "#223022",
  },

  gradients: {
    primary: "linear-gradient(135deg, #84cc16 0%, #a3e635 100%)",
    secondary: "linear-gradient(135deg, #0a0f0a 0%, #121a12 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(10, 15, 10, 0.8) 100%)",
    text: "linear-gradient(135deg, #84cc16 0%, #a3e635 100%)",
  },

  preview: {
    titleBg: "#0a0f0a",
    bodyBg: "#1a251a",
    textColor: "#c8e8c8",
    accentColor: "#84cc16",
  },

  backgroundImage: getSlideBackgroundUrl(THEME_ID),
  previewBackgroundImage: getThemePreviewUrl(THEME_ID),
  backgroundPosition: "center",
  backgroundSize: "cover",
  overlay: "rgba(10, 15, 10, 0.75)",
  pageBackground: "radial-gradient(ellipse at 30% 20%, rgba(132, 204, 22, 0.12) 0%, transparent 45%), radial-gradient(ellipse at 70% 80%, rgba(132, 204, 22, 0.08) 0%, transparent 40%), radial-gradient(ellipse at 50% 50%, rgba(101, 163, 13, 0.05) 0%, transparent 50%), linear-gradient(180deg, #0a0f0a 0%, #121a12 50%, #0a0f0a 100%)",
};

export default neonMatrixTheme;
