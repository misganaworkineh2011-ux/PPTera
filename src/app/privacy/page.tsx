"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "~/contexts/LanguageContext";

export default function PrivacyPage() {
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

        <h1 className="mb-8 text-4xl font-bold text-slate-900">{t.privacyTitle}</h1>
        
        <div className="prose prose-slate max-w-none">
          <p className="text-lg text-slate-600">{t.lastUpdated}</p>
          
          <h2 className="mt-8 text-2xl font-bold text-slate-900">{t.introduction}</h2>
          <p className="text-slate-600">
            {t.introductionText}
          </p>

          <h2 className="mt-8 text-2xl font-bold text-slate-900">{t.infoWeCollect}</h2>
          <p className="text-slate-600">
            {t.infoWeCollectText}
          </p>

          <h2 className="mt-8 text-2xl font-bold text-slate-900">{t.howWeUse}</h2>
          <p className="text-slate-600">
            {t.howWeUseText}
          </p>

          <h2 className="mt-8 text-2xl font-bold text-slate-900">{t.contactUs}</h2>
          <p className="text-slate-600">
            {t.contactUsPrivacy}
          </p>
        </div>
      </div>
    </div>
  );
}
