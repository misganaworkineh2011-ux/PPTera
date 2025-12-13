"use client";

import { LandingNavbar } from "~/components/LandingNavbar";
import { LandingFooter } from "~/components/LandingFooter";
import { useLanguage } from "~/contexts/LanguageContext";
import { Sparkles, Briefcase, TrendingUp, Rocket, Users, BarChart, Calendar } from "lucide-react";

export default function TemplatesPage() {
  const { t } = useLanguage();

  const templates = [
    {
      icon: Briefcase,
      title: t.businessPitch || "Business Pitch",
      description: t.businessPitchDesc || "Professional pitch deck template for investors and stakeholders",
      color: "from-blue-500 to-cyan-500",
      slides: "12 slides",
    },
    {
      icon: TrendingUp,
      title: t.marketingPlan || "Marketing Plan",
      description: t.marketingPlanDesc || "Comprehensive marketing strategy and campaign planning template",
      color: "from-purple-500 to-pink-500",
      slides: "15 slides",
    },
    {
      icon: Rocket,
      title: t.productLaunch || "Product Launch",
      description: t.productLaunchDesc || "Launch your product with impact using this structured template",
      color: "from-orange-500 to-red-500",
      slides: "10 slides",
    },
    {
      icon: BarChart,
      title: t.salesReport || "Sales Report",
      description: t.salesReportDesc || "Present your sales data and insights professionally",
      color: "from-green-500 to-emerald-500",
      slides: "8 slides",
    },
    {
      icon: Users,
      title: t.teamMeeting || "Team Meeting",
      description: t.teamMeetingDesc || "Keep your team aligned with this meeting agenda template",
      color: "from-indigo-500 to-blue-500",
      slides: "6 slides",
    },
    {
      icon: Calendar,
      title: t.quarterlyReview || "Quarterly Review",
      description: t.quarterlyReviewDesc || "Review performance and set goals for the next quarter",
      color: "from-pink-500 to-rose-500",
      slides: "14 slides",
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
            <Sparkles className="h-4 w-4 text-[#06b6d4]" />
            <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
              {t.templates || "Templates"}
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 animate-fade-in-up [animation-delay:100ms]">
            {t.professionalTemplates || "Professional Templates"}
          </h1>

          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed animate-fade-in-up [animation-delay:200ms]">
            {t.templatesSubtitle || "Choose from our collection of professionally designed templates. Customize them to match your brand and message."}
          </p>
        </div>
      </section>

      {/* Templates Grid */}
      <section className="relative px-6 pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {templates.map((template, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white hover:shadow-2xl transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${300 + index * 100}ms` }}
              >
                {/* Gradient Header */}
                <div className={`h-48 bg-gradient-to-br ${template.color} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-20 w-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                      <template.icon className="h-10 w-10 text-white" />
                    </div>
                  </div>
                  
                  {/* Slides Badge */}
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-semibold text-slate-900">
                      {template.slides}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-[#06b6d4] transition-colors">
                    {template.title}
                  </h3>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    {template.description}
                  </p>
                  <button className="w-full py-3 rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white font-bold hover:shadow-xl transition-all hover:scale-105">
                    {t.useTemplate || "Use Template"}
                  </button>
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
              {t.cantFindTemplate || "Can't find the perfect template?"}
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              {t.createCustom || "Create a custom presentation from scratch with our AI-powered generator."}
            </p>
            <button className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-bold text-[#1e3a8a] shadow-xl hover:shadow-2xl transition-all hover:scale-105">
              {t.startCreating || "Start Creating"}
              <Sparkles className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
