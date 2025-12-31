"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, GripVertical, Trash2, Edit3, Check, X, Upload } from "lucide-react";
import { toast } from "sonner";
import { useOutlineStream, type Slide, type OutlineMetadata } from "~/lib/dashboard/hooks/useOutlineStream";
import { themes, getThemeById, type Theme } from "~/lib/themes";
import { isCustomThemeId, getCustomThemeDbId, convertCustomThemeToTheme } from "~/lib/custom-theme-utils";
import ThemeSelector from "~/components/ThemeSelector";
import RecentOutlines from "~/components/createpresentation/RecentOutlines";
import PricingModal from "~/components/dashboard/PricingModal";

interface ExistingOutline {
  id: string;
  slides: Slide[];
  metadata: OutlineMetadata;
  status: string;
}

interface RecentOutline {
  id: string;
  title: string;
  createdAt: string;
}

interface CreatePresentationClientProps {
  maxSlides: number;
  subscriptionPlan?: string | null;
  userCredits?: number;
  mode: string;
  existingOutline?: ExistingOutline;
  recentOutlines?: RecentOutline[];
}

// Credit cost per presentation generation
const CREDIT_COST_PER_GENERATION = 10;

// Define all slide options by plan
const getAllSlideOptions = (userPlan: string | null | undefined) => {
  const userPlanLower = userPlan?.toLowerCase() || "free";

  const options: Array<{ value: number; label: string; plan: string; isGroupHeader?: boolean; disabled?: boolean }> = [];

  const hasFree = true;
  const hasPlus = userPlanLower === "plus" || userPlanLower === "pro" || userPlanLower === "ultra";
  const hasPro = userPlanLower === "pro" || userPlanLower === "ultra";
  const hasUltra = userPlanLower === "ultra";

  options.push({ value: -1, label: "Free Plan: 1-10 slides", plan: "Free", isGroupHeader: true, disabled: false });
  for (let i = 1; i <= 10; i++) {
    options.push({ value: i, label: `${i} ${i === 1 ? "slide" : "slides"}`, plan: "Free", disabled: false });
  }

  options.push({ value: -2, label: "Plus Plan: 15, 20 slides", plan: "Plus", isGroupHeader: true, disabled: false });
  options.push({ value: 15, label: "15 slides", plan: "Plus", disabled: !hasPlus });
  options.push({ value: 20, label: "20 slides", plan: "Plus", disabled: !hasPlus });

  options.push({ value: -3, label: "Pro Plan: 25, 30, 40, 50, 60 slides", plan: "Pro", isGroupHeader: true, disabled: false });
  options.push({ value: 25, label: "25 slides", plan: "Pro", disabled: !hasPro });
  options.push({ value: 30, label: "30 slides", plan: "Pro", disabled: !hasPro });
  options.push({ value: 40, label: "40 slides", plan: "Pro", disabled: !hasPro });
  options.push({ value: 50, label: "50 slides", plan: "Pro", disabled: !hasPro });
  options.push({ value: 60, label: "60 slides", plan: "Pro", disabled: !hasPro });

  options.push({ value: -4, label: "Ultra Plan: 70, 75 slides", plan: "Ultra", isGroupHeader: true, disabled: false });
  options.push({ value: 70, label: "70 slides", plan: "Ultra", disabled: !hasUltra });
  options.push({ value: 75, label: "75 slides", plan: "Ultra", disabled: !hasUltra });

  return options;
};

// Skeleton Card Component
function SkeletonCard({ index }: { index: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white/90 backdrop-blur-sm p-4 shadow-sm animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-200">
          <span className="text-xs font-bold text-slate-400">{index + 1}</span>
        </div>
        <div className="h-4 bg-slate-200 rounded flex-1" />
      </div>
      <div className="space-y-2 pl-10">
        <div className="h-2.5 bg-slate-100 rounded w-full" />
        <div className="h-2.5 bg-slate-100 rounded w-5/6" />
        <div className="h-2.5 bg-slate-100 rounded w-4/6" />
      </div>
    </div>
  );
}

// Slide Card Component
function SlideCard({
  slide,
  index,
  isStreaming,
  onEdit,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  isDraggedOver,
  canDelete,
}: {
  slide: Slide;
  index: number;
  isStreaming: boolean;
  onEdit?: (index: number, slide: Slide) => void;
  onDelete?: (index: number) => void;
  onDragStart?: (e: React.DragEvent, index: number) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, index: number) => void;
  isDraggedOver?: boolean;
  canDelete?: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(slide.title);
  const [editedBullets, setEditedBullets] = useState(slide.bulletPoints?.join("\n") || "");

  const handleSave = () => {
    if (onEdit) {
      onEdit(index, {
        ...slide,
        title: editedTitle,
        bulletPoints: slide.type === "content" ? editedBullets.split("\n").filter((b) => b.trim()) : undefined,
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTitle(slide.title);
    setEditedBullets(slide.bulletPoints?.join("\n") || "");
    setIsEditing(false);
  };

  const isTitle = slide.type === "title";

  return (
    <div
      draggable={!isStreaming && !isTitle && !isEditing}
      onDragStart={(e) => onDragStart && onDragStart(e, index)}
      onDragOver={(e) => onDragOver && onDragOver(e)}
      onDrop={(e) => onDrop && onDrop(e, index)}
      className={`rounded-lg border bg-white/95 backdrop-blur-sm p-4 shadow-sm transition-all hover:shadow-md ${isDraggedOver ? "border-[#06b6d4] ring-2 ring-[#06b6d4]/20 shadow-lg" : "border-slate-200 hover:border-[#06b6d4]/40"
        } ${isTitle ? "bg-gradient-to-br from-[#1e3a8a]/5 to-[#06b6d4]/5 border-[#1e3a8a]/20" : ""}`}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        {!isTitle && !isStreaming && (
          <div className="cursor-grab text-slate-300 hover:text-slate-500 mt-0.5">
            <GripVertical size={16} />
          </div>
        )}

        {/* Slide Number */}
        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${isTitle
            ? "bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] text-white shadow-sm"
            : "bg-[#1e3a8a]/10 text-[#1e3a8a] font-semibold"
            }`}
        >
          <span className="text-xs font-bold">{index + 1}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-2.5">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-[#1e3a8a] focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20 focus:border-[#06b6d4]"
              />
              {!isTitle && (
                <textarea
                  value={editedBullets}
                  onChange={(e) => setEditedBullets(e.target.value)}
                  rows={3}
                  placeholder="One bullet point per line..."
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20 focus:border-[#06b6d4] resize-none"
                />
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#06b6d4] text-white text-xs font-medium hover:bg-[#0891b2] transition-colors"
                >
                  <Check size={13} /> Save
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 transition-colors"
                >
                  <X size={13} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h3 className={`font-semibold text-[#1e3a8a] mb-1.5 leading-tight ${isTitle ? "text-base" : "text-sm"}`}>
                {slide.title}
              </h3>
              {isTitle && slide.subtitle && (
                <p className="text-sm text-slate-500 italic mt-1">{slide.subtitle}</p>
              )}
              {!isTitle && slide.bulletPoints && (
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {slide.bulletPoints.map((bullet, i) => (
                    <li key={i} className="flex gap-2 leading-relaxed">
                      <span className="text-[#06b6d4] flex-shrink-0">•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        {!isStreaming && !isEditing && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 rounded-md text-slate-400 hover:text-[#06b6d4] hover:bg-[#06b6d4]/10 transition-colors"
              title="Edit slide"
            >
              <Edit3 size={13} />
            </button>
            {canDelete && !isTitle && (
              <button
                onClick={() => onDelete && onDelete(index)}
                className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Delete slide"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CreatePresentationClient({
  maxSlides,
  subscriptionPlan,
  userCredits = 0,
  mode,
  existingOutline,
  recentOutlines = [],
}: CreatePresentationClientProps) {
  const router = useRouter();
  const { state: streamState, startStream, cancel, reset } = useOutlineStream();

  // Credit check state
  const [showCreditWarning, setShowCreditWarning] = useState(false);
  const hasEnoughCredits = userCredits >= CREDIT_COST_PER_GENERATION;
  const isFreeUser = !subscriptionPlan || subscriptionPlan === 'free';

  // View state: 'form' | 'streaming' | 'completed'
  const [view, setView] = useState<"form" | "streaming" | "completed">(
    existingOutline ? "completed" : "form"
  );

  // File upload state for docs mode
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [pastedContent, setPastedContent] = useState("");

  // Form data
  const [formData, setFormData] = useState({
    description: existingOutline?.metadata.topic || "",
    numberOfSlides: existingOutline?.metadata.totalSlides || Math.min(10, maxSlides),
    tone: existingOutline?.metadata.tone || "professional",
    language: existingOutline?.metadata.language || "english",
    theme: "corporate-professional",
    imageSource: "no-images",
    textDensity: "concise" as "minimal" | "concise" | "detailed" | "extensive",
    imageLicensing: "all-images" as "all-images" | "free-to-use" | "free-commercial",
    // Default AI image model ("Nano Banana" - Gemini 2.5 Flash Image)
    imageModel: "gemini-2.5-flash-image" as
      | "gemini-3-pro-image-preview"
      | "gemini-2.5-flash-image"
      | "imagen-4.0-generate-001"
      | "imagen-4.0-ultra-generate-001"
      | "imagen-4.0-fast-generate-001",
  });

  const [lastDescription, setLastDescription] = useState(
    (existingOutline?.metadata?.topic || "").trim()
  );

  // Slides state (for editing after completion)
  const [slides, setSlides] = useState<Slide[]>(existingOutline?.slides || []);
  const [outlineId, setOutlineId] = useState<string | null>(existingOutline?.id || null);

  // Drag state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);
  const [isCreatingPresentation, setIsCreatingPresentation] = useState(false);

  // Track recently selected themes for quick access (6 themes for 3x2 grid)
  const [quickSelectThemes, setQuickSelectThemes] = useState<string[]>([
    themes[0]?.id || "corporate-professional",
    themes[1]?.id || "elegant-dark",
    themes[2]?.id || "modern-minimal",
    themes[3]?.id || "creative-bold",
    themes[4]?.id || "nature-green",
    themes[5]?.id || "tech-blue",
  ]);

  // Cache for custom themes
  const [customThemesCache, setCustomThemesCache] = useState<Record<string, Theme>>({});

  // Helper to get theme (built-in or custom)
  const getThemeForDisplay = (themeId: string): Theme | null => {
    if (isCustomThemeId(themeId)) {
      return customThemesCache[themeId] || null;
    }
    return getThemeById(themeId);
  };

  // Load custom theme when added to quick select
  useEffect(() => {
    quickSelectThemes.forEach(themeId => {
      if (isCustomThemeId(themeId) && !customThemesCache[themeId]) {
        const dbId = getCustomThemeDbId(themeId);
        fetch(`/api/themes/custom/${dbId}`)
          .then(res => res.json())
          .then(data => {
            if (data.theme) {
              const converted = convertCustomThemeToTheme(data.theme);
              setCustomThemesCache(prev => ({ ...prev, [themeId]: converted }));
            }
          })
          .catch(err => console.error("Failed to load custom theme:", err));
      }
    });
  }, [quickSelectThemes, customThemesCache]);

  const allSlideOptions = getAllSlideOptions(subscriptionPlan);

  // Track if we've started a new generation (to override existingOutline behavior)
  const [hasStartedGeneration, setHasStartedGeneration] = useState(false);

  // Update view based on stream state
  useEffect(() => {
    // Don't override view if we have an existing outline (loaded from DB) AND haven't started a new generation
    if (existingOutline && !hasStartedGeneration && streamState.status === "idle") {
      return;
    }

    if (streamState.status === "streaming" || streamState.status === "connecting") {
      setView("streaming");
      setHasStartedGeneration(true);
    } else if (streamState.status === "completed") {
      setView("completed");
      setSlides(streamState.slides);
      setOutlineId(streamState.outlineId);
    } else if (streamState.status === "error") {
      // On error, reset to form view so user can try again
      setView("form");
      // Clear any partial slides
      setSlides([]);
    }
  }, [existingOutline, hasStartedGeneration, streamState.status, streamState.slides, streamState.outlineId]);

  // Update URL when outline ID is available
  useEffect(() => {
    // Only push outline URL on first creation from /createpresentation?mode=...
    if (!existingOutline && streamState.outlineId && streamState.status !== "error") {
      const newUrl = `/createpresentation/outline/${streamState.outlineId}?mode=${mode}`;
      window.history.replaceState({}, "", newUrl);
    }
  }, [existingOutline, streamState.outlineId, mode, streamState.status]);

  const handleGenerate = async () => {
    const trimmed = formData.description.trim();
    if (!trimmed) return;

    // Credit check for AI generation (not scratch mode)
    if (mode !== "scratch") {
      // Free users without subscription should upgrade
      if (isFreeUser) {
        setShowCreditWarning(true);
        return;
      }

      // Paid users with insufficient credits should upgrade or wait for reset
      if (!hasEnoughCredits) {
        setShowCreditWarning(true);
        return;
      }
    }

    // For scratch mode, create blank slides immediately
    if (mode === "scratch") {
      const blankSlides: Slide[] = [
        {
          type: "title",
          title: trimmed,
          subtitle: "Your Subtitle Here",
        },
        ...Array.from({ length: formData.numberOfSlides - 1 }, (_, i) => ({
          type: "content" as const,
          title: `Slide ${i + 2}`,
          bulletPoints: ["Add your content here", "Edit this slide to customize"],
        })),
      ];

      setSlides(blankSlides);
      setView("completed");
      setLastDescription(trimmed);
      setHasStartedGeneration(true);
      return;
    }

    // Determine which outline ID to use (reuse existing when present)
    const idForStream = outlineId || existingOutline?.id || null;

    // Remember the prompt we are generating from (for button label logic)
    setLastDescription(trimmed);

    // Reset previous outline state visually and start a new stream
    reset();
    setView("streaming");
    setSlides([]);
    setOutlineId(idForStream);
    setHasStartedGeneration(true);

    await startStream({
      description: trimmed,
      numberOfSlides: formData.numberOfSlides,
      tone: formData.tone,
      language: formData.language,
      outlineId: idForStream,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleGenerate();
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditSlide = (index: number, updatedSlide: Slide) => {
    setSlides((prev) => {
      const newSlides = [...prev];
      newSlides[index] = updatedSlide;
      return newSlides;
    });
  };

  const handleDeleteSlide = (index: number) => {
    if (slides.length <= 2) return; // Keep at least title + 1 content
    setSlides((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex || dropIndex === 0) return;

    setSlides((prev) => {
      const newSlides = [...prev];
      const [draggedSlide] = newSlides.splice(draggedIndex, 1);
      if (draggedSlide) {
        newSlides.splice(dropIndex, 0, draggedSlide);
      }
      return newSlides;
    });

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnter = (index: number) => {
    if (index !== 0 && index !== draggedIndex) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleStartOver = () => {
    reset();
    setView("form");
    setSlides([]);
    setOutlineId(null);
    router.push(`/createpresentation?mode=${mode}`);
  };

  const handleCreatePresentation = async () => {
    if (slides.length === 0 || isCreatingPresentation) return;

    setIsCreatingPresentation(true);

    try {
      // Prepare slides with full visual metadata
      const slidesWithMetadata = slides.map(slide => ({
        type: slide.type,
        title: slide.title,
        subtitle: slide.subtitle,
        bulletPoints: slide.bulletPoints,
        semanticIntent: slide.semanticIntent,
        visualStrategy: slide.visualStrategy,
        assets: slide.assets,
        image: slide.image,
        contentLayoutHint: slide.contentLayoutHint, // Include content layout hint for box layouts
      }));

      // Create presentation with streaming mode (Gamma-style)
      // This creates the presentation immediately and redirects to the page
      // where content will be streamed in real-time
      const response = await fetch("/api/create-presentation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outlineId: outlineId || existingOutline?.id || "",
          slides: slidesWithMetadata,
          theme: formData.theme,
          imageSource: formData.imageSource,
          textDensity: formData.textDensity,
          metadata: {
            topic: formData.description || existingOutline?.metadata?.topic || "Presentation",
            totalSlides: slides.length,
            tone: formData.tone,
            language: formData.language,
          },
          imageModel: formData.imageModel,
          streaming: true, // Enable Gamma-style streaming
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create presentation");
      }

      // Redirect to presentation page where streaming will happen
      router.push(data.redirectUrl);
    } catch (error) {
      console.error("Error creating presentation:", error);
      setIsCreatingPresentation(false);
    }
  };

  // Calculate stats
  const totalCharacters = slides.reduce((acc, slide) => {
    let chars = slide.title.length;
    if (slide.subtitle) chars += slide.subtitle.length;
    if (slide.bulletPoints) {
      chars += slide.bulletPoints.reduce((sum, bp) => sum + bp.length, 0);
    }
    return acc + chars;
  }, 0);

  // Check actual streaming status, not just view state
  const isStreaming = streamState.status === "streaming" || streamState.status === "connecting";
  // If we've started a new generation, only use streamState for completion status
  // Otherwise, consider existingOutline for initial load
  const isCompleted = hasStartedGeneration
    ? ((streamState.status === "completed" || mode === "scratch") && view === "completed")
    : ((streamState.status === "completed" && view === "completed") || !!existingOutline);
  const hasError = streamState.status === "error";
  const showOutline = (isStreaming || isCompleted) && !hasError;

  const normalizedCurrent = formData.description.trim();
  const normalizedLast = lastDescription.trim();
  const isSamePrompt = normalizedCurrent !== "" && normalizedCurrent === normalizedLast;

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Pricing Modal for Credit Warning */}
      <PricingModal
        isOpen={showCreditWarning}
        onClose={() => setShowCreditWarning(false)}
        currentPlan={subscriptionPlan}
      />

      {/* Load Google Fonts */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;700&family=Outfit:wght@400;700&family=Playfair+Display:wght@400;700&family=Plus+Jakarta+Sans:wght@400;500;700&display=swap');
      `}</style>

      {/* Logo-Inspired Gradient Background - Extra Soft with More Upper M Color */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `linear-gradient(to bottom, 
            #f7fefc 0%,
            #f0fdfa 10%,
            #e6fcf5 20%,
            #d1fae5 30%,
            #b2f5ea 40%,
            #99f6e4 50%,
            #7ee7d4 60%,
            #6ee7d4 70%,
            #5eead4 80%,
            #4dd0c4 90%,
            #38b9a8 100%
          )`
        }}
      />

      {/* Extra Soft Light Overlay for Depth */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.7) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.5) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.3) 0%, transparent 70%),
            radial-gradient(circle at 50% 100%, rgba(255, 255, 255, 0.6) 0%, transparent 50%)
          `
        }}
      />

      {/* Subtle Grid Pattern */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.5) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="px-8 pt-8 pb-4">
          <button
            onClick={() => (showOutline ? handleStartOver() : router.back())}
            className="mb-4 flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-sm px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-white hover:text-[#1e3a8a]"
          >
            <ArrowLeft size={16} /> {showOutline ? "Start Over" : "Back"}
          </button>
        </div>

        {/* Error Message - Minimal, at the top */}
        {hasError && streamState.error && (
          <div className="px-4 sm:px-6 lg:px-8 mb-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                <svg className="w-4 h-4 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="flex-1">{streamState.error}</span>
                <button
                  onClick={handleStartOver}
                  className="text-red-700 hover:text-red-900 underline text-xs font-medium"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Form Section - Compact when streaming/completed */}
        <div className={`px-4 sm:px-6 lg:px-8 ${showOutline ? "pb-4" : "pb-12"}`}>
          <div className={`mx-auto ${showOutline ? "max-w-4xl" : "max-w-2xl"}`}>
            {!showOutline && (
              <div className="flex flex-col items-center justify-center mb-8">
                <h1 className="text-4xl font-bold tracking-tight text-[#1e3a8a] mb-3">
                  {mode === "ai" && "AI Generation"}
                  {mode === "docs" && "Import Documents"}
                  {mode === "scratch" && "Start from Scratch"}
                </h1>
                <p className="text-slate-600 text-center">
                  {mode === "ai" && "Describe your idea and watch AI craft a complete professional deck"}
                  {mode === "docs" && "Upload PDFs, Word files, or paste content to transform into a presentation"}
                  {mode === "scratch" && "Build from a blank canvas with full creative control over every slide"}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Description - Compact when streaming */}
              <div className={showOutline ? "flex flex-col md:flex-row items-start gap-4" : ""}>
                <div className={showOutline ? "flex-1 w-full" : ""}>
                  {!showOutline && mode === "ai" && (
                    <label htmlFor="description" className="block text-sm font-semibold text-[#1e3a8a] mb-3">
                      What to Create
                    </label>
                  )}
                  {!showOutline && mode === "docs" && (
                    <label htmlFor="description" className="block text-sm font-semibold text-[#1e3a8a] mb-3">
                      Upload or Paste Content
                    </label>
                  )}
                  {!showOutline && mode === "scratch" && (
                    <label htmlFor="description" className="block text-sm font-semibold text-[#1e3a8a] mb-3">
                      Presentation Title
                    </label>
                  )}

                  {/* AI Mode - Description textarea */}
                  {mode === "ai" && (
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      placeholder="Define what you want to create in one sentence or more..."
                      rows={showOutline ? 2 : 4}
                      disabled={isStreaming}
                      className={`w-full rounded-md border border-slate-200 bg-white px-5 py-3 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20 focus:border-[#06b6d4] transition-all resize-none shadow-sm ${isStreaming ? "opacity-60 cursor-not-allowed" : ""
                        }`}
                      required
                    />
                  )}

                  {/* Docs Mode - File upload and paste area */}
                  {mode === "docs" && !showOutline && (
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-[#06b6d4] transition-colors">
                        <Upload className="mx-auto h-12 w-12 text-slate-400 mb-3" />
                        <input
                          type="file"
                          id="file-upload"
                          accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setUploadedFile(file);

                              const formData = new FormData();
                              formData.append("file", file);

                              const loadingToast = toast.loading("Parsing document...");

                              try {
                                const response = await fetch("/api/parse-document", {
                                  method: "POST",
                                  body: formData,
                                });

                                if (!response.ok) {
                                  // Attempt to read text if JSON fails, to catch HTML error pages
                                  const text = await response.text();
                                  console.error(`Upload failed: ${response.status} ${response.statusText}`, text);

                                  try {
                                    const errorData = JSON.parse(text);
                                    throw new Error(errorData.error || `Upload failed: ${response.status}`);
                                  } catch (e) {
                                    throw new Error(`Server error (${response.status}): Check console for details.`);
                                  }
                                }

                                const data = await response.json();
                                handleChange("description", data.text);
                                toast.success("Document parsed successfully", { id: loadingToast });
                              } catch (error) {
                                console.error("Parsing error:", error);
                                toast.error(error instanceof Error ? error.message : "Failed to parse document", { id: loadingToast });
                              }
                            }
                          }}
                          className="hidden"
                        />
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Choose File
                        </label>
                        <p className="mt-2 text-xs text-slate-500">
                          {uploadedFile ? uploadedFile.name : "PDF, Word, PowerPoint, or Text files"}
                        </p>
                      </div>
                      <div className="text-center text-sm text-slate-500">or</div>
                      <textarea
                        value={pastedContent}
                        onChange={(e) => {
                          setPastedContent(e.target.value);
                          handleChange("description", e.target.value);
                        }}
                        placeholder="Paste your content here..."
                        rows={6}
                        disabled={isStreaming}
                        className="w-full rounded-md border border-slate-200 bg-white px-5 py-3 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20 focus:border-[#06b6d4] transition-all resize-none shadow-sm"
                      />
                    </div>
                  )}

                  {/* Docs Mode - Compact view when streaming */}
                  {mode === "docs" && showOutline && (
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      placeholder="Your content..."
                      rows={2}
                      disabled={isStreaming}
                      className={`w-full rounded-md border border-slate-200 bg-white px-5 py-3 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20 focus:border-[#06b6d4] transition-all resize-none shadow-sm ${isStreaming ? "opacity-60 cursor-not-allowed" : ""
                        }`}
                      required
                    />
                  )}

                  {/* Scratch Mode - Simple title input */}
                  {mode === "scratch" && (
                    <input
                      type="text"
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      placeholder="Enter your presentation title..."
                      disabled={isStreaming}
                      className={`w-full rounded-md border border-slate-200 bg-white px-5 py-3 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20 focus:border-[#06b6d4] transition-all shadow-sm ${isStreaming ? "opacity-60 cursor-not-allowed" : ""
                        }`}
                      required
                    />
                  )}
                </div>

                {/* Inline controls when streaming/completed */}
                {showOutline && (
                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto md:shrink-0">
                    <select
                      value={formData.numberOfSlides}
                      disabled={isStreaming}
                      onChange={(e) => handleChange("numberOfSlides", parseInt(e.target.value))}
                      className="flex-1 md:flex-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20 disabled:opacity-60 min-w-[100px]"
                    >
                      {allSlideOptions
                        .filter((opt) => opt.value > 0)
                        .map((opt) => (
                          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                            {opt.label}
                          </option>
                        ))}
                    </select>
                    <select
                      value={formData.tone}
                      disabled={isStreaming}
                      onChange={(e) => handleChange("tone", e.target.value)}
                      className="flex-1 md:flex-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20 disabled:opacity-60 min-w-[120px]"
                    >
                      <option value="professional">Professional</option>
                      <option value="casual">Casual</option>
                      <option value="formal">Formal</option>
                      <option value="creative">Creative</option>
                      <option value="friendly">Friendly</option>
                    </select>
                    <select
                      value={formData.language}
                      disabled={isStreaming}
                      onChange={(e) => handleChange("language", e.target.value)}
                      className="flex-1 md:flex-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20 disabled:opacity-60 min-w-[100px]"
                    >
                      <option value="english">English</option>
                      <option value="spanish">Spanish</option>
                      <option value="french">French</option>
                      <option value="german">German</option>
                      <option value="chinese">Chinese</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Full form controls when not streaming */}
              {!showOutline && (
                <>
                  {mode === "ai" && (
                    <p className="text-xs text-slate-500 -mt-4">
                      Describe your presentation idea, topics to cover, main message, or any specific requirements.
                    </p>
                  )}
                  {mode === "docs" && (
                    <p className="text-xs text-slate-500 -mt-4">
                      Upload a document or paste content, and AI will structure it into a presentation.
                    </p>
                  )}
                  {mode === "scratch" && (
                    <p className="text-xs text-slate-500 -mt-4">
                      Start with a blank presentation. You&apos;ll be able to add and customize slides manually.
                    </p>
                  )}

                  {/* Number of Slides */}
                  <div>
                    <div className="relative">
                      <select
                        id="slides"
                        value={formData.numberOfSlides}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          const selectedOption = allSlideOptions.find((opt) => opt.value === value);
                          if (value > 0 && selectedOption?.disabled) {
                            // Show pricing modal when trying to select a disabled (premium) option
                            setShowCreditWarning(true);
                            return;
                          }
                          if (value > 0) {
                            handleChange("numberOfSlides", value);
                          }
                        }}
                        className="w-full rounded-md border border-slate-200 bg-white px-5 py-4 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20 focus:border-[#06b6d4] transition-all shadow-sm appearance-none cursor-pointer"
                      >
                        {allSlideOptions.map((option, index) => {
                          if (option.isGroupHeader) {
                            return (
                              <option key={`header-${index}`} value={option.value} disabled className="font-semibold text-slate-500 bg-slate-50">
                                {option.label}
                              </option>
                            );
                          }
                          const planLabel = option.plan !== "Free" ? option.plan : "";
                          const spaces = planLabel ? "\u00A0".repeat(Math.max(1, 15 - option.label.length)) : "";
                          const lockIcon = option.disabled ? "" : "";
                          const displayLabel = planLabel
                            ? `${option.label}${spaces}${planLabel} ${lockIcon}`.trim()
                            : option.label;

                          return (
                            <option
                              key={option.value}
                              value={option.value}
                              style={option.disabled ? { color: "#06b6d4" } : {}}
                            >
                              {displayLabel}
                            </option>
                          );
                        })}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Tone and Language */}
                  <div className="mt-4 grid grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="tone" className="block text-sm font-semibold text-[#1e3a8a] mb-3">
                        Tone
                      </label>
                      <select
                        id="tone"
                        value={formData.tone}
                        onChange={(e) => handleChange("tone", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-5 py-4 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20 focus:border-[#06b6d4] transition-all shadow-sm"
                      >
                        <option value="professional">Professional</option>
                        <option value="casual">Casual</option>
                        <option value="formal">Formal</option>
                        <option value="creative">Creative</option>
                        <option value="friendly">Friendly</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="language" className="block text-sm font-semibold text-[#1e3a8a] mb-3">
                        Language
                      </label>
                      <select
                        id="language"
                        value={formData.language}
                        onChange={(e) => handleChange("language", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-5 py-4 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20 focus:border-[#06b6d4] transition-all shadow-sm"
                      >
                        <option value="english">English</option>
                        <option value="spanish">Spanish</option>
                        <option value="french">French</option>
                        <option value="german">German</option>
                        <option value="italian">Italian</option>
                        <option value="portuguese">Portuguese</option>
                        <option value="chinese">Chinese</option>
                        <option value="japanese">Japanese</option>
                        <option value="korean">Korean</option>
                        <option value="arabic">Arabic</option>
                        <option value="hindi">Hindi</option>
                        <option value="russian">Russian</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Primary generate / regenerate button (same position, no icon) */}
              <div className="flex items-center justify-center pt-4">
                <button
                  type="submit"
                  disabled={!formData.description.trim() || isStreaming}
                  title={
                    isSamePrompt
                      ? "Regenerate this outline with the same description (replaces current outline)"
                      : "Generate a new outline with this description (replaces current outline)"
                  }
                  className="px-12 py-3 rounded-md bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white font-semibold shadow-lg transition-all hover:opacity-90 hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isStreaming ? (
                    mode === "scratch" ? "Creating…" : isSamePrompt ? "Regenerating…" : "Generating…"
                  ) : (
                    mode === "ai" ? (isSamePrompt ? "Regenerate outline" : "Generate outline") :
                      mode === "docs" ? "Transform to Presentation" :
                        mode === "scratch" ? "Create Presentation" : "Create Blank Presentation"
                  )}
                </button>
              </div>
            </form>

            {/* Recent Outlines - Only show when form is visible */}
            {!showOutline && mode === "ai" && recentOutlines.length > 0 && (
              <RecentOutlines outlines={recentOutlines.map(o => ({ ...o, createdAt: new Date(o.createdAt) }))} mode={mode} />
            )}
          </div>
        </div>

        {/* Outline Section */}
        {
          showOutline && (
            <div className={`flex-1 px-4 sm:px-6 lg:px-8 ${isCompleted ? "pb-[140px]" : "pb-12"}`}>
              <div className="mx-auto max-w-4xl">
                {/* Simple status text above slides - only show when actually streaming */}
                {isStreaming && !hasError && streamState.totalSlides > 0 && (
                  <div className="mb-6 text-sm text-[#06b6d4] flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-lg px-4 py-3 shadow-sm border border-[#06b6d4]/20">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="font-medium">
                      {streamState.currentSlideIndex >= 0
                        ? `Generating slide ${streamState.currentSlideIndex + 1} of ${streamState.totalSlides}...`
                        : `Preparing to generate ${streamState.totalSlides} slides...`}
                    </span>
                  </div>
                )}

                {/* Slides List - vertical - only show when not in error state */}
                {!hasError && (
                  <div className="space-y-3" onDragEnd={handleDragEnd}>
                    {isStreaming ? (
                      // Show skeleton cards + completed slides during streaming
                      <>
                        {Array.from({ length: streamState.totalSlides }).map((_, index) => {
                          const slide = streamState.slides[index];
                          if (slide) {
                            return (
                              <div key={index} className="group">
                                <SlideCard
                                  slide={slide}
                                  index={index}
                                  isStreaming={true}
                                />
                              </div>
                            );
                          }
                          return <SkeletonCard key={index} index={index} />;
                        })}
                      </>
                    ) : (
                      // Show editable slides when completed
                      slides.map((slide, index) => (
                        <div
                          key={index}
                          className="group"
                          onDragEnter={() => handleDragEnter(index)}
                        >
                          <SlideCard
                            slide={slide}
                            index={index}
                            isStreaming={false}
                            onEdit={handleEditSlide}
                            onDelete={handleDeleteSlide}
                            onDragStart={handleDragStart}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            isDraggedOver={dragOverIndex === index}
                            canDelete={slides.length > 2}
                          />
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Presentation style box – used when creating slides from this outline */}
                {isCompleted && (
                  <div className="mt-6 mb-[60px] rounded-xl border border-slate-200 bg-white/95 backdrop-blur-sm px-4 py-4 shadow-sm">
                    {/* Text Content Section */}
                    <div className="mb-6 pb-6 border-b border-slate-200">
                      <div className="flex items-center gap-2 mb-3">
                        <svg className="w-4 h-4 text-[#06b6d4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                          Text Content
                        </p>
                      </div>
                      <p className="text-xs text-slate-500 mb-3">Amount of text per card</p>

                      {/* Text Density Options */}
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { id: "minimal", label: "Minimal", lines: 2 },
                          { id: "concise", label: "Concise", lines: 3 },
                          { id: "detailed", label: "Detailed", lines: 4 },
                          { id: "extensive", label: "Extensive", lines: 5 },
                        ].map((option) => {
                          const isSelected = formData.textDensity === option.id;
                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => handleChange("textDensity", option.id)}
                              className={`relative rounded-lg border p-3 text-left transition-all hover:shadow-sm ${isSelected
                                ? "border-[#06b6d4] ring-2 ring-[#06b6d4]/20 bg-[#06b6d4]/5"
                                : "border-slate-200 hover:border-slate-300 bg-white"
                                }`}
                            >
                              {/* Text lines visualization */}
                              <div className="mb-2 space-y-1">
                                {Array.from({ length: option.lines }).map((_, i) => (
                                  <div
                                    key={i}
                                    className={`h-1 rounded ${isSelected ? "bg-[#06b6d4]" : "bg-slate-300"
                                      }`}
                                    style={{
                                      width: i === option.lines - 1 ? "60%" : "100%",
                                    }}
                                  />
                                ))}
                              </div>
                              <div className={`text-xs font-medium ${isSelected ? "text-[#06b6d4]" : "text-slate-700"
                                }`}>
                                {option.label}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Theme Selection */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                            Presentation Theme
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Recently selected themes
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsThemeSelectorOpen(true)}
                          className="text-xs font-medium text-[#06b6d4] hover:text-[#0891b2] transition-colors"
                        >
                          Browse all →
                        </button>
                      </div>

                      {/* Popular Themes Grid - 3 columns, 2 rows */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {quickSelectThemes.slice(0, 6).map((themeId) => {
                          const theme = getThemeForDisplay(themeId);
                          if (!theme) return null;
                          const isSelected = formData.theme === theme.id;
                          return (
                            <button
                              key={theme.id}
                              type="button"
                              onClick={() => {
                                handleChange("theme", theme.id);
                                // Move selected theme to front of quick-select
                                setQuickSelectThemes((prev) => {
                                  if (prev[0] === theme.id) return prev; // Already first
                                  return [theme.id, ...prev.filter(id => id !== theme.id)].slice(0, 6);
                                });
                              }}
                              className={`group relative overflow-hidden rounded-lg border text-left transition-all hover:shadow-md ${isSelected
                                ? "border-[#06b6d4] ring-2 ring-[#06b6d4]/20 shadow-sm"
                                : "border-slate-200 hover:border-slate-300"
                                }`}
                            >
                              {/* Theme Preview Card */}
                              <div className="p-2">
                                <div
                                  className="aspect-[1.8/1] w-full rounded shadow-sm relative overflow-hidden"
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
                                    className="absolute bottom-1.5 left-1.5 right-1.5 rounded p-1.5 backdrop-blur-md transition-all duration-300"
                                    style={{
                                      backgroundColor: theme.cardBox?.background || "rgba(255, 255, 255, 0.95)",
                                      border: theme.cardBox?.borderColor ? `1px solid ${theme.cardBox.borderColor}` : "none",
                                      boxShadow: theme.cardBox?.shadow || "0 1px 3px rgba(0, 0, 0, 0.1)",
                                      maxWidth: "70%",
                                    }}
                                  >
                                    <div
                                      className="text-[11px] font-bold mb-0.5 leading-tight"
                                      style={{
                                        fontFamily: theme.fonts.heading.family,
                                        color: theme.cardBox?.titleColor || theme.colors.heading,
                                      }}
                                    >
                                      Title
                                    </div>
                                    <div
                                      className="text-[8px] font-medium leading-tight"
                                      style={{
                                        fontFamily: theme.fonts.body.family,
                                        color: theme.cardBox?.bodyColor || theme.colors.text,
                                      }}
                                    >
                                      Body &{" "}
                                      <span
                                        className="underline decoration-1"
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
                                className={`px-2 py-1 border-t flex items-center justify-between text-[11px] ${isSelected ? "bg-[#06b6d4]/5" : "bg-white"
                                  }`}
                                style={{ borderColor: isSelected ? "#06b6d4" : "#e2e8f0" }}
                              >
                                <div className="font-medium text-slate-700 truncate">
                                  {theme.name}
                                </div>
                                {isSelected && (
                                  <Check size={12} className="text-[#06b6d4] flex-shrink-0 ml-1" />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Image Style Selection */}
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                        Image Style
                      </p>
                      <select
                        id="imageSource-outline"
                        value={formData.imageSource}
                        onChange={(e) => handleChange("imageSource", e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20 focus:border-[#06b6d4] transition-all"
                      >
                        <option value="no-images">No Images (Text-Only Slides)</option>
                        <option value="placeholders">Image Placeholders (Edit Later)</option>
                        <option value="ai-generated">AI-Generated Images</option>
                        <option value="stock-photos">Stock Photos (Pexels)</option>
                        <option value="illustrations">Illustrations (Pictographic Style)</option>
                        <option value="web-images">Web Images (Public Search)</option>
                      </select>
                    </div>

                    {/* Second selector: AI model (for AI images) or licensing (for external images) */}
                    <div>
                      {formData.imageSource === "ai-generated" ? (
                        <div className="relative">
                          <select
                            id="imageModel-outline"
                            value={formData.imageModel}
                            onChange={(e) => handleChange("imageModel", e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20 focus:border-[#06b6d4] transition-all appearance-none"
                          >
                            <option value="gemini-2.5-flash-image">
                              Nano Banana (Gemini 2.5 Flash Image)
                            </option>
                            <option value="gemini-3-pro-image-preview">
                              Nano Banana Pro (Gemini 3 Pro Image Preview)
                            </option>
                            <option value="imagen-4.0-generate-001">
                              Imagen 4
                            </option>
                            <option value="imagen-4.0-ultra-generate-001">
                              Imagen 4 Ultra
                            </option>
                            <option value="imagen-4.0-fast-generate-001">
                              Imagen 4 Fast
                            </option>
                          </select>
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="relative">
                            <select
                              id="imageLicensing-outline"
                              value={formData.imageLicensing}
                              onChange={(e) => handleChange("imageLicensing", e.target.value)}
                              disabled={formData.imageSource === "no-images" || formData.imageSource === "placeholders"}
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20 focus:border-[#06b6d4] transition-all disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
                            >
                              <option value="all-images">All images</option>
                              <option value="free-to-use">Free to use</option>
                              <option value="free-commercial">Free to use commercially</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>

                          {/* Licensing Info Tooltip */}
                          {formData.imageLicensing !== "all-images" && formData.imageSource !== "no-images" && formData.imageSource !== "placeholders" && (
                            <div className="mt-2 p-2 rounded-lg bg-blue-50 border border-blue-100">
                              <div className="flex items-start gap-2">
                                <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                <div className="text-[10px] text-blue-700 leading-relaxed">
                                  {formData.imageLicensing === "free-to-use" && (
                                    <span>
                                      <strong>Free to use:</strong> Only use images licensed for personal use, like a school project.
                                    </span>
                                  )}
                                  {formData.imageLicensing === "free-commercial" && (
                                    <span>
                                      <strong>Free to use commercially:</strong> Only use images licensed for commercial use, like a sales pitch.
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <p className="mt-3 text-xs text-slate-500 leading-relaxed">
                      These settings will be applied when you create the final presentation.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )
        }
      </div >

      {/* Bottom sticky stats & action bar (only when outline is ready and NOT streaming) */}
      {
        isCompleted && !isStreaming && (
          <div className="fixed inset-x-0 bottom-0 z-20">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pb-4">
              <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-lg border border-slate-200">
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    <span className="text-slate-500">Slides:</span>
                    <strong className="text-[#1e3a8a]">{slides.length || streamState.totalSlides || 0}</strong>
                  </span>
                  <span className="hidden sm:inline text-slate-300">•</span>
                  <span className="hidden sm:flex items-center gap-1">
                    <span className="text-slate-500">Characters:</span>
                    <strong className="text-[#1e3a8a]">{totalCharacters.toLocaleString()}</strong>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1">
                    <span className="text-slate-500">Credits:</span>
                    <strong className="text-[#06b6d4]">{streamState.creditsRemaining ?? "—"}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCreatePresentation}
                  disabled={!isCompleted || slides.length === 0 || isCreatingPresentation}
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white text-sm font-semibold shadow-md transition-all hover:opacity-90 hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
                >
                  {isCreatingPresentation ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span className="hidden sm:inline">{formData.imageSource === "stock-photos" ? "Fetching Images..." : "Creating..."}</span>
                      <span className="sm:hidden">Creating...</span>
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">Create Presentation</span>
                      <span className="sm:hidden">Create</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Theme Selector Modal */}
      <ThemeSelector
        isOpen={isThemeSelectorOpen}
        onClose={() => setIsThemeSelectorOpen(false)}
        selectedThemeId={formData.theme}
        onSelectTheme={(themeId) => {
          handleChange("theme", themeId);
          // Update quick-select themes: add new theme and keep the most recent one
          setQuickSelectThemes((prev) => {
            // If theme is already in the list, move it to the front
            if (prev.includes(themeId)) {
              return [themeId, ...prev.filter(id => id !== themeId)].slice(0, 2);
            }
            // Otherwise, add it to the front and keep only 2 themes
            return [themeId, prev[0]!].slice(0, 2);
          });
        }}
      />
    </div >
  );
}

