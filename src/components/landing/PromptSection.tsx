"use client";

import { LoadingLink } from "~/components/LoadingLink";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import { type Language } from "~/lib/i18n";

interface PromptSectionProps {
  t: any;
  currentLang: Language;
}

const PENDING_PROMPT_KEY = "pptmaster_pending_prompt";

export function PromptSection({ t }: PromptSectionProps) {
  const [generatorPrompt, setGeneratorPrompt] = useState("");
  const [focused, setFocused] = useState(false);
  const router = useRouter();
  const { isSignedIn } = useUser();

  const handleGenerate = () => {
    if (generatorPrompt.trim()) {
      router.push(
        `/createpresentation?mode=ai&prompt=${encodeURIComponent(generatorPrompt.trim())}`,
      );
    }
  };

  const handleSignInClick = () => {
    if (generatorPrompt.trim()) {
      localStorage.setItem(PENDING_PROMPT_KEY, generatorPrompt.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && generatorPrompt.trim()) {
      if (isSignedIn) {
        handleGenerate();
      } else {
        localStorage.setItem(PENDING_PROMPT_KEY, generatorPrompt.trim());
        document.getElementById("generator-signin-btn")?.click();
      }
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a8a]/10 via-cyan-50 to-[#06b6d4]/10" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d412_1px,transparent_1px),linear-gradient(to_bottom,#06b6d412_1px,transparent_1px)] bg-[size:32px_32px]" />

      <div className="absolute top-10 left-1/4 w-48 md:w-96 h-48 md:h-96 bg-cyan-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-1/4 w-40 md:w-80 h-40 md:h-80 bg-indigo-300/20 rounded-full blur-3xl" />

      <div className="relative mx-auto max-w-3xl w-full">
        <div className="text-center mb-8 md:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/80 backdrop-blur border border-cyan-200 shadow-sm mb-4 md:mb-6">
            <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-cyan-500" />
            <span className="text-xs md:text-sm font-medium text-slate-700">
              {t.aiPowered || "AI-Powered"}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-3 md:mb-4 px-2">
            {t.promptSectionTitle || "Create Your Presentation Now"}
          </h2>
          <p className="text-base md:text-lg text-slate-600 max-w-xl mx-auto px-2">
            {t.promptSectionSubtitle ||
              "Describe your idea and let AI do the rest"}
          </p>
        </div>

        {/* Input - Stacked on mobile, inline on desktop */}
        <div
          className="relative rounded-2xl transition-shadow duration-300"
          style={{
            boxShadow: focused
              ? "0 0 40px rgba(6,182,212,0.45)"
              : "0 0 20px rgba(6,182,212,0.15)",
          }}
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-2 bg-white rounded-2xl border-2 border-cyan-200 p-3 transition-all">
            <div className="flex items-center gap-2 flex-1">
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-cyan-500 ml-1 sm:ml-3 flex-shrink-0" />
              <input
                type="text"
                value={generatorPrompt}
                onChange={(e) => setGeneratorPrompt(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder={t.generatorPlaceholder || "Describe your presentation idea..."}
                className="flex-1 bg-transparent border-none outline-none text-slate-700 placeholder:text-slate-400 py-2 sm:py-3 px-2 sm:px-3 text-base md:text-lg min-w-0"
                onKeyDown={handleKeyDown}
              />
            </div>

            <SignedIn>
              <button
                onClick={handleGenerate}
                disabled={!generatorPrompt.trim()}
                className="w-full sm:w-auto px-5 sm:px-6 py-3 bg-gradient-to-r from-[#06b6d4] to-[#1e3a8a] text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 disabled:opacity-50 hover:opacity-90 active:scale-[0.98] transition-all"
                style={{ cursor: "url('/pointinghand.svg') 12 8, pointer" }}
              >
                <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                {t.generate || "Generate"}
              </button>
            </SignedIn>

            <SignedOut>
              <LoadingLink href="/sign-in"
                  id="generator-signin-btn"
                  onClick={handleSignInClick}
                  className="w-full sm:w-auto px-5 sm:px-6 py-3 bg-gradient-to-r from-[#06b6d4] to-[#1e3a8a] text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                  {t.generate || "Generate"}
                </LoadingLink>
            </SignedOut>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-500 mt-3 md:mt-4 text-center px-2">
          {t.generatorHint ||
            'Try: "Create a pitch deck for my AI startup" or "Design a quarterly report presentation"'}
        </p>
      </div>
    </section>
  );
}
