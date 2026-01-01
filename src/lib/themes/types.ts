// Theme type definitions
// Combines base structural tokens with theme-specific tokens

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
  
  // Card/Box styling
  cardBox: ThemeCardBox;
  
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
  overlay?: string;
  pageBackground?: string;
  
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
