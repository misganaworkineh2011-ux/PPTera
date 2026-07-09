"use client";

import { useState } from "react";
import { Sparkles, FileText, PenTool, X, Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";
import { useRouter } from "next/navigation";
import { useLanguage } from "~/contexts/LanguageContext";
import { useNavigation } from "~/contexts/NavigationContext";
import { dashboardTranslations } from "~/lib/dashboard-translations";

interface Props {
  userId: string;
  credits: number;
  onClose: () => void;
}

export default function ProjectCreationWizard({ userId, credits, onClose }: Props) {
  const router = useRouter();
  const { language } = useLanguage();
  const { startNavigating } = useNavigation();
  const t = dashboardTranslations[language] || dashboardTranslations.en;

  // Which option was clicked — drives the in-card loading state. The modal
  // stays open (showing the loader) until the route commits; for longer
  // loads the global branded overlay fades in on top via startNavigating().
  const [loadingMode, setLoadingMode] = useState<string | null>(null);

  const handleSelect = (mode: string) => {
    if (loadingMode) return; // ignore double clicks / other options mid-flight
    setLoadingMode(mode);
    startNavigating(); // instant top progress bar + branded overlay after 500ms
    router.push(`/createpresentation?mode=${mode}`);
  };

  const options = [
    {
      id: "ai",
      title: t.aiGenerationMode || "AI Generation",
      description: t.aiGenerationDesc || "Describe your idea and let AI create a professional presentation",
      loadingLabel: "Opening the AI studio…",
      icon: Sparkles,
      iconBg: "bg-violet-500/10",
      iconColor: "text-violet-600",
      spinnerColor: "text-violet-600",
      loadingRing: "border-violet-400 ring-4 ring-violet-500/15",
      hoverBorder: "hover:border-violet-200",
    },
    {
      id: "docs",
      title: t.importDocumentsMode || "Import Documents",
      description: t.importDocumentsDesc || "Upload PDFs or Word files to transform into slides",
      loadingLabel: "Opening document import…",
      icon: FileText,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600",
      spinnerColor: "text-blue-600",
      loadingRing: "border-blue-400 ring-4 ring-blue-500/15",
      hoverBorder: "hover:border-blue-200",
    },
    {
      id: "scratch",
      title: t.startFromScratchMode || "Start from Scratch",
      description: t.startFromScratchDesc || "Build from a blank canvas with full creative control",
      loadingLabel: "Opening the blank editor…",
      icon: PenTool,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600",
      spinnerColor: "text-emerald-600",
      loadingRing: "border-emerald-400 ring-4 ring-emerald-500/15",
      hoverBorder: "hover:border-emerald-200",
    },
  ];

  return (
    <div className="bg-white dark:bg-zinc-950 rounded-[20px] shadow-2xl max-w-2xl w-full mx-auto overflow-hidden border border-slate-200/80 dark:border-white/10">
      {/* Header */}
      <div className="relative px-6 sm:px-8 pt-6 sm:pt-8 pb-5 border-b border-slate-100 dark:border-zinc-800 bg-gradient-to-b from-slate-50/50 to-white dark:from-zinc-900/50 dark:to-zinc-950">
        <button
          onClick={onClose}
          disabled={loadingMode !== null}
          className="absolute right-4 top-4 sm:right-6 sm:top-6 p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:text-zinc-500 dark:hover:text-white dark:hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          {t.createNewPresentation || "Create new presentation"}
        </h2>
        <p className="mt-2 text-sm font-medium text-slate-500 dark:text-zinc-400">
          {t.chooseHowToStart || "Choose how you'd like to get started"}
        </p>
      </div>

      {/* Options */}
      <div className="p-6 sm:p-8 space-y-4">
        {options.map((option) => {
          const isLoading = loadingMode === option.id;
          const isDimmed = loadingMode !== null && !isLoading;

          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              disabled={loadingMode !== null}
              aria-busy={isLoading}
              className={cn(
                "group w-full flex items-center gap-4 sm:gap-5 p-5 sm:p-6 rounded-xl border-2 text-left transition-all duration-300",
                isLoading
                  ? cn("bg-slate-50 dark:bg-zinc-900/60 cursor-wait", option.loadingRing)
                  : "border-slate-200 dark:border-zinc-800",
                !loadingMode &&
                  "hover:border-slate-300 hover:bg-slate-50 hover:shadow-md dark:hover:border-zinc-700 dark:hover:bg-zinc-900/50 active:scale-[0.98]",
                isDimmed && "opacity-40 saturate-50",
              )}
            >
              <div
                className={cn(
                  "p-3 sm:p-4 rounded-xl transition-transform",
                  option.iconBg,
                  !loadingMode && "group-hover:scale-110",
                  isLoading && "animate-pulse",
                )}
              >
                <option.icon className={cn("w-6 h-6", option.iconColor)} />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">
                  {option.title}
                </h3>
                <p
                  className={cn(
                    "text-sm font-medium mt-1 leading-relaxed transition-colors",
                    isLoading
                      ? cn("animate-pulse", option.spinnerColor)
                      : "text-slate-500 dark:text-zinc-400",
                  )}
                >
                  {isLoading ? option.loadingLabel : option.description}
                </p>
              </div>

              {isLoading ? (
                <Loader2 className={cn("w-5 h-5 sm:w-6 sm:h-6 animate-spin", option.spinnerColor)} />
              ) : (
                <div className="text-slate-300 dark:text-zinc-600 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
