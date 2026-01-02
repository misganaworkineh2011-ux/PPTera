import { redirect } from "next/navigation";
import { generateLanguageParams, getTranslations, isValidLanguage, type Language } from "~/lib/i18n";
import EducationPage from "../../education/page";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return generateLanguageParams();
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const t = getTranslations(lang);
  
  return {
    title: `${t.education || "Education"} - PPT Master | ${t.educationHeroTitle || "Special Pricing for Education"}`,
    description: t.educationHeroDesc || "Special pricing for students, teachers, and schools. Get 50% off on all Pro plans with full access to AI presentation features.",
    openGraph: {
      title: `${t.education || "Education"} - PPT Master`,
      description: t.educationHeroDesc || "Special pricing for students, teachers, and schools.",
      type: "website",
    },
  };
}

export const revalidate = 3600;

export default async function EducationLangPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  
  // Middleware handles /en/ redirect, so this page only serves non-English languages
  if (!isValidLanguage(lang) || lang === "en") {
    redirect("/education");
  }

  return <EducationPage currentLang={lang as Language} />;
}
