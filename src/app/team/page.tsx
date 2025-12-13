"use client";

import { LandingNavbar } from "~/components/LandingNavbar";
import { LandingFooter } from "~/components/LandingFooter";
import { useLanguage } from "~/contexts/LanguageContext";
import { Users, Linkedin, Twitter, Mail } from "lucide-react";

export default function TeamPage() {
  const { t } = useLanguage();

  const leadership = [
    {
      name: "Sarah Chen",
      role: t.roleFounderCEO || "Founder & CEO",
      bio: t.bioSarah || "Former VP of Product at Google. Stanford CS grad. Passionate about democratizing design.",
      image: "SC",
      linkedin: "#",
      twitter: "#",
    },
    {
      name: "Michael Rodriguez",
      role: t.roleCTO || "CTO",
      bio: t.bioMichael || "Ex-Meta AI researcher. MIT PhD. Building the future of AI-powered creativity.",
      image: "MR",
      linkedin: "#",
      twitter: "#",
    },
    {
      name: "Emily Watson",
      role: t.roleCPO || "Chief Product Officer",
      bio: t.bioEmily || "Previously led design at Figma. Obsessed with user experience and beautiful interfaces.",
      image: "EW",
      linkedin: "#",
      twitter: "#",
    },
    {
      name: "David Kim",
      role: t.roleCFO || "CFO",
      bio: t.bioDavid || "Former Goldman Sachs partner. Harvard MBA. Scaling companies from startup to IPO.",
      image: "DK",
      linkedin: "#",
      twitter: "#",
    },
  ];

  const team = [
    {
      name: "Alex Johnson",
      role: t.roleEngineering || "Engineering Lead",
      image: "AJ",
    },
    {
      name: "Maria Garcia",
      role: t.roleDesign || "Design Lead",
      image: "MG",
    },
    {
      name: "James Lee",
      role: t.roleAI || "AI Research Lead",
      image: "JL",
    },
    {
      name: "Sophie Martin",
      role: t.roleMarketing || "Marketing Lead",
      image: "SM",
    },
    {
      name: "Ryan Patel",
      role: t.roleCustomerSuccess || "Customer Success Lead",
      image: "RP",
    },
    {
      name: "Lisa Anderson",
      role: t.roleOperations || "Operations Lead",
      image: "LA",
    },
    {
      name: "Tom Wilson",
      role: t.roleSales || "Sales Lead",
      image: "TW",
    },
    {
      name: "Nina Kowalski",
      role: t.roleHR || "People & Culture Lead",
      image: "NK",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-6 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-100px,#1e1e1e0a,transparent)]"></div>

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/50 px-4 py-2 backdrop-blur-sm animate-fade-in">
            <Users className="h-4 w-4 text-[#06b6d4]" />
            <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
              {t.ourTeam || "Our Team"}
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 animate-fade-in-up [animation-delay:100ms]">
            {t.teamHeroTitle || "Meet the people"}{" "}
            <span className="bg-gradient-to-r from-[#1e3a8a] via-[#06b6d4] to-[#1e3a8a] bg-clip-text text-transparent">
              {t.teamHeroHighlight || "building the future"}
            </span>
          </h1>

          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed animate-fade-in-up [animation-delay:200ms]">
            {t.teamHeroDesc || "We're a diverse team of designers, engineers, and dreamers united by a mission to empower creativity through AI."}
          </p>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="relative py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              {t.leadership || "Leadership"}
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {t.leadershipDesc || "The visionaries guiding our mission"}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {leadership.map((member, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 hover:shadow-2xl transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-6">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] flex items-center justify-center text-white text-2xl font-bold group-hover:scale-110 transition-transform">
                      {member.image}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">
                      {member.name}
                    </h3>
                    <p className="text-[#06b6d4] font-semibold mb-3">
                      {member.role}
                    </p>
                    <p className="text-slate-600 text-sm leading-relaxed mb-4">
                      {member.bio}
                    </p>

                    {/* Social Links */}
                    <div className="flex gap-3">
                      <a
                        href={member.linkedin}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-[#06b6d4] hover:text-white transition-colors"
                      >
                        <Linkedin className="h-4 w-4" />
                      </a>
                      <a
                        href={member.twitter}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-[#06b6d4] hover:text-white transition-colors"
                      >
                        <Twitter className="h-4 w-4" />
                      </a>
                      <a
                        href={`mailto:${member.name.toLowerCase().replace(' ', '.')}@pptmaster.com`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-[#06b6d4] hover:text-white transition-colors"
                      >
                        <Mail className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="relative py-24 px-6 bg-gradient-to-br from-slate-50 to-white">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              {t.theTeamTitle || "The Team"}
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {t.theTeamDesc || "Talented individuals from around the world"}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-xl transition-all duration-300 text-center animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Avatar */}
                <div className="mb-4 mx-auto h-20 w-20 rounded-xl bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] flex items-center justify-center text-white text-xl font-bold group-hover:scale-110 transition-transform">
                  {member.image}
                </div>

                {/* Info */}
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  {member.name}
                </h3>
                <p className="text-sm text-slate-600">
                  {member.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Us Section */}
      <section className="relative py-24 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="rounded-3xl bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] p-12 md:p-16 text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              {t.joinTeamCTA || "Join Our Team"}
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              {t.joinTeamCTADesc || "We're always looking for talented, passionate people to join our mission. Check out our open positions."}
            </p>
            <a
              href="/careers"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-bold text-[#1e3a8a] shadow-xl hover:shadow-2xl transition-all hover:scale-105"
            >
              {t.viewCareers || "View Careers"}
              <span>→</span>
            </a>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
