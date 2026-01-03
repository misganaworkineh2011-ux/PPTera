"use client";

import { useState, useMemo, useEffect } from "react";
import { X, Search, Check, Sparkles } from "lucide-react";
import { themes, getThemeById, type Theme } from "~/lib/themes";
import { Button } from "~/components/ui/Button";

// Convert custom theme from DB to Theme format
function convertCustomTheme(dbTheme: any): Theme {
  const colors = dbTheme.colors?.custom || {
    background: "#ffffff",
    backgroundAlt: "#f8fafc",
    text: "#334155",
    heading: "#0f172a",
    primary: "#3b82f6",
    accent: "#06b6d4",
  };

  const fontMap: Record<string, string> = {
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

  const headingFont = fontMap[dbTheme.fonts?.heading] || "'Inter', sans-serif";
  const bodyFont = fontMap[dbTheme.fonts?.body] || "'Inter', sans-serif";

  return {
    id: `custom-${dbTheme.id}`,
    name: dbTheme.name,
    description: "Your custom theme",
    category: "creative" as const,
    colors: {
      background: colors.background,
      backgroundAlt: colors.backgroundAlt,
      surface: colors.backgroundAlt,
      text: colors.text,
      textMuted: colors.text,
      heading: colors.heading,
      link: colors.accent,
      linkHover: colors.accent,
      primary: colors.primary,
      primaryHover: colors.primary,
      secondary: colors.accent,
      secondaryHover: colors.accent,
      accent: colors.accent,
      border: colors.backgroundAlt,
      borderHover: colors.primary,
      shadow: "rgba(0, 0, 0, 0.1)",
      success: "#22c55e",
      warning: "#f59e0b",
      error: "#ef4444",
    },
    fonts: {
      heading: { family: headingFont, weight: 700, letterSpacing: "-0.02em" },
      body: { family: bodyFont, weight: 400, lineHeight: "1.6" },
      caption: { family: bodyFont, weight: 500, size: "0.875rem" },
    },
    design: {
      borderRadius: { small: "0.5rem", medium: "0.75rem", large: "1rem", full: "9999px" },
      shadows: {
        small: "0 2px 8px rgba(0, 0, 0, 0.1)",
        medium: "0 8px 24px rgba(0, 0, 0, 0.15)",
        large: "0 16px 48px rgba(0, 0, 0, 0.2)",
      },
      spacing: { tight: "0.5rem", normal: "1rem", relaxed: "1.5rem" },
    },
    slideStyles: {
      title: {
        background: `linear-gradient(135deg, ${colors.background} 0%, ${colors.backgroundAlt} 100%)`,
      },
      content: {
        background: colors.background,
        bulletStyle: "disc" as const,
      },
      image: {
        borderRadius: "0.75rem",
        shadow: "0 20px 50px rgba(0, 0, 0, 0.2)",
      },
    },
    preview: {
      titleBg: colors.background,
      bodyBg: colors.backgroundAlt,
      textColor: colors.text,
      accentColor: colors.accent,
    },
    cardBox: {
      background: colors.backgroundAlt,
      borderColor: colors.primary,
      titleColor: colors.heading,
      bodyColor: colors.text,
      accentColor: colors.accent,
    },
    isCustom: true,
  } as Theme & { isCustom?: boolean };
}

interface ThemeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedThemeId?: string;
  onSelectTheme: (themeId: string) => void;
}

export default function ThemeSelector({
  isOpen,
  onClose,
  selectedThemeId = "corporate-professional",
  onSelectTheme,
}: ThemeSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [previewThemeId, setPreviewThemeId] = useState<string>(selectedThemeId);
  const [customThemes, setCustomThemes] = useState<(Theme & { isCustom?: boolean })[]>([]);
  const [isLoadingCustom, setIsLoadingCustom] = useState(false);

  // All theme fonts for preview
  const THEME_FONTS_URL = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=Outfit:wght@400;500;600;700&family=Sora:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Lato:wght@400;700&family=Cormorant+Garamond:wght@400;500;600;700&family=Source+Sans+3:wght@400;500;600;700&family=Libre+Baskerville:wght@400;700&family=Nunito+Sans:wght@400;500;600;700&family=Noto+Serif+SC:wght@400;500;600;700&display=swap";

  // Load theme fonts when modal opens
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

  // Fetch custom themes when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLoadingCustom(true);
      fetch("/api/themes")
        .then((res) => res.json())
        .then((data) => {
          if (data.themes) {
            const converted = data.themes.map(convertCustomTheme);
            setCustomThemes(converted);
          }
        })
        .catch((err) => console.error("Failed to load custom themes:", err))
        .finally(() => setIsLoadingCustom(false));
    }
  }, [isOpen]);

  // Combine built-in and custom themes
  const allThemes = useMemo(() => {
    return [...customThemes, ...themes];
  }, [customThemes]);

  const getTheme = (id: string) => {
    const customTheme = customThemes.find((t) => t.id === id);
    if (customTheme) return customTheme;
    return getThemeById(id) || themes[0]!;
  };

  const previewTheme = getTheme(previewThemeId);

  const filteredThemes = useMemo(() => {
    let filtered = allThemes;

    // Apply category filter
    if (activeFilter === "custom") {
      filtered = filtered.filter((theme: any) => theme.isCustom === true);
    } else if (activeFilter !== "all") {
      filtered = filtered.filter((theme) => theme.category === activeFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (theme) =>
          theme.name.toLowerCase().includes(query) ||
          theme.description.toLowerCase().includes(query) ||
          theme.category.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [searchQuery, activeFilter, allThemes]);

  if (!isOpen) return null;

  const handleThemeClick = (themeId: string) => {
    setPreviewThemeId(themeId);
  };

  const handleSelect = () => {
    onSelectTheme(previewThemeId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="flex h-[90vh] w-full max-w-7xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Left Panel - Theme Selection */}
        <div className="flex w-full md:w-[45%] flex-col border-r border-slate-200 bg-slate-50">
          {/* Header */}
          <div className="border-b border-slate-200 bg-white p-6">
            <div className="mb-2">
              <h2 className="text-2xl font-bold text-slate-900">All themes</h2>
              <p className="text-sm text-slate-500">
                View and select from all themes.
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search for a theme"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20 focus:border-[#06b6d4]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filter Buttons */}
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                { id: "all", label: "All" },
                { id: "custom", label: "My Themes", icon: true },
                { id: "professional", label: "Professional" },
                { id: "bold", label: "Bold" },
                { id: "creative", label: "Creative" },
                { id: "minimal", label: "Minimal" },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    activeFilter === filter.id
                      ? "bg-[#06b6d4] text-white"
                      : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {filter.id === "custom" && <Sparkles size={14} />}
                  {filter.label}
                  {filter.id === "custom" && customThemes.length > 0 && (
                    <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${
                      activeFilter === filter.id ? "bg-white/20" : "bg-[#06b6d4]/10 text-[#06b6d4]"
                    }`}>
                      {customThemes.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Grid */}
          <div className="flex-1 overflow-y-auto p-6 pb-24 md:pb-6">
            <div className="grid grid-cols-2 gap-4">
              {filteredThemes.map((theme) => {
                const isSelected = theme.id === previewThemeId;
                const hasBackgroundImage = !!theme.previewBackgroundImage || !!theme.backgroundImage;
                const bgImageUrl = theme.previewBackgroundImage || theme.backgroundImage;
                return (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeClick(theme.id)}
                    className={`group relative overflow-hidden rounded-lg border text-left transition-all hover:shadow-md ${
                      isSelected
                        ? "border-[#3b82f6] ring-1 ring-[#3b82f6]"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {/* Theme Preview Card */}
                    <div className="p-3">
                      <div
                        className="aspect-[1.6/1] w-full rounded-md shadow-sm relative overflow-hidden"
                        style={{
                          backgroundColor: theme.preview.titleBg,
                          backgroundImage: hasBackgroundImage
                            ? `url(${bgImageUrl})`
                            : theme.slideStyles.title.pattern || "none",
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      >
                        {/* Lighter overlay for background images to show them better */}
                        {hasBackgroundImage && (
                          <div
                            className="absolute inset-0"
                            style={{ background: "rgba(0,0,0,0.25)" }}
                          />
                        )}
                        
                        {/* Content box centered on background with inline preview */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div 
                            className={`rounded-lg backdrop-blur-sm transition-all duration-300 flex flex-col justify-center px-3 py-2 overflow-hidden ${
                              hasBackgroundImage ? "w-[70%] h-[65%]" : "w-[85%] h-[80%]"
                            }`}
                            style={{
                              backgroundColor: hasBackgroundImage 
                                ? `${theme.cardBox?.background || theme.colors.background}e8`
                                : theme.cardBox?.background || "rgba(255, 255, 255, 0.95)",
                              border: theme.cardBox?.borderColor ? `1px solid ${theme.cardBox.borderColor}` : "none",
                              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                            }}
                          >
                            {/* Inline text preview */}
                            <div 
                              className="text-sm font-bold mb-1 truncate"
                              style={{ color: theme.cardBox?.titleColor || theme.colors.heading, fontFamily: theme.fonts?.heading?.family || "inherit" }}
                            >
                              Title
                            </div>
                            <div className="flex items-center gap-1 text-xs">
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
                    </div>

                    {/* Custom Theme Badge */}
                    {(theme as any).isCustom && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                        <Sparkles size={10} />
                        Custom
                      </div>
                    )}

                    {/* Theme Name Footer */}
                    <div
                      className={`px-3 py-2 border-t flex items-center justify-between text-sm ${
                        isSelected ? "bg-blue-50/50" : "bg-white"
                      }`}
                      style={{ borderColor: isSelected ? "#3b82f6" : "#e2e8f0" }}
                    >
                      <div className="font-medium text-slate-700 flex items-center gap-1.5">
                        {theme.name}
                      </div>
                      {isSelected && (
                        <Check size={16} className="text-[#3b82f6]" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Actions - Mobile (fixed at bottom, matching modal width) */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white shadow-lg z-10">
            <div className="p-4 max-w-7xl mx-auto">
              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose} className="flex-1 px-6 py-3">
                  Cancel
                </Button>
                <Button
                  onClick={handleSelect}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4]"
                >
                  Select theme
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Theme Preview (hidden on mobile) */}
        <div className="hidden md:flex w-[55%] flex-col bg-white">
          {/* Preview Header */}
          <div className="flex items-center justify-between border-b border-slate-200 p-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">{previewTheme.name}</h3>
              <p className="text-sm text-slate-500">{previewTheme.description}</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Preview Content - Three Slides */}
          <div
            className="flex-1 overflow-hidden relative flex flex-col items-center justify-center p-6"
            style={{
              background: previewTheme.previewBackgroundImage 
                ? "transparent" 
                : previewTheme.slideStyles.title.background,
              backgroundImage: previewTheme.previewBackgroundImage 
                ? `url(${previewTheme.previewBackgroundImage})` 
                : (previewTheme.slideStyles.title.pattern || "none"),
              backgroundSize: previewTheme.previewBackgroundImage ? "cover" : "auto",
              backgroundPosition: previewTheme.previewBackgroundImage ? "center" : "center",
            }}
          >
            {/* Overlay for depth */}
            {previewTheme.overlay && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: previewTheme.overlay }}
              />
            )}
            
            {/* Ambient glow effects */}
            <div 
              className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-30"
              style={{ backgroundColor: previewTheme.colors.primary }}
            />
            <div 
              className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full blur-3xl opacity-20"
              style={{ backgroundColor: previewTheme.colors.secondary }}
            />

            {/* Three Slides Vertical */}
            <div className="relative z-10 flex flex-col gap-3 w-full max-w-md" style={{ perspective: "1200px" }}>
              {/* Slide 1 - Title Slide */}
              <div
                className="w-full aspect-[16/9] rounded-lg shadow-xl overflow-hidden"
                style={{
                  transform: "rotateX(3deg)",
                  transformStyle: "preserve-3d",
                  background: previewTheme.slideStyles.title.background,
                  backgroundImage: previewTheme.slideStyles.title.pattern || "none",
                  border: `1px solid ${previewTheme.colors.border}`,
                  boxShadow: previewTheme.design.shadows.medium,
                }}
              >
                <div 
                  className="absolute inset-0 opacity-20"
                  style={{ 
                    background: `radial-gradient(ellipse at 30% 30%, ${previewTheme.colors.primary}40 0%, transparent 60%)` 
                  }}
                />
                <div className="relative z-10 p-4 h-full flex flex-col justify-center">
                  <div 
                    className="text-base font-bold mb-1"
                    style={{ 
                      color: previewTheme.colors.heading, 
                      fontFamily: previewTheme.fonts.heading.family,
                    }}
                  >
                    Presentation Title
                  </div>
                  <p 
                    className="text-xs opacity-70"
                    style={{ color: previewTheme.colors.text }}
                  >
                    A beautiful subtitle for your presentation
                  </p>
                </div>
                <div 
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ background: `linear-gradient(90deg, ${previewTheme.colors.primary}, ${previewTheme.colors.secondary})` }}
                />
              </div>

              {/* Slide 2 - Content Slide */}
              <div
                className="w-full aspect-[16/9] rounded-lg shadow-xl overflow-hidden"
                style={{
                  transform: "rotateX(0deg)",
                  transformStyle: "preserve-3d",
                  background: previewTheme.slideStyles.content.background,
                  border: `1px solid ${previewTheme.colors.border}`,
                  boxShadow: previewTheme.design.shadows.large,
                }}
              >
                <div className="p-4 h-full flex flex-col">
                  <div 
                    className="text-sm font-bold mb-2"
                    style={{ color: previewTheme.colors.heading, fontFamily: previewTheme.fonts.heading.family }}
                  >
                    Content Slide
                  </div>
                  <div className="flex-1 flex gap-3">
                    <div className="flex-1 flex flex-col gap-1.5">
                      {["Key point one", "Key point two", "Key point three"].map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div 
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: previewTheme.colors.primary }}
                          />
                          <span 
                            className="text-[10px] opacity-70"
                            style={{ color: previewTheme.colors.text }}
                          >
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div 
                      className="w-1/3 rounded"
                      style={{ 
                        backgroundColor: previewTheme.colors.backgroundAlt,
                        border: `1px solid ${previewTheme.colors.border}`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Slide 3 - Features Slide */}
              <div
                className="w-full aspect-[16/9] rounded-lg shadow-xl overflow-hidden"
                style={{
                  transform: "rotateX(-3deg)",
                  transformStyle: "preserve-3d",
                  background: previewTheme.slideStyles.content.background,
                  border: `1px solid ${previewTheme.colors.border}`,
                  boxShadow: previewTheme.design.shadows.medium,
                }}
              >
                <div className="p-4 h-full flex flex-col">
                  <div 
                    className="text-sm font-bold mb-2"
                    style={{ color: previewTheme.colors.heading, fontFamily: previewTheme.fonts.heading.family }}
                  >
                    Features
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div 
                        key={i}
                        className="rounded flex items-center justify-center"
                        style={{ 
                          backgroundColor: previewTheme.colors.primary + "20",
                          border: `1px solid ${previewTheme.colors.primary}30`,
                        }}
                      >
                        <span className="text-[9px] opacity-50" style={{ color: previewTheme.colors.text }}>
                          Item {i}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Theme color palette indicator */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {[
                previewTheme.colors.primary,
                previewTheme.colors.secondary,
                previewTheme.colors.accent,
              ].map((color, i) => (
                <div
                  key={i}
                  className="w-4 h-4 rounded-full border-2 border-white/30 shadow-lg"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Bottom Actions - Desktop */}
          <div className="border-t border-slate-200 bg-white p-6">
            <div className="flex items-center justify-end gap-4">
              <Button variant="outline" onClick={onClose} className="px-6">
                Cancel
              </Button>
              <Button
                onClick={handleSelect}
                className="px-6 bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4]"
              >
                Select theme
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

