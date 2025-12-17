import type { Theme } from "./types";

// Theme 12: Architectural Monochrome - Bold B&W with geometric precision
// Features: Sharp lines, dramatic contrast, architectural frames, bold typography
export const architecturalMono: Theme = {
  id: "architectural-mono",
  name: "Architectural Mono",
  description:
    "A bold monochromatic theme with striking architectural imagery, sharp geometric lines, dramatic contrast, and powerful typography",
  category: "bold",
  colors: {
    background: "#0a0a0a",
    backgroundAlt: "#141414",
    surface: "rgba(20, 20, 20, 0.85)",
    text: "#ffffff",
    textMuted: "#a3a3a3",
    heading: "#ffffff",
    link: "#e5e5e5",
    linkHover: "#ffffff",
    primary: "#ffffff",
    primaryHover: "#e5e5e5",
    secondary: "#737373",
    secondaryHover: "#a3a3a3",
    accent: "#d4d4d4",
    border: "rgba(255, 255, 255, 0.15)",
    borderHover: "rgba(255, 255, 255, 0.3)",
    shadow: "rgba(0, 0, 0, 0.9)",
    success: "#22c55e",
    warning: "#eab308",
    error: "#ef4444",
  },
  fonts: {
    heading: {
      family: "'Inter', sans-serif",
      weight: 800,
      letterSpacing: "-0.03em",
    },
    body: { family: "'Inter', sans-serif", weight: 400, lineHeight: "1.7" },
    caption: { family: "'Inter', sans-serif", weight: 600, size: "0.875rem" },
  },
  design: {
    borderRadius: {
      small: "0",
      medium: "0.25rem",
      large: "0.5rem",
      full: "9999px",
    },
    shadows: {
      small: "0 4px 20px rgba(0, 0, 0, 0.4)",
      medium: "0 8px 40px rgba(0, 0, 0, 0.5)",
      large: "0 16px 60px rgba(0, 0, 0, 0.6)",
    },
    spacing: { tight: "0.5rem", normal: "1.25rem", relaxed: "2rem" },
  },
  slideStyles: {
    title: {
      background: "transparent",
      pattern: "none",
    },
    content: {
      background: "transparent",
      bulletStyle: "square",
    },
    image: {
      borderRadius: "0",
      shadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
      overlay: "linear-gradient(to top, rgba(10, 10, 10, 0.95) 0%, transparent 50%)",
    },
  },
  preview: {
    titleBg: "linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)",
    bodyBg: "#0a0a0a",
    textColor: "#ffffff",
    accentColor: "#ffffff",
  },
  backgroundImage:
    "https://images.ctfassets.net/nnkxuzam4k38/1J6b82cZQYoPFz9Uv3T8xu/24d1b92f09c9232535565d5378502604/samuel-zeller-medium-b832fe04.jpg",
  previewBackgroundImage:
    "https://images.ctfassets.net/nnkxuzam4k38/1J6b82cZQYoPFz9Uv3T8xu/24d1b92f09c9232535565d5378502604/samuel-zeller-medium-b832fe04.jpg",
  overlay: "linear-gradient(135deg, rgba(0, 0, 0, 0.6) 0%, rgba(20, 20, 20, 0.4) 50%, rgba(0, 0, 0, 0.7) 100%)",
  cardBox: {
    background: "rgba(10, 10, 10, 0.8)",
    borderColor: "rgba(255, 255, 255, 0.2)",
    titleColor: "#ffffff",
    bodyColor: "#a3a3a3",
    accentColor: "#ffffff",
    shadow: "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
  },
};
