/**
 * Obsidian Theme
 * A sleek, dark, and modern theme with high contrast and neon accents
 */

import type { Theme } from "./types";

// Theme ID - this determines the Cloudinary folder: pptmaster/themes/obsidian/
const THEME_ID = "obsidian";

export const obsidianTheme: Theme = {
  // Identity
  id: THEME_ID,
  name: "Obsidian",
  description: "A sleek, dark, and modern theme with high contrast and neon accents",
  category: "modern",

  // Core color tokens
  colors: {
    // Backgrounds
    background: "#0a0a0a",
    backgroundAlt: "#121212",
    surface: "#1e1e1e",
    surfaceHover: "#2a2a2a",

    // Text
    text: "#e0e0e0",
    textMuted: "#a0a0a0",
    textInverse: "#0a0a0a",
    heading: "#ffffff",

    // Brand
    primary: "#8b5cf6", // Violet
    primaryHover: "#7c3aed",
    secondary: "#ec4899", // Pink
    secondaryHover: "#db2777",
    accent: "#06b6d4", // Cyan

    // Borders
    border: "#333333",
    borderStrong: "#444444",
    borderHover: "#666666",

    // Effects
    shadow: "rgba(0, 0, 0, 0.5)",
    overlay: "rgba(0, 0, 0, 0.7)",
    glow: "rgba(139, 92, 246, 0.5)",

    // Links
    link: "#8b5cf6",
    linkHover: "#7c3aed",

    // Status
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
  },

  // Font configuration
  fonts: {
    heading: {
      family: "'Montserrat', sans-serif",
      weight: 700,
      letterSpacing: "-0.02em",
    },
    body: {
      family: "'Inter', sans-serif",
      weight: 400,
      lineHeight: "1.6",
    },
    caption: {
      family: "'Inter', sans-serif",
      weight: 500,
      size: "0.875rem",
    },
    mono: {
      family: "'Fira Code', monospace",
    },
    googleFontsUrls: [
      "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Inter:wght@400;500;600&display=swap",
    ],
  },

  // Design tokens
  design: {
    borderRadius: {
      small: "0.25rem",
      medium: "0.5rem",
      large: "0.75rem",
      full: "9999px",
    },
    shadows: {
      small: "0 1px 3px rgba(0, 0, 0, 0.3)",
      medium: "0 4px 12px rgba(0, 0, 0, 0.5)",
      large: "0 12px 32px rgba(0, 0, 0, 0.7)",
    },
    spacing: {
      tight: "0.5rem",
      normal: "1rem",
      relaxed: "1.5rem",
    },
  },

  // Slide specific styles
  slides: {
    title: {
      background: "linear-gradient(135deg, #0a0a0a 0%, #1e1e1e 100%)",
      titleColor: "#ffffff",
      subtitleColor: "#a0a0a0",
      accentColor: "#8b5cf6",
    },
    content: {
      background: "#0a0a0a",
      titleColor: "#ffffff",
      bodyColor: "#e0e0e0",
      accentColor: "#ec4899",
    },
    section: {
      background: "#1e1e1e",
      titleColor: "#ffffff",
      accentColor: "#06b6d4",
    },
  },
};
