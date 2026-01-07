/**
 * Corporate Clean Theme
 * A stunning, professional white theme with subtle gradient backgrounds
 * Uses Playfair Display for elegant headings and Source Sans 3 for clean body text
 * Perfect for business presentations, reports, and professional settings
 */

import type { Theme } from "./types";

const THEME_ID = "corporate-clean";

export const corporateCleanTheme: Theme = {
  // Identity
  id: THEME_ID,
  name: "Corporate Clean",
  description: "An elegant, professional theme with subtle gradients and refined typography",
  category: "professional",

  // Core color tokens - Clean white/blue professional palette
  colors: {
    // Backgrounds - subtle warm white tones
    background: "#fafafa",
    backgroundAlt: "#f5f5f7",
    surface: "#ffffff",
    surfaceHover: "#f0f0f2",

    // Text - rich, readable dark tones
    text: "#1a1a2e",
    textMuted: "#6b7280",
    textInverse: "#ffffff",
    heading: "#0d0d1a",

    // Brand - Sophisticated indigo-blue
    primary: "#4f46e5",
    primaryHover: "#4338ca",
    secondary: "#6366f1",
    secondaryHover: "#4f46e5",
    accent: "#818cf8",

    // Borders - subtle and refined
    border: "#e5e5ea",
    borderStrong: "#d1d1d6",
    borderHover: "#a1a1aa",

    // Effects
    shadow: "rgba(0, 0, 0, 0.06)",
    overlay: "rgba(13, 13, 26, 0.5)",
    glow: "rgba(79, 70, 229, 0.25)",

    // Links
    link: "#4f46e5",
    linkHover: "#4338ca",

    // Status
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
  },

  // Font configuration
  // Playfair Display for elegant, authoritative headings
  // Source Sans 3 for clean, highly readable body text
  fonts: {
    heading: {
      family: "'Playfair Display', Georgia, serif",
      weight: 700,
      letterSpacing: "-0.02em",
    },
    body: {
      family: "'Source Sans 3', 'Segoe UI', system-ui, sans-serif",
      weight: 400,
      lineHeight: "1.7",
    },
    caption: {
      family: "'Source Sans 3', 'Segoe UI', system-ui, sans-serif",
      weight: 500,
      size: "0.875rem",
    },
    mono: {
      family: "'JetBrains Mono', 'Fira Code', monospace",
    },
    googleFontsUrls: [
      "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Source+Sans+3:wght@300;400;500;600;700&display=swap",
    ],
  },

  // Design tokens
  design: {
    borderRadius: {
      small: "0.5rem",
      medium: "0.75rem",
      large: "1rem",
      full: "9999px",
    },
    shadows: {
      small: "0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)",
      medium: "0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -2px rgba(0, 0, 0, 0.04)",
      large: "0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
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
      background: "linear-gradient(135deg, #ffffff 0%, #f8f9ff 50%, #f0f1ff 100%)",
      pattern: "radial-gradient(circle at 80% 20%, rgba(79, 70, 229, 0.03) 0%, transparent 50%)",
    },
    content: {
      background: "linear-gradient(180deg, #ffffff 0%, #fafafa 100%)",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "0.75rem",
      shadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
      overlay: "linear-gradient(to top, rgba(13, 13, 26, 0.25), transparent)",
    },
  },

  // Slide shape styling - sharp edges for corporate look
  slideShape: {
    type: "sharp",
    borderRadius: "0px",
    shadow: "subtle",
  },

  // Card/Box styling (used for slide backgrounds)
  cardBox: {
    background: "#f8f9fc",           // Soft blue-white - slide background color
    borderColor: "#e5e7eb",          // Light gray border
    titleColor: "#0d0d1a",           // Near-black for titles
    bodyColor: "#4b5563",            // Gray for body text
    accentColor: "#4f46e5",          // Indigo accent
    shadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
    hoverBackground: "#f0f1f5",
    hoverBorderColor: "#d1d5db",
  },

  // Layout element colors (for cards, boxes, steps inside slides)
  // These need good contrast against the slide background (#f8f9fc)
  layoutElements: {
    background: "#ffffff",           // White background for cards/boxes - good contrast
    borderColor: "#d1d5db",          // Stronger gray border for visibility
    hoverBackground: "#f9fafb",      // Slightly off-white on hover
  },

  // Gradients
  gradients: {
    primary: "linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #818cf8 100%)",
    secondary: "linear-gradient(135deg, #fafafa 0%, #f5f5f7 50%, #efefef 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(13, 13, 26, 0.35) 100%)",
    text: "linear-gradient(135deg, #0d0d1a 0%, #4f46e5 100%)",
  },

  // Preview colors for theme selector
  preview: {
    titleBg: "#ffffff",
    bodyBg: "#f8f9fc",
    textColor: "#1a1a2e",
    accentColor: "#4f46e5",
  },

  // No background image for clean look
  backgroundImage: undefined,
  previewBackgroundImage: undefined,
  backgroundPosition: "center",
  backgroundSize: "cover",

  // Light overlay
  overlay: "rgba(255, 255, 255, 0.92)",

  // Page background - subtle gradient
  pageBackground: "linear-gradient(180deg, #fafafa 0%, #f5f5f7 50%, #f0f0f2 100%)",
};

export default corporateCleanTheme;
