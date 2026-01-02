import { LandingNavbar } from "~/components/LandingNavbar";
import { LandingFooter } from "~/components/LandingFooter";
import { PrivacyContent } from "./PrivacyContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - PPT Master",
  description: "Read PPT Master's privacy policy. Learn how we collect, use, and protect your data when using our AI presentation tools.",
  alternates: {
    canonical: "https://www.pptmaster.app/privacy",
  },
  openGraph: {
    title: "Privacy Policy - PPT Master",
    description: "Read PPT Master's privacy policy. Learn how we collect, use, and protect your data when using our AI presentation tools.",
    url: "/privacy",
    type: "website",
    images: [
      {
        url: "/og-image.jpeg",
        width: 1200,
        height: 630,
        alt: "PPT Master Privacy Policy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy - PPT Master",
    description: "Learn how PPT Master collects, uses, and protects your data.",
    images: ["/og-image.jpeg"],
  },
};

export const revalidate = 86400;

export default function PrivacyPage() {
  return (
    <div className="landing-page min-h-screen bg-white">
      <LandingNavbar currentLang="en" />
      <PrivacyContent />
      <LandingFooter currentLang="en" />
    </div>
  );
}
