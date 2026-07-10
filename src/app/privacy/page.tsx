import { LandingNavbar } from "~/components/LandingNavbar";
import { LandingFooter } from "~/components/LandingFooter";
import { PrivacyContent } from "./PrivacyContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Data Protection & Security | PPTera",
  description: "Read PPTera's privacy policy. Learn how we collect, use, protect your data, and ensure security when using our AI PowerPoint generator.",
  alternates: {
    canonical: "https://www.pptera.com/privacy",
  },
  openGraph: {
    title: "Privacy Policy - Data Protection & Security | PPTera",
    description: "Learn how PPTera collects, uses, and protects your data when using our AI PowerPoint generator.",
    url: "/privacy",
    type: "website",
    images: [
      {
        url: "/og-image.jpeg",
        width: 1200,
        height: 630,
        alt: "PPTera Privacy Policy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | PPTera",
    description: "Learn how PPTera collects, uses, and protects your data.",
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
