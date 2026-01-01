import { LandingNavbar } from "~/components/LandingNavbar";
import { LandingFooter } from "~/components/LandingFooter";
import { TermsContent } from "./TermsContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - PPT Master",
  description: "Read PPT Master's terms of service to understand the rules and guidelines for using our AI presentation platform. Learn about user responsibilities, content policies, subscription terms, and intellectual property rights.",
  alternates: {
    canonical: "https://www.pptmaster.app/terms",
  },
};

export const revalidate = 86400;

export default function TermsPage() {
  return (
    <div className="landing-page min-h-screen bg-white">
      <LandingNavbar currentLang="en" />
      <TermsContent />
      <LandingFooter currentLang="en" />
    </div>
  );
}
