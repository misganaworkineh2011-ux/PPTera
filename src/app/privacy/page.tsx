import { LandingNavbar } from "~/components/LandingNavbar";
import { LandingFooter } from "~/components/LandingFooter";
import { PrivacyContent } from "./PrivacyContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - PPT Master",
  description: "Read PPT Master's privacy policy to understand how we collect, use, and protect your data. Learn about our commitment to data security, your privacy rights, and how we handle your information when using our AI presentation generator.",
  alternates: {
    canonical: "https://www.pptmaster.app/privacy",
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
