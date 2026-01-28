import { useEffect, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import type { SlideData } from "~/components/presentation/types";
import {
  addStreamingPlaceholderSlide,
  updateSlidesWithField,
  updateSlidesWithBullet,
  updateSlidesWithImage,
  updateSlidesWithSlideComplete,
  mergeStreamingSlides,
} from "../utils";

export type StreamingStatus = "idle" | "loading" | "streaming" | "complete";

interface UsePresentationStreamingParams {
  presentationId: string;
  isStreaming: boolean;
  streamingStatus: StreamingStatus;
  setStreamingStatus: Dispatch<SetStateAction<StreamingStatus>>;
  setSlidesData: Dispatch<SetStateAction<SlideData[]>>;
  setStreamingSlideIndex: Dispatch<SetStateAction<number>>;
  setImagesLoading: Dispatch<SetStateAction<Set<number>>>;
}

export const usePresentationStreaming = ({
  presentationId,
  isStreaming,
  streamingStatus,
  setStreamingStatus,
  setSlidesData,
  setStreamingSlideIndex,
  setImagesLoading,
}: UsePresentationStreamingParams) => {
  const streamingTextRef = useRef<Record<number, Record<string, string>>>({});
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!isStreaming || streamingStatus !== "loading") return;

    const globalKey = `__streaming_${presentationId}`;
    const existingEventSource = (window as unknown as Record<string, EventSource | undefined>)[globalKey];

    if (existingEventSource && existingEventSource.readyState !== EventSource.CLOSED) {
      console.log("[Streaming] Using existing global EventSource");
      eventSourceRef.current = existingEventSource;
      return;
    }

    if (eventSourceRef.current && eventSourceRef.current.readyState !== EventSource.CLOSED) {
      console.log("[Streaming] Already have an active EventSource");
      return;
    }

    console.log("[Streaming] Creating new EventSource for presentation:", presentationId);
    const eventSource = new EventSource(`/api/presentations/${presentationId}/stream-content`);
    eventSourceRef.current = eventSource;
    (window as unknown as Record<string, EventSource>)[globalKey] = eventSource;

    eventSource.onopen = () => {
      console.log("[Streaming] Connection opened successfully");
    };

    eventSource.addEventListener("start", (e) => {
      const data = JSON.parse(e.data);
      console.log("[Streaming] ✓ Received START event, total slides:", data.totalSlides);
      setStreamingStatus("streaming");
      setSlidesData([]);
      streamingTextRef.current = {};
    });

    eventSource.addEventListener("slideStart", (e) => {
      const data = JSON.parse(e.data);
      console.log("[Streaming] ✓ Received SLIDE_START event:", data.slideIndex, data.type, "hasImage:", data.hasImage);
      setStreamingSlideIndex(data.slideIndex);

      setSlidesData(prev => {
        console.log("[Streaming] Adding slide", data.slideIndex, "to slidesData, current length:", prev.length);
        return addStreamingPlaceholderSlide(prev, data.slideIndex, data.type, data.hasImage);
      });

      streamingTextRef.current[data.slideIndex] = { "_currentBulletIndex": "0" };

      if (data.hasImage) {
        setImagesLoading(prev => new Set(prev).add(data.slideIndex));
      }
    });

    eventSource.addEventListener("char", (e) => {
      const data = JSON.parse(e.data);
      const { slideIndex, field, char } = data;

      if (!streamingTextRef.current[slideIndex]) {
        streamingTextRef.current[slideIndex] = {};
      }

      if (field === "bullet") {
        const currentBulletKey = "_currentBulletIndex";
        const bulletIndex = parseInt(streamingTextRef.current[slideIndex]![currentBulletKey] ?? "0", 10);
        const bulletKey = `bullet_${bulletIndex}`;

        streamingTextRef.current[slideIndex]![bulletKey] =
          (streamingTextRef.current[slideIndex]![bulletKey] || "") + char;

        const currentBulletText = streamingTextRef.current[slideIndex]![bulletKey] || "";

        setSlidesData(prev => updateSlidesWithBullet(prev, slideIndex, bulletIndex, currentBulletText));
      } else {
        streamingTextRef.current[slideIndex]![field] =
          (streamingTextRef.current[slideIndex]![field] || "") + char;

        const currentText = streamingTextRef.current[slideIndex]![field];
        setSlidesData(prev => updateSlidesWithField(prev, slideIndex, field, currentText));
      }
    });

    eventSource.addEventListener("fieldComplete", (e) => {
      const data = JSON.parse(e.data);
      console.log("[Streaming] ✓ Received FIELD_COMPLETE:", data.slideIndex, data.field, "value length:", data.value?.length);
      setSlidesData(prev => updateSlidesWithField(prev, data.slideIndex, data.field, data.value));
    });

    eventSource.addEventListener("bulletComplete", (e) => {
      const data = JSON.parse(e.data);
      const { slideIndex, bulletIndex, value } = data;
      console.log("[Streaming] ✓ Received BULLET_COMPLETE:", slideIndex, "bullet", bulletIndex);

      if (streamingTextRef.current[slideIndex]) {
        streamingTextRef.current[slideIndex]![_currentBulletIndexKey] = String(bulletIndex + 1);
      }

      setSlidesData(prev => updateSlidesWithBullet(prev, slideIndex, bulletIndex, value));
    });

    eventSource.addEventListener("imageReady", (e) => {
      const data = JSON.parse(e.data);
      console.log("[Streaming] ✓ Received IMAGE_READY:", data.slideIndex, "url:", data.image?.url?.substring(0, 50));
      setSlidesData(prev => updateSlidesWithImage(prev, data.slideIndex, data.image));
      setImagesLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.slideIndex);
        return newSet;
      });
    });

    eventSource.addEventListener("slideComplete", (e) => {
      const data = JSON.parse(e.data);
      console.log("[Streaming] ✓ Received SLIDE_COMPLETE:", data.slideIndex, "title:", data.slide?.title);
      setSlidesData(prev => {
        const nextSlides = updateSlidesWithSlideComplete(prev, data.slideIndex, data.slide);
        console.log("[Streaming] Updated slidesData, new length:", nextSlides.length);
        return nextSlides;
      });
    });

    eventSource.addEventListener("complete", (e) => {
      const data = JSON.parse(e.data);
      console.log("[Streaming] ✓ Received COMPLETE event, slides:", data.slides?.length);
      setSlidesData(prev => mergeStreamingSlides(prev, data.slides));
      setStreamingStatus("complete");
      setStreamingSlideIndex(-1);

      const url = new URL(window.location.href);
      url.searchParams.delete("streaming");
      window.history.replaceState({}, "", url.toString());

      eventSource.close();
      eventSourceRef.current = null;
      delete (window as unknown as Record<string, unknown>)[globalKey];
    });

    eventSource.addEventListener("error", (e: Event) => {
      console.error("[Streaming] ✗ Error event received:", e);
      if (e instanceof MessageEvent) {
        try {
          const data = JSON.parse(e.data);
          console.error("[Streaming] Server error:", data.message);
          toast.error(data.message || "Streaming error occurred");
        } catch {
          console.error("[Streaming] Error parsing error event");
        }
        setStreamingStatus("complete");
        eventSource.close();
        eventSourceRef.current = null;
        delete (window as unknown as Record<string, unknown>)[globalKey];
      } else {
        console.error("[Streaming] EventSource connection error:", e);
        if (eventSource.readyState === EventSource.CLOSED) {
          console.error("[Streaming] Connection was closed by server/network");
          setStreamingStatus("complete");
          eventSourceRef.current = null;
          delete (window as unknown as Record<string, unknown>)[globalKey];
        }
      }
    });

    eventSource.onmessage = (e) => {
      console.log("[Streaming] Generic message:", e.data);
    };

    return () => {
      console.log("[Streaming] Cleanup called, but keeping EventSource alive (global)");
    };
  }, [
    isStreaming,
    streamingStatus,
    presentationId,
    setStreamingStatus,
    setSlidesData,
    setStreamingSlideIndex,
    setImagesLoading,
  ]);

  useEffect(() => {
    return () => {
      console.log("[Streaming] Component unmounting, cleaning up");
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      const globalKey = `__streaming_${presentationId}`;
      const globalEventSource = (window as unknown as Record<string, EventSource | undefined>)[globalKey];
      if (globalEventSource) {
        globalEventSource.close();
        delete (window as unknown as Record<string, unknown>)[globalKey];
      }
    };
  }, [presentationId]);
};

const _currentBulletIndexKey = "_currentBulletIndex";
