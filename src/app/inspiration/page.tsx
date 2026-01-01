import InspirationPageClient from "./InspirationPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inspiration - PPT Master PowerPoint Examples",
  description: "Browse hundreds of professionally designed presentation examples and templates. Get inspired by stunning business, marketing, education, and design slides created with PPT Master's AI-powered presentation generator.",
  alternates: {
    canonical: "https://www.pptmaster.app/inspiration",
  },
};

export default function InspirationPage() {
  return <InspirationPageClient currentLang="en" />;
}
