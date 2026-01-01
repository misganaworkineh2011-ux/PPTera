import InspirationPageClient from "./InspirationPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inspiration - PPT Master PowerPoint Examples",
  description: "Browse hundreds of professionally designed presentation examples. Get inspired by stunning AI-generated slides.",
  alternates: {
    canonical: "https://www.pptmaster.app/inspiration",
  },
  openGraph: {
    title: "Inspiration - PPT Master PowerPoint Examples",
    description: "Browse hundreds of professionally designed presentation examples. Get inspired by stunning AI-generated slides.",
    url: "/inspiration",
    type: "website",
    images: [
      {
        url: "/og-image.jpeg",
        width: 1200,
        height: 630,
        alt: "PPT Master Inspiration Gallery",
      },
    ],
  },
};

export default function InspirationPage() {
  return <InspirationPageClient currentLang="en" />;
}
