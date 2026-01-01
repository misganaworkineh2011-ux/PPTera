import { PricingPageClient } from "./PricingPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing - PPT Master AI PowerPoint Plans",
  description: "Choose the perfect PPT Master plan. Compare free and premium AI presentation features, credits, and pricing options.",
  alternates: {
    canonical: "https://www.pptmaster.app/pricing",
  },
  openGraph: {
    title: "Pricing - PPT Master AI PowerPoint Plans",
    description: "Choose the perfect PPT Master plan. Compare free and premium AI presentation features, credits, and pricing options.",
    url: "/pricing",
    type: "website",
    images: [
      {
        url: "/og-image.jpeg",
        width: 1200,
        height: 630,
        alt: "PPT Master Pricing Plans",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing - PPT Master AI PowerPoint Plans",
    description: "Choose the perfect PPT Master plan. Compare free and premium AI presentation features.",
    images: ["/og-image.jpeg"],
  },
};

export default function PricingPage() {
  return <PricingPageClient currentLang="en" />;
}
