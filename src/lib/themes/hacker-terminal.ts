/**
 * Hacker Terminal Theme
 * Inspired by classic terminal interfaces and hacker aesthetics - featuring matrix greens,
 * dark backgrounds, and monospace typography. Perfect for tech, developer, and cybersecurity presentations.
 */

import type { Theme } from "./types";

const THEME_ID = "hacker-terminal";

export const hackerTerminalTheme: Theme = {
  id: THEME_ID,
  name: "Hacker Terminal",
  description: "Classic terminal-inspired theme with matrix greens and monospace aesthetics",
  category: "dark",

  colors: {
    background: "#0a0a0a",
    backgroundAlt: "#111111",
    surface: "#1a1a1a",
    surfaceHover: "#222222",

    text: "#00ff00",
    textMuted: "#00aa00",
    textInverse: "#0a0a0a",
    heading: "#00ff00",

    primary: "#00ff00",
    primaryHover: "#33ff33",
    secondary: "#00cc00",
    secondaryHover: "#00ee00",
    accent: "#ffff00",

    border: "#003300",
    borderStrong: "#004400",
    borderHover: "#005500",

    shadow: "rgba(0, 255, 0, 0.15)",
    overlay: "rgba(10, 10, 10, 0.92)",
    glow: "rgba(0, 255, 0, 0.5)",

    link: "#33ff33",
    linkHover: "#66ff66",

    success: "#00ff00",
    warning: "#ffff00",
    error: "#ff3333",
  },

  fonts: {
    heading: {
      family: "'Share Tech Mono', monospace",
      weight: 400,
      letterSpacing: "0.05em",
    },
    body: {
      family: "'Share Tech Mono', monospace",
      weight: 400,
      lineHeight: "1.8",
    },
    caption: {
      family: "'Share Tech Mono', monospace",
      weight: 400,
      size: "0.875rem",
    },
    mono: {
      family: "'Share Tech Mono', monospace",
    },
    googleFontsUrls: [
      "https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap",
    ],
  },

  design: {
    borderRadius: {
      small: "0",
      medium: "0",
      large: "0",
      full: "0",
    },
    shadows: {
      small: "0 0 10px rgba(0, 255, 0, 0.2)",
      medium: "0 0 20px rgba(0, 255, 0, 0.25)",
      large: "0 0 40px rgba(0, 255, 0, 0.3)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "#0a0a0a",
      pattern: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 0, 0.03) 2px, rgba(0, 255, 0, 0.03) 4px)",
    },
    content: {
      background: "#111111",
      bulletStyle: "arrow",
    },
    image: {
      borderRadius: "0",
      shadow: "0 0 30px rgba(0, 255, 0, 0.3)",
      overlay: "linear-gradient(to top, rgba(10, 10, 10, 0.9), transparent)",
    },
  },

  // Slide shape - sharp terminal edges
  slideShape: {
    type: "sharp",
    borderRadius: "0px",
    shadow: "none",
    border: {
      width: "1px",
      color: "#003300",
      style: "solid",
    },
  },

  cardBox: {
    background: "#1a1a1a",
    borderColor: "#003300",
    titleColor: "#00ff00",
    bodyColor: "#00dd00",
    accentColor: "#00ff00",
    shadow: "0 0 15px rgba(0, 255, 0, 0.15)",
    hoverBackground: "#222222",
    hoverBorderColor: "#004400",
  },

  layoutElements: {
    background: "#151515",
    borderColor: "#003300",
    hoverBackground: "#1d1d1d",
  },

  gradients: {
    primary: "linear-gradient(135deg, #00ff00 0%, #00cc00 100%)",
    secondary: "linear-gradient(135deg, #1a1a1a 0%, #222222 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(10, 10, 10, 0.98) 100%)",
    text: "linear-gradient(135deg, #00ff00 0%, #33ff33 100%)",
  },

  preview: {
    titleBg: "#1a1a1a",
    bodyBg: "#111111",
    textColor: "#00ff00",
    accentColor: "#00ff00",
  },

  backgroundImage: undefined,
  previewBackgroundImage: undefined,
  backgroundPosition: "center",
  backgroundSize: "cover",
  overlay: "rgba(10, 10, 10, 0.9)",

  pageBackground: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 0, 0.02) 2px, rgba(0, 255, 0, 0.02) 4px), radial-gradient(ellipse at 50% 50%, rgba(0, 255, 0, 0.05) 0%, transparent 70%), linear-gradient(180deg, #0a0a0a 0%, #0d0d0d 50%, #0a0a0a 100%)",

  cssVariables: {
    "--terminal-glow": "0 0 20px rgba(0, 255, 0, 0.4)",
    "--terminal-scanline": "rgba(0, 255, 0, 0.03)",
    "--terminal-cursor": "#00ff00",
  },
};

export default hackerTerminalTheme;
