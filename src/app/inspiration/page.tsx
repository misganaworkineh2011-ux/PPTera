import InspirationPageClient from "./InspirationPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inspiration Gallery - AI PowerPoint Examples & Templates | PPTMaster",
  description: "Browse 1000+ stunning AI-generated PowerPoint examples. Get inspired by professional presentation designs, business slides, and creative templates from PPTMaster.",
  keywords: "presentation inspiration, PowerPoint examples, slide design, presentation templates, PPTMaster gallery, AI presentations, design inspiration",
  alternates: {
    canonical: "https://www.pptmaster.app/inspiration",
  },
  openGraph: {
    title: "Inspiration Gallery - AI PowerPoint Examples | PPTMaster",
    description: "Browse 1000+ stunning AI-generated PowerPoint examples. Get inspired by professional presentation designs.",
    url: "https://www.pptmaster.app/inspiration",
    type: "website",
    images: [
      {
        url: "https://www.pptmaster.app/og-image.jpeg",
        width: 1200,
        height: 630,
        alt: "PPTMaster Inspiration Gallery",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Inspiration Gallery - AI PowerPoint Examples | PPTMaster",
    description: "Browse 1000+ stunning AI-generated PowerPoint examples. Get inspired by professional designs.",
    images: ["https://www.pptmaster.app/og-image.jpeg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function InspirationPage() {
  return <InspirationPageClient currentLang="en" />;
}
