"use client";

import { useState } from "react";
import { Sparkles, Wand2, Share2 } from "lucide-react";
import { SignInButton } from "@clerk/nextjs";
import { LoadingLink } from "~/components/LoadingLink";
import { LazyVideo } from "./LazyVideo";
import { type Language } from "~/lib/i18n";

interface FeaturesSectionProps {
  t: any;
  currentLang: Language;
}

// Helper to get localized path
function getLocalizedPath(path: string, lang: Language): string {
  if (lang === "en") return path;
  return `/${lang}${path}`;
}

// Cloudinary demo video URL - replace with your own when ready
const FEATURE_DEMO_VIDEO = "https://res.cloudinary.com/di76ibrro/video/upload/v1767877229/2026-01-0804-48-10online-video-cutter.com1-ezgif_iclikm.mp4";

// Presentation images for the inspiration cards - optimized with auto format and quality
const INSPIRATION_IMAGES = [
  "https://res.cloudinary.com/di76ibrro/image/upload/f_auto,q_auto,w_800/v1766152567/Architectural_pptmaster_a18ccs.png",
  "https://res.cloudinary.com/di76ibrro/image/upload/f_auto,q_auto,w_800/v1766152472/corporate_pptmaster_gcvo7p.png",
  "https://res.cloudinary.com/di76ibrro/image/upload/f_auto,q_auto,w_800/v1766152111/alien_pptmaster_ldo5wm.png",
];

// Best 5 themes for preview
const THEME_PREVIEWS = [
  {
    id: "corporate-clean",
    name: "Corporate Clean",
    bg: "#ffffff",
    titleBg: "linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)",
    textColor: "#374151",
    headingColor: "#111827",
    accentColor: "#2563eb",
    borderColor: "#e5e7eb",
  },
  {
    id: "elegant-noir",
    name: "Elegant Noir",
    bg: "#0a0a0b",
    titleBg: "linear-gradient(135deg, #1a1a1d 0%, #27272a 100%)",
    textColor: "#e4e4e7",
    headingColor: "#fafafa",
    accentColor: "#f59e0b",
    borderColor: "#27272a",
  },
  {
    id: "cyber-neon",
    name: "Cyber Neon",
    bg: "#0a0a0f",
    titleBg: "linear-gradient(135deg, #0f0f18 0%, #1a1a2e 100%)",
    textColor: "#e0f0ff",
    headingColor: "#ffffff",
    accentColor: "#00ffff",
    borderColor: "#1a1a2e",
  },
  {
    id: "sunset-gradient",
    name: "Sunset Gradient",
    bg: "#1c1017",
    titleBg: "linear-gradient(135deg, #2d1a24 0%, #4c1d3d 100%)",
    textColor: "#fce7f3",
    headingColor: "#ffffff",
    accentColor: "#f472b6",
    borderColor: "#4c1d3d",
  },
  {
    id: "ocean-depths",
    name: "Ocean Depths",
    bg: "#0a1628",
    titleBg: "linear-gradient(135deg, #0d1f35 0%, #1e3a5f 100%)",
    textColor: "#e0f2fe",
    headingColor: "#ffffff",
    accentColor: "#14b8a6",
    borderColor: "#1e3a5f",
  },
];

export function FeaturesSection({ t, currentLang }: FeaturesSectionProps) {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const localPath = (path: string) => getLocalizedPath(path, currentLang);

  return (
    <section className="py-24 px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        {/* Main Feature - Full Width */}
        <div className="mb-32">
          <h2 className="text-[2.75rem] leading-[1.15] font-semibold tracking-tight text-zinc-900 max-w-2xl lg:text-[3.25rem]">
            {t.fromIdeaToPPT || "From idea to PowerPoint in minutes with AI"}
          </h2>
          
          {/* Feature Demo */}
          <div className="mt-12 relative">
            <div className="rounded-2xl overflow-hidden border border-zinc-200 bg-white shadow-xl">
              {/* App Interface */}
              <div className="grid lg:grid-cols-[300px_1fr]">
                {/* Left Panel - AI Chat */}
                <div className="border-r border-zinc-200 p-6 bg-white">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-zinc-900">{t.aiAssistant || "AI Assistant"}</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-3 bg-zinc-50 rounded-lg">
                      <p className="text-sm text-zinc-600">{t.featuresDemoPrompt || "Create a 10-slide pitch deck for my SaaS startup with modern design."}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-xs text-zinc-600 font-medium">{t.generating || "Generating"}</p>
                      <p className="text-xs text-zinc-600">{t.creatingSlides || "Creating professional slides with consistent branding and smart layouts..."}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-xs text-zinc-600 font-medium">{t.slidesIncluded || "Slides included:"}</p>
                      <ul className="text-xs text-zinc-600 space-y-1">
                        <li>• {t.titleSlideWithBranding || "Title slide with company branding"}</li>
                        <li>• {t.problemSolutionOverview || "Problem & solution overview"}</li>
                        <li>• {t.marketAnalysisCharts || "Market analysis with charts"}</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                {/* Right Panel - Video (lazy loaded Cloudinary) */}
                <div className="relative aspect-video overflow-hidden bg-zinc-900">
                  <LazyVideo
                    src={FEATURE_DEMO_VIDEO}
                    className="absolute inset-0 w-full h-full"
                    title="PPT Master AI presentation demo"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Feature Tabs with Arrows */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {[
              { label: "Prompt" },
              { label: "Design" },
              { label: "Edit" },
              { label: "Publish" },
              { label: "Present" },
            ].map((tab, i, arr) => (
              <div key={tab.label} className="flex items-center gap-2">
                <span
                  className={`text-sm font-medium transition cursor-default ${i === 0 ? "text-zinc-900 border-b-2 border-zinc-900 pb-1" : "text-zinc-600"}`}
                >
                  {tab.label}
                </span>
                {i < arr.length - 1 && (
                  <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            ))}
          </div>
          
          <p className="text-center text-zinc-600 mt-6">
            {t.createStunningPPT || "Create stunning PowerPoint presentations with just a prompt."}
          </p>
          <p className="text-center mt-2">
            <SignInButton mode="modal">
              <button className="text-zinc-900 font-medium underline underline-offset-4 hover:text-zinc-600 transition" style={{ cursor: "url('/pointinghand.svg') 12 8, pointer" }}>
                {t.tryPPTMasterAI || "Try PPT Master AI"}
              </button>
            </SignInButton>
          </p>
        </div>

        {/* Two Column Features */}
        <div className="grid lg:grid-cols-2 gap-8 mb-32">
          {/* Feature 1 - Templates */}
          <SignInButton mode="modal">
            <button className="group block text-left w-full" style={{ cursor: "url('/pointinghand.svg') 12 8, pointer" }}>
              <div className="rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100 aspect-[4/3] mb-6 relative group-hover:border-zinc-300 group-hover:shadow-lg transition-all duration-300">
                <div className="absolute inset-0 p-3">
                  {/* Theme Preview Grid - 2 large on left, 3 stacked on right */}
                  <div className="grid grid-cols-5 gap-2 h-full">
                    {/* Left column - 2 larger cards */}
                    <div className="col-span-3 grid grid-rows-2 gap-2">
                      {THEME_PREVIEWS.slice(0, 2).map((theme) => (
                        <div
                          key={theme.id}
                          className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                          style={{ background: theme.bg, border: `1px solid ${theme.borderColor}` }}
                        >
                          {/* Mini slide preview */}
                          <div className="h-full p-3 flex flex-col">
                            <div 
                              className="rounded-md p-2 mb-2 flex-shrink-0"
                              style={{ background: theme.titleBg }}
                            >
                              <div 
                                className="text-[10px] font-semibold truncate"
                                style={{ color: theme.headingColor }}
                              >
                                {theme.name}
                              </div>
                            </div>
                            <div className="flex-1 flex flex-col justify-center gap-1.5">
                              <div className="flex items-center gap-1.5">
                                <div 
                                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                  style={{ background: theme.accentColor }}
                                />
                                <div 
                                  className="h-1 rounded flex-1"
                                  style={{ background: theme.textColor, opacity: 0.3 }}
                                />
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div 
                                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                  style={{ background: theme.accentColor }}
                                />
                                <div 
                                  className="h-1 rounded w-3/4"
                                  style={{ background: theme.textColor, opacity: 0.3 }}
                                />
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div 
                                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                  style={{ background: theme.accentColor }}
                                />
                                <div 
                                  className="h-1 rounded w-5/6"
                                  style={{ background: theme.textColor, opacity: 0.3 }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Right column - 3 smaller stacked cards */}
                    <div className="col-span-2 grid grid-rows-3 gap-2">
                      {THEME_PREVIEWS.slice(2, 5).map((theme) => (
                        <div
                          key={theme.id}
                          className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                          style={{ background: theme.bg, border: `1px solid ${theme.borderColor}` }}
                        >
                          <div className="h-full p-2 flex flex-col">
                            <div 
                              className="rounded p-1.5 mb-1"
                              style={{ background: theme.titleBg }}
                            >
                              <div 
                                className="text-[8px] font-semibold truncate"
                                style={{ color: theme.headingColor }}
                              >
                                {theme.name}
                              </div>
                            </div>
                            <div className="flex-1 flex items-center">
                              <div className="flex gap-0.5 w-full">
                                {[0.4, 0.6, 0.8, 1].map((h, i) => (
                                  <div 
                                    key={i}
                                    className="flex-1 rounded-sm"
                                    style={{ 
                                      background: theme.accentColor, 
                                      height: `${h * 100}%`,
                                      opacity: 0.3 + (h * 0.5),
                                      alignSelf: "flex-end"
                                    }}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                {t.professionalTemplatesUseCase || "Professional templates for every presentation."}
              </h3>
              <p className="text-zinc-600">
                {t.templatesDescription || "Choose from beautifully designed themes. Customize colors, fonts, and layouts to match your brand."}
              </p>
              <span className="inline-block mt-4 text-zinc-900 font-medium underline underline-offset-4 group-hover:text-zinc-600 transition">
                {t.exploreTemplates || "Explore templates"}
              </span>
            </button>
          </SignInButton>

          {/* Feature 2 - Get Inspired */}
          <LoadingLink href={localPath("/inspiration")} className="group block">
            <div className="overflow-hidden border border-zinc-200 aspect-[4/3] mb-6 relative group-hover:border-zinc-300 transition">
              {/* 3 Expandable Cards - Full height, no gap, sharp edges */}
              <div className="absolute inset-0 flex">
                {INSPIRATION_IMAGES.map((img, i) => {
                  // Default: last card (right) is big (60%), others are small (20% each)
                  // On hover: hovered card becomes big, others become small
                  const isHovered = hoveredCard === i;
                  const hasHover = hoveredCard !== null;
                  
                  let widthPercent = 20;
                  if (!hasHover) {
                    // Default state: last (right) is big
                    widthPercent = i === 2 ? 60 : 20;
                  } else {
                    // Hover state: hovered is big
                    widthPercent = isHovered ? 60 : 20;
                  }
                  
                  return (
                    <div
                      key={i}
                      className="h-full overflow-hidden transition-[width] duration-500 ease-out flex-shrink-0 relative"
                      style={{ width: `${widthPercent}%` }}
                      onMouseEnter={() => setHoveredCard(i)}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      {/* Fixed-size image container to prevent zoom */}
                      <div 
                        className="absolute inset-0"
                        style={{
                          backgroundImage: `url(${img})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">
              {t.getInspiredTitle || "Get inspired by amazing presentations."}
            </h3>
            <p className="text-zinc-600">
              {t.getInspiredDesc || "Browse our gallery of AI-generated presentations. Find inspiration and see what's possible with PPT Master."}
            </p>
            <span className="inline-block mt-4 text-zinc-900 font-medium underline underline-offset-4 group-hover:text-zinc-600 transition">
              {t.exploreInspiration || "Explore inspiration"}
            </span>
          </LoadingLink>
        </div>

        {/* Ship Products Section */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-[2.75rem] leading-[1.15] font-semibold tracking-tight text-zinc-900 lg:text-[3.25rem]">
              {t.exportShareTitle || "Export and share your way"}
            </h2>
            
            <div className="mt-12 space-y-8">
              {/* Feature Item */}
              <LoadingLink href={localPath("/prompt-guide")} className="group block border-b border-zinc-200 pb-8">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-zinc-900 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-zinc-900 mb-2">{t.exportToPPT || "Export to PowerPoint, PDF, or Google Slides"}</h3>
                    <p className="text-zinc-600 text-sm">
                      {t.exportToPPTDesc || "Download your presentations in any format. Perfect compatibility with Microsoft PowerPoint and Google Slides."}
                    </p>
                  </div>
                </div>
              </LoadingLink>

              {/* Feature Item */}
              <div className="group block border-b border-zinc-200 pb-8">
                <SignInButton mode="modal">
                  <button className="flex items-start gap-3 text-left w-full" style={{ cursor: "url('/pointinghand.svg') 12 8, pointer" }}>
                    <Wand2 className="w-5 h-5 text-zinc-900 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-zinc-900 mb-2 group-hover:text-zinc-600 transition">{t.shareWithLink || "Share with a link or embed anywhere"}</h3>
                    </div>
                  </button>
                </SignInButton>
              </div>

              {/* Feature Item */}
              <div className="group block">
                <SignInButton mode="modal">
                  <button className="flex items-start gap-3 text-left w-full" style={{ cursor: "url('/pointinghand.svg') 12 8, pointer" }}>
                    <Share2 className="w-5 h-5 text-zinc-900 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-zinc-900 mb-2 group-hover:text-zinc-600 transition">{t.presentDirectly || "Present directly from PPT Master"}</h3>
                    </div>
                  </button>
                </SignInButton>
              </div>
            </div>
          </div>

          {/* Right Side Demo */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden border border-zinc-200 bg-white shadow-xl">
              {/* Chat Interface */}
              <div className="p-6 border-b border-zinc-200">
                <p className="text-sm text-zinc-600">
                  {t.generatingPresentation || "Generating your presentation with professional design and smart layouts..."}
                </p>
                <div className="mt-4 space-y-2">
                  {[
                    t.progressCreatingTitle || "Creating title slide",
                    t.progressAddingContent || "Adding content slides",
                    t.progressApplyingTheme || "Applying theme",
                    t.progressGeneratingCharts || "Generating charts"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="text-zinc-400">›</span>
                      <span className="text-zinc-600">{item}</span>
                      <span className="text-emerald-500">✓</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-zinc-50 rounded-lg">
                  <p className="text-sm text-zinc-600">{t.presentationReady || "Your presentation is ready! Export to PPTX or share with a link."}</p>
                </div>
              </div>
            </div>

            {/* Floating Profile Card */}
            <div className="absolute -right-4 top-8 bg-purple-600 rounded-xl p-4 w-48 text-white shadow-xl">
              <div className="text-xs text-purple-100 mb-3">PPT Master / {t.export || "Export"}</div>
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-purple-400 mb-2 flex items-center justify-center">
                  <Share2 className="w-6 h-6 text-white" />
                </div>
                <p className="font-medium">{t.readyToShare || "Ready to Share"}</p>
                <p className="text-xs text-purple-100">10 {t.slides || "slides"}</p>
                <div className="flex gap-2 mt-3">
                  <SignInButton mode="modal">
                    <button className="px-3 py-1 bg-white text-purple-600 text-xs rounded-md font-medium hover:bg-purple-50 transition" style={{ cursor: "url('/pointinghand.svg') 12 8, pointer" }}>{t.export || "Export"}</button>
                  </SignInButton>
                  <SignInButton mode="modal">
                    <button className="px-3 py-1 border border-purple-300 text-xs rounded-md hover:bg-purple-500 transition" style={{ cursor: "url('/pointinghand.svg') 12 8, pointer" }}>{t.share || "Share"}</button>
                  </SignInButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
