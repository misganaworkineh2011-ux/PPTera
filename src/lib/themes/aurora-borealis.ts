import type { Theme } from "./types";

// Theme 5: Aurora Borealis - Magical purple/green aurora theme with glass morphism and unique shapes
export const auroraBorealis: Theme = {
  id: "aurora-borealis",
  name: "Aurora Borealis",
  description:
    "A magical aurora-inspired theme with purple and green gradients, glass morphism, and hexagonal frames",
  category: "creative",
  colors: {
    background: "#0f0a1a",
    backgroundAlt: "#150d24",
    surface: "#1a1030",
    text: "#e8e0f0",
    textMuted: "#b8a8d0",
    heading: "#ffffff",
    link: "#a855f7",
    linkHover: "#c084fc",
    primary: "#a855f7",
    primaryHover: "#c084fc",
    secondary: "#22c55e",
    secondaryHover: "#4ade80",
    accent: "#06b6d4",
    border: "#2d1f4a",
    borderHover: "#4c3575",
    shadow: "rgba(15, 10, 26, 0.8)",
    success: "#22c55e",
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
      medium: "1.25rem",
      large: "2rem",
      full: "9999px",
    },
    shadows: {
      small: "0 2px 12px rgba(168, 85, 247, 0.15)",
      medium: "0 8px 32px rgba(168, 85, 247, 0.2)",
      large: "0 20px 60px rgba(168, 85, 247, 0.25)",
    },
    spacing: { tight: "0.5rem", normal: "1.25rem", relaxed: "2rem" },
  },
  slideStyles: {
    title: {
      background:
        "linear-gradient(135deg, #0f0a1a 0%, #1a1030 40%, #150d24 100%)",
      pattern:
        "radial-gradient(ellipse at 30% 20%, rgba(168, 85, 247, 0.25) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(34, 197, 94, 0.15) 0%, transparent 45%), radial-gradient(ellipse at 50% 50%, rgba(6, 182, 212, 0.1) 0%, transparent 60%)",
    },
    content: {
      background: "linear-gradient(180deg, #0f0a1a 0%, #150d24 100%)",
      bulletStyle: "circle",
    },
    image: {
      borderRadius: "1.25rem",
      shadow: "0 25px 60px rgba(168, 85, 247, 0.3)",
      overlay:
        "linear-gradient(to top, rgba(15, 10, 26, 0.95) 0%, transparent 60%)",
    },
  },
  preview: {
    titleBg: "linear-gradient(135deg, #1a1030 0%, #2d1f4a 100%)",
    bodyBg: "#0f0a1a",
    textColor: "#e8e0f0",
    accentColor: "#a855f7",
  },
  overlay:
    "linear-gradient(180deg, rgba(15, 10, 26, 0.4) 0%, rgba(15, 10, 26, 0.2) 100%)",
  cardBox: {
    background: "rgba(26, 16, 48, 0.85)",
    borderColor: "rgba(168, 85, 247, 0.3)",
    titleColor: "#ffffff",
    bodyColor: "#e8e0f0",
    accentColor: "#a855f7",
    shadow: "0 8px 40px rgba(168, 85, 247, 0.2)",
  },
};
