import type { Theme } from "./types";

// Theme 10: Corporate Clean - Professional minimalist white theme with subtle gray accents
export const corporateClean: Theme = {
  id: "corporate-clean",
  name: "Corporate Clean",
  description:
    "A professional minimalist white theme with clean lines, subtle gray accents, and elegant typography for business presentations",
  category: "professional",
  colors: {
    background: "#ffffff",
    backgroundAlt: "#f9fafb",
    surface: "#f3f4f6",
    text: "#374151",
    textMuted: "#6b7280",
    heading: "#111827",
    link: "#2563eb",
    linkHover: "#1d4ed8",
    primary: "#2563eb",
    primaryHover: "#1d4ed8",
    secondary: "#64748b",
    secondaryHover: "#475569",
    accent: "#0ea5e9",
    border: "#e5e7eb",
    borderHover: "#d1d5db",
    shadow: "rgba(0, 0, 0, 0.08)",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
  },
  fonts: {
    heading: {
      family: "'Inter', sans-serif",
      weight: 600,
      letterSpacing: "-0.02em",
    },
    body: { family: "'Inter', sans-serif", weight: 400, lineHeight: "1.7" },
    caption: { family: "'Inter', sans-serif", weight: 500, size: "0.875rem" },
  },
  design: {
    borderRadius: {
      small: "0.375rem",
      medium: "0.5rem",
      large: "0.75rem",
      full: "9999px",
    },
    shadows: {
      small: "0 1px 3px rgba(0, 0, 0, 0.08)",
      medium: "0 4px 12px rgba(0, 0, 0, 0.1)",
      large: "0 10px 40px rgba(0, 0, 0, 0.12)",
    },
    spacing: { tight: "0.5rem", normal: "1.25rem", relaxed: "2rem" },
  },
  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #ffffff 0%, #f9fafb 50%, #f3f4f6 100%)",
      pattern: "radial-gradient(ellipse at 80% 20%, rgba(37, 99, 235, 0.05) 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(14, 165, 233, 0.04) 0%, transparent 45%)",
    },
    content: {
      background: "linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "0.5rem",
      shadow: "0 10px 40px rgba(0, 0, 0, 0.12)",
      overlay: "linear-gradient(to top, rgba(255, 255, 255, 0.95) 0%, transparent 60%)",
    },
  },
  preview: {
    titleBg: "linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)",
    bodyBg: "#ffffff",
    textColor: "#374151",
    accentColor: "#2563eb",
  },
  overlay: "linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%)",
  cardBox: {
    background: "rgba(255, 255, 255, 0.95)",
    borderColor: "rgba(37, 99, 235, 0.2)",
    titleColor: "#111827",
    bodyColor: "#374151",
    accentColor: "#2563eb",
    shadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
  },
};
