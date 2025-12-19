import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Insights & Blog | PPT Master - AI PowerPoint Generator Tips & Guides",
  description:
    "Discover expert tips, design guides, and best practices for creating stunning presentations with PPT Master. Learn how to leverage AI powerpoint generator tools for professional slides.",
  openGraph: {
    title: "Insights & Blog | PPT Master - AI PowerPoint Generator",
    description:
      "Expert tips and guides for creating stunning presentations with AI powerpoint generator tools. Learn design principles, best practices, and presentation techniques.",
    url: "https://www.pptmaster.app/insights",
    siteName: "PPT Master - AI PowerPoint Generator",
    images: [
      {
        url: "https://www.pptmaster.app/og-image.jpeg",
        width: 1200,
        height: 630,
        alt: "PPT Master Insights - Presentation Design Tips",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Insights & Blog | PPT Master - AI PowerPoint Generator",
    description:
      "Expert tips and guides for creating stunning presentations with AI powerpoint generator tools.",
    images: ["https://www.pptmaster.app/og-image.jpeg"],
    creator: "@pptmaster",
    site: "@pptmaster",
  },
  keywords: [
    "ppt master",
    "ai powerpoint generator",
    "presentation tips",
    "powerpoint design",
    "slide design",
    "presentation best practices",
    "ai presentation tool",
    "powerpoint templates",
    "presentation maker",
    "design guides",
    "presentation techniques",
    "visual storytelling",
    "presentation software",
  ],
  alternates: {
    canonical: "https://www.pptmaster.app/insights",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function InsightsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
