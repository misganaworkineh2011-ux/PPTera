import type { Theme } from "./types";

// Theme 4: Ocean Depths - Stunning teal/emerald theme with unique geometric layouts
export const oceanDepths: Theme = {
  id: "ocean-depths",
  name: "Ocean Depths",
  description:
    "A stunning deep teal theme with emerald accents, diagonal cuts, and circular image frames",
  category: "creative",
  colors: {
    background: "#0a1628",
    backgroundAlt: "#0d1f35",
    surface: "#122a45",
    text: "#e0f2fe",
    textMuted: "#7dd3fc",
    heading: "#ffffff",
    link: "#2dd4bf",
    linkHover: "#5eead4",
    primary: "#14b8a6",
    primaryHover: "#2dd4bf",
    secondary: "#06b6d4",
    secondaryHover: "#22d3ee",
    accent: "#a78bfa",
    border: "#1e3a5f",
    borderHover: "#2563eb",
    shadow: "rgba(10, 22, 40, 0.7)",
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
      small: "0.5rem",
      medium: "1rem",
      large: "1.5rem",
      full: "9999px",
    },
    shadows: {
      small: "0 2px 8px rgba(10, 22, 40, 0.4)",
      medium: "0 8px 24px rgba(10, 22, 40, 0.5)",
      large: "0 16px 48px rgba(10, 22, 40, 0.6)",
    },
    spacing: { tight: "0.5rem", normal: "1.25rem", relaxed: "2rem" },
  },
  slideStyles: {
    title: {
      background:
        "linear-gradient(135deg, #0a1628 0%, #0d1f35 40%, #122a45 100%)",
      pattern:
        "radial-gradient(ellipse at 20% 80%, rgba(20, 184, 166, 0.2) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(6, 182, 212, 0.15) 0%, transparent 45%), radial-gradient(circle at 50% 50%, rgba(167, 139, 250, 0.08) 0%, transparent 60%)",
    },
    content: {
      background: "linear-gradient(180deg, #0a1628 0%, #0d1f35 100%)",
      bulletStyle: "circle",
    },
    image: {
      borderRadius: "1rem",
      shadow: "0 20px 50px rgba(10, 22, 40, 0.7)",
      overlay:
        "linear-gradient(to top, rgba(10, 22, 40, 0.95) 0%, transparent 60%)",
    },
  },
  preview: {
    titleBg: "linear-gradient(135deg, #0d1f35 0%, #1e3a5f 100%)",
    bodyBg: "#0a1628",
    textColor: "#e0f2fe",
    accentColor: "#14b8a6",
  },
  overlay:
    "linear-gradient(180deg, rgba(10, 22, 40, 0.4) 0%, rgba(10, 22, 40, 0.2) 100%)",
  cardBox: {
    background: "rgba(18, 42, 69, 0.85)",
    borderColor: "rgba(20, 184, 166, 0.3)",
    titleColor: "#ffffff",
    bodyColor: "#e0f2fe",
    accentColor: "#14b8a6",
    shadow: "0 8px 32px rgba(10, 22, 40, 0.5)",
  },
};
