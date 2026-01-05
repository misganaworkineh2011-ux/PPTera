/**
 * Aurora Borealis Tech Theme
 * Inspired by northern lights with a tech twist - featuring ethereal greens, blues,
 * and purples with modern aesthetics. Perfect for technology and innovation presentations.
 */

import type { Theme } from "./types";

const THEME_ID = "aurora-borealis-tech";

export const auroraBorealisTechTheme: Theme = {
  id: THEME_ID,
  name: "Aurora Borealis Tech",
  description: "Northern lights inspired tech theme with ethereal greens and modern aesthetics",
  category: "dark",

  colors: {
    background: "#0a1628",
    backgroundAlt: "#0f1e35",
    surface: "#142642",
    surfaceHover: "#1a3050",

    text: "#e2f1ff",
    textMuted: "#8bb8d9",
    textInverse: "#0a1628",
    heading: "#ffffff",

    primary: "#10b981",
    primaryHover: "#34d399",
    secondary: "#3b82f6",
    secondaryHover: "#60a5fa",
    accent: "#8b5cf6",

    border: "#1e3a5f",
    borderStrong: "#2a5080",
    borderHover: "#3668a0",

    shadow: "rgba(16, 185, 129, 0.15)",
    overlay: "rgba(10, 22, 40, 0.9)",
    glow: "rgba(16, 185, 129, 0.4)",

    link: "#34d399",
    linkHover: "#6ee7b7",

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
      medium: "1rem",
      large: "1.5rem",
      full: "9999px",
    },
    shadows: {
      small: "0 2px 10px rgba(16, 185, 129, 0.1)",
      medium: "0 8px 28px rgba(16, 185, 129, 0.15)",
      large: "0 16px 50px rgba(16, 185, 129, 0.2)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #0a1628 0%, #142642 50%, #0f1e35 100%)",
      pattern: "radial-gradient(ellipse at 20% 30%, rgba(16, 185, 129, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(59, 130, 246, 0.12) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(139, 92, 246, 0.08) 0%, transparent 60%)",
    },
    content: {
      background: "#0f1e35",
      bulletStyle: "circle",
    },
    image: {
      borderRadius: "1rem",
      shadow: "0 12px 40px rgba(16, 185, 129, 0.2)",
      overlay: "linear-gradient(to top, rgba(10, 22, 40, 0.85), transparent)",
    },
  },

  cardBox: {
    background: "#142642",
    borderColor: "#2a5080",
    titleColor: "#ffffff",
    bodyColor: "#e2f1ff",
    accentColor: "#10b981",
    shadow: "none",
    hoverBackground: "#1a3050",
    hoverBorderColor: "#3668a0",
  },

  layoutElements: {
    background: "#182e4a",
    borderColor: "#2a5080",
    hoverBackground: "#1f3858",
  },

  gradients: {
    primary: "linear-gradient(135deg, #10b981 0%, #3b82f6 50%, #8b5cf6 100%)",
    secondary: "linear-gradient(135deg, #142642 0%, #1a3050 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(10, 22, 40, 0.95) 100%)",
    text: "linear-gradient(135deg, #10b981 0%, #3b82f6 100%)",
  },

  preview: {
    titleBg: "#142642",
    bodyBg: "#0f1e35",
    textColor: "#e2f1ff",
    accentColor: "#10b981",
  },

  backgroundImage: undefined,
  previewBackgroundImage: undefined,
  backgroundPosition: "center",
  backgroundSize: "cover",
  overlay: "rgba(10, 22, 40, 0.88)",

  pageBackground: "radial-gradient(ellipse at 15% 25%, rgba(16, 185, 129, 0.18) 0%, transparent 45%), radial-gradient(ellipse at 85% 75%, rgba(59, 130, 246, 0.14) 0%, transparent 45%), radial-gradient(ellipse at 50% 100%, rgba(139, 92, 246, 0.1) 0%, transparent 50%), linear-gradient(180deg, #0a1628 0%, #0f1e35 40%, #0a1628 100%)",

  cssVariables: {
    "--aurora-tech-glow-green": "0 0 30px rgba(16, 185, 129, 0.4)",
    "--aurora-tech-glow-blue": "0 0 25px rgba(59, 130, 246, 0.35)",
    "--aurora-tech-glow-purple": "0 0 20px rgba(139, 92, 246, 0.3)",
  },
};

export default auroraBorealisTechTheme;
