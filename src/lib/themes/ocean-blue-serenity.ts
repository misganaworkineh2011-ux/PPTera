import type { Theme } from "./types";

export const oceanBlueSerenityTheme: Theme = {
  id: "ocean-blue-serenity",
  name: "Ocean Blue Serenity",
  description: "Calming ocean blue gradient from deep to light",
  colors: {
    primary: "#03045E",
    secondary: "#0077B6",
    accent: "#48CAE4",
    background: "#CAF0F8",
    surface: "#FFFFFF",
    text: "#03045E",
    textSecondary: "#023E8A",
    border: "#90E0EF",
    error: "#D32F2F",
    success: "#00B4D8",
    warning: "#E5BA41",
    info: "#48CAE4",
  },
  fonts: {
    heading: "system-ui, sans-serif",
    body: "system-ui, sans-serif",
  },
  design: {
    borderRadius: "12px",
    cardStyle: "elevated",
    spacing: "comfortable",
  },
  slideStyles: {
    titleSlide: {
      background: "linear-gradient(135deg, #03045E 0%, #0077B6 25%, #00B4D8 50%, #48CAE4 75%, #90E0EF 100%)",
      titleColor: "#FFFFFF",
      subtitleColor: "#CAF0F8",
    },
    contentSlide: {
      background: "#CAF0F8",
      titleColor: "#03045E",
      textColor: "#03045E",
    },
  },
};
