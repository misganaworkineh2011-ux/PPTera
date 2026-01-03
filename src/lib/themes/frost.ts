/**
 * Frost Theme
 * Clean, icy light theme inspired by winter frost and crystal clarity.
 * Features cool blues, crisp whites, and subtle silver accents.
 * Perfect for professional, tech, and modern presentations.
 */

import type { Theme } from "./types";

const THEME_ID = "frost";

export const frostTheme: Theme = {
  id: THEME_ID,
  name: "Frost",
  description: "Crystal clear winter theme with icy blues and crisp whites",
  category: "light",

  colors: {
    background: "#f8fafc",
    backgroundAlt: "#f1f5f9",
    surface: "#ffffff",
    surfaceHover: "#f1f5f9",

    text: "#1e293b",
    textMuted: "#64748b",
    textInverse: "#ffffff",
    heading: "#0f172a",

    primary: "#0ea5e9",
    primaryHover: "#38bdf8",
    secondary: "#6366f1",
    secondaryHover: "#818cf8",
    accent: "#06b6d4",

    border: "#e2e8f0",
    borderStrong: "#cbd5e1",
    borderHover: "#94a3b8",

    shadow: "rgba(14, 165, 233, 0.1)",
    overlay: "rgba(15, 23, 42, 0.6)",
    glow: "rgba(14, 165, 233, 0.3)",

    link: "#0284c7",
    linkHover: "#0369a1",

    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
  },

  fonts: {
    heading: {
      family: "'Plus Jakarta Sans', sans-serif",
      weight: 700,
      letterSpacing: "-0.02em",
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
      "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap",
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
      small: "0 1px 3px rgba(14, 165, 233, 0.08)",
      medium: "0 4px 12px rgba(14, 165, 233, 0.12)",
      large: "0 12px 32px rgba(14, 165, 233, 0.16)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #f0f9ff 100%)",
      pattern: "radial-gradient(ellipse at 20% 80%, rgba(14, 165, 233, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(99, 102, 241, 0.06) 0%, transparent 50%)",
    },
    content: {
      background: "#ffffff",
      bulletStyle: "circle",
    },
    image: {
      borderRadius: "0.75rem",
      shadow: "0 8px 24px rgba(14, 165, 233, 0.15)",
      overlay: "linear-gradient(to top, rgba(15, 23, 42, 0.5), transparent)",
    },
  },

  cardBox: {
    background: "#ffffff",
    borderColor: "#e2e8f0",
    titleColor: "#0f172a",
    bodyColor: "#475569",
    accentColor: "#0ea5e9",
    shadow: "0 4px 16px rgba(14, 165, 233, 0.08)",
    hoverBackground: "#f8fafc",
    hoverBorderColor: "#cbd5e1",
  },

  layoutElements: {
    background: "#f1f5f9",
    borderColor: "#cbd5e1",
    hoverBackground: "#e2e8f0",
  },

  gradients: {
    primary: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
    secondary: "linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(15, 23, 42, 0.7) 100%)",
    text: "linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)",
  },

  preview: {
    titleBg: "#e0f2fe",
    bodyBg: "#ffffff",
    textColor: "#1e293b",
    accentColor: "#0ea5e9",
  },

  backgroundImage: undefined,
  previewBackgroundImage: undefined,
  backgroundPosition: "center",
  backgroundSize: "cover",

  overlay: "rgba(248, 250, 252, 0.9)",

  pageBackground: "radial-gradient(ellipse at 0% 0%, rgba(14, 165, 233, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 100% 100%, rgba(99, 102, 241, 0.06) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(6, 182, 212, 0.04) 0%, transparent 60%), linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #f8fafc 100%)",

  cssVariables: {
    "--frost-glow": "0 0 20px rgba(14, 165, 233, 0.2)",
  },
};

export default frostTheme;
