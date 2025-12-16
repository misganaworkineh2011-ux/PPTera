import type { Theme } from "./types";

// Theme 6: Ember Forge - Fiery red/orange theme with diamond frames and molten effects
export const emberForge: Theme = {
  id: "ember-forge",
  name: "Ember Forge",
  description:
    "A bold, fiery theme with red and orange gradients, diamond-shaped frames, and molten ember effects",
  category: "bold",
  colors: {
    background: "#1a0a0a",
    backgroundAlt: "#2a1010",
    surface: "#3a1515",
    text: "#fef2f2",
    textMuted: "#fca5a5",
    heading: "#ffffff",
    link: "#f97316",
    linkHover: "#fb923c",
    primary: "#ef4444",
    primaryHover: "#f87171",
    secondary: "#f97316",
    secondaryHover: "#fb923c",
    accent: "#fbbf24",
    border: "#7f1d1d",
    borderHover: "#991b1b",
    shadow: "rgba(26, 10, 10, 0.8)",
    success: "#22c55e",
    warning: "#fbbf24",
    error: "#ef4444",
  },
  fonts: {
    heading: {
      family: "'Inter', sans-serif",
      weight: 700,
      letterSpacing: "-0.02em",
    },
    body: { family: "'Inter', sans-serif", weight: 400, lineHeight: "1.7" },
    caption: { family: "'Inter', sans-serif", weight: 500, size: "0.875rem" },
  },
  design: {
    borderRadius: {
      small: "0.5rem",
      medium: "1rem",
      large: "1.5rem",
      full: "9999px",
    },
    shadows: {
      small: "0 2px 12px rgba(239, 68, 68, 0.2)",
      medium: "0 8px 32px rgba(239, 68, 68, 0.25)",
      large: "0 20px 60px rgba(239, 68, 68, 0.3)",
    },
    spacing: { tight: "0.5rem", normal: "1.25rem", relaxed: "2rem" },
  },
  slideStyles: {
    title: {
      background:
        "linear-gradient(135deg, #1a0a0a 0%, #2a1010 40%, #3a1515 100%)",
      pattern:
        "radial-gradient(ellipse at 30% 80%, rgba(239, 68, 68, 0.25) 0%, transparent 50%), radial-gradient(ellipse at 70% 20%, rgba(249, 115, 22, 0.2) 0%, transparent 45%), radial-gradient(ellipse at 50% 50%, rgba(251, 191, 36, 0.1) 0%, transparent 60%)",
    },
    content: {
      background: "linear-gradient(180deg, #1a0a0a 0%, #2a1010 100%)",
      bulletStyle: "square",
    },
    image: {
      borderRadius: "1rem",
      shadow: "0 25px 60px rgba(239, 68, 68, 0.35)",
      overlay:
        "linear-gradient(to top, rgba(26, 10, 10, 0.95) 0%, transparent 60%)",
    },
  },
  preview: {
    titleBg: "linear-gradient(135deg, #2a1010 0%, #7f1d1d 100%)",
    bodyBg: "#1a0a0a",
    textColor: "#fef2f2",
    accentColor: "#ef4444",
  },
  overlay:
    "linear-gradient(180deg, rgba(26, 10, 10, 0.4) 0%, rgba(26, 10, 10, 0.2) 100%)",
  cardBox: {
    background: "rgba(58, 21, 21, 0.85)",
    borderColor: "rgba(239, 68, 68, 0.35)",
    titleColor: "#ffffff",
    bodyColor: "#fef2f2",
    accentColor: "#ef4444",
    shadow: "0 8px 40px rgba(239, 68, 68, 0.25)",
  },
};
