"use client";

import { useState, useEffect } from "react";
import { X, Check, Loader2, Sparkles } from "lucide-react";
import { themes, type Theme, getSlideShapeStyles } from "~/lib/themes";
import { getThemeType } from "./types";

// All theme fonts for preview - loaded when sidebar opens
const THEME_FONTS_URL = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=Outfit:wght@400;500;600;700&family=Sora:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Lato:wght@400;700&family=Cormorant+Garamond:wght@400;500;600;700&family=Source+Sans+3:wght@400;500;600;700&family=Libre+Baskerville:wght@400;700&family=Nunito+Sans:wght@400;500;600;700&family=Noto+Serif+SC:wght@400;500;600;700&display=swap";

interface CustomTheme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
  };
}

interface ThemeSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentThemeId: string;
  onThemeChange: (themeId: string) => void;
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
  const [changingTheme, setChangingTheme] = useState<string | null>(null);

  // Get theme-aware colors
  const themeType = theme ? getThemeType(theme) : "dark";
  const isLight = themeType === "light" || themeType === "corporate" || themeType === "custom-light";

  // Theme-aware colors using actual theme data
  const colors = isLight ? {
    bg: "#ffffff",
    surface: "#f8fafc",
    border: "#e2e8f0",
    text: "#0f172a",
    textMuted: "#64748b",
    accent: "#3b82f6",
    hoverBg: "#f1f5f9",
  } : theme ? {
    bg: theme.pageBackground || theme.colors.background,
    surface: theme.colors.surface,
    border: theme.colors.border,
    text: theme.colors.text,
    textMuted: theme.colors.textMuted,
    accent: theme.colors.primary || "#a78bfa",
    hoverBg: theme.colors.surfaceHover || "rgba(255,255,255,0.1)",
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

  // Fetch custom themes
  useEffect(() => {
    if (isOpen) {
      fetch("/api/themes")
        .then((res) => res.json())
        .then((data) => {
          if (data.themes) {
            setCustomThemes(data.themes);
          }
        })
        .catch(console.error);
    }
  }, [isOpen]);

  const handleThemeSelect = async (themeId: string) => {
    if (themeId === currentThemeId) return;

    setChangingTheme(themeId);

    try {
      const response = await fetch(`/api/presentations/${presentationId}/theme`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: themeId }),
      });

      if (response.ok) {
        onThemeChange(themeId);
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
          {customThemes.length > 0 && (
            <div>
              <h3 
                className="text-xs font-medium uppercase tracking-wider mb-3"
                style={{ color: colors.textMuted }}
              >
                Your Custom Themes
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {customThemes.map((t) => (
                  <CustomThemeCard
                    key={t.id}
                    theme={t}
                    isSelected={currentThemeId === `custom-${t.id}`}
                    isLoading={changingTheme === `custom-${t.id}`}
                    onClick={() => handleThemeSelect(`custom-${t.id}`)}
                    colors={colors}
                  />
                ))}
              </div>
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
  const slideShapeStyles = getSlideShapeStyles(theme.slideShape);
  
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
          backgroundColor: theme.preview?.titleBg || theme.colors.background,
          backgroundImage: hasBackgroundImage
            ? `url(${bgImageUrl})`
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
        style={{ backgroundColor: theme.colors.background }}
      >
        {/* Content card centered */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="rounded-md p-2.5 backdrop-blur-md w-[85%] h-[75%] flex flex-col justify-center"
            style={{
              backgroundColor: `${theme.colors.background}ee`,
              border: `1px solid ${theme.colors.primary}40`,
            }}
          >
            <div
              className="text-sm font-bold mb-1 truncate"
              style={{ color: theme.colors.text }}
            >
              Title
            </div>
            <div
              className="text-xs font-medium flex items-center gap-1"
              style={{ color: theme.colors.text }}
            >
              Body &{" "}
              <span
                className="underline decoration-1 underline-offset-1"
                style={{
                  color: theme.colors.accent,
                  textDecorationColor: theme.colors.accent,
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
