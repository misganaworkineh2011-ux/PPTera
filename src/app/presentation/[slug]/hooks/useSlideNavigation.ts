import { useCallback } from "react";

interface UseSlideNavigationOptions {
  slidesLength: number;
  currentSlide: number;
  isAnimating: boolean;
  setIsAnimating: (value: boolean) => void;
  setCurrentSlide: (index: number) => void;
  setIsShaking: (value: boolean) => void;
}

export function useSlideNavigation({
  slidesLength,
  currentSlide,
  isAnimating,
  setIsAnimating,
  setCurrentSlide,
  setIsShaking,
}: UseSlideNavigationOptions) {
  const goToSlide = useCallback(
    (index: number) => {
      if (index >= 0 && index < slidesLength && !isAnimating) {
        setIsAnimating(true);
        setCurrentSlide(index);
        setTimeout(() => setIsAnimating(false), 300);
      }
    },
    [slidesLength, isAnimating, setIsAnimating, setCurrentSlide],
  );

  const nextSlide = useCallback(() => {
    if (currentSlide >= slidesLength - 1) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }
    goToSlide(currentSlide + 1);
  }, [currentSlide, goToSlide, slidesLength, setIsShaking]);

  const prevSlide = useCallback(() => goToSlide(currentSlide - 1), [currentSlide, goToSlide]);

  return { goToSlide, nextSlide, prevSlide };
}
