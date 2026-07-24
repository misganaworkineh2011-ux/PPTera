"use client";

import { LandingNavbar } from "~/components/LandingNavbar";
import { LandingFooter } from "~/components/LandingFooter";
import { getTranslations, type Language } from "~/lib/i18n";
import { Rocket, Heart, Zap, Globe, Users, TrendingUp, Coffee, Briefcase } from "lucide-react";
import { LoadingLink } from "~/components/LoadingLink";
import { useState, useEffect } from "react";
import { JobApplicationModal } from "~/components/JobApplicationModal";

// Helper to get localized path
function getLocalizedPath(path: string, lang: Language): string {
  if (lang === "en") return path;
  return `/${lang}${path}`;
}

interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string;
  benefits: string | null;
}

interface CareersPageClientProps {
  currentLang?: Language;
}

export default function CareersPageClient({ currentLang = "en" }: CareersPageClientProps) {
  const t = getTranslations(currentLang);
  const localPath = (path: string) => getLocalizedPath(path, currentLang);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  const handleApplyClick = (job: JobPosting) => {
    setSelectedJob(job);
    setShowApplicationModal(true);
  };

  const departments = ["all", "Engineering", "Design", "Marketing", "Sales", "Customer Success"];

  useEffect(() => {
    fetchJobs();
  }, [selectedDepartment]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const url = selectedDepartment === "all" 
        ? "/api/careers/jobs"
        : `/api/careers/jobs?department=${selectedDepartment}`;
      const response = await fetch(url);
      const data = await response.json();
      setJobs(data.jobs || []);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentIcon = (department: string) => {
    const icons: Record<string, typeof Zap> = {
      Engineering: Zap,
      Design: Heart,
      Marketing: TrendingUp,
      Sales: Briefcase,
      "Customer Success": Users,
    };
    return icons[department] || Rocket;
  };

  const benefits = [
    {
      icon: Heart,
      title: t.benefitHealthcare || "Healthcare",
      description: t.benefitHealthcareDesc || "Comprehensive medical, dental, and vision coverage for you and your family",
    },
    {
      icon: Globe,
      title: t.benefitRemote || "Remote First",
      description: t.benefitRemoteDesc || "Work from anywhere in the world with flexible hours",
    },
    {
      icon: TrendingUp,
      title: t.benefitGrowth || "Career Growth",
      description: t.benefitGrowthDesc || "Continuous learning opportunities and clear career progression paths",
    },
    {
      icon: Coffee,
      title: t.benefitPTO || "Unlimited PTO",
      description: t.benefitPTODesc || "Take the time you need to recharge and maintain work-life balance",
    },
    {
      icon: Rocket,
      title: t.benefitEquity || "Equity",
      description: t.benefitEquityDesc || "Competitive equity packages so you share in our success",
    },
    {
      icon: Users,
      title: t.benefitTeam || "Amazing Team",
      description: t.benefitTeamDesc || "Work with talented, passionate people from around the world",
    },
  ];

  return (
    <div className="landing-page min-h-screen bg-white">
      <LandingNavbar currentLang={currentLang} />

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-100px,#1e1e1e0a,transparent)]"></div>

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/50 px-4 py-2 backdrop-blur-sm animate-fade-in">
            <Briefcase className="h-4 w-4 text-[#14b8a6]" />
            <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
              {t.careers || "Careers"}
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 animate-fade-in-up [animation-delay:100ms]">
            {t.careersHeroTitle || "Build the future with"}{" "}
            <span className="bg-gradient-to-r from-[#0f766e] via-[#14b8a6] to-[#0f766e] bg-clip-text text-transparent">
              {t.careersHeroHighlight || "us"}
            </span>
          </h1>

          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed animate-fade-in-up [animation-delay:200ms]">
            {t.careersHeroDesc || "Join PPTera, a team of passionate innovators building the best AI PowerPoint generator that empowers millions of people worldwide to create stunning presentations."}
          </p>

          <p className="text-lg text-slate-500 max-w-2xl mx-auto mt-4 leading-relaxed animate-fade-in-up [animation-delay:250ms]">
            {t.careersRemoteFirstDesc || "We're a remote-first company with team members across the globe, united by our mission to democratize professional design through artificial intelligence."}
          </p>

          <div className="mt-10 animate-fade-in-up [animation-delay:300ms]">
            <a
              href="#positions"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#0f766e] to-[#14b8a6] px-8 py-4 text-lg font-bold text-white shadow-xl hover:shadow-2xl transition-all hover:scale-105"
            >
              {t.viewOpenPositions || "View Open Positions"}
              <Rocket className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Why Join Us Section */}
      <section className="relative py-24 px-6 bg-gradient-to-br from-slate-50 to-white">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              {t.whyJoinUs || "Why Join Us"}
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {t.whyJoinUsDesc || "We're building something special, and we want you to be part of it"}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 hover:shadow-2xl transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 group-hover:scale-110 transition-transform">
                  <benefit.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions Section */}
      <section id="positions" className="relative py-24 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              {t.openPositionsTitle || "Open Positions"}
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              {t.openPositionsDesc || "Find your next opportunity"}
            </p>
            
            <div className="flex flex-wrap justify-center gap-3">
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDepartment(dept)}
                  className={`px-6 py-2 rounded-full border text-sm font-semibold transition-all ${
                    selectedDepartment === dept
                      ? "border-[#14b8a6] bg-[#14b8a6] text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#14b8a6] border-r-transparent"></div>
              <p className="mt-4 text-slate-600">{t.loadingPositions || "Loading positions..."}</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600">{t.noPositionsAvailable || "No open positions at the moment. Check back soon!"}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job, index) => {
                const Icon = getDepartmentIcon(job.department);
                return (
                  <div
                    key={job.id}
                    className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-xl transition-all duration-300 hover:border-[#14b8a6] animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#0f766e] to-[#14b8a6] text-white flex-shrink-0">
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-[#14b8a6] transition-colors">
                            {job.title}
                          </h3>
                          <div className="flex flex-wrap gap-3 text-sm text-slate-600 mb-2">
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-4 w-4" />
                              {job.department}
                            </span>
                            <span className="flex items-center gap-1">
                              <Globe className="h-4 w-4" />
                              {job.location}
                            </span>
                            <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                              {job.type}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 line-clamp-2">{job.description}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleApplyClick(job)}
                        className="self-start md:self-center px-6 py-2 rounded-full bg-slate-900 text-white font-semibold hover:bg-[#14b8a6] transition-colors whitespace-nowrap"
                      >
                        {t.applyNow || "Apply Now"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-12 text-center">
            <p className="text-slate-600 mb-4">
              {t.dontSeeRole || "Don't see a role that fits?"}
            </p>
            <LoadingLink
              href={localPath("/contact")}
              className="inline-flex items-center gap-2 text-[#14b8a6] font-semibold hover:underline"
            >
              {t.getInTouch || "Get in touch"}
              <span>→</span>
            </LoadingLink>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-6 bg-gradient-to-br from-[#0f766e] to-[#14b8a6]">
        <div className="mx-auto max-w-4xl text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {t.readyToJoin || "Ready to join our mission?"}
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            {t.readyToJoinDesc || "We're always looking for talented people who are passionate about building the future of presentations."}
          </p>
          <a
            href="#positions"
            className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-bold text-[#0f766e] shadow-xl hover:shadow-2xl transition-all hover:scale-105"
          >
            {t.exploreOpportunities || "Explore Opportunities"}
          </a>
        </div>
      </section>

      {/* Culture Section - Additional content for SEO */}
      <section className="relative py-24 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              {t.ourCulture || "Our Culture"}
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {t.ourCultureDesc || "What it's like to work at PPTera"}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{t.cultureRemoteTitle || "Remote-First Philosophy"}</h3>
              <p className="text-slate-600 leading-relaxed">
                {t.cultureRemoteDesc || "We believe great work can happen anywhere. Our team spans multiple time zones, and we've built our processes around asynchronous communication and flexible schedules. Whether you're an early bird or a night owl, you'll find a rhythm that works for you."}
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{t.cultureLearningTitle || "Continuous Learning"}</h3>
              <p className="text-slate-600 leading-relaxed">
                {t.cultureLearningDesc || "The AI landscape evolves rapidly, and so do we. We provide learning budgets, conference attendance, and dedicated time for skill development. Our team regularly shares knowledge through internal tech talks and workshops."}
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{t.cultureImpactTitle || "Impact-Driven Work"}</h3>
              <p className="text-slate-600 leading-relaxed">
                {t.cultureImpactDesc || "Every feature you build reaches millions of users. We measure success by the impact we create, not hours logged. You'll have the autonomy to make decisions and see your work directly improve how people communicate their ideas."}
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{t.cultureInclusiveTitle || "Inclusive Environment"}</h3>
              <p className="text-slate-600 leading-relaxed">
                {t.cultureInclusiveDesc || "We're committed to building a diverse team where everyone feels welcome. Different perspectives lead to better products, and we actively work to create an environment where all voices are heard and valued."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter currentLang={currentLang} />

      {selectedJob && (
        <JobApplicationModal
          isOpen={showApplicationModal}
          onClose={() => {
            setShowApplicationModal(false);
            setSelectedJob(null);
          }}
          job={selectedJob}
        />
      )}
    </div>
  );
}
