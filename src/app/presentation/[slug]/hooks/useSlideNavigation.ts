import { useCallback } from "react";

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
}: UseSlideNavigationOptions) {
  // Calculate the maximum slide index for free users
  const maxSlideIndex = isFreeUserLimited && halfBlurredSlideIndex !== undefined 
    ? halfBlurredSlideIndex 
    : slidesLength - 1;

  const goToSlide = useCallback(
    (index: number) => {
      // Check if trying to navigate to a locked slide
      if (isFreeUserLimited && halfBlurredSlideIndex !== undefined && index > halfBlurredSlideIndex) {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        onUpgrade?.();
        return;
      }

      if (index >= 0 && index < slidesLength && !isAnimating) {
        setIsAnimating(true);
        setCurrentSlide(index);
        setTimeout(() => setIsAnimating(false), 300);
      }
    },
    [slidesLength, isAnimating, setIsAnimating, setCurrentSlide, isFreeUserLimited, halfBlurredSlideIndex, setIsShaking, onUpgrade],
  );

  const nextSlide = useCallback(() => {
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
  }, [currentSlide, goToSlide, slidesLength, setIsShaking, isFreeUserLimited, halfBlurredSlideIndex, onUpgrade]);

  const prevSlide = useCallback(() => goToSlide(currentSlide - 1), [currentSlide, goToSlide]);

  return { goToSlide, nextSlide, prevSlide };
}
