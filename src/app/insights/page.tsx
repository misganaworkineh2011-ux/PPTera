"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, TrendingUp, Users, Zap } from "lucide-react";
import { useLanguage } from "~/contexts/LanguageContext";

export default function InsightsPage() {
  const { t } = useLanguage();
  
  const insights = [
    {
      titleKey: "futureOfAI",
      categoryKey: "aiTechnology",
      date: "January 15, 2025",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop",
      excerptKey: "futureOfAIExcerpt",
    },
    {
      titleKey: "designTrends",
      categoryKey: "design",
      date: "January 10, 2025",
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=400&fit=crop",
      excerptKey: "designTrendsExcerpt",
    },
    {
      titleKey: "maximizingEngagement",
      categoryKey: "bestPractices",
      date: "January 5, 2025",
      image: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=600&h=400&fit=crop",
      excerptKey: "maximizingEngagementExcerpt",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.backToHome}
        </Link>

        <div className="mb-16 text-center">
          <h1 className="mb-4 text-5xl font-bold text-slate-900">{t.insightsTitle}</h1>
          <p className="mx-auto max-w-2xl text-xl text-slate-600">
            {t.insightsSubtitle}
          </p>
        </div>

        {/* Featured Stats */}
        <div className="mb-16 grid gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4]">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <h3 className="mb-2 text-3xl font-bold text-slate-900">50M+</h3>
            <p className="text-slate-600">{t.presentationsCreated}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="mb-2 text-3xl font-bold text-slate-900">10M+</h3>
            <p className="text-slate-600">{t.activeUsers}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <h3 className="mb-2 text-3xl font-bold text-slate-900">95%</h3>
            <p className="text-slate-600">{t.timeSaved}</p>
          </div>
        </div>

        {/* Articles */}
        <div className="space-y-8">
          {insights.map((insight, index) => (
            <div
              key={index}
              className="group overflow-hidden rounded-3xl border border-slate-200 bg-white transition hover:shadow-2xl"
            >
              <div className="grid gap-6 md:grid-cols-3">
                <div className="aspect-video overflow-hidden md:aspect-auto">
                  <Image
                    src={insight.image}
                    alt={t[insight.titleKey as keyof typeof t] as string}
                    width={600}
                    height={400}
                    className="h-full w-full object-cover transition group-hover:scale-110"
                  />
                </div>
                <div className="p-6 md:col-span-2 md:p-8">
                  <div className="mb-2 flex items-center gap-3">
                    <span className="inline-block rounded-full bg-[#06b6d4]/10 px-3 py-1 text-xs font-semibold text-[#06b6d4]">
                      {t[insight.categoryKey as keyof typeof t]}
                    </span>
                    <span className="text-sm text-slate-500">{insight.date}</span>
                  </div>
                  <h3 className="mb-3 text-2xl font-bold text-slate-900">{t[insight.titleKey as keyof typeof t]}</h3>
                  <p className="mb-4 text-slate-600">{t[insight.excerptKey as keyof typeof t]}</p>
                  <button className="font-semibold text-[#06b6d4] transition hover:text-[#1e3a8a]">
                    {t.readMore}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
