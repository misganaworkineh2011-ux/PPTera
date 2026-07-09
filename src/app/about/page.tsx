import { LandingNavbar } from "~/components/LandingNavbar";
import { LandingFooter } from "~/components/LandingFooter";
import { AboutPageContent } from "./AboutPageContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us - AI PowerPoint Generator Mission | PPTera",
  description: "Learn about PPTera's mission to democratize professional presentations with AI. Discover our story, values, and commitment to innovation in PowerPoint generation.",
  alternates: {
    canonical: "https://www.pptmaster.app/about",
  },
  openGraph: {
    title: "About Us - AI PowerPoint Generator Mission | PPTera",
    description: "Learn about PPTera's mission to democratize professional presentations with AI technology.",
    url: "/about",
    type: "website",
    images: [
      {
        url: "/og-image.jpeg",
        width: 1200,
        height: 630,
        alt: "About PPTera",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us - AI PowerPoint Generator | PPTera",
    description: "Learn about PPTera's mission to democratize professional presentations with AI.",
    images: ["/og-image.jpeg"],
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
