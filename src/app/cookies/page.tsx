import { LandingNavbar } from "~/components/LandingNavbar";
import { LandingFooter } from "~/components/LandingFooter";
import { CookiesContent } from "./CookiesContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Notice - PPT Master",
  description: "Learn about how PPT Master uses cookies and similar technologies.",
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
