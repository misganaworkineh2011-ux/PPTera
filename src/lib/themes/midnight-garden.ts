import type { Theme } from "./types";

// Theme 7: Midnight Garden - Luxurious deep indigo theme with rose gold accents
export const midnightGarden: Theme = {
  id: "midnight-garden",
  name: "Midnight Garden",
  description:
    "A luxurious deep indigo theme with rose gold accents, arch frames, and elegant botanical patterns",
  category: "creative",
  colors: {
    background: "#0c0a1d",
    backgroundAlt: "#12102a",
    surface: "#1a1735",
    text: "#f0e6ff",
    textMuted: "#c4b5fd",
    heading: "#ffffff",
    link: "#e879a9",
    linkHover: "#f0abcb",
    primary: "#e879a9",
    primaryHover: "#f0abcb",
    secondary: "#818cf8",
    secondaryHover: "#a5b4fc",
    accent: "#fcd34d",
    border: "#312e81",
    borderHover: "#4338ca",
    shadow: "rgba(12, 10, 29, 0.85)",
    success: "#34d399",
    warning: "#fbbf24",
    error: "#f87171",
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
      small: "0.75rem",
      medium: "1.5rem",
      large: "2.5rem",
      full: "9999px",
    },
    shadows: {
      small: "0 2px 12px rgba(232, 121, 169, 0.15)",
      medium: "0 8px 32px rgba(232, 121, 169, 0.2)",
      large: "0 20px 60px rgba(232, 121, 169, 0.25)",
    },
    spacing: { tight: "0.5rem", normal: "1.25rem", relaxed: "2rem" },
  },
  slideStyles: {
    title: {
      background:
        "linear-gradient(135deg, #0c0a1d 0%, #1a1735 40%, #12102a 100%)",
      pattern:
        "radial-gradient(ellipse at 25% 25%, rgba(232, 121, 169, 0.2) 0%, transparent 50%), radial-gradient(ellipse at 75% 75%, rgba(129, 140, 248, 0.15) 0%, transparent 45%), radial-gradient(ellipse at 50% 50%, rgba(252, 211, 77, 0.08) 0%, transparent 60%)",
    },
    content: {
      background: "linear-gradient(180deg, #0c0a1d 0%, #12102a 100%)",
      bulletStyle: "circle",
    },
    image: {
      borderRadius: "1.5rem",
      shadow: "0 25px 60px rgba(232, 121, 169, 0.3)",
      overlay:
        "linear-gradient(to top, rgba(12, 10, 29, 0.95) 0%, transparent 60%)",
    },
  },
  preview: {
    titleBg: "linear-gradient(135deg, #1a1735 0%, #312e81 100%)",
    bodyBg: "#0c0a1d",
    textColor: "#f0e6ff",
    accentColor: "#e879a9",
  },
  overlay:
    "linear-gradient(180deg, rgba(12, 10, 29, 0.4) 0%, rgba(12, 10, 29, 0.2) 100%)",
  cardBox: {
    background: "rgba(26, 23, 53, 0.85)",
    borderColor: "rgba(232, 121, 169, 0.3)",
    titleColor: "#ffffff",
    bodyColor: "#f0e6ff",
    accentColor: "#e879a9",
    shadow: "0 8px 40px rgba(232, 121, 169, 0.2)",
  },
};
