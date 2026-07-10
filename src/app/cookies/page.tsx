import { LandingNavbar } from "~/components/LandingNavbar";
import { LandingFooter } from "~/components/LandingFooter";
import { CookiesContent } from "./CookiesContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Notice",
  description: "Learn how PPTera (PPTera) uses cookies to enhance your experience. Understand our data practices and your privacy choices.",
  alternates: {
    canonical: "https://www.pptera.com/cookies",
  },
  openGraph: {
    title: "Cookie Notice | PPTera",
    description: "Learn how PPTera uses cookies to enhance your experience and understand your privacy choices.",
    url: "/cookies",
    type: "website",
    images: [
      {
        url: "/og-image.jpeg",
        width: 1200,
        height: 630,
        alt: "PPTera Cookie Notice",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cookie Notice | PPTera",
    description: "Learn how PPTera uses cookies to enhance your experience.",
    images: ["/og-image.jpeg"],
  },
};

export const revalidate = 86400;

export default function CookiesPage() {
  return (
    <div className="landing-page min-h-screen bg-white">
      <LandingNavbar currentLang="en" />
      <CookiesContent />
      <LandingFooter currentLang="en" />
    </div>
  );
}
