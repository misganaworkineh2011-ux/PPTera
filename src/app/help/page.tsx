import { LandingNavbar } from "~/components/LandingNavbar";
import { LandingFooter } from "~/components/LandingFooter";
import { HelpPageClient } from "./HelpPageClient";
import { getTranslations } from "~/lib/i18n";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help Center - PPT Master",
  description:
    "Get help with PPT Master. Find answers to common questions and learn how to use our AI presentation generator effectively.",
  alternates: {
    canonical: "https://www.pptmaster.app/help",
  },
  openGraph: {
    title: "Help Center - PPT Master",
    description: "Get help with PPT Master. Find answers to common questions and learn how to use our AI presentation generator.",
    url: "/help",
    type: "website",
    images: [
      {
        url: "/og-image.jpeg",
        width: 1200,
        height: 630,
        alt: "PPT Master Help Center",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Help Center - PPT Master",
    description: "Get help with PPT Master. Find answers to common questions about our AI presentation generator.",
    images: ["/og-image.jpeg"],
  },
};

export const revalidate = 3600;

// Helper function to get translated help content
function getHelpContent(t: ReturnType<typeof getTranslations>) {
  const gettingStartedArticles = [
    {
      title: t.helpArticle1Title || "Creating Your First Presentation",
      content:
        t.helpArticle1Content ||
        "Start by clicking 'Create New' in your dashboard. Enter a prompt describing what you want to create, choose your preferred style, and let our AI generate your presentation in seconds.",
    },
    {
      title: t.helpArticle2Title || "Understanding the Dashboard",
      content:
        t.helpArticle2Content ||
        "Your dashboard is your command center. Here you'll find all your presentations, usage statistics, and quick access to templates.",
    },
    {
      title: t.helpArticle3Title || "Writing Effective Prompts",
      content:
        t.helpArticle3Content ||
        "Be specific about your topic, target audience, and desired outcome. Include the number of slides you need and any key points to cover.",
    },
    {
      title: t.helpArticle4Title || "Customizing Your Presentation",
      content:
        t.helpArticle4Content ||
        "Click any element to edit text, change colors, or adjust layouts. Use the toolbar to add images, charts, or icons.",
    },
  ];

  const featuresArticles = [
    {
      title: t.helpFeature1Title || "AI-Powered Generation",
      content:
        t.helpFeature1Content ||
        "Our AI analyzes your prompt and creates a complete presentation with relevant content, professional design, and logical flow.",
    },
    {
      title: t.helpFeature2Title || "Smart Templates",
      content:
        t.helpFeature2Content ||
        "Choose from multiple professionally designed templates across various categories: business, education, marketing, and more.",
    },
    {
      title: t.helpFeature3Title || "Real-time Collaboration",
      content:
        t.helpFeature3Content ||
        "Invite team members to edit presentations together. See changes in real-time, leave comments, and track revision history.",
    },
    {
      title: t.helpFeature4Title || "Export Options",
      content:
        t.helpFeature4Content ||
        "Export your presentations as PowerPoint (PPTX), PDF, PNG images, or Google Slides.",
    },
    {
      title: t.helpFeature5Title || "Brand Management",
      content:
        t.helpFeature5Content ||
        "Upload your logo, define brand colors, and set default fonts. All new presentations will automatically use your brand guidelines.",
    },
    {
      title: t.helpFeature6Title || "Performance Insights",
      content:
        t.helpFeature6Content ||
        "View comprehensive analytics about your presentation workflow. Track creation trends and monitor your productivity.",
    },
  ];

  const troubleshootingArticles = [
    {
      title: t.helpTrouble1Title || "Presentation Not Generating",
      content:
        t.helpTrouble1Content ||
        "If your presentation fails to generate, check your internet connection and try again. Ensure your prompt is clear and not too vague.",
    },
    {
      title: t.helpTrouble2Title || "Export Issues",
      content:
        t.helpTrouble2Content ||
        "For export problems, ensure you have sufficient storage space and a stable internet connection. Try exporting in a different format.",
    },
    {
      title: t.helpTrouble3Title || "Slow Performance",
      content:
        t.helpTrouble3Content ||
        "Clear your browser cache and cookies. Close unnecessary tabs and applications. For best performance, use the latest version of Chrome, Firefox, or Safari.",
    },
    {
      title: t.helpTrouble4Title || "Login Problems",
      content:
        t.helpTrouble4Content ||
        "Reset your password using the 'Forgot Password' link. Clear browser cookies and try again.",
    },
  ];

  const faqArticles = [
    {
      question: t.helpFaq1Question || "How many presentations can I create?",
      answer:
        t.helpFaq1Answer ||
        "Free users get 200 credits to start. Paid plans include monthly credits: Plus (1,000), Pro (4,000), Ultra (20,000).",
    },
    {
      question: t.helpFaq2Question || "Can I use PPTMaster offline?",
      answer:
        t.helpFaq2Answer ||
        "PPTMaster requires an internet connection for AI generation and real-time collaboration. However, you can download presentations and work on them offline.",
    },
    {
      question: t.helpFaq3Question || "Is my data secure?",
      answer:
        t.helpFaq3Answer ||
        "Yes. We use enterprise-grade encryption for all data in transit and at rest. Your presentations are private by default.",
    },
    {
      question: t.helpFaq4Question || "Can I cancel my subscription anytime?",
      answer:
        t.helpFaq4Answer ||
        "Absolutely. You can cancel your subscription at any time from your account settings.",
    },
    {
      question: t.helpFaq6Question || "How does the AI work?",
      answer:
        t.helpFaq6Answer ||
        "Our AI uses advanced language models trained on millions of presentations to understand context, structure, and design principles.",
    },
  ];

  return {
    gettingStartedArticles,
    featuresArticles,
    troubleshootingArticles,
    faqArticles,
  };
}

export default async function HelpPage() {
  const t = getTranslations("en");
  const { gettingStartedArticles, featuresArticles, troubleshootingArticles, faqArticles } =
    getHelpContent(t);

  // FAQPage Schema for better AI and search engine discoverability
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqArticles.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
  };

  // BreadcrumbList Schema for navigation
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.pptmaster.app",
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Help Center",
        "item": "https://www.pptmaster.app/help",
      },
    ],
  };

  return (
    <div className="landing-page min-h-screen bg-white">
      {/* JSON-LD Structured Data for SEO and AI discoverability */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      
      <LandingNavbar currentLang="en" />

      {/* Hero Section */}
      <section className="relative px-6 pt-32 pb-16 bg-gradient-to-br from-slate-50 to-white">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="text-5xl font-bold text-slate-900 mb-6 animate-fade-in-up">
            {t.helpTitle || "Help Center"}
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto animate-fade-in-up [animation-delay:150ms]">
            {t.helpSubtitle ||
              "Find answers to common questions and learn how to get the most out of PPT Master."}
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

      <LandingFooter currentLang="en" />
    </div>
  );
}
