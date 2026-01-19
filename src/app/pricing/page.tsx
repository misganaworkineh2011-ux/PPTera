import { PricingPageClient } from "./PricingPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing Plans - Free AI PowerPoint Generator | PPTMaster",
  description: "Compare PPTMaster pricing plans. Start free with 200 credits. Upgrade to Plus ($9/mo), Pro ($19/mo), or Ultra ($49/mo) for more AI PowerPoint features and credits.",
  keywords: ["pricing", "plans", "subscription", "free presentation maker", "PPT pricing", "affordable AI", "presentation plans", "PPTMaster", "PPT Master", "PowerPoint pricing", "AI PowerPoint plans", "best PowerPoint generator"],
  alternates: {
    canonical: "https://www.pptmaster.app/pricing",
  },
  openGraph: {
    title: "Pricing Plans - Free AI PowerPoint Generator | PPTMaster",
    description: "Compare PPTMaster pricing plans. Start free with 200 credits. Upgrade for more AI PowerPoint features and credits.",
    url: "/pricing",
    type: "website",
    images: [
      {
        url: "/og-image.jpeg",
        width: 1200,
        height: 630,
        alt: "PPTMaster Pricing Plans",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing Plans - Free AI PowerPoint Generator | PPTMaster",
    description: "Compare PPTMaster pricing plans. Start free with 200 credits. Upgrade for more AI PowerPoint features.",
    images: ["/og-image.jpeg"],
  },
};

// Pricing FAQ Schema for AI and search engine discoverability
const pricingFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How much does PPTMaster cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "PPTMaster (PPT Master) offers a free plan with 200 credits. Paid plans start at $9/month for Plus (1,000 credits), $19/month for Pro (4,000 credits), and $49/month for Ultra (20,000 credits).",
      },
    },
    {
      "@type": "Question",
      "name": "What is included in the free plan?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The free plan includes 200 credits, access to basic templates, AI-powered slide generation, and export to PowerPoint and PDF formats.",
      },
    },
    {
      "@type": "Question",
      "name": "Can I cancel my subscription anytime?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, you can cancel your PPTMaster subscription at any time from your account settings. Your access continues until the end of your billing period.",
      },
    },
    {
      "@type": "Question",
      "name": "What are credits used for?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Credits are used for AI-powered features like generating presentations, creating slides, and using AI image generation. Different actions consume different amounts of credits.",
      },
    },
    {
      "@type": "Question",
      "name": "Is there a student or education discount?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! Students and teachers get 50% off on all Pro plans. Schools can contact us for custom enterprise pricing with unlimited seats.",
      },
    },
  ],
};

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
      "name": "Pricing",
      "item": "https://www.pptmaster.app/pricing",
    },
  ],
};

export default function PricingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingFaqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <PricingPageClient currentLang="en" />
    </>
  );
}
