"use client";

import { useState, useCallback, useRef } from "react";
import type { SlideData } from "~/components/presentation/types";

export interface PresentationStreamState {
  status: "idle" | "connecting" | "streaming" | "loading-images" | "completed" | "error";
  presentationId: string | null;
  slug: string | null;
  slides: SlideData[];
  currentSlideIndex: number;
  totalSlides: number;
  imagesLoading: Set<number>; // Slide indices with images currently loading
  imagesLoaded: Set<number>; // Slide indices with images loaded
  error: string | null;
  redirectUrl: string | null;
}

interface StreamPayload {
  outlineId: string;
  slides: unknown[];
  theme: string;
  imageSource: string;
  textDensity?: string;
  metadata: {
    topic: string;
    totalSlides: number;
    tone: string;
    language: string;
  };
  imageModel?: string;
}

export function usePresentationStream() {
  const [state, setState] = useState<PresentationStreamState>({
    status: "idle",
    presentationId: null,
    slug: null,
    slides: [],
    currentSlideIndex: -1,
    totalSlides: 0,
    imagesLoading: new Set(),
    imagesLoaded: new Set(),
    error: null,
    redirectUrl: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const startStream = useCallback(async (payload: StreamPayload) => {
    // Reset state
    setState({
      status: "connecting",
      presentationId: null,
      slug: null,
      slides: [],
      currentSlideIndex: -1,
      totalSlides: payload.slides.length,
      imagesLoading: new Set(),
      imagesLoaded: new Set(),
      error: null,
      redirectUrl: null,
    });

    // Create abort controller
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/create-presentation/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        let message = "Failed to start presentation creation";
        try {
          const errorData = await response.json();
          message = errorData.message || errorData.error || message;
        } catch {
          try {
            const text = await response.text();
            if (text) message = text;
          } catch {
            // ignore
          }
        }
        setState((prev) => ({
          ...prev,
          status: "error",
          error: message,
        }));
        return;
      }

      if (!response.body) {
        setState((prev) => ({
          ...prev,
          status: "error",
          error: "No response body",
        }));
        return;
      }

      setState((prev) => ({ ...prev, status: "streaming" }));

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Parse SSE events from buffer
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        let currentEvent = "";
        let currentData = "";

        for (const line of lines) {
          if (line.startsWith("event: ")) {
            currentEvent = line.slice(7);
          } else if (line.startsWith("data: ")) {
            currentData = line.slice(6);

            if (currentEvent && currentData) {
              try {
                const data = JSON.parse(currentData);
                handleEvent(currentEvent, data);
              } catch (e) {
                console.error("Failed to parse SSE data:", e);
              }
              currentEvent = "";
              currentData = "";
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setState((prev) => ({
          ...prev,
          status: "idle",
          error: "Creation cancelled",
        }));
      } else {
        setState((prev) => ({
          ...prev,
          status: "error",
          error: error instanceof Error ? error.message : "An unexpected error occurred",
        }));
      }
    }
  }, []);

  const handleEvent = useCallback((event: string, data: unknown) => {
    switch (event) {
      case "presentationStart": {
        const { presentationId, slug, totalSlides } = data as {
          presentationId: string;
          slug: string;
          totalSlides: number;
        };
        setState((prev) => ({
          ...prev,
          presentationId,
          slug,
          totalSlides,
        }));
        break;
      }

      case "slideStart": {
        const { slideIndex, slide } = data as { slideIndex: number; slide: SlideData };
        setState((prev) => {
          const newSlides = [...prev.slides];
          // Add slide with placeholder image if needed
          newSlides[slideIndex] = {
            ...slide,
            image: slide.image ? { ...slide.image, source: "placeholder" as const } : undefined,
          };
          return {
            ...prev,
            slides: newSlides,
            currentSlideIndex: slideIndex,
          };
        });
        break;
      }

      case "slideContent": {
        const { slideIndex, field, value } = data as {
          slideIndex: number;
          field: string;
          value: unknown;
        };
        setState((prev) => {
          const newSlides = [...prev.slides];
          const slide = newSlides[slideIndex];
          if (slide) {
            newSlides[slideIndex] = { ...slide, [field]: value };
          }
          return { ...prev, slides: newSlides };
        });
        break;
      }

      case "slideComplete": {
        const { slideIndex, slide } = data as { slideIndex: number; slide: SlideData };
        setState((prev) => {
          const newSlides = [...prev.slides];
          newSlides[slideIndex] = slide;
          return {
            ...prev,
            slides: newSlides,
            currentSlideIndex: slideIndex,
          };
        });
        break;
      }

      case "imagesStart": {
        const { slideIndices } = data as { slideIndices: number[] };
        setState((prev) => ({
          ...prev,
          status: "loading-images",
          imagesLoading: new Set(slideIndices),
        }));
        break;
      }

      case "imageLoaded": {
        const { slideIndex, image } = data as {
          slideIndex: number;
          image: { url: string; alt: string; source: string; photographer?: string; photographerUrl?: string };
        };
        setState((prev) => {
          const newSlides = [...prev.slides];
          const slide = newSlides[slideIndex];
          if (slide) {
            newSlides[slideIndex] = { ...slide, image };
          }
          const newLoading = new Set(prev.imagesLoading);
          newLoading.delete(slideIndex);
          const newLoaded = new Set(prev.imagesLoaded);
          newLoaded.add(slideIndex);
          return {
            ...prev,
            slides: newSlides,
            imagesLoading: newLoading,
            imagesLoaded: newLoaded,
          };
        });
        break;
      }

      case "imageBatchComplete": {
        const { batchIndex, totalBatches } = data as { batchIndex: number; totalBatches: number };
        console.log(`[PresentationStream] Image batch ${batchIndex + 1}/${totalBatches} complete`);
        break;
      }

      case "presentationComplete": {
        const { presentationId, slug, redirectUrl, slides } = data as {
          presentationId: string;
          slug: string;
          redirectUrl: string;
          slides: SlideData[];
        };
        setState((prev) => ({
          ...prev,
          status: "completed",
          presentationId,
          slug,
          redirectUrl,
          slides,
          imagesLoading: new Set(),
        }));
        break;
      }

      case "error": {
        const { message } = data as { message: string };
        setState((prev) => ({
          ...prev,
          status: "error",
          error: message,
        }));
        break;
      }
    }
  }, []);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    cancel();
    setState({
      status: "idle",
      presentationId: null,
      slug: null,
      slides: [],
      currentSlideIndex: -1,
      totalSlides: 0,
      imagesLoading: new Set(),
      imagesLoaded: new Set(),
      error: null,
      redirectUrl: null,
    });
  }, [cancel]);

  return {
    state,
    startStream,
    cancel,
    reset,
  };
}
