"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { X, Check, Loader2, Sparkles } from "lucide-react";
import { themes, type Theme, getSlideShapeStyles } from "~/lib/themes";
import { getThemeThumbnailUrl } from "~/lib/themes/cloudinary";
import { getModalColors } from "./ui-colors";

// All theme fonts for preview - loaded when sidebar opens
const THEME_FONTS_URL = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=Outfit:wght@400;500;600;700&family=Sora:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Lato:wght@400;700&family=Cormorant+Garamond:wght@400;500;600;700&family=Source+Sans+3:wght@400;500;600;700&family=Libre+Baskerville:wght@400;700&family=Nunito+Sans:wght@400;500;600;700&family=Noto+Serif+SC:wght@400;500;600;700&display=swap";

// Client-side cache for custom themes (persists across sidebar opens)
const customThemesCache = {
  data: null as CustomTheme[] | null,
  timestamp: 0,
  TTL: 5 * 60 * 1000, // 5 minutes
  isValid() {
    return this.data !== null && Date.now() - this.timestamp < this.TTL;
  },
  set(themes: CustomTheme[]) {
    this.data = themes;
    this.timestamp = Date.now();
  },
  get() {
    return this.isValid() ? this.data : null;
  },
  invalidate() {
    this.data = null;
    this.timestamp = 0;
  }
};

// Export for external invalidation (e.g., after creating a new theme)
export function invalidateCustomThemesCache() {
  customThemesCache.invalidate();
}

interface CustomTheme {
  id: string;
  name: string;
  colors: {
    mode?: string;
    palette?: string;
    custom?: {
      primary: string;
      secondary?: string;
      background: string;
      backgroundAlt?: string;
      text: string;
      heading?: string;
      accent: string;
    };
  };
  fonts?: {
    heading?: string;
    body?: string;
  };
  designElements?: {
    backgroundImageUrl?: string | null;
    logoUrl?: string | null;
    cardStyle?: string;
  };
}

// Helper to resolve colors from custom theme data
function resolveCustomThemeColors(theme: CustomTheme) {
  const defaultColors = {
    primary: "#3b82f6",
    background: "#ffffff",
    text: "#334155",
    accent: "#06b6d4",
  };
  
  if (theme.colors.custom) {
    return {
      primary: theme.colors.custom.primary || defaultColors.primary,
      background: theme.colors.custom.background || defaultColors.background,
      text: theme.colors.custom.text || defaultColors.text,
      accent: theme.colors.custom.accent || defaultColors.accent,
    };
  }
  
  return defaultColors;
}

interface ThemeSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentThemeId: string;
  onThemeChange: (themeId: string, customThemeData?: CustomTheme) => void;
  presentationId: string;
  theme?: Theme;
}

export function ThemeSidebar({
  isOpen,
  onClose,
  currentThemeId,
  onThemeChange,
  presentationId,
  theme,
}: ThemeSidebarProps) {
  const [customThemes, setCustomThemes] = useState<CustomTheme[]>([]);
  const [isLoadingThemes, setIsLoadingThemes] = useState(false);
  const [changingTheme, setChangingTheme] = useState<string | null>(null);
  const hasFetched = useRef(false);

  // Get theme-aware colors using the helper - use modalColors for ALL themes
  const modalColors = theme ? getModalColors(theme) : null;

  // Theme-aware colors using actual theme data from getModalColors
  const colors = modalColors ? {
    bg: modalColors.bg,
    surface: modalColors.surface,
    border: modalColors.border,
    text: modalColors.text,
    textMuted: modalColors.textMuted,
    accent: modalColors.accent || "#a78bfa",
    hoverBg: modalColors.hoverBg || (modalColors.isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"),
  } : {
    bg: "#18181b",
    surface: "#27272a",
    border: "#3f3f46",
    text: "#fafafa",
    textMuted: "#a1a1aa",
    accent: "#a78bfa",
    hoverBg: "#3f3f46",
  };

  // Load theme fonts when sidebar opens
  useEffect(() => {
    if (isOpen) {
      const existingLink = document.querySelector(`link[href="${THEME_FONTS_URL}"]`);
      if (!existingLink) {
        const link = document.createElement("link");
        link.href = THEME_FONTS_URL;
        link.rel = "stylesheet";
        document.head.appendChild(link);
      }
    }
  }, [isOpen]);

  // Fetch custom themes with caching
  useEffect(() => {
    if (!isOpen) return;
    
    // Check cache first
    const cached = customThemesCache.get();
    if (cached) {
      setCustomThemes(cached);
      return;
    }
    
    // Prevent duplicate fetches
    if (hasFetched.current) return;
    hasFetched.current = true;
    
    setIsLoadingThemes(true);
    fetch("/api/themes")
      .then((res) => res.json())
      .then((data) => {
        if (data.themes) {
          setCustomThemes(data.themes);
          customThemesCache.set(data.themes);
        }
      })
      .catch(console.error)
      .finally(() => {
        setIsLoadingThemes(false);
        hasFetched.current = false;
      });
  }, [isOpen]);

  const handleThemeSelect = async (themeId: string, customThemeData?: CustomTheme) => {
    if (themeId === currentThemeId) return;

    setChangingTheme(themeId);

    try {
      const response = await fetch(`/api/presentations/${presentationId}/theme`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: themeId }),
      });

      if (response.ok) {
        // Pass custom theme data directly to avoid extra fetch
        onThemeChange(themeId, customThemeData);
      }
    } catch (error) {
      console.error("Failed to change theme:", error);
    } finally {
      setChangingTheme(null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div 
        className="fixed right-0 top-0 h-full w-96 border-l z-50 shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-right duration-300"
        style={{
          background: colors.bg,
          borderColor: colors.border,
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4"
          style={{ borderBottom: `1px solid ${colors.border}` }}
        >
          <div className="flex items-center gap-2">
            <Sparkles size={18} style={{ color: colors.accent }} />
            <h2 className="text-lg font-semibold" style={{ color: colors.text }}>Themes</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: colors.textMuted }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.hoverBg;
              e.currentTarget.style.color = colors.text;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = colors.textMuted;
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Theme List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Built-in Themes */}
          <div>
            <h3 
              className="text-xs font-medium uppercase tracking-wider mb-3"
              style={{ color: colors.textMuted }}
            >
              Built-in Themes
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {themes.map((t) => (
                <ThemeCard
                  key={t.id}
                  theme={t}
                  isSelected={currentThemeId === t.id}
                  isLoading={changingTheme === t.id}
                  onClick={() => handleThemeSelect(t.id)}
                  colors={colors}
                />
              ))}
            </div>
          </div>

          {/* Custom Themes */}
          {(customThemes.length > 0 || isLoadingThemes) && (
            <div>
              <h3 
                className="text-xs font-medium uppercase tracking-wider mb-3"
                style={{ color: colors.textMuted }}
              >
                Your Custom Themes
              </h3>
              {isLoadingThemes ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={20} className="animate-spin" style={{ color: colors.textMuted }} />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {customThemes.map((t) => (
                    <CustomThemeCard
                      key={t.id}
                      theme={t}
                      isSelected={currentThemeId === `custom-${t.id}`}
                      isLoading={changingTheme === `custom-${t.id}`}
                      onClick={() => handleThemeSelect(`custom-${t.id}`, t)}
                      colors={colors}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

interface ThemeColors {
  bg: string;
  surface: string;
  border: string;
  text: string;
  textMuted: string;
  accent: string;
  hoverBg: string;
}

function ThemeCard({
  theme,
  isSelected,
  isLoading,
  onClick,
  colors,
}: {
  theme: Theme;
  isSelected: boolean;
  isLoading: boolean;
  onClick: () => void;
  colors: ThemeColors;
}) {
  const hasBackgroundImage = !!theme.previewBackgroundImage || !!theme.backgroundImage;
  const bgImageUrl = theme.previewBackgroundImage || theme.backgroundImage;
  // Use optimized thumbnail URL for faster loading
  const optimizedBgUrl = bgImageUrl ? getThemeThumbnailUrl(bgImageUrl) : undefined;
  const slideShapeStyles = getSlideShapeStyles(theme.slideShape);
  
  // For custom themes, use the background color from colors, not preview.titleBg (which might be a URL)
  const previewBgColor = hasBackgroundImage 
    ? theme.colors.background 
    : (typeof theme.preview?.titleBg === 'string' && !theme.preview.titleBg.startsWith('url(') 
        ? theme.preview.titleBg 
        : theme.colors.background);
  
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="relative group rounded-lg overflow-hidden transition-all duration-200 text-left"
      style={{
        boxShadow: isSelected ? `0 0 0 2px ${colors.accent}` : `0 0 0 1px ${colors.border}`,
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.boxShadow = `0 0 0 1px ${colors.textMuted}`;
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.boxShadow = `0 0 0 1px ${colors.border}`;
        }
      }}
    >
      {/* Theme Preview - fills entire card area */}
      <div
        className="aspect-[16/10] w-full relative overflow-hidden"
        style={{
          backgroundColor: previewBgColor,
          backgroundImage: hasBackgroundImage
            ? `url(${optimizedBgUrl})`
            : theme.slideStyles?.title?.pattern || "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Lighter overlay for background images to show them better */}
        {hasBackgroundImage && (
          <div
            className="absolute inset-0"
            style={{ 
              background: "rgba(0,0,0,0.25)",
            }}
          />
        )}

        {/* Content card - smaller for background image themes to show more bg - SHAPE APPLIED HERE */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`backdrop-blur-sm transition-all duration-300 flex flex-col justify-center px-2 py-1.5 overflow-hidden ${
              hasBackgroundImage ? "w-[70%] h-[60%]" : "w-[85%] h-[75%]"
            }`}
            style={{
              backgroundColor: hasBackgroundImage 
                ? `${theme.cardBox?.background || theme.colors.background}e8`
                : theme.cardBox?.background || "rgba(255, 255, 255, 0.95)",
              border: theme.cardBox?.borderColor
                ? `1px solid ${theme.cardBox.borderColor}`
                : "1px solid rgba(255,255,255,0.1)",
              ...slideShapeStyles,
            }}
          >
            {/* Inline text preview */}
            <div 
              className="text-[10px] font-bold mb-0.5 truncate"
              style={{ color: theme.cardBox?.titleColor || theme.colors.heading, fontFamily: theme.fonts?.heading?.family || "inherit" }}
            >
              Title
            </div>
            <div className="flex items-center gap-0.5 text-[8px]">
              <span style={{ color: theme.cardBox?.bodyColor || theme.colors.text }}>Body &</span>
              <span 
                className="underline"
                style={{ color: theme.cardBox?.accentColor || theme.colors.accent || theme.colors.primary }}
              >
                link
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Theme Name Footer */}
      <div
        className="px-2 py-1.5 flex items-center justify-between"
        style={{
          backgroundColor: isSelected ? `${colors.accent}15` : colors.surface,
          borderTop: `1px solid ${isSelected ? `${colors.accent}30` : colors.border}`,
        }}
      >
        <span className="text-xs font-medium truncate" style={{ color: colors.text }}>{theme.name}</span>
        {isLoading ? (
          <Loader2 size={12} style={{ color: colors.accent }} className="animate-spin" />
        ) : isSelected ? (
          <Check size={12} style={{ color: colors.accent }} />
        ) : null}
      </div>
    </button>
  );
}

function CustomThemeCard({
  theme,
  isSelected,
  isLoading,
  onClick,
  colors,
}: {
  theme: CustomTheme;
  isSelected: boolean;
  isLoading: boolean;
  onClick: () => void;
  colors: ThemeColors;
}) {
  const hasBackgroundImage = !!theme.designElements?.backgroundImageUrl;
  const bgImageUrl = theme.designElements?.backgroundImageUrl;
  const themeColors = resolveCustomThemeColors(theme);
  const cardStyle = theme.designElements?.cardStyle || "standard";

  // Get slide shape styles - must match CustomThemeCreator preview exactly
  const getCustomSlideShapeStyles = (): React.CSSProperties => {
    switch (cardStyle) {
      case "standard":
        return { borderRadius: "0.75rem", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)" };
      case "flat":
        return { borderRadius: "0", boxShadow: "none", border: `2px solid ${themeColors.primary}30` };
      case "outline":
        return { borderRadius: "0", boxShadow: "none", border: `3px solid ${themeColors.primary}` };
      case "outline-rounded":
        return { borderRadius: "1.5rem", boxShadow: "none", border: `3px solid ${themeColors.primary}` };
      case "sharp":
        return { borderRadius: "0", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)" };
      case "blocky":
        return { borderRadius: "0", boxShadow: `8px 8px 0px 0px ${themeColors.primary}` };
      case "blocky-rounded":
        return { borderRadius: "1.5rem", boxShadow: `8px 8px 0px 0px ${themeColors.primary}` };
      case "glass":
        return { borderRadius: "1rem", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)", border: `1px solid ${themeColors.primary}20` };
      case "rounded":
        return { borderRadius: "1.5rem", boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.2)" };
      case "soft-cloud":
        return { borderRadius: "1.25rem", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" };
      case "capsule":
        return { borderRadius: "2.5rem", boxShadow: "0 15px 30px -8px rgba(0, 0, 0, 0.2)" };
      default:
        return { borderRadius: "0.75rem", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)" };
    }
  };

  const slideShapeStyles = getCustomSlideShapeStyles();
  
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="relative group rounded-lg overflow-hidden transition-all duration-200 text-left"
      style={{
        boxShadow: isSelected ? `0 0 0 2px ${colors.accent}` : `0 0 0 1px ${colors.border}`,
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.boxShadow = `0 0 0 1px ${colors.textMuted}`;
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.boxShadow = `0 0 0 1px ${colors.border}`;
        }
      }}
    >
      {/* Theme Preview - fills entire card area */}
      <div
        className="aspect-[16/10] w-full relative overflow-hidden"
        style={{ 
          backgroundColor: themeColors.background,
          backgroundImage: hasBackgroundImage ? `url(${bgImageUrl})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay for background images */}
        {hasBackgroundImage && (
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.25)" }}
          />
        )}
        
        {/* Content card centered - SHAPE APPLIED HERE */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`backdrop-blur-md flex flex-col justify-center overflow-hidden ${
              hasBackgroundImage ? "w-[70%] h-[60%] p-2" : "w-[85%] h-[75%] p-2.5"
            }`}
            style={{
              backgroundColor: hasBackgroundImage 
                ? `${themeColors.background}e8`
                : `${themeColors.background}ee`,
              border: cardStyle === "flat" || cardStyle === "outline" || cardStyle === "outline-rounded" || cardStyle === "glass" 
                ? undefined // Border is set in slideShapeStyles
                : `1px solid ${themeColors.primary}40`,
              ...slideShapeStyles,
            }}
          >
            <div
              className="text-sm font-bold mb-1 truncate"
              style={{ color: themeColors.text }}
            >
              Title
            </div>
            <div
              className="text-xs font-medium flex items-center gap-1"
              style={{ color: themeColors.text }}
            >
              Body &{" "}
              <span
                className="underline decoration-1 underline-offset-1"
                style={{
                  color: themeColors.accent,
                  textDecorationColor: themeColors.accent,
                }}
              >
                link
              </span>
            </div>
          </div>
        </div>

        {/* Custom badge */}
        <div className="absolute top-1.5 left-1.5 flex items-center gap-0.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-1.5 py-0.5">
          <Sparkles size={8} className="text-white" />
          <span className="text-[8px] font-bold text-white">Custom</span>
        </div>
      </div>

      {/* Theme Name Footer */}
      <div
        className="px-2 py-1.5 flex items-center justify-between"
        style={{
          backgroundColor: isSelected ? `${colors.accent}15` : colors.surface,
          borderTop: `1px solid ${isSelected ? `${colors.accent}30` : colors.border}`,
        }}
      >
        <span className="text-xs font-medium truncate" style={{ color: colors.text }}>{theme.name}</span>
        {isLoading ? (
          <Loader2 size={12} style={{ color: colors.accent }} className="animate-spin" />
        ) : isSelected ? (
          <Check size={12} style={{ color: colors.accent }} />
        ) : null}
      </div>
    </button>
  );
}
