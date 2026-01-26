import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { type SlideData } from "~/components/presentation/types";

interface UseSlidesHistoryOptions {
  initialSlides: SlideData[];
  presentationId: string;
  isOwner: boolean;
  maxHistorySize?: number;
}

export interface SlidesHistoryState {
  slidesData: SlideData[];
  setSlidesData: Dispatch<SetStateAction<SlideData[]>>;
  slidesRef: React.MutableRefObject<SlideData[]>;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  updateSlidesWithSave: (newSlides: SlideData[]) => void;
}

export function useSlidesHistory({
  initialSlides,
  presentationId,
  isOwner,
  maxHistorySize = 50,
}: UseSlidesHistoryOptions): SlidesHistoryState {
  const [slidesData, setSlidesData] = useState<SlideData[]>(initialSlides);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [history, setHistory] = useState<SlideData[][]>([initialSlides]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const isUndoRedoAction = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const slidesRef = useRef<SlideData[]>(initialSlides);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  useEffect(() => {
    slidesRef.current = slidesData;
  }, [slidesData]);

  const saveSlides = useCallback(async () => {
    if (!isOwner) return;
    setIsSaving(true);
    try {
      const response = await fetch(`/api/presentations/${presentationId}/slides`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slides: slidesRef.current }),
      });
      if (response.ok) {
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      console.error("Failed to save slides:", error);
    } finally {
      setIsSaving(false);
    }
  }, [isOwner, presentationId]);

  const undo = useCallback(() => {
    if (canUndo) {
      isUndoRedoAction.current = true;
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const previousState = history[newIndex];
      if (previousState) {
        setSlidesData(previousState);
        slidesRef.current = previousState;
        setHasUnsavedChanges(true);
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
          saveSlides();
        }, 2000);
      }
    }
  }, [canUndo, historyIndex, history, saveSlides]);

  const redo = useCallback(() => {
    if (canRedo) {
      isUndoRedoAction.current = true;
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const nextState = history[newIndex];
      if (nextState) {
        setSlidesData(nextState);
        slidesRef.current = nextState;
        setHasUnsavedChanges(true);
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
          saveSlides();
        }, 2000);
      }
    }
  }, [canRedo, historyIndex, history, saveSlides]);

  const updateSlidesWithSave = useCallback((newSlides: SlideData[]) => {
    setSlidesData(newSlides);
    slidesRef.current = newSlides;
    setHasUnsavedChanges(true);

    if (!isUndoRedoAction.current) {
      setHistory(prev => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push(newSlides);
        if (newHistory.length > maxHistorySize) {
          newHistory.shift();
        }
        return newHistory;
      });
      setHistoryIndex(prev => Math.min(prev + 1, maxHistorySize - 1));
    }
    isUndoRedoAction.current = false;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveSlides();
    }, 2000);
  }, [saveSlides, historyIndex, maxHistorySize]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    slidesData,
    setSlidesData,
    slidesRef,
    isSaving,
    hasUnsavedChanges,
    canUndo,
    canRedo,
    undo,
    redo,
    updateSlidesWithSave,
  };
}
