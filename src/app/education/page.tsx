"use client";

import { GraduationCap, BookOpen, Users, CheckCircle2, Sparkles } from "lucide-react";
import { getTranslations, type Language } from "~/lib/i18n";
import { LandingNavbar } from "~/components/LandingNavbar";
import { LandingFooter } from "~/components/LandingFooter";
import Link from "next/link";

interface EducationPageProps {
  currentLang?: Language;
}

export default function EducationPage({ currentLang = "en" }: EducationPageProps) {
  const t = getTranslations(currentLang);

  // Use type assertion with fallback for new translations
  const eduTranslations = t as typeof t & {
    eduBadge?: string;
    eduStudentDesc?: string;
    eduFeature1?: string;
    eduFeature2?: string;
    eduFeature3?: string;
    eduFeature4?: string;
    eduFeature5?: string;
    eduFeature6?: string;
    eduFeature7?: string;
    eduFeature8?: string;
  };

  const studentTeacherFeatures = [
    eduTranslations.eduFeature1 || "Access to all premium templates",
    eduTranslations.eduFeature2 || "Export to PowerPoint, PDF, Google Slides",
    eduTranslations.eduFeature3 || "Real-time collaboration",
    eduTranslations.eduFeature4 || "Priority support",
    eduTranslations.eduFeature5 || "AI-powered slide generation",
  ];

  const schoolFeatures = [
    eduTranslations.eduFeature6 || "Unlimited AI-generated presentations",
    eduTranslations.eduFeature1 || "Access to all premium templates",
    eduTranslations.eduFeature2 || "Export to PowerPoint, PDF, Google Slides",
    eduTranslations.eduFeature3 || "Real-time collaboration",
    eduTranslations.eduFeature4 || "Priority support",
    eduTranslations.eduFeature7 || "Admin dashboard",
    eduTranslations.eduFeature8 || "Usage analytics",
  ];

  return (
    <div className="landing-page min-h-screen bg-white">
      <LandingNavbar currentLang={currentLang} />

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 px-6 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-100px,#1e1e1e0a,transparent)]"></div>

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/50 px-4 py-2 backdrop-blur-sm">
            <GraduationCap className="h-4 w-4 text-[#14b8a6]" />
            <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
              {eduTranslations.eduBadge || "Education"}
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-8">
            {t.educationTitle}
          </h1>

          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-10">
            {t.educationSubtitle}
          </p>

          <Link
            href="/contact"
            className="inline-flex items-center gap-2 h-14 rounded-full bg-black px-10 text-lg font-bold text-white shadow-xl transition hover:scale-105 hover:bg-slate-800"
          >
            <Sparkles className="w-5 h-5" />
            {t.contactSales}
          </Link>
        </div>
      </section>

      {/* Plans Section */}
      <section className="relative py-24 px-6 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-3">
            {/* Students */}
            <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 hover:shadow-2xl transition-all duration-300">
              <div className="absolute top-0 right-0 bg-[#14b8a6] text-white text-xs font-bold px-4 py-1 rounded-bl-xl">
                {t.fiftyPercentOff}
              </div>
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0f766e] to-[#14b8a6] group-hover:scale-110 transition-transform">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-2 text-2xl font-bold text-slate-900">{t.forStudents}</h3>
              <p className="mb-6 text-slate-600 leading-relaxed">
                {eduTranslations.eduStudentDesc || "50% off on all Pro plans with full premium access"}
              </p>
              <ul className="space-y-3 mb-8">
                {studentTeacherFeatures.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="h-4 w-4 text-[#14b8a6]" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/pricing"
                className="block w-full text-center rounded-full border-2 border-slate-200 py-3 font-semibold text-slate-900 hover:border-[#14b8a6] hover:text-[#14b8a6] transition-colors"
              >
                {t.learnMore}
              </Link>
            </div>

            {/* Teachers */}
            <div className="group relative overflow-hidden rounded-3xl border-2 border-[#14b8a6] bg-white p-8 hover:shadow-2xl transition-all duration-300 scale-105">
              <div className="absolute top-0 right-0 bg-gradient-to-r from-[#0f766e] to-[#14b8a6] text-white text-xs font-bold px-4 py-1 rounded-bl-xl">
                {t.fiftyPercentOff}
              </div>
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0f766e] to-[#14b8a6] group-hover:scale-110 transition-transform">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-2 text-2xl font-bold text-slate-900">{t.forTeachers}</h3>
              <p className="mb-6 text-slate-600 leading-relaxed">
                {eduTranslations.eduStudentDesc || "50% off on all Pro plans with full premium access"}
              </p>
              <ul className="space-y-3 mb-8">
                {studentTeacherFeatures.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="h-4 w-4 text-[#14b8a6]" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/pricing"
                className="block w-full text-center rounded-full bg-gradient-to-r from-[#0f766e] to-[#14b8a6] py-3 font-semibold text-white hover:shadow-lg transition-all"
              >
                {t.getStartedBtn}
              </Link>
            </div>

            {/* Schools */}
            <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 hover:shadow-2xl transition-all duration-300">
              <div className="absolute top-0 right-0 bg-[#14b8a6] text-white text-xs font-bold px-4 py-1 rounded-bl-xl">
                {t.custom}
              </div>
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0f766e] to-[#14b8a6] group-hover:scale-110 transition-transform">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-2 text-2xl font-bold text-slate-900">{t.forSchools}</h3>
              <p className="mb-6 text-slate-600 leading-relaxed">
                {t.forSchoolsDesc}
              </p>
              <ul className="space-y-3 mb-8">
                {schoolFeatures.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="h-4 w-4 text-[#14b8a6]" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/contact"
                className="block w-full text-center rounded-full border-2 border-slate-200 py-3 font-semibold text-slate-900 hover:border-[#14b8a6] hover:text-[#14b8a6] transition-colors"
              >
                {t.contactSales}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="rounded-3xl bg-gradient-to-br from-[#0f766e] to-[#14b8a6] p-12 md:p-16 text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              {t.readyToStart}
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              {t.readyToStartDesc}
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-bold text-[#0f766e] shadow-xl hover:shadow-2xl transition-all hover:scale-105"
            >
              {t.contactSales}
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter currentLang={currentLang} />
    </div>
  );
}
