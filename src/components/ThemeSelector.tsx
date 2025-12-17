"use client";

import { useState, useMemo } from "react";
import { X, Search, Check } from "lucide-react";
import { themes, getThemeById } from "~/lib/themes";
import { Button } from "~/components/ui/Button";

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

  const previewTheme = getThemeById(previewThemeId) || themes[0]!;

  const filteredThemes = useMemo(() => {
    let filtered = themes;

    // Apply category filter
    if (activeFilter !== "all") {
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
  }, [searchQuery, activeFilter]);

  if (!isOpen) return null;

  const handleThemeClick = (themeId: string) => {
    setPreviewThemeId(themeId);
  };

  const handleSelect = () => {
    onSelectTheme(previewThemeId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex h-[90vh] w-[95vw] max-w-7xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Left Panel - Theme Selection */}
        <div className="flex w-[45%] flex-col border-r border-slate-200 bg-slate-50">
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
                { id: "professional", label: "Professional" },
                { id: "bold", label: "Bold" },
                { id: "creative", label: "Creative" },
                { id: "minimal", label: "Minimal" },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    activeFilter === filter.id
                      ? "bg-[#06b6d4] text-white"
                      : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-2 gap-4">
              {filteredThemes.map((theme) => {
                const isSelected = theme.id === previewThemeId;
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
                          backgroundImage: theme.previewBackgroundImage 
                            ? `url(${theme.previewBackgroundImage})`
                            : theme.slideStyles.title.pattern || "none",
                          backgroundSize: theme.previewBackgroundImage ? "cover" : "auto",
                          backgroundPosition: theme.previewBackgroundImage ? "center" : "center",
                        }}
                      >
                        {/* Small content box overlaid on background */}
                        <div 
                          className="absolute bottom-3 left-3 right-3 rounded-lg p-3 backdrop-blur-md transition-all duration-300"
                          style={{
                            backgroundColor: theme.cardBox?.background || "rgba(255, 255, 255, 0.95)",
                            border: theme.cardBox?.borderColor ? `1px solid ${theme.cardBox.borderColor}` : "none",
                            boxShadow: theme.cardBox?.shadow || "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                            maxWidth: "75%",
                          }}
                        >
                          <div
                            className="text-lg font-bold mb-1"
                            style={{
                              fontFamily: theme.fonts.heading.family,
                              color: theme.cardBox?.titleColor || theme.colors.heading,
                            }}
                          >
                            Title
                          </div>
                          <div
                            className="text-xs font-medium"
                            style={{
                              fontFamily: theme.fonts.body.family,
                              color: theme.cardBox?.bodyColor || theme.colors.text,
                            }}
                          >
                            Body &{" "}
                            <span
                              className="underline decoration-2 underline-offset-2"
                              style={{
                                color: theme.cardBox?.accentColor || theme.preview.accentColor,
                                textDecorationColor: theme.cardBox?.accentColor || theme.preview.accentColor,
                              }}
                            >
                              link
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Theme Name Footer */}
                    <div
                      className={`px-3 py-2 border-t flex items-center justify-between text-sm ${
                        isSelected ? "bg-blue-50/50" : "bg-white"
                      }`}
                      style={{ borderColor: isSelected ? "#3b82f6" : "#e2e8f0" }}
                    >
                      <div className="font-medium text-slate-700">
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
        </div>

        {/* Right Panel - Theme Preview */}
        <div className="flex w-[55%] flex-col bg-white">
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

          {/* Bottom Actions */}
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

