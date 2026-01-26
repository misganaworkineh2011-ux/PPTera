import { useCallback, useEffect, useRef, type Dispatch, type SetStateAction } from "react";

interface UseFullscreenControlsOptions {
  showThumbnails: boolean;
  setShowThumbnails: Dispatch<SetStateAction<boolean>>;
  setIsFullscreen: Dispatch<SetStateAction<boolean>>;
}

export function useFullscreenControls({
  showThumbnails,
  setShowThumbnails,
  setIsFullscreen,
}: UseFullscreenControlsOptions) {
  const thumbnailsBeforeFullscreenRef = useRef<boolean>(true);
  const wasFullscreenRef = useRef<boolean>(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement;

      if (wasFullscreenRef.current && !isNowFullscreen) {
        setShowThumbnails(thumbnailsBeforeFullscreenRef.current);
      }

      wasFullscreenRef.current = isNowFullscreen;
      setIsFullscreen(isNowFullscreen);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [setIsFullscreen, setShowThumbnails]);

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      thumbnailsBeforeFullscreenRef.current = showThumbnails;
      await document.documentElement.requestFullscreen();
      setShowThumbnails(false);
    } else {
      await document.exitFullscreen();
    }
  }, [showThumbnails, setShowThumbnails]);

  return { toggleFullscreen };
}
