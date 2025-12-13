"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen, HelpCircle, Video } from "lucide-react";
import { useLanguage } from "~/contexts/LanguageContext";

export default function HelpPage() {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.backToHome}
        </Link>

        <div className="mb-16 text-center">
          <h1 className="mb-4 text-5xl font-bold text-slate-900">{t.helpTitle}</h1>
          <p className="mx-auto max-w-2xl text-xl text-slate-600">
            {t.helpSubtitle}
          </p>
        </div>

        <div className="mb-12 grid gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center transition hover:border-[#06b6d4]/50 hover:shadow-lg">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4]">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-900">{t.documentation}</h3>
            <p className="mb-4 text-slate-600">
              {t.documentationDesc}
            </p>
            <Link href="#" className="text-sm font-semibold text-[#06b6d4] hover:underline">
              {t.readDocs}
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center transition hover:border-[#06b6d4]/50 hover:shadow-lg">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
              <Video className="h-8 w-8 text-white" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-900">{t.videoTutorials}</h3>
            <p className="mb-4 text-slate-600">
              {t.videoTutorialsDesc}
            </p>
            <Link href="#" className="text-sm font-semibold text-[#06b6d4] hover:underline">
              {t.watchVideos}
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center transition hover:border-[#06b6d4]/50 hover:shadow-lg">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500">
              <HelpCircle className="h-8 w-8 text-white" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-900">{t.faqs}</h3>
            <p className="mb-4 text-slate-600">
              {t.faqsDesc}
            </p>
            <Link href="#" className="text-sm font-semibold text-[#06b6d4] hover:underline">
              {t.viewFaqs}
            </Link>
          </div>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 p-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-slate-900">{t.stillNeedHelp}</h2>
          <p className="mb-8 text-lg text-slate-600">
            {t.stillNeedHelpDesc}
          </p>
          <Link
            href="/contact"
            className="inline-block rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] px-8 py-3 font-semibold text-white transition hover:opacity-90"
          >
            {t.contactSupport}
          </Link>
        </div>
      </div>
    </div>
  );
}
