"use client";

import { useState, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Grid,
  List as ListIcon,
  Image as ImageIcon,
  Search,
  Sparkles,
  Download,
  Trash2,
  X,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import Image from "next/image";
import AIImageGenerator from "~/components/AIImageGenerator";
import { cn } from "~/lib/utils";
import DashboardStickyHeader from "~/components/dashboard/DashboardStickyHeader";
import { useLanguage } from "~/contexts/LanguageContext";
import { dashboardTranslations } from "~/lib/dashboard-translations";

interface ImageData {
  id: string;
  url: string | null;
  filename: string;
  createdAt: Date;
}

interface ImagesPageClientProps {
  userId: string;
  credits: number;
  userName: string | null;
  initialImages: ImageData[];
  subscriptionPlan: string | null;
}

export default function ImagesPageClient({
  credits: initialCredits,
  initialImages,
  subscriptionPlan,
}: ImagesPageClientProps) {
  const { language } = useLanguage();
  const t = dashboardTranslations[language] || dashboardTranslations.en;
  const [images, setImages] = useState<ImageData[]>(initialImages);
  const [credits, setCredits] = useState(initialCredits);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [showGenerator, setShowGenerator] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  // Handle image load error - show logo fallback
  const handleImageError = (imageId: string) => {
    setFailedImages(prev => new Set(prev).add(imageId));
  };

  const filteredImages = images.filter((img) =>
    img.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleImageGenerated = useCallback(async (imageUrl: string) => {
    // Refresh images list
    try {
      const response = await fetch("/api/images");
      if (response.ok) {
        const data = await response.json();
        setImages(data.images || []);
        setCredits(data.credits || credits);
      }
    } catch (error) {
      console.error("Failed to refresh images:", error);
    }
  }, [credits]);

  const handleDeleteImage = async (imageId: string) => {
    setDeletingId(imageId);
    setDeleteConfirmId(null);
    try {
      const response = await fetch(`/api/images/${imageId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setImages((prev) => prev.filter((img) => img.id !== imageId));
        if (selectedImage?.id === imageId) {
          setSelectedImage(null);
        }
      }
    } catch (error) {
      console.error("Failed to delete image:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      // Fallback to opening in new tab
      window.open(url, "_blank");
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="mx-auto max-w-[1400px] w-full p-4 md:p-5 lg:px-6 lg:py-4">
      {/* Quick Actions & Controls Bar */}
      <div className="mb-4 flex flex-col gap-3">
        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/60 dark:border-zinc-800/60 pb-3">
          <div className="relative w-full sm:max-w-xs md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={t.searchImages || "Search images..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 shadow-sm shadow-slate-200/50 dark:shadow-none focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20 focus:border-[#06b6d4] transition-all"
            />
          </div>
          
          <div className="flex items-center rounded-2xl bg-white border border-slate-200 shadow-sm shadow-slate-200/50 dark:bg-zinc-900 dark:border-zinc-800 dark:shadow-none p-1">
            <button
              onClick={() => setViewMode("grid")}
              title="Grid View"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all outline-none ${viewMode === "grid" ? "bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
            >
              <Grid size={16} />
              <span className="text-[11px] font-bold uppercase tracking-wider hidden sm:block">Grid</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              title="List View"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all outline-none ${viewMode === "list" ? "bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
            >
              <ListIcon size={16} />
              <span className="text-[11px] font-bold uppercase tracking-wider hidden sm:block">List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {filteredImages.length === 0 ? (
          <div className="flex h-[400px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white dark:bg-neutral-800 shadow-lg ring-1 ring-slate-100 dark:ring-neutral-700">
              <ImageIcon size={28} className="text-[#06b6d4]" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-[#1e3a8a] dark:text-white">
              {searchQuery ? (t.noImagesFound || "No images found") : (t.noImagesYet || "No images yet")}
            </h3>
            <p className="text-sm text-slate-500 dark:text-neutral-400 max-w-xs mx-auto mb-6">
              {searchQuery
                ? (t.tryDifferentSearch || "Try a different search term")
                : (t.generateFirstImage || "Generate your first AI image or upload one to get started.")}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowGenerator(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white rounded-xl font-medium hover:opacity-90 transition"
              >
                <Sparkles className="h-4 w-4" />
                {t.generateWithAI || "Generate with AI"}
              </button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredImages.map((img) => (
              <div
                key={img.id}
                onClick={() => setSelectedImage(img)}
                className="group relative flex flex-col overflow-hidden rounded-[20px] border border-slate-200/80 shadow-md ring-1 ring-slate-900/5 dark:ring-0 dark:border-white/10 dark:shadow-none bg-white dark:bg-zinc-950 transition-all duration-300 hover:border-[#06b6d4]/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 cursor-pointer"
              >
                {/* Image Thumbnail */}
                <div className="aspect-square w-full bg-slate-50 dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800 relative overflow-hidden">
                  {img.url && !failedImages.has(img.id) ? (
                    <Image
                      src={img.url}
                      alt={img.filename}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={() => handleImageError(img.id)}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                      <Image
                        src="/logo.png"
                        alt="PPT Master"
                        width={64}
                        height={64}
                        className="opacity-60 group-hover:opacity-80 transition-opacity"
                      />
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 flex flex-col justify-between bg-black/40 p-3 opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="self-end flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (img.url) {
                            handleDownloadImage(img.url, img.filename);
                          }
                        }}
                        className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition"
                      >
                        <Download className="h-4 w-4 text-white" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmId(img.id);
                        }}
                        disabled={deletingId === img.id}
                        className="p-1.5 bg-red-500/80 hover:bg-red-500 rounded-lg transition"
                      >
                        {deletingId === img.id ? (
                          <Loader2 className="h-4 w-4 text-white animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-white" />
                        )}
                      </button>
                    </div>
                    <div className="text-white">
                      <p className="truncate text-xs font-medium">{img.filename}</p>
                      <p className="text-[10px] opacity-75">{formatDate(img.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex flex-col p-4 lg:p-5">
                  <h3 className="line-clamp-1 text-[14px] font-bold text-slate-900 dark:text-white leading-snug group-hover:text-[#06b6d4] transition-colors" title={img.filename}>
                    {img.filename}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-3">
            {filteredImages.map((img) => (
              <div
                key={img.id}
                onClick={() => setSelectedImage(img)}
                className="group flex items-center gap-5 rounded-[20px] border border-slate-200/80 shadow-sm ring-1 ring-slate-900/5 dark:ring-0 dark:border-white/10 dark:shadow-none bg-white dark:bg-zinc-950 p-3 transition-all duration-300 hover:border-[#06b6d4]/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-0.5 cursor-pointer"
              >
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-[14px] overflow-hidden bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 flex-shrink-0 transition-transform duration-500 group-hover:scale-105">
                  {img.url && !failedImages.has(img.id) ? (
                    <Image
                      src={img.url}
                      alt={img.filename}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                      onError={() => handleImageError(img.id)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image
                        src="/logo.png"
                        alt="PPT Master"
                        width={32}
                        height={32}
                        className="opacity-60"
                      />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-bold text-slate-900 dark:text-white truncate group-hover:text-[#06b6d4] transition-colors mb-1">
                    {img.filename}
                  </h3>
                  <p className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500">
                    {formatDate(img.createdAt)}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirmId(img.id);
                  }}
                  disabled={deletingId === img.id}
                  className="p-3 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition"
                >
                  {deletingId === img.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Image Generator Modal */}
      {showGenerator && typeof window !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowGenerator(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 z-10 bg-white dark:bg-neutral-900 px-6 py-4 border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] rounded-xl">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {t.aiImageGenerator || "AI Image Generator"}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-neutral-400">
                    {t.poweredBy || "Powered by Google & OpenAI"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGenerator(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <AIImageGenerator
                onImageGenerated={(url) => {
                  handleImageGenerated(url);
                  // Keep modal open to show result
                }}
                subscriptionPlan={subscriptionPlan}
              />
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Image Preview Modal */}
      {selectedImage && typeof window !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedImage(null)} />
          <div className="relative max-w-4xl w-full bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-neutral-800">
              <h3 className="font-semibold text-slate-900 dark:text-white truncate pr-4">
                {selectedImage.filename}
              </h3>
              <div className="flex items-center gap-2 flex-shrink-0">
                {selectedImage.url && (
                  <>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedImage.url!);
                        setCopiedUrl(true);
                        setTimeout(() => setCopiedUrl(false), 2000);
                      }}
                      className="p-2 text-slate-500 hover:text-[#06b6d4] transition"
                      title="Copy URL"
                    >
                      {copiedUrl ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <Copy className="h-5 w-5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDownloadImage(selectedImage.url!, selectedImage.filename)}
                      className="p-2 text-slate-500 hover:text-[#06b6d4] transition"
                      title="Download"
                    >
                      <Download className="h-5 w-5" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => setDeleteConfirmId(selectedImage.id)}
                  className="p-2 text-slate-500 hover:text-red-500 transition"
                  title="Delete"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition"
                  title="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              {selectedImage.url ? (
                <div className="relative w-full max-h-[60vh] aspect-auto">
                  <Image
                    src={selectedImage.url}
                    alt={selectedImage.filename}
                    width={800}
                    height={600}
                    className="w-full h-auto max-h-[60vh] object-contain rounded-lg"
                    unoptimized={!selectedImage.url.includes('cloudinary.com')}
                  />
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center bg-slate-100 dark:bg-neutral-800 rounded-lg">
                  <ImageIcon className="h-16 w-16 text-slate-300" />
                </div>
              )}

              {/* URL Display */}
              {selectedImage.url && (
                <div className="mt-4 p-3 bg-slate-50 dark:bg-neutral-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={selectedImage.url}
                      readOnly
                      className="flex-1 text-xs text-slate-600 dark:text-neutral-400 bg-transparent border-none outline-none truncate"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedImage.url!);
                        setCopiedUrl(true);
                        setTimeout(() => setCopiedUrl(false), 2000);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#06b6d4] hover:bg-[#0891b2] rounded-lg transition"
                    >
                      {copiedUrl ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          {t.copied || "Copied!"}
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          {t.copyUrl || "Copy URL"}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && typeof window !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)} />
          <div className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">{t.deleteImage || "Delete Image"}</h3>
                <p className="text-sm text-slate-500 dark:text-neutral-400">{t.cannotBeUndone || "This action cannot be undone"}</p>
              </div>
            </div>
            <p className="text-slate-600 dark:text-neutral-300 mb-6">
              {t.permanentlyRemoved || "Are you sure you want to delete this image? It will be permanently removed from your library."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-neutral-300 bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 rounded-xl transition"
              >
                {t.cancel || "Cancel"}
              </button>
              <button
                onClick={() => handleDeleteImage(deleteConfirmId)}
                disabled={deletingId === deleteConfirmId}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition flex items-center justify-center gap-2"
              >
                {deletingId === deleteConfirmId ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t.deleting || "Deleting..."}
                  </>
                ) : (
                  t.delete || "Delete"
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
