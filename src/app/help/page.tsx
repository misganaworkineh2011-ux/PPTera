"use client";

import { LandingNavbar } from "~/components/LandingNavbar";
import { LandingFooter } from "~/components/LandingFooter";
import { useLanguage } from "~/contexts/LanguageContext";
import { HelpCircle, Video, Search, Zap, Settings } from "lucide-react";
import { useState } from "react";

export default function HelpPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  const gettingStartedArticles = [
    {
      title: "Creating Your First Presentation",
      content: "Start by clicking 'Create New' in your dashboard. Enter a prompt describing what you want to create, choose your preferred style, and let our AI generate your presentation in seconds. You can then customize colors, fonts, and layouts to match your brand."
    },
    {
      title: "Understanding the Dashboard",
      content: "Your dashboard is your command center. Here you'll find all your presentations, usage statistics, and quick access to templates. The sidebar provides navigation to all features including settings, billing, and team management."
    },
    {
      title: "Writing Effective Prompts",
      content: "Be specific about your topic, target audience, and desired outcome. Include the number of slides you need and any key points to cover. For example: 'Create a 10-slide pitch deck for a SaaS startup targeting enterprise clients, covering problem, solution, market size, and business model.'"
    },
    {
      title: "Customizing Your Presentation",
      content: "Click any element to edit text, change colors, or adjust layouts. Use the toolbar to add images, charts, or icons. Our smart layouts automatically adjust to maintain visual balance as you make changes."
    }
  ];

  const featuresArticles = [
    {
      title: "AI-Powered Generation",
      content: "Our AI analyzes your prompt and creates a complete presentation with relevant content, professional design, and logical flow. It uses advanced language models to generate compelling copy and selects appropriate visual elements."
    },
    {
      title: "Smart Templates",
      content: "Choose from 100+ professionally designed templates across various categories: business, education, marketing, and more. Each template is fully customizable and optimized for different presentation types."
    },
    {
      title: "Real-time Collaboration",
      content: "Invite team members to edit presentations together. See changes in real-time, leave comments, and track revision history. Perfect for teams working across different locations and time zones."
    },
    {
      title: "Export Options",
      content: "Export your presentations as PowerPoint (PPTX), PDF, PNG images, or Google Slides. Each format maintains your design integrity and is optimized for the target platform."
    },
    {
      title: "Brand Management",
      content: "Upload your logo, define brand colors, and set default fonts. All new presentations will automatically use your brand guidelines, ensuring consistency across all your content."
    },
    {
      title: "Analytics & Tracking",
      content: "When you share presentations online, track views, engagement time, and slide-by-slide analytics. Understand which content resonates most with your audience."
    }
  ];

  const troubleshootingArticles = [
    {
      title: "Presentation Not Generating",
      content: "If your presentation fails to generate, check your internet connection and try again. Ensure your prompt is clear and not too vague. If the issue persists, try breaking down your request into smaller, more specific prompts."
    },
    {
      title: "Export Issues",
      content: "For export problems, ensure you have sufficient storage space and a stable internet connection. Try exporting in a different format. If PowerPoint export fails, try PDF first, then convert to PPTX using PowerPoint's import feature."
    },
    {
      title: "Slow Performance",
      content: "Clear your browser cache and cookies. Close unnecessary tabs and applications. For best performance, use the latest version of Chrome, Firefox, or Safari. Disable browser extensions that might interfere with the editor."
    },
    {
      title: "Login Problems",
      content: "Reset your password using the 'Forgot Password' link. Clear browser cookies and try again. If using SSO, contact your organization's IT administrator. Check if your account is active and not suspended."
    },
    {
      title: "Missing Presentations",
      content: "Check the 'Archived' folder in your dashboard. Use the search function to find presentations by name or date. If you recently deleted a presentation, check the trash folder - items are kept for 30 days before permanent deletion."
    }
  ];

  const faqArticles = [
    {
      question: "How many presentations can I create?",
      answer: "Free users can create up to 5 presentations per month. Pro users get unlimited presentations. All presentations are saved permanently in your account."
    },
    {
      question: "Can I use PPTMaster offline?",
      answer: "PPTMaster requires an internet connection for AI generation and real-time collaboration. However, you can download presentations and work on them offline using PowerPoint or other presentation software."
    },
    {
      question: "Is my data secure?",
      answer: "Yes. We use enterprise-grade encryption for all data in transit and at rest. Your presentations are private by default and only accessible to people you explicitly share them with. We never use your content to train our AI models."
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Absolutely. You can cancel your subscription at any time from your account settings. You'll retain access until the end of your billing period, and all your presentations remain accessible even after cancellation."
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 30-day money-back guarantee for annual subscriptions. If you're not satisfied within the first 30 days, contact support for a full refund. Monthly subscriptions are non-refundable but can be cancelled anytime."
    },
    {
      question: "How does the AI work?",
      answer: "Our AI uses advanced language models trained on millions of presentations to understand context, structure, and design principles. It analyzes your prompt, generates relevant content, and applies professional design templates automatically."
    }
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
            <HelpCircle className="h-4 w-4 text-[#06b6d4]" />
            <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
              {t.helpCenter || "Help Center"}
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 animate-fade-in-up [animation-delay:100ms]">
            {t.howCanWeHelp || "How can we help you?"}
          </h1>

          <p className="text-xl text-slate-600 mb-12 animate-fade-in-up [animation-delay:200ms]">
            {t.helpCenterDesc || "Everything you need to know about PPTMaster"}
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto animate-fade-in-up [animation-delay:300ms]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder={t.searchHelp || "Search for help..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-full border-2 border-slate-200 focus:border-[#06b6d4] focus:outline-none text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Getting Started */}
      {(!searchQuery || gettingStartedArticles.some(article => 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        article.content.toLowerCase().includes(searchQuery.toLowerCase())
      )) && (
        <section className="relative px-6 pb-16">
          <div className="mx-auto max-w-5xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">{t.gettingStarted || "Getting Started"}</h2>
            </div>
            <div className="space-y-6">
              {gettingStartedArticles
                .filter(article => 
                  !searchQuery || 
                  article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  article.content.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((article, index) => (
                  <div key={index} className="rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-lg transition-all">
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{article.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{article.content}</p>
                  </div>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* Features & Tutorials */}
      {(!searchQuery || featuresArticles.some(article => 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        article.content.toLowerCase().includes(searchQuery.toLowerCase())
      )) && (
        <section className="relative px-6 pb-16 bg-gradient-to-br from-slate-50 to-white">
          <div className="mx-auto max-w-5xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] flex items-center justify-center">
                <Video className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Features & Tutorials</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {featuresArticles
                .filter(article => 
                  !searchQuery || 
                  article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  article.content.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((article, index) => (
                  <div key={index} className="rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-lg transition-all">
                    <h3 className="text-lg font-bold text-slate-900 mb-3">{article.title}</h3>
                    <p className="text-slate-600 leading-relaxed text-sm">{article.content}</p>
                  </div>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* Troubleshooting */}
      {(!searchQuery || troubleshootingArticles.some(article => 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        article.content.toLowerCase().includes(searchQuery.toLowerCase())
      )) && (
        <section className="relative px-6 pb-16">
          <div className="mx-auto max-w-5xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] flex items-center justify-center">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">{t.troubleshooting || "Troubleshooting"}</h2>
            </div>
            <div className="space-y-6">
              {troubleshootingArticles
                .filter(article => 
                  !searchQuery || 
                  article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  article.content.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((article, index) => (
                  <div key={index} className="rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-lg transition-all">
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{article.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{article.content}</p>
                  </div>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {(!searchQuery || faqArticles.some(article => 
        article.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        article.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )) && (
        <section className="relative px-6 pb-24 bg-gradient-to-br from-slate-50 to-white">
          <div className="mx-auto max-w-5xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] flex items-center justify-center">
                <HelpCircle className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">{t.faqTitle || "Frequently Asked Questions"}</h2>
            </div>
            <div className="space-y-4">
              {faqArticles
                .filter(article => 
                  !searchQuery || 
                  article.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  article.answer.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((article, index) => (
                  <div key={index} className="rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-lg transition-all">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{article.question}</h3>
                    <p className="text-slate-600 leading-relaxed">{article.answer}</p>
                  </div>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* No Results Message */}
      {searchQuery && 
       !gettingStartedArticles.some(article => 
         article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
         article.content.toLowerCase().includes(searchQuery.toLowerCase())
       ) &&
       !featuresArticles.some(article => 
         article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
         article.content.toLowerCase().includes(searchQuery.toLowerCase())
       ) &&
       !troubleshootingArticles.some(article => 
         article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
         article.content.toLowerCase().includes(searchQuery.toLowerCase())
       ) &&
       !faqArticles.some(article => 
         article.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
         article.answer.toLowerCase().includes(searchQuery.toLowerCase())
       ) && (
        <section className="relative px-6 pb-24">
          <div className="mx-auto max-w-5xl text-center">
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-12">
              <Search className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-900 mb-2">No results found</h3>
              <p className="text-slate-600 mb-6">
                We couldn't find any articles matching "{searchQuery}". Try different keywords or browse all articles above.
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white font-semibold hover:shadow-xl transition-all"
              >
                Clear Search
              </button>
            </div>
          </div>
        </section>
      )}

      <LandingFooter />
    </div>
  );
}
