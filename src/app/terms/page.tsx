import { LandingNavbar } from "~/components/LandingNavbar";
import { LandingFooter } from "~/components/LandingFooter";
import { TermsContent } from "./TermsContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - PPT Master",
  description: "Read PPT Master's terms of service. Understand the rules, user responsibilities, and policies for our AI platform.",
  alternates: {
    canonical: "https://www.pptmaster.app/terms",
  },
  openGraph: {
    title: "Terms of Service - PPT Master",
    description: "Read PPT Master's terms of service. Understand the rules, user responsibilities, and policies for our AI platform.",
    url: "/terms",
    type: "website",
    images: [
      {
        url: "/og-image.jpeg",
        width: 1200,
        height: 630,
        alt: "PPT Master Terms of Service",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service - PPT Master",
    description: "Understand the rules and policies for using PPT Master's AI platform.",
    images: ["/og-image.jpeg"],
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
