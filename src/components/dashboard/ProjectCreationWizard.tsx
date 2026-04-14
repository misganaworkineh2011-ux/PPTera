"use client";

import { Sparkles, FileText, PenTool, X } from "lucide-react";
import { cn } from "~/lib/utils";
import { useRouter } from "next/navigation";
import { useLanguage } from "~/contexts/LanguageContext";
import { dashboardTranslations } from "~/lib/dashboard-translations";

interface Props {
  userId: string;
  credits: number;
  onClose: () => void;
}

export default function ProjectCreationWizard({ userId, credits, onClose }: Props) {
  const router = useRouter();
  const { language } = useLanguage();
  const t = dashboardTranslations[language] || dashboardTranslations.en;

  const handleSelect = (mode: string) => {
    onClose();
    router.push(`/createpresentation?mode=${mode}`);
  };

  const options = [
    {
      id: "ai",
      title: t.aiGenerationMode || "AI Generation",
      description: t.aiGenerationDesc || "Describe your idea and let AI create a professional presentation",
      icon: Sparkles,
      iconBg: "bg-violet-500/10",
      iconColor: "text-violet-600",
      hoverBorder: "hover:border-violet-200",
    },
    {
      id: "docs",
      title: t.importDocumentsMode || "Import Documents",
      description: t.importDocumentsDesc || "Upload PDFs or Word files to transform into slides",
      icon: FileText,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600",
      hoverBorder: "hover:border-blue-200",
    },
    {
      id: "scratch",
      title: t.startFromScratchMode || "Start from Scratch",
      description: t.startFromScratchDesc || "Build from a blank canvas with full creative control",
      icon: PenTool,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600",
      hoverBorder: "hover:border-emerald-200",
    },
  ];

  return (
    <div className="bg-white dark:bg-zinc-950 rounded-[20px] shadow-2xl max-w-2xl w-full mx-auto overflow-hidden border border-slate-200/80 dark:border-white/10">
      {/* Header */}
      <div className="relative px-6 sm:px-8 pt-6 sm:pt-8 pb-5 border-b border-slate-100 dark:border-zinc-800 bg-gradient-to-b from-slate-50/50 to-white dark:from-zinc-900/50 dark:to-zinc-950">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 sm:right-6 sm:top-6 p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:text-zinc-500 dark:hover:text-white dark:hover:bg-zinc-800 transition-all active:scale-95"
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
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleSelect(option.id)}
            className={cn(
              "group w-full flex items-center gap-4 sm:gap-5 p-5 sm:p-6 rounded-xl border-2 border-slate-200 dark:border-zinc-800 text-left transition-all duration-200",
              "hover:border-slate-300 hover:bg-slate-50 hover:shadow-md dark:hover:border-zinc-700 dark:hover:bg-zinc-900/50",
              "active:scale-[0.98]"
            )}
          >
            <div className={cn("p-3 sm:p-4 rounded-xl transition-transform group-hover:scale-110", option.iconBg)}>
              <option.icon className={cn("w-6 h-6", option.iconColor)} />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">
                {option.title}
              </h3>
              <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                {option.description}
              </p>
            </div>
            
            <div className="text-slate-300 dark:text-zinc-600 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
