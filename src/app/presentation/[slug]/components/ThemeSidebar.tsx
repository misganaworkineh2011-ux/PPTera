"use client";

import { useState, useEffect } from "react";
import { X, Check, Loader2, Sparkles } from "lucide-react";
import { themes, type Theme } from "~/lib/themes";
import { getThemeType } from "./types";
import { getUIColors } from "./ui-colors";

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
  const ui = getUIColors(themeType);
  const isLight = themeType === "light" || themeType === "corporate";

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
        className={`fixed right-0 top-0 h-full w-96 border-l z-50 shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-right duration-300 ${
          isLight ? "bg-white border-slate-200" : "bg-zinc-900 border-zinc-800"
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${isLight ? "border-slate-200" : "border-zinc-800"}`}>
          <div className="flex items-center gap-2">
            <Sparkles size={18} className={isLight ? "text-blue-500" : "text-purple-400"} />
            <h2 className={`text-lg font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>Themes</h2>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isLight 
                ? "hover:bg-slate-100 text-slate-400 hover:text-slate-600" 
                : "hover:bg-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Theme List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Built-in Themes */}
          <div>
            <h3 className={`text-xs font-medium uppercase tracking-wider mb-3 ${isLight ? "text-slate-500" : "text-zinc-500"}`}>
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
                  isLight={isLight}
                />
              ))}
            </div>
          </div>

          {/* Custom Themes */}
          {customThemes.length > 0 && (
            <div>
              <h3 className={`text-xs font-medium uppercase tracking-wider mb-3 ${isLight ? "text-slate-500" : "text-zinc-500"}`}>
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
                    isLight={isLight}
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

function ThemeCard({
  theme,
  isSelected,
  isLoading,
  onClick,
  isLight,
}: {
  theme: Theme;
  isSelected: boolean;
  isLoading: boolean;
  onClick: () => void;
  isLight: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`relative group rounded-lg overflow-hidden transition-all duration-200 text-left ${
        isSelected
          ? isLight ? "ring-2 ring-blue-500" : "ring-2 ring-purple-500"
          : isLight ? "ring-1 ring-slate-200 hover:ring-slate-300" : "ring-1 ring-zinc-700 hover:ring-zinc-600"
      }`}
    >
      {/* Theme Preview - Similar to outline page */}
      <div className="p-2">
        <div
          className="aspect-[16/10] w-full rounded-md shadow-sm relative overflow-hidden"
          style={{
            backgroundColor: theme.preview?.titleBg || theme.colors.background,
            backgroundImage: theme.previewBackgroundImage
              ? `url(${theme.previewBackgroundImage})`
              : theme.slideStyles?.title?.pattern || "none",
            backgroundSize: theme.previewBackgroundImage ? "cover" : "auto",
            backgroundPosition: "center",
          }}
        >
          {/* Overlay if exists */}
          {theme.overlay && (
            <div
              className="absolute inset-0"
              style={{ background: theme.overlay }}
            />
          )}

          {/* Content card centered on background with SVG preview */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="rounded-md backdrop-blur-md transition-all duration-300 w-[85%] h-[75%] flex items-center justify-center overflow-hidden"
              style={{
                backgroundColor: theme.cardBox?.background || "rgba(255, 255, 255, 0.95)",
                border: theme.cardBox?.borderColor
                  ? `1px solid ${theme.cardBox.borderColor}`
                  : "1px solid rgba(255,255,255,0.1)",
                boxShadow: theme.cardBox?.shadow || "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            >
              {/* SVG preview from API */}
              <img 
                src={`/api/themes/preview/${theme.id}`}
                alt={`${theme.name} preview`}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>
          </div>

          {/* Color dots */}
          <div className="absolute top-1.5 right-1.5 flex gap-0.5">
            <div
              className="w-2 h-2 rounded-full border border-white/20"
              style={{ backgroundColor: theme.colors?.primary }}
            />
            <div
              className="w-2 h-2 rounded-full border border-white/20"
              style={{ backgroundColor: theme.colors?.accent || theme.colors?.secondary }}
            />
          </div>
        </div>
      </div>

      {/* Theme Name Footer */}
      <div
        className={`px-2 py-1.5 border-t flex items-center justify-between ${
          isSelected 
            ? isLight ? "bg-blue-50 border-blue-200" : "bg-purple-500/10 border-purple-500/30" 
            : isLight ? "bg-slate-50 border-slate-200" : "bg-zinc-800/50 border-zinc-700"
        }`}
      >
        <span className={`text-xs font-medium truncate ${isLight ? "text-slate-700" : "text-zinc-200"}`}>{theme.name}</span>
        {isLoading ? (
          <Loader2 size={12} className={isLight ? "text-blue-500 animate-spin" : "text-purple-400 animate-spin"} />
        ) : isSelected ? (
          <Check size={12} className={isLight ? "text-blue-500" : "text-purple-400"} />
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
  isLight,
}: {
  theme: CustomTheme;
  isSelected: boolean;
  isLoading: boolean;
  onClick: () => void;
  isLight: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`relative group rounded-lg overflow-hidden transition-all duration-200 text-left ${
        isSelected
          ? isLight ? "ring-2 ring-blue-500" : "ring-2 ring-purple-500"
          : isLight ? "ring-1 ring-slate-200 hover:ring-slate-300" : "ring-1 ring-zinc-700 hover:ring-zinc-600"
      }`}
    >
      {/* Theme Preview */}
      <div className="p-2">
        <div
          className="aspect-[16/10] w-full rounded-md shadow-sm relative overflow-hidden"
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

          {/* Color dots */}
          <div className="absolute top-1.5 right-1.5 flex gap-0.5">
            <div
              className="w-2 h-2 rounded-full border border-white/20"
              style={{ backgroundColor: theme.colors.primary }}
            />
            <div
              className="w-2 h-2 rounded-full border border-white/20"
              style={{ backgroundColor: theme.colors.accent }}
            />
          </div>

          {/* Custom badge */}
          <div className="absolute top-1.5 left-1.5 flex items-center gap-0.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-1.5 py-0.5">
            <Sparkles size={8} className="text-white" />
            <span className="text-[8px] font-bold text-white">Custom</span>
          </div>
        </div>
      </div>

      {/* Theme Name Footer */}
      <div
        className={`px-2 py-1.5 border-t flex items-center justify-between ${
          isSelected 
            ? isLight ? "bg-blue-50 border-blue-200" : "bg-purple-500/10 border-purple-500/30" 
            : isLight ? "bg-slate-50 border-slate-200" : "bg-zinc-800/50 border-zinc-700"
        }`}
      >
        <span className={`text-xs font-medium truncate ${isLight ? "text-slate-700" : "text-zinc-200"}`}>{theme.name}</span>
        {isLoading ? (
          <Loader2 size={12} className={isLight ? "text-blue-500 animate-spin" : "text-purple-400 animate-spin"} />
        ) : isSelected ? (
          <Check size={12} className={isLight ? "text-blue-500" : "text-purple-400"} />
        ) : null}
      </div>
    </button>
  );
}
