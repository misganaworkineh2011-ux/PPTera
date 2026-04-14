"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Grid, List as ListIcon, Palette, Trash2, MoreHorizontal, X, Eye, Loader2, Plus } from "lucide-react";
import { useLanguage } from "~/contexts/LanguageContext";
import { dashboardTranslations } from "~/lib/dashboard-translations";

// Google Fonts URL for preview
const GOOGLE_FONTS_URL = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@400;500;700&family=Poppins:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&family=Lato:wght@400;700&family=Open+Sans:wght@400;600;700&family=Playfair+Display:wght@400;500;600;700&family=Merriweather:wght@400;700&family=Source+Code+Pro:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap";

// Curated color palettes - must match CustomThemeCreator and API
const CURATED_PALETTES: Record<string, { background: string; backgroundAlt: string; text: string; heading: string; primary: string; accent: string }> = {
  "clean-white": { background: "#ffffff", backgroundAlt: "#f8fafc", text: "#334155", heading: "#0f172a", primary: "#3b82f6", accent: "#06b6d4" },
  "soft-cream": { background: "#fefce8", backgroundAlt: "#fef9c3", text: "#713f12", heading: "#422006", primary: "#ca8a04", accent: "#eab308" },
  "elegant-noir": { background: "#0a0a0b", backgroundAlt: "#1a1a1d", text: "#e4e4e7", heading: "#fafafa", primary: "#f59e0b", accent: "#6366f1" },
  "midnight-blue": { background: "#0f172a", backgroundAlt: "#1e293b", text: "#cbd5e1", heading: "#f1f5f9", primary: "#3b82f6", accent: "#06b6d4" },
  "forest-green": { background: "#052e16", backgroundAlt: "#14532d", text: "#bbf7d0", heading: "#dcfce7", primary: "#22c55e", accent: "#4ade80" },
  "ocean-depths": { background: "#0c4a6e", backgroundAlt: "#075985", text: "#bae6fd", heading: "#e0f2fe", primary: "#0ea5e9", accent: "#38bdf8" },
  "sunset-warm": { background: "#fff7ed", backgroundAlt: "#ffedd5", text: "#9a3412", heading: "#7c2d12", primary: "#f97316", accent: "#fb923c" },
  "rose-garden": { background: "#fff1f2", backgroundAlt: "#ffe4e6", text: "#9f1239", heading: "#881337", primary: "#f43f5e", accent: "#fb7185" },
  "purple-haze": { background: "#2e1065", backgroundAlt: "#4c1d95", text: "#e9d5ff", heading: "#f3e8ff", primary: "#a855f7", accent: "#c084fc" },
  "cyber-neon": { background: "#020617", backgroundAlt: "#0f172a", text: "#22d3ee", heading: "#67e8f9", primary: "#06b6d4", accent: "#f0abfc" },
  "corporate-gray": { background: "#f8fafc", backgroundAlt: "#f1f5f9", text: "#475569", heading: "#1e293b", primary: "#64748b", accent: "#94a3b8" },
  "warm-earth": { background: "#faf5f0", backgroundAlt: "#f5ebe0", text: "#78350f", heading: "#451a03", primary: "#b45309", accent: "#d97706" },
};

interface ThemeData {
  id: string;
  name: string;
  colors: {
    mode?: string;
    palette?: string;
    custom?: {
      background: string;
      backgroundAlt: string;
      text: string;
      heading: string;
      primary: string;
      accent: string;
    };
    colors?: string[];
  };
  fonts: {
    heading?: string;
    body?: string;
    font?: string;
  };
  designElements?: {
    cardStyle?: string;
    logoUrl?: string | null;
    backgroundImageUrl?: string | null;
  };
  isDefault: boolean;
  createdAt?: Date;
}

interface ThemesContentProps {
  initialThemes: ThemeData[];
  onCreateClick?: () => void;
}

type ViewMode = "grid" | "list";

// Font family mapping
const fontFamilyMap: Record<string, string> = {
  inter: "'Inter', sans-serif",
  roboto: "'Roboto', sans-serif",
  poppins: "'Poppins', sans-serif",
  montserrat: "'Montserrat', sans-serif",
  lato: "'Lato', sans-serif",
  "open-sans": "'Open Sans', sans-serif",
  playfair: "'Playfair Display', serif",
  merriweather: "'Merriweather', serif",
  "source-code": "'Source Code Pro', monospace",
  "space-grotesk": "'Space Grotesk', sans-serif",
};

export default function ThemesContent({ initialThemes, onCreateClick }: ThemesContentProps) {
  const [themes, setThemes] = useState<ThemeData[]>(initialThemes);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [previewTheme, setPreviewTheme] = useState<ThemeData | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { language } = useLanguage();
  const t = dashboardTranslations[language] || dashboardTranslations.en;

  useEffect(() => {
    setThemes(initialThemes);
  }, [initialThemes]);

  // Load Google Fonts on mount
  useEffect(() => {
    const existingLink = document.querySelector(`link[href="${GOOGLE_FONTS_URL}"]`);
    if (!existingLink) {
      const link = document.createElement("link");
      link.href = GOOGLE_FONTS_URL;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (activeMenu && !target.closest('.menu-container')) {
        setActiveMenu(null);
      }
    };
    if (activeMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [activeMenu]);

  // Helper to resolve theme colors (handles both curated palettes and custom colors)
  const resolveThemeColors = (theme: ThemeData) => {
    const defaultColors = {
      background: "#ffffff",
      backgroundAlt: "#f8fafc",
      text: "#334155",
      heading: "#0f172a",
      primary: "#3b82f6",
      accent: "#06b6d4",
    };
    
    // First try custom colors
    if (theme.colors.custom && theme.colors.custom.background) {
      return {
        background: theme.colors.custom.background || defaultColors.background,
        backgroundAlt: theme.colors.custom.backgroundAlt || defaultColors.backgroundAlt,
        text: theme.colors.custom.text || defaultColors.text,
        heading: theme.colors.custom.heading || defaultColors.heading,
        primary: theme.colors.custom.primary || defaultColors.primary,
        accent: theme.colors.custom.accent || defaultColors.accent,
      };
    }
    // Then try to resolve from curated palette
    if (theme.colors.palette) {
      const paletteColors = CURATED_PALETTES[theme.colors.palette];
      if (paletteColors) {
        return paletteColors;
      }
    }
    // Fallback to defaults
    return defaultColors;
  };

  const getBackgroundImage = (theme: ThemeData): string | null => {
    return theme.designElements?.backgroundImageUrl || null;
  };

  const getFontName = (theme: ThemeData): string => {
    if (theme.fonts.font) return theme.fonts.font;
    if (theme.fonts.heading) {
      const fontMap: Record<string, string> = {
        inter: "Inter", roboto: "Roboto", poppins: "Poppins",
        montserrat: "Montserrat", lato: "Lato", "open-sans": "Open Sans",
        playfair: "Playfair Display", merriweather: "Merriweather",
        "source-code": "Source Code Pro", "space-grotesk": "Space Grotesk",
      };
      return fontMap[theme.fonts.heading] || theme.fonts.heading;
    }
    return "Inter";
  };

  const handleDeleteTheme = async (themeId: string) => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/themes/${themeId}`, { method: "DELETE" });
      if (response.ok) {
        setThemes(prev => prev.filter(t => t.id !== themeId));
      }
    } catch (error) {
      console.error("Error deleting theme:", error);
    } finally {
      setIsDeleting(false);
      setDeleteConfirm(null);
      setActiveMenu(null);
    }
  };

  const openDeleteConfirm = (theme: ThemeData) => {
    setDeleteConfirm({ id: theme.id, name: theme.name });
    setActiveMenu(null);
  };

  return (
    <>
      <div className="mx-auto max-w-[1400px] w-full p-4 md:p-5 lg:px-6 lg:py-4">
        {/* Filters & View Toggle */}
        <div className="mb-4 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/60 dark:border-zinc-800/60 pb-3">
            {/* Left side - Filter buttons and Create button */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 rounded-2xl bg-white border border-slate-200 shadow-sm shadow-slate-200/50 dark:bg-zinc-900 dark:border-zinc-800 dark:shadow-none p-1">
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all outline-none text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm"
                >
                  <Grid size={14} className="sm:hidden" />
                  <Grid size={16} className="hidden sm:block" />
                  {t.all || "All"}
                </button>
              </div>
              
              {/* Create Custom Theme Button */}
              <button
                onClick={onCreateClick}
                className="group flex items-center gap-2 rounded-2xl bg-slate-900 dark:bg-white px-4 py-2 text-[13px] font-bold text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-100 hover:shadow-[0_4px_14px_rgba(0,0,0,0.1)] transition-all outline-none focus:ring-4 focus:ring-slate-900/10 active:scale-95"
              >
                <Plus size={16} className="group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">{t.createCustomTheme || "Create Custom Theme"}</span>
                <span className="sm:hidden">{t.createBtn || "Create"}</span>
              </button>
            </div>

            {/* Right side - Grid/List toggle */}
            <div className="flex items-center rounded-2xl bg-white border border-slate-200 shadow-sm shadow-slate-200/50 dark:bg-zinc-900 dark:border-zinc-800 dark:shadow-none p-1">
              <button
                onClick={() => setViewMode("grid")}
                title="Grid View"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all outline-none ${
                  viewMode === "grid"
                    ? "bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <Grid size={16} />
                <span className="text-[11px] font-bold uppercase tracking-wider hidden sm:block">{t.grid || "Grid"}</span>
              </button>
              <button
                onClick={() => setViewMode("list")}
                title="List View"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all outline-none ${
                  viewMode === "list"
                    ? "bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <ListIcon size={16} />
                <span className="text-[11px] font-bold uppercase tracking-wider hidden sm:block">{t.list || "List"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Display */}
        <div className="min-h-[400px] pb-16">
          {themes.length === 0 ? (
            <div className="flex h-[400px] flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-slate-200/60 dark:border-zinc-800/60 bg-slate-50/50 dark:bg-zinc-900/50 text-center px-4">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white dark:bg-zinc-800 shadow-lg ring-1 ring-slate-900/5 dark:ring-0">
                <Palette size={28} className="text-[#06b6d4]" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">
                {t.noCustomThemes || "No custom themes yet"}
              </h3>
              <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 max-w-xs mx-auto">
                {t.createFirstTheme || "Create your first custom theme to personalize your presentations."}
              </p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {themes.map((theme) => {
              const themeColors = resolveThemeColors(theme);
              const bgImage = getBackgroundImage(theme);
              const headingFontFamily = fontFamilyMap[theme.fonts.heading || "inter"] || "'Inter', sans-serif";
              const bodyFontFamily = fontFamilyMap[theme.fonts.body || "inter"] || "'Inter', sans-serif";
              
              return (
                <div
                  key={theme.id}
                  onClick={() => setPreviewTheme(theme)}
                  className="group relative flex flex-col overflow-hidden rounded-[20px] border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.06)] ring-1 ring-slate-900/5 dark:ring-0 dark:border-white/10 dark:shadow-none bg-white transition-all duration-300 hover:border-[#06b6d4]/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 cursor-pointer dark:bg-zinc-950"
                >
                  {/* Custom badge */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-0.5 text-xs font-bold text-white shadow-sm">
                      ✨ Custom
                    </span>
                  </div>

                  {/* Theme Preview - actual slide-like preview */}
                  <div 
                    className="aspect-[16/10] w-full relative overflow-hidden border-b border-slate-100 dark:border-zinc-800"
                    style={{ 
                      backgroundColor: themeColors.background,
                      backgroundImage: bgImage ? `url(${bgImage})` : undefined,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    {/* Overlay for readability when background image is present */}
                    {bgImage && (
                      <div 
                        className="absolute inset-0" 
                        style={{ backgroundColor: `${themeColors.background}cc` }} 
                      />
                    )}
                    
                    {/* Mini slide content */}
                    <div className="relative p-3 lg:p-5 h-full flex flex-col">
                      <h4 
                        className="text-base font-bold mb-1.5 line-clamp-1"
                        style={{ color: themeColors.heading, fontFamily: headingFontFamily }}
                      >
                        Title
                      </h4>
                      <p 
                        className="text-[11px] mb-2 line-clamp-2"
                        style={{ color: themeColors.text, fontFamily: bodyFontFamily }}
                      >
                        Body &amp; <span style={{ color: themeColors.accent, textDecoration: "underline" }}>link</span>
                      </p>
                      
                      {/* Mini color dots */}
                      <div className="mt-auto flex gap-1.5">
                        <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: themeColors.primary }} />
                        <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: themeColors.accent }} />
                        <div className="w-4 h-4 rounded-full shadow-sm border border-slate-200/50" style={{ backgroundColor: themeColors.backgroundAlt }} />
                      </div>
                    </div>
                    
                    {/* Preview icon on hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                      <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-full p-2.5 shadow-lg">
                        <Eye size={20} className="text-slate-900 dark:text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="flex flex-col p-4 bg-white dark:bg-zinc-950">
                    {/* Footer with name and menu */}
                    <div className="flex items-center justify-between">
                      <h3 className="line-clamp-1 text-sm font-bold text-slate-900 dark:text-white" title={theme.name}>
                        {theme.name}
                      </h3>
                      <div className="relative menu-container">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenu(activeMenu === theme.id ? null : theme.id);
                          }}
                          className="text-slate-400 hover:text-[#06b6d4] dark:text-zinc-500 dark:hover:text-[#06b6d4] transition-colors"
                        >
                          <MoreHorizontal size={18} />
                        </button>
                        {activeMenu === theme.id && (
                          <div className="absolute right-0 bottom-full mb-2 w-44 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl z-50 overflow-hidden">
                            <div className="p-1.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPreviewTheme(theme);
                                  setActiveMenu(null);
                                }}
                                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 font-medium transition-colors"
                              >
                                <Eye size={16} /> {t.preview || "Preview"}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openDeleteConfirm(theme);
                                }}
                                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 font-medium transition-colors mt-1"
                              >
                                <Trash2 size={16} /> {t.delete || "Delete"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 font-medium">{getFontName(theme)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {themes.map((theme) => {
              const themeColors = resolveThemeColors(theme);
              const bgImage = getBackgroundImage(theme);
              const headingFontFamily = fontFamilyMap[theme.fonts.heading || "inter"] || "'Inter', sans-serif";
              const bodyFontFamily = fontFamilyMap[theme.fonts.body || "inter"] || "'Inter', sans-serif";
              
              return (
                <div
                  key={theme.id}
                  onClick={() => setPreviewTheme(theme)}
                  className="group flex items-center gap-5 rounded-[20px] border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] ring-1 ring-slate-900/5 dark:ring-0 dark:border-white/10 dark:shadow-none bg-white transition-all duration-300 hover:border-[#06b6d4]/50 hover:-translate-y-0.5 p-4 dark:bg-zinc-950 cursor-pointer"
                >
                  {/* Theme Preview - mini slide */}
                  <div 
                    className="w-24 h-16 sm:w-32 sm:h-20 flex-shrink-0 rounded-[14px] relative overflow-hidden transition-transform duration-500 group-hover:scale-105 border border-slate-100 dark:border-zinc-800"
                    style={{ 
                      backgroundColor: themeColors.background,
                      backgroundImage: bgImage ? `url(${bgImage})` : undefined,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    {bgImage && (
                      <div className="absolute inset-0" style={{ backgroundColor: `${themeColors.background}cc` }} />
                    )}
                    <div className="relative p-2 h-full flex flex-col">
                      <h4 
                        className="text-[10px] sm:text-xs font-bold line-clamp-1"
                        style={{ color: themeColors.heading, fontFamily: headingFontFamily }}
                      >
                        Title
                      </h4>
                      <p 
                        className="text-[8px] sm:text-[10px] line-clamp-1"
                        style={{ color: themeColors.text, fontFamily: bodyFontFamily }}
                      >
                        Body &amp; <span style={{ color: themeColors.accent }}>link</span>
                      </p>
                      <div className="mt-auto flex gap-0.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColors.primary }} />
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColors.accent }} />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate group-hover:text-[#06b6d4] transition-colors">{theme.name}</h3>
                      <span className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-0.5 text-[9px] font-bold tracking-wide text-white uppercase">
                        ✨ Custom
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 font-medium">{getFontName(theme)}</p>
                  </div>

                  {/* Actions */}
                  <div className="relative flex-shrink-0 menu-container">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenu(activeMenu === theme.id ? null : theme.id);
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-[#06b6d4] hover:bg-[#06b6d4]/10 dark:text-zinc-500 dark:hover:text-[#06b6d4] transition-colors"
                    >
                      <MoreHorizontal size={20} />
                    </button>
                    {activeMenu === theme.id && (
                      <div className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl z-50 overflow-hidden">
                        <div className="p-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewTheme(theme);
                              setActiveMenu(null);
                            }}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 font-medium transition-colors"
                          >
                            <Eye size={16} /> {t.preview || "Preview"}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteConfirm(theme);
                            }}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 font-medium transition-colors mt-1"
                          >
                            <Trash2 size={16} /> {t.delete || "Delete"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div></div>

      {/* Delete Confirmation Popup - No overlay */}
      {deleteConfirm && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-slate-200 dark:border-neutral-800 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                <Trash2 size={18} className="text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">{t.deleteTheme || "Delete theme?"}</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 mt-0.5">
                  &quot;{deleteConfirm.name}&quot; {t.willBeDeleted || "will be permanently deleted."}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={isDeleting}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-slate-600 dark:text-neutral-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg transition disabled:opacity-50"
              >
                {t.cancel || "Cancel"}
              </button>
              <button
                onClick={() => handleDeleteTheme(deleteConfirm.id)}
                disabled={isDeleting}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting && <Loader2 size={14} className="animate-spin" />}
                {isDeleting ? (t.deleting || "Deleting...") : (t.delete || "Delete")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewTheme && (
        <ThemePreviewModal theme={previewTheme} onClose={() => setPreviewTheme(null)} />
      )}
    </>
  );
}

// Theme Preview Modal Component
function ThemePreviewModal({ theme, onClose }: { theme: ThemeData; onClose: () => void }) {
  // Load Google Fonts when modal opens
  useEffect(() => {
    const existingLink = document.querySelector(`link[href="${GOOGLE_FONTS_URL}"]`);
    if (!existingLink) {
      const link = document.createElement("link");
      link.href = GOOGLE_FONTS_URL;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
  }, []);

  // Resolve colors - handles both curated palettes and custom colors
  const resolveColors = () => {
    const defaultColors = {
      background: "#ffffff",
      backgroundAlt: "#f8fafc",
      text: "#334155",
      heading: "#0f172a",
      primary: "#3b82f6",
      accent: "#06b6d4",
    };
    
    if (theme.colors.custom && theme.colors.custom.background) {
      return theme.colors.custom;
    }
    if (theme.colors.palette) {
      const paletteColors = CURATED_PALETTES[theme.colors.palette];
      if (paletteColors) {
        return paletteColors;
      }
    }
    return defaultColors;
  };

  const colors = resolveColors();
  const backgroundImageUrl = theme.designElements?.backgroundImageUrl || null;
  const headingFontFamily = fontFamilyMap[theme.fonts.heading || "inter"] || "'Inter', sans-serif";
  const bodyFontFamily = fontFamilyMap[theme.fonts.body || "inter"] || "'Inter', sans-serif";
  const cardStyle = theme.designElements?.cardStyle || "standard";

  // Get slide shape styles - must match CustomThemeCreator preview exactly
  const getSlideShapeStyles = (): React.CSSProperties => {
    switch (cardStyle) {
      case "standard":
        return { borderRadius: "0.75rem", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)" };
      case "flat":
        return { borderRadius: "0", boxShadow: "none", border: `2px solid ${colors.primary}30` };
      case "outline":
        return { borderRadius: "0", boxShadow: "none", border: `3px solid ${colors.primary}` };
      case "outline-rounded":
        return { borderRadius: "1.5rem", boxShadow: "none", border: `3px solid ${colors.primary}` };
      case "sharp":
        return { borderRadius: "0", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)" };
      case "blocky":
        return { borderRadius: "0", boxShadow: `8px 8px 0px 0px ${colors.primary}` };
      case "blocky-rounded":
        return { borderRadius: "1.5rem", boxShadow: `8px 8px 0px 0px ${colors.primary}` };
      case "glass":
        return { borderRadius: "1rem", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)", border: `1px solid ${colors.primary}20` };
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

  const slideShapeStyles = getSlideShapeStyles();

  if (typeof window === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div 
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-[#1e3a8a]">{theme.name}</h2>
            <p className="text-sm text-slate-500">Theme Preview • Shape: {cardStyle}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        {/* Preview Content */}
        <div 
          className="p-6 relative"
          style={{ 
            backgroundColor: colors.background,
            backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Overlay for readability */}
          {backgroundImageUrl && (
            <div className="absolute inset-0" style={{ backgroundColor: `${colors.background}cc` }} />
          )}
          
          {/* Slide Preview - with slide shape applied */}
          <div 
            className="relative overflow-hidden"
            style={{ 
              backgroundColor: backgroundImageUrl ? "transparent" : colors.backgroundAlt,
              ...slideShapeStyles,
            }}
          >
            <div className="p-8">
              <p className="text-xs mb-2" style={{ color: colors.accent }}>Hello 👋</p>
              <h1 
                className="text-3xl font-bold mb-4"
                style={{ color: colors.heading, fontFamily: headingFontFamily }}
              >
                Presentation Title
              </h1>
              <p 
                className="text-base mb-6"
                style={{ color: colors.text, fontFamily: bodyFontFamily }}
              >
                This is how your body text will look. The accent color is used for{" "}
                <span className="underline" style={{ color: colors.accent }}>links and highlights</span>.
              </p>

              {/* Sample Cards */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div 
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: colors.background, border: `1px solid ${colors.primary}20` }}
                >
                  <p className="text-sm" style={{ color: colors.text, fontFamily: bodyFontFamily }}>
                    Sample card content with your theme colors.
                  </p>
                </div>
                <div 
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: colors.background, border: `1px solid ${colors.primary}20` }}
                >
                  <p className="text-sm" style={{ color: colors.text, fontFamily: bodyFontFamily }}>
                    Another card showing the design.
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button 
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                  style={{ backgroundColor: colors.primary }}
                >
                  Primary Button
                </button>
                <button 
                  className="px-4 py-2 rounded-lg text-sm font-medium border-2"
                  style={{ borderColor: colors.primary, color: colors.primary }}
                >
                  Secondary Button
                </button>
              </div>
            </div>
          </div>

          {/* Color Palette */}
          <div className="mt-6 flex items-center gap-4">
            <span className="text-sm font-medium" style={{ color: colors.text }}>Colors:</span>
            <div className="flex gap-2">
              {[colors.background, colors.primary, colors.accent, colors.backgroundAlt].map((color, i) => (
                <div 
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
