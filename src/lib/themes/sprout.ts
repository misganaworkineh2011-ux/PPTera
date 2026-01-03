/**
 * Sprout Theme
 * A fresh, nature-inspired theme with green accents and clean aesthetics
 */

import type { Theme } from "./types";
import { getSlideBackgroundUrl, getThemePreviewUrl } from "./cloudinary";

// Theme ID - this determines the Cloudinary folder: pptmaster/themes/sprout/
const THEME_ID = "sprout";

// Background image is automatically loaded from: pptmaster/themes/sprout/background
// Just rename your image to "background" in Cloudinary

export const sproutTheme: Theme = {
  // Identity
  id: THEME_ID,
  name: "Sprout",
  description: "A fresh, nature-inspired theme with vibrant greens and organic feel",
  category: "creative",

  // Core color tokens
  colors: {
    // Backgrounds
    background: "#f8faf8",
    backgroundAlt: "#f2f7f2",
    surface: "#ffffff",
    surfaceHover: "#f0f5f0",

    // Text
    text: "#2d3b2d",
    textMuted: "#5a6b5a",
    textInverse: "#ffffff",
    heading: "#1a2e1a",

    // Brand
    primary: "#3caa3c",
    primaryHover: "#2c8c2c",
    secondary: "#60c860",
    secondaryHover: "#4db84d",
    accent: "#96e096",

    // Borders
    border: "#d4e5d4",
    borderStrong: "#a8c8a8",
    borderHover: "#8cb88c",

    // Effects
    shadow: "rgba(45, 59, 45, 0.1)",
    overlay: "rgba(26, 46, 26, 0.5)",
    glow: "rgba(60, 170, 60, 0.4)",

    // Links
    link: "#2c8c2c",
    linkHover: "#266d28",

    // Status
    success: "#3caa3c",
    warning: "#f4b603",
    error: "#ef4444",
  },

  // Font configuration
  // Noto Serif SC for headings/titles, Geist for body/bullets/subtitles
  fonts: {
    heading: {
      family: "'Noto Serif SC', serif",
      weight: 700,
      letterSpacing: "-0.01em",
    },
    body: {
      family: "'Geist', var(--font-geist-sans), sans-serif",
      weight: 400,
      lineHeight: "1.6",
    },
    caption: {
      family: "'Geist', var(--font-geist-sans), sans-serif",
      weight: 500,
      size: "0.875rem",
    },
    mono: {
      family: "'Geist Mono', monospace",
    },
    // Google Fonts loaded in layout.tsx (Noto Serif SC)
    // Geist is already loaded via next/font
    googleFontsUrls: [],
  },

  // Design tokens
  design: {
    borderRadius: {
      small: "0.375rem",
      medium: "0.75rem",
      large: "1rem",
      full: "9999px",
    },
    shadows: {
      small: "0 1px 3px rgba(45, 59, 45, 0.08)",
      medium: "0 4px 12px rgba(45, 59, 45, 0.12)",
      large: "0 12px 32px rgba(45, 59, 45, 0.16)",
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
      background: "linear-gradient(135deg, #e8f5e8 0%, #d4ecd4 100%)",
      pattern: "radial-gradient(circle at 20% 80%, rgba(60, 170, 60, 0.08) 0%, transparent 50%)",
    },
    content: {
      background: "#ffffff",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "0.75rem",
      shadow: "0 8px 24px rgba(45, 59, 45, 0.15)",
      overlay: "linear-gradient(to top, rgba(26, 46, 26, 0.4), transparent)",
    },
  },

  // Card/Box styling (used for slide backgrounds)
  cardBox: {
    background: "#d4ecd4",        // Soft green - slide background color
    borderColor: "#a8c8a8",       // Medium green border
    titleColor: "#0d5c4a",        // Dark teal green (like the preview)
    bodyColor: "#2d3b2d",         // Body text color
    accentColor: "#0d5c4a",       // Link/accent color (same as title)
    shadow: "0 4px 12px rgba(45, 59, 45, 0.15)",
    hoverBackground: "#c4eec4",
    hoverBorderColor: "#8cb88c",
  },

  // Layout element colors (for cards, boxes, steps inside slides)
  // These need good contrast against the slide background (#d4ecd4)
  layoutElements: {
    background: "#ffffff",        // White background for cards/boxes - good contrast
    borderColor: "#8cb88c",       // Stronger green border for visibility
    hoverBackground: "#f5faf5",   // Slightly off-white on hover
  },

  // Gradients
  gradients: {
    primary: "linear-gradient(135deg, #3caa3c 0%, #60c860 100%)",
    secondary: "linear-gradient(135deg, #e8f5e8 0%, #c4eec4 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(26, 46, 26, 0.6) 100%)",
    text: "linear-gradient(135deg, #1a2e1a 0%, #3caa3c 100%)",
  },

  // Preview colors for theme selector
  preview: {
    titleBg: "#e8f5e8",
    bodyBg: "#ffffff",
    textColor: "#2d3b2d",
    accentColor: "#3caa3c",
  },

  // Background image from Cloudinary (auto-detected from theme ID)
  // Path: pptmaster/themes/sprout/background
  backgroundImage: getSlideBackgroundUrl(THEME_ID),
  previewBackgroundImage: getThemePreviewUrl(THEME_ID),
  backgroundPosition: "center",  // Options: "center", "top", "bottom", "left", "right", or "50% 30%"
  backgroundSize: "cover",       // Options: "cover", "contain", "100% auto"

  // Overlay for text readability on background
  overlay: "rgba(248, 250, 248, 0.85)",

  // Page background color (fallback)
  pageBackground: "#f8faf8",
};

export default sproutTheme;
