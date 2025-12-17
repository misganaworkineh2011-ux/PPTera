"use client";

import { Sparkles, FileText, PenTool, ArrowRight, X } from "lucide-react";
import { cn } from "~/lib/utils";
import { useRouter } from "next/navigation";

interface Props {
  userId: string;
  credits: number;
  onClose: () => void;
}

export default function ProjectCreationWizard({ userId, credits, onClose }: Props) {
  const router = useRouter();

  const handleSelect = (mode: string) => {
    onClose(); // Close the modal
    router.push(`/createpresentation?mode=${mode}`);
  };

  const options = [
    {
      id: "ai",
      title: "AI Generation",
      description: "Describe your idea and watch AI craft a complete professional deck",
      icon: Sparkles,
      gradient: "from-[#1e3a8a] to-[#06b6d4]", // Brand navy to cyan
      slideColor: "bg-[#1e3a8a]",
    },
    {
      id: "docs",
      title: "Import Documents",
      description: "Upload PDFs, Word files, or paste content to transform into a presentation",
      icon: FileText,
      gradient: "from-[#06b6d4] to-[#0891b2]", // Cyan shades
      slideColor: "bg-[#06b6d4]",
    },
    {
      id: "scratch",
      title: "Start from Scratch",
      description: "Build from a blank canvas with full creative control over every slide",
      icon: PenTool,
      gradient: "from-[#0891b2] to-[#06b6d4]", // Cyan variations
      slideColor: "bg-[#0891b2]",
    },
  ];

  return (
    <div className="flex h-full flex-col relative overflow-hidden rounded-3xl shadow-2xl">
      {/* Main Background - Brand colors gradient */}
      <div 
        className="absolute inset-0 z-0 bg-gradient-to-br from-slate-50 via-blue-50/50 to-cyan-50/50"
      />
      
      {/* Subtle pattern overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(30, 58, 138, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(30, 58, 138, 0.1) 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />
      
      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute right-3 top-3 sm:right-6 sm:top-6 z-20 rounded-full bg-white/80 backdrop-blur-sm p-1.5 sm:p-2 text-slate-600 transition-colors hover:bg-white hover:text-slate-900 shadow-md"
      >
        <X size={18} className="sm:hidden" />
        <X size={20} className="hidden sm:block" />
      </button>

      {/* Header */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 sm:px-8 pt-8 sm:pt-12 pb-6 sm:pb-12 text-center">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-[#1e3a8a] drop-shadow-sm">
          How would you like to get started?
        </h1>
        <p className="mt-2 sm:mt-3 text-sm sm:text-base text-slate-700 max-w-lg">
          Choose a workflow to begin your creation journey.
        </p>
      </div>

        {/* Cards Grid */}
        <div className="relative z-10 flex-1 overflow-y-auto px-3 sm:px-6 lg:px-8 pt-1 sm:pt-2 pb-4 sm:pb-8">
          <div className="mx-auto grid max-w-5xl gap-3 sm:gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {options.map((option, index) => (
            <div
              key={option.title}
              className="group relative flex flex-col overflow-hidden rounded-xl sm:rounded-2xl border border-white/60 bg-white/95 backdrop-blur-md text-left shadow-lg transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2 hover:border-white/80 hover:shadow-2xl hover:shadow-[#06b6d4]/30"
            >
              {/* Card Header - Slide Stack Representation */}
              <div className={cn("relative flex h-24 sm:h-32 md:h-[148px] w-full items-center justify-center overflow-hidden p-3 sm:p-4 transition-all duration-500", `bg-gradient-to-br ${option.gradient}`)}>
                {/* Subtle pattern overlay */}
                <div className="absolute inset-0 opacity-10">
                  <div 
                    className="h-full w-full"
                    style={{
                      backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                      backgroundSize: '16px 16px'
                    }}
                  />
                </div>

                {/* Stacked Slides Visualization */}
                <div className="relative z-10 flex items-center justify-center">
                  {/* Slide Stack - Multiple slides stacked with offset */}
                  <div className="relative">
                    {/* Back slide */}
                    <div className={cn(
                      "absolute h-20 w-28 rounded-lg shadow-xl transform transition-all duration-500 group-hover:scale-105",
                      "bg-white/20 backdrop-blur-sm border border-white/30",
                      index === 0 && "rotate-[-8deg] translate-x-[-6px] translate-y-[3px]",
                      index === 1 && "rotate-[6deg] translate-x-[5px] translate-y-[3px]",
                      index === 2 && "rotate-[-5deg] translate-x-[-5px] translate-y-[3px]"
                    )}>
                      {/* Slide content lines */}
                      <div className="p-2 space-y-1.5">
                        <div className="h-1.5 bg-white/30 rounded w-3/4"></div>
                        <div className="h-1 bg-white/20 rounded w-full"></div>
                        <div className="h-1 bg-white/20 rounded w-5/6"></div>
                      </div>
                    </div>
                    
                    {/* Middle slide */}
                    <div className={cn(
                      "absolute h-20 w-28 rounded-lg shadow-xl transform transition-all duration-500 group-hover:scale-105",
                      "bg-white/30 backdrop-blur-sm border border-white/40",
                      index === 0 && "rotate-[-4deg] translate-x-[-3px] translate-y-[1.5px]",
                      index === 1 && "rotate-[3deg] translate-x-[2px] translate-y-[1.5px]",
                      index === 2 && "rotate-[-2deg] translate-x-[-2px] translate-y-[1.5px]"
                    )}>
                      <div className="p-2 space-y-1.5">
                        <div className="h-1.5 bg-white/40 rounded w-3/4"></div>
                        <div className="h-1 bg-white/30 rounded w-full"></div>
                        <div className="h-1 bg-white/30 rounded w-5/6"></div>
                      </div>
                    </div>
                    
                    {/* Front slide - Main */}
                    <div className={cn(
                      "relative h-20 w-28 rounded-lg shadow-2xl transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-0",
                      "bg-white/95 backdrop-blur-md border border-white/50",
                      index === 0 && "rotate-[-2deg]",
                      index === 1 && "rotate-[2deg]",
                      index === 2 && "rotate-[-1deg]"
                    )}>
                      <div className="p-2 space-y-1.5">
                        {/* Icon on slide */}
                        <div className="flex items-center justify-center mb-0.5">
                          <option.icon className={cn(
                            "h-4 w-4",
                            index === 0 && "text-[#1e3a8a]",
                            index === 1 && "text-[#06b6d4]",
                            index === 2 && "text-[#0891b2]"
                          )} />
                        </div>
                        <div className="h-1 bg-slate-300 rounded w-3/4 mx-auto"></div>
                        <div className="h-0.5 bg-slate-200 rounded w-full"></div>
                        <div className="h-0.5 bg-slate-200 rounded w-5/6"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Sparkles/Decoration for AI card */}
                  {index === 0 && (
                    <div className="absolute top-1 right-1">
                      <Sparkles className="h-5 w-5 text-white/60 animate-pulse" />
                    </div>
                  )}
                  
                  {/* File icon decoration for Docs card */}
                  {index === 1 && (
                    <div className="absolute top-1 left-1">
                      <FileText className="h-4 w-4 text-white/50" />
                    </div>
                  )}
                  
                  {/* Pen icon decoration for Scratch card */}
                  {index === 2 && (
                    <div className="absolute bottom-1 right-1">
                      <PenTool className="h-4 w-4 text-white/50" />
                    </div>
                  )}
                </div>
              </div>

              {/* Content Body */}
              <div className="flex flex-1 flex-col p-3 sm:p-4 md:p-5 bg-white">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <div className={cn("p-1 sm:p-1.5 rounded-lg bg-gradient-to-br", `bg-gradient-to-br ${option.gradient}`)}>
                    <option.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#1e3a8a]">
                    {option.title}
                  </h3>
                </div>
                <p className="mb-3 sm:mb-4 text-xs sm:text-sm leading-relaxed text-slate-600 line-clamp-2 sm:line-clamp-none">
                  {option.description}
                </p>
                
                <button
                  onClick={() => handleSelect(option.id)}
                  className={cn(
                    "mt-auto w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg group-hover:scale-[1.02]",
                    `bg-gradient-to-r ${option.gradient} hover:opacity-90`
                  )}
                >
                  Start Creating
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
