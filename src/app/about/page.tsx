import { LandingNavbar } from "~/components/LandingNavbar";
import { LandingFooter } from "~/components/LandingFooter";
import { AboutPageContent } from "./AboutPageContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us - PPT Master",
  description: "Learn about PPT Master's mission to make professional presentations accessible to everyone. Discover how our AI-powered platform helps millions create stunning slides in seconds, transforming ideas into impactful visual stories.",
  alternates: {
    canonical: "https://www.pptmaster.app/about",
  },
};

export const revalidate = 3600;

export default function AboutPage() {
  return (
    <div className="landing-page min-h-screen bg-white">
      <LandingNavbar currentLang="en" />
      <AboutPageContent currentLang="en" />
      <LandingFooter currentLang="en" />
    </div>
  );
}
