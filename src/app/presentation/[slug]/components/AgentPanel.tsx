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
} from "lucide-react";
import type { Theme } from "~/lib/themes";
import type { SlideData } from "~/components/presentation/types";
import { getThemeType } from "./types";

interface AgentPanelProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  slides: SlideData[];
  currentSlideIndex: number;
  presentationTitle: string;
  presentationId: string;
  onUpdateSlide: (index: number, slide: SlideData) => void;
  onSetEditingSlide?: (index: number | null) => void;
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
    label: "Improve writing",
    icon: <Wand2 size={14} />,
    prompt:
      "Improve the writing quality of all text content including titles, subtitles, and bullet points. Make it more professional and engaging.",
    category: "writing",
  },
  {
    id: "grammar",
    label: "Fix spelling & grammar",
    icon: <FileText size={14} />,
    prompt:
      "Fix any spelling and grammar errors in all text content including titles, subtitles, and bullet points.",
    category: "writing",
  },
  {
    id: "translate",
    label: "Translate",
    icon: <Languages size={14} />,
    prompt: "Translate all text content to",
    category: "writing",
  },
  {
    id: "longer",
    label: "Make longer",
    icon: <FileText size={14} />,
    prompt:
      "Expand all content with more details, examples, and bullet points. Add more substance to each slide.",
    category: "content",
  },
  {
    id: "shorter",
    label: "Make shorter",
    icon: <Minimize2 size={14} />,
    prompt:
      "Make all content more concise while keeping key points. Reduce bullet points and simplify text.",
    category: "content",
  },
  {
    id: "simplify",
    label: "Simplify language",
    icon: <FileText size={14} />,
    prompt:
      "Simplify the language in all slides to be easier to understand. Use simpler words and shorter sentences.",
    category: "writing",
  },
  {
    id: "specific",
    label: "Be more specific",
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
  onSetEditingSlide,
}: AgentPanelProps) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editScope, setEditScope] = useState<"current" | "all">("all");
  const [credits, setCredits] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [slideProgress, setSlideProgress] = useState<SlideProgress[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Keep a ref to track the latest slides during streaming
  const slidesRef = useRef<SlideData[]>(slides);
  
  // Update ref when slides prop changes
  useEffect(() => {
    slidesRef.current = slides;
  }, [slides]);

  const themeType = getThemeType(theme);
  const isLight = themeType === "light" || themeType === "corporate";

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

                  case "slideComplete":
                    // Update the slide in real-time - use ref to get latest slide data
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
                    
                    setSlideProgress((prev) => {
                      const newProgress = [...prev];
                      newProgress[data.slideIndex] = {
                        status: "complete",
                        title: data.slide.title,
                      };
                      return newProgress;
                    });
                    break;

                  case "complete":
                    setCredits(data.creditsRemaining);
                    setPrompt("");
                    // Clear editing state
                    onSetEditingSlide?.(null);
                    // Clear progress after a delay
                    setTimeout(() => setSlideProgress([]), 2000);
                    break;

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

  const colors = isLight
    ? {
        bg: "bg-white",
        border: "border-slate-200",
        text: "text-slate-900",
        textMuted: "text-slate-500",
        inputBg: "bg-slate-50",
        inputBorder: "border-slate-200",
        hoverBg: "hover:bg-slate-100",
        pillBg: "bg-slate-100",
        pillHover: "hover:bg-slate-200",
        pillText: "text-slate-700",
        accentBg: "bg-blue-50",
        accentText: "text-blue-600",
        accentBorder: "border-blue-200",
        progressBg: "bg-slate-50",
        progressBorder: "border-slate-200",
      }
    : {
        bg: "",
        border: "",
        text: "",
        textMuted: "",
        inputBg: "",
        inputBorder: "",
        hoverBg: "",
        pillBg: "",
        pillHover: "",
        pillText: "",
        accentBg: "",
        accentText: "text-purple-400",
        accentBorder: "",
        progressBg: "",
        progressBorder: "",
      };

  // Theme-aware inline styles for dark themes
  const themeStyles = !isLight ? {
    bg: theme.pageBackground || theme.colors.background,
    border: theme.colors.border,
    text: theme.colors.text,
    textMuted: theme.colors.textMuted,
    inputBg: theme.colors.surface,
    pillBg: theme.colors.surface,
    accentBg: `${theme.colors.primary}15`,
    accentBorder: `${theme.colors.primary}40`,
  } : null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Panel */}
      <div
        className={`fixed top-16 right-4 w-[420px] max-w-[calc(100vw-2rem)] rounded-2xl shadow-2xl border z-50 ${isLight ? colors.bg : ""}`}
        style={themeStyles ? {
          background: themeStyles.bg,
          borderColor: themeStyles.border,
        } : {}}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-4 border-b ${isLight ? colors.border : ""}`}
          style={themeStyles ? { borderColor: themeStyles.border } : {}}
        >
          <div className="flex items-center gap-2">
            <div 
              className={`p-1.5 rounded-lg ${isLight ? colors.accentBg : ""}`}
              style={themeStyles ? { backgroundColor: themeStyles.accentBg } : {}}
            >
              <Sparkles size={18} className={colors.accentText} style={themeStyles ? { color: theme.colors.primary } : {}} />
            </div>
            <div>
              <h3 
                className={`font-semibold ${isLight ? colors.text : ""}`}
                style={themeStyles ? { color: themeStyles.text } : {}}
              >
                Edit all cards
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {credits !== null && credits <= 5 && (
              <a
                href="/dashboard/billing"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Get more
              </a>
            )}
            {credits !== null && (
              <span
                className={`text-sm ${credits <= 5 ? "text-amber-500 font-medium" : isLight ? colors.textMuted : ""}`}
                style={themeStyles && credits > 5 ? { color: themeStyles.textMuted } : {}}
              >
                {credits <= 0 ? "You're out of credits" : `${credits} credits`}
              </span>
            )}
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors ${isLight ? colors.hoverBg : ""} ${isLight ? colors.textMuted : ""}`}
              style={themeStyles ? { color: themeStyles.textMuted } : {}}
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
              className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isLight ? `${colors.accentBg} ${colors.accentBorder} border` : "border"}`}
              style={themeStyles ? { 
                backgroundColor: themeStyles.accentBg, 
                borderColor: themeStyles.accentBorder 
              } : {}}
            >
              <Loader2 size={14} className="animate-spin text-blue-500" />
              <span 
                className={`text-sm ${isLight ? colors.text : ""}`}
                style={themeStyles ? { color: themeStyles.text } : {}}
              >
                Updating slides... ({slideProgress.filter(p => p.status === "complete").length}/{slideProgress.length})
              </span>
            </div>
          )}

          {/* Scope selector */}
          <div 
            className={`flex items-center gap-2 p-1 rounded-lg ${isLight ? colors.pillBg : ""}`}
            style={themeStyles ? { backgroundColor: themeStyles.pillBg } : {}}
          >
            <button
              onClick={() => setEditScope("all")}
              className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                editScope === "all"
                  ? `shadow-sm ${isLight ? `${colors.bg} ${colors.text}` : ""}`
                  : `${isLight ? `${colors.textMuted} ${colors.pillHover}` : ""}`
              }`}
              style={themeStyles ? {
                backgroundColor: editScope === "all" ? themeStyles.bg : "transparent",
                color: editScope === "all" ? themeStyles.text : themeStyles.textMuted,
              } : {}}
            >
              All slides
            </button>
            <button
              onClick={() => setEditScope("current")}
              className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                editScope === "current"
                  ? `shadow-sm ${isLight ? `${colors.bg} ${colors.text}` : ""}`
                  : `${isLight ? `${colors.textMuted} ${colors.pillHover}` : ""}`
              }`}
              style={themeStyles ? {
                backgroundColor: editScope === "current" ? themeStyles.bg : "transparent",
                color: editScope === "current" ? themeStyles.text : themeStyles.textMuted,
              } : {}}
            >
              Current slide ({currentSlideIndex + 1})
            </button>
          </div>

          {/* Input area */}
          <div
            className={`relative rounded-xl border ${isLight ? `${colors.inputBorder} ${colors.inputBg}` : ""}`}
            style={themeStyles ? { 
              backgroundColor: themeStyles.inputBg, 
              borderColor: themeStyles.border 
            } : {}}
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
              placeholder="Ask me to edit, create, or style anything"
              className={`w-full px-4 py-3 bg-transparent resize-none focus:outline-none ${isLight ? colors.text : ""}`}
              style={themeStyles ? { color: themeStyles.text } : {}}
              rows={2}
              disabled={isLoading}
            />
            <div className="flex items-center justify-between px-3 pb-3">
              <button
                className={`p-1.5 rounded-lg ${isLight ? `${colors.hoverBg} ${colors.textMuted}` : ""}`}
                style={themeStyles ? { color: themeStyles.textMuted } : {}}
              >
                <span className="text-lg">+</span>
              </button>
              <button
                onClick={() => handleSubmitStreaming()}
                disabled={!prompt.trim() || isLoading}
                className={`p-2 rounded-lg transition-colors ${
                  prompt.trim() && !isLoading
                    ? "bg-zinc-800 text-white hover:bg-zinc-700"
                    : `${isLight ? `${colors.pillBg} ${colors.textMuted}` : ""} cursor-not-allowed`
                }`}
                style={themeStyles && (!prompt.trim() || isLoading) ? { 
                  backgroundColor: themeStyles.pillBg, 
                  color: themeStyles.textMuted 
                } : {}}
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
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
                className={`text-xs font-medium uppercase tracking-wider ${isLight ? colors.textMuted : ""}`}
                style={themeStyles ? { color: themeStyles.textMuted } : {}}
              >
                Writing
              </h4>
              <div className="flex flex-wrap gap-2">
                {quickActions
                  .filter((a) => a.category === "writing")
                  .map((action) => (
                    <button
                      key={action.id}
                      onClick={() => handleQuickAction(action)}
                      disabled={isLoading}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors disabled:opacity-50 ${isLight ? `${colors.pillBg} ${colors.pillText} ${colors.pillHover}` : ""}`}
                      style={themeStyles ? { 
                        backgroundColor: themeStyles.pillBg, 
                        color: themeStyles.text 
                      } : {}}
                    >
                      {action.icon}
                      {action.label}
                    </button>
                  ))}
              </div>

              <h4
                className={`text-xs font-medium uppercase tracking-wider pt-2 ${isLight ? colors.textMuted : ""}`}
                style={themeStyles ? { color: themeStyles.textMuted } : {}}
              >
                Content
              </h4>
              <div className="flex flex-wrap gap-2">
                {quickActions
                  .filter((a) => a.category === "content")
                  .map((action) => (
                    <button
                      key={action.id}
                      onClick={() => handleQuickAction(action)}
                      disabled={isLoading}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors disabled:opacity-50 ${isLight ? `${colors.pillBg} ${colors.pillText} ${colors.pillHover}` : ""}`}
                      style={themeStyles ? { 
                        backgroundColor: themeStyles.pillBg, 
                        color: themeStyles.text 
                      } : {}}
                    >
                      {action.icon}
                      {action.label}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
