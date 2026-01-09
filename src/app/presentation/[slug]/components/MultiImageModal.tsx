"use client";

import { useState } from "react";
import { X, ImagePlus, Trash2, CheckCircle2, Loader2, Settings2, Sparkles, Coins } from "lucide-react";
import { toast } from "sonner";
import type { Theme } from "~/lib/themes";
import type { SlideImage } from "~/components/presentation/types";
import { CREDIT_COSTS } from "~/lib/credits";
import { getModalColors } from "~/app/presentation/[slug]/components/ui-colors";

// AI Image model options with credit costs - matches CreatePresentationClient
const AI_IMAGE_MODELS = [
  { id: "gemini-2.5-flash-image", name: "Nano Banana (Gemini 2.5 Flash)", quality: "standard", model: "gemini-2.5-flash-image", credits: CREDIT_COSTS.GEMINI_IMAGEN },
  { id: "gemini-3-pro-image-preview", name: "Nano Banana Pro (Gemini 3 Pro)", quality: "hd", model: "gemini-3-pro-image-preview", credits: CREDIT_COSTS.GEMINI_IMAGEN_HD },
  { id: "imagen-4.0-generate-001", name: "Imagen 4", quality: "standard", model: "imagen-4.0-generate-001", credits: CREDIT_COSTS.GEMINI_IMAGEN },
  { id: "imagen-4.0-ultra-generate-001", name: "Imagen 4 Ultra", quality: "hd", model: "imagen-4.0-ultra-generate-001", credits: CREDIT_COSTS.IMAGE_HD },
  { id: "imagen-4.0-fast-generate-001", name: "Imagen 4 Fast", quality: "standard", model: "imagen-4.0-fast-generate-001", credits: CREDIT_COSTS.GEMINI_IMAGEN },
  { id: "openai-standard", name: "DALL-E 3", quality: "standard", model: "openai", credits: CREDIT_COSTS.IMAGE_BASIC },
  { id: "openai-hd", name: "DALL-E 3 HD", quality: "hd", model: "openai", credits: CREDIT_COSTS.IMAGE_HD },
];

type AIImageModel = typeof AI_IMAGE_MODELS[number];

interface MultiImageModalProps {
  images: SlideImage[];
  imageUrl: string;
  editingIndex: number | null;
  isLoading: boolean;
  theme: Theme;
  presentationId?: string;
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

  // Theme-aware colors using the helper
  const colors = getModalColors(theme);
  const isDark = colors.isDark;

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
            Manage Images {images.length > 0 && `(${images.length})`}
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
                Current Images{" "}
                <span className="text-xs font-normal opacity-70">
                  (drag to reorder)
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
                          title="Edit Image (Crop, Mask, Adjust)"
                        >
                          <Settings2 size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => onEditImage(idx)}
                        className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                        title="Replace URL"
                      >
                        <ImagePlus size={16} />
                      </button>
                      <button
                        onClick={() => onRemoveImage(idx)}
                        className="p-2 rounded-lg bg-red-500/80 hover:bg-red-500 text-white transition-colors"
                        title="Remove"
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
                  URL
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
                  AI Generate
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
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text }}
                >
                  Generate with AI
                </label>
                
                {/* Model Selection */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {AI_IMAGE_MODELS.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => setSelectedModel(model)}
                      className={`p-3 rounded-lg text-left transition-all ${
                        selectedModel.id === model.id ? "ring-2" : ""
                      }`}
                      style={{
                        backgroundColor: selectedModel.id === model.id 
                          ? `${theme.colors.primary}20` 
                          : colors.inputBg,
                        borderColor: selectedModel.id === model.id 
                          ? theme.colors.primary 
                          : colors.border,
                        border: `1px solid ${selectedModel.id === model.id ? theme.colors.primary : colors.border}`,
                        ["--tw-ring-color" as string]: theme.colors.primary,
                      } as React.CSSProperties}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium" style={{ color: colors.text }}>
                          {model.name}
                        </span>
                        <span 
                          className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                          style={{ 
                            backgroundColor: `${theme.colors.primary}20`,
                            color: theme.colors.primary,
                          }}
                        >
                          <Coins size={12} />
                          {model.credits}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Prompt Input */}
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Describe the image you want to generate..."
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
    </div>
  );
}
