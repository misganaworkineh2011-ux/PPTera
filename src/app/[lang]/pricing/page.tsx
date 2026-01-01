import { redirect } from "next/navigation";
import { generateLanguageParams, getTranslations, isValidLanguage, type Language } from "~/lib/i18n";
import { PricingPageClient } from "../../pricing/PricingPageClient";
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
    title: `${t.pricing} - PPT Master | ${t.pricingTitle}`,
    description: t.pricingSubtitle,
    openGraph: {
      title: `${t.pricing} - PPT Master`,
      description: t.pricingSubtitle,
      type: "website",
    },
  };
}

export const revalidate = 3600;

export default async function LangPricingPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  
  // Middleware handles /en/ redirect, so this page only serves non-English languages
  if (!isValidLanguage(lang) || lang === "en") {
    redirect("/pricing");
  }

  return <PricingPageClient currentLang={lang as Language} />;
}
