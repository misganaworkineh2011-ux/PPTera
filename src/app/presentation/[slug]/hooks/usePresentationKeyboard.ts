import { useEffect, type Dispatch, type SetStateAction } from "react";
import { type SlideData, type EditingState } from "~/components/presentation/types";

interface UsePresentationKeyboardOptions {
  nextSlide: () => void;
  prevSlide: () => void;
  toggleFullscreen: () => void | Promise<void>;
  undo: () => void;
  redo: () => void;
  slidesRef: { current: SlideData[] };
  currentSlide: number;
  isFullscreen: boolean;
  isPresenting: boolean;
  editingText: EditingState | null;
  prevThumbnailState: boolean;
  isSpotlightActive: boolean;
  spotlightContentIndex: number;
  setSpotlightContentIndex: Dispatch<SetStateAction<number>>;
  setIsShaking: Dispatch<SetStateAction<boolean>>;
  setIsPresenting: Dispatch<SetStateAction<boolean>>;
  setViewMode: Dispatch<SetStateAction<"slides" | "scroll">>;
  setShowThumbnails: Dispatch<SetStateAction<boolean>>;
  setPresentZoom: Dispatch<SetStateAction<number>>;
  setIsSpotlightActive: Dispatch<SetStateAction<boolean>>;
  setEditingText: Dispatch<SetStateAction<EditingState | null>>;
}

export function usePresentationKeyboard({
  nextSlide,
  prevSlide,
  toggleFullscreen,
  undo,
  redo,
  slidesRef,
  currentSlide,
  isFullscreen,
  isPresenting,
  editingText,
  prevThumbnailState,
  isSpotlightActive,
  spotlightContentIndex,
  setSpotlightContentIndex,
  setIsShaking,
  setIsPresenting,
  setViewMode,
  setShowThumbnails,
  setPresentZoom,
  setIsSpotlightActive,
  setEditingText,
}: UsePresentationKeyboardOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        redo();
        return;
      }

      const target = e.target as HTMLElement;
      const isTyping = target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable ||
        target.closest('[contenteditable="true"]');

      if (editingText || isTyping) return;

      const currentSlideData = slidesRef.current[currentSlide];
      const contentCount = currentSlideData
        ? (currentSlideData.bulletPoints?.length || 0)
          + (currentSlideData.title ? 1 : 0)
          + (currentSlideData.subtitle ? 1 : 0)
        : 0;

      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        if (isSpotlightActive && (isFullscreen || isPresenting)) {
          if (spotlightContentIndex < contentCount - 1) {
            setSpotlightContentIndex(prev => prev + 1);
          } else {
            if (currentSlide < slidesRef.current.length - 1) {
              nextSlide();
              setSpotlightContentIndex(0);
            } else {
              setIsShaking(true);
              setTimeout(() => setIsShaking(false), 500);
            }
          }
        } else {
          nextSlide();
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (isSpotlightActive && (isFullscreen || isPresenting)) {
          if (spotlightContentIndex > 0) {
            setSpotlightContentIndex(prev => prev - 1);
          } else if (currentSlide > 0) {
            prevSlide();
            const prevSlideData = slidesRef.current[currentSlide - 1];
            const prevContentCount = prevSlideData
              ? (prevSlideData.bulletPoints?.length || 0)
                + (prevSlideData.title ? 1 : 0)
                + (prevSlideData.subtitle ? 1 : 0)
              : 0;
            setSpotlightContentIndex(Math.max(0, prevContentCount - 1));
          }
        } else {
          prevSlide();
        }
      } else if (e.key === "ArrowDown") {
        if (isSpotlightActive && (isFullscreen || isPresenting)) {
          e.preventDefault();
          if (spotlightContentIndex < contentCount - 1) {
            setSpotlightContentIndex(prev => prev + 1);
          }
        }
      } else if (e.key === "ArrowUp") {
        if (isSpotlightActive && (isFullscreen || isPresenting)) {
          e.preventDefault();
          if (spotlightContentIndex > 0) {
            setSpotlightContentIndex(prev => prev - 1);
          }
        }
      } else if (e.key === "Escape") {
        if (isFullscreen) document.exitFullscreen();
        if (isPresenting) {
          setIsPresenting(false);
          setViewMode("scroll");
          setShowThumbnails(prevThumbnailState);
          setPresentZoom(100);
          setIsSpotlightActive(false);
        }
        setEditingText(null);
      } else if (e.key === "f") {
        toggleFullscreen();
      } else if ((isFullscreen || isPresenting) && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        setIsSpotlightActive(prev => {
          if (!prev) setSpotlightContentIndex(0);
          return !prev;
        });
      } else if ((isFullscreen || isPresenting) && (e.key === "+" || e.key === "=")) {
        e.preventDefault();
        setPresentZoom(prev => Math.min(200, prev + 10));
      } else if ((isFullscreen || isPresenting) && e.key === "-") {
        e.preventDefault();
        setPresentZoom(prev => Math.max(50, prev - 10));
      } else if ((isFullscreen || isPresenting) && e.key === "0") {
        e.preventDefault();
        setPresentZoom(100);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    nextSlide,
    prevSlide,
    toggleFullscreen,
    undo,
    redo,
    slidesRef,
    currentSlide,
    isFullscreen,
    isPresenting,
    editingText,
    prevThumbnailState,
    isSpotlightActive,
    spotlightContentIndex,
    setSpotlightContentIndex,
    setIsShaking,
    setIsPresenting,
    setViewMode,
    setShowThumbnails,
    setPresentZoom,
    setIsSpotlightActive,
    setEditingText,
  ]);
}
