import { redirect } from "next/navigation";
import { generateLanguageParams, getTranslations, isValidLanguage, type Language } from "~/lib/i18n";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return generateLanguageParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const t = getTranslations(lang);

  return {
    title: `PPT Master - ${t.heroTitle} ${t.heroSubtitle} ${t.heroSubtitle2}`,
    description: t.heroDescription,
    openGraph: {
      title: `PPT Master - ${t.heroTitle} ${t.heroSubtitle} ${t.heroSubtitle2}`,
      description: t.heroDescription,
      type: "website",
    },
  };
}

export const revalidate = 3600;

export default async function LangHomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  
  // Middleware handles /en/ redirect, so this page only serves non-English languages
  if (!isValidLanguage(lang) || lang === "en") {
    redirect("/");
  }

  // Import the landing page client component
  const { LandingPageClient } = await import("../LandingPageClient");
  return <LandingPageClient currentLang={lang as Language} />;
}
