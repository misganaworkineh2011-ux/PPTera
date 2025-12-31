import { redirect } from "next/navigation";
import { generateLanguageParams, isValidLanguage, type Language } from "~/lib/i18n";
import EducationPage from "../../education/page";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return generateLanguageParams();
}

export const metadata: Metadata = {
  title: "Education - PPT Master",
  description: "Special pricing for students, teachers, and schools. Get 50% off on all Pro plans.",
};

export const revalidate = 3600;

export default async function EducationLangPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  
  // Middleware handles /en/ redirect, so this page only serves non-English languages
  if (!isValidLanguage(lang) || lang === "en") {
    redirect("/education");
  }

  return <EducationPage currentLang={lang as Language} />;
}
