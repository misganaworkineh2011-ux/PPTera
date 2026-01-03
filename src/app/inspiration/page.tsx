import InspirationPageClient from "./InspirationPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inspiration",
  description: "Browse hundreds of professionally designed presentation examples. Get inspired by stunning AI-generated slides from PPTMaster (PPT Master).",
  alternates: {
    canonical: "https://www.pptmaster.app/inspiration",
  },
  openGraph: {
    title: "Inspiration | PPTMaster – PowerPoint Examples",
    description: "Browse hundreds of professionally designed presentation examples. Get inspired by stunning AI-generated slides.",
    url: "/inspiration",
    type: "website",
    images: [
      {
        url: "/og-image.jpeg",
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
    images: ["/og-image.jpeg"],
  },
};

export default function InspirationPage() {
  return <InspirationPageClient currentLang="en" />;
}
