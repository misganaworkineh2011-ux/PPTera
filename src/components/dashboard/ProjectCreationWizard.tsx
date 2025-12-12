"use client";

import { Sparkles, FileText, PenTool, Upload, ArrowRight, X } from "lucide-react";
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
      gradient: "from-[#3b82f6] to-[#06b6d4]", // Blue to Cyan gradient
      slideColor: "bg-blue-500",
    },
    {
      id: "docs",
      title: "Import Documents",
      description: "Upload PDFs, Word files, or paste content to transform into a presentation",
      icon: FileText,
      gradient: "from-[#8b5cf6] to-[#06b6d4]", // Purple to Cyan gradient
      slideColor: "bg-purple-500",
    },
    {
      id: "scratch",
      title: "Start from Scratch",
      description: "Build from a blank canvas with full creative control over every slide",
      icon: PenTool,
      gradient: "from-[#06b6d4] to-[#10b981]", // Cyan to Green gradient
      slideColor: "bg-teal-500",
    },
  ];

  return (
    <div className="flex h-full flex-col relative overflow-hidden rounded-3xl shadow-2xl">
      {/* Main Light Gradient Background - Teal/Cyan from Logo */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: `linear-gradient(to bottom, #ccfbf1 0%, #99f6e4 20%, #5eead4 50%, #2dd4bf 70%, #5eead4 80%, #7dd3fc 90%, #a5f3fc 100%)`,
        }}
      />
      
      {/* Reflection Effect from Top Right Corner - Diagonal Light Streaks */}
      <div 
        className="absolute top-0 right-0 w-full h-full z-0"
        style={{
          background: `
            linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.4) 15%, transparent 40%),
            linear-gradient(120deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.3) 20%, transparent 50%),
            linear-gradient(150deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 25%, transparent 60%),
            linear-gradient(110deg, rgba(255, 255, 255, 0.3) 0%, transparent 30%)
          `,
        }}
      />
      
      {/* Additional subtle reflection layers for depth */}
      <div 
        className="absolute top-0 right-0 w-2/3 h-2/3 z-0"
        style={{
          background: `
            radial-gradient(ellipse at top right, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.2) 30%, transparent 70%)
          `,
        }}
      />
      
      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute right-6 top-6 z-20 rounded-full bg-white/80 backdrop-blur-sm p-2 text-slate-600 transition-colors hover:bg-white hover:text-slate-900 shadow-md"
      >
        <X size={20} />
      </button>

      {/* Header */}
      <div className="relative z-10 flex flex-col items-center justify-center px-8 pt-12 pb-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-[#1e3a8a] md:text-4xl drop-shadow-sm">
          How would you like to get started?
        </h1>
        <p className="mt-3 text-base text-slate-700 max-w-lg">
          Choose a workflow to begin your creation journey.
        </p>
      </div>

        {/* Cards Grid */}
        <div className="relative z-10 flex-1 overflow-hidden px-8 pt-2 pb-8">
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
            {options.map((option, index) => (
            <div
              key={option.title}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/95 backdrop-blur-md text-left shadow-lg transition-all duration-300 hover:-translate-y-2 hover:border-white/80 hover:shadow-2xl hover:shadow-[#06b6d4]/30"
            >
              {/* Card Header - Slide Stack Representation */}
              <div className={cn("relative flex h-[148px] w-full items-center justify-center overflow-hidden p-4 transition-all duration-500", `bg-gradient-to-br ${option.gradient}`)}>
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
                            index === 0 && "text-blue-500",
                            index === 1 && "text-purple-500",
                            index === 2 && "text-teal-500"
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
              <div className="flex flex-1 flex-col p-5 bg-white">
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn("p-1.5 rounded-lg bg-gradient-to-br", `bg-gradient-to-br ${option.gradient}`)}>
                    <option.icon className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1e3a8a]">
                    {option.title}
                  </h3>
                </div>
                <p className="mb-4 text-sm leading-relaxed text-slate-600">
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
