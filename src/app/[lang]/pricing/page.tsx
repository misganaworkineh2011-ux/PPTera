import { redirect } from "next/navigation";
import { generateLanguageParams, isValidLanguage, type Language } from "~/lib/i18n";
import { PricingPageClient } from "../../pricing/PricingPageClient";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return generateLanguageParams();
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Pricing - PPT Master",
    description: "Choose the perfect plan for your presentation needs. Free, Plus, Pro, and Ultra plans available.",
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
