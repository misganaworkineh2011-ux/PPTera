import type { Theme } from "./types";

const THEME_ID = "ocean-blue-serenity";

export const oceanBlueSerenityTheme: Theme = {
  id: THEME_ID,
  name: "Ocean Blue Serenity",
  description: "Calming ocean blue gradient from deep to light",
  category: "creative",

  colors: {
    background: "#CAF0F8",
    backgroundAlt: "#90E0EF",
    surface: "#FFFFFF",
    surfaceHover: "#E0F7FA",

    text: "#03045E",
    textMuted: "#023E8A",
    textInverse: "#FFFFFF",
    heading: "#03045E",

    primary: "#0077B6",
    primaryHover: "#005F8A",
    secondary: "#00B4D8",
    secondaryHover: "#0096B4",
    accent: "#48CAE4",

    border: "#90E0EF",
    borderStrong: "#00B4D8",
    borderHover: "#0077B6",

    shadow: "rgba(3, 4, 94, 0.15)",
    overlay: "rgba(3, 4, 94, 0.5)",
    glow: "rgba(0, 119, 182, 0.3)",

    link: "#0077B6",
    linkHover: "#03045E",

    success: "#00B4D8",
    warning: "#E5BA41",
    error: "#D32F2F",
  },

  fonts: {
    heading: {
      family: "'Inter', system-ui, sans-serif",
      weight: 700,
      letterSpacing: "-0.02em",
    },
    body: {
      family: "'Inter', system-ui, sans-serif",
      weight: 400,
      lineHeight: "1.6",
    },
    caption: {
      family: "'Inter', system-ui, sans-serif",
      weight: 500,
      size: "0.875rem",
    },
    mono: {
      family: "'JetBrains Mono', monospace",
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
      small: "0 2px 4px rgba(3, 4, 94, 0.1)",
      medium: "0 4px 12px rgba(3, 4, 94, 0.15)",
      large: "0 8px 24px rgba(3, 4, 94, 0.2)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #03045E 0%, #0077B6 25%, #00B4D8 50%, #48CAE4 75%, #90E0EF 100%)",
    },
    content: {
      background: "#CAF0F8",
      bulletStyle: "disc",
    },
    image: {
      borderRadius: "0.75rem",
      shadow: "0 8px 24px rgba(3, 4, 94, 0.2)",
    },
  },

  cardBox: {
    background: "#FFFFFF",
    borderColor: "#90E0EF",
    titleColor: "#03045E",
    bodyColor: "#023E8A",
    accentColor: "#48CAE4",
    shadow: "0 4px 12px rgba(3, 4, 94, 0.15)",
  },

  gradients: {
    primary: "linear-gradient(135deg, #03045E 0%, #0077B6 25%, #00B4D8 50%, #48CAE4 75%, #90E0EF 100%)",
    secondary: "linear-gradient(135deg, #CAF0F8 0%, #90E0EF 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(3, 4, 94, 0.5) 100%)",
    text: "linear-gradient(135deg, #03045E 0%, #0077B6 100%)",
  },

  preview: {
    titleBg: "#0077B6",
    bodyBg: "#CAF0F8",
    textColor: "#03045E",
    accentColor: "#48CAE4",
  },

  pageBackground: "#CAF0F8",
};

export default oceanBlueSerenityTheme;
