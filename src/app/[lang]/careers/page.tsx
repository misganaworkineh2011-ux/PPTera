import { redirect } from "next/navigation";
import { generateLanguageParams, isValidLanguage, type Language } from "~/lib/i18n";
import CareersPage from "../../careers/page";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return generateLanguageParams();
}

export const metadata: Metadata = {
  title: "Careers - PPT Master",
  description: "Join PPT Master and help build the future of AI-powered presentations. View open positions and apply today.",
};

export const revalidate = 3600;

export default async function CareersLangPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  
  // Middleware handles /en/ redirect, so this page only serves non-English languages
  if (!isValidLanguage(lang) || lang === "en") {
    redirect("/careers");
  }

  return <CareersPage currentLang={lang as Language} />;
}
