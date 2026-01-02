import { LandingNavbar } from "~/components/LandingNavbar";
import { LandingFooter } from "~/components/LandingFooter";
import { AboutPageContent } from "./AboutPageContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us - PPT Master",
  description: "Learn about PPT Master's mission to make professional presentations accessible to everyone with AI-powered tools.",
  alternates: {
    canonical: "https://www.pptmaster.app/about",
  },
  openGraph: {
    title: "About Us - PPT Master",
    description: "Learn about PPT Master's mission to make professional presentations accessible to everyone with AI-powered tools.",
    url: "/about",
    type: "website",
    images: [
      {
        url: "/og-image.jpeg",
        width: 1200,
        height: 630,
        alt: "About PPT Master",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us - PPT Master",
    description: "Learn about PPT Master's mission to make professional presentations accessible to everyone.",
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
