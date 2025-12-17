import type { Theme } from "./types";

// Theme 13: Anime Dreamscape - Soft anime aesthetic with dreamy colors
// Features: Soft gradients, rounded shapes, pastel accents, ethereal glow
export const animeDreamscape: Theme = {
  id: "anime-dreamscape",
  name: "Anime Dreamscape",
  description:
    "A dreamy anime-inspired theme with soft purple skies, pastel pink accents, gentle gradients, and ethereal cloud-like elements",
  category: "creative",
  colors: {
    background: "#1a1625",
    backgroundAlt: "#251f35",
    surface: "rgba(37, 31, 53, 0.8)",
    text: "#ffffff",
    textMuted: "#d8b4fe",
    heading: "#ffffff",
    link: "#f0abfc",
    linkHover: "#f5d0fe",
    primary: "#e879f9",
    primaryHover: "#f0abfc",
    secondary: "#7dd3fc",
    secondaryHover: "#a5f3fc",
    accent: "#fda4af",
    border: "rgba(232, 121, 249, 0.25)",
    borderHover: "rgba(232, 121, 249, 0.4)",
    shadow: "rgba(26, 22, 37, 0.9)",
    success: "#86efac",
    warning: "#fde047",
    error: "#fca5a5",
  },
  fonts: {
    heading: {
      family: "'Inter', sans-serif",
      weight: 600,
      letterSpacing: "0.01em",
    },
    body: { family: "'Inter', sans-serif", weight: 400, lineHeight: "1.8" },
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
      small: "0 4px 20px rgba(232, 121, 249, 0.15)",
      medium: "0 8px 40px rgba(232, 121, 249, 0.2)",
      large: "0 16px 60px rgba(232, 121, 249, 0.25)",
    },
    spacing: { tight: "0.75rem", normal: "1.5rem", relaxed: "2.5rem" },
  },
  slideStyles: {
    title: {
      background: "transparent",
      pattern: "none",
    },
    content: {
      background: "transparent",
      bulletStyle: "circle",
    },
    image: {
      borderRadius: "1.5rem",
      shadow: "0 20px 60px rgba(232, 121, 249, 0.25)",
      overlay: "linear-gradient(to top, rgba(26, 22, 37, 0.9) 0%, transparent 50%)",
    },
  },
  preview: {
    titleBg: "linear-gradient(135deg, #2d2640 0%, #1a1625 100%)",
    bodyBg: "#1a1625",
    textColor: "#ffffff",
    accentColor: "#e879f9",
  },
  backgroundImage:
    "https://images.hdqwalls.com/download/anime-city-hd-zt-3840x2160.jpg",
  previewBackgroundImage:
    "https://images.hdqwalls.com/download/anime-city-hd-zt-3840x2160.jpg",
  overlay:
    "linear-gradient(180deg, rgba(26, 22, 37, 0.3) 0%, rgba(37, 31, 53, 0.4) 50%, rgba(26, 22, 37, 0.5) 100%)",
  cardBox: {
    background: "rgba(37, 31, 53, 0.7)",
    borderColor: "rgba(232, 121, 249, 0.3)",
    titleColor: "#ffffff",
    bodyColor: "#d8b4fe",
    accentColor: "#e879f9",
    shadow: "0 8px 32px rgba(232, 121, 249, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
  },
};
