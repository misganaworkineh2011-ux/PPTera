/**
 * Ember Theme
 * Inspired by glowing embers and warm firelight - featuring rich oranges, deep reds,
 * and golden accents. Perfect for passionate, energetic, and bold presentations.
 */

import type { Theme } from "./types";

// Theme ID
const THEME_ID = "ember";

export const emberTheme: Theme = {
  // Identity
  id: THEME_ID,
  name: "Ember",
  description: "Warm firelight theme with glowing embers, rich oranges and golden accents",
  category: "dark",

  // Core color tokens
  colors: {
    // Backgrounds - Deep charcoal with warm undertones
    background: "#1a1210",
    backgroundAlt: "#241a16",
    surface: "#2d201a",
    surfaceHover: "#3a2a22",

    // Text - Warm and inviting
    text: "#f5ebe6",
    textMuted: "#c9a89a",
    textInverse: "#1a1210",
    heading: "#ffffff",

    // Brand - Ember colors
    primary: "#f97316",      // Vibrant orange
    primaryHover: "#fb923c",
    secondary: "#ef4444",    // Red ember
    secondaryHover: "#f87171",
    accent: "#fbbf24",       // Golden spark

    // Borders
    border: "#4a3228",
    borderStrong: "#6b4535",
    borderHover: "#8c5842",

    // Effects
    shadow: "rgba(249, 115, 22, 0.2)",
    overlay: "rgba(26, 18, 16, 0.9)",
    glow: "rgba(249, 115, 22, 0.5)",

    // Links
    link: "#fb923c",
    linkHover: "#fdba74",

    // Status
    success: "#22c55e",
    warning: "#fbbf24",
    error: "#ef4444",
  },

  // Font configuration
  fonts: {
    heading: {
      family: "'Sora', sans-serif",
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
      "https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap",
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
      small: "0 2px 8px rgba(249, 115, 22, 0.12)",
      medium: "0 8px 24px rgba(249, 115, 22, 0.18)",
      large: "0 16px 48px rgba(249, 115, 22, 0.25)",
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
      background: "linear-gradient(135deg, #1a1210 0%, #2d201a 50%, #241a16 100%)",
      pattern: "radial-gradient(ellipse at 30% 70%, rgba(249, 115, 22, 0.12) 0%, transparent 50%), radial-gradient(ellipse at 70% 30%, rgba(239, 68, 68, 0.08) 0%, transparent 45%), radial-gradient(ellipse at 50% 90%, rgba(251, 191, 36, 0.06) 0%, transparent 40%)",
    },
    content: {
      background: "#241a16",
      bulletStyle: "circle",
    },
    image: {
      borderRadius: "1rem",
      shadow: "0 12px 40px rgba(249, 115, 22, 0.25)",
      overlay: "linear-gradient(to top, rgba(26, 18, 16, 0.85), transparent)",
    },
  },

  // Slide shape - rounded with warm glow
  slideShape: {
    type: "rounded",
    borderRadius: "12px",
    shadow: "deep",
  },

  // Card/Box styling (used for slide backgrounds)
  cardBox: {
    background: "#2d201a",
    borderColor: "#5a3d30",
    titleColor: "#ffffff",
    bodyColor: "#f5ebe6",
    accentColor: "#f97316",
    shadow: "none",
    hoverBackground: "#3a2a22",
    hoverBorderColor: "#6b4535",
  },

  // Layout element colors (for cards, boxes, steps inside slides)
  layoutElements: {
    background: "#352820",
    borderColor: "#5a3d30",
    hoverBackground: "#3f3028",
  },

  // Gradients - Warm ember-inspired gradients
  gradients: {
    primary: "linear-gradient(135deg, #f97316 0%, #ef4444 50%, #fbbf24 100%)",
    secondary: "linear-gradient(135deg, #2d201a 0%, #3a2a22 50%, #2d201a 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(26, 18, 16, 0.95) 100%)",
    text: "linear-gradient(135deg, #f97316 0%, #fbbf24 100%)",
  },

  // Preview colors for theme selector
  preview: {
    titleBg: "#2d201a",
    bodyBg: "#241a16",
    textColor: "#f5ebe6",
    accentColor: "#f97316",
  },

  // No background image - using gradient
  backgroundImage: undefined,
  previewBackgroundImage: undefined,
  backgroundPosition: "center",
  backgroundSize: "cover",

  // Overlay for text readability
  overlay: "rgba(26, 18, 16, 0.85)",

  // Page background - warm ember gradient with glowing spots
  pageBackground: "radial-gradient(ellipse at 15% 85%, rgba(249, 115, 22, 0.15) 0%, transparent 40%), radial-gradient(ellipse at 85% 15%, rgba(239, 68, 68, 0.1) 0%, transparent 35%), radial-gradient(ellipse at 50% 50%, rgba(251, 191, 36, 0.08) 0%, transparent 45%), radial-gradient(ellipse at 75% 75%, rgba(249, 115, 22, 0.06) 0%, transparent 30%), linear-gradient(180deg, #1a1210 0%, #241a16 30%, #1a1210 70%, #150f0d 100%)",

  // CSS variable overrides
  cssVariables: {
    "--ember-glow-orange": "0 0 30px rgba(249, 115, 22, 0.4)",
    "--ember-glow-red": "0 0 25px rgba(239, 68, 68, 0.3)",
    "--ember-glow-gold": "0 0 20px rgba(251, 191, 36, 0.35)",
  },
};

export default emberTheme;
