/**
 * Aurora Theme
 * Inspired by the magical Northern Lights - featuring ethereal greens, teals, and purples
 * with smooth gradient transitions. Perfect for creative, inspiring, and visionary presentations.
 */

import type { Theme } from "./types";

// Theme ID
const THEME_ID = "aurora";

export const auroraTheme: Theme = {
  // Identity
  id: THEME_ID,
  name: "Aurora",
  description: "Ethereal Northern Lights inspired theme with magical gradient transitions",
  category: "dark",

  // Core color tokens
  colors: {
    // Backgrounds - Deep night sky
    background: "#0c1222",
    backgroundAlt: "#111a2e",
    surface: "#162035",
    surfaceHover: "#1e2a45",

    // Text - Crisp and luminous
    text: "#e4f0f6",
    textMuted: "#94b8c9",
    textInverse: "#0c1222",
    heading: "#ffffff",

    // Brand - Aurora colors
    primary: "#22d3ee",      // Cyan aurora
    primaryHover: "#67e8f9",
    secondary: "#34d399",    // Green aurora
    secondaryHover: "#6ee7b7",
    accent: "#a78bfa",       // Purple aurora

    // Borders
    border: "#1e3a5f",
    borderStrong: "#2d5a87",
    borderHover: "#3d7ab0",

    // Effects
    shadow: "rgba(34, 211, 238, 0.15)",
    overlay: "rgba(12, 18, 34, 0.85)",
    glow: "rgba(34, 211, 238, 0.4)",

    // Links
    link: "#67e8f9",
    linkHover: "#a5f3fc",

    // Status
    success: "#34d399",
    warning: "#fbbf24",
    error: "#f87171",
  },

  // Font configuration
  fonts: {
    heading: {
      family: "'Outfit', sans-serif",
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
      "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap",
    ],
  },

  // Design tokens
  design: {
    borderRadius: {
      small: "0.5rem",
      medium: "1rem",
      large: "1.5rem",
      full: "9999px",
    },
    shadows: {
      small: "0 2px 8px rgba(34, 211, 238, 0.1)",
      medium: "0 8px 24px rgba(34, 211, 238, 0.15)",
      large: "0 16px 48px rgba(34, 211, 238, 0.2)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  // Slide-specific styles
  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #0c1222 0%, #162035 50%, #111a2e 100%)",
      pattern: "radial-gradient(ellipse at 20% 30%, rgba(34, 211, 238, 0.12) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(52, 211, 153, 0.1) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(167, 139, 250, 0.08) 0%, transparent 60%)",
    },
    content: {
      background: "#111a2e",
      bulletStyle: "circle",
    },
    image: {
      borderRadius: "1rem",
      shadow: "0 12px 40px rgba(34, 211, 238, 0.2)",
      overlay: "linear-gradient(to top, rgba(12, 18, 34, 0.8), transparent)",
    },
  },

  // Card/Box styling (used for slide backgrounds)
  cardBox: {
    background: "#162035",
    borderColor: "#2d5a87",
    titleColor: "#ffffff",
    bodyColor: "#e4f0f6",
    accentColor: "#22d3ee",
    shadow: "none",
    hoverBackground: "#1e2a45",
    hoverBorderColor: "#3d7ab0",
  },

  // Layout element colors (for cards, boxes, steps inside slides)
  layoutElements: {
    background: "#1a2840",
    borderColor: "#2d5a87",
    hoverBackground: "#223350",
  },

  // Gradients - Beautiful aurora-inspired gradients
  gradients: {
    primary: "linear-gradient(135deg, #22d3ee 0%, #34d399 50%, #a78bfa 100%)",
    secondary: "linear-gradient(135deg, #162035 0%, #1e3a5f 50%, #162035 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(12, 18, 34, 0.95) 100%)",
    text: "linear-gradient(135deg, #22d3ee 0%, #34d399 100%)",
  },

  // Preview colors for theme selector
  preview: {
    titleBg: "#162035",
    bodyBg: "#111a2e",
    textColor: "#e4f0f6",
    accentColor: "#22d3ee",
  },

  // No background image - using gradient
  backgroundImage: undefined,
  previewBackgroundImage: undefined,
  backgroundPosition: "center",
  backgroundSize: "cover",

  // Overlay for text readability
  overlay: "rgba(12, 18, 34, 0.8)",

  // Page background - stunning aurora gradient (fixed)
  pageBackground: "radial-gradient(ellipse at 10% 20%, rgba(34, 211, 238, 0.15) 0%, transparent 40%), radial-gradient(ellipse at 90% 80%, rgba(52, 211, 153, 0.12) 0%, transparent 45%), radial-gradient(ellipse at 50% 100%, rgba(167, 139, 250, 0.1) 0%, transparent 50%), radial-gradient(ellipse at 30% 60%, rgba(34, 211, 238, 0.08) 0%, transparent 35%), linear-gradient(180deg, #0c1222 0%, #111a2e 40%, #0c1222 100%)",

  // CSS variable overrides
  cssVariables: {
    "--aurora-glow-cyan": "0 0 30px rgba(34, 211, 238, 0.3)",
    "--aurora-glow-green": "0 0 30px rgba(52, 211, 153, 0.3)",
    "--aurora-glow-purple": "0 0 30px rgba(167, 139, 250, 0.3)",
  },
};

export default auroraTheme;
