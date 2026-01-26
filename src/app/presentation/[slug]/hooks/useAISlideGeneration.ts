import { useCallback } from "react";
import { toast } from "sonner";
import { type SlideData } from "~/components/presentation/types";

interface UseAISlideGenerationOptions {
  slidesData: SlideData[];
  updateSlidesWithSave: (newSlides: SlideData[]) => void;
  setCurrentSlide: (index: number) => void;
  presentationTitle: string;
}

export function useAISlideGeneration({
  slidesData,
  updateSlidesWithSave,
  setCurrentSlide,
  presentationTitle,
}: UseAISlideGenerationOptions) {
  const handleAddAISlide = useCallback(async (index: number, prompt: string) => {
    const previousSlide = slidesData[index];
    const nextSlide = slidesData[index + 1];

    try {
      const response = await fetch("/api/ai/generate-slide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          presentationContext: presentationTitle,
          previousSlide: previousSlide
            ? {
                title: previousSlide.title,
                bulletPoints: previousSlide.bulletPoints,
              }
            : undefined,
          nextSlide: nextSlide
            ? {
                title: nextSlide.title,
                bulletPoints: nextSlide.bulletPoints,
              }
            : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate slide");
      }

      const data = await response.json();
      if (data.success && data.slide) {
        const newSlides = [...slidesData];
        newSlides.splice(index + 1, 0, data.slide);
        updateSlidesWithSave(newSlides);
        setCurrentSlide(index + 1);
        toast.success("AI slide generated!", {
          description: `${data.creditsUsed} credits used`,
        });
      } else {
        throw new Error("No slide content returned");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to generate slide";
      toast.error(message);
      throw error;
    }
  }, [slidesData, presentationTitle, updateSlidesWithSave, setCurrentSlide]);

  return { handleAddAISlide };
}
