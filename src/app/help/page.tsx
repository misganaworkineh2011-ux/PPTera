import { LandingNavbar } from "~/components/LandingNavbar";
import { LandingFooter } from "~/components/LandingFooter";
import { translations } from "~/lib/translations";
import { HelpCircle } from "lucide-react";
import { HelpPageClient } from "./HelpPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help Center - PPT Master | Support & Tutorials",
  description: "Find answers to common questions, tutorials, and troubleshooting guides for PPT Master's AI PowerPoint generator.",
  openGraph: {
    title: "Help Center - PPT Master",
    description: "Get help with PPT Master",
    type: "website",
  },
};

export const revalidate = 3600; // Revalidate every hour

export default function HelpPage() {
  const t = translations.en;

  // FAQ Schema for SEO
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": t.helpFaq1Question || "How many presentations can I create?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t.helpFaq1Answer || "Free users can create up to 5 presentations per month. Pro users get unlimited presentations. All presentations are saved permanently in your account."
        }
      },
      {
        "@type": "Question",
        "name": t.helpFaq2Question || "Can I use PPTMaster offline?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t.helpFaq2Answer || "PPTMaster requires an internet connection for AI generation and real-time collaboration. However, you can download presentations and work on them offline using PowerPoint or other presentation software."
        }
      },
      {
        "@type": "Question",
        "name": t.helpFaq3Question || "Is my data secure?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t.helpFaq3Answer || "Yes. We use enterprise-grade encryption for all data in transit and at rest. Your presentations are private by default and only accessible to people you explicitly share them with. We never use your content to train our AI models."
        }
      },
      {
        "@type": "Question",
        "name": t.helpFaq4Question || "Can I cancel my subscription anytime?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t.helpFaq4Answer || "Absolutely. You can cancel your subscription at any time from your account settings. You'll retain access until the end of your billing period, and all your presentations remain accessible even after cancellation."
        }
      },
      {
        "@type": "Question",
        "name": t.helpFaq6Question || "How does the AI work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t.helpFaq6Answer || "Our AI uses advanced language models trained on millions of presentations to understand context, structure, and design principles. It analyzes your prompt, generates relevant content, and applies professional design templates automatically."
        }
      }
    ]
  };

  const gettingStartedArticles = [
    {
      title: t.helpArticle1Title || "Creating Your First Presentation",
      content: t.helpArticle1Content || "Start by clicking 'Create New' in your dashboard. Enter a prompt describing what you want to create, choose your preferred style, and let our AI generate your presentation in seconds. You can then customize colors, fonts, and layouts to match your brand."
    },
    {
      title: t.helpArticle2Title || "Understanding the Dashboard",
      content: t.helpArticle2Content || "Your dashboard is your command center. Here you'll find all your presentations, usage statistics, and quick access to templates. The sidebar provides navigation to all features including settings, billing, and team management."
    },
    {
      title: t.helpArticle3Title || "Writing Effective Prompts",
      content: t.helpArticle3Content || "Be specific about your topic, target audience, and desired outcome. Include the number of slides you need and any key points to cover. For example: 'Create a 10-slide pitch deck for a SaaS startup targeting enterprise clients, covering problem, solution, market size, and business model.'"
    },
    {
      title: t.helpArticle4Title || "Customizing Your Presentation",
      content: t.helpArticle4Content || "Click any element to edit text, change colors, or adjust layouts. Use the toolbar to add images, charts, or icons. Our smart layouts automatically adjust to maintain visual balance as you make changes."
    }
  ];

  const featuresArticles = [
    {
      title: t.helpFeature1Title || "AI-Powered Generation",
      content: t.helpFeature1Content || "Our AI analyzes your prompt and creates a complete presentation with relevant content, professional design, and logical flow. It uses advanced language models to generate compelling copy and selects appropriate visual elements."
    },
    {
      title: t.helpFeature2Title || "Smart Templates",
      content: t.helpFeature2Content || "Choose from 100+ professionally designed templates across various categories: business, education, marketing, and more. Each template is fully customizable and optimized for different presentation types."
    },
    {
      title: t.helpFeature3Title || "Real-time Collaboration",
      content: t.helpFeature3Content || "Invite team members to edit presentations together. See changes in real-time, leave comments, and track revision history. Perfect for teams working across different locations and time zones."
    },
    {
      title: t.helpFeature4Title || "Export Options",
      content: t.helpFeature4Content || "Export your presentations as PowerPoint (PPTX), PDF, PNG images, or Google Slides. Each format maintains your design integrity and is optimized for the target platform."
    },
    {
      title: t.helpFeature5Title || "Brand Management",
      content: t.helpFeature5Content || "Upload your logo, define brand colors, and set default fonts. All new presentations will automatically use your brand guidelines, ensuring consistency across all your content."
    },
    {
      title: t.helpFeature6Title || "Analytics & Tracking",
      content: t.helpFeature6Content || "When you share presentations online, track views, engagement time, and slide-by-slide analytics. Understand which content resonates most with your audience."
    }
  ];

  const troubleshootingArticles = [
    {
      title: t.helpTrouble1Title || "Presentation Not Generating",
      content: t.helpTrouble1Content || "If your presentation fails to generate, check your internet connection and try again. Ensure your prompt is clear and not too vague. If the issue persists, try breaking down your request into smaller, more specific prompts."
    },
    {
      title: t.helpTrouble2Title || "Export Issues",
      content: t.helpTrouble2Content || "For export problems, ensure you have sufficient storage space and a stable internet connection. Try exporting in a different format. If PowerPoint export fails, try PDF first, then convert to PPTX using PowerPoint's import feature."
    },
    {
      title: t.helpTrouble3Title || "Slow Performance",
      content: t.helpTrouble3Content || "Clear your browser cache and cookies. Close unnecessary tabs and applications. For best performance, use the latest version of Chrome, Firefox, or Safari. Disable browser extensions that might interfere with the editor."
    },
    {
      title: t.helpTrouble4Title || "Login Problems",
      content: t.helpTrouble4Content || "Reset your password using the 'Forgot Password' link. Clear browser cookies and try again. If using SSO, contact your organization's IT administrator. Check if your account is active and not suspended."
    },
  ];

  const faqArticles = [
    {
      question: t.helpFaq1Question || "How many presentations can I create?",
      answer: t.helpFaq1Answer || "Free users can create up to 5 presentations per month. Pro users get unlimited presentations. All presentations are saved permanently in your account."
    },
    {
      question: t.helpFaq2Question || "Can I use PPTMaster offline?",
      answer: t.helpFaq2Answer || "PPTMaster requires an internet connection for AI generation and real-time collaboration. However, you can download presentations and work on them offline using PowerPoint or other presentation software."
    },
    {
      question: t.helpFaq3Question || "Is my data secure?",
      answer: t.helpFaq3Answer || "Yes. We use enterprise-grade encryption for all data in transit and at rest. Your presentations are private by default and only accessible to people you explicitly share them with. We never use your content to train our AI models."
    },
    {
      question: t.helpFaq4Question || "Can I cancel my subscription anytime?",
      answer: t.helpFaq4Answer || "Absolutely. You can cancel your subscription at any time from your account settings. You'll retain access until the end of your billing period, and all your presentations remain accessible even after cancellation."
    },
    {
      question: t.helpFaq6Question || "How does the AI work?",
      answer: t.helpFaq6Answer || "Our AI uses advanced language models trained on millions of presentations to understand context, structure, and design principles. It analyzes your prompt, generates relevant content, and applies professional design templates automatically."
    }
  ];

  return (
    <div className="landing-page min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
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
        </div>
      </section>

      <HelpPageClient
        gettingStartedArticles={gettingStartedArticles}
        featuresArticles={featuresArticles}
        troubleshootingArticles={troubleshootingArticles}
        faqArticles={faqArticles}
        translations={{
          searchHelp: t.searchHelp,
          gettingStarted: t.gettingStarted,
          featuresTutorials: t.featuresTutorials,
          troubleshooting: t.troubleshooting,
          faqTitle: t.faqTitle,
          noResultsFound: t.noResultsFound,
          noResultsDesc: t.noResultsDesc,
          clearSearch: t.clearSearch,
        }}
      />

      <LandingFooter />
    </div>
  );
}
