"use client";

import { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Loader2,
  Download,
  Copy,
  Check,
  AlertCircle,
  Wand2,
  Zap,
  Lock,
  ChevronDown,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { CREDIT_COSTS } from "~/lib/credits";
import PricingModal from "~/components/dashboard/PricingModal";

interface AIImageGeneratorProps {
  onImageGenerated?: (imageUrl: string) => void;
  presentationId?: string;
  className?: string;
  compact?: boolean;
  subscriptionPlan?: string | null;
}

type ImageModel =
  | "gemini-2.0-flash-exp"
  | "gemini-2.5-flash-image"
  | "gemini-3-pro-image-preview"
  | "imagen-4.0-generate-001"
  | "imagen-4.0-ultra-generate-001"
  | "imagen-4.0-fast-generate-001";
type ImageQuality = "standard" | "hd";
type ImageSize = "1024x1024" | "1792x1024" | "1024x1792";
type ImageStyle = "vivid" | "natural";

const MODEL_INFO: Record<
  ImageModel,
  { name: string; description: string; standardCredits: number; hdCredits: number }
> = {
  "gemini-2.0-flash-exp": {
    name: "Gemini 2.0 Flash",
    description: "Budget-friendly, fast generation",
    standardCredits: CREDIT_COSTS.IMAGE_BASIC,
    hdCredits: CREDIT_COSTS.IMAGE_BASIC,
  },
  "gemini-2.5-flash-image": {
    name: "Nano Banana",
    description: "Fast, efficient generation",
    standardCredits: CREDIT_COSTS.GEMINI_FLASH,
    hdCredits: CREDIT_COSTS.GEMINI_FLASH_HD,
  },
  "gemini-3-pro-image-preview": {
    name: "Nano Banana Pro",
    description: "Higher quality Gemini images",
    standardCredits: CREDIT_COSTS.GEMINI_PRO,
    hdCredits: CREDIT_COSTS.GEMINI_PRO_HD,
  },
  "imagen-4.0-generate-001": {
    name: "Imagen 4",
    description: "Google's latest image model",
    standardCredits: CREDIT_COSTS.IMAGEN_4,
    hdCredits: CREDIT_COSTS.IMAGEN_4_ULTRA,
  },
  "imagen-4.0-ultra-generate-001": {
    name: "Imagen 4 Ultra",
    description: "Highest quality Imagen",
    standardCredits: CREDIT_COSTS.IMAGEN_4_ULTRA,
    hdCredits: CREDIT_COSTS.IMAGEN_4_ULTRA,
  },
  "imagen-4.0-fast-generate-001": {
    name: "Imagen 4 Fast",
    description: "Quick generation, good quality",
    standardCredits: CREDIT_COSTS.IMAGEN_4_FAST,
    hdCredits: CREDIT_COSTS.IMAGEN_4_FAST,
  },
};

export default function AIImageGenerator({
  onImageGenerated,
  presentationId,
  className,
  compact = false,
  subscriptionPlan,
}: AIImageGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState<ImageModel>("gemini-2.5-flash-image");
  const [quality, setQuality] = useState<ImageQuality>("standard");
  const [size, setSize] = useState<ImageSize>("1024x1024");
  const [style, setStyle] = useState<ImageStyle>("vivid");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<{
    url: string;
    revisedPrompt?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [creditsUsed, setCreditsUsed] = useState<number | null>(null);

  const userPlan = subscriptionPlan?.toLowerCase() || "free";
  const isFreeUser = userPlan === "free";
  const modelInfo = MODEL_INFO[model];
  const creditCost = quality === "hd" ? modelInfo.hdCredits : modelInfo.standardCredits;

  // Block free users from accessing AI image generation
  if (isFreeUser) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-900 dark:to-neutral-800 rounded-xl border-2 border-dashed border-slate-200 dark:border-neutral-700">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            AI Image Generation
          </h3>
          <p className="text-sm text-slate-600 dark:text-neutral-400 text-center mb-4 max-w-md">
            Upgrade to Plus, Pro, or Ultra to generate AI images with Google Gemini and Imagen models.
          </p>
          <button
            onClick={() => setShowPricingModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white rounded-xl font-semibold hover:opacity-90 transition"
          >
            <Sparkles className="w-5 h-5" />
            Upgrade Now
          </button>
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

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a description for your image");
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          model,
          quality,
          size,
          style,
          presentationId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to generate image");
      }

      setGeneratedImage({
        url: data.image.url,
        revisedPrompt: data.image.revisedPrompt,
      });
      setCreditsUsed(data.credits.used);

      if (onImageGenerated) {
        onImageGenerated(data.image.url);
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to generate image";
      // Check if it's a credit-related error
      if (errorMessage.toLowerCase().includes("credit") || errorMessage.toLowerCase().includes("insufficient")) {
        setShowPricingModal(true);
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = async () => {
    if (generatedImage?.url) {
      await navigator.clipboard.writeText(generatedImage.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (generatedImage?.url) {
      const link = document.createElement("a");
      link.href = generatedImage.url;
      link.download = `ai-image-${Date.now()}.png`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const sizeOptions: { value: ImageSize; label: string; aspect: string }[] = [
    { value: "1024x1024", label: "Square", aspect: "1:1" },
    { value: "1792x1024", label: "Landscape", aspect: "16:9" },
    { value: "1024x1792", label: "Portrait", aspect: "9:16" },
  ];

  const promptSuggestions = [
    "A modern office with glass walls and city skyline view",
    "Abstract geometric shapes in blue and purple gradient",
    "Professional team meeting in a bright conference room",
  ];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Prompt Input */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Describe your image
        </label>
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A professional business presentation background with abstract blue shapes..."
            className="w-full h-24 px-4 py-3 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#06b6d4] focus:border-transparent resize-none"
            disabled={loading}
          />
          <div className="absolute bottom-2 right-2 text-xs text-slate-400">
            {prompt.length}/1000
          </div>
        </div>

        {/* Quick Suggestions */}
        {!compact && !prompt && (
          <div className="mt-2 flex flex-wrap gap-2">
            {promptSuggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => setPrompt(suggestion)}
                className="text-xs px-3 py-1.5 rounded-full bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition"
              >
                {suggestion.substring(0, 40)}...
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Model Selection - Gamma Style */}
      {!compact && (
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-neutral-400 mb-2 uppercase tracking-wide">
            AI image model
          </label>
          <div className="relative">
            {/* Selected Model Button */}
            <button
              type="button"
              onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
              className="w-full flex items-center justify-between gap-2 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
            >
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-violet-500" />
                <span className="font-medium">{MODEL_INFO[model].name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {creditCost} ✦
                </span>
                <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isModelDropdownOpen ? "rotate-180" : ""}`} />
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
                  className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-700 shadow-2xl z-[9999] max-h-[400px] overflow-y-auto"
                >
                  {/* Basic Models - Free */}
                  <div className="p-2 border-b border-slate-100 dark:border-neutral-700">
                    <div className="px-2 py-1.5 mb-1">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Basic models</span>
                    </div>
                    {[
                      { id: "gemini-2.0-flash-exp" as ImageModel, name: "Gemini 2.0 Flash", credits: CREDIT_COSTS.IMAGE_BASIC },
                      { id: "gemini-2.5-flash-image" as ImageModel, name: "Nano Banana", credits: CREDIT_COSTS.GEMINI_FLASH },
                      { id: "imagen-4.0-fast-generate-001" as ImageModel, name: "Imagen 4 Fast", credits: CREDIT_COSTS.IMAGEN_4_FAST },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setModel(m.id);
                          setIsModelDropdownOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between px-2 py-2.5 rounded-lg text-left transition-colors",
                          model === m.id ? "bg-violet-50 dark:bg-violet-900/30" : "hover:bg-slate-50 dark:hover:bg-neutral-700"
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          {model === m.id ? (
                            <Check size={16} className="text-violet-600" />
                          ) : (
                            <Sparkles size={16} className="text-violet-500" />
                          )}
                          <span className={cn("text-sm", model === m.id ? "font-medium text-violet-700 dark:text-violet-300" : "text-slate-700 dark:text-slate-200")}>{m.name}</span>
                        </div>
                        <span className="text-xs text-slate-400">{m.credits} ✦</span>
                      </button>
                    ))}
                  </div>

                  {/* Advanced Models - Plus */}
                  <div className="p-2 border-b border-slate-100 dark:border-neutral-700">
                    <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Advanced models</span>
                      <span className="text-[10px] font-semibold text-white bg-blue-500 px-1.5 py-0.5 rounded-full">PLUS</span>
                    </div>
                    {[
                      { id: "gemini-3-pro-image-preview" as ImageModel, name: "Nano Banana Pro", credits: CREDIT_COSTS.GEMINI_PRO, isNew: true },
                      { id: "imagen-4.0-generate-001" as ImageModel, name: "Imagen 4", credits: CREDIT_COSTS.IMAGEN_4 },
                    ].map((m) => {
                      const hasAccess = userPlan === "plus" || userPlan === "pro" || userPlan === "ultra";
                      const isLocked = !hasAccess;
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
                            setModel(m.id);
                            setIsModelDropdownOpen(false);
                          }}
                          className={cn(
                            "w-full flex items-center justify-between px-2 py-2.5 rounded-lg text-left transition-colors",
                            model === m.id ? "bg-violet-50 dark:bg-violet-900/30" : isLocked ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-50 dark:hover:bg-neutral-700"
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            {model === m.id ? (
                              <Check size={16} className="text-violet-600" />
                            ) : (
                              <Sparkles size={16} className="text-violet-500" />
                            )}
                            <span className={cn("text-sm", model === m.id ? "font-medium text-violet-700 dark:text-violet-300" : "text-slate-700 dark:text-slate-200")}>{m.name}</span>
                            {m.isNew && (
                              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">NEW</span>
                            )}
                            {isLocked && <Lock size={12} className="text-slate-400 ml-1" />}
                          </div>
                          <span className="text-xs text-slate-400">{m.credits} ✦</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Premium Models - Pro */}
                  <div className="p-2 border-b border-slate-100 dark:border-neutral-700">
                    <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Premium models</span>
                      <span className="text-[10px] font-semibold text-white bg-indigo-600 px-1.5 py-0.5 rounded-full">PRO</span>
                    </div>
                    {[
                      { id: "imagen-4.0-ultra-generate-001" as ImageModel, name: "Imagen 4 Ultra", credits: CREDIT_COSTS.IMAGEN_4_ULTRA },
                    ].map((m) => {
                      const hasAccess = userPlan === "pro" || userPlan === "ultra";
                      const isLocked = !hasAccess;
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
                            setModel(m.id);
                            setIsModelDropdownOpen(false);
                          }}
                          className={cn(
                            "w-full flex items-center justify-between px-2 py-2.5 rounded-lg text-left transition-colors",
                            model === m.id ? "bg-violet-50 dark:bg-violet-900/30" : isLocked ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-50 dark:hover:bg-neutral-700"
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            {model === m.id ? (
                              <Check size={16} className="text-violet-600" />
                            ) : (
                              <Sparkles size={16} className="text-violet-500" />
                            )}
                            <span className={cn("text-sm", model === m.id ? "font-medium text-violet-700 dark:text-violet-300" : "text-slate-700 dark:text-slate-200")}>{m.name}</span>
                            {isLocked && <Lock size={12} className="text-slate-400 ml-1" />}
                          </div>
                          <span className="text-xs text-slate-400">{m.credits} ✦</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Ultra Models */}
                  <div className="p-2">
                    <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Ultra models</span>
                      <span className="text-[10px] font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-500 px-1.5 py-0.5 rounded-full">ULTRA</span>
                    </div>
                    {[
                      { id: "imagen-4.0-ultra-generate-001" as ImageModel, name: "Imagen 4 Ultra (2K)", credits: CREDIT_COSTS.IMAGEN_4_ULTRA },
                    ].map((m) => {
                      const hasAccess = userPlan === "ultra";
                      const isLocked = !hasAccess;
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
                            setModel(m.id);
                            setIsModelDropdownOpen(false);
                          }}
                          className={cn(
                            "w-full flex items-center justify-between px-2 py-2.5 rounded-lg text-left transition-colors",
                            model === m.id ? "bg-violet-50 dark:bg-violet-900/30" : isLocked ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-50 dark:hover:bg-neutral-700"
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            {model === m.id ? (
                              <Check size={16} className="text-violet-600" />
                            ) : (
                              <Sparkles size={16} className="text-purple-500" />
                            )}
                            <span className={cn("text-sm", model === m.id ? "font-medium text-violet-700 dark:text-violet-300" : "text-slate-700 dark:text-slate-200")}>{m.name}</span>
                            {isLocked && <Lock size={12} className="text-slate-400 ml-1" />}
                          </div>
                          <span className="text-xs text-slate-400">{m.credits} ✦</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Options */}
      {!compact && (
        <div className="grid grid-cols-2 gap-4">
          {/* Quality */}
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-neutral-400 mb-1.5">
              Quality
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setQuality("standard")}
                className={cn(
                  "flex-1 px-3 py-2 rounded-lg text-xs font-medium transition",
                  quality === "standard"
                    ? "bg-[#06b6d4] text-white"
                    : "bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                )}
              >
                Standard
              </button>
              <button
                onClick={() => setQuality("hd")}
                className={cn(
                  "flex-1 px-3 py-2 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1",
                  quality === "hd"
                    ? "bg-[#06b6d4] text-white"
                    : "bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                )}
              >
                <Sparkles className="h-3 w-3" />
                HD
              </button>
            </div>
          </div>

          {/* Size */}
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-neutral-400 mb-1.5">
              Size
            </label>
            <div className="flex gap-2">
              {sizeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSize(opt.value)}
                  className={cn(
                    "flex-1 px-3 py-2 rounded-lg text-xs font-medium transition",
                    size === opt.value
                      ? "bg-[#06b6d4] text-white"
                      : "bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Credit Cost Info */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-neutral-900/50 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-neutral-400">
          <Zap className="h-4 w-4 text-amber-500" />
          <span>Cost: <strong>{creditCost} credits</strong></span>
          <span className="text-xs text-slate-400">({modelInfo.name})</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={loading || !prompt.trim()}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Wand2 className="h-5 w-5" />
            Generate Image
          </>
        )}
      </button>

      {/* Generated Image Preview */}
      {generatedImage && (
        <div className="space-y-3">
          <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-neutral-800">
            <img
              src={generatedImage.url}
              alt="AI Generated"
              className="w-full h-auto"
            />
            
            {/* Action Buttons */}
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                onClick={handleCopyUrl}
                className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition"
                title="Copy URL"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
              <button
                onClick={handleDownload}
                className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition"
                title="Download"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Revised Prompt */}
          {generatedImage.revisedPrompt && (
            <div className="p-3 bg-slate-50 dark:bg-neutral-900/50 rounded-lg">
              <p className="text-xs text-slate-500 dark:text-neutral-400 mb-1">
                Enhanced prompt:
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                {generatedImage.revisedPrompt}
              </p>
            </div>
          )}

          {/* Credits Used */}
          {creditsUsed && (
            <p className="text-center text-sm text-slate-500">
              {creditsUsed} credits used
            </p>
          )}
        </div>
      )}

      {/* Pricing Modal */}
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        currentPlan={subscriptionPlan}
      />
    </div>
  );
}
