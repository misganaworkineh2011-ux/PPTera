"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, GripVertical, Trash2, Edit3, Check, X } from "lucide-react";
import { useOutlineStream, type Slide, type OutlineMetadata } from "~/lib/dashboard/hooks/useOutlineStream";
import { themes, getThemeById } from "~/lib/themes";
import ThemeSelector from "~/components/ThemeSelector";

interface ExistingOutline {
  id: string;
  slides: Slide[];
  metadata: OutlineMetadata;
  status: string;
}

interface CreatePresentationClientProps {
  maxSlides: number;
  subscriptionPlan?: string | null;
  mode: string;
  existingOutline?: ExistingOutline;
}

// Define all slide options by plan
const getAllSlideOptions = (userPlan: string | null | undefined) => {
  const userPlanLower = userPlan?.toLowerCase() || "free";

  const options: Array<{ value: number; label: string; plan: string; isGroupHeader?: boolean; disabled?: boolean }> = [];

  const hasFree = true;
  const hasStarter = userPlanLower !== "free";
  const hasPro = userPlanLower === "pro" || userPlanLower === "enterprise";
  const hasEnterprise = userPlanLower === "enterprise";

  options.push({ value: -1, label: "Free Plan: 1-10 slides", plan: "Free", isGroupHeader: true, disabled: false });
  for (let i = 1; i <= 10; i++) {
    options.push({ value: i, label: `${i} ${i === 1 ? "slide" : "slides"}`, plan: "Free", disabled: false });
  }

  options.push({ value: -2, label: "Starter Plan: 15, 20 slides", plan: "Starter", isGroupHeader: true, disabled: false });
  options.push({ value: 15, label: "15 slides", plan: "Starter", disabled: !hasStarter });
  options.push({ value: 20, label: "20 slides", plan: "Starter", disabled: !hasStarter });

  options.push({ value: -3, label: "Pro Plan: 25, 30, 40, 50 slides", plan: "Pro", isGroupHeader: true, disabled: false });
  options.push({ value: 25, label: "25 slides", plan: "Pro", disabled: !hasPro });
  options.push({ value: 30, label: "30 slides", plan: "Pro", disabled: !hasPro });
  options.push({ value: 40, label: "40 slides", plan: "Pro", disabled: !hasPro });
  options.push({ value: 50, label: "50 slides", plan: "Pro", disabled: !hasPro });

  options.push({ value: -4, label: "Enterprise Plan: 60, 70 slides", plan: "Enterprise", isGroupHeader: true, disabled: false });
  options.push({ value: 60, label: "60 slides", plan: "Enterprise", disabled: !hasEnterprise });
  options.push({ value: 70, label: "70 slides", plan: "Enterprise", disabled: !hasEnterprise });

  return options;
};

// Skeleton Card Component
function SkeletonCard({ index }: { index: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm p-5 shadow-sm animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-200">
          <span className="text-xs font-bold text-slate-400">{index + 1}</span>
        </div>
        <div className="h-5 bg-slate-200 rounded flex-1" />
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-slate-100 rounded w-full" />
        <div className="h-3 bg-slate-100 rounded w-5/6" />
        <div className="h-3 bg-slate-100 rounded w-4/6" />
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
      className={`rounded-xl border bg-white/90 backdrop-blur-sm p-5 shadow-sm transition-all ${
        isDraggedOver ? "border-[#06b6d4] ring-2 ring-[#06b6d4]/20" : "border-slate-200 hover:border-[#06b6d4]/50"
      } ${isTitle ? "bg-gradient-to-br from-[#1e3a8a]/5 to-[#06b6d4]/5" : ""}`}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        {!isTitle && !isStreaming && (
          <div className="cursor-grab text-slate-300 hover:text-slate-500 mt-1">
            <GripVertical size={18} />
          </div>
        )}

        {/* Slide Number */}
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
            isTitle
              ? "bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] text-white"
              : "bg-[#1e3a8a]/10 text-[#1e3a8a]"
          }`}
        >
          <span className="text-xs font-bold">{index + 1}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-[#1e3a8a] focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20"
              />
              {!isTitle && (
                <textarea
                  value={editedBullets}
                  onChange={(e) => setEditedBullets(e.target.value)}
                  rows={4}
                  placeholder="One bullet point per line..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20 resize-none"
                />
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#06b6d4] text-white text-xs font-medium hover:bg-[#0891b2]"
                >
                  <Check size={14} /> Save
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200"
                >
                  <X size={14} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h3 className="font-semibold text-[#1e3a8a] mb-2 leading-tight">{slide.title}</h3>
              {isTitle && slide.subtitle && (
                <p className="text-sm text-slate-500 italic">{slide.subtitle}</p>
              )}
              {!isTitle && slide.bulletPoints && (
                <ul className="space-y-1 list-disc list-inside marker:text-[#06b6d4] text-sm text-slate-700">
                  {slide.bulletPoints.map((bullet, i) => (
                    <li key={i} className="leading-snug">
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        {!isStreaming && !isEditing && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#06b6d4] hover:bg-[#06b6d4]/10"
            >
              <Edit3 size={14} />
            </button>
            {canDelete && !isTitle && (
              <button
                onClick={() => onDelete && onDelete(index)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50"
              >
                <Trash2 size={14} />
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
  mode,
  existingOutline,
}: CreatePresentationClientProps) {
  const router = useRouter();
  const { state: streamState, startStream, cancel, reset } = useOutlineStream();

  // View state: 'form' | 'streaming' | 'completed'
  const [view, setView] = useState<"form" | "streaming" | "completed">(
    existingOutline ? "completed" : "form"
  );

  // Form data
  const [formData, setFormData] = useState({
    description: existingOutline?.metadata.topic || "",
    numberOfSlides: existingOutline?.metadata.totalSlides || Math.min(10, maxSlides),
    tone: existingOutline?.metadata.tone || "professional",
    language: existingOutline?.metadata.language || "english",
    theme: "corporate-professional",
    imageSource: "no-images",
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

  const allSlideOptions = getAllSlideOptions(subscriptionPlan);

  // Update view based on stream state
  useEffect(() => {
    if (streamState.status === "streaming" || streamState.status === "connecting") {
      setView("streaming");
    } else if (streamState.status === "completed") {
      setView("completed");
      setSlides(streamState.slides);
      setOutlineId(streamState.outlineId);
    }
  }, [streamState.status, streamState.slides, streamState.outlineId]);

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

    // Determine which outline ID to use (reuse existing when present)
    const idForStream = outlineId || existingOutline?.id || null;

    // Remember the prompt we are generating from (for button label logic)
    setLastDescription(trimmed);

    // Reset previous outline state visually and start a new stream
    reset();
    setView("streaming");
    setSlides([]);
    setOutlineId(idForStream);

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
      const response = await fetch("/api/create-presentation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          outlineId: outlineId || existingOutline?.id,
          slides: slides,
          theme: formData.theme,
          imageSource: formData.imageSource,
          metadata: {
            topic: formData.description || existingOutline?.metadata?.topic || "Presentation",
            totalSlides: slides.length,
            tone: formData.tone,
            language: formData.language,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create presentation");
      }

      // Redirect to the presentation page
      router.push(data.redirectUrl);
    } catch (error) {
      console.error("Error creating presentation:", error);
      setIsCreatingPresentation(false);
      // You could add a toast notification here
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

  const isStreaming = view === "streaming";
  const isCompleted = view === "completed";
  const showOutline = isStreaming || isCompleted;

  const normalizedCurrent = formData.description.trim();
  const normalizedLast = lastDescription.trim();
  const isSamePrompt = normalizedCurrent !== "" && normalizedCurrent === normalizedLast;

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Load Google Fonts */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;700&family=Outfit:wght@400;700&family=Playfair+Display:wght@400;700&family=Plus+Jakarta+Sans:wght@400;500;700&display=swap');
      `}</style>

      {/* Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `linear-gradient(to bottom, #ecfdf5 0%, #e6fcf5 15%, #d1fae5 30%, #b2f5ea 45%, #81e6d9 55%, #5eead4 60%, #b2f5ea 75%, #d1fae5 85%, #ecfdf5 100%)`,
        }}
      />

      {/* Reflection Effect */}
      <div
        className="absolute top-0 right-0 w-full h-full z-0"
        style={{
          background: `
            linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.4) 15%, transparent 40%),
            linear-gradient(120deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.3) 20%, transparent 50%),
            linear-gradient(150deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 25%, transparent 60%)
          `,
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

        {/* Form Section - Compact when streaming/completed */}
        <div className={`px-8 ${showOutline ? "pb-4" : "pb-12"}`}>
          <div className={`mx-auto ${showOutline ? "max-w-6xl" : "max-w-3xl"}`}>
            {!showOutline && (
              <div className="flex flex-col items-center justify-center mb-8">
                <h1 className="text-4xl font-bold tracking-tight text-[#1e3a8a] mb-3">
                  New Presentation
                </h1>
                <p className="text-slate-600 text-center">Configure your presentation settings</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Description - Compact when streaming */}
              <div className={showOutline ? "flex items-start gap-4" : ""}>
                <div className={showOutline ? "flex-1" : ""}>
                  {!showOutline && (
                    <label htmlFor="description" className="block text-sm font-semibold text-[#1e3a8a] mb-3">
                      What to Create
                    </label>
                  )}
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Define what you want to create in one sentence or more..."
                    rows={showOutline ? 2 : 4}
                    disabled={isStreaming}
                    className={`w-full rounded-xl border border-slate-200 bg-white px-5 py-3 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20 focus:border-[#06b6d4] transition-all resize-none shadow-sm ${
                      isStreaming ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                    required
                  />
                </div>

                {/* Inline controls when streaming/completed */}
                {showOutline && (
                  <div className="flex items-center gap-3 shrink-0">
                    <select
                      value={formData.numberOfSlides}
                      disabled={isStreaming}
                      onChange={(e) => handleChange("numberOfSlides", parseInt(e.target.value))}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20 disabled:opacity-60"
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
                      className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20 disabled:opacity-60"
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
                      className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20 disabled:opacity-60"
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
                  <p className="text-xs text-slate-500 -mt-4">
                    Describe your presentation idea, topics to cover, main message, or any specific requirements.
                  </p>

                  {/* Number of Slides */}
                  <div>
                    <div className="relative">
                      <select
                        id="slides"
                        value={formData.numberOfSlides}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (value > 0 && !allSlideOptions.find((opt) => opt.value === value)?.disabled) {
                            handleChange("numberOfSlides", value);
                          }
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-white px-5 py-4 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20 focus:border-[#06b6d4] transition-all shadow-sm appearance-none cursor-pointer"
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
                          const lockIcon = option.disabled ? "🔒" : "";
                          const displayLabel = planLabel
                            ? `${option.label}${spaces}${planLabel} ${lockIcon}`.trim()
                            : option.label;

                          return (
                            <option
                              key={option.value}
                              value={option.value}
                              disabled={option.disabled}
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
                  className="px-12 py-3 rounded-xl bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white font-semibold shadow-lg transition-all hover:opacity-90 hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isStreaming
                    ? isSamePrompt
                      ? "Regenerating…"
                      : "Generating…"
                    : isSamePrompt
                    ? "Regenerate outline"
                    : "Generate outline"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Error Message */}
        {streamState.error && (
          <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm max-w-6xl mx-auto">
            {streamState.error}
            <button
              onClick={handleStartOver}
              className="ml-4 underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Outline Section */}
        {showOutline && (
          <div className={`flex-1 px-8 ${isCompleted ? "pb-[140px]" : "pb-12"}`}>
            <div className="mx-auto max-w-6xl">
              {/* Simple status text above slides */}
              {isStreaming && (
                <div className="mb-4 text-sm text-[#06b6d4] flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  <span>
                    Generating slide {streamState.currentSlideIndex + 1} of {streamState.totalSlides}...
                  </span>
                </div>
              )}

              {/* Slides List - vertical */}
              <div className="space-y-4" onDragEnd={handleDragEnd}>
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

              {/* Presentation style box – used when creating slides from this outline */}
              {isCompleted && (
                <div className="mt-6 mb-[60px] rounded-2xl border border-slate-200 bg-white/90 px-5 py-5 shadow-sm">
                  {/* Theme Selection */}
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                        Select Theme
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsThemeSelectorOpen(true)}
                        className="text-xs font-medium text-[#06b6d4] hover:text-[#0891b2] transition-colors"
                      >
                        View more →
                      </button>
                    </div>
                    
                    {/* Popular Themes Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {themes.slice(0, 2).map((theme) => {
                        const isSelected = formData.theme === theme.id;
                        return (
                          <button
                            key={theme.id}
                            type="button"
                            onClick={() => handleChange("theme", theme.id)}
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

                  {/* Image Style Selection */}
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                      Image Style
                    </p>
                    <select
                      id="imageSource-outline"
                      value={formData.imageSource}
                      onChange={(e) => handleChange("imageSource", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20 focus:border-[#06b6d4] transition-all"
                    >
                      <option value="no-images">No Images (Text-Only Slides)</option>
                      <option value="placeholders">Image Placeholders (Edit Later)</option>
                      <option value="ai-generated">AI-Generated Images</option>
                      <option value="stock-photos">Stock Photos (Pexels)</option>
                      <option value="illustrations">Illustrations (Pictographic Style)</option>
                      <option value="web-images">Web Images (Public Search)</option>
                    </select>
                  </div>

                  <p className="mt-4 text-[11px] text-slate-500">
                    These options won&apos;t change the outline – they&apos;ll be used when you{" "}
                    <span className="font-semibold text-[#0f766e]">create the actual presentation</span> from these slides.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom sticky stats & action bar (only when outline is ready) */}
      {isCompleted && (
        <div className="fixed inset-x-0 bottom-0 z-20">
          <div className="mx-auto max-w-6xl px-6 pb-4">
            <div className="flex items-center justify-between rounded-2xl bg-white/95 px-4 py-3 shadow-lg border border-slate-200 backdrop-blur-sm">
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-700">
                <span>
                  Slides:{" "}
                  <strong>{slides.length || streamState.totalSlides || 0}</strong>
                </span>
                <span>
                  Characters:{" "}
                  <strong>{totalCharacters.toLocaleString()}</strong>
                </span>
                {streamState.creditsRemaining !== null && (
                  <span>
                    Credits left:{" "}
                    <strong>{streamState.creditsRemaining}</strong>
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleCreatePresentation}
                disabled={!isCompleted || slides.length === 0 || isCreatingPresentation}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white text-sm font-semibold shadow-md transition hover:opacity-90 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isCreatingPresentation ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {formData.imageSource === "stock-photos" ? "Fetching Images..." : "Creating..."}
                  </>
                ) : (
                  "Create Presentation"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Theme Selector Modal */}
      <ThemeSelector
        isOpen={isThemeSelectorOpen}
        onClose={() => setIsThemeSelectorOpen(false)}
        selectedThemeId={formData.theme}
        onSelectTheme={(themeId) => {
          handleChange("theme", themeId);
        }}
      />
    </div>
  );
}

