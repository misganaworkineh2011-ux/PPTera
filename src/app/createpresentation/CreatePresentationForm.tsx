"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, FileText, Sparkles, Upload, PenTool, Loader2 } from "lucide-react";

interface CreatePresentationFormProps {
  maxSlides: number;
  subscriptionPlan?: string | null;
}

// Define all slide options by plan - always show all, but disable based on user's plan
const getAllSlideOptions = (userPlan: string | null | undefined) => {
  const userPlanLower = userPlan?.toLowerCase() || "free";
  
  const options: Array<{ value: number; label: string; plan: string; isGroupHeader?: boolean; disabled?: boolean }> = [];
  
  // Determine which plans the user has access to
  const hasFree = true; // Everyone has free
  const hasStarter = userPlanLower !== "free";
  const hasPro = userPlanLower === "pro" || userPlanLower === "enterprise";
  const hasEnterprise = userPlanLower === "enterprise";
  
  // Free plan options (1-10) - always enabled
  options.push({ value: -1, label: "Free Plan: 1-10 slides", plan: "Free", isGroupHeader: true, disabled: false });
  for (let i = 1; i <= 10; i++) {
    options.push({ value: i, label: `${i} ${i === 1 ? "slide" : "slides"}`, plan: "Free", disabled: false });
  }

  // Starter plan options (15, 20) - show for everyone, disable if not on starter+
  options.push({ value: -2, label: "Starter Plan: 15, 20 slides", plan: "Starter", isGroupHeader: true, disabled: false });
  options.push({ value: 15, label: "15 slides", plan: "Starter", disabled: !hasStarter });
  options.push({ value: 20, label: "20 slides", plan: "Starter", disabled: !hasStarter });

  // Pro plan options (25, 30, 40, 50) - show for everyone, disable if not on pro+
  options.push({ value: -3, label: "Pro Plan: 25, 30, 40, 50 slides", plan: "Pro", isGroupHeader: true, disabled: false });
  options.push({ value: 25, label: "25 slides", plan: "Pro", disabled: !hasPro });
  options.push({ value: 30, label: "30 slides", plan: "Pro", disabled: !hasPro });
  options.push({ value: 40, label: "40 slides", plan: "Pro", disabled: !hasPro });
  options.push({ value: 50, label: "50 slides", plan: "Pro", disabled: !hasPro });

  // Enterprise plan options (60, 70) - show for everyone, disable if not on enterprise
  options.push({ value: -4, label: "Enterprise Plan: 60, 70 slides", plan: "Enterprise", isGroupHeader: true, disabled: false });
  options.push({ value: 60, label: "60 slides", plan: "Enterprise", disabled: !hasEnterprise });
  options.push({ value: 70, label: "70 slides", plan: "Enterprise", disabled: !hasEnterprise });

  return options;
};

export default function CreatePresentationForm({ maxSlides, subscriptionPlan }: CreatePresentationFormProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = searchParams.get("mode");
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    description: "",
    numberOfSlides: Math.min(10, maxSlides),
    tone: "professional",
    language: "english",
  });

  useEffect(() => {
    setMounted(true);
    // Ensure numberOfSlides doesn't exceed max
    setFormData((prev) => ({
      ...prev,
      numberOfSlides: Math.min(prev.numberOfSlides, maxSlides),
    }));
  }, [maxSlides]);

  if (!mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-outline", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to generate outline");
        setIsLoading(false);
        return;
      }

      // Store outline in sessionStorage and redirect to outline page
      sessionStorage.setItem("generatedOutline", JSON.stringify(data));
      router.push("/createpresentation/outline");
    } catch (err) {
      console.error("Error generating outline:", err);
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const allSlideOptions = getAllSlideOptions(subscriptionPlan);

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Background - Very light gradient with subtle teal tints */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: `linear-gradient(to bottom, #ecfdf5 0%, #e6fcf5 15%, #d1fae5 30%, #b2f5ea 45%, #81e6d9 55%, #5eead4 60%, #b2f5ea 75%, #d1fae5 85%, #ecfdf5 100%)`,
        }}
      />
      
      {/* Reflection Effect */}
      <div 
        className="absolute top-0 right-0 w-full h-full z-0"
        style={{
          background: `
            linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.4) 15%, transparent 40%),
            linear-gradient(120deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.3) 20%, transparent 50%),
            linear-gradient(150deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 25%, transparent 60%)
          `,
        }}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="px-8 pt-8 pb-6">
          <button 
            onClick={() => router.back()}
            className="mb-8 flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-sm px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-white hover:text-[#1e3a8a]"
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        {/* Centered Title - No Icon */}
        <div className="flex flex-col items-center justify-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-[#1e3a8a] mb-3">
            New Presentation
          </h1>
          <p className="text-slate-600 text-center">
            Configure your presentation settings
          </p>
        </div>

        {/* Form Container - No box, flowing in background */}
        <div className="flex-1 px-8 pb-12">
          <div className="mx-auto max-w-3xl">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Presentation Content */}
              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-[#1e3a8a] mb-3">
                  What to Create
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Define what you want to create in one sentence or more..."
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 bg-white px-5 py-4 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20 focus:border-[#06b6d4] transition-all resize-none shadow-sm"
                  required
                />
                <p className="mt-2 text-xs text-slate-500">
                  Describe your presentation idea, topics to cover, main message, or any specific requirements
                </p>
              </div>

              {/* Number of Slides - Minimal Dropdown */}
              <div>
                <div className="relative">
                  <select
                    id="slides"
                    value={formData.numberOfSlides}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value > 0 && !allSlideOptions.find(opt => opt.value === value)?.disabled) {
                        handleChange("numberOfSlides", value);
                      }
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white px-5 py-4 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20 focus:border-[#06b6d4] transition-all shadow-sm appearance-none cursor-pointer"
                  >
                    {allSlideOptions.map((option, index) => {
                      if (option.isGroupHeader) {
                        return (
                          <option key={`header-${index}`} value={option.value} disabled className="font-semibold text-slate-500 bg-slate-50">
                            {option.label}
                          </option>
                        );
                      }
                      // Format: "X slides" on left, plan name on right (with lock if disabled)
                      const planLabel = option.plan !== "Free" ? option.plan : "";
                      // Use non-breaking spaces to push plan name to the right
                      const spaces = planLabel ? "\u00A0".repeat(Math.max(1, 15 - option.label.length)) : "";
                      const lockIcon = option.disabled ? "🔒" : "";
                      const displayLabel = planLabel 
                        ? `${option.label}${spaces}${planLabel} ${lockIcon}`.trim()
                        : option.label;
                      
                      return (
                        <option 
                          key={option.value} 
                          value={option.value}
                          disabled={option.disabled}
                          style={option.disabled ? { 
                            color: '#06b6d4',
                            fontStyle: 'normal'
                          } : {}}
                        >
                          {displayLabel}
                        </option>
                      );
                    })}
                  </select>
                  {/* Custom dropdown arrow */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Tone and Language */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label htmlFor="tone" className="block text-sm font-semibold text-[#1e3a8a] mb-3">
                    Tone
                  </label>
                  <select
                    id="tone"
                    value={formData.tone}
                    onChange={(e) => handleChange("tone", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-5 py-4 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20 focus:border-[#06b6d4] transition-all shadow-sm"
                  >
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="formal">Formal</option>
                    <option value="creative">Creative</option>
                    <option value="friendly">Friendly</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="language" className="block text-sm font-semibold text-[#1e3a8a] mb-3">
                    Language
                  </label>
                  <select
                    id="language"
                    value={formData.language}
                    onChange={(e) => handleChange("language", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-5 py-4 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20 focus:border-[#06b6d4] transition-all shadow-sm"
                  >
                    <option value="english">English</option>
                    <option value="spanish">Spanish</option>
                    <option value="french">French</option>
                    <option value="german">German</option>
                    <option value="italian">Italian</option>
                    <option value="portuguese">Portuguese</option>
                    <option value="chinese">Chinese</option>
                    <option value="japanese">Japanese</option>
                    <option value="korean">Korean</option>
                    <option value="arabic">Arabic</option>
                    <option value="hindi">Hindi</option>
                    <option value="russian">Russian</option>
                  </select>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Action Button */}
              <div className="flex items-center justify-center pt-4">
                <button
                  type="submit"
                  disabled={isLoading || !formData.description.trim()}
                  className="px-12 py-3 rounded-xl bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white font-semibold shadow-lg transition-all hover:opacity-90 hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Outline"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

