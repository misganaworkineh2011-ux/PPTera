import { redirect } from "next/navigation";
import { generateLanguageParams, isValidLanguage, type Language } from "~/lib/i18n";
import InspirationPage from "../../inspiration/page";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return generateLanguageParams();
}

export const metadata: Metadata = {
  title: "Inspiration - PPT Master",
  description: "Browse through hundreds of professionally designed presentations to spark your creativity.",
};

export const revalidate = 3600;

export default async function InspirationLangPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  
  // Middleware handles /en/ redirect, so this page only serves non-English languages
  if (!isValidLanguage(lang) || lang === "en") {
    redirect("/inspiration");
  }

  return <InspirationPage currentLang={lang as Language} />;
}
