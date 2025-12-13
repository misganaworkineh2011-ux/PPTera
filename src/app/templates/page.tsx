"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useLanguage } from "~/contexts/LanguageContext";

export default function TemplatesPage() {
  const { t } = useLanguage();
  
  const templates = [
    {
      titleKey: "businessPitch",
      category: "Business",
      image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=400&fit=crop",
    },
    {
      titleKey: "marketingPlan",
      category: "Marketing",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
    },
    {
      titleKey: "productLaunch",
      category: "Product",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
    },
    {
      titleKey: "salesReport",
      category: "Sales",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
    },
    {
      titleKey: "teamMeeting",
      category: "Internal",
      image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&h=400&fit=crop",
    },
    {
      titleKey: "quarterlyReview",
      category: "Finance",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
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
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#06b6d4]/30 bg-[#06b6d4]/10 px-4 py-2">
            <Sparkles className="h-4 w-4 text-[#06b6d4]" />
            <span className="text-sm font-medium text-[#1e3a8a]">{t.templates}</span>
          </div>
          <h1 className="mb-4 text-5xl font-bold text-slate-900">
            {t.professionalTemplates}
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-slate-600">
            {t.templatesSubtitle}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template, index) => (
            <div
              key={index}
              className="group overflow-hidden rounded-3xl border border-slate-200 bg-white transition hover:shadow-2xl"
            >
              <div className="aspect-video overflow-hidden">
                <Image
                  src={template.image}
                  alt={t[template.titleKey as keyof typeof t] as string}
                  width={600}
                  height={400}
                  className="h-full w-full object-cover transition group-hover:scale-110"
                />
              </div>
              <div className="p-6">
                <div className="mb-2 inline-block rounded-full bg-[#06b6d4]/10 px-3 py-1 text-xs font-semibold text-[#06b6d4]">
                  {template.category}
                </div>
                <h3 className="text-xl font-bold text-slate-900">{t[template.titleKey as keyof typeof t]}</h3>
                <button className="mt-4 w-full rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] px-6 py-2 text-sm font-semibold text-white transition hover:opacity-90">
                  {t.useTemplate}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
