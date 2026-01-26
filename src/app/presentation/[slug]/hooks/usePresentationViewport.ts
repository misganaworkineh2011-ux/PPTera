import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";

interface UsePresentationViewportParams {
  setIsMobile: Dispatch<SetStateAction<boolean>>;
  setViewMode: Dispatch<SetStateAction<"slides" | "scroll">>;
  setShowThumbnails: Dispatch<SetStateAction<boolean>>;
}

export const usePresentationViewport = ({
  setIsMobile,
  setViewMode,
  setShowThumbnails,
}: UsePresentationViewportParams) => {
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setViewMode("scroll");
        setShowThumbnails(false);
      }
      // On desktop, let user control thumbnail visibility - don't force it open
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [setIsMobile, setViewMode, setShowThumbnails]);
};
