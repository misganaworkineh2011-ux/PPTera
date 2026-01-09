"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  LayoutDashboard,
  Crown,
  Wand2,
} from "lucide-react";
import { cn } from "~/lib/utils";

interface OnboardingProps {
  onComplete: () => void;
}

interface HighlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  mobileDescription?: string;
  icon: typeof LayoutDashboard;
  color: string;
  selector: string | null;
  mobileSelector?: string | null;
  tooltipPosition: "right" | "bottom" | "center";
  mobileTooltipPosition?: "right" | "bottom" | "center";
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "sidebar",
    title: "Your Dashboard",
    description:
      "Navigate your workspace from the sidebar. Access your presentations, themes, images, and settings all in one place.",
    mobileDescription:
      "Tap the menu icon to access your sidebar. Navigate to presentations, themes, images, and settings.",
    icon: LayoutDashboard,
    color: "from-[#1e3a8a] to-[#06b6d4]",
    selector: "aside",
    mobileSelector: "[data-onboarding='mobile-menu']",
    tooltipPosition: "right",
    mobileTooltipPosition: "bottom",
  },
  {
    id: "upgrade",
    title: "Upgrade Your Plan",
    description:
      "Unlock more features and credits by upgrading. Get access to premium themes, more AI generations, and priority support.",
    icon: Crown,
    color: "from-purple-600 to-pink-600",
    selector: "[data-onboarding='upgrade']",
    tooltipPosition: "bottom",
  },
  {
    id: "create",
    title: "Create with AI",
    description:
      "Click 'Create new AI' to start creating. Just describe your topic and our AI will generate professional slides instantly.",
    mobileDescription:
      "Tap 'Create' to start. Describe your topic and our AI will generate professional slides instantly.",
    icon: Wand2,
    color: "from-[#1e3a8a] to-[#06b6d4]",
    selector: "[data-onboarding='create']",
    tooltipPosition: "bottom",
  },
  {
    id: "ready",
    title: "You're All Set!",
    description:
      "Start creating amazing presentations. Need help? Check out our prompt guide for tips on getting the best results.",
    icon: Sparkles,
    color: "from-green-500 to-emerald-500",
    selector: null,
    tooltipPosition: "center",
  },
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [highlightRect, setHighlightRect] = useState<HighlightRect | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Get the appropriate selector based on screen size
  const getSelector = useCallback(() => {
    if (!step) return null;
    if (isMobile && step.mobileSelector !== undefined) {
      return step.mobileSelector;
    }
    return step.selector;
  }, [step, isMobile]);

  // Get the appropriate tooltip position based on screen size
  const getTooltipPosition = useCallback(() => {
    if (!step) return "center";
    if (isMobile && step.mobileTooltipPosition) {
      return step.mobileTooltipPosition;
    }
    return step.tooltipPosition;
  }, [step, isMobile]);

  // Get the appropriate description based on screen size
  const getDescription = useCallback(() => {
    if (!step) return "";
    if (isMobile && step.mobileDescription) {
      return step.mobileDescription;
    }
    return step.description;
  }, [step, isMobile]);

  const updateHighlight = useCallback(() => {
    const selector = getSelector();
    if (!selector) {
      setHighlightRect(null);
      return;
    }

    const element = document.querySelector(selector);
    if (element) {
      const rect = element.getBoundingClientRect();
      setHighlightRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    } else {
      setHighlightRect(null);
    }
  }, [getSelector]);

  useEffect(() => {
    updateHighlight();
    window.addEventListener("resize", updateHighlight);
    return () => window.removeEventListener("resize", updateHighlight);
  }, [updateHighlight]);

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
    localStorage.setItem("onboarding_complete", "true");
    setTimeout(onComplete, 300);
  };

  if (!isVisible || !step) return null;

  const tooltipPosition = getTooltipPosition();

  // Calculate tooltip position based on highlighted element
  const getTooltipStyle = (): React.CSSProperties => {
    if (!highlightRect || tooltipPosition === "center") {
      return {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    if (tooltipPosition === "right") {
      return {
        position: "fixed",
        top: "50%",
        left: highlightRect.left + highlightRect.width + 20,
        transform: "translateY(-50%)",
      };
    }

    if (tooltipPosition === "bottom") {
      return {
        position: "fixed",
        top: highlightRect.top + highlightRect.height + 12,
        left: Math.max(16, Math.min(highlightRect.left, window.innerWidth - 420)),
      };
    }

    return {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    };
  };

  return (
    <div className="fixed inset-0 z-[100]">
      {/* SVG Mask for spotlight effect */}
      <svg className="absolute inset-0 h-full w-full">
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {highlightRect && (
              <rect
                x={highlightRect.left - 8}
                y={highlightRect.top - 8}
                width={highlightRect.width + 16}
                height={highlightRect.height + 16}
                rx="12"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.7)"
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* Highlight border around element */}
      {highlightRect && (
        <div
          className="pointer-events-none absolute z-[101] rounded-xl ring-4 ring-cyan-400/80"
          style={{
            top: highlightRect.top - 8,
            left: highlightRect.left - 8,
            width: highlightRect.width + 16,
            height: highlightRect.height + 16,
          }}
        >
          <div className="absolute inset-0 animate-pulse rounded-xl bg-cyan-400/10" />
        </div>
      )}

      {/* Click blocker (allows clicking skip) */}
      <div className="absolute inset-0 z-[100]" onClick={handleComplete} />

      {/* Tooltip Card */}
      <div className="z-[102] w-[400px] max-w-[calc(100vw-32px)]" style={getTooltipStyle()}>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
          {/* Progress Bar */}
          <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800">
            <div
              className="h-full bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] transition-all duration-500 ease-out"
              style={{
                width: `${((currentStep + 1) / ONBOARDING_STEPS.length) * 100}%`,
              }}
            />
          </div>

          {/* Header */}
          <div className={cn("relative bg-gradient-to-br p-5 text-white", step.color)}>
            <button
              onClick={handleComplete}
              className="absolute right-3 top-3 rounded-lg p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                <step.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="mb-0.5 text-xs font-medium text-white/70">
                  Step {currentStep + 1} of {ONBOARDING_STEPS.length}
                </p>
                <h2 className="text-lg font-bold sm:text-xl">{step.title}</h2>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            <p className="mb-6 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              {getDescription()}
            </p>

            {/* Step Indicators */}
            <div className="mb-6 flex items-center justify-center gap-2">
              {ONBOARDING_STEPS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStep(idx)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    idx === currentStep
                      ? "w-8 bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4]"
                      : idx < currentStep
                        ? "w-2 bg-cyan-400"
                        : "w-2 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600"
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
                  "flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition",
                  isFirstStep
                    ? "cursor-not-allowed text-zinc-300 dark:text-zinc-600"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                )}
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>

              <button
                onClick={handleComplete}
                className="text-sm text-zinc-400 transition hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                Skip tour
              </button>

              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition hover:opacity-90"
              >
                {isLastStep ? "Get Started" : "Next"}
                {!isLastStep && <ChevronRight className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
