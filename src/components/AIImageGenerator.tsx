"use client";

import { useState } from "react";
import {
  Sparkles,
  Loader2,
  Download,
  Copy,
  Check,
  AlertCircle,
  Wand2,
  Zap,
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

type ImageModel = "openai" | "gemini";
type ImageQuality = "standard" | "hd";
type ImageSize = "1024x1024" | "1792x1024" | "1024x1792";
type ImageStyle = "vivid" | "natural";

const MODEL_INFO = {
  openai: {
    name: "OpenAI DALL-E 3",
    description: "High quality, creative images",
    standardCredits: CREDIT_COSTS.IMAGE_BASIC,
    hdCredits: CREDIT_COSTS.IMAGE_HD,
  },
  gemini: {
    name: "Google Gemini Imagen",
    description: "Fast, efficient generation",
    standardCredits: CREDIT_COSTS.GEMINI_IMAGEN,
    hdCredits: CREDIT_COSTS.GEMINI_IMAGEN_HD,
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
  const [model, setModel] = useState<ImageModel>("openai");
  const [quality, setQuality] = useState<ImageQuality>("standard");
  const [size, setSize] = useState<ImageSize>("1024x1024");
  const [style, setStyle] = useState<ImageStyle>("vivid");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<{
    url: string;
    revisedPrompt?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [creditsUsed, setCreditsUsed] = useState<number | null>(null);

  const modelInfo = MODEL_INFO[model];
  const creditCost = quality === "hd" ? modelInfo.hdCredits : modelInfo.standardCredits;

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

      {/* Model Selection */}
      {!compact && (
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-neutral-400 mb-2">
            AI Model
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(MODEL_INFO) as ImageModel[]).map((m) => (
              <button
                key={m}
                onClick={() => setModel(m)}
                className={cn(
                  "p-3 rounded-xl border-2 text-left transition",
                  model === m
                    ? "border-[#06b6d4] bg-[#06b6d4]/5"
                    : "border-slate-200 dark:border-neutral-800 hover:border-slate-300"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {MODEL_INFO[m].name}
                  </span>
                  {model === m && (
                    <div className="w-2 h-2 rounded-full bg-[#06b6d4]" />
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-neutral-400">
                  {MODEL_INFO[m].description}
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  {MODEL_INFO[m].standardCredits}-{MODEL_INFO[m].hdCredits} credits
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Options */}
      {!compact && (
        <div className="grid grid-cols-3 gap-4">
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
            <select
              value={size}
              onChange={(e) => setSize(e.target.value as ImageSize)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-slate-100 dark:bg-neutral-800 border-0 text-slate-700 dark:text-slate-300"
            >
              {sizeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} ({opt.aspect})
                </option>
              ))}
            </select>
          </div>

          {/* Style (OpenAI only) */}
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-neutral-400 mb-1.5">
              Style {model !== "openai" && <span className="text-slate-400">(OpenAI only)</span>}
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setStyle("vivid")}
                disabled={model !== "openai"}
                className={cn(
                  "flex-1 px-3 py-2 rounded-lg text-xs font-medium transition",
                  style === "vivid" && model === "openai"
                    ? "bg-[#06b6d4] text-white"
                    : "bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-300",
                  model !== "openai" && "opacity-50 cursor-not-allowed"
                )}
              >
                Vivid
              </button>
              <button
                onClick={() => setStyle("natural")}
                disabled={model !== "openai"}
                className={cn(
                  "flex-1 px-3 py-2 rounded-lg text-xs font-medium transition",
                  style === "natural" && model === "openai"
                    ? "bg-[#06b6d4] text-white"
                    : "bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-300",
                  model !== "openai" && "opacity-50 cursor-not-allowed"
                )}
              >
                Natural
              </button>
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
