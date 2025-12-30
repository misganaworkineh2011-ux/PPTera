import { redirect } from "next/navigation";
import { generateLanguageParams, isValidLanguage, type Language } from "~/lib/i18n";
import { LandingNavbar } from "~/components/LandingNavbar";
import { LandingFooter } from "~/components/LandingFooter";
import { PrivacyContent } from "../../privacy/PrivacyContent";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return generateLanguageParams();
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  return {
    title: "Privacy Policy - PPT Master",
    description: "Read PPT Master's privacy policy to understand how we collect, use, and protect your data.",
  };
}

export const revalidate = 86400; // Revalidate once per day

export default async function PrivacyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  
  // Middleware handles /en/ redirect, so this page only serves non-English languages
  if (!isValidLanguage(lang) || lang === "en") {
    redirect("/privacy");
  }

  return (
    <div className="landing-page min-h-screen bg-white">
      <LandingNavbar currentLang={lang as Language} />
      <PrivacyContent />
      <LandingFooter currentLang={lang as Language} />
    </div>
  );
}
