import { LandingNavbar } from "~/components/LandingNavbar";
import { LandingFooter } from "~/components/LandingFooter";
import { TermsContent } from "./TermsContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - AI PowerPoint Generator Rules | PPTMaster",
  description: "Read PPTMaster's terms of service. Understand user rights, responsibilities, and policies for using our AI PowerPoint generator platform.",
  alternates: {
    canonical: "https://www.pptmaster.app/terms",
  },
  openGraph: {
    title: "Terms of Service - AI PowerPoint Generator | PPTMaster",
    description: "Read PPTMaster's terms of service. Understand user rights, responsibilities, and policies for our AI platform.",
    url: "/terms",
    type: "website",
    images: [
      {
        url: "/og-image.jpeg",
        width: 1200,
        height: 630,
        alt: "PPTMaster Terms of Service",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service | PPTMaster",
    description: "Understand the rules and policies for using PPTMaster's AI platform.",
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
