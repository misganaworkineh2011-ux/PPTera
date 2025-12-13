"use client";

import Link from "next/link";
import { ArrowLeft, Lightbulb, Zap, Target } from "lucide-react";
import { useLanguage } from "~/contexts/LanguageContext";

export default function PromptGuidePage() {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.backToHome}
        </Link>

        <div className="mb-16 text-center">
          <h1 className="mb-4 text-5xl font-bold text-slate-900">{t.promptGuideTitle}</h1>
          <p className="mx-auto max-w-2xl text-xl text-slate-600">
            {t.promptGuideSubtitle}
          </p>
        </div>

        <div className="space-y-12">
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4]">
                <Lightbulb className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">{t.beSpecific}</h2>
            </div>
            <p className="mb-4 text-slate-600">
              {t.beSpecificDesc}
            </p>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="font-mono text-sm text-slate-700">
                "{t.beSpecificExample}"
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">{t.defineAudience}</h2>
            </div>
            <p className="mb-4 text-slate-600">
              {t.defineAudienceDesc}
            </p>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="font-mono text-sm text-slate-700">
                "{t.defineAudienceExample}"
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">{t.includeKeyPoints}</h2>
            </div>
            <p className="mb-4 text-slate-600">
              {t.includeKeyPointsDesc}
            </p>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="font-mono text-sm text-slate-700">
                "{t.includeKeyPointsExample}"
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 rounded-3xl bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] p-12 text-center text-white">
          <h2 className="mb-4 text-3xl font-bold">{t.readyToCreate}</h2>
          <p className="mb-8 text-lg text-white/90">
            {t.readyToCreateDesc}
          </p>
          <Link
            href="/dashboard"
            className="inline-block rounded-full bg-white px-8 py-3 font-semibold text-[#1e3a8a] transition hover:bg-slate-100"
          >
            {t.getStarted}
          </Link>
        </div>
      </div>
    </div>
  );
}
