"use client";

import { LandingNavbar } from "~/components/LandingNavbar";
import { LandingFooter } from "~/components/LandingFooter";
import { useLanguage } from "~/contexts/LanguageContext";
import { Cookie, Settings, Eye, Shield, CheckCircle2 } from "lucide-react";

export default function CookiesPage() {
  const { t } = useLanguage();

  const sections = [
    {
      icon: Cookie,
      title: t.whatAreCookies || "What Are Cookies",
      content: t.whatAreCookiesText || "Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience.",
    },
    {
      icon: Eye,
      title: t.howWeUseCookies || "How We Use Cookies",
      content: t.howWeUseCookiesText || "We use cookies to understand how you use our service, remember your preferences, and improve your experience.",
    },
    {
      icon: Settings,
      title: t.managingCookies || "Managing Cookies",
      content: t.managingCookiesText || "You can control and manage cookies through your browser settings. Please note that removing or blocking cookies may impact your user experience.",
    },
  ];

  const cookieTypes = [
    {
      title: t.essentialCookies || "Essential Cookies",
      description: t.essentialCookiesDesc || "Required for the website to function properly",
      required: true,
    },
    {
      title: t.analyticsCookies || "Analytics Cookies",
      description: t.analyticsCookiesDesc || "Help us understand how visitors use our website",
      required: false,
    },
    {
      title: t.marketingCookies || "Marketing Cookies",
      description: t.marketingCookiesDesc || "Used to deliver relevant advertisements",
      required: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-100px,#1e1e1e0a,transparent)]"></div>

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/50 px-4 py-2 backdrop-blur-sm animate-fade-in">
            <Cookie className="h-4 w-4 text-[#06b6d4]" />
            <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
              {t.cookieNotice || "Cookie Notice"}
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 animate-fade-in-up [animation-delay:100ms]">
            {t.cookiesTitle || "Cookie Policy"}
          </h1>

          <p className="text-lg text-slate-600 mb-4 animate-fade-in-up [animation-delay:200ms]">
            {t.lastUpdated || "Last updated"}: {t.lastUpdatedDate || "January 2025"}
          </p>

          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed animate-fade-in-up [animation-delay:300ms]">
            {t.cookiesIntro || "Learn about how we use cookies and how you can manage them."}
          </p>
        </div>
      </section>

      {/* Content Sections */}
      <section className="relative px-6 pb-12">
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
        </div>
      </section>

      {/* Cookie Types */}
      <section className="relative px-6 pb-24">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            {t.typesOfCookies || "Types of Cookies We Use"}
          </h2>

          <div className="space-y-4">
            {cookieTypes.map((type, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-6 rounded-2xl border border-slate-200 bg-white hover:shadow-lg transition-all animate-fade-in-up"
                style={{ animationDelay: `${700 + index * 100}ms` }}
              >
                <div className="flex-shrink-0">
                  {type.required ? (
                    <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Shield className="h-6 w-6 text-blue-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-slate-900">
                      {type.title}
                    </h3>
                    {type.required && (
                      <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                        {t.required || "Required"}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600">
                    {type.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Cookie Settings CTA */}
          <div className="mt-12 p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 text-center">
            <h3 className="text-xl font-bold text-slate-900 mb-4">
              {t.manageCookiePreferences || "Manage Cookie Preferences"}
            </h3>
            <p className="text-slate-600 mb-6">
              {t.manageCookiePreferencesText || "You can change your cookie preferences at any time through your browser settings."}
            </p>
            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white font-bold hover:shadow-xl transition-all hover:scale-105">
              <Settings className="h-5 w-5" />
              {t.cookieSettings || "Cookie Settings"}
            </button>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
