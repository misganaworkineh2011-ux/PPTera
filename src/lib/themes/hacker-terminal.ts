import type { Theme } from "./types";

// Theme 14: Hacker Terminal - Cybersecurity/Linux hacker aesthetic
// Features: Terminal-style elements, neon green accents, matrix vibes, monospace fonts
export const hackerTerminal: Theme = {
  id: "hacker-terminal",
  name: "Hacker Terminal",
  description:
    "A cybersecurity-inspired theme with neon green accents, terminal aesthetics, matrix-style elements, and dark hacker vibes",
  category: "bold",
  colors: {
    background: "#0d0d0d",
    backgroundAlt: "#141414",
    surface: "rgba(20, 20, 20, 0.9)",
    text: "#00ff41",
    textMuted: "#39ff14",
    heading: "#00ff41",
    link: "#39ff14",
    linkHover: "#7fff00",
    primary: "#00ff41",
    primaryHover: "#39ff14",
    secondary: "#00d4ff",
    secondaryHover: "#00ffff",
    accent: "#ff0040",
    border: "rgba(0, 255, 65, 0.3)",
    borderHover: "rgba(0, 255, 65, 0.5)",
    shadow: "rgba(0, 0, 0, 0.9)",
    success: "#00ff41",
    warning: "#ffff00",
    error: "#ff0040",
  },
  fonts: {
    heading: {
      family: "'JetBrains Mono', 'Fira Code', monospace",
      weight: 700,
      letterSpacing: "0.02em",
    },
    body: { family: "'JetBrains Mono', 'Fira Code', monospace", weight: 400, lineHeight: "1.7" },
    caption: { family: "'JetBrains Mono', 'Fira Code', monospace", weight: 500, size: "0.875rem" },
  },
  design: {
    borderRadius: {
      small: "0.25rem",
      medium: "0.5rem",
      large: "0.75rem",
      full: "9999px",
    },
    shadows: {
      small: "0 0 15px rgba(0, 255, 65, 0.2)",
      medium: "0 0 30px rgba(0, 255, 65, 0.3)",
      large: "0 0 50px rgba(0, 255, 65, 0.4)",
    },
    spacing: { tight: "0.5rem", normal: "1rem", relaxed: "1.5rem" },
  },
  slideStyles: {
    title: {
      background: "transparent",
      pattern: "none",
    },
    content: {
      background: "transparent",
      bulletStyle: "arrow",
    },
    image: {
      borderRadius: "0.5rem",
      shadow: "0 0 30px rgba(0, 255, 65, 0.3)",
      overlay: "linear-gradient(to top, rgba(13, 13, 13, 0.95) 0%, transparent 50%)",
    },
  },
  preview: {
    titleBg: "linear-gradient(135deg, #141414 0%, #0d0d0d 100%)",
    bodyBg: "#0d0d0d",
    textColor: "#00ff41",
    accentColor: "#00ff41",
  },
  backgroundImage:
    "https://wallpapers.com/images/hd/neon-green-kali-linux-hd-mzewo6w517vah9sx.jpg",
  previewBackgroundImage:
    "https://wallpapers.com/images/hd/neon-green-kali-linux-hd-mzewo6w517vah9sx.jpg",
  overlay:
    "linear-gradient(135deg, rgba(13, 13, 13, 0.7) 0%, rgba(20, 20, 20, 0.5) 50%, rgba(13, 13, 13, 0.8) 100%)",
  cardBox: {
    background: "rgba(13, 13, 13, 0.85)",
    borderColor: "rgba(0, 255, 65, 0.4)",
    titleColor: "#00ff41",
    bodyColor: "#39ff14",
    accentColor: "#00ff41",
    shadow: "0 0 20px rgba(0, 255, 65, 0.2), inset 0 1px 0 rgba(0, 255, 65, 0.1)",
  },
};
