"use client";

import { useState, useCallback, useRef } from "react";

// Visual metadata types for intelligent presentation generation
export interface VisualStrategy {
  primary: string; // dominant visual form (e.g., diagram, icons, image, chart, mixed)
  pattern: string; // layout metaphor or pattern (e.g., spotlight, flow, cards, split, timeline)
  emphasis: string; // visual emphasis or focus (e.g., progression, contrast, relationship)
}

export interface SlideImage {
  required: boolean;
  style?: string | null; // e.g., conceptual-illustration, realistic-photo, abstract
  promptHint?: string | null; // Legacy - for backward compatibility
  pexelsPromptHint?: string | null; // Short keywords for Pexels search (3-5 words)
  aiPromptHint?: string | null; // Detailed description for AI generation
}

export interface SlideChart {
  type: string; // e.g., bar, line, pie, stacked, comparison, table, area, scatter
  purpose: string; // what insight the chart communicates
}

export interface SlideAssets {
  icons: string[]; // icon names matching bullet points count
  image: SlideImage;
  chart?: SlideChart | null;
}

export interface Slide {
  type: "title" | "content";
  title: string;
  subtitle?: string;
  bulletPoints?: string[];
  // Visual metadata for intelligent presentation generation
  semanticIntent?: string; // core meaning of the slide (free-form, e.g., process, concept, comparison)
  visualStrategy?: VisualStrategy;
  assets?: SlideAssets;
  // Title slide specific
  image?: SlideImage;
  // Content layout hint from outline (e.g., "boxes", "bullets", "sequence")
  contentLayoutHint?: string;
  // Short uppercase eyebrow/kicker label shown above a content slide's heading
  kicker?: string;
}

export interface OutlineMetadata {
  topic: string;
  totalSlides: number;
  tone: string;
  language: string;
}

export interface OutlineStreamState {
  status: "idle" | "connecting" | "streaming" | "completed" | "error";
  outlineId: string | null;
  slides: Slide[];
  currentSlideIndex: number;
  totalSlides: number;
  metadata: OutlineMetadata | null;
  creditsRemaining: number | null;
  error: string | null;
  rawContent: string;
}

interface StreamPayload {
  description: string;
  numberOfSlides: number;
  tone: string;
  language: string;
  outlineId?: string | null;
  /** "Amount of text per card" — biases layout choice at outline time. */
  textDensity?: string;
}

export function useOutlineStream() {
  const [state, setState] = useState<OutlineStreamState>({
    status: "idle",
    outlineId: null,
    slides: [],
    currentSlideIndex: -1,
    totalSlides: 0,
    metadata: null,
    creditsRemaining: null,
    error: null,
    rawContent: "",
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const startStream = useCallback(async (payload: StreamPayload) => {
    // Reset state
    setState({
      status: "connecting",
      outlineId: null,
      slides: [],
      currentSlideIndex: -1,
      totalSlides: payload.numberOfSlides,
      metadata: null,
      creditsRemaining: null,
      error: null,
      rawContent: "",
    });

    // Create abort controller
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/generate-outline/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        // Try to parse JSON error first, fallback to text
        let message = "Failed to start generation";
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
        buffer = lines.pop() || ""; // Keep incomplete line in buffer

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
          error: "Generation cancelled",
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
      case "outlineStart": {
        const { outlineId, totalSlides } = data as { outlineId: string; totalSlides: number };
        setState((prev) => ({
          ...prev,
          outlineId,
          totalSlides,
        }));
        break;
      }

      case "chunk": {
        const { content } = data as { content: string };
        setState((prev) => ({
          ...prev,
          rawContent: prev.rawContent + content,
        }));
        break;
      }

      case "slideComplete": {
        const { slideIndex, slide } = data as { slideIndex: number; slide: Slide; totalSlides: number };
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

      case "outlineDone": {
        const { outlineId, slides, metadata, creditsRemaining } = data as {
          outlineId: string;
          slides: Slide[];
          metadata: OutlineMetadata;
          creditsRemaining: number;
        };
        setState((prev) => ({
          ...prev,
          status: "completed",
          outlineId,
          slides,
          metadata,
          creditsRemaining,
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
      outlineId: null,
      slides: [],
      currentSlideIndex: -1,
      totalSlides: 0,
      metadata: null,
      creditsRemaining: null,
      error: null,
      rawContent: "",
    });
  }, [cancel]);

  return {
    state,
    startStream,
    cancel,
    reset,
  };
}

