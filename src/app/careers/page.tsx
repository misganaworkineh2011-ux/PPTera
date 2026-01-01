import CareersPageClient from "./CareersPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers - Join PPT Master Team",
  description: "Join the PPT Master team and help build the future of AI presentations. Explore open positions and apply today.",
  alternates: {
    canonical: "https://www.pptmaster.app/careers",
  },
  openGraph: {
    title: "Careers - Join PPT Master Team",
    description: "Join the PPT Master team and help build the future of AI presentations. Explore open positions.",
    url: "/careers",
    type: "website",
    images: [
      {
        url: "/og-image.jpeg",
        width: 1200,
        height: 630,
        alt: "PPT Master Careers",
      },
    ],
  },
};

export default function CareersPage() {
  return <CareersPageClient currentLang="en" />;
}
