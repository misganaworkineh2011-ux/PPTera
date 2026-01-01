"use client";

import React, { createContext, useContext, useMemo, useEffect } from "react";
import type { Theme } from "./types";
import { themeToCSSVariables, getThemeStyleObject } from "./theme-utils";

// ============================================================================
// CONTEXT
// ============================================================================

interface ThemeContextValue {
  theme: Theme;
  cssVariables: ReturnType<typeof themeToCSSVariables>;
  styleObject: React.CSSProperties;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

interface ThemeProviderProps {
  theme: Theme;
  children: React.ReactNode;
  /**
   * If true, applies CSS variables to :root (document level)
   * If false, only applies to the provider's container
   */
  applyToRoot?: boolean;
}

export function SlideThemeProvider({ 
  theme, 
  children, 
  applyToRoot = false 
}: ThemeProviderProps) {
  const cssVariables = useMemo(() => themeToCSSVariables(theme), [theme]);
  const styleObject = useMemo(() => getThemeStyleObject(theme), [theme]);
  
  // Determine if theme is dark based on background color
  const isDark = useMemo(() => {
    const bg = theme.colors.background;
    if (bg.startsWith("rgb")) {
      const match = bg.match(/\d+/g);
      if (match && match.length >= 3) {
        const [r, g, b] = match.map(Number);
        const luminance = (0.299 * r! + 0.587 * g! + 0.114 * b!) / 255;
        return luminance < 0.5;
      }
    }
    if (bg.startsWith("#")) {
      const hex = bg.replace("#", "");
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance < 0.5;
    }
    return false;
  }, [theme.colors.background]);
  
  // Apply to document root if requested
  useEffect(() => {
    if (applyToRoot && typeof document !== "undefined") {
      const root = document.documentElement;
      Object.entries(cssVariables).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
      root.setAttribute("data-theme", theme.id);
      
      return () => {
        // Cleanup on unmount
        Object.keys(cssVariables).forEach((key) => {
          root.style.removeProperty(key);
        });
        root.removeAttribute("data-theme");
      };
    }
  }, [cssVariables, theme.id, applyToRoot]);
  
  const value = useMemo(() => ({
    theme,
    cssVariables,
    styleObject,
    isDark,
  }), [theme, cssVariables, styleObject, isDark]);
  
  return (
    <ThemeContext.Provider value={value}>
      <div 
        data-theme={theme.id}
        style={styleObject}
        className={isDark ? "dark" : "light"}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useSlideTheme() {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error("useSlideTheme must be used within a SlideThemeProvider");
  }
  
  return context;
}

// ============================================================================
// UTILITY HOOK - Get specific theme values
// ============================================================================

export function useThemeColors() {
  const { theme } = useSlideTheme();
  return theme.colors;
}

export function useThemeFonts() {
  const { theme } = useSlideTheme();
  return theme.fonts;
}

export function useThemeCardBox() {
  const { theme } = useSlideTheme();
  return theme.cardBox;
}

export function useThemeGradients() {
  const { theme } = useSlideTheme();
  return theme.gradients;
}
