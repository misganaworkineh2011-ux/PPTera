/**
 * Obsidian Theme
 * A sleek, dark volcanic glass theme with deep blacks, subtle purple undertones,
 * and sharp, polished aesthetics. Perfect for professional and tech presentations.
 */

import type { Theme } from "./types";

// Theme ID - this determines the Cloudinary folder: pptmaster/themes/obsidian/
const THEME_ID = "obsidian";

export const obsidianTheme: Theme = {
  // Identity
  id: THEME_ID,
  name: "Obsidian",
  description: "A sleek volcanic glass theme with deep blacks and polished aesthetics",
  category: "dark",

  // Core color tokens
  colors: {
    // Backgrounds - Deep obsidian blacks with subtle warmth
    background: "#0c0c0e",
    backgroundAlt: "#141418",
    surface: "#1c1c22",
    surfaceHover: "#26262e",

    // Text - Clean whites and grays for readability
    text: "#e4e4e8",
    textMuted: "#9898a0",
    textInverse: "#0c0c0e",
    heading: "#ffffff",

    // Brand - Violet and rose accents
    primary: "#a855f7",      // Bright violet
    primaryHover: "#c084fc",
    secondary: "#f43f5e",    // Rose
    secondaryHover: "#fb7185",
    accent: "#22d3ee",       // Cyan accent

    // Borders
    border: "#2a2a32",
    borderStrong: "#3a3a44",
    borderHover: "#4a4a56",

    // Effects
    shadow: "rgba(0, 0, 0, 0.6)",
    overlay: "rgba(12, 12, 14, 0.85)",
    glow: "rgba(168, 85, 247, 0.4)",

    // Links
    link: "#a855f7",
    linkHover: "#c084fc",

    // Status
    success: "#22c55e",
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
      lineHeight: "1.65",
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
      "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap",
    ],
  },

  // Design tokens
  design: {
    borderRadius: {
      small: "0.375rem",
      medium: "0.625rem",
      large: "1rem",
      full: "9999px",
    },
    shadows: {
      small: "0 2px 6px rgba(0, 0, 0, 0.4)",
      medium: "0 6px 20px rgba(0, 0, 0, 0.5)",
      large: "0 16px 40px rgba(0, 0, 0, 0.6)",
    },
    spacing: {
      tight: "0.625rem",
      normal: "1.25rem",
      relaxed: "2rem",
    },
  },

  // Slide-specific styles
  slideStyles: {
    title: {
      background: "linear-gradient(145deg, #0c0c0e 0%, #1c1c22 50%, #141418 100%)",
      pattern: "radial-gradient(ellipse at 20% 30%, rgba(168, 85, 247, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(244, 63, 94, 0.06) 0%, transparent 50%)",
    },
    content: {
      background: "#0c0c0e",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "0.625rem",
      shadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
      overlay: "linear-gradient(to top, rgba(12, 12, 14, 0.6), transparent)",
    },
  },

  // Card/Box styling (used for slide backgrounds)
  cardBox: {
    background: "#1c1c22",
    borderColor: "#3a3a44",
    titleColor: "#ffffff",
    bodyColor: "#e4e4e8",
    accentColor: "#a855f7",
    shadow: "0 4px 16px rgba(0, 0, 0, 0.4)",
    hoverBackground: "#26262e",
    hoverBorderColor: "#4a4a56",
  },

  // Layout element colors (for cards, boxes, steps inside slides)
  layoutElements: {
    background: "#1c1c22",
    borderColor: "#3a3a44",
    hoverBackground: "#26262e",
  },

  // Gradients
  gradients: {
    primary: "linear-gradient(135deg, #a855f7 0%, #f43f5e 100%)",
    secondary: "linear-gradient(135deg, #1c1c22 0%, #26262e 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(12, 12, 14, 0.9) 100%)",
    text: "linear-gradient(135deg, #a855f7 0%, #22d3ee 100%)",
  },

  // Preview colors for theme selector
  preview: {
    titleBg: "#1c1c22",
    bodyBg: "#0c0c0e",
    textColor: "#e4e4e8",
    accentColor: "#a855f7",
  },

  // No background image - pure dark aesthetic
  backgroundImage: undefined,
  previewBackgroundImage: undefined,
  backgroundPosition: "center",
  backgroundSize: "cover",

  // Overlay for text readability
  overlay: "rgba(12, 12, 14, 0.8)",

  // Page background - subtle gradient with violet undertones
  pageBackground: "radial-gradient(ellipse at 30% 20%, rgba(168, 85, 247, 0.06) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(244, 63, 94, 0.04) 0%, transparent 50%), linear-gradient(180deg, #0c0c0e 0%, #141418 50%, #0c0c0e 100%)",

  // CSS variable overrides
  cssVariables: {
    "--obsidian-glow": "0 0 30px rgba(168, 85, 247, 0.3)",
    "--obsidian-border-glow": "0 0 15px rgba(168, 85, 247, 0.2)",
  },
};

export default obsidianTheme;
