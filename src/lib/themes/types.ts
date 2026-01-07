// Theme type definitions
// Combines base structural tokens with theme-specific tokens

import type React from "react";

// ============================================================================
// THEME COLOR TOKENS (what changes per theme)
// ============================================================================
export interface ThemeColors {
  // Backgrounds
  background: string;
  backgroundAlt: string;
  surface: string;
  surfaceHover: string;
  
  // Text
  text: string;
  textMuted: string;
  textInverse: string;
  heading: string;
  
  // Brand
  primary: string;
  primaryHover: string;
  secondary: string;
  secondaryHover: string;
  accent: string;
  
  // Borders
  border: string;
  borderStrong: string;
  borderHover: string;
  
  // Effects
  shadow: string;
  overlay: string;
  glow: string;
  
  // Links (optional, defaults to primary)
  link: string;
  linkHover: string;
  
  // Status (optional)
  success: string;
  warning: string;
  error: string;
}

// ============================================================================
// THEME FONT TOKENS
// ============================================================================
export interface ThemeFonts {
  heading: { 
    family: string; 
    weight: number; 
    letterSpacing: string;
  };
  body: { 
    family: string; 
    weight: number; 
    lineHeight: string;
  };
  caption: { 
    family: string; 
    weight: number; 
    size: string;
  };
  mono?: {
    family: string;
  };
  // Google Fonts URLs to load for this theme
  googleFontsUrls?: string[];
}

// ============================================================================
// THEME DESIGN TOKENS (theme-specific overrides)
// ============================================================================
export interface ThemeDesign {
  borderRadius: { 
    small: string; 
    medium: string; 
    large: string; 
    full: string;
  };
  shadows: { 
    small: string; 
    medium: string; 
    large: string;
  };
  spacing: { 
    tight: string; 
    normal: string; 
    relaxed: string;
  };
}

// ============================================================================
// THEME SLIDE STYLES
// ============================================================================
export interface ThemeSlideStyles {
  title: { 
    background: string; 
    pattern?: string;
  };
  content: {
    background: string;
    bulletStyle: "disc" | "circle" | "square" | "dash" | "arrow" | "check";
  };
  image: { 
    borderRadius: string; 
    shadow: string; 
    overlay?: string;
  };
}

// ============================================================================
// THEME SLIDE SHAPE STYLES (for slide container appearance)
// ============================================================================
export type SlideShapeType = "sharp" | "rounded" | "soft";

export interface ThemeSlideShape {
  // Shape type: sharp (0 radius), rounded (subtle), soft (more rounded)
  type: SlideShapeType;
  // Border radius for the slide container
  borderRadius: string;
  // Shadow style: none, subtle, medium, deep, solid (hard offset shadow)
  shadow: "none" | "subtle" | "medium" | "deep" | "solid";
  // Solid shadow color (used when shadow is "solid")
  solidShadowColor?: string;
  // Border style
  border?: {
    width: string;
    color: string;
    style: "solid" | "none";
  };
}

// Default slide shapes for different styles
export const DEFAULT_SLIDE_SHAPES: Record<SlideShapeType, ThemeSlideShape> = {
  sharp: {
    type: "sharp",
    borderRadius: "0px",
    shadow: "medium",
  },
  rounded: {
    type: "rounded",
    borderRadius: "8px",
    shadow: "medium",
  },
  soft: {
    type: "soft",
    borderRadius: "16px",
    shadow: "deep",
  },
};

// Helper to get slide shape CSS styles
export function getSlideShapeStyles(shape?: ThemeSlideShape): React.CSSProperties {
  const defaultShape = DEFAULT_SLIDE_SHAPES.rounded;
  const s = shape || defaultShape;
  
  const shadowMap: Record<string, string> = {
    none: "none",
    subtle: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
    medium: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
    // Deep shadow fixed to bottom-right position
    deep: "8px 12px 24px rgba(0, 0, 0, 0.25), 4px 6px 12px rgba(0, 0, 0, 0.15)",
    // Solid shadow - hard offset with no blur (color set separately)
    solid: "none", // Will be overridden below if solidShadowColor is set
  };
  
  // For solid shadow, use the solidShadowColor or default to a pink/accent color
  let boxShadow = shadowMap[s.shadow] || shadowMap.medium;
  if (s.shadow === "solid") {
    const solidColor = s.solidShadowColor || "#f0abfc"; // Default pink if not specified
    boxShadow = `8px 8px 0px 0px ${solidColor}`;
  }
  
  return {
    borderRadius: s.borderRadius,
    boxShadow,
    ...(s.border && s.border.style !== "none" ? {
      borderWidth: s.border.width,
      borderColor: s.border.color,
      borderStyle: s.border.style,
    } : {}),
  };
}

// ============================================================================
// THEME CARD/BOX STYLES
// ============================================================================
export interface ThemeCardBox {
  background: string;
  borderColor: string;
  titleColor: string;
  bodyColor: string;
  accentColor: string;
  shadow: string;
  hoverBackground?: string;
  hoverBorderColor?: string;
}

// ============================================================================
// THEME LAYOUT ELEMENT STYLES (for inner cards/boxes inside slides)
// ============================================================================
export interface ThemeLayoutElements {
  background: string;       // Low brightness color (tends to white but themed)
  borderColor: string;      // Border for layout elements
  hoverBackground?: string; // Hover state
}

// ============================================================================
// THEME GRADIENTS
// ============================================================================
export interface ThemeGradients {
  primary: string;      // Main gradient (e.g., for buttons, accents)
  secondary: string;    // Secondary gradient (e.g., for backgrounds)
  overlay: string;      // Overlay gradient (e.g., for image overlays)
  text?: string;        // Text gradient (optional)
}

// ============================================================================
// MAIN THEME INTERFACE
// ============================================================================
export interface Theme {
  // Identity
  id: string;
  name: string;
  description: string;
  category: "professional" | "creative" | "minimal" | "bold" | "dark" | "light";
  
  // Core tokens
  colors: ThemeColors;
  fonts: ThemeFonts;
  design: ThemeDesign;
  slideStyles: ThemeSlideStyles;
  
  // Slide shape styling (container appearance)
  slideShape?: ThemeSlideShape;
  
  // Card/Box styling (for slide backgrounds)
  cardBox: ThemeCardBox;
  
  // Layout element styling (for inner cards/boxes inside slides)
  layoutElements?: ThemeLayoutElements;
  
  // Gradients
  gradients: ThemeGradients;
  
  // Preview (for theme selector UI)
  preview: {
    titleBg: string;
    bodyBg: string;
    textColor: string;
    accentColor: string;
  };
  
  // Optional background customization
  backgroundImage?: string;
  previewBackgroundImage?: string;
  backgroundPosition?: string;  // CSS background-position (e.g., "center", "top", "bottom 20%")
  backgroundSize?: string;      // CSS background-size (e.g., "cover", "contain", "100% auto")
  overlay?: string;
  pageBackground?: string;
  pageBackgroundGradient?: string;  // CSS gradient for page background (layered on top of pageBackground)
  
  // CSS variable overrides (for runtime theming)
  cssVariables?: Record<string, string>;
}

// ============================================================================
// THEME CSS VARIABLES MAP
// ============================================================================
export interface ThemeCSSVariables {
  // Colors
  "--slide-color-bg": string;
  "--slide-color-bg-alt": string;
  "--slide-color-surface": string;
  "--slide-color-surface-hover": string;
  "--slide-color-text": string;
  "--slide-color-text-muted": string;
  "--slide-color-text-inverse": string;
  "--slide-color-heading": string;
  "--slide-color-primary": string;
  "--slide-color-primary-hover": string;
  "--slide-color-secondary": string;
  "--slide-color-accent": string;
  "--slide-color-border": string;
  "--slide-color-border-strong": string;
  "--slide-color-overlay": string;
  "--slide-color-shadow": string;
  "--slide-glow-color": string;
  
  // Gradients
  "--slide-gradient-primary": string;
  "--slide-gradient-secondary": string;
  "--slide-gradient-overlay": string;
  
  // Fonts
  "--slide-font-heading": string;
  "--slide-font-body": string;
  "--slide-font-mono": string;
  
  // Card
  "--slide-card-bg": string;
  "--slide-card-border": string;
  "--slide-card-title": string;
  "--slide-card-body": string;
  "--slide-card-accent": string;
  "--slide-card-shadow": string;
  
  // Shadows
  "--slide-shadow-card": string;
  "--slide-shadow-elevated": string;
}
