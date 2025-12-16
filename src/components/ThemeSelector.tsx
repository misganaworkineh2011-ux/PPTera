"use client";

import { useState, useMemo } from "react";
import { X, Search, Check } from "lucide-react";
import { themes, getThemeById, type Theme } from "~/lib/themes";
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

  const selectedTheme = getThemeById(selectedThemeId) || themes[0]!;
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
            <h3 className="text-xl font-bold text-slate-900">Theme Preview</h3>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Preview Content */}
          <div
            className="flex-1 overflow-y-auto p-8 relative"
            style={{
              backgroundColor: previewTheme.preview.bodyBg,
              backgroundImage: previewTheme.backgroundImage 
                ? `url(${previewTheme.backgroundImage})`
                : "none",
              backgroundSize: previewTheme.backgroundImage ? "cover" : "auto",
              backgroundPosition: previewTheme.backgroundImage ? "center" : "center",
              backgroundAttachment: previewTheme.backgroundImage ? "fixed" : "scroll",
              color: previewTheme.preview.textColor,
            }}
          >
            {/* Overlay for text readability */}
            {previewTheme.overlay && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: previewTheme.overlay }}
              />
            )}
            {/* Top Section */}
            <div className="mb-8 relative z-10">
              <h2
                className="mb-4 text-2xl font-bold"
                style={{ 
                  color: previewTheme.colors.heading,
                  fontFamily: previewTheme.fonts.heading.family
                }}
              >
                This is a heading.
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="aspect-video rounded-lg bg-slate-200/20 flex items-center justify-center text-sm opacity-60"
                    style={{
                      backgroundColor:
                        previewTheme.colors.backgroundAlt + "40",
                    }}
                  >
                    Image {i}
                  </div>
                ))}
              </div>
            </div>

            {/* Main Content */}
            <div className="mb-8 relative z-10" style={{ fontFamily: previewTheme.fonts.body.family }}>
              <div className="mb-4 text-4xl">Hello 👋</div>
              <h1
                className="mb-4 text-4xl font-bold"
                style={{ 
                  color: previewTheme.colors.heading,
                  fontFamily: previewTheme.fonts.heading.family
                }}
              >
                This is a theme preview.
              </h1>
              <p className="mb-4 text-lg leading-relaxed">
                This is body text. You can change your fonts, colors and images
                later in the theme editor. You can also create your own custom
                branded theme.
              </p>
              <a
                href="#"
                className="text-lg underline"
                style={{ color: previewTheme.preview.accentColor }}
              >
                This is a link.
              </a>

              {/* Smart Layout Boxes */}
              <div className="my-6 grid grid-cols-2 gap-4">
                {[
                  "This is a smart layout: it acts as a text box.",
                  "You can get these by typing /smart",
                ].map((text, i) => (
                  <div
                    key={i}
                    className="rounded-lg p-4"
                    style={{
                      backgroundColor: previewTheme.colors.primary + "20",
                      border: `1px solid ${previewTheme.colors.primary}40`,
                    }}
                  >
                    <p className="text-sm">{text}</p>
                  </div>
                ))}
              </div>

              {/* Buttons */}
              <div className="my-6 flex gap-4">
                <button
                  className="rounded-lg px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: previewTheme.colors.primary }}
                >
                  Primary button
                </button>
                <button
                  className="rounded-lg border-2 px-6 py-3 font-semibold transition-opacity hover:opacity-80"
                  style={{
                    borderColor: previewTheme.colors.secondary,
                    color: previewTheme.preview.textColor,
                  }}
                >
                  Secondary button
                </button>
              </div>

              {/* Image Placeholder */}
              <div className="my-6">
                <div
                  className="aspect-video rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: previewTheme.colors.secondary + "30",
                    border: `2px dashed ${previewTheme.colors.secondary}60`,
                  }}
                >
                  <div className="text-center opacity-50">
                    <div className="mb-2 text-4xl">🖼️</div>
                    <div className="text-sm">Image placeholder</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="relative z-10" style={{ fontFamily: previewTheme.fonts.body.family }}>
              <h2
                className="mb-4 text-2xl font-bold"
                style={{ 
                  color: previewTheme.colors.heading,
                  fontFamily: previewTheme.fonts.heading.family
                }}
              >
                This is also a heading.
              </h2>
              <h1
                className="mb-4 text-5xl font-bold"
                style={{ 
                  color: previewTheme.colors.heading,
                  fontFamily: previewTheme.fonts.heading.family
                }}
              >
                This is a title It&apos;s like a heading, but bigger.
              </h1>
              <p className="text-lg leading-relaxed">
                This is body text. You can change your fonts, colors and images
                later in the theme editor. You can also create your own custom
                branded theme. What&apos;s more, you can create multiple themes
                and switch between them at any time.
              </p>
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

