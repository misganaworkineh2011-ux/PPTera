import type { Theme } from "./types";

// Theme 3: Sunset Gradient - Warm, vibrant creative theme with rose/orange/purple tones
export const sunsetGradient: Theme = {
  id: "sunset-gradient",
  name: "Sunset Gradient",
  description:
    "A warm, vibrant theme with beautiful rose and orange gradients for creative presentations",
  category: "creative",
  colors: {
    background: "#1c1017",
    backgroundAlt: "#261520",
    surface: "#2d1a24",
    text: "#fce7f3",
    textMuted: "#f9a8d4",
    heading: "#ffffff",
    link: "#fb923c",
    linkHover: "#fdba74",
    primary: "#f472b6",
    primaryHover: "#f9a8d4",
    secondary: "#fb923c",
    secondaryHover: "#fdba74",
    accent: "#a855f7",
    border: "#4c1d3d",
    borderHover: "#6b2150",
    shadow: "rgba(28, 16, 23, 0.6)",
    success: "#4ade80",
    warning: "#fbbf24",
    error: "#f87171",
  },
  fonts: {
    heading: {
      family: "'Inter', sans-serif",
      weight: 700,
      letterSpacing: "-0.03em",
    },
    body: { family: "'Inter', sans-serif", weight: 400, lineHeight: "1.7" },
    caption: { family: "'Inter', sans-serif", weight: 500, size: "0.875rem" },
  },
  design: {
    borderRadius: {
      small: "0.5rem",
      medium: "0.75rem",
      large: "1rem",
      full: "9999px",
    },
    shadows: {
      small: "0 2px 8px rgba(28, 16, 23, 0.4)",
      medium: "0 8px 24px rgba(28, 16, 23, 0.5)",
      large: "0 16px 48px rgba(28, 16, 23, 0.6)",
    },
    spacing: { tight: "0.5rem", normal: "1.25rem", relaxed: "2rem" },
  },
  slideStyles: {
    title: {
      background:
        "linear-gradient(135deg, #1c1017 0%, #2d1a24 30%, #1c1017 100%)",
      pattern:
        "radial-gradient(ellipse at 20% 30%, rgba(244, 114, 182, 0.2) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(251, 146, 60, 0.15) 0%, transparent 45%)",
    },
    content: {
      background: "linear-gradient(180deg, #1c1017 0%, #261520 100%)",
      bulletStyle: "circle",
    },
    image: {
      borderRadius: "0.75rem",
      shadow: "0 20px 50px rgba(28, 16, 23, 0.7)",
      overlay:
        "linear-gradient(to top, rgba(28, 16, 23, 0.95) 0%, transparent 60%)",
    },
  },
  preview: {
    titleBg: "linear-gradient(135deg, #2d1a24 0%, #4c1d3d 100%)",
    bodyBg: "#1c1017",
    textColor: "#fce7f3",
    accentColor: "#f472b6",
  },
  overlay:
    "linear-gradient(180deg, rgba(28, 16, 23, 0.4) 0%, rgba(28, 16, 23, 0.2) 100%)",
  cardBox: {
    background: "rgba(45, 26, 36, 0.85)",
    borderColor: "rgba(244, 114, 182, 0.25)",
    titleColor: "#ffffff",
    bodyColor: "#fce7f3",
    accentColor: "#f472b6",
    shadow: "0 8px 32px rgba(28, 16, 23, 0.5)",
  },
};
