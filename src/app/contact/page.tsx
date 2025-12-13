"use client";

import Link from "next/link";
import { ArrowLeft, Mail, MessageSquare } from "lucide-react";
import { useLanguage } from "~/contexts/LanguageContext";

export default function ContactPage() {
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

        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold text-slate-900">{t.contactTitle}</h1>
          <p className="mx-auto max-w-2xl text-xl text-slate-600">
            {t.contactSubtitle}
          </p>
        </div>

        <div className="mb-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4]">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-900">{t.emailUs}</h3>
            <p className="text-slate-600">support@pptmaster.com</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-900">{t.liveChat}</h3>
            <p className="text-slate-600">{t.available247}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8">
          <form className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-900">{t.name}</label>
              <input
                type="text"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-[#06b6d4] focus:outline-none"
                placeholder={t.yourName}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-900">{t.email}</label>
              <input
                type="email"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-[#06b6d4] focus:outline-none"
                placeholder={t.yourEmail}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-900">{t.message}</label>
              <textarea
                rows={6}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-[#06b6d4] focus:outline-none"
                placeholder={t.howCanWeHelp}
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] px-8 py-3 font-semibold text-white transition hover:opacity-90"
            >
              {t.sendMessage}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
