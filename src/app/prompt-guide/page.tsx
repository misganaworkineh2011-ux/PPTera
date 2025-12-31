import { LandingNavbar } from "~/components/LandingNavbar";
import { LandingFooter } from "~/components/LandingFooter";
import { PromptGuideContent } from "./PromptGuideContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prompt Guide - PPT Master",
  description: "Learn how to write effective AI prompts to create stunning presentations.",
};

export const revalidate = 3600;

export default function PromptGuidePage() {
  return (
    <div className="landing-page min-h-screen bg-white">
      <LandingNavbar currentLang="en" />
      <PromptGuideContent currentLang="en" />
      <LandingFooter currentLang="en" />
    </div>
  );
}
