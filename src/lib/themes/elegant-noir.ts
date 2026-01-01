import type { Theme } from "./types";

// Theme: Elegant Noir - Sophisticated dark theme with amber accents
export const elegantNoir: Theme = {
  id: "elegant-noir",
  name: "Elegant Noir",
  description:
    "A sophisticated dark theme with warm amber accents, perfect for impactful presentations with a premium feel",
  category: "dark",

  colors: {
    background: "#0a0a0a",
    backgroundAlt: "#141414",
    surface: "#1c1c1c",
    surfaceHover: "#262626",
    text: "#e5e5e5",
    textMuted: "#a3a3a3",
    textInverse: "#0a0a0a",
    heading: "#fafafa",
    primary: "#f59e0b",
    primaryHover: "#d97706",
    secondary: "#6366f1",
    secondaryHover: "#4f46e5",
    accent: "#fbbf24",
    border: "#262626",
    borderStrong: "#404040",
    borderHover: "#404040",
    shadow: "rgba(0, 0, 0, 0.5)",
    overlay: "rgba(0, 0, 0, 0.7)",
    glow: "rgba(245, 158, 11, 0.4)",
    link: "#f59e0b",
    linkHover: "#fbbf24",
    success: "#22c55e",
    warning: "#f59e0b",
    error: "#ef4444",
  },

  fonts: {
    heading: {
      family: "'Playfair Display', 'Georgia', serif",
      weight: 700,
      letterSpacing: "-0.02em",
    },
    body: {
      family: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      weight: 400,
      lineHeight: "1.7",
    },
    caption: {
      family: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      weight: 500,
      size: "0.875rem",
    },
    mono: {
      family: "'JetBrains Mono', 'Fira Code', monospace",
    },
  },

  design: {
    borderRadius: {
      small: "0.375rem",
      medium: "0.5rem",
      large: "0.75rem",
      full: "9999px",
    },
    shadows: {
      small: "0 1px 2px rgba(0, 0, 0, 0.3)",
      medium: "0 4px 12px rgba(0, 0, 0, 0.4)",
      large: "0 10px 30px rgba(0, 0, 0, 0.5)",
    },
    spacing: {
      tight: "0.5rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  gradients: {
    primary: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    secondary: "linear-gradient(145deg, #0a0a0a 0%, #1c1c1c 100%)",
    overlay: "linear-gradient(to top, rgba(10, 10, 10, 0.95) 0%, transparent 60%)",
    text: "linear-gradient(135deg, #fafafa 0%, #f59e0b 100%)",
  },

  slideStyles: {
    title: {
      background: "linear-gradient(145deg, #0a0a0a 0%, #141414 50%, #1c1c1c 100%)",
      pattern:
        "radial-gradient(ellipse at 70% 20%, rgba(245, 158, 11, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 30% 80%, rgba(99, 102, 241, 0.05) 0%, transparent 50%)",
    },
    content: {
      background: "linear-gradient(175deg, #0a0a0a 0%, #141414 100%)",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "0.5rem",
      shadow: "0 20px 50px rgba(0, 0, 0, 0.6)",
      overlay: "linear-gradient(to top, rgba(10, 10, 10, 0.9) 0%, transparent 50%)",
    },
  },

  cardBox: {
    background: "rgba(28, 28, 28, 0.8)",
    borderColor: "rgba(245, 158, 11, 0.2)",
    titleColor: "#fafafa",
    bodyColor: "#e5e5e5",
    accentColor: "#f59e0b",
    shadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
    hoverBackground: "rgba(38, 38, 38, 0.9)",
    hoverBorderColor: "rgba(245, 158, 11, 0.4)",
  },

  preview: {
    titleBg: "linear-gradient(145deg, #0a0a0a 0%, #1c1c1c 100%)",
    bodyBg: "#0a0a0a",
    textColor: "#e5e5e5",
    accentColor: "#f59e0b",
  },

  overlay: "linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.1) 100%)",
  pageBackground: "linear-gradient(180deg, #0a0a0a 0%, #141414 100%)",
};
