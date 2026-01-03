"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, CheckCircle2, Image as ImageIcon } from "lucide-react";
import { getThemeById, getDefaultTheme, type Theme } from "~/lib/themes";
import { isCustomThemeId, getCustomThemeDbId, convertCustomThemeToTheme } from "~/lib/custom-theme-utils";
import type { SlideData } from "~/components/presentation/types";
import type { PresentationStreamState } from "~/lib/dashboard/hooks/usePresentationStream";

interface StreamingPresentationViewerProps {
  streamState: PresentationStreamState;
  theme: string;
  onComplete?: () => void;
}

// Skeleton for loading slide content
function SlideContentSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-white/20 rounded w-3/4" />
      <div className="space-y-2">
        <div className="h-4 bg-white/10 rounded w-full" />
        <div className="h-4 bg-white/10 rounded w-5/6" />
        <div className="h-4 bg-white/10 rounded w-4/6" />
      </div>
    </div>
  );
}

// Image placeholder with loading state
function ImagePlaceholder({ isLoading }: { isLoading: boolean }) {
  return (
    <div className="relative w-full h-48 bg-slate-800/50 rounded-lg flex items-center justify-center overflow-hidden">
      {isLoading ? (
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-sm">Loading image...</span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 text-slate-500">
          <ImageIcon className="w-8 h-8" />
          <span className="text-sm">Image placeholder</span>
        </div>
      )}
      {/* Shimmer effect when loading */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
      )}
    </div>
  );
}

// Thumbnail in sidebar
function SlideThumbnail({
  slide,
  index,
  isActive,
  isLoading,
  imageLoading,
  theme,
  onClick,
}: {
  slide: SlideData | undefined;
  index: number;
  isActive: boolean;
  isLoading: boolean;
  imageLoading: boolean;
  theme: Theme;
  onClick: () => void;
}) {
  const isTitle = slide?.type === "title";
  const hasImage = slide?.image?.url && slide.image.source !== "placeholder";

  return (
    <button
      onClick={onClick}
      className={`w-full aspect-video rounded-lg overflow-hidden border-2 transition-all ${
        isActive
          ? "border-cyan-500 ring-2 ring-cyan-500/30"
          : "border-white/10 hover:border-white/30"
      } ${isLoading ? "animate-pulse" : ""}`}
    >
      <div
        className="w-full h-full relative"
        style={{
          background: isTitle && !hasImage
            ? theme.slideStyles?.title?.background || theme.colors.background
            : theme.colors.background,
        }}
      >
        {/* Image background for title slides */}
        {isTitle && hasImage && slide?.image?.url && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.image.url}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
          </>
        )}

        {/* Image loading indicator */}
        {imageLoading && (
          <div className="absolute top-1 right-1 z-10">
            <Loader2 className="w-3 h-3 text-cyan-400 animate-spin" />
          </div>
        )}

        {/* Content */}
        <div className="absolute inset-0 p-2 flex flex-col justify-center">
          {isLoading ? (
            <div className="space-y-1">
              <div className="h-2 bg-white/20 rounded w-3/4 animate-pulse" />
              <div className="h-1.5 bg-white/10 rounded w-1/2 animate-pulse" />
            </div>
          ) : slide ? (
            <>
              <p
                className="text-[8px] font-semibold truncate"
                style={{ color: hasImage ? "#fff" : theme.colors.heading }}
              >
                {slide.title}
              </p>
              {slide.subtitle && (
                <p
                  className="text-[6px] truncate opacity-70"
                  style={{ color: hasImage ? "#e2e8f0" : theme.colors.textMuted }}
                >
                  {slide.subtitle}
                </p>
              )}
            </>
          ) : null}
        </div>

        {/* Slide number */}
        <div className="absolute bottom-1 left-1 text-[8px] font-medium text-white/60 bg-black/30 px-1 rounded">
          {index + 1}
        </div>
      </div>
    </button>
  );
}

export default function StreamingPresentationViewer({
  streamState,
  theme: themeId,
  onComplete,
}: StreamingPresentationViewerProps) {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [customTheme, setCustomTheme] = useState<Theme | null>(null);

  // Load custom theme if needed
  useEffect(() => {
    if (isCustomThemeId(themeId)) {
      const dbId = getCustomThemeDbId(themeId);
      fetch(`/api/themes/custom/${dbId}`)
        .then(res => res.json())
        .then(data => {
          if (data.theme) {
            setCustomTheme(convertCustomThemeToTheme(data.theme));
          }
        })
        .catch(err => console.error("Failed to load custom theme:", err));
    }
  }, [themeId]);

  const theme = customTheme || getThemeById(themeId) || getDefaultTheme();

  // Auto-advance to latest slide during streaming
  useEffect(() => {
    if (streamState.status === "streaming" && streamState.currentSlideIndex >= 0) {
      setCurrentSlide(streamState.currentSlideIndex);
    }
  }, [streamState.status, streamState.currentSlideIndex]);

  // Handle completion
  useEffect(() => {
    if (streamState.status === "completed" && onComplete) {
      onComplete();
    }
  }, [streamState.status, onComplete]);

  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < streamState.slides.length) {
      setCurrentSlide(index);
    }
  }, [streamState.slides.length]);

  const currentSlideData = streamState.slides[currentSlide];
  const isCurrentSlideLoading = currentSlide > streamState.currentSlideIndex;
  const isImageLoading = streamState.imagesLoading.has(currentSlide);

  // Progress calculation
  const slideProgress = streamState.totalSlides > 0
    ? ((streamState.currentSlideIndex + 1) / streamState.totalSlides) * 100
    : 0;
  const imageProgress = streamState.imagesLoading.size > 0 || streamState.imagesLoaded.size > 0
    ? (streamState.imagesLoaded.size / (streamState.imagesLoading.size + streamState.imagesLoaded.size)) * 100
    : 100;

  return (
    <div className="min-h-screen flex" style={{ 
      background: theme.pageBackgroundGradient || theme.pageBackground || "#0a0a0b",
      backgroundColor: theme.pageBackground || "#0a0a0b",
      backgroundAttachment: "fixed",
    }}>
      {/* Sidebar with thumbnails */}
      <div className="w-48 bg-black/30 border-r border-white/10 p-3 flex flex-col gap-3 overflow-y-auto">
        {/* Progress header */}
        <div className="pb-3 border-b border-white/10">
          <div className="flex items-center gap-2 mb-2">
            {streamState.status === "completed" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
            )}
            <span className="text-xs font-medium text-white/80">
              {streamState.status === "connecting" && "Connecting..."}
              {streamState.status === "streaming" && "Building slides..."}
              {streamState.status === "loading-images" && "Loading images..."}
              {streamState.status === "completed" && "Complete!"}
              {streamState.status === "error" && "Error"}
            </span>
          </div>

          {/* Progress bars */}
          <div className="space-y-1.5">
            <div>
              <div className="flex justify-between text-[10px] text-white/50 mb-0.5">
                <span>Slides</span>
                <span>{streamState.currentSlideIndex + 1}/{streamState.totalSlides}</span>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 transition-all duration-300"
                  style={{ width: `${slideProgress}%` }}
                />
              </div>
            </div>

            {(streamState.status === "loading-images" || streamState.imagesLoaded.size > 0) && (
              <div>
                <div className="flex justify-between text-[10px] text-white/50 mb-0.5">
                  <span>Images</span>
                  <span>{streamState.imagesLoaded.size}/{streamState.imagesLoading.size + streamState.imagesLoaded.size}</span>
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${imageProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Slide thumbnails */}
        <div className="flex-1 space-y-2">
          {Array.from({ length: streamState.totalSlides }).map((_, index) => (
            <SlideThumbnail
              key={index}
              slide={streamState.slides[index]}
              index={index}
              isActive={currentSlide === index}
              isLoading={index > streamState.currentSlideIndex}
              imageLoading={streamState.imagesLoading.has(index)}
              theme={theme}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>

        {/* Complete button */}
        {streamState.status === "completed" && streamState.redirectUrl && (
          <button
            onClick={() => router.push(streamState.redirectUrl!)}
            className="w-full py-2 px-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-medium rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            View Presentation
          </button>
        )}
      </div>

      {/* Main slide view */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div
          className="w-full max-w-5xl aspect-video rounded-xl overflow-hidden shadow-2xl relative"
          style={{
            background: currentSlideData?.type === "title"
              ? theme.slideStyles?.title?.background || theme.colors.background
              : theme.colors.background,
          }}
        >
          {/* Title slide with image */}
          {currentSlideData?.type === "title" && currentSlideData.image?.url && currentSlideData.image.source !== "placeholder" && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentSlideData.image.url}
                alt={currentSlideData.image.alt}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            </>
          )}

          {/* Image loading placeholder for title slide */}
          {currentSlideData?.type === "title" && isImageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
                <span className="text-white/60">Loading background image...</span>
              </div>
            </div>
          )}

          {/* Slide content */}
          <div className="absolute inset-0 p-12 flex flex-col justify-center">
            {isCurrentSlideLoading ? (
              <SlideContentSkeleton />
            ) : currentSlideData ? (
              <>
                {/* Title */}
                <h1
                  className={`font-bold mb-4 ${currentSlideData.type === "title" ? "text-5xl text-center" : "text-3xl"}`}
                  style={{
                    fontFamily: theme.fonts.heading.family,
                    color: currentSlideData.image?.url && currentSlideData.image.source !== "placeholder"
                      ? "#ffffff"
                      : theme.colors.heading,
                  }}
                >
                  {currentSlideData.title}
                </h1>

                {/* Subtitle */}
                {currentSlideData.subtitle && (
                  <p
                    className={`text-xl opacity-80 ${currentSlideData.type === "title" ? "text-center" : ""}`}
                    style={{
                      fontFamily: theme.fonts.body.family,
                      color: currentSlideData.image?.url && currentSlideData.image.source !== "placeholder"
                        ? "#e2e8f0"
                        : theme.colors.textMuted,
                    }}
                  >
                    {currentSlideData.subtitle}
                  </p>
                )}

                {/* Tagline for title slides */}
                {currentSlideData.type === "title" && currentSlideData.tagline && (
                  <p
                    className="text-lg mt-4 text-center italic opacity-70"
                    style={{
                      fontFamily: theme.fonts.body.family,
                      color: currentSlideData.image?.url && currentSlideData.image.source !== "placeholder"
                        ? "#cbd5e1"
                        : theme.colors.textMuted,
                    }}
                  >
                    {currentSlideData.tagline}
                  </p>
                )}

                {/* Content slide layout */}
                {currentSlideData.type === "content" && (
                  <div className="flex gap-8 mt-6">
                    {/* Main content area */}
                    <div className="flex-1">
                      {/* Intro text */}
                      {currentSlideData.introText && (
                        <p
                          className="text-lg mb-4 opacity-90"
                          style={{
                            fontFamily: theme.fonts.body.family,
                            color: theme.colors.text,
                          }}
                        >
                          {currentSlideData.introText}
                        </p>
                      )}

                      {/* Sections (card-style layout) */}
                      {currentSlideData.sections && currentSlideData.sections.length > 0 ? (
                        <div className={`grid gap-4 ${currentSlideData.sections.length === 2 ? 'grid-cols-2' : currentSlideData.sections.length >= 3 ? 'grid-cols-3' : 'grid-cols-1'}`}>
                          {currentSlideData.sections.map((section, i) => (
                            <div
                              key={i}
                              className="p-4 rounded-lg"
                              style={{
                                background: `${theme.colors.accent}15`,
                                borderLeft: `3px solid ${theme.colors.accent}`,
                              }}
                            >
                              <h3
                                className="font-semibold text-base mb-2"
                                style={{
                                  fontFamily: theme.fonts.heading.family,
                                  color: theme.colors.heading,
                                }}
                              >
                                {section.heading}
                              </h3>
                              <p
                                className="text-sm opacity-80"
                                style={{
                                  fontFamily: theme.fonts.body.family,
                                  color: theme.colors.text,
                                }}
                              >
                                {section.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : currentSlideData.bulletPoints && (
                        /* Bullet points */
                        <ul className="space-y-3">
                          {currentSlideData.bulletPoints.map((bullet, i) => (
                            <li
                              key={i}
                              className="flex gap-3 text-lg"
                              style={{
                                fontFamily: theme.fonts.body.family,
                                color: theme.colors.text,
                              }}
                            >
                              <span style={{ color: theme.colors.accent }}>•</span>
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Image area */}
                    {(currentSlideData.image || isImageLoading) && (
                      <div className="w-1/3">
                        {isImageLoading ? (
                          <ImagePlaceholder isLoading={true} />
                        ) : currentSlideData.image?.url && currentSlideData.image.source !== "placeholder" ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={currentSlideData.image.url}
                            alt={currentSlideData.image.alt}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                        ) : currentSlideData.image?.source === "placeholder" ? (
                          <ImagePlaceholder isLoading={false} />
                        ) : null}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-3 text-white/40">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span>Preparing slide...</span>
                </div>
              </div>
            )}
          </div>

          {/* Slide number */}
          <div className="absolute bottom-4 right-4 text-sm font-medium text-white/40">
            {currentSlide + 1} / {streamState.totalSlides}
          </div>
        </div>
      </div>

      {/* Add shimmer animation */}
      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
      `}</style>
    </div>
  );
}
