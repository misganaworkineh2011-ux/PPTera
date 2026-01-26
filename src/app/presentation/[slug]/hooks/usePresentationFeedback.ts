import { useState } from "react";

interface UsePresentationFeedbackParams {
  mode: string;
  presentationId: string;
}

export const usePresentationFeedback = ({
  mode,
  presentationId,
}: UsePresentationFeedbackParams) => {
  const [showFeedback, setShowFeedback] = useState(() => {
    if (typeof window === "undefined") return false;
    if (mode !== "ai") return false;
    const seenKey = `ppt-seen-${presentationId}`;
    const hasSeen = sessionStorage.getItem(seenKey);
    if (!hasSeen) {
      sessionStorage.setItem(seenKey, "true");
      return true;
    }
    return false;
  });

  return { showFeedback, setShowFeedback };
};
