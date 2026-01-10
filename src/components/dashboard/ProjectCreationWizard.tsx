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
    <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-auto overflow-hidden">
      {/* Header */}
      <div className="relative px-6 pt-6 pb-4 border-b border-gray-100">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X size={20} />
        </button>
        
        <h2 className="text-xl font-semibold text-gray-900">
          {t.createNewPresentation || "Create new presentation"}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {t.chooseHowToStart || "Choose how you'd like to get started"}
        </p>
      </div>

      {/* Options */}
      <div className="p-6 space-y-3">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleSelect(option.id)}
            className={cn(
              "w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 text-left transition-all duration-200",
              "hover:bg-gray-50 hover:shadow-sm",
              option.hoverBorder
            )}
          >
            <div className={cn("p-3 rounded-xl", option.iconBg)}>
              <option.icon className={cn("w-5 h-5", option.iconColor)} />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900">
                {option.title}
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">
                {option.description}
              </p>
            </div>
            
            <div className="text-gray-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
