import type { Theme } from "./types";

// Theme 11: Cosmic Voyage - Stunning space theme with image background
// Features: Floating glass panels, cosmic glow effects, ethereal typography
export const cosmicVoyage: Theme = {
  id: "cosmic-voyage",
  name: "Cosmic Voyage",
  description:
    "An ethereal space theme with stunning planetary imagery, floating glass panels, cosmic glow effects, and celestial design elements",
  category: "creative",
  colors: {
    background: "#0a0612",
    backgroundAlt: "#120a1f",
    surface: "rgba(20, 10, 35, 0.7)",
    text: "#ffffff",
    textMuted: "#c4b5fd",
    heading: "#ffffff",
    link: "#a78bfa",
    linkHover: "#c4b5fd",
    primary: "#a78bfa",
    primaryHover: "#c4b5fd",
    secondary: "#60a5fa",
    secondaryHover: "#93c5fd",
    accent: "#f0abfc",
    border: "rgba(167, 139, 250, 0.3)",
    borderHover: "rgba(167, 139, 250, 0.5)",
    shadow: "rgba(10, 6, 18, 0.9)",
    success: "#34d399",
    warning: "#fbbf24",
    error: "#f87171",
  },
  fonts: {
    heading: {
      family: "'Inter', sans-serif",
      weight: 300,
      letterSpacing: "0.05em",
    },
    body: { family: "'Inter', sans-serif", weight: 400, lineHeight: "1.8" },
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
      small: "0 4px 20px rgba(167, 139, 250, 0.15)",
      medium: "0 8px 40px rgba(167, 139, 250, 0.2)",
      large: "0 16px 60px rgba(167, 139, 250, 0.25)",
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
      borderRadius: "1.25rem",
      shadow: "0 20px 60px rgba(167, 139, 250, 0.3)",
      overlay:
        "linear-gradient(to top, rgba(10, 6, 18, 0.9) 0%, transparent 50%)",
    },
  },
  preview: {
    titleBg: "linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 100%)",
    bodyBg: "#0a0612",
    textColor: "#ffffff",
    accentColor: "#a78bfa",
  },
  backgroundImage: "https://removal.ai/wp-content/uploads/2021/05/image8.png",
  previewBackgroundImage: "https://removal.ai/wp-content/uploads/2021/05/image8.png",
  overlay:
    "linear-gradient(135deg, rgba(10, 6, 18, 0.4) 0%, rgba(20, 10, 35, 0.3) 50%, rgba(10, 6, 18, 0.5) 100%)",
  cardBox: {
    background: "rgba(20, 10, 35, 0.6)",
    borderColor: "rgba(167, 139, 250, 0.25)",
    titleColor: "#ffffff",
    bodyColor: "#c4b5fd",
    accentColor: "#a78bfa",
    shadow: "0 8px 32px rgba(167, 139, 250, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
  },
};
