"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "~/contexts/LanguageContext";

export default function TeamPage() {
  const { t } = useLanguage();
  const team = [
    {
      name: "Alex Johnson",
      role: "CEO & Founder",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    },
    {
      name: "Sarah Chen",
      role: "CTO",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    },
    {
      name: "Michael Brown",
      role: "Head of Design",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    },
    {
      name: "Emily Davis",
      role: "Head of AI",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face",
    },
  ];

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
          <h1 className="mb-4 text-5xl font-bold text-slate-900">{t.teamTitle}</h1>
          <p className="mx-auto max-w-2xl text-xl text-slate-600">
            {t.teamSubtitle}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {team.map((member, index) => (
            <div
              key={index}
              className="group text-center"
            >
              <div className="mb-4 overflow-hidden rounded-3xl">
                <Image
                  src={member.image}
                  alt={member.name}
                  width={400}
                  height={400}
                  className="h-full w-full object-cover transition group-hover:scale-110"
                />
              </div>
              <h3 className="text-xl font-bold text-slate-900">{member.name}</h3>
              <p className="text-slate-600">{member.role}</p>
            </div>
          ))}
        </div>

        <div className="mt-20 rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 p-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-slate-900">{t.wantToJoin}</h2>
          <p className="mb-8 text-lg text-slate-600">
            {t.wantToJoinDesc}
          </p>
          <Link
            href="/careers"
            className="inline-block rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] px-8 py-3 font-semibold text-white transition hover:opacity-90"
          >
            {t.viewOpenPositions}
          </Link>
        </div>
      </div>
    </div>
  );
}
