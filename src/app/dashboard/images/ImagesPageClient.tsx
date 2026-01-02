"use client";

import { useState, useCallback } from "react";
import {
  Grid,
  List as ListIcon,
  Image as ImageIcon,
  MoreHorizontal,
  Search,
  Plus,
  Sparkles,
  Download,
  Trash2,
  X,
  Loader2,
  Zap,
} from "lucide-react";
import Image from "next/image";
import AIImageGenerator from "~/components/AIImageGenerator";
import { cn } from "~/lib/utils";
import { CREDIT_COSTS } from "~/lib/credits";
import DashboardStickyHeader from "~/components/dashboard/DashboardStickyHeader";

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
  userId,
  credits: initialCredits,
  userName,
  initialImages,
  subscriptionPlan,
}: ImagesPageClientProps) {
  const [images, setImages] = useState<ImageData[]>(initialImages);
  const [credits, setCredits] = useState(initialCredits);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [showGenerator, setShowGenerator] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
    if (!confirm("Are you sure you want to delete this image?")) return;
    
    setDeletingId(imageId);
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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with sticky behavior */}
      <DashboardStickyHeader
        icon={
          <>
            <ImageIcon size={18} className="sm:hidden" />
            <ImageIcon size={22} className="hidden sm:block" />
          </>
        }
        title="Images"
        stickyIcon={<ImageIcon size={18} />}
        stickyTitle="Images"
        actions={
          <div className="flex items-center gap-2 md:gap-3">
            {/* Credits Display */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <Zap className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                {credits.toLocaleString()}
              </span>
            </div>
            <button
              onClick={() => setShowGenerator(true)}
              className="flex items-center gap-1.5 md:gap-2 rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] px-3 py-2 md:px-5 md:py-2.5 text-sm md:text-base font-bold text-white shadow-lg shadow-[#06b6d4]/20 transition-all hover:from-[#172554] hover:to-[#0891b2] hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
            >
              <Sparkles size={16} className="md:w-[18px] md:h-[18px]" />
              <span className="hidden sm:inline">Generate with AI</span>
              <span className="sm:hidden">Generate</span>
            </button>
          </div>
        }
      />

      {/* Search and View Toggle */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search images..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#06b6d4] focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-neutral-800 rounded-lg">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "p-2 rounded-md transition",
              viewMode === "grid"
                ? "bg-white dark:bg-neutral-700 shadow-sm text-[#06b6d4] dark:text-white"
                : "text-slate-500 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-white"
            )}
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "p-2 rounded-md transition",
              viewMode === "list"
                ? "bg-white dark:bg-neutral-700 shadow-sm text-[#06b6d4] dark:text-white"
                : "text-slate-500 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-white"
            )}
          >
            <ListIcon className="h-4 w-4" />
          </button>
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
              {searchQuery ? "No images found" : "No images yet"}
            </h3>
            <p className="text-sm text-slate-500 dark:text-neutral-400 max-w-xs mx-auto mb-6">
              {searchQuery
                ? "Try a different search term"
                : "Generate your first AI image or upload one to get started."}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowGenerator(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white rounded-xl font-medium hover:opacity-90 transition"
              >
                <Sparkles className="h-4 w-4" />
                Generate with AI
              </button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredImages.map((img) => (
              <div
                key={img.id}
                onClick={() => setSelectedImage(img)}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm transition-all hover:border-[#06b6d4]/50 hover:shadow-lg hover:shadow-[#06b6d4]/10 cursor-pointer"
              >
                {/* Image Thumbnail */}
                <div className="aspect-square w-full bg-gradient-to-br from-[#1e3a8a]/10 to-[#06b6d4]/10 relative overflow-hidden">
                  {img.url ? (
                    <Image
                      src={img.url}
                      alt={img.filename}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                      <ImageIcon className="h-12 w-12 text-slate-300" />
                    </div>
                  )}
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 flex flex-col justify-between bg-black/40 p-3 opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="self-end flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (img.url) {
                            const link = document.createElement("a");
                            link.href = img.url;
                            link.download = img.filename;
                            link.target = "_blank";
                            link.click();
                          }
                        }}
                        className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition"
                      >
                        <Download className="h-4 w-4 text-white" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteImage(img.id);
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
                <div className="flex flex-col p-3">
                  <h3 className="line-clamp-1 text-sm font-medium text-slate-900 dark:text-white" title={img.filename}>
                    {img.filename}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-2">
            {filteredImages.map((img) => (
              <div
                key={img.id}
                onClick={() => setSelectedImage(img)}
                className="flex items-center gap-4 p-3 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-[#06b6d4]/50 cursor-pointer transition"
              >
                <div className="h-16 w-16 rounded-lg overflow-hidden bg-slate-100 dark:bg-neutral-800 flex-shrink-0">
                  {img.url ? (
                    <Image
                      src={img.url}
                      alt={img.filename}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-slate-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-slate-900 dark:text-white truncate">
                    {img.filename}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-neutral-400">
                    {formatDate(img.createdAt)}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteImage(img.id);
                  }}
                  disabled={deletingId === img.id}
                  className="p-2 text-slate-400 hover:text-red-500 transition"
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
      {showGenerator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-neutral-900 px-6 py-4 border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] rounded-xl">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    AI Image Generator
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-neutral-400">
                    Powered by DALL-E 3
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
              />
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-neutral-800">
              <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                {selectedImage.filename}
              </h3>
              <div className="flex items-center gap-2">
                {selectedImage.url && (
                  <button
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = selectedImage.url!;
                      link.download = selectedImage.filename;
                      link.target = "_blank";
                      link.click();
                    }}
                    className="p-2 text-slate-500 hover:text-[#06b6d4] transition"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                )}
                <button
                  onClick={() => handleDeleteImage(selectedImage.id)}
                  className="p-2 text-slate-500 hover:text-red-500 transition"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              {selectedImage.url ? (
                <img
                  src={selectedImage.url}
                  alt={selectedImage.filename}
                  className="w-full h-auto max-h-[60vh] object-contain rounded-lg"
                />
              ) : (
                <div className="h-64 flex items-center justify-center bg-slate-100 dark:bg-neutral-800 rounded-lg">
                  <ImageIcon className="h-16 w-16 text-slate-300" />
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
