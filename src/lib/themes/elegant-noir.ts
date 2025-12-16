import type { Theme } from "./types";

// Theme 1: Elegant Noir - Sophisticated dark theme
export const elegantNoir: Theme = {
  id: "elegant-noir",
  name: "Elegant Noir",
  description:
    "A sophisticated dark theme with warm accents and modern typography",
  category: "bold",
  colors: {
    background: "#0a0a0b",
    backgroundAlt: "#141416",
    surface: "#1a1a1d",
    text: "#e4e4e7",
    textMuted: "#a1a1aa",
    heading: "#fafafa",
    link: "#f59e0b",
    linkHover: "#fbbf24",
    primary: "#f59e0b",
    primaryHover: "#fbbf24",
    secondary: "#6366f1",
    secondaryHover: "#818cf8",
    accent: "#ec4899",
    border: "#27272a",
    borderHover: "#3f3f46",
    shadow: "rgba(0, 0, 0, 0.5)",
    success: "#22c55e",
    warning: "#f59e0b",
    error: "#ef4444",
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
      small: "0 2px 8px rgba(0, 0, 0, 0.3)",
      medium: "0 8px 24px rgba(0, 0, 0, 0.4)",
      large: "0 16px 48px rgba(0, 0, 0, 0.5)",
    },
    spacing: { tight: "0.5rem", normal: "1.25rem", relaxed: "2rem" },
  },
  slideStyles: {
    title: {
      background:
        "linear-gradient(135deg, #0a0a0b 0%, #1a1a1d 50%, #0a0a0b 100%)",
      pattern:
        "radial-gradient(ellipse at 30% 20%, rgba(245, 158, 11, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 40%)",
    },
    content: {
      background: "linear-gradient(180deg, #0a0a0b 0%, #141416 100%)",
      bulletStyle: "circle",
    },
    image: {
      borderRadius: "0.75rem",
      shadow: "0 20px 50px rgba(0, 0, 0, 0.6)",
      overlay:
        "linear-gradient(to top, rgba(10, 10, 11, 0.9) 0%, transparent 60%)",
    },
  },
  preview: {
    titleBg: "linear-gradient(135deg, #1a1a1d 0%, #27272a 100%)",
    bodyBg: "#0a0a0b",
    textColor: "#e4e4e7",
    accentColor: "#f59e0b",
  },
  overlay:
    "linear-gradient(180deg, rgba(10, 10, 11, 0.4) 0%, rgba(10, 10, 11, 0.2) 100%)",
  cardBox: {
    background: "rgba(26, 26, 29, 0.8)",
    borderColor: "rgba(245, 158, 11, 0.2)",
    titleColor: "#fafafa",
    bodyColor: "#e4e4e7",
    accentColor: "#f59e0b",
    shadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
  },
};
