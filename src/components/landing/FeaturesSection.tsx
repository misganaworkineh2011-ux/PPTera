"use client";

import { Sparkles, Wand2, Share2 } from "lucide-react";
import { LoadingLink } from "~/components/LoadingLink";

interface FeaturesSectionProps {
  t: any;
}

export function FeaturesSection({ t }: FeaturesSectionProps) {
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
              {/* Browser Chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-zinc-50 border-b border-zinc-200">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-zinc-300"></div>
                  <div className="w-3 h-3 rounded-full bg-zinc-300"></div>
                  <div className="w-3 h-3 rounded-full bg-zinc-300"></div>
                </div>
              </div>
              
              {/* App Interface */}
              <div className="grid lg:grid-cols-[300px_1fr] min-h-[500px]">
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
                      <p className="text-xs text-zinc-400 font-medium">{t.generating || "Generating"}</p>
                      <p className="text-xs text-zinc-500">{t.creatingSlides || "Creating professional slides with consistent branding and smart layouts..."}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-xs text-zinc-400 font-medium">{t.slidesIncluded || "Slides included:"}</p>
                      <ul className="text-xs text-zinc-500 space-y-1">
                        <li>• {t.titleSlideWithBranding || "Title slide with company branding"}</li>
                        <li>• {t.problemSolutionOverview || "Problem & solution overview"}</li>
                        <li>• {t.marketAnalysisCharts || "Market analysis with charts"}</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                {/* Right Panel - Preview */}
                <div className="bg-zinc-900 p-8 relative">
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-500"></div>
                    <div className="w-6 h-6 rounded-full bg-amber-500"></div>
                    <div className="w-6 h-6 rounded-full bg-rose-500"></div>
                  </div>
                  
                  {/* Slide Preview */}
                  <div className="bg-gradient-to-br from-amber-600 to-orange-700 rounded-xl aspect-video flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur"></div>
                      <h3 className="text-2xl font-bold">{t.startupPitch || "Startup Pitch"}</h3>
                    </div>
                  </div>
                  
                  {/* Slide List */}
                  <div className="mt-6 space-y-2">
                    {[
                      t.slideTitleSlide || "TITLE SLIDE",
                      t.slideProblem || "PROBLEM",
                      t.slideSolution || "SOLUTION",
                      t.slideMarketSize || "MARKET SIZE"
                    ].map((name, i) => (
                      <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-800/50 text-zinc-400 text-sm">
                        <span>{name}</span>
                        <span className="text-xs">{t.slideLabel || "Slide"} {i + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Feature Tabs */}
          <div className="flex items-center justify-center gap-4 mt-8">
            {[
              { label: "Prompt", href: "/dashboard" },
              { label: "Design", href: "/dashboard" },
              { label: "Edit", href: "/dashboard" },
              { label: "Build", href: "/dashboard" },
              { label: "Publish", href: "/dashboard" },
              { label: "Present", href: "/dashboard" },
            ].map((tab, i) => (
              <LoadingLink 
                key={tab.label}
                href={tab.href}
                className={`text-sm font-medium transition ${i === 0 ? "text-zinc-900 border-b-2 border-zinc-900 pb-1" : "text-zinc-400 hover:text-zinc-600"}`}
              >
                {tab.label}
              </LoadingLink>
            ))}
          </div>
          
          <p className="text-center text-zinc-600 mt-6">
            {t.createStunningPPT || "Create stunning PowerPoint presentations with just a prompt."}
          </p>
          <p className="text-center mt-2">
            <LoadingLink href="/dashboard" className="text-zinc-900 font-medium underline underline-offset-4 hover:text-zinc-600 transition">
              {t.tryPPTMasterAI || "Try PPT Master AI"}
            </LoadingLink>
          </p>
        </div>

        {/* Two Column Features */}
        <div className="grid lg:grid-cols-2 gap-8 mb-32">
          {/* Feature 1 */}
          <LoadingLink href="/dashboard" className="group block">
            <div className="rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-50 aspect-[4/3] mb-6 relative group-hover:border-zinc-300 transition">
              <div className="absolute inset-0 p-6">
                <div className="grid grid-cols-2 gap-4 h-full">
                  <div className="bg-white rounded-xl border border-zinc-200 p-4">
                    <div className="h-2 w-20 bg-zinc-200 rounded mb-2"></div>
                    <div className="h-1.5 w-16 bg-zinc-100 rounded"></div>
                  </div>
                  <div className="bg-white rounded-xl border border-zinc-200 p-4">
                    <div className="h-2 w-16 bg-zinc-200 rounded mb-2"></div>
                    <div className="h-1.5 w-20 bg-zinc-100 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">
              {t.professionalTemplatesUseCase || "Professional templates for every use case."}
            </h3>
            <p className="text-zinc-600">
              {t.templatesDescription || "Choose from hundreds of professionally designed PowerPoint templates. Customize colors, fonts, and layouts to match your brand."}
            </p>
            <span className="inline-block mt-4 text-zinc-900 font-medium underline underline-offset-4 group-hover:text-zinc-600 transition">
              {t.exploreTemplates || "Explore templates"}
            </span>
          </LoadingLink>

          {/* Feature 2 */}
          <LoadingLink href="/inspiration" className="group block">
            <div className="rounded-2xl overflow-hidden border border-zinc-200 bg-lime-50 aspect-[4/3] mb-6 relative group-hover:border-zinc-300 transition">
              <div className="absolute inset-0 p-6 flex items-center justify-center">
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-24 h-32 bg-white rounded-lg border border-zinc-200 shadow-sm"></div>
                  ))}
                </div>
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
              <LoadingLink href="/prompt-guide" className="group block border-b border-zinc-200 pb-8">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-zinc-900 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-zinc-900 mb-2">{t.exportToPPT || "Export to PowerPoint, PDF, or Google Slides"}</h3>
                    <p className="text-zinc-600 text-sm">
                      {t.exportToPPTDesc || "Download your presentations in any format. Perfect compatibility with Microsoft PowerPoint and Google Slides."}
                    </p>
                    <span className="inline-block mt-3 text-zinc-900 text-sm font-medium underline underline-offset-4 group-hover:text-zinc-600 transition">
                      {t.learnMore || "Learn more"}
                    </span>
                  </div>
                </div>
              </LoadingLink>

              {/* Feature Item */}
              <LoadingLink href="/dashboard" className="group block border-b border-zinc-200 pb-8">
                <div className="flex items-start gap-3">
                  <Wand2 className="w-5 h-5 text-zinc-900 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-zinc-900 mb-2 group-hover:text-zinc-600 transition">{t.shareWithLink || "Share with a link or embed anywhere"}</h3>
                  </div>
                </div>
              </LoadingLink>

              {/* Feature Item */}
              <LoadingLink href="/dashboard" className="group block">
                <div className="flex items-start gap-3">
                  <Share2 className="w-5 h-5 text-zinc-900 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-zinc-900 mb-2 group-hover:text-zinc-600 transition">{t.presentDirectly || "Present directly from PPT Master"}</h3>
                  </div>
                </div>
              </LoadingLink>
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
              <div className="text-xs text-purple-200 mb-3">PPT Master / {t.export || "Export"}</div>
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-purple-400 mb-2 flex items-center justify-center">
                  <Share2 className="w-6 h-6 text-white" />
                </div>
                <p className="font-medium">{t.readyToShare || "Ready to Share"}</p>
                <p className="text-xs text-purple-200">10 {t.slides || "slides"}</p>
                <div className="flex gap-2 mt-3">
                  <LoadingLink href="/dashboard" className="px-3 py-1 bg-white text-purple-600 text-xs rounded-md font-medium hover:bg-purple-50 transition">{t.export || "Export"}</LoadingLink>
                  <LoadingLink href="/dashboard" className="px-3 py-1 border border-purple-400 text-xs rounded-md hover:bg-purple-500 transition">{t.share || "Share"}</LoadingLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
