import type { Theme } from "./types";

// Theme 8: Cyber Neon - Futuristic cyberpunk theme with electric neon colors
export const cyberNeon: Theme = {
  id: "cyber-neon",
  name: "Cyber Neon",
  description:
    "A futuristic cyberpunk theme with electric blue, neon pink, and lime accents, glitch frames, and holographic effects",
  category: "bold",
  colors: {
    background: "#0a0a0f",
    backgroundAlt: "#0f0f18",
    surface: "#151520",
    text: "#e0f0ff",
    textMuted: "#80d4ff",
    heading: "#ffffff",
    link: "#00ffff",
    linkHover: "#80ffff",
    primary: "#00ffff",
    primaryHover: "#80ffff",
    secondary: "#ff00ff",
    secondaryHover: "#ff80ff",
    accent: "#adff2f",
    border: "#1a1a2e",
    borderHover: "#2a2a4e",
    shadow: "rgba(10, 10, 15, 0.9)",
    success: "#00ff88",
    warning: "#ffff00",
    error: "#ff0055",
  },
  fonts: {
    heading: {
      family: "'Inter', sans-serif",
      weight: 700,
      letterSpacing: "-0.01em",
    },
    body: { family: "'Inter', sans-serif", weight: 400, lineHeight: "1.7" },
    caption: { family: "'Inter', sans-serif", weight: 500, size: "0.875rem" },
  },
  design: {
    borderRadius: {
      small: "0.25rem",
      medium: "0.5rem",
      large: "1rem",
      full: "9999px",
    },
    shadows: {
      small: "0 0 15px rgba(0, 255, 255, 0.3)",
      medium: "0 0 30px rgba(0, 255, 255, 0.4)",
      large: "0 0 50px rgba(0, 255, 255, 0.5)",
    },
    spacing: { tight: "0.5rem", normal: "1.25rem", relaxed: "2rem" },
  },
  slideStyles: {
    title: {
      background:
        "linear-gradient(135deg, #0a0a0f 0%, #0f0f18 40%, #151520 100%)",
      pattern:
        "radial-gradient(ellipse at 20% 80%, rgba(0, 255, 255, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(255, 0, 255, 0.12) 0%, transparent 45%), radial-gradient(ellipse at 50% 50%, rgba(173, 255, 47, 0.08) 0%, transparent 60%)",
    },
    content: {
      background: "linear-gradient(180deg, #0a0a0f 0%, #0f0f18 100%)",
      bulletStyle: "square",
    },
    image: {
      borderRadius: "0.5rem",
      shadow: "0 0 40px rgba(0, 255, 255, 0.4)",
      overlay:
        "linear-gradient(to top, rgba(10, 10, 15, 0.95) 0%, transparent 60%)",
    },
  },
  preview: {
    titleBg: "linear-gradient(135deg, #0f0f18 0%, #1a1a2e 100%)",
    bodyBg: "#0a0a0f",
    textColor: "#e0f0ff",
    accentColor: "#00ffff",
  },
  overlay:
    "linear-gradient(180deg, rgba(10, 10, 15, 0.4) 0%, rgba(10, 10, 15, 0.2) 100%)",
  cardBox: {
    background: "rgba(21, 21, 32, 0.9)",
    borderColor: "rgba(0, 255, 255, 0.4)",
    titleColor: "#ffffff",
    bodyColor: "#e0f0ff",
    accentColor: "#00ffff",
    shadow: "0 0 30px rgba(0, 255, 255, 0.3)",
  },
};
