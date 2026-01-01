import type { Theme } from "./types";

// Theme: Corporate Clean - Premium professional theme with elegant typography
export const corporateClean: Theme = {
  id: "corporate-clean",
  name: "Corporate Clean",
  description:
    "A premium professional theme with elegant DM Sans typography, refined color palette, and sophisticated design elements for executive presentations",
  category: "professional",

  colors: {
    background: "#ffffff",
    backgroundAlt: "#fafbfc",
    surface: "#f8f9fa",
    surfaceHover: "#f1f5f9",
    text: "#2d3748",
    textMuted: "#4a5568",
    textInverse: "#ffffff",
    heading: "#1a202c",
    primary: "#3182ce",
    primaryHover: "#2b6cb0",
    secondary: "#718096",
    secondaryHover: "#4a5568",
    accent: "#4299e1",
    border: "#e2e8f0",
    borderStrong: "#cbd5e0",
    borderHover: "#cbd5e0",
    shadow: "rgba(0, 0, 0, 0.06)",
    overlay: "rgba(0, 0, 0, 0.5)",
    glow: "rgba(49, 130, 206, 0.4)",
    link: "#3182ce",
    linkHover: "#2b6cb0",
    success: "#38a169",
    warning: "#dd6b20",
    error: "#e53e3e",
  },

  fonts: {
    heading: {
      family: "'DM Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      weight: 700,
      letterSpacing: "-0.025em",
    },
    body: {
      family: "'DM Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      weight: 400,
      lineHeight: "1.75",
    },
    caption: {
      family: "'DM Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      weight: 500,
      size: "0.875rem",
    },
    mono: {
      family: "'JetBrains Mono', 'Fira Code', monospace",
    },
  },

  design: {
    borderRadius: {
      small: "0.5rem",
      medium: "0.75rem",
      large: "1rem",
      full: "9999px",
    },
    shadows: {
      small: "0 1px 2px rgba(0, 0, 0, 0.04), 0 1px 4px rgba(0, 0, 0, 0.04)",
      medium: "0 4px 6px rgba(0, 0, 0, 0.04), 0 10px 20px rgba(0, 0, 0, 0.06)",
      large: "0 10px 25px rgba(0, 0, 0, 0.06), 0 20px 48px rgba(0, 0, 0, 0.08)",
    },
    spacing: {
      tight: "0.5rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  gradients: {
    primary: "linear-gradient(135deg, #3182ce 0%, #4299e1 100%)",
    secondary: "linear-gradient(145deg, #ffffff 0%, #fafbfc 40%, #f7fafc 100%)",
    overlay: "linear-gradient(to top, rgba(255, 255, 255, 0.98) 0%, transparent 50%)",
    text: "linear-gradient(135deg, #1a202c 0%, #3182ce 100%)",
  },

  slideStyles: {
    title: {
      background: "linear-gradient(145deg, #ffffff 0%, #fafbfc 40%, #f7fafc 100%)",
      pattern:
        "radial-gradient(ellipse at 75% 15%, rgba(49, 130, 206, 0.04) 0%, transparent 55%), radial-gradient(ellipse at 25% 85%, rgba(66, 153, 225, 0.03) 0%, transparent 50%)",
    },
    content: {
      background: "linear-gradient(175deg, #ffffff 0%, #fafbfc 100%)",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "0.75rem",
      shadow: "0 20px 50px rgba(0, 0, 0, 0.1)",
      overlay: "linear-gradient(to top, rgba(255, 255, 255, 0.98) 0%, transparent 50%)",
    },
  },

  cardBox: {
    background: "rgba(255, 255, 255, 0.98)",
    borderColor: "rgba(49, 130, 206, 0.15)",
    titleColor: "#1a202c",
    bodyColor: "#2d3748",
    accentColor: "#3182ce",
    shadow: "0 4px 16px rgba(0, 0, 0, 0.05)",
    hoverBackground: "rgba(255, 255, 255, 1)",
    hoverBorderColor: "rgba(49, 130, 206, 0.3)",
  },

  preview: {
    titleBg: "linear-gradient(145deg, #ffffff 0%, #f7fafc 100%)",
    bodyBg: "#ffffff",
    textColor: "#2d3748",
    accentColor: "#3182ce",
  },

  overlay:
    "linear-gradient(180deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.08) 100%)",
  pageBackground: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)",
};
