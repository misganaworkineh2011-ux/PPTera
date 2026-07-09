"use client";

import { useState, useRef, useEffect } from "react";
import {
  X,
  Send,
  Loader2,
  Sparkles,
  Wand2,
  Languages,
  FileText,
  Minimize2,
  Lock,
  Plus,
} from "lucide-react";
import type { Theme } from "~/lib/themes";
import type { SlideData } from "~/components/presentation/types";
import { getModalColors } from "./ui-colors";
import { useLanguage } from "~/contexts/LanguageContext";
import { dashboardTranslations } from "~/lib/dashboard-translations";
import PricingModal from "~/components/dashboard/PricingModal";

interface AgentPanelProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  slides: SlideData[];
  currentSlideIndex: number;
  presentationTitle: string;
  presentationId: string;
  onUpdateSlide: (index: number, slide: SlideData) => void;
  /** Replace the whole deck at once (used for structural AI edits: add/delete/reorder). */
  onReplaceSlides?: (slides: SlideData[]) => void;
  onSetEditingSlide?: (index: number | null) => void;
  subscriptionPlan?: string | null;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  prompt: string;
  category: "writing" | "style" | "content";
}

interface SlideProgress {
  status: "pending" | "processing" | "loading-image" | "complete";
  title?: string;
}

const quickActions: QuickAction[] = [
  {
    id: "improve",
    label: "improveWriting",
    icon: <Wand2 size={14} />,
    prompt:
      "Improve the writing quality of all text content including titles, subtitles, and bullet points. Make it more professional and engaging.",
    category: "writing",
  },
  {
    id: "grammar",
    label: "fixSpellingGrammarBtn",
    icon: <FileText size={14} />,
    prompt:
      "Fix any spelling and grammar errors in all text content including titles, subtitles, and bullet points.",
    category: "writing",
  },
  {
    id: "translate",
    label: "translateBtn",
    icon: <Languages size={14} />,
    prompt: "Translate all text content to",
    category: "writing",
  },
  {
    id: "longer",
    label: "makeLonger",
    icon: <FileText size={14} />,
    prompt:
      "Expand all content with more details, examples, and bullet points. Add more substance to each slide.",
    category: "content",
  },
  {
    id: "add-slide",
    label: "Add a slide",
    icon: <Plus size={14} />,
    prompt:
      "Add ONE new slide that best strengthens this deck (for example a missing overview, comparison, or next-steps slide). Insert it at the most logical position and keep every other slide exactly as it is.",
    category: "content",
  },
  {
    id: "shorter",
    label: "makeShorter",
    icon: <Minimize2 size={14} />,
    prompt:
      "Make all content more concise while keeping key points. Reduce bullet points and simplify text.",
    category: "content",
  },
  {
    id: "simplify",
    label: "simplifyLanguage",
    icon: <FileText size={14} />,
    prompt:
      "Simplify the language in all slides to be easier to understand. Use simpler words and shorter sentences.",
    category: "writing",
  },
  {
    id: "specific",
    label: "beMoreSpecific",
    icon: <FileText size={14} />,
    prompt:
      "Add more specific details, data, statistics, and concrete examples to all slides.",
    category: "content",
  },
];

export function AgentPanel({
  isOpen,
  onClose,
  theme,
  slides,
  currentSlideIndex,
  presentationTitle,
  presentationId,
  onUpdateSlide,
  onReplaceSlides,
  onSetEditingSlide,
  subscriptionPlan,
}: AgentPanelProps) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editScope, setEditScope] = useState<"current" | "all">("all");
  const [credits, setCredits] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [slideProgress, setSlideProgress] = useState<SlideProgress[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Get translations
  const { language } = useLanguage();
  const t = dashboardTranslations[language] || dashboardTranslations.en;
  
  // Check if user is free
  const isFreeUser = !subscriptionPlan || subscriptionPlan === 'free';
  
  // Keep a ref to track the latest slides during streaming
  const slidesRef = useRef<SlideData[]>(slides);
  
  // Update ref when slides prop changes
  useEffect(() => {
    slidesRef.current = slides;
  }, [slides]);
  
  // Use the modal colors helper for consistent theming - works for ALL themes
  const modalColors = getModalColors(theme);

  // Fetch user credits on mount
  useEffect(() => {
    if (isOpen) {
      fetch("/api/user/me")
        .then((res) => res.json())
        .then((data) => {
          if (data.credits !== undefined) {
            setCredits(data.credits);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [prompt]);

  // Build presentation context for AI
  const buildPresentationContext = () => {
    return slides
      .map((slide, idx) => {
        const slideNum = idx + 1;
        const isTitle = slide.type === "title" || idx === 0;
        
        // Get content from transformedContent (primary) or bulletPoints (fallback)
        let contentItems: string[] = [];
        if (slide.transformedContent?.items && slide.transformedContent.items.length > 0) {
          contentItems = slide.transformedContent.items.map((item, i) => {
            if (item.label) {
              return `    ${i + 1}. ${item.label}: ${item.text}`;
            }
            return `    ${i + 1}. ${item.text}`;
          });
        } else if (slide.bulletPoints && slide.bulletPoints.length > 0) {
          contentItems = slide.bulletPoints.map((bp, i) => {
            const text = typeof bp === "string" ? bp : (bp as { text?: string }).text || "";
            return `    ${i + 1}. ${text}`;
          });
        }
        
        // Handle sections for card layouts
        const sections = slide.sections
          ?.map(
            (sec, i) =>
              `    Card ${i + 1}: "${sec.heading}" - ${sec.description}`
          )
          .join("\n") || "";

        const contentType = slide.transformedContent?.items?.length 
          ? "transformedContent (labeled items)" 
          : slide.sections?.length 
            ? "sections (card layout)" 
            : slide.bulletPoints?.length 
              ? "bulletPoints" 
              : "none";

        return `[Slide ${slideNum}] ${isTitle ? "TITLE SLIDE" : "CONTENT SLIDE"}:
  Title: ${slide.title || "(no title)"}
  ${slide.subtitle ? `Subtitle: ${slide.subtitle}` : ""}
  ${slide.tagline ? `Tagline: ${slide.tagline}` : ""}
  ${slide.introText ? `Intro: ${slide.introText}` : ""}
  ${contentItems.length > 0 ? `Content Items:\n${contentItems.join("\n")}` : ""}
  ${sections ? `Sections (card layout):\n${sections}` : ""}
  ${slide.image ? `Has Image: Yes` : "Has Image: No"}
  Content Type: ${contentType}`;
      })
      .join("\n\n");
  };

  const handleSubmitStreaming = async (customPrompt?: string) => {
    const finalPrompt = customPrompt || prompt;
    if (!finalPrompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setSlideProgress([]);

    try {
      if (editScope === "current") {
        // Edit single slide (non-streaming)
        const response = await fetch("/api/ai/edit-slide", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slide: slides[currentSlideIndex],
            prompt: finalPrompt,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          if (data.error === "Insufficient credits") {
            setError(
              `Not enough credits. You need ${data.required} credits but have ${data.available}.`
            );
          } else {
            setError(data.error || "Failed to edit slide");
          }
          return;
        }

        if (data.slide) {
          onUpdateSlide(currentSlideIndex, {
            ...slides[currentSlideIndex],
            ...data.slide,
          });
          setCredits(data.creditsRemaining);
          setPrompt("");
        }
      } else {
        // Edit all slides with streaming
        // Initialize progress for all slides
        setSlideProgress(
          slides.map(() => ({ status: "pending" as const }))
        );

        // Snapshot the deck to version history before a deck-wide AI edit,
        // so the user can always roll back. Never blocks the edit itself.
        try {
          await fetch(`/api/presentations/${presentationId}/versions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ label: "Before AI edit" }),
          });
        } catch {
          // best-effort snapshot
        }

        const response = await fetch("/api/ai/edit-presentation-stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            presentationId,
            presentationTitle,
            slides,
            prompt: finalPrompt,
            context: buildPresentationContext(),
          }),
        });

        if (!response.ok) {
          // For streaming responses, we need to handle errors differently
          // The error might be in the stream or it might be a JSON error response
          const contentType = response.headers.get("content-type");
          if (contentType?.includes("application/json")) {
            const data = await response.json();
            if (data.error === "Insufficient credits") {
              setError(
                `Not enough credits. You need ${data.required} credits but have ${data.available}.`
              );
            } else {
              setError(data.error || "Failed to edit presentation");
            }
          } else {
            setError("Failed to edit presentation");
          }
          setSlideProgress([]);
          return;
        }

        // Process SSE stream
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        // Structural-edit state: when the AI adds/deletes/reorders slides,
        // we assemble the final deck here and apply it in one replacement at
        // the end (live per-index updates would corrupt a changed structure).
        let structureChanged = false;
        let pendingDeck: (SlideData | null)[] = [];

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;
            
            // Process complete SSE messages (event + data pairs)
            const messages = buffer.split("\n\n");
            buffer = messages.pop() || ""; // Keep incomplete message in buffer

            for (const message of messages) {
              if (!message.trim()) continue;
              
              const lines = message.split("\n");
              let eventType = "";
              let eventData = "";
              
              for (const line of lines) {
                if (line.startsWith("event: ")) {
                  eventType = line.slice(7).trim();
                } else if (line.startsWith("data: ")) {
                  eventData = line.slice(6);
                }
              }
              
              if (!eventType || !eventData) continue;
              
              try {
                const data = JSON.parse(eventData);
                
                switch (eventType) {
                  case "start":
                    setCredits(data.creditsRemaining);
                    break;

                  case "deckStructure": {
                    // Detect add/delete/reorder up front
                    const structure = (data.structure ?? []) as Array<{
                      newIndex: number;
                      sourceIndex: number | null;
                    }>;
                    structureChanged =
                      data.finalCount !== slidesRef.current.length ||
                      structure.some((s) => s.sourceIndex !== s.newIndex);
                    if (structureChanged) {
                      // Seed the pending deck from each slide's ORIGINAL so
                      // non-text fields (charts, embeds, offsets) survive.
                      pendingDeck = structure.map((s) =>
                        s.sourceIndex !== null
                          ? { ...slidesRef.current[s.sourceIndex]! }
                          : null
                      );
                    }
                    // Progress list should reflect the FINAL deck size
                    setSlideProgress(
                      Array.from({ length: data.finalCount as number }, () => ({
                        status: "pending" as const,
                      }))
                    );
                    break;
                  }

                  case "slideProcessing":
                    setSlideProgress((prev) => {
                      const newProgress = [...prev];
                      newProgress[data.slideIndex] = {
                        status: "processing",
                        title: data.title,
                      };
                      return newProgress;
                    });
                    // Notify parent which slide is being edited
                    onSetEditingSlide?.(data.slideIndex);
                    break;

                  case "slideImageLoading":
                    setSlideProgress((prev) => {
                      const newProgress = [...prev];
                      newProgress[data.slideIndex] = {
                        ...newProgress[data.slideIndex],
                        status: "loading-image",
                      };
                      return newProgress;
                    });
                    break;

                  case "slideComplete": {
                    if (structureChanged) {
                      // Assemble into the pending deck; applied wholesale on
                      // "complete" via onReplaceSlides.
                      const base = pendingDeck[data.slideIndex];
                      pendingDeck[data.slideIndex] = {
                        ...(base ?? {}),
                        ...data.slide,
                        type:
                          data.slide.type || base?.type || "content",
                      } as SlideData;
                    } else {
                      // Same structure — live per-slide updates as before.
                      const existingSlide = slidesRef.current[data.slideIndex];
                      const updatedSlide: SlideData = {
                        ...existingSlide,
                        ...data.slide,
                        // Ensure type is set
                        type: data.slide.type || existingSlide?.type || "content",
                      };

                      // Update our local ref immediately so subsequent updates use fresh data
                      const newSlidesArray = [...slidesRef.current];
                      newSlidesArray[data.slideIndex] = updatedSlide;
                      slidesRef.current = newSlidesArray;

                      onUpdateSlide(data.slideIndex, updatedSlide);
                    }

                    setSlideProgress((prev) => {
                      const newProgress = [...prev];
                      newProgress[data.slideIndex] = {
                        status: "complete",
                        title: data.slide.title,
                      };
                      return newProgress;
                    });
                    break;
                  }

                  case "complete": {
                    // Structural edit: swap in the assembled final deck as
                    // ONE history step (fully undoable).
                    if (structureChanged) {
                      const finalDeck = pendingDeck.filter(
                        (s): s is SlideData => s !== null
                      );
                      if (finalDeck.length > 0) {
                        slidesRef.current = finalDeck;
                        if (onReplaceSlides) {
                          onReplaceSlides(finalDeck);
                        } else {
                          // Fallback: per-index application (no add/delete)
                          finalDeck.forEach((s, idx) => onUpdateSlide(idx, s));
                        }
                      }
                    }
                    setCredits(data.creditsRemaining);
                    setPrompt("");
                    // Clear editing state
                    onSetEditingSlide?.(null);
                    // Clear progress after a delay
                    setTimeout(() => setSlideProgress([]), 2000);
                    break;
                  }

                  case "error":
                    setError(data.message);
                    setSlideProgress([]);
                    onSetEditingSlide?.(null);
                    break;
                }
              } catch {
                // Skip malformed JSON
              }
            }
          }
        }
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setSlideProgress([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    if (action.id === "translate") {
      setPrompt(`${action.prompt} `);
      textareaRef.current?.focus();
    } else {
      handleSubmitStreaming(action.prompt);
    }
  };

  if (!isOpen) return null;

  // Use modalColors for ALL themes - no special light/dark handling needed
  const themeStyles = {
    bg: modalColors.bg,
    border: modalColors.border,
    text: modalColors.text,
    textMuted: modalColors.textMuted,
    inputBg: modalColors.surface,
    pillBg: modalColors.surface,
    hoverBg: modalColors.hoverBg,
    accentBg: `${theme.colors.primary}15`,
    accentBorder: `${theme.colors.primary}40`,
    accent: theme.colors.primary,
  };



  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Panel */}
      <div
        className="fixed top-16 right-4 w-[420px] max-w-[calc(100vw-2rem)] rounded-2xl shadow-2xl border z-50"
        style={{
          background: themeStyles.bg,
          borderColor: themeStyles.border,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: themeStyles.border }}
        >
          <div className="flex items-center gap-2">
            <div 
              className="p-1.5 rounded-lg"
              style={{ backgroundColor: themeStyles.accentBg }}
            >
              <Sparkles size={18} style={{ color: themeStyles.accent }} />
            </div>
            <div>
              <h3 
                className="font-semibold"
                style={{ color: themeStyles.text }}
              >
                {t.editAllCards || "Edit all cards"}
              </h3>
              {isFreeUser && (
                <p className="text-xs flex items-center gap-1" style={{ color: themeStyles.textMuted }}>
                  <Lock size={12} />
                  Upgrade to unlock
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {credits !== null && credits <= 5 && (
              <a
                href="/dashboard/billing"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                {t.getMoreCredits || "Get more"}
              </a>
            )}
            {credits !== null && (
              <span
                className="text-sm"
                style={{ color: credits <= 5 ? "#f59e0b" : themeStyles.textMuted, fontWeight: credits <= 5 ? 500 : 400 }}
              >
                {credits <= 0 ? (t.outOfCredits || "You're out of credits") : `${credits} ${t.creditsCount || "credits"}`}
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: themeStyles.textMuted }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Minimal status indicator - just shows when editing */}
          {isLoading && slideProgress.length > 0 && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg border"
              style={{ 
                backgroundColor: themeStyles.accentBg, 
                borderColor: themeStyles.accentBorder 
              }}
            >
              <Loader2 size={14} className="animate-spin" style={{ color: themeStyles.accent }} />
              <span 
                className="text-sm"
                style={{ color: themeStyles.text }}
              >
                {t.updatingSlides || "Updating slides..."} ({slideProgress.filter(p => p.status === "complete").length}/{slideProgress.length})
              </span>
            </div>
          )}

          {/* Scope selector */}
          <div 
            className="flex items-center gap-2 p-1 rounded-lg"
            style={{ backgroundColor: themeStyles.pillBg }}
          >
            <button
              onClick={() => setEditScope("all")}
              className="flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
              style={{
                backgroundColor: editScope === "all" ? themeStyles.bg : "transparent",
                color: editScope === "all" ? themeStyles.text : themeStyles.textMuted,
                boxShadow: editScope === "all" ? "0 1px 2px rgba(0,0,0,0.1)" : "none",
              }}
            >
              {t.allSlidesScope || "All slides"}
            </button>
            <button
              onClick={() => setEditScope("current")}
              className="flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
              style={{
                backgroundColor: editScope === "current" ? themeStyles.bg : "transparent",
                color: editScope === "current" ? themeStyles.text : themeStyles.textMuted,
                boxShadow: editScope === "current" ? "0 1px 2px rgba(0,0,0,0.1)" : "none",
              }}
            >
              {t.currentSlideScope || "Current slide"} ({currentSlideIndex + 1})
            </button>
          </div>

          {/* Input area */}
          <div
            className="relative rounded-xl border"
            style={{ 
              backgroundColor: themeStyles.inputBg, 
              borderColor: themeStyles.border 
            }}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitStreaming();
                }
              }}
              placeholder={t.askToEditCreate || "Ask me to edit, create, or style anything"}
              className="w-full px-4 py-3 bg-transparent resize-none focus:outline-none"
              style={{ color: themeStyles.text }}
              rows={2}
              disabled={isLoading}
            />
            <div className="flex items-center justify-between px-3 pb-3">
              <button
                className="p-1.5 rounded-lg"
                style={{ color: themeStyles.textMuted }}
              >
                <span className="text-lg">+</span>
              </button>
              <button
                onClick={() => isFreeUser ? setShowUpgradeModal(true) : handleSubmitStreaming()}
                disabled={!prompt.trim() || isLoading}
                className="p-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: prompt.trim() && !isLoading ? themeStyles.accent : themeStyles.pillBg,
                  color: prompt.trim() && !isLoading ? "#ffffff" : themeStyles.textMuted,
                  cursor: !prompt.trim() || isLoading ? "not-allowed" : "pointer",
                }}
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : isFreeUser ? (
                  <Lock size={16} />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
              {error}
            </div>
          )}

          {/* Quick actions */}
          {!isLoading && (
            <div className="space-y-3">
              <h4
                className="text-xs font-medium uppercase tracking-wider"
                style={{ color: themeStyles.textMuted }}
              >
                {t.writingCategory || "Writing"}
              </h4>
              <div className="flex flex-wrap gap-2">
                {quickActions
                  .filter((a) => a.category === "writing")
                  .map((action) => (
                    <button
                      key={action.id}
                      onClick={() => isFreeUser ? setShowUpgradeModal(true) : handleQuickAction(action)}
                      disabled={isLoading || isFreeUser}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors disabled:opacity-50"
                      style={{ 
                        backgroundColor: themeStyles.pillBg, 
                        color: themeStyles.text 
                      }}
                    >
                      {action.icon}
                      {t[action.label] || action.label}
                    </button>
                  ))}
              </div>

              <h4
                className="text-xs font-medium uppercase tracking-wider pt-2"
                style={{ color: themeStyles.textMuted }}
              >
                {t.contentCategory || "Content"}
              </h4>
              <div className="flex flex-wrap gap-2">
                {quickActions
                  .filter((a) => a.category === "content")
                  .map((action) => (
                    <button
                      key={action.id}
                      onClick={() => isFreeUser ? setShowUpgradeModal(true) : handleQuickAction(action)}
                      disabled={isLoading || isFreeUser}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors disabled:opacity-50"
                      style={{ 
                        backgroundColor: themeStyles.pillBg, 
                        color: themeStyles.text 
                      }}
                    >
                      {action.icon}
                      {t[action.label] || action.label}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pricing Modal */}
      <PricingModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={subscriptionPlan}
      />
    </>
  );
}
