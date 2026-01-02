import { redirect } from "next/navigation";
import { generateLanguageParams, getTranslations, isValidLanguage, type Language } from "~/lib/i18n";
import CareersPageClient from "../../careers/CareersPageClient";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return generateLanguageParams();
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const t = getTranslations(lang);
  
  return {
    title: `${t.careers || "Careers"} - PPT Master | ${t.careersHeroTitle} ${t.careersHeroHighlight}`,
    description: t.careersHeroDesc || "Join PPT Master and help build the future of AI-powered presentations. View open positions and apply today to join our team.",
    openGraph: {
      title: `${t.careers || "Careers"} - PPT Master`,
      description: t.careersHeroDesc,
      type: "website",
    },
  };
}

export const revalidate = 3600;

export default async function CareersLangPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  
  // Middleware handles /en/ redirect, so this page only serves non-English languages
  if (!isValidLanguage(lang) || lang === "en") {
    redirect("/careers");
  }

  return <CareersPageClient currentLang={lang as Language} />;
}
