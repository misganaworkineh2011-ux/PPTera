import { useCallback, useEffect, useState } from "react";
import type { SlideData } from "~/components/presentation/types";
import { layoutSupportsReveal } from "~/components/presentation/item-animations";

interface UseSlideNavigationOptions {
  slidesLength: number;
  currentSlide: number;
  isAnimating: boolean;
  setIsAnimating: (value: boolean) => void;
  setCurrentSlide: (index: number) => void;
  setIsShaking: (value: boolean) => void;
  isFreeUserLimited?: boolean;
  halfBlurredSlideIndex?: number;
  onUpgrade?: () => void;
  // Click-to-reveal builds: when active (any presenting surface), slides with
  // itemBuild reveal their content items one Next-press at a time before the
  // deck advances.
  slidesData?: SlideData[];
  revealBuildsActive?: boolean;
}

// Item count for build purposes — mirrors how renderers derive content items.
function countBuildItems(s?: SlideData): number {
  if (!s || s.type === "title") return 0;
  if (s.sections && s.sections.length > 0) return s.sections.length;
  const transformedItems = s.transformedContent?.items?.filter((it) => it.label);
  if (transformedItems && transformedItems.length > 0) return transformedItems.length;
  return s.bulletPoints?.length ?? 0;
}

export function useSlideNavigation({
  slidesLength,
  currentSlide,
  isAnimating,
  setIsAnimating,
  setCurrentSlide,
  setIsShaking,
  isFreeUserLimited = false,
  halfBlurredSlideIndex,
  onUpgrade,
  slidesData,
  revealBuildsActive = false,
}: UseSlideNavigationOptions) {
  // Calculate the maximum slide index for free users
  const maxSlideIndex = isFreeUserLimited && halfBlurredSlideIndex !== undefined
    ? halfBlurredSlideIndex
    : slidesLength - 1;

  const [revealCount, setRevealCount] = useState(0);

  const buildFor = useCallback(
    (s?: SlideData) =>
      revealBuildsActive &&
      !!s &&
      s.itemBuild === true &&
      s.contentAnimation !== false &&
      layoutSupportsReveal(s.contentLayout) &&
      countBuildItems(s) > 0,
    [revealBuildsActive],
  );

  // Entering a presenting surface starts the current slide's build fresh.
  useEffect(() => {
    if (revealBuildsActive) setRevealCount(0);
  }, [revealBuildsActive]);

  const goToSlide = useCallback(
    (index: number) => {
      // Check if trying to navigate to a locked slide
      if (isFreeUserLimited && halfBlurredSlideIndex !== undefined && index > halfBlurredSlideIndex) {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        onUpgrade?.();
        return;
      }

      // A direct jump (thumbnail click / goToSlide) must ALWAYS work — don't
      // gate it on isAnimating, or clicks that land during the 300ms animation
      // window get silently dropped ("navigator not navigating").
      if (index >= 0 && index < slidesLength && index !== currentSlide) {
        setIsAnimating(true);
        setCurrentSlide(index);
        setRevealCount(0);
        setTimeout(() => setIsAnimating(false), 300);
        // In the continuous (scroll) view, bring the target slide into view so the
        // main viewer and the navigator highlight stay in sync. This is a no-op
        // in single-slide / present mode, where no `slide-<i>` element exists.
        if (typeof document !== "undefined") {
          document
            .getElementById(`slide-${index}`)
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    },
    [slidesLength, currentSlide, setIsAnimating, setCurrentSlide, isFreeUserLimited, halfBlurredSlideIndex, setIsShaking, onUpgrade],
  );

  const nextSlide = useCallback(() => {
    // Click-to-reveal: bring in the next content item before advancing.
    const current = slidesData?.[currentSlide];
    if (buildFor(current) && revealCount < countBuildItems(current)) {
      setRevealCount((c) => c + 1);
      return;
    }

    // Check if at the limit for free users
    if (isFreeUserLimited && halfBlurredSlideIndex !== undefined && currentSlide >= halfBlurredSlideIndex) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      onUpgrade?.();
      return;
    }

    if (currentSlide >= slidesLength - 1) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }
    goToSlide(currentSlide + 1);
  }, [currentSlide, goToSlide, slidesLength, setIsShaking, isFreeUserLimited, halfBlurredSlideIndex, onUpgrade, slidesData, buildFor, revealCount]);

  const prevSlide = useCallback(() => {
    // Click-to-reveal: step the build backwards before leaving the slide.
    const current = slidesData?.[currentSlide];
    if (buildFor(current) && revealCount > 0) {
      setRevealCount((c) => c - 1);
      return;
    }

    const target = currentSlide - 1;
    goToSlide(target);
    // Arriving backwards shows the previous slide fully revealed.
    const prev = slidesData?.[target];
    if (buildFor(prev)) setRevealCount(countBuildItems(prev));
  }, [currentSlide, goToSlide, slidesData, buildFor, revealCount]);

  return { goToSlide, nextSlide, prevSlide, revealCount };
}
