import { redirect } from "next/navigation";
import { generateLanguageParams, getTranslations, isValidLanguage, type Language } from "~/lib/i18n";
import { LandingNavbar } from "~/components/LandingNavbar";
import { LandingFooter } from "~/components/LandingFooter";
import { AboutPageContent } from "../../about/AboutPageContent";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return generateLanguageParams();
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const t = getTranslations(lang);
  
  return {
    title: `${t.aboutUs || "About Us"} - PPT Master`,
    description: t.aboutHeroDesc || "Learn about PPT Master's mission to make professional presentations accessible to everyone.",
  };
}

export const revalidate = 3600;

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  
  // Middleware handles /en/ redirect, so this page only serves non-English languages
  if (!isValidLanguage(lang) || lang === "en") {
    redirect("/about");
  }

  return (
    <div className="landing-page min-h-screen bg-white">
      <LandingNavbar currentLang={lang as Language} />
      <AboutPageContent currentLang={lang as Language} />
      <LandingFooter currentLang={lang as Language} />
    </div>
  );
}
