import CareersPageClient from "./CareersPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers - Join PPT Master Team",
  description: "Join the PPT Master team and help build the future of AI-powered presentations. Explore exciting career opportunities in engineering, design, marketing, and more. We offer remote work, competitive benefits, and a passionate team culture.",
  alternates: {
    canonical: "https://www.pptmaster.app/careers",
  },
};

export default function CareersPage() {
  return <CareersPageClient currentLang="en" />;
}
