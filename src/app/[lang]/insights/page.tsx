import { redirect } from "next/navigation";
import { generateLanguageParams, isValidLanguage, type Language } from "~/lib/i18n";
import InsightsPage from "../../insights/page";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return generateLanguageParams();
}

export const metadata: Metadata = {
  title: "Insights - PPT Master",
  description: "Tips, guides, and insights to help you create better presentations with AI.",
};

export const revalidate = 3600;

export default async function InsightsLangPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  
  // Middleware handles /en/ redirect, so this page only serves non-English languages
  if (!isValidLanguage(lang) || lang === "en") {
    redirect("/insights");
  }

  return <InsightsPage currentLang={lang as Language} />;
}
