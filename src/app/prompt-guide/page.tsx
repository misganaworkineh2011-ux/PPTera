import { LandingNavbar } from "~/components/LandingNavbar";
import { LandingFooter } from "~/components/LandingFooter";
import { PromptGuideContent } from "./PromptGuideContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Prompt Guide - Write Better PowerPoint Prompts | PPTera",
  description: "Master AI prompt writing for stunning PowerPoint presentations. Learn tips, examples, and best practices to create professional slides with PPTera AI generator.",
  alternates: {
    canonical: "https://www.pptera.com/prompt-guide",
  },
  openGraph: {
    title: "AI Prompt Guide - Write Better PowerPoint Prompts | PPTera",
    description: "Master AI prompt writing for stunning PowerPoint presentations. Learn tips, examples, and best practices.",
    url: "/prompt-guide",
    type: "website",
    images: [
      {
        url: "/og-image.jpeg",
        width: 1200,
        height: 630,
        alt: "PPTera Prompt Guide",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Prompt Guide - Write Better Prompts | PPTera",
    description: "Master AI prompt writing for stunning PowerPoint presentations.",
    images: ["/og-image.jpeg"],
  },
};

export const revalidate = 3600;

// HowTo Schema for AI and search engine discoverability
const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Write Effective AI Prompts for Presentations",
  "description": "Learn how to write effective prompts for PPTera's AI presentation generator to create stunning, professional slides.",
  "totalTime": "PT5M",
  "step": [
    {
      "@type": "HowToStep",
      "name": "Be Specific About Your Topic",
      "text": "Clearly state the main topic or subject of your presentation. Include the industry, audience, and purpose.",
    },
    {
      "@type": "HowToStep",
      "name": "Define Your Audience",
      "text": "Specify who will be viewing the presentation - executives, students, clients, or general audience.",
    },
    {
      "@type": "HowToStep",
      "name": "Specify the Number of Slides",
      "text": "Tell the AI how many slides you need. For example: 'Create a 10-slide presentation'.",
    },
    {
      "@type": "HowToStep",
      "name": "Include Key Points",
      "text": "List the main points or sections you want covered in your presentation.",
    },
    {
      "@type": "HowToStep",
      "name": "Choose a Style or Tone",
      "text": "Specify if you want a professional, casual, creative, or formal tone for your slides.",
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
      "item": "https://www.pptera.com",
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Prompt Guide",
      "item": "https://www.pptera.com/prompt-guide",
    },
  ],
};

export default function PromptGuidePage() {
  return (
    <div className="landing-page min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <LandingNavbar currentLang="en" />
      <PromptGuideContent currentLang="en" />
      <LandingFooter currentLang="en" />
    </div>
  );
}
