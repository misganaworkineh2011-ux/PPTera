import { useEffect, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { SlideData } from "~/components/presentation/types";

interface UsePresenterChannelParams {
  presentationId: string;
  slidesRef: React.RefObject<SlideData[]>;
  setPresenterViewConnected: Dispatch<SetStateAction<boolean>>;
  setIsPresenting: Dispatch<SetStateAction<boolean>>;
  setViewMode: Dispatch<SetStateAction<"slides" | "scroll">>;
  setShowThumbnails: Dispatch<SetStateAction<boolean>>;
  setCurrentSlide: Dispatch<SetStateAction<number>>;
}

export const usePresenterChannel = ({
  presentationId,
  slidesRef,
  setPresenterViewConnected,
  setIsPresenting,
  setViewMode,
  setShowThumbnails,
  setCurrentSlide,
}: UsePresenterChannelParams) => {
  const presenterChannelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    presenterChannelRef.current = new BroadcastChannel(`presentation-${presentationId}`);

    presenterChannelRef.current.onmessage = (event: MessageEvent) => {
      const { type, slideIndex } = event.data as { type: string; slideIndex?: number };

      switch (type) {
        case "presenter-opened":
          setPresenterViewConnected(true);
          presenterChannelRef.current?.postMessage({ type: "main-connected" });
          break;
        case "presenter-closed":
          setPresenterViewConnected(false);
          setIsPresenting(false);
          setViewMode("scroll");
          setShowThumbnails(true);
          break;
        case "slide-change":
          if (
            typeof slideIndex === "number" &&
            slideIndex >= 0 &&
            slideIndex < slidesRef.current.length
          ) {
            setCurrentSlide(slideIndex);
          }
          break;
        case "enter-fullscreen":
          if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {
              // Fullscreen blocked by browser - already in presentation mode so this is fine
            });
          }
          break;
      }
    };

    return () => {
      presenterChannelRef.current?.postMessage({ type: "main-disconnected" });
      presenterChannelRef.current?.close();
    };
  }, [
    presentationId,
    setPresenterViewConnected,
    setIsPresenting,
    setViewMode,
    setShowThumbnails,
    setCurrentSlide,
    slidesRef,
  ]);
};
