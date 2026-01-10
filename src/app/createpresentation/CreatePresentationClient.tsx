"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Loader2, GripVertical, Trash2, Edit3, Check, X, Upload, Lock, ChevronDown, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useOutlineStream, type Slide, type OutlineMetadata } from "~/lib/dashboard/hooks/useOutlineStream";
import { themes, getThemeById, type Theme } from "~/lib/themes";
import { isCustomThemeId, getCustomThemeDbId, convertCustomThemeToTheme } from "~/lib/custom-theme-utils";
import ThemeSelector from "~/components/ThemeSelector";
import RecentOutlines from "~/components/createpresentation/RecentOutlines";
import PricingModal from "~/components/dashboard/PricingModal";
import { CREDIT_COSTS } from "~/lib/credits";
import { useLanguage } from "~/contexts/LanguageContext";
import { dashboardTranslations } from "~/lib/dashboard-translations";

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

// Credit cost per presentation generation (legacy check for AI outline generation UI)
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
  
  // Translations
  const { language } = useLanguage();
  const t = dashboardTranslations[language] || dashboardTranslations.en;

  // Credit check state
  const [showCreditWarning, setShowCreditWarning] = useState(false);
  const hasEnoughCredits = userCredits >= CREDIT_COST_PER_GENERATION;
  const isFreeUser = !subscriptionPlan || subscriptionPlan === 'free';

  // Client-side mount state for SVG noise filter (prevents hydration mismatch)
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

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
    // Default AI image model (Gemini 2.5 Flash - "Nano Banana")
    imageModel: "gemini-2.5-flash-image" as
      // Google Gemini models (multimodal)
      | "gemini-2.5-flash-image"           // ~$0.039/image - Nano Banana
      | "gemini-3-pro-image-preview"       // ~$0.134/image - Nano Banana Pro
      // Google Imagen 4 models (dedicated text-to-image)
      | "imagen-4.0-fast-generate-001"     // $0.02/image - Fast
      | "imagen-4.0-generate-001"          // $0.04/image - Standard
      | "imagen-4.0-ultra-generate-001"    // $0.06/image - Ultra
      // OpenAI GPT Image models
      | "gpt-image-1.5"                    // Latest flagship
      | "gpt-image-1"                      // Previous flagship
      | "gpt-image-1-mini"                 // Budget option
      // Legacy OpenAI DALL-E
      | "openai"                           // DALL-E 3 ~$0.04/image
      | "openai-hd",                       // DALL-E 3 HD ~$0.08/image
    // Image art style (like Gamma)
    imageArtStyle: "photo" as "illustration" | "photo" | "abstract" | "3d" | "line-art" | "custom",
    // Custom art style text (when imageArtStyle is "custom")
    customArtStyleText: "",
  });

  const [lastDescription, setLastDescription] = useState(
    (existingOutline?.metadata?.topic || "").trim()
  );

  // Slides state (for editing after completion)
  const [slides, setSlides] = useState<Slide[]>(existingOutline?.slides || []);
  const [outlineId, setOutlineId] = useState<string | null>(existingOutline?.id || null);

  // Debug: Log outlineId state changes
  useEffect(() => {
    console.log("[CreatePresentation] outlineId state changed:", {
      outlineId,
      existingOutlineId: existingOutline?.id,
    });
  }, [outlineId, existingOutline?.id]);

  // Drag state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isCreatingPresentation, setIsCreatingPresentation] = useState(false);

  // Close model dropdown when pressing Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModelDropdownOpen) {
        setIsModelDropdownOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isModelDropdownOpen]);

  // Track recently selected themes for quick access (6 themes for 3x2 grid)
  // Filter to only include unique theme IDs that exist
  const [quickSelectThemes, setQuickSelectThemes] = useState<string[]>(() => {
    const uniqueThemes = new Set<string>();
    themes.forEach((t) => uniqueThemes.add(t.id));
    return Array.from(uniqueThemes).slice(0, 6);
  });

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
      // Only update outlineId from stream if:
      // 1. We don't have an existingOutline (new generation), OR
      // 2. The stream returned a valid outlineId (regeneration case)
      // This prevents overwriting existingOutline.id with null when loading from URL
      if (!existingOutline || streamState.outlineId) {
        setOutlineId(streamState.outlineId);
      }
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

    // Determine the final outlineId to use
    const finalOutlineId = outlineId || existingOutline?.id || null;
    console.log("[CreatePresentation] Creating presentation - FULL DEBUG:", {
      outlineIdState: outlineId,
      outlineIdStateType: typeof outlineId,
      existingOutline: existingOutline ? { id: existingOutline.id, hasSlides: existingOutline.slides?.length } : null,
      existingOutlineId: existingOutline?.id,
      existingOutlineIdType: typeof existingOutline?.id,
      finalOutlineId,
      finalOutlineIdType: typeof finalOutlineId,
    });

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

      // Build request body
      const requestBody = {
        outlineId: finalOutlineId,
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
        imageArtStyle: formData.imageArtStyle,
        customArtStyleText: formData.customArtStyleText,
        streaming: true, // Enable Gamma-style streaming
      };

      console.log("[CreatePresentation] Request body outlineId:", requestBody.outlineId);

      // Create presentation with streaming mode (Gamma-style)
      // This creates the presentation immediately and redirects to the page
      // where content will be streamed in real-time
      const response = await fetch("/api/create-presentation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
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

  // Credits needed for final presentation (4 credits per created slide)
  const creditsPerSlide = CREDIT_COSTS.SLIDE;
  const creditsNeededForPresentation = slides.length * creditsPerSlide;
  const effectiveCredits =
    typeof streamState.creditsRemaining === "number"
      ? streamState.creditsRemaining
      : userCredits;
  const hasEnoughCreditsForPresentation =
    creditsNeededForPresentation === 0 || effectiveCredits >= creditsNeededForPresentation;

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
    <div className="h-screen w-full relative overflow-hidden">
      {/* Pricing Modal for Credit Warning */}
      <PricingModal
        isOpen={showCreditWarning}
        onClose={() => setShowCreditWarning(false)}
        currentPlan={subscriptionPlan}
      />

      {/* Load Google Fonts for theme previews */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=Outfit:wght@400;500;600;700&family=Sora:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Lato:wght@400;700&family=Cormorant+Garamond:wght@400;500;600;700&family=Source+Sans+3:wght@400;500;600;700&family=Libre+Baskerville:wght@400;700&family=Nunito+Sans:wght@400;500;600;700&family=Noto+Serif+SC:wght@400;500;600;700&display=swap');
      `}</style>

      {/* Logo-Inspired Gradient Background - Fixed Full Height */}
      <div
        className="fixed inset-0 z-0"
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

      {/* Extra Soft Light Overlay for Depth - Fixed */}
      <div
        className="fixed inset-0 z-0"
        style={{
          background: `
            radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.7) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.5) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.3) 0%, transparent 70%),
            radial-gradient(circle at 50% 100%, rgba(255, 255, 255, 0.6) 0%, transparent 50%)
          `
        }}
      />

      {/* Noise/Grain Texture Overlay - using CSS filter for reliable cross-browser support */}
      {isMounted && (
        <svg className="fixed inset-0 w-full h-full z-[1] pointer-events-none opacity-[0.7]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="noiseFilter">
              <feTurbulence 
                type="fractalNoise" 
                baseFrequency="0.9" 
                numOctaves="5" 
                stitchTiles="stitch"
              />
              <feColorMatrix type="saturate" values="0" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="1.5" />
              </feComponentTransfer>
            </filter>
          </defs>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
      )}

      {/* Fixed Header with Back Button */}
      <div className="fixed top-0 left-0 right-0 z-20 px-6 pt-6 pb-4">
        <button
          onClick={() => (showOutline ? handleStartOver() : router.back())}
          className="flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-sm px-4 py-2 text-sm font-medium text-slate-700 shadow-md transition-all hover:bg-white hover:text-[#1e3a8a] hover:shadow-lg"
        >
          <ArrowLeft size={16} /> {showOutline ? t.startOver : t.backBtn}
        </button>
      </div>

      {/* Scrollable Content Area */}
      <div className="relative z-10 h-screen overflow-y-auto pt-20">
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
                  {t.tryAgainBtn}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Form Section - Compact when streaming/completed */}
        <div className={`px-4 sm:px-6 lg:px-8 ${showOutline ? "pb-4" : "pb-12"}`}>
          <div className={`mx-auto ${showOutline ? "max-w-4xl" : "max-w-xl"}`}>
            {!showOutline && (
              <div className="flex flex-col items-center justify-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1e3a8a] mb-2 text-center">
                  {mode === "ai" && t.aiGenerationMode}
                  {mode === "docs" && t.importDocumentsMode}
                  {mode === "scratch" && t.startFromScratchMode}
                </h1>
                <p className="text-slate-600 text-center text-sm sm:text-base max-w-md">
                  {mode === "ai" && t.describeYourIdea}
                  {mode === "docs" && t.importDocumentsDesc}
                  {mode === "scratch" && t.startFromScratchDesc}
                </p>
              </div>
            )}

            {/* Form Card */}
            <form onSubmit={handleSubmit} className={`${!showOutline ? "bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 sm:p-8" : ""}`}>
              {/* Description - Compact when streaming */}
              <div className={showOutline ? "flex flex-col md:flex-row items-start gap-4" : "space-y-5"}>
                <div className={showOutline ? "flex-1 w-full" : ""}>
                  {!showOutline && mode === "ai" && (
                    <label htmlFor="description" className="block text-sm font-semibold text-[#1e3a8a] mb-2">
                      {t.whatToCreateLabel}
                    </label>
                  )}
                  {!showOutline && mode === "docs" && (
                    <label htmlFor="description" className="block text-sm font-semibold text-[#1e3a8a] mb-2">
                      {t.uploadOrPasteContent}
                    </label>
                  )}
                  {!showOutline && mode === "scratch" && (
                    <label htmlFor="description" className="block text-sm font-semibold text-[#1e3a8a] mb-2">
                      {t.presentationTitleLabel}
                    </label>
                  )}

                  {/* AI Mode - Description textarea */}
                  {mode === "ai" && (
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      placeholder={t.defineWhatToCreate}
                      rows={showOutline ? 2 : 3}
                      disabled={isStreaming}
                      className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/30 focus:border-[#06b6d4] transition-all resize-none text-sm ${isStreaming ? "opacity-60 cursor-not-allowed" : ""}`}
                      required
                    />
                  )}

                  {/* Docs Mode - File upload and paste area */}
                  {mode === "docs" && !showOutline && (
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-[#06b6d4] transition-colors bg-slate-50/50">
                        <Upload className="mx-auto h-10 w-10 text-slate-400 mb-2" />
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

                              const loadingToast = toast.loading(t.parsingDocument);

                              try {
                                const response = await fetch("/api/parse-document", {
                                  method: "POST",
                                  body: formData,
                                });

                                if (!response.ok) {
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
                                setPastedContent(data.text);
                                toast.success(t.documentParsedSuccess, { id: loadingToast });
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
                          className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-[#06b6d4] transition-all"
                        >
                          {t.chooseFile}
                        </label>
                        <p className="mt-2 text-xs text-slate-500">
                          {uploadedFile ? uploadedFile.name : t.pdfWordPptText}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-slate-200"></div>
                        <span className="text-xs text-slate-400 font-medium">{t.orDivider}</span>
                        <div className="flex-1 h-px bg-slate-200"></div>
                      </div>
                      <textarea
                        value={pastedContent}
                        onChange={(e) => {
                          setPastedContent(e.target.value);
                          handleChange("description", e.target.value);
                        }}
                        placeholder={t.pasteContentHere}
                        rows={5}
                        disabled={isStreaming}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/30 focus:border-[#06b6d4] transition-all resize-none text-sm"
                      />
                    </div>
                  )}

                  {/* Docs Mode - Compact view when streaming */}
                  {mode === "docs" && showOutline && (
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      placeholder={t.yourContentPlaceholder}
                      rows={2}
                      disabled={isStreaming}
                      className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/30 focus:border-[#06b6d4] transition-all resize-none text-sm ${isStreaming ? "opacity-60 cursor-not-allowed" : ""}`}
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
                      placeholder={t.enterPresentationTitle}
                      disabled={isStreaming}
                      className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/30 focus:border-[#06b6d4] transition-all text-sm ${isStreaming ? "opacity-60 cursor-not-allowed" : ""}`}
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
                      <optgroup label="Business">
                        <option value="professional"> Professional</option>
                        <option value="formal">Formal</option>
                        <option value="corporate">Corporate</option>
                        <option value="executive">Executive</option>
                      </optgroup>
                      <optgroup label="Friendly">
                        <option value="casual">Casual</option>
                        <option value="friendly">Friendly</option>
                        <option value="conversational"> Conversational</option>
                        <option value="warm">Warm</option>
                      </optgroup>
                      <optgroup label="Creative">
                        <option value="creative"> Creative</option>
                        <option value="playful"> Playful</option>
                        <option value="bold">Bold</option>
                        <option value="inspirational">Inspirational</option>
                      </optgroup>
                      <optgroup label="Educational">
                        <option value="educational">Educational</option>
                        <option value="informative">Informative</option>
                        <option value="technical">Technical</option>
                        <option value="academic">Academic</option>
                      </optgroup>
                      <optgroup label="Persuasive">
                        <option value="persuasive">Persuasive</option>
                        <option value="confident">Confident</option>
                        <option value="motivational">Motivational</option>
                        <option value="compelling">Compelling</option>
                      </optgroup>
                    </select>
                    <select
                      value={formData.language}
                      disabled={isStreaming}
                      onChange={(e) => handleChange("language", e.target.value)}
                      className="flex-1 md:flex-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20 disabled:opacity-60 min-w-[100px]"
                    >
                      <optgroup label="Popular">
                        <option value="english">🇺🇸 English</option>
                        <option value="spanish">🇪🇸 Español</option>
                        <option value="french">🇫🇷 Français</option>
                        <option value="german">🇩🇪 Deutsch</option>
                        <option value="chinese">🇨🇳 中文</option>
                      </optgroup>
                      <optgroup label="European">
                        <option value="portuguese">🇵🇹 Português</option>
                        <option value="italian">🇮🇹 Italiano</option>
                        <option value="dutch">🇳🇱 Nederlands</option>
                        <option value="polish">🇵🇱 Polski</option>
                        <option value="swedish">🇸🇪 Svenska</option>
                        <option value="norwegian">🇳🇴 Norsk</option>
                        <option value="danish">🇩🇰 Dansk</option>
                        <option value="finnish">🇫🇮 Suomi</option>
                        <option value="greek">🇬🇷 Ελληνικά</option>
                        <option value="czech">🇨🇿 Čeština</option>
                        <option value="romanian">🇷🇴 Română</option>
                        <option value="hungarian">🇭🇺 Magyar</option>
                        <option value="ukrainian">🇺🇦 Українська</option>
                        <option value="russian">🇷🇺 Русский</option>
                      </optgroup>
                      <optgroup label="Asian">
                        <option value="japanese">🇯🇵 日本語</option>
                        <option value="korean">🇰🇷 한국어</option>
                        <option value="hindi">🇮🇳 हिन्दी</option>
                        <option value="thai">🇹🇭 ไทย</option>
                        <option value="vietnamese">🇻🇳 Tiếng Việt</option>
                        <option value="indonesian">🇮🇩 Bahasa Indonesia</option>
                        <option value="malay">🇲🇾 Bahasa Melayu</option>
                        <option value="tagalog">🇵🇭 Tagalog</option>
                        <option value="bengali">🇧🇩 বাংলা</option>
                        <option value="tamil">🇮🇳 தமிழ்</option>
                      </optgroup>
                      <optgroup label="Middle East & Africa">
                        <option value="arabic">🇸🇦 العربية</option>
                        <option value="hebrew">🇮🇱 עברית</option>
                        <option value="turkish">🇹🇷 Türkçe</option>
                        <option value="persian">🇮🇷 فارسی</option>
                        <option value="swahili">🇰🇪 Kiswahili</option>
                      </optgroup>
                    </select>
                  </div>
                )}
              </div>

              {/* Full form controls when not streaming */}
              {!showOutline && (
                <>
                  {/* Number of Slides */}
                  <div>
                    <label htmlFor="slides" className="block text-sm font-semibold text-[#1e3a8a] mb-2">
                      {t.numberOfSlides}
                    </label>
                    <div className="relative">
                      <select
                        id="slides"
                        value={formData.numberOfSlides}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          const selectedOption = allSlideOptions.find((opt) => opt.value === value);
                          if (value > 0 && selectedOption?.disabled) {
                            setShowCreditWarning(true);
                            return;
                          }
                          if (value > 0) {
                            handleChange("numberOfSlides", value);
                          }
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/30 focus:border-[#06b6d4] transition-all appearance-none cursor-pointer"
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
                          const displayLabel = planLabel
                            ? `${option.label}${spaces}${planLabel}`.trim()
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
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Tone and Language - Side by side */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="tone" className="block text-sm font-semibold text-[#1e3a8a] mb-2">
                        {t.tone}
                      </label>
                      <select
                        id="tone"
                        value={formData.tone}
                        onChange={(e) => handleChange("tone", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/30 focus:border-[#06b6d4] transition-all"
                      >
                        <optgroup label="Business">
                          <option value="professional"> Professional</option>
                          <option value="formal">Formal</option>
                          <option value="corporate"> Corporate</option>
                          <option value="executive"> Executive</option>
                        </optgroup>
                        <optgroup label="Friendly">
                          <option value="casual">Casual</option>
                          <option value="friendly"> Friendly</option>
                          <option value="conversational">Conversational</option>
                          <option value="warm">Warm</option>
                        </optgroup>
                        <optgroup label="Creative">
                          <option value="creative"> Creative</option>
                          <option value="playful">Playful</option>
                          <option value="bold"> Bold</option>
                          <option value="inspirational"> Inspirational</option>
                        </optgroup>
                        <optgroup label="Educational">
                          <option value="educational"> Educational</option>
                          <option value="informative"> Informative</option>
                          <option value="technical"> Technical</option>
                          <option value="academic"> Academic</option>
                        </optgroup>
                        <optgroup label="Persuasive">
                          <option value="persuasive"> Persuasive</option>
                          <option value="confident"> Confident</option>
                          <option value="motivational"> Motivational</option>
                          <option value="compelling"> Compelling</option>
                        </optgroup>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="language" className="block text-sm font-semibold text-[#1e3a8a] mb-2">
                        {t.languageLabel}
                      </label>
                      <select
                        id="language"
                        value={formData.language}
                        onChange={(e) => handleChange("language", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/30 focus:border-[#06b6d4] transition-all"
                      >
                        <optgroup label={t.languagePopular}>
                          <option value="english">🇺🇸 English</option>
                          <option value="spanish">🇪🇸 Español</option>
                          <option value="french">🇫🇷 Français</option>
                          <option value="german">🇩🇪 Deutsch</option>
                          <option value="chinese">🇨🇳 中文</option>
                        </optgroup>
                        <optgroup label={t.languageEuropean}>
                          <option value="portuguese">🇵🇹 Português</option>
                          <option value="italian">🇮🇹 Italiano</option>
                          <option value="dutch">🇳🇱 Nederlands</option>
                          <option value="polish">🇵🇱 Polski</option>
                          <option value="swedish">🇸🇪 Svenska</option>
                          <option value="norwegian">🇳🇴 Norsk</option>
                          <option value="danish">🇩🇰 Dansk</option>
                          <option value="finnish">🇫🇮 Suomi</option>
                          <option value="greek">🇬🇷 Ελληνικά</option>
                          <option value="czech">🇨🇿 Čeština</option>
                          <option value="romanian">🇷🇴 Română</option>
                          <option value="hungarian">🇭🇺 Magyar</option>
                          <option value="ukrainian">🇺🇦 Українська</option>
                          <option value="russian">🇷🇺 Русский</option>
                        </optgroup>
                        <optgroup label={t.languageAsian}>
                          <option value="japanese">🇯🇵 日本語</option>
                          <option value="korean">🇰🇷 한국어</option>
                          <option value="hindi">🇮🇳 हिन्दी</option>
                          <option value="thai">🇹🇭 ไทย</option>
                          <option value="vietnamese">🇻🇳 Tiếng Việt</option>
                          <option value="indonesian">🇮🇩 Bahasa Indonesia</option>
                          <option value="malay">🇲🇾 Bahasa Melayu</option>
                          <option value="tagalog">🇵🇭 Tagalog</option>
                          <option value="bengali">🇧🇩 বাংলা</option>
                          <option value="tamil">🇮🇳 தமிழ்</option>
                        </optgroup>
                        <optgroup label={t.languageMiddleEastAfrica}>
                          <option value="arabic">🇸🇦 العربية</option>
                          <option value="hebrew">🇮🇱 עברית</option>
                          <option value="turkish">🇹🇷 Türkçe</option>
                          <option value="persian">🇮🇷 فارسی</option>
                          <option value="swahili">🇰🇪 Kiswahili</option>
                        </optgroup>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Primary generate / regenerate button */}
              <div className={`flex items-center justify-center ${!showOutline ? "pt-2" : "pt-4"}`}>
                <button
                  type="submit"
                  disabled={!formData.description.trim() || isStreaming}
                  title={
                    isSamePrompt
                      ? t.regenerateOutlineBtn
                      : t.generateOutlineBtn
                  }
                  className="w-full sm:w-auto px-10 py-3 rounded-xl bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white font-semibold shadow-lg transition-all hover:opacity-90 hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm"
                >
                  {isStreaming ? (
                    mode === "scratch" ? t.creatingDots : isSamePrompt ? t.regeneratingDots : t.generatingDots
                  ) : (
                    mode === "ai" ? (isSamePrompt ? t.regenerateOutlineBtn : t.generateOutlineBtn) :
                      mode === "docs" ? t.transformToPresentation :
                        mode === "scratch" ? t.createPresentation : t.createPresentation
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
                        ? (t.generatingSlideOf || "Generating slide {current} of {total}...").replace('{current}', String(streamState.currentSlideIndex + 1)).replace('{total}', String(streamState.totalSlides))
                        : (t.preparingToGenerate || "Preparing to generate {total} slides...").replace('{total}', String(streamState.totalSlides))}
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
                  <div className={`mt-6 mb-[60px] rounded-xl border border-slate-200 bg-white/95 backdrop-blur-sm px-4 py-4 shadow-sm ${isModelDropdownOpen ? 'relative z-[50]' : ''}`}>
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
                          const hasBackgroundImage = !!(theme.previewBackgroundImage || theme.backgroundImage);
                          const bgImageUrl = theme.previewBackgroundImage || theme.backgroundImage;
                          // For custom themes, use the background color from colors, not preview.titleBg (which might be a URL)
                          const previewBgColor = hasBackgroundImage 
                            ? theme.colors.background 
                            : (typeof theme.preview.titleBg === 'string' && !theme.preview.titleBg.startsWith('url(') 
                                ? theme.preview.titleBg 
                                : theme.colors.background);
                          
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
                                    backgroundColor: previewBgColor,
                                    backgroundImage: hasBackgroundImage
                                      ? `url(${bgImageUrl})`
                                      : theme.slideStyles.title.pattern || "none",
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                  }}
                                >
                                  {/* Lighter overlay for background images */}
                                  {hasBackgroundImage && (
                                    <div
                                      className="absolute inset-0"
                                      style={{ background: "rgba(0,0,0,0.25)" }}
                                    />
                                  )}
                                  
                                  {/* Content box centered on background with inline preview */}
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div
                                      className={`rounded backdrop-blur-sm transition-all duration-300 flex flex-col justify-center px-2 py-1.5 overflow-hidden ${
                                        hasBackgroundImage ? "w-[70%] h-[60%]" : "w-[85%] h-[75%]"
                                      }`}
                                      style={{
                                        backgroundColor: hasBackgroundImage
                                          ? `${theme.cardBox?.background || theme.colors.background}e8`
                                          : theme.cardBox?.background || "rgba(255, 255, 255, 0.95)",
                                        border: theme.cardBox?.borderColor ? `1px solid ${theme.cardBox.borderColor}` : "none",
                                        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.12)",
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
                        <>
                          {/* AI Model Selection - Gamma Style Custom Dropdown */}
                          <p className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                            AI image model
                          </p>
                          <div className="relative mb-4 z-[100]">
                            {/* Selected Model Button */}
                            <button
                              type="button"
                              onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                              className="w-full flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
                            >
                              <div className="flex items-center gap-2">
                                <Sparkles size={16} className="text-violet-500" />
                                <span className="font-medium">
                                  {formData.imageModel === "gemini-2.5-flash-image" && "Nano Banana"}
                                  {formData.imageModel === "gemini-3-pro-image-preview" && "Nano Banana Pro"}
                                  {formData.imageModel === "imagen-4.0-fast-generate-001" && "Imagen 4 Fast"}
                                  {formData.imageModel === "imagen-4.0-generate-001" && "Imagen 4"}
                                  {formData.imageModel === "imagen-4.0-ultra-generate-001" && "Imagen 4 Ultra"}
                                  {formData.imageModel === "gpt-image-1.5" && "GPT Image 1.5"}
                                  {formData.imageModel === "gpt-image-1" && "GPT Image 1"}
                                  {formData.imageModel === "gpt-image-1-mini" && "GPT Image Mini"}
                                  {formData.imageModel === "openai" && "DALL-E 3"}
                                  {formData.imageModel === "openai-hd" && "DALL-E 3 HD"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500">
                                  {formData.imageModel === "gemini-2.5-flash-image" && CREDIT_COSTS.GEMINI_FLASH}
                                  {formData.imageModel === "gemini-3-pro-image-preview" && CREDIT_COSTS.GEMINI_PRO}
                                  {formData.imageModel === "imagen-4.0-fast-generate-001" && CREDIT_COSTS.IMAGEN_4_FAST}
                                  {formData.imageModel === "imagen-4.0-generate-001" && CREDIT_COSTS.IMAGEN_4}
                                  {formData.imageModel === "imagen-4.0-ultra-generate-001" && CREDIT_COSTS.IMAGEN_4_ULTRA}
                                  {formData.imageModel === "gpt-image-1.5" && CREDIT_COSTS.GPT_IMAGE_DETAILED}
                                  {formData.imageModel === "gpt-image-1" && CREDIT_COSTS.GPT_IMAGE_DETAILED}
                                  {formData.imageModel === "gpt-image-1-mini" && CREDIT_COSTS.IMAGE_BASIC}
                                  {formData.imageModel === "openai" && CREDIT_COSTS.DALLE_STANDARD}
                                  {formData.imageModel === "openai-hd" && CREDIT_COSTS.DALLE_HD} ✦
                                </span>
                                <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isModelDropdownOpen ? "rotate-180" : ""}`} />
                              </div>
                            </button>

                            {/* Dropdown Menu - Fixed position to appear above sticky footer */}
                            {isModelDropdownOpen && (
                              <>
                                {/* Backdrop to close dropdown - covers entire screen */}
                                <div
                                  className="fixed inset-0 z-[9998] bg-transparent"
                                  onClick={() => setIsModelDropdownOpen(false)}
                                  onMouseDown={() => setIsModelDropdownOpen(false)}
                                />
                                <div 
                                  className="absolute bottom-full left-0 right-0 mb-1 bg-white rounded-xl border border-slate-200 shadow-2xl z-[9999] max-h-[400px] overflow-y-auto"
                                >
                                  {/* Basic Models - Free */}
                                  <div className="p-2 border-b border-slate-100">
                                    <div className="px-2 py-1.5 mb-1">
                                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{t.basicModels}</span>
                                    </div>
                                    {[
                                      { id: "gpt-image-1-mini", name: "GPT Image Mini", credits: CREDIT_COSTS.IMAGE_BASIC },
                                      { id: "gemini-2.5-flash-image", name: "Nano Banana", credits: CREDIT_COSTS.GEMINI_FLASH },
                                      { id: "imagen-4.0-fast-generate-001", name: "Imagen 4 Fast", credits: CREDIT_COSTS.IMAGEN_4_FAST },
                                    ].map((model) => (
                                      <button
                                        key={model.id}
                                        type="button"
                                        onClick={() => {
                                          handleChange("imageModel", model.id);
                                          setIsModelDropdownOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between px-2 py-2.5 rounded-lg text-left transition-colors ${
                                          formData.imageModel === model.id
                                            ? "bg-violet-50"
                                            : "hover:bg-slate-50"
                                        }`}
                                      >
                                        <div className="flex items-center gap-2.5">
                                          {formData.imageModel === model.id ? (
                                            <Check size={16} className="text-violet-600" />
                                          ) : (
                                            <Sparkles size={16} className="text-violet-500" />
                                          )}
                                          <span className={`text-sm ${formData.imageModel === model.id ? "font-medium text-violet-700" : "text-slate-700"}`}>{model.name}</span>
                                        </div>
                                        <span className="text-xs text-slate-400">{model.credits} ✦</span>
                                      </button>
                                    ))}
                                  </div>

                                  {/* Advanced Models - Plus */}
                                  <div className="p-2 border-b border-slate-100">
                                    <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
                                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{t.advancedModels}</span>
                                      <span className="text-[10px] font-semibold text-white bg-blue-500 px-1.5 py-0.5 rounded-full">PLUS</span>
                                    </div>
                                    {[
                                      { id: "gemini-3-pro-image-preview", name: "Nano Banana Pro", credits: CREDIT_COSTS.GEMINI_PRO, isNew: true },
                                      { id: "imagen-4.0-generate-001", name: "Imagen 4", credits: CREDIT_COSTS.IMAGEN_4 },
                                    ].map((model) => {
                                      const userPlan = subscriptionPlan?.toLowerCase() || "free";
                                      const hasAccess = userPlan === "plus" || userPlan === "pro" || userPlan === "ultra";
                                      const isLocked = !hasAccess;
                                      return (
                                        <button
                                          key={model.id}
                                          type="button"
                                          onClick={() => {
                                            if (isLocked) {
                                              setShowCreditWarning(true);
                                              setIsModelDropdownOpen(false);
                                              return;
                                            }
                                            handleChange("imageModel", model.id);
                                            setIsModelDropdownOpen(false);
                                          }}
                                          className={`w-full flex items-center justify-between px-2 py-2.5 rounded-lg text-left transition-colors ${
                                            formData.imageModel === model.id
                                              ? "bg-violet-50"
                                              : isLocked ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-50"
                                          }`}
                                        >
                                          <div className="flex items-center gap-2.5">
                                            {formData.imageModel === model.id ? (
                                              <Check size={16} className="text-violet-600" />
                                            ) : (
                                              <Sparkles size={16} className="text-violet-500" />
                                            )}
                                            <span className={`text-sm ${formData.imageModel === model.id ? "font-medium text-violet-700" : "text-slate-700"}`}>{model.name}</span>
                                            {model.isNew && (
                                              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">NEW</span>
                                            )}
                                            {isLocked && <Lock size={12} className="text-slate-400 ml-1" />}
                                          </div>
                                          <span className="text-xs text-slate-400">{model.credits} ✦</span>
                                        </button>
                                      );
                                    })}
                                  </div>

                                  {/* Premium Models - Pro */}
                                  <div className="p-2 border-b border-slate-100">
                                    <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
                                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{t.premiumModels}</span>
                                      <span className="text-[10px] font-semibold text-white bg-indigo-600 px-1.5 py-0.5 rounded-full">PRO</span>
                                    </div>
                                    {[
                                      { id: "openai", name: "DALL-E 3", credits: CREDIT_COSTS.DALLE_STANDARD },
                                    ].map((model) => {
                                      const userPlan = subscriptionPlan?.toLowerCase() || "free";
                                      const hasAccess = userPlan === "pro" || userPlan === "ultra";
                                      const isLocked = !hasAccess;
                                      return (
                                        <button
                                          key={model.id}
                                          type="button"
                                          onClick={() => {
                                            if (isLocked) {
                                              setShowCreditWarning(true);
                                              setIsModelDropdownOpen(false);
                                              return;
                                            }
                                            handleChange("imageModel", model.id);
                                            setIsModelDropdownOpen(false);
                                          }}
                                          className={`w-full flex items-center justify-between px-2 py-2.5 rounded-lg text-left transition-colors ${
                                            formData.imageModel === model.id
                                              ? "bg-violet-50"
                                              : isLocked ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-50"
                                          }`}
                                        >
                                          <div className="flex items-center gap-2.5">
                                            {formData.imageModel === model.id ? (
                                              <Check size={16} className="text-violet-600" />
                                            ) : (
                                              <svg className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.896zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08-4.778 2.758a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
                                              </svg>
                                            )}
                                            <span className={`text-sm ${formData.imageModel === model.id ? "font-medium text-violet-700" : "text-slate-700"}`}>{model.name}</span>
                                            {isLocked && <Lock size={12} className="text-slate-400 ml-1" />}
                                          </div>
                                          <span className="text-xs text-slate-400">{model.credits} ✦</span>
                                        </button>
                                      );
                                    })}
                                  </div>

                                  {/* Ultra Models */}
                                  <div className="p-2">
                                    <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
                                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Ultra models</span>
                                      <span className="text-[10px] font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-500 px-1.5 py-0.5 rounded-full">ULTRA</span>
                                    </div>
                                    {[
                                      { id: "imagen-4.0-ultra-generate-001", name: "Imagen 4 Ultra", credits: CREDIT_COSTS.IMAGEN_4_ULTRA },
                                      { id: "gpt-image-1.5", name: "GPT Image 1.5", credits: CREDIT_COSTS.GPT_IMAGE_DETAILED },
                                      { id: "gpt-image-1", name: "GPT Image 1", credits: CREDIT_COSTS.GPT_IMAGE_DETAILED },
                                      { id: "openai-hd", name: "DALL-E 3 HD", credits: CREDIT_COSTS.DALLE_HD },
                                    ].map((model) => {
                                      const userPlan = subscriptionPlan?.toLowerCase() || "free";
                                      const hasAccess = userPlan === "ultra";
                                      const isLocked = !hasAccess;
                                      return (
                                        <button
                                          key={model.id}
                                          type="button"
                                          onClick={() => {
                                            if (isLocked) {
                                              setShowCreditWarning(true);
                                              setIsModelDropdownOpen(false);
                                              return;
                                            }
                                            handleChange("imageModel", model.id);
                                            setIsModelDropdownOpen(false);
                                          }}
                                          className={`w-full flex items-center justify-between px-2 py-2.5 rounded-lg text-left transition-colors ${
                                            formData.imageModel === model.id
                                              ? "bg-violet-50"
                                              : isLocked ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-50"
                                          }`}
                                        >
                                          <div className="flex items-center gap-2.5">
                                            {formData.imageModel === model.id ? (
                                              <Check size={16} className="text-violet-600" />
                                            ) : (
                                              <Sparkles size={16} className="text-purple-500" />
                                            )}
                                            <span className={`text-sm ${formData.imageModel === model.id ? "font-medium text-violet-700" : "text-slate-700"}`}>{model.name}</span>
                                            {isLocked && <Lock size={12} className="text-slate-400 ml-1" />}
                                          </div>
                                          <span className="text-xs text-slate-400">{model.credits} ✦</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Image Art Style Selection (like Gamma) */}
                          <p className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                            Art Style
                          </p>
                          <div className="flex gap-2 mb-2 overflow-x-auto pb-1">
                            {[
                              { id: "illustration", label: "Illustration", image: "https://img.freepik.com/premium-vector/stylish-woman-wearing-sunglasses-blazer_999679-23054.jpg" },
                              { id: "photo", label: "Photo", image: "https://static.vecteezy.com/vite/assets/photo-masthead-375-BoK_p8LG.webp" },
                              { id: "3d", label: "3D", image: "https://www.sculpteo.com/wp-content/uploads/elementor/thumbs/dice-final-o8x1hxsg7y9mnjtmpd7pzj7cjzv8qseogaahdmgq20.png" },
                              { id: "line-art", label: "Line Art", image: "https://img.freepik.com/free-vector/abstract-waves-black-white-line-art-decoration-set-wallpaper-wall-art-design_79020-172.jpg" },
                              { id: "abstract", label: "Abstract", image: "https://russell-collection.com/wp-content/uploads/2025/04/abstract-art-examples.jpg" },
                              { id: "custom", label: "Custom", image: "/logo.png", isGrayscale: true, isLocal: true },
                            ].map((style) => (
                              <button
                                key={style.id}
                                type="button"
                                onClick={() => handleChange("imageArtStyle", style.id)}
                                className={`flex-shrink-0 flex flex-col items-center gap-1 transition-all ${
                                  formData.imageArtStyle === style.id
                                    ? "opacity-100"
                                    : "opacity-70 hover:opacity-100"
                                }`}
                              >
                                <div className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                                  formData.imageArtStyle === style.id
                                    ? "border-[#06b6d4] ring-2 ring-[#06b6d4]/30"
                                    : "border-slate-200 hover:border-slate-300"
                                }`}>
                                  <Image 
                                    src={style.image} 
                                    alt={style.label}
                                    width={64}
                                    height={64}
                                    className={`w-full h-full object-cover ${'isGrayscale' in style && style.isGrayscale ? 'grayscale' : ''}`}
                                    loading="lazy"
                                    unoptimized={'isLocal' in style && style.isLocal}
                                  />
                                  {formData.imageArtStyle === style.id && (
                                    <div className="absolute inset-0 bg-[#06b6d4]/20 flex items-end justify-start p-1">
                                      <Check size={12} className="text-[#06b6d4] bg-white rounded-full p-0.5" />
                                    </div>
                                  )}
                                </div>
                                <span className={`text-[10px] font-medium ${
                                  formData.imageArtStyle === style.id ? "text-[#06b6d4]" : "text-slate-600"
                                }`}>{style.label}</span>
                              </button>
                            ))}
                          </div>
                          
                          {/* Custom Art Style Text Input */}
                          {formData.imageArtStyle === "custom" && (
                            <div className="mb-4">
                              <input
                                type="text"
                                value={formData.customArtStyleText}
                                onChange={(e) => handleChange("customArtStyleText", e.target.value)}
                                placeholder="Describe your art style (e.g., watercolor, cyberpunk, minimalist flat design...)"
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/30 focus:border-[#06b6d4] transition-all"
                              />
                              <p className="text-[10px] text-slate-500 mt-1">
                                Be specific! E.g., &quot;vintage oil painting&quot;, &quot;anime style&quot;, &quot;neon cyberpunk&quot;, &quot;watercolor sketch&quot;
                              </p>
                            </div>
                          )}
                        </>
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
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-4">
              <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 shadow-lg border border-slate-200">
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    <span className="text-slate-500">{t.slidesCount}</span>
                    <strong className="text-[#1e3a8a]">
                      {slides.length || streamState.totalSlides || 0}
                    </strong>
                  </span>
                  <span className="hidden sm:inline text-slate-300">•</span>
                  <span className="hidden sm:flex items-center gap-1">
                    <span className="text-slate-500">{t.charactersCount}</span>
                    <strong className="text-[#1e3a8a]">
                      {totalCharacters.toLocaleString()}
                    </strong>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1">
                    <span className="text-slate-500">{t.creditsNeededLabel}</span>
                    <strong className="text-[#1e3a8a]">
                      {creditsNeededForPresentation}
                    </strong>
                  </span>
                  <span className="hidden sm:inline text-slate-300">•</span>
                  <span className="flex items-center gap-1">
                    <span className="text-slate-500">{t.creditsRemaining}:</span>
                    <strong
                      className={
                        hasEnoughCreditsForPresentation
                          ? "text-[#06b6d4]"
                          : "text-red-500"
                      }
                    >
                      {effectiveCredits}
                    </strong>
                  </span>
                  {!hasEnoughCreditsForPresentation && (
                    <span className="text-[11px] text-red-500">
                      {t.notEnoughCredits}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!hasEnoughCreditsForPresentation && (
                    <button
                      type="button"
                      onClick={() => setShowCreditWarning(true)}
                      className="px-3 py-1.5 rounded-lg border border-[#06b6d4] text-[#06b6d4] text-xs font-semibold hover:bg-cyan-50 transition-colors"
                    >
                      Upgrade / Buy credits
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleCreatePresentation}
                    disabled={
                      !isCompleted ||
                      slides.length === 0 ||
                      isCreatingPresentation ||
                      !hasEnoughCreditsForPresentation
                    }
                    className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white text-sm font-semibold shadow-md transition-all hover:opacity-90 hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
                  >
                    {isCreatingPresentation ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        <span className="hidden sm:inline">
                          {formData.imageSource === "stock-photos"
                            ? t.creatingDots
                            : t.creatingDots}
                        </span>
                        <span className="sm:hidden">{t.creatingDots}</span>
                      </>
                    ) : (
                      <>
                        <span className="hidden sm:inline">
                          {t.createPresentation}
                        </span>
                        <span className="sm:hidden">{t.createBtn}</span>
                      </>
                    )}
                  </button>
                </div>
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
          // Update quick-select themes: add new theme to front and keep 6 themes
          setQuickSelectThemes((prev) => {
            // If theme is already in the list, move it to the front
            if (prev.includes(themeId)) {
              return [themeId, ...prev.filter(id => id !== themeId)].slice(0, 6);
            }
            // Otherwise, add it to the front and keep 6 themes
            return [themeId, ...prev].slice(0, 6);
          });
        }}
      />
    </div >
  );
}

