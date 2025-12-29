"use client";

import { LandingNavbar } from "~/components/LandingNavbar";
import { LandingFooter } from "~/components/LandingFooter";
import { useLanguage } from "~/contexts/LanguageContext";
import { Shield, Lock, Eye, Database, UserCheck, FileText } from "lucide-react";

export default function PrivacyPage() {
  const { t } = useLanguage();

  const sections = [
    {
      icon: Database,
      title: t.informationWeCollect || "Information We Collect",
      content: t.informationWeCollectText || "PPT Master collects information you provide directly to us, such as when you create an account, use our AI PowerPoint generator, or contact us for support. This includes your name, email address, and any PowerPoint presentations you create.",
    },
    {
      icon: Eye,
      title: t.howWeUseInfo || "How We Use Your Information",
      content: t.howWeUseInfoText || "We use the information we collect to provide, maintain, and improve our services, to communicate with you, and to protect our users and services.",
    },
    {
      icon: Lock,
      title: t.dataSecurity || "Data Security",
      content: t.dataSecurityText || "We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.",
    },
    {
      icon: UserCheck,
      title: t.yourRights || "Your Rights",
      content: t.yourRightsText || "You have the right to access, update, or delete your personal information at any time. You can also opt out of marketing communications.",
    },
    {
      icon: FileText,
      title: t.dataRetention || "Data Retention",
      content: t.dataRetentionText || "We retain your personal information for as long as necessary to provide our services and comply with legal obligations.",
    },
  ];

  return (
    <div className="landing-page min-h-screen bg-white">
      <LandingNavbar />

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-100px,#1e1e1e0a,transparent)]"></div>

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/50 px-4 py-2 backdrop-blur-sm animate-fade-in">
            <Shield className="h-4 w-4 text-[#06b6d4]" />
            <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
              {t.privacyPolicy || "Privacy Policy"}
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 animate-fade-in-up [animation-delay:100ms]">
            {t.privacyTitle || "Privacy Policy"}
          </h1>

          <p className="text-lg text-slate-600 mb-4 animate-fade-in-up [animation-delay:200ms]">
            {t.lastUpdated || "Last updated"}: {t.lastUpdatedDate || "January 2025"}
          </p>

          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed animate-fade-in-up [animation-delay:300ms]">
            {t.privacyIntro || "Your privacy is important to PPT Master. This policy explains how our AI PowerPoint generator collects, uses, and protects your personal information."}
          </p>
        </div>
      </section>

      {/* Content Sections */}
      <section className="relative px-6 pb-24">
        <div className="mx-auto max-w-4xl">
          <div className="space-y-12">
            {sections.map((section, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 hover:shadow-xl transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${400 + index * 100}ms` }}
              >
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <section.icon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">
                      {section.title}
                    </h2>
                    <p className="text-slate-600 leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Info */}
          <div className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-4">
              {t.contactPrivacy || "Questions about privacy?"}
            </h3>
            <p className="text-slate-600 mb-6">
              {t.contactPrivacyText || "If you have any questions about PPT Master's Privacy Policy or how we handle data in our AI PowerPoint generator, please contact us at privacy@pptmaster.com"}
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white font-bold hover:shadow-xl transition-all hover:scale-105"
            >
              {t.contactUs || "Contact Us"}
            </a>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
