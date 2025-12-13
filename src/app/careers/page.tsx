"use client";

import Link from "next/link";
import { ArrowLeft, Briefcase } from "lucide-react";
import { useLanguage } from "~/contexts/LanguageContext";

export default function CareersPage() {
  const { t } = useLanguage();
  const jobs = [
    {
      title: "Senior Frontend Engineer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
    },
    {
      title: "Product Designer",
      department: "Design",
      location: "Remote",
      type: "Full-time",
    },
    {
      title: "AI/ML Engineer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
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
          <h1 className="mb-4 text-5xl font-bold text-slate-900">{t.careersTitle}</h1>
          <p className="mx-auto max-w-2xl text-xl text-slate-600">
            {t.careersSubtitle}
          </p>
        </div>

        <div className="space-y-4">
          {jobs.map((job, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-[#06b6d4]/50 hover:shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4]">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
                  <p className="text-sm text-slate-600">
                    {job.department} • {job.location} • {job.type}
                  </p>
                </div>
              </div>
              <button className="rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
                {t.applyNow}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
