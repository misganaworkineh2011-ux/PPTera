"use client";

import { useState } from "react";
import { X, ImagePlus, Trash2, CheckCircle2, Loader2, Settings2, Sparkles, Lock, ChevronDown, Check } from "lucide-react";
import { toast } from "sonner";
import type { Theme } from "~/lib/themes";
import type { SlideImage } from "~/components/presentation/types";
import { CREDIT_COSTS } from "~/lib/credits";
import { getModalColors } from "~/app/presentation/[slug]/components/ui-colors";
import PricingModal from "~/components/dashboard/PricingModal";
import { useLanguage } from "~/contexts/LanguageContext";
import { dashboardTranslations } from "~/lib/dashboard-translations";

// AI Image model options with credit costs - matches CreatePresentationClient
const AI_IMAGE_MODELS = [
  { id: "gpt-image-1-mini", name: "GPT Image Mini", quality: "standard", model: "gpt-image-1-mini", credits: CREDIT_COSTS.IMAGE_BASIC, tier: "basic" },
  { id: "gemini-2.5-flash-image", name: "Nano Banana", quality: "standard", model: "gemini-2.5-flash-image", credits: CREDIT_COSTS.GEMINI_FLASH, tier: "basic" },
  { id: "imagen-4.0-fast-generate-001", name: "Imagen 4 Fast", quality: "standard", model: "imagen-4.0-fast-generate-001", credits: CREDIT_COSTS.IMAGEN_4_FAST, tier: "basic" },
  { id: "gemini-3-pro-image-preview", name: "Nano Banana Pro", quality: "hd", model: "gemini-3-pro-image-preview", credits: CREDIT_COSTS.GEMINI_PRO, tier: "plus", isNew: true },
  { id: "imagen-4.0-generate-001", name: "Imagen 4", quality: "standard", model: "imagen-4.0-generate-001", credits: CREDIT_COSTS.IMAGEN_4, tier: "plus" },
  { id: "openai-standard", name: "DALL-E 3", quality: "standard", model: "openai", credits: CREDIT_COSTS.DALLE_STANDARD, tier: "pro" },
  { id: "imagen-4.0-ultra-generate-001", name: "Imagen 4 Ultra", quality: "hd", model: "imagen-4.0-ultra-generate-001", credits: CREDIT_COSTS.IMAGEN_4_ULTRA, tier: "ultra" },
  { id: "gpt-image-1.5", name: "GPT Image 1.5", quality: "hd", model: "gpt-image-1.5", credits: CREDIT_COSTS.GPT_IMAGE_DETAILED, tier: "ultra" },
  { id: "gpt-image-1", name: "GPT Image 1", quality: "hd", model: "gpt-image-1", credits: CREDIT_COSTS.GPT_IMAGE_DETAILED, tier: "ultra" },
  { id: "openai-hd", name: "DALL-E 3 HD", quality: "hd", model: "openai", credits: CREDIT_COSTS.DALLE_HD, tier: "ultra" },
];

type AIImageModel = typeof AI_IMAGE_MODELS[number];

interface MultiImageModalProps {
  images: SlideImage[];
  imageUrl: string;
  editingIndex: number | null;
  isLoading: boolean;
  theme: Theme;
  presentationId?: string;
  subscriptionPlan?: string | null;
  onUrlChange: (url: string) => void;
  onAddImage: () => void;
  onUpdateImage: (idx: number) => void;
  onRemoveImage: (idx: number) => void;
  onReorderImages: (from: number, to: number) => void;
  onEditImage: (idx: number) => void;
  onCancelEdit: () => void;
  onClose: () => void;
  onOpenWysiwygEditor?: (idx: number) => void;
  onAddGeneratedImage?: (url: string) => void;
}

export function MultiImageModal({
  images,
  imageUrl,
  editingIndex,
  isLoading,
  theme,
  presentationId,
  subscriptionPlan,
  onUrlChange,
  onAddImage,
  onUpdateImage,
  onRemoveImage,
  onReorderImages,
  onEditImage,
  onCancelEdit,
  onClose,
  onOpenWysiwygEditor,
  onAddGeneratedImage,
}: MultiImageModalProps) {
  const isEditing = editingIndex !== null;
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
  // AI Generation state
  const [activeTab, setActiveTab] = useState<"url" | "ai">("url");
  const [aiPrompt, setAiPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState<AIImageModel>(AI_IMAGE_MODELS[0]!);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPreview, setGeneratedPreview] = useState<string | null>(null);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);

  // User plan for model access
  const userPlan = subscriptionPlan?.toLowerCase() || "free";

  // Theme-aware colors using the helper
  const colors = getModalColors(theme);
  const isDark = colors.isDark;

  // Get translations
  const { language } = useLanguage();
  const t = dashboardTranslations[language] || dashboardTranslations.en;

  // Check if user has access to a model tier
  const hasAccessToTier = (tier: string) => {
    if (tier === "basic") return true;
    if (tier === "plus") return userPlan === "plus" || userPlan === "pro" || userPlan === "ultra";
    if (tier === "pro") return userPlan === "pro" || userPlan === "ultra";
    if (tier === "ultra") return userPlan === "ultra";
    return false;
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== toIndex) {
      onReorderImages(draggedIndex, toIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // AI Image generation handler
  const handleGenerateImage = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    setGeneratedPreview(null);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: aiPrompt,
          model: selectedModel.model,
          quality: selectedModel.quality,
          presentationId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          toast.error(`Insufficient credits. Need ${data.required}, have ${data.available}`);
        } else {
          toast.error(data.error || "Failed to generate image");
        }
        return;
      }

      // Upload to Cloudinary
      const cloudinaryResponse = await fetch("/api/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: data.image.url,
          presentationId,
        }),
      });

      const cloudinaryData = await cloudinaryResponse.json();
      
      if (cloudinaryResponse.ok && cloudinaryData.url) {
        setGeneratedPreview(cloudinaryData.url);
        toast.success(`Image generated! Used ${data.credits.used} credits`);
      } else {
        // Use original URL if Cloudinary upload fails
        setGeneratedPreview(data.image.url);
        toast.success(`Image generated! Used ${data.credits.used} credits`);
      }
    } catch (error) {
      console.error("Image generation error:", error);
      toast.error("Failed to generate image");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseGeneratedImage = () => {
    if (generatedPreview && onAddGeneratedImage) {
      onAddGeneratedImage(generatedPreview);
      setGeneratedPreview(null);
      setAiPrompt("");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl shadow-2xl"
        style={{
          background: colors.bg,
          border: `1px solid ${colors.border}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between p-4"
          style={{ borderBottom: `1px solid ${colors.border}` }}
        >
          <h3
            className="text-lg font-semibold"
            style={{ color: colors.text }}
          >
            {t.manageImages || "Manage Images"} {images.length > 0 && `(${images.length})`}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg transition-colors"
            style={{ color: colors.textMuted }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.hoverBg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Existing images grid with drag-and-drop */}
          {images.length > 0 && (
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text }}
              >
                {t.currentImages || "Current Images"}{" "}
                <span className="text-xs font-normal opacity-70">
                  ({t.dragToReorder || "drag to reorder"})
                </span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, idx)}
                    onDragEnd={handleDragEnd}
                    className={`relative group rounded-lg overflow-hidden cursor-grab active:cursor-grabbing transition-all ${
                      editingIndex === idx ? "ring-2" : ""
                    } ${draggedIndex === idx ? "opacity-50 scale-95" : ""} ${
                      dragOverIndex === idx ? "ring-2 ring-cyan-500 scale-105" : ""
                    }`}
                    style={{
                      border: `1px solid ${editingIndex === idx ? theme.colors.primary : colors.border}`,
                    }}
                  >
                    <div className="aspect-video">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt={img.alt}
                        className="w-full h-full object-cover pointer-events-none"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {onOpenWysiwygEditor && (
                        <button
                          onClick={() => onOpenWysiwygEditor(idx)}
                          className="p-2 rounded-lg bg-cyan-500/80 hover:bg-cyan-500 text-white transition-colors"
                          title={t.editImageCropMask || "Edit Image (Crop, Mask, Adjust)"}
                        >
                          <Settings2 size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => onEditImage(idx)}
                        className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                        title={t.replaceUrlBtn || "Replace URL"}
                      >
                        <ImagePlus size={16} />
                      </button>
                      <button
                        onClick={() => onRemoveImage(idx)}
                        className="p-2 rounded-lg bg-red-500/80 hover:bg-red-500 text-white transition-colors"
                        title={t.removeImageBtn || "Remove"}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div
                      className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-xs font-medium"
                      style={{
                        backgroundColor: isDark ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.9)",
                        color: colors.text,
                      }}
                    >
                      {idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add/Edit image form with tabs */}
          <div
            className="p-4 rounded-lg"
            style={{
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`,
            }}
          >
            {/* Tab buttons */}
            {!isEditing && (
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setActiveTab("url")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === "url" ? "text-white" : ""
                  }`}
                  style={{
                    backgroundColor: activeTab === "url" ? theme.colors.primary : "transparent",
                    color: activeTab === "url" ? "#ffffff" : colors.textMuted,
                    border: activeTab === "url" ? "none" : `1px solid ${colors.border}`,
                  }}
                >
                  <ImagePlus size={16} />
                  {t.addFromUrl || "URL"}
                </button>
                <button
                  onClick={() => setActiveTab("ai")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === "ai" ? "text-white" : ""
                  }`}
                  style={{
                    backgroundColor: activeTab === "ai" ? theme.colors.primary : "transparent",
                    color: activeTab === "ai" ? "#ffffff" : colors.textMuted,
                    border: activeTab === "ai" ? "none" : `1px solid ${colors.border}`,
                  }}
                >
                  <Sparkles size={16} />
                  {t.aiGenerate || "AI Generate"}
                </button>
              </div>
            )}

            {/* URL Tab Content */}
            {(activeTab === "url" || isEditing) && (
              <>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text }}
                >
                  {isEditing
                    ? `Edit Image ${editingIndex! + 1}`
                    : "Add from URL"}
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => onUrlChange(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-20"
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.text,
                    ["--tw-ring-color" as string]: theme.colors.primary,
                  } as React.CSSProperties}
                />
                <p
                  className="mt-2 text-xs"
                  style={{ color: colors.textMuted }}
                >
                  Paste a direct link to an image (JPG, PNG, WebP).
                </p>

                {imageUrl && (
                  <div 
                    className="mt-3 aspect-video rounded-lg overflow-hidden border border-dashed max-w-xs"
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}

                <div className="flex items-center gap-2 mt-3">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => onUpdateImage(editingIndex!)}
                        disabled={!imageUrl || isLoading}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-colors disabled:opacity-50"
                        style={{ backgroundColor: theme.colors.primary }}
                      >
                        {isLoading ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={16} />
                        )}
                        Update
                      </button>
                      <button
                        onClick={onCancelEdit}
                        className="px-4 py-2 rounded-lg transition-colors"
                        style={{ color: colors.textMuted }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = colors.hoverBg;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={onAddImage}
                      disabled={!imageUrl || isLoading}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-colors disabled:opacity-50"
                      style={{ backgroundColor: theme.colors.primary }}
                    >
                      {isLoading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <ImagePlus size={16} />
                      )}
                      Add Image
                    </button>
                  )}
                </div>
              </>
            )}

            {/* AI Generation Tab Content */}
            {activeTab === "ai" && !isEditing && (
              <>
                <label
                  className="block text-xs font-medium mb-2 uppercase tracking-wide"
                  style={{ color: colors.textMuted }}
                >
                  AI image model
                </label>
                
                {/* Model Selection - Gamma Style Dropdown */}
                <div className="relative mb-3">
                  <button
                    type="button"
                    onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                    className="w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm transition-all"
                    style={{
                      backgroundColor: colors.surface,
                      border: `1px solid ${colors.border}`,
                      color: colors.text,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-violet-500" />
                      <span className="font-medium">{selectedModel.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs" style={{ color: colors.textMuted }}>
                        {selectedModel.credits} ✦
                      </span>
                      <ChevronDown size={16} className={`transition-transform duration-200 ${isModelDropdownOpen ? "rotate-180" : ""}`} style={{ color: colors.textMuted }} />
                    </div>
                  </button>

                  {/* Dropdown Menu - Absolute position within relative container */}
                  {isModelDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-[9998]"
                        onClick={() => setIsModelDropdownOpen(false)}
                      />
                      <div 
                        className="absolute top-full left-0 right-0 mt-1 rounded-xl shadow-2xl z-[9999] max-h-[400px] overflow-y-auto"
                        style={{
                          backgroundColor: colors.bg,
                          border: `1px solid ${colors.border}`,
                        }}
                      >
                        {/* Basic Models */}
                        <div className="p-2" style={{ borderBottom: `1px solid ${colors.border}` }}>
                          <div className="px-2 py-1.5 mb-1">
                            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.textMuted }}>Basic models</span>
                          </div>
                          {AI_IMAGE_MODELS.filter(m => m.tier === "basic").map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => {
                                setSelectedModel(m);
                                setIsModelDropdownOpen(false);
                              }}
                              className="w-full flex items-center justify-between px-2 py-2.5 rounded-lg text-left transition-colors"
                              style={{
                                backgroundColor: selectedModel.id === m.id ? "rgba(139, 92, 246, 0.1)" : "transparent",
                              }}
                              onMouseEnter={(e) => {
                                if (selectedModel.id !== m.id) e.currentTarget.style.backgroundColor = colors.hoverBg;
                              }}
                              onMouseLeave={(e) => {
                                if (selectedModel.id !== m.id) e.currentTarget.style.backgroundColor = "transparent";
                              }}
                            >
                              <div className="flex items-center gap-2.5">
                                {selectedModel.id === m.id ? (
                                  <Check size={16} className="text-violet-600" />
                                ) : (
                                  <Sparkles size={16} className="text-violet-500" />
                                )}
                                <span className="text-sm" style={{ color: selectedModel.id === m.id ? "rgb(109, 40, 217)" : colors.text, fontWeight: selectedModel.id === m.id ? 500 : 400 }}>{m.name}</span>
                              </div>
                              <span className="text-xs" style={{ color: colors.textMuted }}>{m.credits} ✦</span>
                            </button>
                          ))}
                        </div>

                        {/* Advanced Models - Plus */}
                        <div className="p-2" style={{ borderBottom: `1px solid ${colors.border}` }}>
                          <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
                            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.textMuted }}>Advanced models</span>
                            <span className="text-[10px] font-semibold text-white bg-blue-500 px-1.5 py-0.5 rounded-full">PLUS</span>
                          </div>
                          {AI_IMAGE_MODELS.filter(m => m.tier === "plus").map((m) => {
                            const isLocked = !hasAccessToTier("plus");
                            return (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => {
                                  if (isLocked) {
                                    setShowPricingModal(true);
                                    setIsModelDropdownOpen(false);
                                    return;
                                  }
                                  setSelectedModel(m);
                                  setIsModelDropdownOpen(false);
                                }}
                                className="w-full flex items-center justify-between px-2 py-2.5 rounded-lg text-left transition-colors"
                                style={{
                                  backgroundColor: selectedModel.id === m.id ? "rgba(139, 92, 246, 0.1)" : "transparent",
                                  opacity: isLocked ? 0.5 : 1,
                                  cursor: isLocked ? "not-allowed" : "pointer",
                                }}
                              >
                                <div className="flex items-center gap-2.5">
                                  {selectedModel.id === m.id ? (
                                    <Check size={16} className="text-violet-600" />
                                  ) : (
                                    <Sparkles size={16} className="text-violet-500" />
                                  )}
                                  <span className="text-sm" style={{ color: selectedModel.id === m.id ? "rgb(109, 40, 217)" : colors.text, fontWeight: selectedModel.id === m.id ? 500 : 400 }}>{m.name}</span>
                                  {m.isNew && (
                                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">NEW</span>
                                  )}
                                  {isLocked && <Lock size={12} className="ml-1" style={{ color: colors.textMuted }} />}
                                </div>
                                <span className="text-xs" style={{ color: colors.textMuted }}>{m.credits} ✦</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Premium Models - Pro */}
                        <div className="p-2" style={{ borderBottom: `1px solid ${colors.border}` }}>
                          <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
                            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.textMuted }}>Premium models</span>
                            <span className="text-[10px] font-semibold text-white bg-indigo-600 px-1.5 py-0.5 rounded-full">PRO</span>
                          </div>
                          {AI_IMAGE_MODELS.filter(m => m.tier === "pro").map((m) => {
                            const isLocked = !hasAccessToTier("pro");
                            return (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => {
                                  if (isLocked) {
                                    setShowPricingModal(true);
                                    setIsModelDropdownOpen(false);
                                    return;
                                  }
                                  setSelectedModel(m);
                                  setIsModelDropdownOpen(false);
                                }}
                                className="w-full flex items-center justify-between px-2 py-2.5 rounded-lg text-left transition-colors"
                                style={{
                                  backgroundColor: selectedModel.id === m.id ? "rgba(139, 92, 246, 0.1)" : "transparent",
                                  opacity: isLocked ? 0.5 : 1,
                                  cursor: isLocked ? "not-allowed" : "pointer",
                                }}
                              >
                                <div className="flex items-center gap-2.5">
                                  {selectedModel.id === m.id ? (
                                    <Check size={16} className="text-violet-600" />
                                  ) : (
                                    <svg className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="currentColor">
                                      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.896zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08-4.778 2.758a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
                                    </svg>
                                  )}
                                  <span className="text-sm" style={{ color: selectedModel.id === m.id ? "rgb(109, 40, 217)" : colors.text, fontWeight: selectedModel.id === m.id ? 500 : 400 }}>{m.name}</span>
                                  {isLocked && <Lock size={12} className="ml-1" style={{ color: colors.textMuted }} />}
                                </div>
                                <span className="text-xs" style={{ color: colors.textMuted }}>{m.credits} ✦</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Ultra Models */}
                        <div className="p-2">
                          <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
                            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.textMuted }}>Ultra models</span>
                            <span className="text-[10px] font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-500 px-1.5 py-0.5 rounded-full">ULTRA</span>
                          </div>
                          {AI_IMAGE_MODELS.filter(m => m.tier === "ultra").map((m) => {
                            const isLocked = !hasAccessToTier("ultra");
                            return (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => {
                                  if (isLocked) {
                                    setShowPricingModal(true);
                                    setIsModelDropdownOpen(false);
                                    return;
                                  }
                                  setSelectedModel(m);
                                  setIsModelDropdownOpen(false);
                                }}
                                className="w-full flex items-center justify-between px-2 py-2.5 rounded-lg text-left transition-colors"
                                style={{
                                  backgroundColor: selectedModel.id === m.id ? "rgba(139, 92, 246, 0.1)" : "transparent",
                                  opacity: isLocked ? 0.5 : 1,
                                  cursor: isLocked ? "not-allowed" : "pointer",
                                }}
                              >
                                <div className="flex items-center gap-2.5">
                                  {selectedModel.id === m.id ? (
                                    <Check size={16} className="text-violet-600" />
                                  ) : (
                                    <Sparkles size={16} className="text-purple-500" />
                                  )}
                                  <span className="text-sm" style={{ color: selectedModel.id === m.id ? "rgb(109, 40, 217)" : colors.text, fontWeight: selectedModel.id === m.id ? 500 : 400 }}>{m.name}</span>
                                  {isLocked && <Lock size={12} className="ml-1" style={{ color: colors.textMuted }} />}
                                </div>
                                <span className="text-xs" style={{ color: colors.textMuted }}>{m.credits} ✦</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Prompt Input */}
                <label
                  className="block text-xs font-medium mb-2 uppercase tracking-wide"
                  style={{ color: colors.textMuted }}
                >
                  Describe your image
                </label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="A professional business presentation background with abstract shapes..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-20 resize-none"
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.text,
                    ["--tw-ring-color" as string]: theme.colors.primary,
                  } as React.CSSProperties}
                />

                {/* Generated Preview */}
                {generatedPreview && (
                  <div className="mt-3">
                    <div 
                      className="aspect-video rounded-lg overflow-hidden border max-w-xs"
                      style={{ borderColor: colors.border }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={generatedPreview}
                        alt="Generated"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2 mt-3">
                  {generatedPreview ? (
                    <>
                      <button
                        onClick={handleUseGeneratedImage}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-colors"
                        style={{ backgroundColor: theme.colors.primary }}
                      >
                        <CheckCircle2 size={16} />
                        Use Image
                      </button>
                      <button
                        onClick={handleGenerateImage}
                        disabled={!aiPrompt.trim() || isGenerating}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                        style={{ 
                          color: colors.text,
                          border: `1px solid ${colors.border}`,
                        }}
                      >
                        {isGenerating ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Sparkles size={16} />
                        )}
                        Regenerate
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleGenerateImage}
                      disabled={!aiPrompt.trim() || isGenerating}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-colors disabled:opacity-50"
                      style={{ backgroundColor: theme.colors.primary }}
                    >
                      {isGenerating ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Sparkles size={16} />
                      )}
                      Generate ({selectedModel.credits} credits)
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div
          className="flex items-center justify-end p-4"
          style={{ borderTop: `1px solid ${colors.border}` }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{ color: colors.textMuted }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.hoverBg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            Done
          </button>
        </div>
      </div>

      {/* Pricing Modal */}
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        currentPlan={subscriptionPlan}
      />
    </div>
  );
}
