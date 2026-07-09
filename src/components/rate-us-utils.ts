const STORAGE_KEY = "pptmaster_rate_prompt";
export const PRESENTATIONS_THRESHOLD = 5;

interface RatePromptData {
  presentationCount: number;
  hasReviewed: boolean;
  skippedCount: number;
  lastSkipped: number | null;
}

function getRatePromptData(): RatePromptData {
  if (typeof window === "undefined") {
    return { presentationCount: 0, hasReviewed: false, skippedCount: 0, lastSkipped: null };
  }
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : { presentationCount: 0, hasReviewed: false, skippedCount: 0, lastSkipped: null };
  } catch {
    return { presentationCount: 0, hasReviewed: false, skippedCount: 0, lastSkipped: null };
  }
}

export function markAsReviewed() {
  const data = getRatePromptData();
  data.hasReviewed = true;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function markAsSkipped() {
  const data = getRatePromptData();
  data.skippedCount = (data.skippedCount || 0) + 1;
  data.lastSkipped = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function shouldShowRatePrompt(): boolean {
  const data = getRatePromptData();
  if (data.hasReviewed) return false;
  if (data.skippedCount >= 3) return false;
  const threshold = PRESENTATIONS_THRESHOLD * (1 + (data.skippedCount || 0));
  return data.presentationCount >= threshold && data.presentationCount % PRESENTATIONS_THRESHOLD === 0;
}

export function incrementPresentationCount(): boolean {
  const data = getRatePromptData();
  data.presentationCount = (data.presentationCount || 0) + 1;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return shouldShowRatePrompt();
}

export async function checkExistingReview(): Promise<boolean> {
  try {
    const res = await fetch("/api/reviews?my=true");
    const data = await res.json();
    if (data.review) {
      markAsReviewed();
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
