# Theme System Architecture

This theme system is designed like Gamma's approach - with a **base structural layer** that never changes and **theme-specific tokens** that define each theme's unique look.

## Structure

```
src/lib/themes/
├── base.ts              # Base structural tokens (NEVER change)
├── types.ts             # TypeScript interfaces
├── theme-utils.ts       # Utility functions
├── ThemeProvider.tsx    # React context & hooks
├── index.ts             # Main exports
├── corporate-clean.ts   # Light professional theme
├── elegant-noir.ts      # Dark elegant theme
└── README.md            # This file

src/styles/
└── theme-variables.css  # CSS variable definitions
```

## Two Layers

### 1. Base Layer (Structural - Never Changes)

These tokens are the same across ALL themes:

- **Spacing scale**: `--space-0` to `--space-48`
- **Font sizes**: `--text-xs` to `--text-9xl`
- **Border radius**: `--radius-none` to `--radius-full`
- **Z-index layers**: `--z-dropdown`, `--z-modal`, etc.
- **Transitions**: `--duration-*`, `--ease-*`
- **Slide dimensions**: `--slide-max-width`, `--slide-padding-*`

### 2. Theme Layer (Changes Per Theme)

These tokens define each theme's unique appearance:

- **Colors**: `--slide-color-bg`, `--slide-color-text`, `--slide-color-primary`, etc.
- **Fonts**: `--slide-font-heading`, `--slide-font-body`
- **Gradients**: `--slide-gradient-primary`, `--slide-gradient-secondary`
- **Card styles**: `--slide-card-bg`, `--slide-card-border`, etc.
- **Shadows**: `--slide-shadow-card`, `--slide-shadow-elevated`

## Usage

### 1. Import CSS Variables

```tsx
// In your root layout or globals.css
import "~/styles/theme-variables.css";
```

### 2. Use Theme Provider

```tsx
import { SlideThemeProvider } from "~/lib/themes";
import { corporateClean } from "~/lib/themes";

function Presentation() {
  return (
    <SlideThemeProvider theme={corporateClean}>
      <Slide />
    </SlideThemeProvider>
  );
}
```

### 3. Use Theme Hooks

```tsx
import { useSlideTheme, useThemeColors } from "~/lib/themes";

function SlideCard() {
  const { theme, isDark } = useSlideTheme();
  const colors = useThemeColors();
  
  return (
    <div className="slide-card">
      <h3 style={{ color: colors.heading }}>Title</h3>
    </div>
  );
}
```

### 4. Use CSS Classes

```tsx
// Theme-aware utility classes
<div className="bg-slide text-slide">
  <h1 className="text-slide-heading font-slide-heading">Title</h1>
  <p className="text-slide-muted">Subtitle</p>
  <div className="slide-card">Card content</div>
</div>
```

### 5. Use CSS Variables Directly

```tsx
<div style={{ 
  background: "var(--slide-color-bg)",
  color: "var(--slide-color-text)",
  padding: "var(--space-6)",
  borderRadius: "var(--radius-lg)"
}}>
  Content
</div>
```

## Creating a New Theme

1. Create a new file: `src/lib/themes/my-theme.ts`
2. Implement the `Theme` interface:

```typescript
import type { Theme } from "./types";

export const myTheme: Theme = {
  id: "my-theme",
  name: "My Theme",
  description: "Description of my theme",
  category: "creative", // professional | creative | minimal | bold | dark | light
  
  colors: {
    background: "#ffffff",
    backgroundAlt: "#f5f5f5",
    surface: "#ffffff",
    surfaceHover: "#f0f0f0",
    text: "#1a1a1a",
    textMuted: "#666666",
    textInverse: "#ffffff",
    heading: "#000000",
    primary: "#3b82f6",
    primaryHover: "#2563eb",
    secondary: "#8b5cf6",
    secondaryHover: "#7c3aed",
    accent: "#06b6d4",
    border: "#e5e5e5",
    borderStrong: "#d4d4d4",
    borderHover: "#d4d4d4",
    shadow: "rgba(0, 0, 0, 0.1)",
    overlay: "rgba(0, 0, 0, 0.5)",
    glow: "rgba(59, 130, 246, 0.4)",
    link: "#3b82f6",
    linkHover: "#2563eb",
    success: "#22c55e",
    warning: "#f59e0b",
    error: "#ef4444",
  },
  
  fonts: {
    heading: { family: "'Inter', sans-serif", weight: 700, letterSpacing: "-0.02em" },
    body: { family: "'Inter', sans-serif", weight: 400, lineHeight: "1.6" },
    caption: { family: "'Inter', sans-serif", weight: 500, size: "0.875rem" },
    mono: { family: "'JetBrains Mono', monospace" },
  },
  
  design: {
    borderRadius: { small: "0.25rem", medium: "0.5rem", large: "0.75rem", full: "9999px" },
    shadows: { small: "...", medium: "...", large: "..." },
    spacing: { tight: "0.5rem", normal: "1rem", relaxed: "2rem" },
  },
  
  gradients: {
    primary: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
    secondary: "linear-gradient(135deg, #ffffff, #f5f5f5)",
    overlay: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
  },
  
  slideStyles: { ... },
  cardBox: { ... },
  preview: { ... },
};
```

3. Add to `index.ts`:

```typescript
import { myTheme } from "./my-theme";
export { myTheme };
export const themes = [corporateClean, elegantNoir, myTheme];
```

## Key Principles

1. **Base tokens are immutable** - Spacing, font sizes, breakpoints never change
2. **Theme tokens are semantic** - Use `--slide-color-primary` not `--blue-500`
3. **Components use theme tokens** - Never hardcode colors in components
4. **CSS variables enable runtime theming** - Switch themes without rebuild
5. **TypeScript ensures consistency** - All themes implement the same interface
