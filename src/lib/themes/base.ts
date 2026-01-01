/**
 * Base Design System - Structural tokens that NEVER change across themes
 * These are the foundation that all themes build upon
 */

// ============================================================================
// SPACING SCALE
// ============================================================================
export const spacing = {
  0: "0",
  px: "1px",
  0.5: "0.125rem",  // 2px
  1: "0.25rem",     // 4px
  1.5: "0.375rem",  // 6px
  2: "0.5rem",      // 8px
  2.5: "0.625rem",  // 10px
  3: "0.75rem",     // 12px
  3.5: "0.875rem",  // 14px
  4: "1rem",        // 16px
  5: "1.25rem",     // 20px
  6: "1.5rem",      // 24px
  7: "1.75rem",     // 28px
  8: "2rem",        // 32px
  9: "2.25rem",     // 36px
  10: "2.5rem",     // 40px
  11: "2.75rem",    // 44px
  12: "3rem",       // 48px
  14: "3.5rem",     // 56px
  16: "4rem",       // 64px
  20: "5rem",       // 80px
  24: "6rem",       // 96px
  28: "7rem",       // 112px
  32: "8rem",       // 128px
  36: "9rem",       // 144px
  40: "10rem",      // 160px
  44: "11rem",      // 176px
  48: "12rem",      // 192px
} as const;

// ============================================================================
// TYPOGRAPHY SCALE
// ============================================================================
export const fontSize = {
  xs: ["0.75rem", { lineHeight: "1rem" }],        // 12px
  sm: ["0.875rem", { lineHeight: "1.25rem" }],    // 14px
  base: ["1rem", { lineHeight: "1.5rem" }],       // 16px
  lg: ["1.125rem", { lineHeight: "1.75rem" }],    // 18px
  xl: ["1.25rem", { lineHeight: "1.75rem" }],     // 20px
  "2xl": ["1.5rem", { lineHeight: "2rem" }],      // 24px
  "3xl": ["1.875rem", { lineHeight: "2.25rem" }], // 30px
  "4xl": ["2.25rem", { lineHeight: "2.5rem" }],   // 36px
  "5xl": ["3rem", { lineHeight: "1.15" }],        // 48px
  "6xl": ["3.75rem", { lineHeight: "1.1" }],      // 60px
  "7xl": ["4.5rem", { lineHeight: "1.05" }],      // 72px
  "8xl": ["6rem", { lineHeight: "1" }],           // 96px
  "9xl": ["8rem", { lineHeight: "1" }],           // 128px
} as const;

export const fontWeight = {
  thin: "100",
  extralight: "200",
  light: "300",
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  extrabold: "800",
  black: "900",
} as const;

export const lineHeight = {
  none: "1",
  tight: "1.25",
  snug: "1.375",
  normal: "1.5",
  relaxed: "1.625",
  loose: "2",
} as const;

export const letterSpacing = {
  tighter: "-0.05em",
  tight: "-0.025em",
  normal: "0em",
  wide: "0.025em",
  wider: "0.05em",
  widest: "0.1em",
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================
export const borderRadius = {
  none: "0",
  sm: "0.125rem",   // 2px
  DEFAULT: "0.25rem", // 4px
  md: "0.375rem",   // 6px
  lg: "0.5rem",     // 8px
  xl: "0.75rem",    // 12px
  "2xl": "1rem",    // 16px
  "3xl": "1.5rem",  // 24px
  full: "9999px",
} as const;

// ============================================================================
// SHADOWS
// ============================================================================
export const boxShadow = {
  none: "none",
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
  inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
} as const;


// ============================================================================
// Z-INDEX LAYERS
// ============================================================================
export const zIndex = {
  auto: "auto",
  0: "0",
  10: "10",
  20: "20",
  30: "30",
  40: "40",
  50: "50",
  // Semantic z-index
  dropdown: "1000",
  sticky: "1100",
  banner: "1200",
  overlay: "1300",
  modal: "1400",
  popover: "1500",
  tooltip: "1600",
  toast: "1700",
} as const;

// ============================================================================
// BREAKPOINTS
// ============================================================================
export const breakpoints = {
  xs: "475px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

// ============================================================================
// TRANSITIONS
// ============================================================================
export const transitionDuration = {
  75: "75ms",
  100: "100ms",
  150: "150ms",
  200: "200ms",
  300: "300ms",
  500: "500ms",
  700: "700ms",
  1000: "1000ms",
} as const;

export const transitionTimingFunction = {
  DEFAULT: "cubic-bezier(0.4, 0, 0.2, 1)",
  linear: "linear",
  in: "cubic-bezier(0.4, 0, 1, 1)",
  out: "cubic-bezier(0, 0, 0.2, 1)",
  "in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
} as const;

// ============================================================================
// OPACITY
// ============================================================================
export const opacity = {
  0: "0",
  5: "0.05",
  10: "0.1",
  20: "0.2",
  25: "0.25",
  30: "0.3",
  40: "0.4",
  50: "0.5",
  60: "0.6",
  70: "0.7",
  75: "0.75",
  80: "0.8",
  90: "0.9",
  95: "0.95",
  100: "1",
} as const;

// ============================================================================
// BLUR
// ============================================================================
export const blur = {
  none: "0",
  sm: "4px",
  DEFAULT: "8px",
  md: "12px",
  lg: "16px",
  xl: "24px",
  "2xl": "40px",
  "3xl": "64px",
} as const;

// ============================================================================
// ASPECT RATIOS
// ============================================================================
export const aspectRatio = {
  auto: "auto",
  square: "1 / 1",
  video: "16 / 9",
  slide: "16 / 9",      // Standard presentation slide
  portrait: "3 / 4",
  landscape: "4 / 3",
} as const;

// ============================================================================
// SLIDE-SPECIFIC BASE TOKENS
// ============================================================================
export const slideBase = {
  // Standard slide dimensions
  width: "100%",
  maxWidth: "1200px",
  aspectRatio: "16 / 9",
  
  // Content padding
  padding: {
    x: "3rem",      // 48px horizontal
    y: "2.5rem",    // 40px vertical
  },
  
  // Title sizes
  titleSize: {
    small: "2rem",      // 32px
    medium: "2.5rem",   // 40px
    large: "3rem",      // 48px
    hero: "4rem",       // 64px
  },
  
  // Body text sizes
  bodySize: {
    small: "0.875rem",  // 14px
    medium: "1rem",     // 16px
    large: "1.125rem",  // 18px
  },
  
  // Card/box sizes
  cardGap: "1.5rem",    // 24px gap between cards
  cardPadding: "1.5rem", // 24px internal padding
  
  // Image settings
  imageRadius: "0.75rem", // 12px
  imageShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
} as const;

// ============================================================================
// CSS VARIABLE NAMES (for runtime theming)
// ============================================================================
export const cssVarNames = {
  // Colors
  colorBg: "--slide-color-bg",
  colorBgAlt: "--slide-color-bg-alt",
  colorSurface: "--slide-color-surface",
  colorSurfaceHover: "--slide-color-surface-hover",
  colorText: "--slide-color-text",
  colorTextMuted: "--slide-color-text-muted",
  colorTextInverse: "--slide-color-text-inverse",
  colorHeading: "--slide-color-heading",
  colorPrimary: "--slide-color-primary",
  colorPrimaryHover: "--slide-color-primary-hover",
  colorSecondary: "--slide-color-secondary",
  colorAccent: "--slide-color-accent",
  colorBorder: "--slide-color-border",
  colorBorderStrong: "--slide-color-border-strong",
  colorOverlay: "--slide-color-overlay",
  colorShadow: "--slide-color-shadow",
  
  // Fonts
  fontHeading: "--slide-font-heading",
  fontBody: "--slide-font-body",
  fontMono: "--slide-font-mono",
  
  // Effects
  shadowCard: "--slide-shadow-card",
  shadowElevated: "--slide-shadow-elevated",
  glowColor: "--slide-glow-color",
  gradientPrimary: "--slide-gradient-primary",
  gradientSecondary: "--slide-gradient-secondary",
  
  // Card box specific
  cardBg: "--slide-card-bg",
  cardBorder: "--slide-card-border",
  cardTitle: "--slide-card-title",
  cardBody: "--slide-card-body",
  cardAccent: "--slide-card-accent",
} as const;

// ============================================================================
// EXPORT ALL BASE TOKENS
// ============================================================================
export const baseDesignSystem = {
  spacing,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  borderRadius,
  boxShadow,
  zIndex,
  breakpoints,
  transitionDuration,
  transitionTimingFunction,
  opacity,
  blur,
  aspectRatio,
  slideBase,
  cssVarNames,
} as const;

export type BaseDesignSystem = typeof baseDesignSystem;
