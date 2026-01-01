import { PricingPageClient } from "./PricingPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing - PPT Master AI PowerPoint Plans",
  description: "Choose the perfect PPT Master plan for your needs. From free starter credits to unlimited professional plans, find affordable AI presentation solutions. Compare features, credits, and benefits across all subscription tiers.",
  alternates: {
    canonical: "https://www.pptmaster.app/pricing",
  },
};

export default function PricingPage() {
  return <PricingPageClient currentLang="en" />;
}
