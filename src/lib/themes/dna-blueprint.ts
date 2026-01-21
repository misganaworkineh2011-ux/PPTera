/**
 * DNA Blueprint Theme
 * Inspired by molecular biology and scientific aesthetics - featuring deep teals,
 * bio-luminescent accents, and organic gradients. Perfect for science, biotech, and startup presentations.
 */

import type { Theme } from "./types";

const THEME_ID = "dna-blueprint";

export const dnaBlueprintTheme: Theme = {
  id: THEME_ID,
  name: "Midnight Teal (or Cyber Streamline)",
  description: "Scientific theme with molecular aesthetics, deep teals, and bio-luminescent accents",
  category: "dark",

  colors: {
    background: "#0a1a1f",
    backgroundAlt: "#0f2228",
    surface: "#142d35",
    surfaceHover: "#1a3842",

    text: "#e0f2f1",
    textMuted: "#80cbc4",
    textInverse: "#0a1a1f",
    heading: "#ffffff",

    primary: "#26a69a",
    primaryHover: "#4db6ac",
    secondary: "#ef5350",
    secondaryHover: "#f44336",
    accent: "#42a5f5",

    border: "#1e4d5a",
    borderStrong: "#2a6575",
    borderHover: "#357d90",

    shadow: "rgba(38, 166, 154, 0.15)",
    overlay: "rgba(10, 26, 31, 0.9)",
    glow: "rgba(38, 166, 154, 0.4)",

    link: "#4db6ac",
    linkHover: "#80cbc4",

    success: "#66bb6a",
    warning: "#ffca28",
    error: "#ef5350",
  },

  fonts: {
    heading: {
      family: "'Space Grotesk', sans-serif",
      weight: 700,
      letterSpacing: "-0.02em",
    },
    body: {
      family: "'Inter', var(--font-geist-sans), sans-serif",
      weight: 400,
      lineHeight: "1.7",
    },
    caption: {
      family: "'Inter', var(--font-geist-sans), sans-serif",
      weight: 500,
      size: "0.875rem",
    },
    mono: {
      family: "'JetBrains Mono', monospace",
    },
    googleFontsUrls: [
      "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap",
    ],
  },

  design: {
    borderRadius: {
      small: "0.5rem",
      medium: "1rem",
      large: "1.5rem",
      full: "9999px",
    },
    shadows: {
      small: "0 2px 10px rgba(38, 166, 154, 0.12)",
      medium: "0 8px 28px rgba(38, 166, 154, 0.18)",
      large: "0 16px 50px rgba(38, 166, 154, 0.25)",
    },
    spacing: {
      tight: "0.75rem",
      normal: "1.5rem",
      relaxed: "2.5rem",
    },
  },

  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #0a1a1f 0%, #142d35 50%, #0f2228 100%)",
      pattern: "radial-gradient(ellipse at 30% 70%, rgba(38, 166, 154, 0.12) 0%, transparent 50%), radial-gradient(ellipse at 70% 30%, rgba(239, 83, 80, 0.08) 0%, transparent 45%), radial-gradient(ellipse at 50% 50%, rgba(66, 165, 245, 0.06) 0%, transparent 40%)",
    },
    content: {
      background: "#0f2228",
      bulletStyle: "circle",
    },
    image: {
      borderRadius: "1rem",
      shadow: "0 12px 40px rgba(38, 166, 154, 0.2)",
      overlay: "linear-gradient(to top, rgba(10, 26, 31, 0.85), transparent)",
    },
  },

  // Slide shape - rounded scientific look
  slideShape: {
    type: "rounded",
    borderRadius: "8px",
    shadow: "medium",
  },

  cardBox: {
    background: "#142d35",
    borderColor: "#2a6575",
    titleColor: "#ffffff",
    bodyColor: "#e0f2f1",
    accentColor: "#26a69a",
    shadow: "none",
    hoverBackground: "#1a3842",
    hoverBorderColor: "#357d90",
  },

  layoutElements: {
    background: "#183540",
    borderColor: "#2a6575",
    hoverBackground: "#1f4250",
  },

  gradients: {
    primary: "linear-gradient(135deg, #26a69a 0%, #42a5f5 50%, #ef5350 100%)",
    secondary: "linear-gradient(135deg, #142d35 0%, #1a3842 100%)",
    overlay: "linear-gradient(to bottom, transparent 0%, rgba(10, 26, 31, 0.95) 100%)",
    text: "linear-gradient(135deg, #26a69a 0%, #42a5f5 100%)",
  },

  preview: {
    titleBg: "#142d35",
    bodyBg: "#0f2228",
    textColor: "#e0f2f1",
    accentColor: "#26a69a",
  },

  backgroundImage: undefined,
  previewBackgroundImage: undefined,
  backgroundPosition: "center",
  backgroundSize: "cover",
  overlay: "rgba(10, 26, 31, 0.88)",

  pageBackground: "radial-gradient(ellipse at 20% 80%, rgba(38, 166, 154, 0.15) 0%, transparent 45%), radial-gradient(ellipse at 80% 20%, rgba(239, 83, 80, 0.1) 0%, transparent 40%), radial-gradient(ellipse at 50% 50%, rgba(66, 165, 245, 0.08) 0%, transparent 50%), linear-gradient(180deg, #0a1a1f 0%, #0f2228 40%, #0a1a1f 100%)",

  cssVariables: {
    "--dna-glow-teal": "0 0 30px rgba(38, 166, 154, 0.4)",
    "--dna-glow-red": "0 0 25px rgba(239, 83, 80, 0.35)",
    "--dna-glow-blue": "0 0 20px rgba(66, 165, 245, 0.3)",
  },
};

export default dnaBlueprintTheme;
