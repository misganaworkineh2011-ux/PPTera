// Theme type definitions

export interface ThemeColors {
  background: string;
  backgroundAlt: string;
  surface: string;
  text: string;
  textMuted: string;
  heading: string;
  link: string;
  linkHover: string;
  primary: string;
  primaryHover: string;
  secondary: string;
  secondaryHover: string;
  accent: string;
  border: string;
  borderHover: string;
  shadow: string;
  success: string;
  warning: string;
  error: string;
}

export interface ThemeFonts {
  heading: { family: string; weight: number; letterSpacing: string };
  body: { family: string; weight: number; lineHeight: string };
  caption: { family: string; weight: number; size: string };
}

export interface ThemeDesign {
  borderRadius: { small: string; medium: string; large: string; full: string };
  shadows: { small: string; medium: string; large: string };
  spacing: { tight: string; normal: string; relaxed: string };
}

export interface ThemeSlideStyles {
  title: { background: string; pattern?: string };
  content: {
    background: string;
    bulletStyle: "disc" | "circle" | "square" | "dash" | "arrow" | "check";
  };
  image: { borderRadius: string; shadow: string; overlay?: string };
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  category: "professional" | "creative" | "minimal" | "bold";
  colors: ThemeColors;
  fonts: ThemeFonts;
  design: ThemeDesign;
  slideStyles: ThemeSlideStyles;
  preview: {
    titleBg: string;
    bodyBg: string;
    textColor: string;
    accentColor: string;
  };
  backgroundImage?: string;
  previewBackgroundImage?: string;
  overlay?: string;
  cardBox?: {
    background: string;
    borderColor?: string;
    titleColor: string;
    bodyColor: string;
    accentColor: string;
    shadow?: string;
  };
}
