import { PricingPageClient } from "./PricingPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing - PPT Master AI PowerPoint Plans",
  description: "Choose the perfect PPT Master plan. Compare free and premium AI presentation features, credits, and pricing options.",
  alternates: {
    canonical: "https://www.pptmaster.app/pricing",
  },
};

export default function PricingPage() {
  return <PricingPageClient currentLang="en" />;
}
