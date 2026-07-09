import CareersPageClient from "./CareersPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers",
  description: "Join the PPTera (PPTera) team and help build the future of AI presentations. Explore open positions and apply today.",
  alternates: {
    canonical: "https://www.pptmaster.app/careers",
  },
  openGraph: {
    title: "Careers | PPTera – Join Our Team",
    description: "Join the PPTera team and help build the future of AI presentations. Explore open positions.",
    url: "/careers",
    type: "website",
    images: [
      {
        url: "/og-image.jpeg",
        width: 1200,
        height: 630,
        alt: "PPTera Careers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Careers | PPTera – Join Our Team",
    description: "Join the PPTera team and help build the future of AI presentations.",
    images: ["/og-image.jpeg"],
  },
};

export default function CareersPage() {
  return <CareersPageClient currentLang="en" />;
}
