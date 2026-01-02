"use client";

import { getTranslations, type Language } from "~/lib/i18n";
import { Sparkles, Users, Target, Zap, Heart } from "lucide-react";

interface AboutPageContentProps {
  currentLang?: Language;
}

export function AboutPageContent({ currentLang = "en" }: AboutPageContentProps) {
  const t = getTranslations(currentLang);

  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-6 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-100px,#1e1e1e0a,transparent)]"></div>

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/50 px-4 py-2 backdrop-blur-sm animate-fade-in">
            <Sparkles className="h-4 w-4 text-[#06b6d4]" />
            <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
              {t.aboutUs || "About Us"}
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 animate-fade-in-up [animation-delay:100ms]">
            {t.aboutHeroTitle || "We're building the future of"}{" "}
            <span className="bg-gradient-to-r from-[#1e3a8a] via-[#06b6d4] to-[#1e3a8a] bg-clip-text text-transparent">
              {t.aboutHeroHighlight || "presentations"}
            </span>
          </h1>

          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed animate-fade-in-up [animation-delay:200ms]">
            {t.aboutHeroDesc || "PPT Master is on a mission to empower everyone to create beautiful, professional PowerPoint presentations with the power of AI. As the best AI PowerPoint generator, we make it easy—no design skills required."}
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="relative py-24 px-6 bg-gradient-to-br from-slate-50 to-white">
        <div className="mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#1e3a8a]/10 to-[#06b6d4]/10 px-4 py-2">
                <Target className="h-4 w-4 text-[#06b6d4]" />
                <span className="text-sm font-semibold text-[#06b6d4] uppercase tracking-wide">
                  {t.ourMission || "Our Mission"}
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                {t.missionTitle || "Making design accessible to everyone"}
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-6">
                {t.missionDesc1 || "We believe that great ideas shouldn't be held back by design limitations. That's why PPT Master is building the best AI PowerPoint generator that helps anyone create stunning presentations in minutes."}
              </p>
              <p className="text-lg text-slate-600 leading-relaxed">
                {t.missionDesc2 || "From students to Fortune 500 companies, over 50 million people trust PPT Master to bring their PowerPoint ideas to life with our AI-powered presentation maker."}
              </p>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] p-1 rotate-3 hover:rotate-0 transition-transform duration-500">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=800&fit=crop&q=80"
                  alt="Team collaborating on presentations"
                  className="h-full w-full rounded-3xl object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="relative py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              {t.ourValues || "Our Values"}
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {t.valuesDesc || "The principles that guide everything we do"}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Value 1 */}
            <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 hover:shadow-2xl transition-all duration-300">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] group-hover:scale-110 transition-transform">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                {t.valueUserFirst || "User First"}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {t.valueUserFirstDesc || "Every decision we make starts with our users. We listen, learn, and build products that solve real problems."}
              </p>
            </div>

            {/* Value 2 */}
            <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 hover:shadow-2xl transition-all duration-300">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] group-hover:scale-110 transition-transform">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                {t.valueInnovation || "Innovation"}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {t.valueInnovationDesc || "We push boundaries and embrace new technologies to create tools that were previously impossible."}
              </p>
            </div>

            {/* Value 3 */}
            <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 hover:shadow-2xl transition-all duration-300">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] group-hover:scale-110 transition-transform">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                {t.valueQuality || "Quality"}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {t.valueQualityDesc || "We're obsessed with the details. Every pixel, every interaction, every feature is crafted with care."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-24 px-6 bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4]">
        <div className="mx-auto max-w-7xl">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            <div className="animate-fade-in-up">
              <div className="text-5xl md:text-6xl font-black mb-2">100K+</div>
              <div className="text-lg text-white/80">{t.statUsers || "Users Worldwide"}</div>
            </div>
            <div className="animate-fade-in-up [animation-delay:100ms]">
              <div className="text-5xl md:text-6xl font-black mb-2">1M+</div>
              <div className="text-lg text-white/80">{t.statPresentations || "Presentations Created"}</div>
            </div>
            <div className="animate-fade-in-up [animation-delay:200ms]">
              <div className="text-5xl md:text-6xl font-black mb-2">150+</div>
              <div className="text-lg text-white/80">{t.statCountries || "Countries"}</div>
            </div>
            <div className="animate-fade-in-up [animation-delay:300ms]">
              <div className="text-5xl md:text-6xl font-black mb-2">99%</div>
              <div className="text-lg text-white/80">{t.statSatisfaction || "Satisfaction Rate"}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="relative py-24 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              {t.ourStory || "Our Story"}
            </h2>
          </div>

          <div className="space-y-12">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-24 text-right">
                <div className="text-2xl font-bold text-[#06b6d4]">{t.story2025Year || "2025"}</div>
              </div>
              <div className="flex-1 border-l-2 border-slate-200 pl-6 pb-8">
                <h3 className="text-xl font-bold text-slate-900 mb-2">{t.story2025Title || "The Beginning"}</h3>
                <p className="text-slate-600">{t.story2025Desc || "Founded with a vision to democratize design and make professional presentations accessible to everyone through the power of AI."}</p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-24 text-right">
                <div className="text-2xl font-bold text-[#06b6d4]">{t.story2026Year || "2026"}</div>
              </div>
              <div className="flex-1 pl-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">{t.story2026Title || "The Future"}</h3>
                <p className="text-slate-600">{t.story2026Desc || "Continuing to innovate and push the boundaries of what's possible with AI-powered creativity."}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section - Additional content for SEO */}
      <section className="relative py-24 px-6 bg-gradient-to-br from-slate-50 to-white">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              {t.ourTechnology || "Our Technology"}
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {t.ourTechnologyDesc || "Powered by cutting-edge artificial intelligence and machine learning"}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:shadow-lg transition-all">
                <h3 className="text-xl font-bold text-slate-900 mb-3">{t.advancedAIModels || "Advanced AI Models"}</h3>
                <p className="text-slate-600 leading-relaxed">
                  {t.advancedAIModelsDesc || "PPT Master leverages state-of-the-art large language models and generative AI to understand your content and create visually stunning presentations. Our AI analyzes your input, structures information logically, and generates professional designs automatically."}
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:shadow-lg transition-all">
                <h3 className="text-xl font-bold text-slate-900 mb-3">{t.smartDesignEngine || "Smart Design Engine"}</h3>
                <p className="text-slate-600 leading-relaxed">
                  {t.smartDesignEngineDesc || "Our proprietary design engine combines color theory, typography principles, and layout best practices to ensure every presentation looks professionally crafted. The system automatically balances visual elements for maximum impact and readability."}
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:shadow-lg transition-all">
                <h3 className="text-xl font-bold text-slate-900 mb-3">{t.continuousLearning || "Continuous Learning"}</h3>
                <p className="text-slate-600 leading-relaxed">
                  {t.continuousLearningDesc || "PPT Master continuously improves through user feedback and advanced machine learning techniques. Every presentation created helps our AI become smarter, delivering better results with each iteration."}
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-[#06b6d4] to-[#1e3a8a] p-1 -rotate-3 hover:rotate-0 transition-transform duration-500">
                <img
                  src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=800&fit=crop&q=80"
                  alt="AI Technology powering PPT Master"
                  className="h-full w-full rounded-3xl object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Reach Section */}
      <section className="relative py-24 px-6">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            {t.trustedWorldwide || "Trusted Worldwide"}
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            {t.trustedWorldwideDesc || "From startups to Fortune 500 companies, educators to entrepreneurs, PPT Master serves users across 150+ countries. Our platform supports multiple languages and is designed to meet the diverse presentation needs of a global audience. Whether you're preparing a business pitch, academic lecture, or creative portfolio, PPT Master helps you communicate your ideas effectively."}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50">
              <div className="text-3xl font-bold text-[#06b6d4] mb-2">12+</div>
              <div className="text-sm text-slate-600">{t.languagesSupported || "Languages Supported"}</div>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50">
              <div className="text-3xl font-bold text-[#06b6d4] mb-2">24/7</div>
              <div className="text-sm text-slate-600">{t.platformAvailability || "Platform Availability"}</div>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50">
              <div className="text-3xl font-bold text-[#06b6d4] mb-2">50+</div>
              <div className="text-sm text-slate-600">{t.professionalTemplatesCount || "Professional Templates"}</div>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50">
              <div className="text-3xl font-bold text-[#06b6d4] mb-2">99.9%</div>
              <div className="text-sm text-slate-600">{t.uptimeGuarantee || "Uptime Guarantee"}</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
