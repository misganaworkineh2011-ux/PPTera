/**
 * Theme Utilities
 * Helpers for converting themes to CSS variables and applying them
 */

import type { Theme, ThemeCSSVariables } from "./types";

/**
 * Convert a Theme object to CSS variables
 */
export function themeToCSSVariables(theme: Theme): ThemeCSSVariables {
  return {
    // Colors
    "--slide-color-bg": theme.colors.background,
    "--slide-color-bg-alt": theme.colors.backgroundAlt,
    "--slide-color-surface": theme.colors.surface,
    "--slide-color-surface-hover": theme.colors.surfaceHover,
    "--slide-color-text": theme.colors.text,
    "--slide-color-text-muted": theme.colors.textMuted,
    "--slide-color-text-inverse": theme.colors.textInverse,
    "--slide-color-heading": theme.colors.heading,
    "--slide-color-primary": theme.colors.primary,
    "--slide-color-primary-hover": theme.colors.primaryHover,
    "--slide-color-secondary": theme.colors.secondary,
    "--slide-color-accent": theme.colors.accent,
    "--slide-color-border": theme.colors.border,
    "--slide-color-border-strong": theme.colors.borderStrong,
    "--slide-color-overlay": theme.colors.overlay,
    "--slide-color-shadow": theme.colors.shadow,
    "--slide-glow-color": theme.colors.glow,
    
    // Gradients
    "--slide-gradient-primary": theme.gradients.primary,
    "--slide-gradient-secondary": theme.gradients.secondary,
    "--slide-gradient-overlay": theme.gradients.overlay,
    
    // Fonts
    "--slide-font-heading": theme.fonts.heading.family,
    "--slide-font-body": theme.fonts.body.family,
    "--slide-font-mono": theme.fonts.mono?.family || "'JetBrains Mono', monospace",
    
    // Card
    "--slide-card-bg": theme.cardBox.background,
    "--slide-card-border": theme.cardBox.borderColor,
    "--slide-card-title": theme.cardBox.titleColor,
    "--slide-card-body": theme.cardBox.bodyColor,
    "--slide-card-accent": theme.cardBox.accentColor,
    "--slide-card-shadow": theme.cardBox.shadow,
    
    // Shadows
    "--slide-shadow-card": `0 4px 6px -1px ${theme.colors.shadow}, 0 2px 4px -2px ${theme.colors.shadow}`,
    "--slide-shadow-elevated": `0 20px 25px -5px ${theme.colors.shadow}, 0 8px 10px -6px ${theme.colors.shadow}`,
  };
}

/**
 * Apply theme CSS variables to an element
 */
export function applyThemeToElement(element: HTMLElement, theme: Theme): void {
  const cssVars = themeToCSSVariables(theme);
  
  Object.entries(cssVars).forEach(([key, value]) => {
    element.style.setProperty(key, value);
  });
  
  // Also set data-theme attribute for CSS selectors
  element.setAttribute("data-theme", theme.id);
}

/**
 * Generate inline style object from theme (for React)
 */
export function getThemeStyleObject(theme: Theme): React.CSSProperties {
  const cssVars = themeToCSSVariables(theme);
  
  // Convert to React style object (camelCase not needed for CSS vars)
  return cssVars as unknown as React.CSSProperties;
}

/**
 * Generate CSS string from theme (for SSR or style tags)
 */
export function generateThemeCSS(theme: Theme, selector = ":root"): string {
  const cssVars = themeToCSSVariables(theme);
  
  const cssLines = Object.entries(cssVars)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join("\n");
  
  return `${selector} {\n${cssLines}\n}`;
}

/**
 * Check if a color is dark (for determining text color)
 */
export function isColorDark(hexColor: string): boolean {
  // Handle rgba/rgb colors
  if (hexColor.startsWith("rgb")) {
    const match = hexColor.match(/\d+/g);
    if (match && match.length >= 3) {
      const [r, g, b] = match.map(Number);
      const luminance = (0.299 * r! + 0.587 * g! + 0.114 * b!) / 255;
      return luminance < 0.5;
    }
    return false;
  }
  
  // Handle hex colors
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

/**
 * Get contrasting text color for a background
 */
export function getContrastingTextColor(bgColor: string): string {
  return isColorDark(bgColor) ? "#ffffff" : "#1e293b";
}

/**
 * Lighten a hex color
 */
export function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  
  return `#${(
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  )
    .toString(16)
    .slice(1)}`;
}

/**
 * Darken a hex color
 */
export function darkenColor(hex: string, percent: number): string {
  return lightenColor(hex, -percent);
}

/**
 * Add alpha to a hex color
 */
export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
