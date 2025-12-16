// Single sophisticated theme for presentations
// A beautiful, modern design with elegant gradients and typography

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
  heading: { family: string; weight: number; letterSpacing: string; };
  body: { family: string; weight: number; lineHeight: string; };
  caption: { family: string; weight: number; size: string; };
}

export interface ThemeDesign {
  borderRadius: { small: string; medium: string; large: string; full: string; };
  shadows: { small: string; medium: string; large: string; };
  spacing: { tight: string; normal: string; relaxed: string; };
}

export interface ThemeSlideStyles {
  title: { background: string; pattern?: string; };
  content: { background: string; bulletStyle: "disc" | "circle" | "square" | "dash" | "arrow" | "check"; };
  image: { borderRadius: string; shadow: string; overlay?: string; };
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
  preview: { titleBg: string; bodyBg: string; textColor: string; accentColor: string; };
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

// Theme 1: Elegant Noir - Sophisticated dark theme
const elegantNoir: Theme = {
  id: "elegant-noir",
  name: "Elegant Noir",
  description: "A sophisticated dark theme with warm accents and modern typography",
  category: "bold",
  colors: {
    background: "#0a0a0b",
    backgroundAlt: "#141416",
    surface: "#1a1a1d",
    text: "#e4e4e7",
    textMuted: "#a1a1aa",
    heading: "#fafafa",
    link: "#f59e0b",
    linkHover: "#fbbf24",
    primary: "#f59e0b",
    primaryHover: "#fbbf24",
    secondary: "#6366f1",
    secondaryHover: "#818cf8",
    accent: "#ec4899",
    border: "#27272a",
    borderHover: "#3f3f46",
    shadow: "rgba(0, 0, 0, 0.5)",
    success: "#22c55e",
    warning: "#f59e0b",
    error: "#ef4444",
  },
  fonts: {
    heading: { family: "'Inter', sans-serif", weight: 700, letterSpacing: "-0.03em" },
    body: { family: "'Inter', sans-serif", weight: 400, lineHeight: "1.7" },
    caption: { family: "'Inter', sans-serif", weight: 500, size: "0.875rem" },
  },
  design: {
    borderRadius: { small: "0.5rem", medium: "0.75rem", large: "1rem", full: "9999px" },
    shadows: {
      small: "0 2px 8px rgba(0, 0, 0, 0.3)",
      medium: "0 8px 24px rgba(0, 0, 0, 0.4)",
      large: "0 16px 48px rgba(0, 0, 0, 0.5)",
    },
    spacing: { tight: "0.5rem", normal: "1.25rem", relaxed: "2rem" },
  },
  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #0a0a0b 0%, #1a1a1d 50%, #0a0a0b 100%)",
      pattern: "radial-gradient(ellipse at 30% 20%, rgba(245, 158, 11, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 40%)",
    },
    content: {
      background: "linear-gradient(180deg, #0a0a0b 0%, #141416 100%)",
      bulletStyle: "circle",
    },
    image: {
      borderRadius: "0.75rem",
      shadow: "0 20px 50px rgba(0, 0, 0, 0.6)",
      overlay: "linear-gradient(to top, rgba(10, 10, 11, 0.9) 0%, transparent 60%)",
    },
  },
  preview: {
    titleBg: "linear-gradient(135deg, #1a1a1d 0%, #27272a 100%)",
    bodyBg: "#0a0a0b",
    textColor: "#e4e4e7",
    accentColor: "#f59e0b",
  },
  overlay: "linear-gradient(180deg, rgba(10, 10, 11, 0.4) 0%, rgba(10, 10, 11, 0.2) 100%)",
  cardBox: {
    background: "rgba(26, 26, 29, 0.8)",
    borderColor: "rgba(245, 158, 11, 0.2)",
    titleColor: "#fafafa",
    bodyColor: "#e4e4e7",
    accentColor: "#f59e0b",
    shadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
  },
};

// Theme 2: Arctic Frost - Clean, modern light theme with cool tones
const arcticFrost: Theme = {
  id: "arctic-frost",
  name: "Arctic Frost",
  description: "A crisp, modern light theme with cool cyan accents and clean typography",
  category: "minimal",
  colors: {
    background: "#f8fafc",
    backgroundAlt: "#f1f5f9",
    surface: "#ffffff",
    text: "#334155",
    textMuted: "#64748b",
    heading: "#0f172a",
    link: "#0891b2",
    linkHover: "#06b6d4",
    primary: "#0891b2",
    primaryHover: "#06b6d4",
    secondary: "#8b5cf6",
    secondaryHover: "#a78bfa",
    accent: "#f43f5e",
    border: "#e2e8f0",
    borderHover: "#cbd5e1",
    shadow: "rgba(15, 23, 42, 0.08)",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
  },
  fonts: {
    heading: { family: "'Inter', sans-serif", weight: 700, letterSpacing: "-0.03em" },
    body: { family: "'Inter', sans-serif", weight: 400, lineHeight: "1.7" },
    caption: { family: "'Inter', sans-serif", weight: 500, size: "0.875rem" },
  },
  design: {
    borderRadius: { small: "0.5rem", medium: "0.75rem", large: "1rem", full: "9999px" },
    shadows: {
      small: "0 2px 8px rgba(15, 23, 42, 0.06)",
      medium: "0 8px 24px rgba(15, 23, 42, 0.1)",
      large: "0 16px 48px rgba(15, 23, 42, 0.12)",
    },
    spacing: { tight: "0.5rem", normal: "1.25rem", relaxed: "2rem" },
  },
  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #f0f9ff 100%)",
      pattern: "radial-gradient(ellipse at 30% 20%, rgba(8, 145, 178, 0.1) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(139, 92, 246, 0.08) 0%, transparent 40%)",
    },
    content: {
      background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
      bulletStyle: "circle",
    },
    image: {
      borderRadius: "0.75rem",
      shadow: "0 20px 50px rgba(15, 23, 42, 0.15)",
      overlay: "linear-gradient(to top, rgba(248, 250, 252, 0.9) 0%, transparent 60%)",
    },
  },
  preview: {
    titleBg: "linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)",
    bodyBg: "#f8fafc",
    textColor: "#334155",
    accentColor: "#0891b2",
  },
  overlay: "linear-gradient(180deg, rgba(248, 250, 252, 0.4) 0%, rgba(248, 250, 252, 0.2) 100%)",
  cardBox: {
    background: "rgba(255, 255, 255, 0.9)",
    borderColor: "rgba(8, 145, 178, 0.2)",
    titleColor: "#0f172a",
    bodyColor: "#334155",
    accentColor: "#0891b2",
    shadow: "0 8px 32px rgba(15, 23, 42, 0.1)",
  },
};

// Theme 3: Sunset Gradient - Warm, vibrant creative theme with rose/orange/purple tones
const sunsetGradient: Theme = {
  id: "sunset-gradient",
  name: "Sunset Gradient",
  description: "A warm, vibrant theme with beautiful rose and orange gradients for creative presentations",
  category: "creative",
  colors: {
    background: "#1c1017",
    backgroundAlt: "#261520",
    surface: "#2d1a24",
    text: "#fce7f3",
    textMuted: "#f9a8d4",
    heading: "#ffffff",
    link: "#fb923c",
    linkHover: "#fdba74",
    primary: "#f472b6",
    primaryHover: "#f9a8d4",
    secondary: "#fb923c",
    secondaryHover: "#fdba74",
    accent: "#a855f7",
    border: "#4c1d3d",
    borderHover: "#6b2150",
    shadow: "rgba(28, 16, 23, 0.6)",
    success: "#4ade80",
    warning: "#fbbf24",
    error: "#f87171",
  },
  fonts: {
    heading: { family: "'Inter', sans-serif", weight: 700, letterSpacing: "-0.03em" },
    body: { family: "'Inter', sans-serif", weight: 400, lineHeight: "1.7" },
    caption: { family: "'Inter', sans-serif", weight: 500, size: "0.875rem" },
  },
  design: {
    borderRadius: { small: "0.5rem", medium: "0.75rem", large: "1rem", full: "9999px" },
    shadows: {
      small: "0 2px 8px rgba(28, 16, 23, 0.4)",
      medium: "0 8px 24px rgba(28, 16, 23, 0.5)",
      large: "0 16px 48px rgba(28, 16, 23, 0.6)",
    },
    spacing: { tight: "0.5rem", normal: "1.25rem", relaxed: "2rem" },
  },
  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #1c1017 0%, #2d1a24 30%, #1c1017 100%)",
      pattern: "radial-gradient(ellipse at 20% 30%, rgba(244, 114, 182, 0.2) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(251, 146, 60, 0.15) 0%, transparent 45%)",
    },
    content: {
      background: "linear-gradient(180deg, #1c1017 0%, #261520 100%)",
      bulletStyle: "circle",
    },
    image: {
      borderRadius: "0.75rem",
      shadow: "0 20px 50px rgba(28, 16, 23, 0.7)",
      overlay: "linear-gradient(to top, rgba(28, 16, 23, 0.95) 0%, transparent 60%)",
    },
  },
  preview: {
    titleBg: "linear-gradient(135deg, #2d1a24 0%, #4c1d3d 100%)",
    bodyBg: "#1c1017",
    textColor: "#fce7f3",
    accentColor: "#f472b6",
  },
  overlay: "linear-gradient(180deg, rgba(28, 16, 23, 0.4) 0%, rgba(28, 16, 23, 0.2) 100%)",
  cardBox: {
    background: "rgba(45, 26, 36, 0.85)",
    borderColor: "rgba(244, 114, 182, 0.25)",
    titleColor: "#ffffff",
    bodyColor: "#fce7f3",
    accentColor: "#f472b6",
    shadow: "0 8px 32px rgba(28, 16, 23, 0.5)",
  },
};

// Theme 4: Ocean Depths - Stunning teal/emerald theme with unique geometric layouts
const oceanDepths: Theme = {
  id: "ocean-depths",
  name: "Ocean Depths",
  description: "A stunning deep teal theme with emerald accents, diagonal cuts, and circular image frames",
  category: "creative",
  colors: {
    background: "#0a1628",
    backgroundAlt: "#0d1f35",
    surface: "#122a45",
    text: "#e0f2fe",
    textMuted: "#7dd3fc",
    heading: "#ffffff",
    link: "#2dd4bf",
    linkHover: "#5eead4",
    primary: "#14b8a6",
    primaryHover: "#2dd4bf",
    secondary: "#06b6d4",
    secondaryHover: "#22d3ee",
    accent: "#a78bfa",
    border: "#1e3a5f",
    borderHover: "#2563eb",
    shadow: "rgba(10, 22, 40, 0.7)",
    success: "#34d399",
    warning: "#fbbf24",
    error: "#f87171",
  },
  fonts: {
    heading: { family: "'Inter', sans-serif", weight: 700, letterSpacing: "-0.02em" },
    body: { family: "'Inter', sans-serif", weight: 400, lineHeight: "1.7" },
    caption: { family: "'Inter', sans-serif", weight: 500, size: "0.875rem" },
  },
  design: {
    borderRadius: { small: "0.5rem", medium: "1rem", large: "1.5rem", full: "9999px" },
    shadows: {
      small: "0 2px 8px rgba(10, 22, 40, 0.4)",
      medium: "0 8px 24px rgba(10, 22, 40, 0.5)",
      large: "0 16px 48px rgba(10, 22, 40, 0.6)",
    },
    spacing: { tight: "0.5rem", normal: "1.25rem", relaxed: "2rem" },
  },
  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #0a1628 0%, #0d1f35 40%, #122a45 100%)",
      pattern: "radial-gradient(ellipse at 20% 80%, rgba(20, 184, 166, 0.2) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(6, 182, 212, 0.15) 0%, transparent 45%), radial-gradient(circle at 50% 50%, rgba(167, 139, 250, 0.08) 0%, transparent 60%)",
    },
    content: {
      background: "linear-gradient(180deg, #0a1628 0%, #0d1f35 100%)",
      bulletStyle: "circle",
    },
    image: {
      borderRadius: "1rem",
      shadow: "0 20px 50px rgba(10, 22, 40, 0.7)",
      overlay: "linear-gradient(to top, rgba(10, 22, 40, 0.95) 0%, transparent 60%)",
    },
  },
  preview: {
    titleBg: "linear-gradient(135deg, #0d1f35 0%, #1e3a5f 100%)",
    bodyBg: "#0a1628",
    textColor: "#e0f2fe",
    accentColor: "#14b8a6",
  },
  overlay: "linear-gradient(180deg, rgba(10, 22, 40, 0.4) 0%, rgba(10, 22, 40, 0.2) 100%)",
  cardBox: {
    background: "rgba(18, 42, 69, 0.85)",
    borderColor: "rgba(20, 184, 166, 0.3)",
    titleColor: "#ffffff",
    bodyColor: "#e0f2fe",
    accentColor: "#14b8a6",
    shadow: "0 8px 32px rgba(10, 22, 40, 0.5)",
  },
};

// Theme 5: Aurora Borealis - Magical purple/green aurora theme with glass morphism and unique shapes
const auroraBorealis: Theme = {
  id: "aurora-borealis",
  name: "Aurora Borealis",
  description: "A magical aurora-inspired theme with purple and green gradients, glass morphism, and hexagonal frames",
  category: "creative",
  colors: {
    background: "#0f0a1a",
    backgroundAlt: "#150d24",
    surface: "#1a1030",
    text: "#e8e0f0",
    textMuted: "#b8a8d0",
    heading: "#ffffff",
    link: "#a855f7",
    linkHover: "#c084fc",
    primary: "#a855f7",
    primaryHover: "#c084fc",
    secondary: "#22c55e",
    secondaryHover: "#4ade80",
    accent: "#06b6d4",
    border: "#2d1f4a",
    borderHover: "#4c3575",
    shadow: "rgba(15, 10, 26, 0.8)",
    success: "#22c55e",
    warning: "#fbbf24",
    error: "#f87171",
  },
  fonts: {
    heading: { family: "'Inter', sans-serif", weight: 700, letterSpacing: "-0.02em" },
    body: { family: "'Inter', sans-serif", weight: 400, lineHeight: "1.7" },
    caption: { family: "'Inter', sans-serif", weight: 500, size: "0.875rem" },
  },
  design: {
    borderRadius: { small: "0.75rem", medium: "1.25rem", large: "2rem", full: "9999px" },
    shadows: {
      small: "0 2px 12px rgba(168, 85, 247, 0.15)",
      medium: "0 8px 32px rgba(168, 85, 247, 0.2)",
      large: "0 20px 60px rgba(168, 85, 247, 0.25)",
    },
    spacing: { tight: "0.5rem", normal: "1.25rem", relaxed: "2rem" },
  },
  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #0f0a1a 0%, #1a1030 40%, #150d24 100%)",
      pattern: "radial-gradient(ellipse at 30% 20%, rgba(168, 85, 247, 0.25) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(34, 197, 94, 0.15) 0%, transparent 45%), radial-gradient(ellipse at 50% 50%, rgba(6, 182, 212, 0.1) 0%, transparent 60%)",
    },
    content: {
      background: "linear-gradient(180deg, #0f0a1a 0%, #150d24 100%)",
      bulletStyle: "circle",
    },
    image: {
      borderRadius: "1.25rem",
      shadow: "0 25px 60px rgba(168, 85, 247, 0.3)",
      overlay: "linear-gradient(to top, rgba(15, 10, 26, 0.95) 0%, transparent 60%)",
    },
  },
  preview: {
    titleBg: "linear-gradient(135deg, #1a1030 0%, #2d1f4a 100%)",
    bodyBg: "#0f0a1a",
    textColor: "#e8e0f0",
    accentColor: "#a855f7",
  },
  overlay: "linear-gradient(180deg, rgba(15, 10, 26, 0.4) 0%, rgba(15, 10, 26, 0.2) 100%)",
  cardBox: {
    background: "rgba(26, 16, 48, 0.85)",
    borderColor: "rgba(168, 85, 247, 0.3)",
    titleColor: "#ffffff",
    bodyColor: "#e8e0f0",
    accentColor: "#a855f7",
    shadow: "0 8px 40px rgba(168, 85, 247, 0.2)",
  },
};

// Theme 6: Ember Forge - Fiery red/orange theme with diamond frames and molten effects
const emberForge: Theme = {
  id: "ember-forge",
  name: "Ember Forge",
  description: "A bold, fiery theme with red and orange gradients, diamond-shaped frames, and molten ember effects",
  category: "bold",
  colors: {
    background: "#1a0a0a",
    backgroundAlt: "#2a1010",
    surface: "#3a1515",
    text: "#fef2f2",
    textMuted: "#fca5a5",
    heading: "#ffffff",
    link: "#f97316",
    linkHover: "#fb923c",
    primary: "#ef4444",
    primaryHover: "#f87171",
    secondary: "#f97316",
    secondaryHover: "#fb923c",
    accent: "#fbbf24",
    border: "#7f1d1d",
    borderHover: "#991b1b",
    shadow: "rgba(26, 10, 10, 0.8)",
    success: "#22c55e",
    warning: "#fbbf24",
    error: "#ef4444",
  },
  fonts: {
    heading: { family: "'Inter', sans-serif", weight: 700, letterSpacing: "-0.02em" },
    body: { family: "'Inter', sans-serif", weight: 400, lineHeight: "1.7" },
    caption: { family: "'Inter', sans-serif", weight: 500, size: "0.875rem" },
  },
  design: {
    borderRadius: { small: "0.5rem", medium: "1rem", large: "1.5rem", full: "9999px" },
    shadows: {
      small: "0 2px 12px rgba(239, 68, 68, 0.2)",
      medium: "0 8px 32px rgba(239, 68, 68, 0.25)",
      large: "0 20px 60px rgba(239, 68, 68, 0.3)",
    },
    spacing: { tight: "0.5rem", normal: "1.25rem", relaxed: "2rem" },
  },
  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #1a0a0a 0%, #2a1010 40%, #3a1515 100%)",
      pattern: "radial-gradient(ellipse at 30% 80%, rgba(239, 68, 68, 0.25) 0%, transparent 50%), radial-gradient(ellipse at 70% 20%, rgba(249, 115, 22, 0.2) 0%, transparent 45%), radial-gradient(ellipse at 50% 50%, rgba(251, 191, 36, 0.1) 0%, transparent 60%)",
    },
    content: {
      background: "linear-gradient(180deg, #1a0a0a 0%, #2a1010 100%)",
      bulletStyle: "square",
    },
    image: {
      borderRadius: "1rem",
      shadow: "0 25px 60px rgba(239, 68, 68, 0.35)",
      overlay: "linear-gradient(to top, rgba(26, 10, 10, 0.95) 0%, transparent 60%)",
    },
  },
  preview: {
    titleBg: "linear-gradient(135deg, #2a1010 0%, #7f1d1d 100%)",
    bodyBg: "#1a0a0a",
    textColor: "#fef2f2",
    accentColor: "#ef4444",
  },
  overlay: "linear-gradient(180deg, rgba(26, 10, 10, 0.4) 0%, rgba(26, 10, 10, 0.2) 100%)",
  cardBox: {
    background: "rgba(58, 21, 21, 0.85)",
    borderColor: "rgba(239, 68, 68, 0.35)",
    titleColor: "#ffffff",
    bodyColor: "#fef2f2",
    accentColor: "#ef4444",
    shadow: "0 8px 40px rgba(239, 68, 68, 0.25)",
  },
};

// Theme 7: Midnight Garden - Luxurious deep indigo theme with rose gold accents and botanical elegance
const midnightGarden: Theme = {
  id: "midnight-garden",
  name: "Midnight Garden",
  description: "A luxurious deep indigo theme with rose gold accents, arch frames, and elegant botanical patterns",
  category: "creative",
  colors: {
    background: "#0c0a1d",
    backgroundAlt: "#12102a",
    surface: "#1a1735",
    text: "#f0e6ff",
    textMuted: "#c4b5fd",
    heading: "#ffffff",
    link: "#e879a9",
    linkHover: "#f0abcb",
    primary: "#e879a9",
    primaryHover: "#f0abcb",
    secondary: "#818cf8",
    secondaryHover: "#a5b4fc",
    accent: "#fcd34d",
    border: "#312e81",
    borderHover: "#4338ca",
    shadow: "rgba(12, 10, 29, 0.85)",
    success: "#34d399",
    warning: "#fbbf24",
    error: "#f87171",
  },
  fonts: {
    heading: { family: "'Inter', sans-serif", weight: 700, letterSpacing: "-0.02em" },
    body: { family: "'Inter', sans-serif", weight: 400, lineHeight: "1.7" },
    caption: { family: "'Inter', sans-serif", weight: 500, size: "0.875rem" },
  },
  design: {
    borderRadius: { small: "0.75rem", medium: "1.5rem", large: "2.5rem", full: "9999px" },
    shadows: {
      small: "0 2px 12px rgba(232, 121, 169, 0.15)",
      medium: "0 8px 32px rgba(232, 121, 169, 0.2)",
      large: "0 20px 60px rgba(232, 121, 169, 0.25)",
    },
    spacing: { tight: "0.5rem", normal: "1.25rem", relaxed: "2rem" },
  },
  slideStyles: {
    title: {
      background: "linear-gradient(135deg, #0c0a1d 0%, #1a1735 40%, #12102a 100%)",
      pattern: "radial-gradient(ellipse at 25% 25%, rgba(232, 121, 169, 0.2) 0%, transparent 50%), radial-gradient(ellipse at 75% 75%, rgba(129, 140, 248, 0.15) 0%, transparent 45%), radial-gradient(ellipse at 50% 50%, rgba(252, 211, 77, 0.08) 0%, transparent 60%)",
    },
    content: {
      background: "linear-gradient(180deg, #0c0a1d 0%, #12102a 100%)",
      bulletStyle: "circle",
    },
    image: {
      borderRadius: "1.5rem",
      shadow: "0 25px 60px rgba(232, 121, 169, 0.3)",
      overlay: "linear-gradient(to top, rgba(12, 10, 29, 0.95) 0%, transparent 60%)",
    },
  },
  preview: {
    titleBg: "linear-gradient(135deg, #1a1735 0%, #312e81 100%)",
    bodyBg: "#0c0a1d",
    textColor: "#f0e6ff",
    accentColor: "#e879a9",
  },
  overlay: "linear-gradient(180deg, rgba(12, 10, 29, 0.4) 0%, rgba(12, 10, 29, 0.2) 100%)",
  cardBox: {
    background: "rgba(26, 23, 53, 0.85)",
    borderColor: "rgba(232, 121, 169, 0.3)",
    titleColor: "#ffffff",
    bodyColor: "#f0e6ff",
    accentColor: "#e879a9",
    shadow: "0 8px 40px rgba(232, 121, 169, 0.2)",
  },
};

export const themes: Theme[] = [elegantNoir, arcticFrost, sunsetGradient, oceanDepths, auroraBorealis, emberForge, midnightGarden];

export const getThemeById = (id: string): Theme | undefined => {
  return themes.find((theme) => theme.id === id) || elegantNoir;
};

export const getDefaultTheme = (): Theme => {
  return elegantNoir;
};