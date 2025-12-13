"use client";

import Link from "next/link";
import { ArrowLeft, GraduationCap, BookOpen, Users } from "lucide-react";
import { useLanguage } from "~/contexts/LanguageContext";

export default function EducationPage() {
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
          <h1 className="mb-4 text-5xl font-bold text-slate-900">{t.educationTitle}</h1>
          <p className="mx-auto max-w-2xl text-xl text-slate-600">
            {t.educationSubtitle}
          </p>
        </div>

        <div className="mb-20 grid gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4]">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-900">{t.forStudents}</h3>
            <p className="mb-4 text-slate-600">
              {t.forStudentsDesc}
            </p>
            <p className="text-2xl font-bold text-[#06b6d4]">{t.fiftyPercentOff}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-900">{t.forTeachers}</h3>
            <p className="mb-4 text-slate-600">
              {t.forTeachersDesc}
            </p>
            <p className="text-2xl font-bold text-purple-600">{t.free}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-900">{t.forSchools}</h3>
            <p className="mb-4 text-slate-600">
              {t.forSchoolsDesc}
            </p>
            <p className="text-2xl font-bold text-orange-600">{t.custom}</p>
          </div>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] p-12 text-center text-white">
          <h2 className="mb-4 text-3xl font-bold">{t.readyToStart}</h2>
          <p className="mb-8 text-lg text-white/90">
            {t.readyToStartDesc}
          </p>
          <Link
            href="/contact"
            className="inline-block rounded-full bg-white px-8 py-3 font-semibold text-[#1e3a8a] transition hover:bg-slate-100"
          >
            {t.contactSales}
          </Link>
        </div>
      </div>
    </div>
  );
}
