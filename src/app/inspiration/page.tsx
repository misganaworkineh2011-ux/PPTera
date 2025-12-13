"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useLanguage } from "~/contexts/LanguageContext";

export default function InspirationPage() {
  const { t } = useLanguage();
  const examples = [
    {
      title: "Business Pitch Deck",
      category: "Business",
      image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=400&fit=crop",
    },
    {
      title: "Marketing Strategy",
      category: "Marketing",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
    },
    {
      title: "Product Launch",
      category: "Product",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
    },
    {
      title: "Sales Report",
      category: "Sales",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
    },
    {
      title: "Team Meeting",
      category: "Internal",
      image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&h=400&fit=crop",
    },
    {
      title: "Quarterly Review",
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
            <span className="text-sm font-medium text-[#1e3a8a]">{t.inspirationGallery}</span>
          </div>
          <h1 className="mb-4 text-5xl font-bold text-slate-900">
            {t.getInspired}
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-slate-600">
            {t.getInspiredSubtitle}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {examples.map((example, index) => (
            <div
              key={index}
              className="group overflow-hidden rounded-3xl border border-slate-200 bg-white transition hover:shadow-2xl"
            >
              <div className="aspect-video overflow-hidden">
                <Image
                  src={example.image}
                  alt={example.title}
                  width={600}
                  height={400}
                  className="h-full w-full object-cover transition group-hover:scale-110"
                />
              </div>
              <div className="p-6">
                <div className="mb-2 inline-block rounded-full bg-[#06b6d4]/10 px-3 py-1 text-xs font-semibold text-[#06b6d4]">
                  {example.category}
                </div>
                <h3 className="text-xl font-bold text-slate-900">{example.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
