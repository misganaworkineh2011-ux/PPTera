"use client";

import { useState, useCallback, useEffect } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  Palette,
  Type,
  Square,
  Tag,
  Image as ImageIcon,
  Sparkles,
  Loader2,
  Link as LinkIcon,
} from "lucide-react";
import { useLanguage } from "~/contexts/LanguageContext";
import { dashboardTranslations } from "~/lib/dashboard-translations";

// Google Fonts URL for preview
const GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@400;500;700&family=Poppins:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&family=Lato:wght@400;700&family=Open+Sans:wght@400;600;700&family=Playfair+Display:wght@400;500;600;700&family=Merriweather:wght@400;700&family=Source+Code+Pro:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap";

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
  // Step 4: Background Image
  backgroundImageUrl: string | null;
  // Step 5: Theme Name & Logo
  themeName: string;
  logoUrl: string | null;
}

interface CustomThemeCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (theme: CustomThemeData) => Promise<void>;
  subscriptionPlan?: string | null;
}

const STEPS = [
  { id: 1, name: "Colors", icon: Palette },
  { id: 2, name: "Fonts", icon: Type },
  { id: 3, name: "Shape", icon: Square },
  { id: 4, name: "Background", icon: ImageIcon },
  { id: 5, name: "Name", icon: Tag },
];

// Curated color palettes with categories
const COLOR_CATEGORIES = [
  "All",
  "Light",
  "Dark",
  "Red",
  "Orange",
  "Yellow",
  "Green",
  "Blue",
  "Purple",
  "Pink",
  "Neutral",
  "Gray",
  "Professional",
  "Colorful",
  "Futuristic",
  "Modern",
];

const CURATED_PALETTES = [
  {
    id: "clean-white",
    name: "Clean White",
    category: ["Light", "Professional", "Modern"],
    colors: {
      background: "#ffffff",
      backgroundAlt: "#f8fafc",
      text: "#334155",
      heading: "#0f172a",
      primary: "#3b82f6",
      accent: "#06b6d4",
    },
  },
  {
    id: "soft-cream",
    name: "Soft Cream",
    category: ["Light", "Neutral"],
    colors: {
      background: "#fefce8",
      backgroundAlt: "#fef9c3",
      text: "#713f12",
      heading: "#422006",
      primary: "#ca8a04",
      accent: "#eab308",
    },
  },
  {
    id: "elegant-noir",
    name: "Elegant Noir",
    category: ["Dark", "Professional"],
    colors: {
      background: "#0a0a0b",
      backgroundAlt: "#1a1a1d",
      text: "#e4e4e7",
      heading: "#fafafa",
      primary: "#f59e0b",
      accent: "#6366f1",
    },
  },
  {
    id: "midnight-blue",
    name: "Midnight Blue",
    category: ["Dark", "Blue", "Professional"],
    colors: {
      background: "#0f172a",
      backgroundAlt: "#1e293b",
      text: "#cbd5e1",
      heading: "#f1f5f9",
      primary: "#3b82f6",
      accent: "#06b6d4",
    },
  },
  {
    id: "forest-green",
    name: "Forest Green",
    category: ["Dark", "Green"],
    colors: {
      background: "#052e16",
      backgroundAlt: "#14532d",
      text: "#bbf7d0",
      heading: "#dcfce7",
      primary: "#22c55e",
      accent: "#4ade80",
    },
  },
  {
    id: "ocean-depths",
    name: "Ocean Depths",
    category: ["Dark", "Blue", "Colorful"],
    colors: {
      background: "#0c4a6e",
      backgroundAlt: "#075985",
      text: "#bae6fd",
      heading: "#e0f2fe",
      primary: "#0ea5e9",
      accent: "#38bdf8",
    },
  },
  {
    id: "sunset-warm",
    name: "Sunset Warm",
    category: ["Light", "Orange", "Colorful"],
    colors: {
      background: "#fff7ed",
      backgroundAlt: "#ffedd5",
      text: "#9a3412",
      heading: "#7c2d12",
      primary: "#f97316",
      accent: "#fb923c",
    },
  },
  {
    id: "rose-garden",
    name: "Rose Garden",
    category: ["Light", "Pink", "Colorful"],
    colors: {
      background: "#fff1f2",
      backgroundAlt: "#ffe4e6",
      text: "#9f1239",
      heading: "#881337",
      primary: "#f43f5e",
      accent: "#fb7185",
    },
  },
  {
    id: "purple-haze",
    name: "Purple Haze",
    category: ["Dark", "Purple", "Futuristic"],
    colors: {
      background: "#2e1065",
      backgroundAlt: "#4c1d95",
      text: "#e9d5ff",
      heading: "#f3e8ff",
      primary: "#a855f7",
      accent: "#c084fc",
    },
  },
  {
    id: "cyber-neon",
    name: "Cyber Neon",
    category: ["Dark", "Futuristic", "Colorful"],
    colors: {
      background: "#020617",
      backgroundAlt: "#0f172a",
      text: "#22d3ee",
      heading: "#67e8f9",
      primary: "#06b6d4",
      accent: "#f0abfc",
    },
  },
  {
    id: "corporate-gray",
    name: "Corporate Gray",
    category: ["Light", "Gray", "Professional"],
    colors: {
      background: "#f8fafc",
      backgroundAlt: "#f1f5f9",
      text: "#475569",
      heading: "#1e293b",
      primary: "#64748b",
      accent: "#94a3b8",
    },
  },
  {
    id: "warm-earth",
    name: "Warm Earth",
    category: ["Light", "Orange", "Neutral"],
    colors: {
      background: "#faf5f0",
      backgroundAlt: "#f5ebe0",
      text: "#78350f",
      heading: "#451a03",
      primary: "#b45309",
      accent: "#d97706",
    },
  },
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
  { id: "outline-rounded", name: "Outline Rounded", description: "Bold border with rounded corners", preview: "rounded-2xl border-2" },
  { id: "sharp", name: "Sharp", description: "Flat design with sharp edges", preview: "rounded-none shadow-sm" },
  { id: "blocky", name: "Blocky", description: "Square cards with a 3D effect", preview: "rounded-none shadow-[4px_4px_0px_0px]" },
  { id: "blocky-rounded", name: "Blocky Rounded", description: "3D effect with rounded corners", preview: "rounded-2xl shadow-[4px_4px_0px_0px]" },
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
  backgroundImageUrl: null,
  themeName: "",
  logoUrl: null,
};

export default function CustomThemeCreator({ isOpen, onClose, onSave, subscriptionPlan }: CustomThemeCreatorProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [themeData, setThemeData] = useState<CustomThemeData>(initialThemeData);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isSaving, setIsSaving] = useState(false);
  const { language } = useLanguage();
  const t = dashboardTranslations[language] || dashboardTranslations.en;

  const filteredPalettes = CURATED_PALETTES.filter(
    (p) => selectedCategory === "All" || p.category.includes(selectedCategory)
  );

  const getCurrentColors = useCallback(() => {
    if (themeData.colorMode === "custom") {
      return themeData.customColors;
    }
    const palette = CURATED_PALETTES.find((p) => p.id === themeData.selectedPalette);
    return palette?.colors || themeData.customColors;
  }, [themeData]);

  const getSelectedFont = (fontId: string) => {
    const font = FONT_OPTIONS.find((f) => f.id === fontId);
    return font ?? FONT_OPTIONS[0]!;
  };

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
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
  const cardStyle = CARD_STYLES.find((s) => s.id === themeData.cardStyle) ?? CARD_STYLES[0]!;

  const stepNames = [
    t.colors || "Colors",
    t.fontsLabel || "Fonts",
    "Shape",
    "Background",
    t.themeNameStep || "Name",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div
        className="flex h-[95vh] max-h-[750px] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-black sm:h-[85vh] sm:rounded-2xl md:flex-row"
      >
        {/* Left Panel - Form */}
        <div className="flex max-h-[60vh] w-full flex-col border-b border-slate-200 dark:border-neutral-800 md:max-h-none md:w-1/2 md:border-b-0 md:border-r">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-neutral-800 sm:px-6 sm:py-4">
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-slate-600 dark:text-neutral-400 dark:hover:text-slate-300"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-2 text-[#06b6d4]">
              {(() => {
                const step = STEPS[currentStep - 1];
                if (!step) return null;
                const CurrentIcon = step.icon;
                return CurrentIcon ? (
                  <CurrentIcon size={16} className="sm:h-[18px] sm:w-[18px]" />
                ) : null;
              })()}
              <span className="text-sm font-semibold sm:text-base">{stepNames[currentStep - 1]}</span>
            </div>
            <div className="w-5" />
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-1 border-b border-slate-100 px-4 py-3 dark:border-neutral-800 sm:gap-2 sm:px-6 sm:py-4">
            {STEPS.map((step, idx) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-all sm:h-8 sm:w-8 sm:text-sm ${
                    currentStep === step.id
                      ? "bg-[#06b6d4] text-white"
                      : currentStep > step.id
                        ? "bg-green-500 text-white"
                        : "bg-slate-200 text-slate-500 dark:bg-neutral-800 dark:text-neutral-400"
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check size={12} className="sm:h-[14px] sm:w-[14px]" />
                  ) : (
                    step.id
                  )}
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`mx-1 h-0.5 w-4 sm:mx-2 sm:w-6 ${
                      currentStep > step.id ? "bg-green-500" : "bg-slate-200 dark:bg-neutral-800"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {currentStep === 1 && (
              <Step1Colors
                themeData={themeData}
                setThemeData={setThemeData}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                filteredPalettes={filteredPalettes}
              />
            )}
            {currentStep === 2 && <Step2Fonts themeData={themeData} setThemeData={setThemeData} />}
            {currentStep === 3 && <Step3Design themeData={themeData} setThemeData={setThemeData} />}
            {currentStep === 4 && <Step4Background themeData={themeData} setThemeData={setThemeData} subscriptionPlan={subscriptionPlan} />}
            {currentStep === 5 && <Step5Name themeData={themeData} setThemeData={setThemeData} />}
          </div>

          {/* Footer Navigation */}
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 dark:border-neutral-800 sm:px-6 sm:py-4">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-neutral-400 dark:hover:bg-neutral-800 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
            >
              <ChevronLeft size={14} className="sm:h-4 sm:w-4" /> {t.back || "Back"}
            </button>
            {currentStep < 5 ? (
              <button
                onClick={handleNext}
                disabled={currentStep === 1 && !themeData.selectedPalette && themeData.colorMode === "curated"}
                className="flex items-center gap-1 rounded-lg bg-[#06b6d4] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#0891b2] disabled:cursor-not-allowed disabled:opacity-50 sm:gap-2 sm:px-6 sm:py-2 sm:text-sm"
              >
                {t.next || "Next"} <ChevronRight size={14} className="sm:h-4 sm:w-4" />
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={isSaving || !themeData.themeName.trim()}
                className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] px-4 py-1.5 text-xs font-bold text-white hover:from-[#172554] hover:to-[#0891b2] disabled:opacity-50 sm:gap-2 sm:px-6 sm:py-2 sm:text-sm"
              >
                {isSaving ? t.creating || "Creating..." : t.createTheme || "Create Theme"}
              </button>
            )}
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="w-full flex-1 overflow-y-auto bg-slate-100 p-3 dark:bg-neutral-900 sm:p-6 md:w-1/2 md:flex-none">
          <ThemePreview
            colors={colors}
            headingFont={headingFont}
            bodyFont={bodyFont}
            cardStyle={cardStyle}
            themeName={themeData.themeName}
            backgroundImageUrl={themeData.backgroundImageUrl}
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
        <p className="mb-4 text-sm text-slate-500">Choose your theme and background colors</p>

        {/* Mode Toggle */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setThemeData((prev) => ({ ...prev, colorMode: "curated" }))}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
              themeData.colorMode === "curated"
                ? "bg-[#06b6d4] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:text-neutral-400"
            }`}
          >
            ✓ Curated
          </button>
          <button
            onClick={() => setThemeData((prev) => ({ ...prev, colorMode: "custom" }))}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
              themeData.colorMode === "custom"
                ? "bg-[#06b6d4] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:text-neutral-400"
            }`}
          >
            ✎ Customize
          </button>
        </div>
      </div>

      {themeData.colorMode === "curated" ? (
        <>
          {/* Category Filter */}
          <div className="mb-3 flex flex-wrap gap-1.5 sm:mb-4 sm:gap-2">
            {COLOR_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition sm:px-3 sm:py-1 sm:text-xs ${
                  selectedCategory === cat
                    ? "bg-[#1e3a8a] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:text-neutral-400"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Palette Grid */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
            {filteredPalettes.map((palette) => (
              <button
                key={palette.id}
                onClick={() => setThemeData((prev) => ({ ...prev, selectedPalette: palette.id }))}
                className={`group relative overflow-hidden rounded-lg border-2 transition-all ${
                  themeData.selectedPalette === palette.id
                    ? "border-[#06b6d4] ring-2 ring-[#06b6d4]/20"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex h-12 sm:h-16">
                  <div className="flex-1" style={{ backgroundColor: palette.colors.background }} />
                  <div className="flex-1" style={{ backgroundColor: palette.colors.primary }} />
                  <div className="flex-1" style={{ backgroundColor: palette.colors.accent }} />
                </div>
                <div className="bg-white p-1.5 sm:p-2">
                  <p className="truncate text-[10px] font-medium text-slate-700 dark:text-neutral-300 sm:text-xs">
                    {palette.name}
                  </p>
                </div>
                {themeData.selectedPalette === palette.id && (
                  <div className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#06b6d4] text-white sm:h-5 sm:w-5">
                    <Check size={10} className="sm:h-3 sm:w-3" />
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
              <label className="text-sm font-medium capitalize text-slate-700 dark:text-neutral-300">
                {key.replace(/([A-Z])/g, " $1").trim()}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={value}
                  onChange={(e) =>
                    setThemeData((prev) => ({
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
                    setThemeData((prev) => ({
                      ...prev,
                      customColors: { ...prev.customColors, [key]: e.target.value },
                    }))
                  }
                  className="w-24 rounded border border-slate-200 px-2 py-1 font-mono text-sm"
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
    <div className="space-y-4 sm:space-y-6">
      <p className="text-xs text-slate-500 sm:text-sm">Choose fonts for your theme</p>

      {/* Heading Font */}
      <div>
        <h3 className="mb-2 text-xs font-semibold text-slate-700 dark:text-neutral-300 sm:mb-3 sm:text-sm">
          Heading Font
        </h3>
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
          {FONT_OPTIONS.map((font) => (
            <button
              key={font.id}
              onClick={() => setThemeData((prev) => ({ ...prev, headingFont: font.id }))}
              className={`relative rounded-lg border-2 p-2 text-left transition-all sm:p-3 ${
                themeData.headingFont === font.id
                  ? "border-[#06b6d4] bg-[#e0f2fe]"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <p
                className="truncate text-xs font-bold text-slate-800 dark:text-white sm:text-base"
                style={{ fontFamily: font.family }}
              >
                {font.name}
              </p>
              <p className="truncate text-[10px] text-slate-500 sm:text-xs">{font.style}</p>
              {themeData.headingFont === font.id && (
                <div className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#06b6d4] text-white sm:right-2 sm:top-2 sm:h-5 sm:w-5">
                  <Check size={10} className="sm:h-3 sm:w-3" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Body Font */}
      <div>
        <h3 className="mb-2 text-xs font-semibold text-slate-700 dark:text-neutral-300 sm:mb-3 sm:text-sm">
          Body Font
        </h3>
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
          {FONT_OPTIONS.map((font) => (
            <button
              key={font.id}
              onClick={() => setThemeData((prev) => ({ ...prev, bodyFont: font.id }))}
              className={`relative rounded-lg border-2 p-2 text-left transition-all sm:p-3 ${
                themeData.bodyFont === font.id
                  ? "border-[#06b6d4] bg-[#e0f2fe]"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <p
                className="truncate text-xs text-slate-800 dark:text-white sm:text-base"
                style={{ fontFamily: font.family }}
              >
                {font.name}
              </p>
              <p className="truncate text-[10px] text-slate-500 sm:text-xs">{font.style}</p>
              {themeData.bodyFont === font.id && (
                <div className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#06b6d4] text-white sm:right-2 sm:top-2 sm:h-5 sm:w-5">
                  <Check size={10} className="sm:h-3 sm:w-3" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Slide shape options - determines the shape of content cards on slides
const SLIDE_SHAPES = [
  { id: "standard", name: "Standard", description: "Subtle rounded corners with soft shadow" },
  { id: "sharp", name: "Sharp", description: "Clean edges with minimal shadow" },
  { id: "rounded", name: "Rounded", description: "Smooth, friendly corners" },
  { id: "soft-cloud", name: "Soft Cloud", description: "Extra soft with deep shadow" },
  { id: "flat", name: "Flat", description: "No shadow, clean borders" },
  { id: "outline", name: "Outline", description: "Bold border, sharp edges" },
  { id: "outline-rounded", name: "Outline Rounded", description: "Bold border, rounded corners" },
  { id: "blocky", name: "Blocky", description: "Retro 3D block effect" },
  { id: "blocky-rounded", name: "Blocky Rounded", description: "3D block with rounded corners" },
  { id: "glass", name: "Glass", description: "Frosted glass effect" },
  { id: "capsule", name: "Capsule", description: "Pill-shaped, playful" },
];

// Step 3: Slide Shape
function Step3Design({
  themeData,
  setThemeData,
}: {
  themeData: CustomThemeData;
  setThemeData: React.Dispatch<React.SetStateAction<CustomThemeData>>;
}) {
  // Get current colors for preview
  const colors = themeData.colorMode === "custom" 
    ? themeData.customColors 
    : (CURATED_PALETTES.find(p => p.id === themeData.selectedPalette)?.colors || themeData.customColors);

  return (
    <div className="space-y-4 sm:space-y-6">
      <p className="text-xs text-slate-500 sm:text-sm">Choose the shape style for your slide content</p>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {SLIDE_SHAPES.map((shape) => (
          <button
            key={shape.id}
            onClick={() => setThemeData((prev) => ({ ...prev, cardStyle: shape.id }))}
            className={`relative rounded-lg border-2 p-2 transition-all sm:p-3 ${
              themeData.cardStyle === shape.id
                ? "border-[#06b6d4] bg-[#e0f2fe]"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            {/* Shape Preview */}
            <div className="mb-2 flex justify-center">
              <div 
                className="relative h-12 w-16 sm:h-14 sm:w-20 flex items-center justify-center"
                style={{ backgroundColor: colors.background }}
              >
                {/* The shape preview card */}
                <div
                  className="w-[85%] h-[75%] flex flex-col justify-center px-1.5"
                  style={{
                    backgroundColor: colors.backgroundAlt,
                    borderRadius: shape.id === "standard" ? "0.375rem"
                      : shape.id === "sharp" || shape.id === "flat" || shape.id === "outline" || shape.id === "blocky" ? "0"
                      : shape.id === "rounded" || shape.id === "outline-rounded" || shape.id === "blocky-rounded" ? "0.5rem"
                      : shape.id === "soft-cloud" || shape.id === "glass" ? "0.375rem"
                      : shape.id === "capsule" ? "0.75rem"
                      : "0.375rem",
                    boxShadow: shape.id === "standard" ? "0 4px 6px -1px rgba(0,0,0,0.1)"
                      : shape.id === "sharp" ? "0 1px 2px rgba(0,0,0,0.05)"
                      : shape.id === "rounded" || shape.id === "soft-cloud" ? "0 10px 15px -3px rgba(0,0,0,0.1)"
                      : shape.id === "blocky" ? `3px 3px 0px 0px ${colors.primary}`
                      : shape.id === "blocky-rounded" ? `3px 3px 0px 0px ${colors.primary}`
                      : "none",
                    border: shape.id === "flat" ? `1px solid ${colors.primary}30`
                      : shape.id === "outline" || shape.id === "outline-rounded" ? `2px solid ${colors.primary}`
                      : shape.id === "glass" ? `1px solid ${colors.primary}20`
                      : "none",
                    backdropFilter: shape.id === "glass" ? "blur(4px)" : undefined,
                    opacity: shape.id === "glass" ? 0.9 : 1,
                  }}
                >
                  {/* Mini content */}
                  <div className="h-1 w-3/4 rounded-full mb-0.5" style={{ backgroundColor: colors.heading }} />
                  <div className="h-0.5 w-full rounded-full" style={{ backgroundColor: `${colors.text}40` }} />
                </div>
              </div>
            </div>
            <p className="text-[10px] font-bold text-slate-700 dark:text-neutral-300 sm:text-xs text-center">
              {shape.name}
            </p>
            {themeData.cardStyle === shape.id && (
              <div className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#06b6d4] text-white sm:right-1.5 sm:top-1.5">
                <Check size={10} />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// Step 4: Background Image
// AI Image Models with credits (same as other AI generation dropdowns)
const AI_IMAGE_MODELS = [
  // Basic tier (Free)
  { id: "gpt-image-1-mini", name: "GPT Image Mini", credits: 10, tier: "basic", provider: "OpenAI" },
  // Advanced tier (PLUS+)
  { id: "imagen-4-fast", name: "Imagen 4 Fast", credits: 20, tier: "advanced", provider: "Google" },
  { id: "gemini-2.0-flash-preview-image-generation", name: "Gemini 2.5 Flash", credits: 40, tier: "advanced", provider: "Google" },
  // Premium tier (PRO+)
  { id: "imagen-4", name: "Imagen 4 Standard", credits: 40, tier: "premium", provider: "Google" },
  { id: "dall-e-3", name: "DALL-E 3", credits: 40, tier: "premium", provider: "OpenAI" },
  // Ultra tier (ULTRA only)
  { id: "imagen-4-ultra", name: "Imagen 4 Ultra", credits: 60, tier: "ultra", provider: "Google" },
  { id: "gpt-image-1.5", name: "GPT Image 1.5", credits: 130, tier: "ultra", provider: "OpenAI" },
  { id: "gpt-image-1", name: "GPT Image 1", credits: 150, tier: "ultra", provider: "OpenAI" },
];

function Step4Background({
  themeData,
  setThemeData,
  subscriptionPlan,
}: {
  themeData: CustomThemeData;
  setThemeData: React.Dispatch<React.SetStateAction<CustomThemeData>>;
  subscriptionPlan?: string | null;
}) {
  const [imageUrl, setImageUrl] = useState(themeData.backgroundImageUrl || "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("imagen-4-fast");
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  // Determine user's plan tier for model locking
  const userPlan = subscriptionPlan?.toLowerCase() || "free";
  const hasPlus = userPlan === "plus" || userPlan === "pro" || userPlan === "ultra";
  const hasPro = userPlan === "pro" || userPlan === "ultra";
  const hasUltra = userPlan === "ultra";

  // Check if a model is locked based on user's plan
  const isModelLocked = (tier: string) => {
    switch (tier) {
      case "basic":
        return false; // Available to all
      case "advanced":
        return !hasPlus; // Requires PLUS+
      case "premium":
        return !hasPro; // Requires PRO+
      case "ultra":
        return !hasUltra; // Requires ULTRA only
      default:
        return false;
    }
  };

  // Get lock label for tier
  const getLockLabel = (tier: string) => {
    switch (tier) {
      case "advanced":
        return "PLUS+";
      case "premium":
        return "PRO+";
      case "ultra":
        return "ULTRA";
      default:
        return "";
    }
  };

  const selectedModelInfo = AI_IMAGE_MODELS.find((m) => m.id === selectedModel) || AI_IMAGE_MODELS[1];

  const handleUrlSubmit = () => {
    if (imageUrl.trim()) {
      setThemeData((prev) => ({ ...prev, backgroundImageUrl: imageUrl.trim() }));
    }
  };

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Abstract background pattern: ${aiPrompt}. Seamless, subtle, professional presentation background.`,
          model: selectedModel,
          size: "1792x1024",
          style: "natural",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate image");
      }

      const data = await response.json();
      // API returns data.image.url, not data.imageUrl
      const generatedUrl = data.image?.url || data.imageUrl;
      if (generatedUrl) {
        setImageUrl(generatedUrl);
        setThemeData((prev) => ({ ...prev, backgroundImageUrl: generatedUrl }));
      }
    } catch (error) {
      console.error("Error generating background:", error);
      alert(error instanceof Error ? error.message : "Failed to generate background image");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClear = () => {
    setImageUrl("");
    setThemeData((prev) => ({ ...prev, backgroundImageUrl: null }));
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case "basic":
        return "bg-slate-100 text-slate-600";
      case "advanced":
        return "bg-blue-100 text-blue-700";
      case "premium":
        return "bg-purple-100 text-purple-700";
      case "ultra":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">Add a background image for your theme (optional)</p>

      {/* Current Background Preview */}
      {themeData.backgroundImageUrl && (
        <div className="relative overflow-hidden rounded-lg border border-slate-200">
          <img
            src={themeData.backgroundImageUrl}
            alt="Background preview"
            className="h-32 w-full object-cover"
          />
          <button
            onClick={handleClear}
            className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white hover:bg-red-600"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* URL Input */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-neutral-300">
          <LinkIcon size={14} className="mr-1.5 inline" />
          Image URL
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#06b6d4] focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20"
          />
          <button
            onClick={handleUrlSubmit}
            disabled={!imageUrl.trim()}
            className="rounded-lg bg-[#06b6d4] px-4 py-2 text-sm font-medium text-white hover:bg-[#0891b2] disabled:opacity-50"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs text-slate-400">or</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      {/* AI Generation */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-neutral-300">
          <Sparkles size={14} className="mr-1.5 inline text-[#06b6d4]" />
          Generate with AI
        </label>
        <p className="mb-3 text-xs text-slate-500">
          Describe the background you want and we&apos;ll generate it for you
        </p>

        {/* Model Selector */}
        <div className="relative mb-3">
          <button
            type="button"
            onClick={() => setShowModelDropdown(!showModelDropdown)}
            className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left text-sm transition hover:border-[#06b6d4] focus:border-[#06b6d4] focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-700">{selectedModelInfo?.name}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${getTierBadgeColor(selectedModelInfo?.tier || "basic")}`}>
                {selectedModelInfo?.tier?.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#06b6d4]/10 px-2 py-0.5 text-xs font-semibold text-[#06b6d4]">
                {selectedModelInfo?.credits} credits
              </span>
              <ChevronRight
                size={16}
                className={`text-slate-400 transition-transform ${showModelDropdown ? "rotate-90" : ""}`}
              />
            </div>
          </button>

          {/* Dropdown */}
          {showModelDropdown && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
              {AI_IMAGE_MODELS.map((model) => {
                const locked = isModelLocked(model.tier);
                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => {
                      if (!locked) {
                        setSelectedModel(model.id);
                        setShowModelDropdown(false);
                      }
                    }}
                    disabled={locked}
                    className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition ${
                      locked 
                        ? "cursor-not-allowed opacity-60" 
                        : "hover:bg-slate-50"
                    } ${selectedModel === model.id ? "bg-[#06b6d4]/5" : ""}`}
                  >
                    <div className="flex items-center gap-2">
                      {selectedModel === model.id && !locked && (
                        <Check size={14} className="text-[#06b6d4]" />
                      )}
                      {locked && (
                        <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      )}
                      <span className={`font-medium ${selectedModel === model.id && !locked ? "text-[#06b6d4]" : locked ? "text-slate-400" : "text-slate-700"}`}>
                        {model.name}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${getTierBadgeColor(model.tier)}`}>
                        {model.tier.toUpperCase()}
                      </span>
                      {locked && (
                        <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">
                          {getLockLabel(model.tier)}
                        </span>
                      )}
                    </div>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                      {model.credits} credits
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Prompt Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="e.g., soft gradient blue waves, geometric patterns..."
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#06b6d4] focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20"
          />
          <button
            onClick={handleGenerateAI}
            disabled={!aiPrompt.trim() || isGenerating}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] px-4 py-2 text-sm font-medium text-white hover:from-[#172554] hover:to-[#0891b2] disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={14} />
                Generate
              </>
            )}
          </button>
        </div>
      </div>

      {/* Skip note */}
      <p className="text-center text-xs text-slate-400">
        You can skip this step if you don&apos;t want a background image
      </p>
    </div>
  );
}

// Step 5: Theme Name
function Step5Name({
  themeData,
  setThemeData,
}: {
  themeData: CustomThemeData;
  setThemeData: React.Dispatch<React.SetStateAction<CustomThemeData>>;
}) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">Last step! What should we call your theme?</p>

      {/* Theme Name Input */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-neutral-300">
          Theme name
        </label>
        <input
          type="text"
          value={themeData.themeName}
          onChange={(e) => setThemeData((prev) => ({ ...prev, themeName: e.target.value }))}
          placeholder="My Custom Theme"
          className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm focus:border-[#06b6d4] focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20"
        />
      </div>

      {/* Summary of theme settings */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-700">Theme Summary</h3>
        <div className="space-y-2 text-xs text-slate-600">
          <div className="flex justify-between">
            <span>Colors:</span>
            <span className="font-medium">{themeData.colorMode === "curated" ? themeData.selectedPalette || "Not selected" : "Custom"}</span>
          </div>
          <div className="flex justify-between">
            <span>Heading Font:</span>
            <span className="font-medium">{themeData.headingFont}</span>
          </div>
          <div className="flex justify-between">
            <span>Body Font:</span>
            <span className="font-medium">{themeData.bodyFont}</span>
          </div>
          <div className="flex justify-between">
            <span>Card Style:</span>
            <span className="font-medium capitalize">{themeData.cardStyle}</span>
          </div>
          <div className="flex justify-between">
            <span>Background Image:</span>
            <span className="font-medium">{themeData.backgroundImageUrl ? "Yes" : "None"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Theme Preview Component - Shows slide with the selected shape applied to the slide itself
function ThemePreview({
  colors,
  headingFont,
  bodyFont,
  cardStyle,
  themeName,
  backgroundImageUrl,
}: {
  colors: CustomThemeData["customColors"];
  headingFont: (typeof FONT_OPTIONS)[0];
  bodyFont: (typeof FONT_OPTIONS)[0];
  cardStyle: (typeof CARD_STYLES)[0];
  themeName: string;
  backgroundImageUrl: string | null;
}) {
  // Get slide shape styles - applied to the slide container itself
  const getSlideShapeStyles = (): React.CSSProperties => {
    switch (cardStyle.id) {
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

  return (
    <div className="h-full flex flex-col">
      {/* Info badges */}
      <div className="mb-3 flex flex-wrap gap-2 text-[10px]">
        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-slate-600">
          Heading: <span style={{ fontFamily: headingFont.family }}>{headingFont.name}</span>
        </span>
        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-slate-600">
          Body: <span style={{ fontFamily: bodyFont.family }}>{bodyFont.name}</span>
        </span>
        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-slate-600">
          Shape: {cardStyle.name}
        </span>
      </div>

      {/* Slide Preview - shape applied to the slide container */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div
          className="relative w-full overflow-hidden"
          style={{
            aspectRatio: "16/9",
            backgroundColor: colors.background,
            backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
            ...slideShapeStyles,
          }}
        >
          {/* Overlay for background image */}
          {backgroundImageUrl && (
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: `${colors.background}70`,
                borderRadius: slideShapeStyles.borderRadius,
              }}
            />
          )}

          {/* Minimal slide content - just title and subtitle */}
          <div className="relative h-full flex flex-col justify-center items-center p-6 text-center">
            <h1
              className="text-[clamp(16px,4vw,28px)] font-bold leading-tight mb-2"
              style={{ color: colors.heading, fontFamily: headingFont.family }}
            >
              {themeName || "Slide Title"}
            </h1>
            <p
              className="text-[clamp(10px,2vw,14px)] opacity-80 max-w-[80%]"
              style={{ color: colors.text, fontFamily: bodyFont.family }}
            >
              Your presentation subtitle goes here
            </p>

            {/* Color accent dots */}
            <div className="absolute bottom-4 flex gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.primary }} />
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.accent }} />
              <div className="w-2 h-2 rounded-full opacity-50" style={{ backgroundColor: colors.text }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
