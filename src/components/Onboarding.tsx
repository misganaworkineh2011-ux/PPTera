"use client";

import { useState, useEffect } from "react";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Palette,
  Zap,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";
import { cn } from "~/lib/utils";

interface OnboardingProps {
  userName?: string;
  onComplete: () => void;
}

const ONBOARDING_STEPS = [
  {
    id: "welcome",
    title: "Welcome to PPTMaster!",
    description: "Let's take a quick tour to help you get started with creating amazing presentations.",
    icon: Sparkles,
    color: "from-[#1e3a8a] to-[#06b6d4]",
  },
  {
    id: "create",
    title: "Create Presentations",
    description: "Simply describe what you want, and our AI will generate professional slides in seconds. You can customize every detail.",
    icon: FileText,
    color: "from-blue-500 to-cyan-500",
    tips: [
      "Be specific about your topic and audience",
      "Mention the number of slides you need",
      "Include key points you want to cover",
    ],
  },
  {
    id: "themes",
    title: "Beautiful Themes",
    description: "Choose from our collection of professionally designed themes, or create your own custom theme to match your brand.",
    icon: Palette,
    color: "from-purple-500 to-pink-500",
    tips: [
      "Browse themes in the Themes section",
      "Preview themes before applying",
      "Create custom themes with your brand colors",
    ],
  },
  {
    id: "images",
    title: "AI Image Generation",
    description: "Generate stunning images with AI to make your presentations stand out. Just describe what you need.",
    icon: ImageIcon,
    color: "from-orange-500 to-red-500",
    tips: [
      "Use descriptive prompts for better results",
      "Choose between standard and HD quality",
      "Images cost 10-25 credits depending on quality",
    ],
  },
  {
    id: "credits",
    title: "Credit System",
    description: "Credits power your AI generations. Each slide costs 4 credits, and AI images cost 10-25 credits.",
    icon: Zap,
    color: "from-amber-500 to-orange-500",
    tips: [
      "Check your credit balance in the sidebar",
      "Upgrade your plan for more credits",
      "Credits reset monthly on your billing date",
    ],
  },
];

export default function Onboarding({ userName, onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    // Save to localStorage that onboarding is complete
    localStorage.setItem("onboarding_complete", "true");
    setTimeout(onComplete, 300);
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isVisible || !step) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] transition-all duration-300"
            style={{ width: `${((currentStep + 1) / ONBOARDING_STEPS.length) * 100}%` }}
          />
        </div>

        {/* Close Button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition z-10"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icon Header */}
        <div className={cn("pt-12 pb-8 px-8 bg-gradient-to-br text-white", step.color)}>
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 bg-white/20 rounded-2xl">
              <step.icon className="h-10 w-10" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center">
            {step.id === "welcome" && userName ? `Welcome, ${userName}!` : step.title}
          </h2>
        </div>

        {/* Content */}
        <div className="p-8">
          <p className="text-slate-600 dark:text-slate-300 text-center mb-6">
            {step.description}
          </p>

          {step.tips && (
            <div className="space-y-3 mb-6">
              {step.tips.map((tip, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">{tip}</span>
                </div>
              ))}
            </div>
          )}

          {/* Step Indicators */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {ONBOARDING_STEPS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  idx === currentStep
                    ? "w-6 bg-[#06b6d4]"
                    : idx < currentStep
                    ? "bg-[#06b6d4]/50"
                    : "bg-slate-200 dark:bg-slate-700"
                )}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={isFirstStep}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition",
                isFirstStep
                  ? "text-slate-300 cursor-not-allowed"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              )}
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>

            <button
              onClick={handleSkip}
              className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              Skip tour
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white rounded-xl font-semibold hover:opacity-90 transition"
            >
              {isLastStep ? "Get Started" : "Next"}
              {!isLastStep && <ChevronRight className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
