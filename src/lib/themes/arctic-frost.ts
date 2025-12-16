import type { Theme } from "./types";

// Theme 2: Arctic Frost - Clean, modern light theme with cool tones
export const arcticFrost: Theme = {
  id: "arctic-frost",
  name: "Arctic Frost",
  description:
    "A crisp, modern light theme with cool cyan accents and clean typography",
  category: "minimal",
  colors: {
    background: "#f8fafc",
    backgroundAlt: "#f1f5f9",
    surface: "#ffffff",
    text: "#334155",
    textMuted: "#64748b",
    heading: "#0f172a",
    link: "#0891b2",
    linkHover: "#06b6d4",
    primary: "#0891b2",
    primaryHover: "#06b6d4",
    secondary: "#8b5cf6",
    secondaryHover: "#a78bfa",
    accent: "#f43f5e",
    border: "#e2e8f0",
    borderHover: "#cbd5e1",
    shadow: "rgba(15, 23, 42, 0.08)",
    success: "#10b981",
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
      small: "0 2px 8px rgba(15, 23, 42, 0.06)",
      medium: "0 8px 24px rgba(15, 23, 42, 0.1)",
      large: "0 16px 48px rgba(15, 23, 42, 0.12)",
    },
    spacing: { tight: "0.5rem", normal: "1.25rem", relaxed: "2rem" },
  },
  slideStyles: {
    title: {
      background:
        "linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #f0f9ff 100%)",
      pattern:
        "radial-gradient(ellipse at 30% 20%, rgba(8, 145, 178, 0.1) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(139, 92, 246, 0.08) 0%, transparent 40%)",
    },
    content: {
      background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
      bulletStyle: "circle",
    },
    image: {
      borderRadius: "0.75rem",
      shadow: "0 20px 50px rgba(15, 23, 42, 0.15)",
      overlay:
        "linear-gradient(to top, rgba(248, 250, 252, 0.9) 0%, transparent 60%)",
    },
  },
  preview: {
    titleBg: "linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)",
    bodyBg: "#f8fafc",
    textColor: "#334155",
    accentColor: "#0891b2",
  },
  overlay:
    "linear-gradient(180deg, rgba(248, 250, 252, 0.4) 0%, rgba(248, 250, 252, 0.2) 100%)",
  cardBox: {
    background: "rgba(255, 255, 255, 0.9)",
    borderColor: "rgba(8, 145, 178, 0.2)",
    titleColor: "#0f172a",
    bodyColor: "#334155",
    accentColor: "#0891b2",
    shadow: "0 8px 32px rgba(15, 23, 42, 0.1)",
  },
};
