"use client";

import { useState, useEffect } from "react";
import { Grid, List as ListIcon, Palette, Trash2, MoreHorizontal, X, Eye, Loader2 } from "lucide-react";
import { useLanguage } from "~/contexts/LanguageContext";
import { dashboardTranslations } from "~/lib/dashboard-translations";

// Google Fonts URL for preview
const GOOGLE_FONTS_URL = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@400;500;700&family=Poppins:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&family=Lato:wght@400;700&family=Open+Sans:wght@400;600;700&family=Playfair+Display:wght@400;500;600;700&family=Merriweather:wght@400;700&family=Source+Code+Pro:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap";

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
  };
  isDefault: boolean;
  createdAt?: Date;
}

interface ThemesContentProps {
  initialThemes: ThemeData[];
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

export default function ThemesContent({ initialThemes }: ThemesContentProps) {
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

  const getThemeColors = (theme: ThemeData): string[] => {
    if (theme.colors.colors) return theme.colors.colors;
    if (theme.colors.custom) {
      const c = theme.colors.custom;
      return [c.background, c.primary, c.accent, c.backgroundAlt];
    }
    return ["#3b82f6", "#06b6d4", "#f8fafc", "#e2e8f0"];
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
      {/* Filters & View Toggle - matching presentations exactly */}
      <div className="flex flex-row items-center justify-between gap-4 border-b border-slate-100 dark:border-neutral-800 pb-3 sm:pb-4">
        {/* Left side - Filter buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 -mx-1 px-1">
          <button
            className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap rounded-lg px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition bg-[#1e3a8a]/10 dark:bg-[#1e3a8a]/30 font-bold text-[#1e3a8a] dark:text-white"
          >
            <Grid size={14} className="sm:hidden" />
            <Grid size={16} className="hidden sm:block" />
            {t.all || "All"}
          </button>
        </div>

        {/* Right side - Grid/List toggle */}
        <div className="flex items-center gap-0.5 sm:gap-1 rounded-lg bg-slate-100 dark:bg-neutral-800 p-0.5 sm:p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-1 sm:gap-2 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 transition ${
              viewMode === "grid"
                ? "bg-white dark:bg-neutral-700 text-[#1e3a8a] dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-neutral-200"
            }`}
          >
            <Grid size={16} className="sm:hidden" />
            <Grid size={20} className="hidden sm:block" />
            <span className="text-xs sm:text-sm font-medium hidden xs:inline">{t.grid || "Grid"}</span>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1 sm:gap-2 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 transition ${
              viewMode === "list"
                ? "bg-white dark:bg-neutral-700 text-[#1e3a8a] dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-neutral-200"
            }`}
          >
            <ListIcon size={16} className="sm:hidden" />
            <ListIcon size={20} className="hidden sm:block" />
            <span className="text-xs sm:text-sm font-medium hidden xs:inline">{t.list || "List"}</span>
          </button>
        </div>
      </div>

      {/* Content Display */}
      <div className="min-h-[300px] sm:min-h-[400px] lg:min-h-[600px]">
        {themes.length === 0 ? (
          <div className="flex h-[250px] sm:h-[300px] lg:h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50 text-center px-4">
            <div className="mb-3 sm:mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-md bg-white dark:bg-neutral-800 shadow-lg ring-1 ring-slate-100 dark:ring-neutral-700">
              <Palette size={22} className="sm:hidden text-[#06b6d4]" />
              <Palette size={28} className="hidden sm:block text-[#06b6d4]" />
            </div>
            <h3 className="mb-1.5 sm:mb-2 text-base sm:text-lg font-bold text-[#1e3a8a] dark:text-white">
              {t.noCustomThemes || "No custom themes yet"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 max-w-xs mx-auto">
              {t.createFirstTheme || "Create your first custom theme to personalize your presentations."}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {themes.map((theme) => (
              <div
                key={theme.id}
                onClick={() => setPreviewTheme(theme)}
                className="group relative flex flex-col overflow-hidden rounded-md border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm transition-all hover:border-[#06b6d4]/50 hover:shadow-lg hover:shadow-[#06b6d4]/10 cursor-pointer"
              >
                {/* Color Preview - matching aspect ratio */}
                <div className="aspect-[16/9] w-full relative overflow-hidden">
                  <div className="absolute inset-0 flex">
                    {getThemeColors(theme).map((color, idx) => (
                      <div key={idx} className="flex-1" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-transparent group-hover:from-black/10 transition-colors" />
                  
                  {/* Preview icon on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                      <Eye size={18} className="text-[#1e3a8a] dark:text-[#06b6d4]" />
                    </div>
                  </div>
                </div>

                {/* Content Section - matching presentations */}
                <div className="flex flex-col p-2 sm:p-3">
                  <h3 className="mb-1.5 sm:mb-2 line-clamp-2 text-xs sm:text-sm font-bold text-[#1e3a8a] dark:text-white" title={theme.name}>
                    {theme.name}
                  </h3>

                  {/* Font indicator */}
                  <div className="flex items-center gap-1 sm:gap-1.5 mb-1.5 sm:mb-2">
                    <span className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-neutral-400">{getFontName(theme)}</span>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-1.5 sm:pt-2 border-t border-slate-50 dark:border-neutral-800">
                    <span className="text-[9px] sm:text-[10px] text-slate-400 dark:text-neutral-500">
                      {t.customTheme || "Custom Theme"}
                    </span>
                    <div className="relative menu-container">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenu(activeMenu === theme.id ? null : theme.id);
                        }}
                        className="text-slate-300 hover:text-[#06b6d4] dark:text-neutral-500 dark:hover:text-[#06b6d4]"
                      >
                        <MoreHorizontal size={14} />
                      </button>
                      {activeMenu === theme.id && (
                        <div className="absolute right-0 bottom-full mb-1 w-36 rounded-lg border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg z-50">
                          <div className="p-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewTheme(theme);
                                setActiveMenu(null);
                              }}
                              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800"
                            >
                              <Eye size={14} /> {t.preview || "Preview"}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openDeleteConfirm(theme);
                              }}
                              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                            >
                              <Trash2 size={14} /> {t.delete || "Delete"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-2">
            {themes.map((theme) => (
              <div
                key={theme.id}
                onClick={() => setPreviewTheme(theme)}
                className="group flex items-center gap-2 sm:gap-4 rounded-md border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-2 sm:p-3 shadow-sm transition-all hover:border-[#06b6d4]/50 hover:shadow-md cursor-pointer"
              >
                {/* Color Preview */}
                <div className="w-14 h-10 sm:w-20 sm:h-14 flex-shrink-0 rounded relative overflow-hidden">
                  <div className="absolute inset-0 flex">
                    {getThemeColors(theme).map((color, idx) => (
                      <div key={idx} className="flex-1" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-[#1e3a8a] dark:text-white truncate">{theme.name}</h3>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-neutral-400">{getFontName(theme)}</p>
                </div>

                {/* Actions */}
                <div className="relative flex-shrink-0 menu-container">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenu(activeMenu === theme.id ? null : theme.id);
                    }}
                    className="text-slate-300 hover:text-[#06b6d4] dark:text-neutral-500 dark:hover:text-[#06b6d4]"
                  >
                    <MoreHorizontal size={18} />
                  </button>
                  {activeMenu === theme.id && (
                    <div className="absolute right-0 top-full mt-1 w-36 rounded-lg border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg z-50">
                      <div className="p-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewTheme(theme);
                            setActiveMenu(null);
                          }}
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800"
                        >
                          <Eye size={14} /> {t.preview || "Preview"}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteConfirm(theme);
                          }}
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                        >
                          <Trash2 size={14} /> {t.delete || "Delete"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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

  const colors = theme.colors.custom || {
    background: "#ffffff",
    backgroundAlt: "#f8fafc",
    text: "#334155",
    heading: "#0f172a",
    primary: "#3b82f6",
    accent: "#06b6d4",
  };

  const headingFontFamily = fontFamilyMap[theme.fonts.heading || "inter"] || "'Inter', sans-serif";
  const bodyFontFamily = fontFamilyMap[theme.fonts.body || "inter"] || "'Inter', sans-serif";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-[#1e3a8a]">{theme.name}</h2>
            <p className="text-sm text-slate-500">Theme Preview</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        {/* Preview Content */}
        <div className="p-6" style={{ backgroundColor: colors.background }}>
          {/* Slide Preview */}
          <div 
            className="rounded-xl overflow-hidden shadow-lg"
            style={{ backgroundColor: colors.backgroundAlt }}
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
    </div>
  );
}
