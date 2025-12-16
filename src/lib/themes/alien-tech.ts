import type { Theme } from "./types";

// Theme 9: Alien Tech - Extraterrestrial sci-fi theme with bioluminescent greens and cosmic blacks
export const alienTech: Theme = {
  id: "alien-tech",
  name: "Alien Tech",
  description:
    "An otherworldly extraterrestrial theme with bioluminescent lime green, deep space blacks, and scanning line effects",
  category: "bold",
  colors: {
    background: "#0a0f0a",
    backgroundAlt: "#0d140d",
    surface: "#121a12",
    text: "#c8f0c8",
    textMuted: "#7cb87c",
    heading: "#ffffff",
    link: "#a3ff00",
    linkHover: "#c8ff4d",
    primary: "#a3ff00",
    primaryHover: "#c8ff4d",
    secondary: "#00ff88",
    secondaryHover: "#4dffaa",
    accent: "#00ffcc",
    border: "#1a2a1a",
    borderHover: "#2a4a2a",
    shadow: "rgba(10, 15, 10, 0.95)",
    success: "#00ff66",
    warning: "#ccff00",
    error: "#ff3366",
  },
  fonts: {
    heading: {
      family: "'Orbitron', 'Inter', sans-serif",
      weight: 700,
      letterSpacing: "0.05em",
    },
    body: { family: "'Inter', sans-serif", weight: 400, lineHeight: "1.7" },
    caption: { family: "'Orbitron', sans-serif", weight: 500, size: "0.875rem" },
  },
  design: {
    borderRadius: {
      small: "0.25rem",
      medium: "0.75rem",
      large: "1.5rem",
      full: "9999px",
    },
    shadows: {
      small: "0 0 20px rgba(163, 255, 0, 0.25)",
      medium: "0 0 40px rgba(163, 255, 0, 0.35)",
      large: "0 0 60px rgba(163, 255, 0, 0.45)",
    },
    spacing: { tight: "0.5rem", normal: "1.25rem", relaxed: "2rem" },
  },
  slideStyles: {
    title: {
      background:
        "linear-gradient(135deg, #0a0f0a 0%, #0d140d 30%, #121a12 60%, #0a0f0a 100%)",
      pattern:
        "radial-gradient(ellipse at 10% 90%, rgba(163, 255, 0, 0.2) 0%, transparent 50%), radial-gradient(ellipse at 90% 10%, rgba(0, 255, 136, 0.15) 0%, transparent 45%), radial-gradient(ellipse at 50% 50%, rgba(0, 255, 204, 0.1) 0%, transparent 55%)",
    },
    content: {
      background: "linear-gradient(180deg, #0a0f0a 0%, #0d140d 100%)",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "1rem",
      shadow: "0 0 50px rgba(163, 255, 0, 0.4)",
      overlay:
        "linear-gradient(to top, rgba(10, 15, 10, 0.95) 0%, transparent 60%)",
    },
  },
  preview: {
    titleBg: "linear-gradient(135deg, #0d140d 0%, #1a2a1a 100%)",
    bodyBg: "#0a0f0a",
    textColor: "#c8f0c8",
    accentColor: "#a3ff00",
  },
  overlay:
    "linear-gradient(180deg, rgba(10, 15, 10, 0.4) 0%, rgba(10, 15, 10, 0.2) 100%)",
  cardBox: {
    background: "rgba(18, 26, 18, 0.95)",
    borderColor: "rgba(163, 255, 0, 0.5)",
    titleColor: "#ffffff",
    bodyColor: "#c8f0c8",
    accentColor: "#a3ff00",
    shadow: "0 0 40px rgba(163, 255, 0, 0.3)",
  },
};
