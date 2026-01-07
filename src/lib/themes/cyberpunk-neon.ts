/**
 * Cyberpunk Neon Theme
 * Inspired by futuristic cyberpunk aesthetics - featuring neon pinks, electric blues,
 * and vibrant purples. Perfect for gaming, tech, and futuristic presentations.
 */

import type { Theme } from "./types";

const THEME_ID = "cyberpunk-neon";

export const cyberpunkNeonTheme: Theme = {
  id: THEME_ID,
  name: "Cyberpunk Neon",
  description: "Futuristic cyberpunk theme with neon pinks, electric blues, and vibrant glows",
  category: "dark",

  colors: {
    background: "#0f0f1a",
    backgroundAlt: "#151525",
    surface: "#1a1a2e",
    surfaceHover: "#252540",

    text: "#f0e6ff",
    textMuted: "#b8a8d4",
    textInverse: "#0f0f1a",
    heading: "#ffffff",

    primary: "#ff00ff",
    primaryHover: "#ff44ff",
    secondary: "#00ffff",
    secondaryHover: "#44ffff",
    accent: "#ffff00",

    border: "#3d2066",
    borderStrong: "#5a3399",
    borderHover: "#7744cc",

    shadow: "rgba(255, 0, 255, 0.2)",
    overlay: "rgba(15, 15, 26, 0.9)",
    glow: "rgba(255, 0, 255, 0.5)",

    link: "#ff44ff",
    linkHover: "#ff88ff",

    success: "#00ff88",
    warning: "#ffff00",
    error: "#ff4444",
  },

  fonts: {
    heading: {
      family: "'Orbitron', sans-serif",
      weight: 700,
      letterSpacing: "0.05em",
    },
    body: {
      family: "'Rajdhani', sans-serif",
      weight: 500,
      lineHeight: "1.7",
    },
    caption: {
      family: "'Rajdhani', sans-serif",
      weight: 600,
      size: "0.875rem",
    },
    mono: {
      family: "'JetBrains Mono', monospace",
    },
    googleFontsUrls: [
      "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&family=Rajdhani:wght@400;500;600;700&display=swap",
    ],
  },

  design: {
    borderRadius: {
      small: "0.25rem",
      medium: "0.5rem",
      large: "1rem",
      full: "9999px",
    },
    shadows: {
      small: "0 0 15px rgba(255, 0, 255, 0.2), 0 0 15px rgba(0, 255, 255, 0.1)",
      medium: "0 0 30px rgba(255, 0, 255, 0.25), 0 0 30px rgba(0, 255, 255, 0.15)",
      large: "0 0 50px rgba(255, 0, 255, 0.3), 0 0 50px rgba(0, 255, 255, 0.2)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #151525 100%)",
      pattern: "radial-gradient(ellipse at 20% 80%, rgba(255, 0, 255, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(0, 255, 255, 0.12) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(255, 255, 0, 0.05) 0%, transparent 40%)",
    },
    content: {
      background: "#151525",
      bulletStyle: "square",
    },
    image: {
      borderRadius: "0.5rem",
      shadow: "0 0 40px rgba(255, 0, 255, 0.3), 0 0 40px rgba(0, 255, 255, 0.2)",
      overlay: "linear-gradient(to top, rgba(15, 15, 26, 0.9), transparent)",
    },
  },

  // Slide shape - sharp with neon glow
  slideShape: {
    type: "sharp",
    borderRadius: "4px",
    shadow: "deep",
  },

  cardBox: {
    background: "#1a1a2e",
    borderColor: "#5a3399",
    titleColor: "#ffffff",
    bodyColor: "#f0e6ff",
    accentColor: "#ff00ff",
    shadow: "0 0 20px rgba(255, 0, 255, 0.15)",
    hoverBackground: "#252540",
    hoverBorderColor: "#7744cc",
  },

  layoutElements: {
    background: "#1f1f35",
    borderColor: "#5a3399",
    hoverBackground: "#2a2a48",
  },

  gradients: {
    primary: "linear-gradient(135deg, #ff00ff 0%, #00ffff 100%)",
    secondary: "linear-gradient(135deg, #1a1a2e 0%, #252540 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(15, 15, 26, 0.98) 100%)",
    text: "linear-gradient(135deg, #ff00ff 0%, #00ffff 100%)",
  },

  preview: {
    titleBg: "#1a1a2e",
    bodyBg: "#151525",
    textColor: "#f0e6ff",
    accentColor: "#ff00ff",
  },

  backgroundImage: undefined,
  previewBackgroundImage: undefined,
  backgroundPosition: "center",
  backgroundSize: "cover",
  overlay: "rgba(15, 15, 26, 0.88)",

  pageBackground: "radial-gradient(ellipse at 10% 90%, rgba(255, 0, 255, 0.2) 0%, transparent 45%), radial-gradient(ellipse at 90% 10%, rgba(0, 255, 255, 0.15) 0%, transparent 45%), radial-gradient(ellipse at 50% 50%, rgba(255, 255, 0, 0.05) 0%, transparent 50%), linear-gradient(180deg, #0f0f1a 0%, #151525 40%, #0f0f1a 100%)",

  cssVariables: {
    "--cyber-glow-pink": "0 0 30px rgba(255, 0, 255, 0.5)",
    "--cyber-glow-cyan": "0 0 30px rgba(0, 255, 255, 0.5)",
    "--cyber-glow-yellow": "0 0 20px rgba(255, 255, 0, 0.4)",
  },
};

export default cyberpunkNeonTheme;
