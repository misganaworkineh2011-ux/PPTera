import InspirationPageClient from "./InspirationPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inspiration Gallery | PPTMaster – PowerPoint Design Examples",
  description: "Browse hundreds of professionally designed presentation examples. Get inspired by stunning AI-generated slides from PPTMaster (PPT Master). Explore business, marketing, and design templates.",
  keywords: "presentation inspiration, PowerPoint examples, slide design, presentation templates, PPTMaster gallery, AI presentations, design inspiration",
  alternates: {
    canonical: "https://www.pptmaster.app/inspiration",
  },
  openGraph: {
    title: "Inspiration | PPTMaster – PowerPoint Examples",
    description: "Browse hundreds of professionally designed presentation examples. Get inspired by stunning AI-generated slides.",
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
    title: "Inspiration | PPTMaster – PowerPoint Examples",
    description: "Browse hundreds of professionally designed presentation examples. Get inspired by stunning AI-generated slides.",
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
