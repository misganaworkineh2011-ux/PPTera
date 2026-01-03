/**
 * Nebula Theme
 * A stunning cosmic theme with deep space colors, vibrant nebula gradients,
 * and a sense of infinite wonder. Perfect for tech, innovation, and creative presentations.
 */

import type { Theme } from "./types";
import { getSlideBackgroundUrl, getThemePreviewUrl } from "./cloudinary";

// Theme ID - this determines the Cloudinary folder: pptmaster/themes/nebula/
const THEME_ID = "nebula";

export const nebulaTheme: Theme = {
  // Identity
  id: THEME_ID,
  name: "Nebula",
  description: "A cosmic journey through deep space with vibrant nebula colors and stellar accents",
  category: "dark",

  // Core color tokens
  colors: {
    // Backgrounds - Deep space colors
    background: "#0a0a1a",
    backgroundAlt: "#12122a",
    surface: "#1a1a35",
    surfaceHover: "#252550",

    // Text - Bright and readable against dark backgrounds
    text: "#e8e8f0",
    textMuted: "#9898b8",
    textInverse: "#0a0a1a",
    heading: "#ffffff",

    // Brand - Vibrant cosmic colors
    primary: "#8b5cf6",      // Vibrant purple
    primaryHover: "#a78bfa",
    secondary: "#06b6d4",    // Cyan
    secondaryHover: "#22d3ee",
    accent: "#f472b6",       // Pink nebula

    // Borders
    border: "#2a2a50",
    borderStrong: "#4040a0",
    borderHover: "#6060c0",

    // Effects
    shadow: "rgba(139, 92, 246, 0.2)",
    overlay: "rgba(10, 10, 26, 0.8)",
    glow: "rgba(139, 92, 246, 0.5)",

    // Links
    link: "#a78bfa",
    linkHover: "#c4b5fd",

    // Status
    success: "#34d399",
    warning: "#fbbf24",
    error: "#f87171",
  },

  // Font configuration
  fonts: {
    heading: {
      family: "'Space Grotesk', sans-serif",
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
      "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap",
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
      small: "0 2px 8px rgba(139, 92, 246, 0.15)",
      medium: "0 8px 24px rgba(139, 92, 246, 0.2)",
      large: "0 16px 48px rgba(139, 92, 246, 0.25)",
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
      background: "linear-gradient(135deg, #1a1a35 0%, #2a1a45 50%, #1a2a45 100%)",
      pattern: "radial-gradient(ellipse at 30% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)",
    },
    content: {
      background: "#12122a",
      bulletStyle: "circle",
    },
    image: {
      borderRadius: "1rem",
      shadow: "0 12px 40px rgba(139, 92, 246, 0.3)",
      overlay: "linear-gradient(to top, rgba(10, 10, 26, 0.7), transparent)",
    },
  },

  // Card/Box styling (used for slide backgrounds)
  cardBox: {
    background: "#1a1a35",
    borderColor: "#3a3a70",
    titleColor: "#ffffff",
    bodyColor: "#e8e8f0",
    accentColor: "#8b5cf6",
    shadow: "none", // No glow/shadow on slide cards
    hoverBackground: "#252550",
    hoverBorderColor: "#5050a0",
  },

  // Layout element colors (for cards, boxes, steps inside slides)
  layoutElements: {
    background: "#1e1e40",
    borderColor: "#4040a0",
    hoverBackground: "#282860",
  },

  // Gradients - Stunning nebula-inspired gradients
  gradients: {
    primary: "linear-gradient(135deg, #8b5cf6 0%, #06b6d4 50%, #f472b6 100%)",
    secondary: "linear-gradient(135deg, #1a1a35 0%, #2a1a55 50%, #1a3a55 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(10, 10, 26, 0.9) 100%)",
    text: "linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)",
  },

  // Preview colors for theme selector
  preview: {
    titleBg: "#1a1a35",
    bodyBg: "#12122a",
    textColor: "#e8e8f0",
    accentColor: "#8b5cf6",
  },

  // Background image from Cloudinary (auto-detected from theme ID)
  // Note: Upload a background image to pptmaster/themes/nebula/background in Cloudinary
  // For now, we use the gradient as the primary background
  backgroundImage: undefined, // getSlideBackgroundUrl(THEME_ID), - enable when image is uploaded
  previewBackgroundImage: undefined, // getThemePreviewUrl(THEME_ID), - enable when image is uploaded
  backgroundPosition: "center",
  backgroundSize: "cover",

  // Overlay for text readability on background
  overlay: "rgba(10, 10, 26, 0.75)",

  // Page background - cosmic gradient with nebula colors (gradient, not solid)
  pageBackground: "radial-gradient(ellipse at 20% 0%, rgba(139, 92, 246, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(6, 182, 212, 0.1) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(244, 114, 182, 0.05) 0%, transparent 70%), linear-gradient(180deg, #0a0a1a 0%, #12122a 50%, #0a0a1a 100%)",

  // CSS variable overrides for special effects
  cssVariables: {
    "--nebula-glow": "0 0 40px rgba(139, 92, 246, 0.4)",
    "--nebula-border-glow": "0 0 20px rgba(139, 92, 246, 0.3)",
  },
};

export default nebulaTheme;
