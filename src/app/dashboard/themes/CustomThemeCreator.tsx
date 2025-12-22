"use client";

import { useState, useCallback, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Check, Palette, Type, Square, Tag, Upload } from "lucide-react";
import { useLanguage } from "~/contexts/LanguageContext";
import { dashboardTranslations } from "~/lib/dashboard-translations";

// Google Fonts URL for preview
const GOOGLE_FONTS_URL = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@400;500;700&family=Poppins:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&family=Lato:wght@400;700&family=Open+Sans:wght@400;600;700&family=Playfair+Display:wght@400;500;600;700&family=Merriweather:wght@400;700&family=Source+Code+Pro:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap";

interface CustomThemeData {
  // Step 1: Colors
  colorMode: "curated" | "custom";
  selectedPalette: string | null;
  customColors: {
    background: string;
    backgroundAlt: string;
    text: string;
    heading: string;
    primary: string;
    accent: string;
  };
  // Step 2: Fonts
  headingFont: string;
  bodyFont: string;
  // Step 3: Card Design
  cardStyle: string;
  // Step 4: Theme Name & Logo
  themeName: string;
  logoUrl: string | null;
}

interface CustomThemeCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (theme: CustomThemeData) => Promise<void>;
}

const STEPS = [
  { id: 1, name: "Colors", icon: Palette },
  { id: 2, name: "Fonts", icon: Type },
  { id: 3, name: "Design", icon: Square },
  { id: 4, name: "Theme name", icon: Tag },
];

// Curated color palettes with categories
const COLOR_CATEGORIES = [
  "All", "Light", "Dark", "Red", "Orange", "Yellow", "Green", "Blue", "Purple", "Pink", "Neutral", "Gray", "Professional", "Colorful", "Futuristic", "Modern"
];

const CURATED_PALETTES = [
  { id: "clean-white", name: "Clean White", category: ["Light", "Professional", "Modern"], colors: { background: "#ffffff", backgroundAlt: "#f8fafc", text: "#334155", heading: "#0f172a", primary: "#3b82f6", accent: "#06b6d4" }},
  { id: "soft-cream", name: "Soft Cream", category: ["Light", "Neutral"], colors: { background: "#fefce8", backgroundAlt: "#fef9c3", text: "#713f12", heading: "#422006", primary: "#ca8a04", accent: "#eab308" }},
  { id: "elegant-noir", name: "Elegant Noir", category: ["Dark", "Professional"], colors: { background: "#0a0a0b", backgroundAlt: "#1a1a1d", text: "#e4e4e7", heading: "#fafafa", primary: "#f59e0b", accent: "#6366f1" }},
  { id: "midnight-blue", name: "Midnight Blue", category: ["Dark", "Blue", "Professional"], colors: { background: "#0f172a", backgroundAlt: "#1e293b", text: "#cbd5e1", heading: "#f1f5f9", primary: "#3b82f6", accent: "#06b6d4" }},
  { id: "forest-green", name: "Forest Green", category: ["Dark", "Green"], colors: { background: "#052e16", backgroundAlt: "#14532d", text: "#bbf7d0", heading: "#dcfce7", primary: "#22c55e", accent: "#4ade80" }},
  { id: "ocean-depths", name: "Ocean Depths", category: ["Dark", "Blue", "Colorful"], colors: { background: "#0c4a6e", backgroundAlt: "#075985", text: "#bae6fd", heading: "#e0f2fe", primary: "#0ea5e9", accent: "#38bdf8" }},
  { id: "sunset-warm", name: "Sunset Warm", category: ["Light", "Orange", "Colorful"], colors: { background: "#fff7ed", backgroundAlt: "#ffedd5", text: "#9a3412", heading: "#7c2d12", primary: "#f97316", accent: "#fb923c" }},
  { id: "rose-garden", name: "Rose Garden", category: ["Light", "Pink", "Colorful"], colors: { background: "#fff1f2", backgroundAlt: "#ffe4e6", text: "#9f1239", heading: "#881337", primary: "#f43f5e", accent: "#fb7185" }},
  { id: "purple-haze", name: "Purple Haze", category: ["Dark", "Purple", "Futuristic"], colors: { background: "#2e1065", backgroundAlt: "#4c1d95", text: "#e9d5ff", heading: "#f3e8ff", primary: "#a855f7", accent: "#c084fc" }},
  { id: "cyber-neon", name: "Cyber Neon", category: ["Dark", "Futuristic", "Colorful"], colors: { background: "#020617", backgroundAlt: "#0f172a", text: "#22d3ee", heading: "#67e8f9", primary: "#06b6d4", accent: "#f0abfc" }},
  { id: "corporate-gray", name: "Corporate Gray", category: ["Light", "Gray", "Professional"], colors: { background: "#f8fafc", backgroundAlt: "#f1f5f9", text: "#475569", heading: "#1e293b", primary: "#64748b", accent: "#94a3b8" }},
  { id: "warm-earth", name: "Warm Earth", category: ["Light", "Orange", "Neutral"], colors: { background: "#faf5f0", backgroundAlt: "#f5ebe0", text: "#78350f", heading: "#451a03", primary: "#b45309", accent: "#d97706" }},
];

const FONT_OPTIONS = [
  { id: "inter", name: "Inter", family: "'Inter', sans-serif", style: "Modern & Clean" },
  { id: "roboto", name: "Roboto", family: "'Roboto', sans-serif", style: "Professional" },
  { id: "poppins", name: "Poppins", family: "'Poppins', sans-serif", style: "Friendly & Modern" },
  { id: "montserrat", name: "Montserrat", family: "'Montserrat', sans-serif", style: "Bold & Elegant" },
  { id: "lato", name: "Lato", family: "'Lato', sans-serif", style: "Warm & Stable" },
  { id: "open-sans", name: "Open Sans", family: "'Open Sans', sans-serif", style: "Neutral & Readable" },
  { id: "playfair", name: "Playfair Display", family: "'Playfair Display', serif", style: "Classic & Elegant" },
  { id: "merriweather", name: "Merriweather", family: "'Merriweather', serif", style: "Traditional" },
  { id: "source-code", name: "Source Code Pro", family: "'Source Code Pro', monospace", style: "Technical" },
  { id: "space-grotesk", name: "Space Grotesk", family: "'Space Grotesk', sans-serif", style: "Futuristic" },
];

const CARD_STYLES = [
  { id: "standard", name: "Standard", description: "Subtle rounding and shadows", preview: "rounded-lg shadow-md" },
  { id: "flat", name: "Flat", description: "Clean design with no borders", preview: "rounded-none shadow-none" },
  { id: "outline", name: "Outline", description: "Outlined boxes with hard edges", preview: "rounded-none border-2" },
  { id: "sharp", name: "Sharp", description: "Flat design with sharp edges", preview: "rounded-none shadow-sm" },
  { id: "blocky", name: "Blocky", description: "Square cards with a 3D effect", preview: "rounded-none shadow-[4px_4px_0px_0px]" },
  { id: "glass", name: "Glass", description: "Soft and transparent", preview: "rounded-xl backdrop-blur-sm bg-white/30" },
  { id: "rounded", name: "Rounded", description: "Gentle, inviting corners", preview: "rounded-2xl shadow-lg" },
  { id: "soft-cloud", name: "Soft Cloud", description: "Soft shadows with subtle contrast", preview: "rounded-xl shadow-xl" },
  { id: "capsule", name: "Capsule", description: "Rounded corners with playful blocks", preview: "rounded-full" },
];

const initialThemeData: CustomThemeData = {
  colorMode: "curated",
  selectedPalette: null,
  customColors: {
    background: "#ffffff",
    backgroundAlt: "#f8fafc",
    text: "#334155",
    heading: "#0f172a",
    primary: "#3b82f6",
    accent: "#06b6d4",
  },
  headingFont: "inter",
  bodyFont: "inter",
  cardStyle: "standard",
  themeName: "",
  logoUrl: null,
};

export default function CustomThemeCreator({ isOpen, onClose, onSave }: CustomThemeCreatorProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [themeData, setThemeData] = useState<CustomThemeData>(initialThemeData);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isSaving, setIsSaving] = useState(false);
  const { language } = useLanguage();
  const t = dashboardTranslations[language] || dashboardTranslations.en;

  const filteredPalettes = CURATED_PALETTES.filter(
    p => selectedCategory === "All" || p.category.includes(selectedCategory)
  );

  const getCurrentColors = useCallback(() => {
    if (themeData.colorMode === "custom") {
      return themeData.customColors;
    }
    const palette = CURATED_PALETTES.find(p => p.id === themeData.selectedPalette);
    return palette?.colors || themeData.customColors;
  }, [themeData]);

  const getSelectedFont = (fontId: string) => {
    const font = FONT_OPTIONS.find(f => f.id === fontId);
    return font ?? FONT_OPTIONS[0]!;
  };

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSave = async () => {
    if (!themeData.themeName.trim()) {
      alert("Please enter a theme name");
      return;
    }
    setIsSaving(true);
    try {
      await onSave(themeData);
      setThemeData(initialThemeData);
      setCurrentStep(1);
      onClose();
    } catch (error) {
      console.error("Error saving theme:", error);
      alert("Failed to save theme");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setThemeData(initialThemeData);
    setCurrentStep(1);
    onClose();
  };

  // Load Google Fonts when modal opens
  useEffect(() => {
    if (isOpen) {
      const existingLink = document.querySelector(`link[href="${GOOGLE_FONTS_URL}"]`);
      if (!existingLink) {
        const link = document.createElement("link");
        link.href = GOOGLE_FONTS_URL;
        link.rel = "stylesheet";
        document.head.appendChild(link);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const colors = getCurrentColors();
  const headingFont = getSelectedFont(themeData.headingFont);
  const bodyFont = getSelectedFont(themeData.bodyFont);
  const cardStyle = CARD_STYLES.find(s => s.id === themeData.cardStyle) ?? CARD_STYLES[0]!;

  const stepNames = [t.colors || "Colors", t.fontsLabel || "Fonts", t.designLabel || "Design", t.themeNameStep || "Theme name"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex w-full max-w-5xl h-[85vh] max-h-[750px] overflow-hidden rounded-2xl bg-white dark:bg-black shadow-2xl">
        {/* Left Panel - Form */}
        <div className="w-1/2 flex flex-col border-r border-slate-200 dark:border-neutral-800">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-neutral-800 px-6 py-4">
            <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 dark:text-neutral-400 dark:hover:text-slate-300">
              <X size={20} />
            </button>
            <div className="flex items-center gap-2 text-[#06b6d4]">
              {(() => {
                const step = STEPS[currentStep - 1];
                if (!step) return null;
                const CurrentIcon = step.icon;
                return CurrentIcon ? <CurrentIcon size={18} /> : null;
              })()}
              <span className="font-semibold">{stepNames[currentStep - 1]}</span>
            </div>
            <div className="w-5" />
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 px-6 py-4 border-b border-slate-100 dark:border-neutral-800">
            {STEPS.map((step, idx) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all ${
                    currentStep === step.id
                      ? "bg-[#06b6d4] text-white"
                      : currentStep > step.id
                      ? "bg-green-500 text-white"
                      : "bg-slate-200 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400"
                  }`}
                >
                  {currentStep > step.id ? <Check size={14} /> : step.id}
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`mx-2 h-0.5 w-8 ${currentStep > step.id ? "bg-green-500" : "bg-slate-200 dark:bg-neutral-800"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {currentStep === 1 && (
              <Step1Colors
                themeData={themeData}
                setThemeData={setThemeData}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                filteredPalettes={filteredPalettes}
              />
            )}
            {currentStep === 2 && (
              <Step2Fonts themeData={themeData} setThemeData={setThemeData} />
            )}
            {currentStep === 3 && (
              <Step3Design themeData={themeData} setThemeData={setThemeData} />
            )}
            {currentStep === 4 && (
              <Step4Name themeData={themeData} setThemeData={setThemeData} />
            )}
          </div>

          {/* Footer Navigation */}
          <div className="flex items-center justify-between border-t border-slate-200 dark:border-neutral-800 px-6 py-4">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-600 dark:text-neutral-400 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} /> {t.back || "Back"}
            </button>
            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                disabled={currentStep === 1 && !themeData.selectedPalette && themeData.colorMode === "curated"}
                className="flex items-center gap-2 rounded-lg bg-[#06b6d4] px-6 py-2 text-sm font-bold text-white hover:bg-[#0891b2] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.next || "Next"} <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={isSaving || !themeData.themeName.trim()}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] px-6 py-2 text-sm font-bold text-white hover:from-[#172554] hover:to-[#0891b2] disabled:opacity-50"
              >
                {isSaving ? (t.creating || "Creating...") : (t.createTheme || "Create Theme")}
              </button>
            )}
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="w-1/2 bg-slate-100 dark:bg-neutral-900 p-6 overflow-y-auto">
          <ThemePreview
            colors={colors}
            headingFont={headingFont}
            bodyFont={bodyFont}
            cardStyle={cardStyle}
            themeName={themeData.themeName}
          />
        </div>
      </div>
    </div>
  );
}


// Step 1: Colors
function Step1Colors({
  themeData,
  setThemeData,
  selectedCategory,
  setSelectedCategory,
  filteredPalettes,
}: {
  themeData: CustomThemeData;
  setThemeData: React.Dispatch<React.SetStateAction<CustomThemeData>>;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  filteredPalettes: typeof CURATED_PALETTES;
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-500 mb-4">Choose your theme and background colors</p>
        
        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setThemeData(prev => ({ ...prev, colorMode: "curated" }))}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
              themeData.colorMode === "curated"
                ? "bg-[#06b6d4] text-white"
                : "bg-slate-100 text-slate-600 dark:text-neutral-400 hover:bg-slate-200"
            }`}
          >
            ✓ Curated
          </button>
          <button
            onClick={() => setThemeData(prev => ({ ...prev, colorMode: "custom" }))}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
              themeData.colorMode === "custom"
                ? "bg-[#06b6d4] text-white"
                : "bg-slate-100 text-slate-600 dark:text-neutral-400 hover:bg-slate-200"
            }`}
          >
            ✎ Customize
          </button>
        </div>
      </div>

      {themeData.colorMode === "curated" ? (
        <>
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-4">
            {COLOR_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  selectedCategory === cat
                    ? "bg-[#1e3a8a] text-white"
                    : "bg-slate-100 text-slate-600 dark:text-neutral-400 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Palette Grid */}
          <div className="grid grid-cols-3 gap-3">
            {filteredPalettes.map(palette => (
              <button
                key={palette.id}
                onClick={() => setThemeData(prev => ({ ...prev, selectedPalette: palette.id }))}
                className={`group relative overflow-hidden rounded-lg border-2 transition-all ${
                  themeData.selectedPalette === palette.id
                    ? "border-[#06b6d4] ring-2 ring-[#06b6d4]/20"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="h-16 flex">
                  <div className="flex-1" style={{ backgroundColor: palette.colors.background }} />
                  <div className="flex-1" style={{ backgroundColor: palette.colors.primary }} />
                  <div className="flex-1" style={{ backgroundColor: palette.colors.accent }} />
                </div>
                <div className="p-2 bg-white">
                  <p className="text-xs font-medium text-slate-700 dark:text-neutral-300 truncate">{palette.name}</p>
                </div>
                {themeData.selectedPalette === palette.id && (
                  <div className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#06b6d4] text-white">
                    <Check size={12} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </>
      ) : (
        /* Custom Color Pickers */
        <div className="space-y-4">
          {Object.entries(themeData.customColors).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700 dark:text-neutral-300 capitalize">
                {key.replace(/([A-Z])/g, " $1").trim()}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={value}
                  onChange={(e) =>
                    setThemeData(prev => ({
                      ...prev,
                      customColors: { ...prev.customColors, [key]: e.target.value },
                    }))
                  }
                  className="h-8 w-12 cursor-pointer rounded border border-slate-200"
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) =>
                    setThemeData(prev => ({
                      ...prev,
                      customColors: { ...prev.customColors, [key]: e.target.value },
                    }))
                  }
                  className="w-24 rounded border border-slate-200 px-2 py-1 text-sm font-mono"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Step 2: Fonts
function Step2Fonts({
  themeData,
  setThemeData,
}: {
  themeData: CustomThemeData;
  setThemeData: React.Dispatch<React.SetStateAction<CustomThemeData>>;
}) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">Choose fonts for your theme</p>

      {/* Heading Font */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-3">Heading Font</h3>
        <div className="grid grid-cols-2 gap-2">
          {FONT_OPTIONS.map(font => (
            <button
              key={font.id}
              onClick={() => setThemeData(prev => ({ ...prev, headingFont: font.id }))}
              className={`relative rounded-lg border-2 p-3 text-left transition-all ${
                themeData.headingFont === font.id
                  ? "border-[#06b6d4] bg-[#e0f2fe]"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <p className="font-bold text-slate-800 dark:text-white" style={{ fontFamily: font.family }}>
                {font.name}
              </p>
              <p className="text-xs text-slate-500">{font.style}</p>
              {themeData.headingFont === font.id && (
                <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#06b6d4] text-white">
                  <Check size={12} />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Body Font */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-3">Body Font</h3>
        <div className="grid grid-cols-2 gap-2">
          {FONT_OPTIONS.map(font => (
            <button
              key={font.id}
              onClick={() => setThemeData(prev => ({ ...prev, bodyFont: font.id }))}
              className={`relative rounded-lg border-2 p-3 text-left transition-all ${
                themeData.bodyFont === font.id
                  ? "border-[#06b6d4] bg-[#e0f2fe]"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <p className="text-slate-800 dark:text-white" style={{ fontFamily: font.family }}>
                {font.name}
              </p>
              <p className="text-xs text-slate-500">{font.style}</p>
              {themeData.bodyFont === font.id && (
                <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#06b6d4] text-white">
                  <Check size={12} />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Step 3: Card Design
function Step3Design({
  themeData,
  setThemeData,
}: {
  themeData: CustomThemeData;
  setThemeData: React.Dispatch<React.SetStateAction<CustomThemeData>>;
}) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">Choose a style for your content</p>

      <div className="grid grid-cols-3 gap-3">
        {CARD_STYLES.map(style => (
          <button
            key={style.id}
            onClick={() => setThemeData(prev => ({ ...prev, cardStyle: style.id }))}
            className={`relative rounded-lg border-2 p-4 transition-all ${
              themeData.cardStyle === style.id
                ? "border-[#06b6d4] bg-[#e0f2fe]"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            {/* Card Preview */}
            <div className="mb-3 flex justify-center">
              <div
                className={`h-12 w-16 border-2 border-slate-300 bg-white ${
                  style.id === "standard" ? "rounded-lg shadow-md" :
                  style.id === "flat" ? "rounded-none" :
                  style.id === "outline" ? "rounded-none border-2 border-slate-400" :
                  style.id === "sharp" ? "rounded-none shadow-sm" :
                  style.id === "blocky" ? "rounded-none shadow-[3px_3px_0px_0px_rgba(0,0,0,0.2)]" :
                  style.id === "glass" ? "rounded-xl bg-white/50 backdrop-blur-sm border-white/30" :
                  style.id === "rounded" ? "rounded-2xl shadow-lg" :
                  style.id === "soft-cloud" ? "rounded-xl shadow-xl" :
                  "rounded-full"
                }`}
              />
            </div>
            <p className="text-xs font-bold text-slate-700 dark:text-neutral-300">{style.name}</p>
            <p className="text-[10px] text-slate-500 mt-1">{style.description}</p>
            {themeData.cardStyle === style.id && (
              <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#06b6d4] text-white">
                <Check size={12} />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// Step 4: Theme Name & Logo
function Step4Name({
  themeData,
  setThemeData,
}: {
  themeData: CustomThemeData;
  setThemeData: React.Dispatch<React.SetStateAction<CustomThemeData>>;
}) {
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThemeData(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">Last step! What should we call your theme?</p>

      {/* Theme Preview Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="mb-2 rounded border border-[#06b6d4] p-3">
              <p className="text-lg font-bold text-slate-800 dark:text-white">Title</p>
              <p className="text-sm text-[#06b6d4]">Body & link</p>
            </div>
            <div className="flex items-center gap-2 mt-3">
              {themeData.logoUrl ? (
                <img src={themeData.logoUrl} alt="Logo" className="h-6 w-6 object-contain" />
              ) : (
                <div className="h-6 w-6 rounded bg-slate-200" />
              )}
              <div>
                <p className="text-xs font-medium text-slate-600 dark:text-neutral-400">
                  {themeData.themeName || "Untitled theme"}
                </p>
                <p className="text-[10px] text-slate-400">Created by you</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Theme Name Input */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2">Theme name</label>
        <input
          type="text"
          value={themeData.themeName}
          onChange={(e) => setThemeData(prev => ({ ...prev, themeName: e.target.value }))}
          placeholder="Theme name"
          className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm focus:border-[#06b6d4] focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20"
        />
      </div>

      {/* Logo Upload */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2">Logo (optional)</label>
        <p className="text-xs text-slate-500 mb-3">Optional: you can add your logo if you&apos;d like</p>
        <div className="rounded-lg border-2 border-dashed border-slate-200 p-6 text-center hover:border-[#06b6d4] transition-colors">
          {themeData.logoUrl ? (
            <div className="flex flex-col items-center gap-2">
              <img src={themeData.logoUrl} alt="Logo preview" className="h-16 w-16 object-contain" />
              <button
                onClick={() => setThemeData(prev => ({ ...prev, logoUrl: null }))}
                className="text-xs text-red-500 hover:text-red-600"
              >
                Remove logo
              </button>
            </div>
          ) : (
            <label className="cursor-pointer">
              <Upload size={24} className="mx-auto mb-2 text-slate-400" />
              <p className="text-sm text-slate-500">
                Drag your own logo or{" "}
                <span className="text-[#06b6d4] hover:underline">click to upload</span>
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* Feedback Section */}
      <div className="rounded-lg bg-slate-50 p-4">
        <p className="text-xs text-slate-500 text-center mb-2">Help refine our product</p>
        <p className="text-sm text-slate-700 dark:text-neutral-300 text-center mb-3">How satisfied are you with the output?</p>
        <div className="flex justify-center gap-4">
          <button className="p-2 rounded-full hover:bg-slate-200 transition">😊</button>
          <button className="p-2 rounded-full hover:bg-slate-200 transition">😐</button>
          <button className="p-2 rounded-full hover:bg-slate-200 transition">😞</button>
        </div>
      </div>
    </div>
  );
}


// Theme Preview Component
function ThemePreview({
  colors,
  headingFont,
  bodyFont,
  cardStyle,
  themeName,
}: {
  colors: CustomThemeData["customColors"];
  headingFont: typeof FONT_OPTIONS[0];
  bodyFont: typeof FONT_OPTIONS[0];
  cardStyle: typeof CARD_STYLES[0];
  themeName: string;
}) {
  const getCardClasses = () => {
    switch (cardStyle.id) {
      case "standard": return "rounded-lg shadow-md";
      case "flat": return "rounded-none border border-slate-200";
      case "outline": return "rounded-none border-2";
      case "sharp": return "rounded-none shadow-sm";
      case "blocky": return "rounded-none shadow-[4px_4px_0px_0px]";
      case "glass": return "rounded-xl backdrop-blur-sm bg-opacity-80";
      case "rounded": return "rounded-2xl shadow-lg";
      case "soft-cloud": return "rounded-xl shadow-xl";
      case "capsule": return "rounded-3xl";
      default: return "rounded-lg shadow-md";
    }
  };

  return (
    <div className="h-full">
      <div
        className="h-full rounded-xl overflow-hidden shadow-lg"
        style={{ backgroundColor: colors.background }}
      >
        {/* Preview Header */}
        <div className="p-6" style={{ backgroundColor: colors.backgroundAlt }}>
          <p className="text-xs mb-1" style={{ color: colors.accent }}>Hello 👋</p>
          <h1
            className="text-2xl font-bold mb-4"
            style={{ color: colors.heading, fontFamily: headingFont.family }}
          >
            This is a theme preview
          </h1>
          <p className="text-sm mb-4" style={{ color: colors.text, fontFamily: bodyFont.family }}>
            Here&apos;s an example of body text. You can change its font and the color.{" "}
            <span className="underline" style={{ color: colors.accent }}>
              Your accent color will be used for links
            </span>
            . It will also be used for layouts and buttons.
          </p>

          {/* Smart Layout Cards */}
          <div className={`grid grid-cols-2 gap-3 mb-4`}>
            <div
              className={`p-3 ${getCardClasses()}`}
              style={{
                backgroundColor: colors.background,
                borderColor: colors.primary,
                boxShadow: cardStyle.id === "blocky" ? `4px 4px 0px 0px ${colors.primary}` : undefined,
              }}
            >
              <p className="text-xs" style={{ color: colors.text, fontFamily: bodyFont.family }}>
                This is a smart layout. It acts as a text box.
              </p>
            </div>
            <div
              className={`p-3 ${getCardClasses()}`}
              style={{
                backgroundColor: colors.background,
                borderColor: colors.primary,
                boxShadow: cardStyle.id === "blocky" ? `4px 4px 0px 0px ${colors.primary}` : undefined,
              }}
            >
              <p className="text-xs" style={{ color: colors.text, fontFamily: bodyFont.family }}>
                You can get these by typing /smart
              </p>
            </div>
          </div>

          {/* Buttons */}
          <p className="text-xs mb-2" style={{ color: colors.text }}>Here are your buttons:</p>
          <div className="flex gap-2 mb-4">
            <button
              className={`px-4 py-2 text-sm font-medium text-white ${getCardClasses()}`}
              style={{ backgroundColor: colors.primary }}
            >
              Primary button
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium border-2 ${getCardClasses()}`}
              style={{ borderColor: colors.primary, color: colors.primary, backgroundColor: "transparent" }}
            >
              Secondary button
            </button>
          </div>

          <p className="text-sm mb-2" style={{ color: colors.text, fontFamily: bodyFont.family }}>
            To the right, this is what we call an accent image. We have a set of them with our default themes, but you can change them! ✅
          </p>
          <p className="text-sm" style={{ color: colors.text, fontFamily: bodyFont.family }}>
            Let&apos;s get started customizing your theme!
          </p>
        </div>

        {/* Accent Image Area */}
        <div
          className="h-32"
          style={{ backgroundColor: colors.primary }}
        />

        {/* Smart Layouts Section */}
        <div className="p-6" style={{ backgroundColor: colors.background }}>
          <h2
            className="text-xl font-bold mb-4"
            style={{ color: colors.heading, fontFamily: headingFont.family }}
          >
            Smart layouts
          </h2>

          {/* Timeline */}
          <div className="mb-6">
            <p className="text-sm font-semibold mb-3" style={{ color: colors.heading }}>Timeline</p>
            <div className="flex items-start gap-4">
              {[1, 2, 3].map((num) => (
                <div key={num} className="flex-1 text-center">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2 text-sm font-bold"
                    style={{ backgroundColor: colors.backgroundAlt, color: colors.text }}
                  >
                    {num}
                  </div>
                  <p className="text-xs font-semibold mb-1" style={{ color: colors.heading }}>
                    {num === 1 ? "First title" : num === 2 ? "Second title" : "Third title"}
                  </p>
                  <p className="text-[10px]" style={{ color: colors.text }}>
                    {num === 1
                      ? "This is the first point of a timeline"
                      : num === 2
                      ? "You can easily add and remove points and we'll auto-resize your content"
                      : "This is why we call them 'smart layouts'"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Pyramid */}
          <div>
            <p className="text-sm font-semibold mb-3" style={{ color: colors.heading }}>Pyramid</p>
            <div className="flex items-center gap-4">
              <div
                className="w-0 h-0 border-l-[30px] border-r-[30px] border-b-[50px] border-l-transparent border-r-transparent"
                style={{ borderBottomColor: colors.accent }}
              />
              <div>
                <p className="text-xs font-semibold" style={{ color: colors.heading }}>First title</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
