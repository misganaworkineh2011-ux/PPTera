// Complete theme definitions for presentations
// Each theme includes colors, fonts, and design elements

export interface ThemeColors {
  // Background colors
  background: string;
  backgroundAlt: string;
  surface: string;
  
  // Text colors
  text: string;
  textMuted: string;
  heading: string;
  
  // Interactive elements
  link: string;
  linkHover: string;
  
  // Brand/accent colors
  primary: string;
  primaryHover: string;
  secondary: string;
  secondaryHover: string;
  accent: string;
  
  // UI elements
  border: string;
  borderHover: string;
  shadow: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
}

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
}

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
}

export const themes: Theme[] = [
  {
    id: "corporate-professional",
    name: "Corporate Professional",
    description: "Clean, trustworthy design perfect for business presentations",
    category: "professional",
    colors: {
      // Backgrounds
      background: "#ffffff",
      backgroundAlt: "#f8fafc",
      surface: "#ffffff",
      
      // Text
      text: "#334155",
      textMuted: "#64748b",
      heading: "#0f172a",
      
      // Links
      link: "#2563eb",
      linkHover: "#1d4ed8",
      
      // Brand colors
      primary: "#2563eb",
      primaryHover: "#1d4ed8",
      secondary: "#64748b",
      secondaryHover: "#475569",
      accent: "#0ea5e9",
      
      // UI
      border: "#e2e8f0",
      borderHover: "#cbd5e1",
      shadow: "rgba(15, 23, 42, 0.08)",
      
      // Status
      success: "#22c55e",
      warning: "#f59e0b",
      error: "#ef4444",
    },
    fonts: {
      heading: {
        family: "'Playfair Display', serif",
        weight: 700,
        letterSpacing: "-0.01em",
      },
      body: {
        family: "'Lato', sans-serif",
        weight: 400,
        lineHeight: "1.6",
      },
      caption: {
        family: "'Lato', sans-serif",
        weight: 500,
        size: "0.875rem",
      },
    },
    design: {
      borderRadius: {
        small: "0.375rem",
        medium: "0.5rem",
        large: "0.75rem",
        full: "9999px",
      },
      shadows: {
        small: "0 1px 2px rgba(15, 23, 42, 0.05)",
        medium: "0 4px 6px -1px rgba(15, 23, 42, 0.1), 0 2px 4px -2px rgba(15, 23, 42, 0.1)",
        large: "0 10px 15px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -4px rgba(15, 23, 42, 0.1)",
      },
      spacing: {
        tight: "0.5rem",
        normal: "1rem",
        relaxed: "1.5rem",
      },
    },
    slideStyles: {
      title: {
        background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
      },
      content: {
        background: "#ffffff",
        bulletStyle: "disc",
      },
      image: {
        borderRadius: "0.5rem",
        shadow: "0 4px 6px -1px rgba(15, 23, 42, 0.1)",
      },
    },
    preview: {
      titleBg: "#2563eb",
      bodyBg: "#ffffff",
      textColor: "#334155",
      accentColor: "#2563eb",
    },
  },
  {
    id: "elegant-dark",
    name: "Elegant Dark",
    description: "Sophisticated dark theme with subtle gradients and modern typography",
    category: "bold",
    colors: {
      // Backgrounds
      background: "#0f172a",
      backgroundAlt: "#1e293b",
      surface: "#1e293b",
      
      // Text
      text: "#cbd5e1",
      textMuted: "#94a3b8",
      heading: "#f1f5f9",
      
      // Links
      link: "#38bdf8",
      linkHover: "#7dd3fc",
      
      // Brand colors
      primary: "#38bdf8",
      primaryHover: "#7dd3fc",
      secondary: "#475569",
      secondaryHover: "#64748b",
      accent: "#a78bfa",
      
      // UI
      border: "#334155",
      borderHover: "#475569",
      shadow: "rgba(0, 0, 0, 0.3)",
      
      // Status
      success: "#4ade80",
      warning: "#fbbf24",
      error: "#f87171",
    },
    fonts: {
      heading: {
        family: "'Outfit', sans-serif",
        weight: 700,
        letterSpacing: "-0.02em",
      },
      body: {
        family: "'Plus Jakarta Sans', sans-serif",
        weight: 400,
        lineHeight: "1.7",
      },
      caption: {
        family: "'Plus Jakarta Sans', sans-serif",
        weight: 500,
        size: "0.875rem",
      },
    },
    design: {
      borderRadius: {
        small: "0.5rem",
        medium: "0.75rem",
        large: "1rem",
        full: "9999px",
      },
      shadows: {
        small: "0 2px 4px rgba(0, 0, 0, 0.2)",
        medium: "0 4px 12px rgba(0, 0, 0, 0.25)",
        large: "0 8px 24px rgba(0, 0, 0, 0.3)",
      },
      spacing: {
        tight: "0.5rem",
        normal: "1.25rem",
        relaxed: "2rem",
      },
    },
    slideStyles: {
      title: {
        background: "linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e293b 100%)",
        pattern: "radial-gradient(circle at 25% 25%, rgba(56, 189, 248, 0.1) 0%, transparent 50%)",
      },
      content: {
        background: "#0f172a",
        bulletStyle: "arrow",
      },
      image: {
        borderRadius: "0.75rem",
        shadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
        overlay: "linear-gradient(to top, rgba(15, 23, 42, 0.8) 0%, transparent 50%)",
      },
    },
    preview: {
      titleBg: "#1e293b",
      bodyBg: "#0f172a",
      textColor: "#cbd5e1",
      accentColor: "#38bdf8",
    },
  },
];

export const getThemeById = (id: string): Theme | undefined => {
  return themes.find((theme) => theme.id === id);
};

export const getDefaultTheme = (): Theme => {
  return themes[0]!;
};

