import { LandingNavbar } from "~/components/LandingNavbar";
import { LandingFooter } from "~/components/LandingFooter";
import { PromptGuideContent } from "./PromptGuideContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prompt Guide - PPT Master",
  description: "Master AI prompt writing for stunning presentations. Get tips, examples, and best practices for PPT Master slides.",
  alternates: {
    canonical: "https://www.pptmaster.app/prompt-guide",
  },
  openGraph: {
    title: "Prompt Guide - PPT Master",
    description: "Master AI prompt writing for stunning presentations. Get tips, examples, and best practices for PPT Master slides.",
    url: "/prompt-guide",
    type: "website",
    images: [
      {
        url: "/og-image.jpeg",
        width: 1200,
        height: 630,
        alt: "PPT Master Prompt Guide",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Prompt Guide - PPT Master",
    description: "Master AI prompt writing for stunning presentations.",
    images: ["/og-image.jpeg"],
  },
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
