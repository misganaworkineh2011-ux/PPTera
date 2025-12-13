"use client";

import { LandingNavbar } from "~/components/LandingNavbar";
import { LandingFooter } from "~/components/LandingFooter";
import { useLanguage } from "~/contexts/LanguageContext";
import { Lightbulb, Target, Layers, Zap, CheckCircle2 } from "lucide-react";

export default function PromptGuidePage() {
  const { t } = useLanguage();

  const tips = [
    {
      icon: Target,
      title: t.beSpecific || "Be Specific",
      description: t.beSpecificDesc || "The more specific your prompt, the better the results. Instead of 'Create a presentation about marketing,' try:",
      example: t.beSpecificExample || "Create a 10-slide presentation about digital marketing strategies for small businesses, including social media, email marketing, and SEO best practices",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Layers,
      title: t.includeStructure || "Include Structure",
      description: t.includeStructureDesc || "Tell the AI how you want your presentation organized:",
      example: t.includeStructureExample || "Create a presentation with: 1) Problem statement, 2) Market analysis, 3) Our solution, 4) Business model, 5) Team, 6) Financial projections",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Zap,
      title: t.defineAudience || "Define Your Audience",
      description: t.defineAudienceDesc || "Specify who will be viewing your presentation:",
      example: t.defineAudienceExample || "Create an investor pitch deck for Series A funding, targeting venture capital firms interested in SaaS startups",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: Lightbulb,
      title: t.setTone || "Set the Tone",
      description: t.setToneDesc || "Describe the style and tone you want:",
      example: t.setToneExample || "Create a professional yet friendly presentation for employee onboarding, with a modern design and conversational tone",
      color: "from-green-500 to-emerald-500",
    },
  ];

  const examples = [
    {
      category: "Business",
      prompt: "Create a 15-slide quarterly business review presentation for Q4 2024, including revenue metrics, key achievements, challenges faced, and goals for Q1 2025. Target audience: executive team.",
    },
    {
      category: "Education",
      prompt: "Design a 20-slide educational presentation about climate change for high school students, covering causes, effects, and solutions. Use engaging visuals and simple language.",
    },
    {
      category: "Marketing",
      prompt: "Build a product launch presentation for a new mobile app, including market opportunity, features, competitive analysis, go-to-market strategy, and success metrics. 12 slides total.",
    },
    {
      category: "Sales",
      prompt: "Create a sales pitch deck for enterprise clients, highlighting our SaaS platform's ROI, case studies, pricing tiers, and implementation timeline. Professional and data-driven tone.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-100px,#1e1e1e0a,transparent)]"></div>

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/50 px-4 py-2 backdrop-blur-sm animate-fade-in">
            <Lightbulb className="h-4 w-4 text-[#06b6d4]" />
            <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
              {t.promptGuide || "Prompt Guide"}
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 animate-fade-in-up [animation-delay:100ms]">
            {t.promptGuideTitle || "Master the art of"}{" "}
            <span className="bg-gradient-to-r from-[#1e3a8a] via-[#06b6d4] to-[#1e3a8a] bg-clip-text text-transparent">
              {t.promptGuideHighlight || "AI prompts"}
            </span>
          </h1>

          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed animate-fade-in-up [animation-delay:200ms]">
            {t.promptGuideSubtitle || "Learn how to write effective prompts to get the best results from PPTMaster AI."}
          </p>
        </div>
      </section>

      {/* Tips Section */}
      <section className="relative px-6 pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-8">
            {tips.map((tip, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 hover:shadow-2xl transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${300 + index * 100}ms` }}
              >
                {/* Icon */}
                <div className={`mb-6 h-16 w-16 rounded-2xl bg-gradient-to-br ${tip.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <tip.icon className="h-8 w-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  {tip.title}
                </h3>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  {tip.description}
                </p>

                {/* Example */}
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                  <div className="flex items-start gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      {t.goodExample || "Good Example"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 italic leading-relaxed">
                    "{tip.example}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Examples Section */}
      <section className="relative px-6 pb-24 bg-gradient-to-br from-slate-50 to-white">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              {t.promptExamples || "Prompt Examples"}
            </h2>
            <p className="text-lg text-slate-600">
              {t.promptExamplesDesc || "Real-world examples to inspire your next presentation"}
            </p>
          </div>

          <div className="space-y-6">
            {examples.map((example, index) => (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-xl transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${600 + index * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white text-xs font-semibold">
                      {example.category}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed flex-1">
                    {example.prompt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative px-6 pb-24">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] p-12 md:p-16 text-center text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              {t.readyToCreate || "Ready to create?"}
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              {t.readyToCreateDesc || "Put these tips into practice and create your first AI-powered presentation."}
            </p>
            <button className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-bold text-[#1e3a8a] shadow-xl hover:shadow-2xl transition-all hover:scale-105">
              {t.startCreating || "Start Creating"}
              <Zap className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
