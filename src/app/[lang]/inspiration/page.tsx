import { redirect } from "next/navigation";
import { generateLanguageParams, getTranslations, isValidLanguage, type Language } from "~/lib/i18n";
import InspirationPageClient from "../../inspiration/InspirationPageClient";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return generateLanguageParams();
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const t = getTranslations(lang);
  
  return {
    title: `${t.inspiration || "Inspiration"} - PPT Master | ${t.inspirationHeroTitle} ${t.inspirationHeroHighlight}`,
    description: t.inspirationHeroDesc || "Browse hundreds of professionally designed AI presentations to spark your creativity. Find templates and ideas for any topic or industry.",
    openGraph: {
      title: `${t.inspiration || "Inspiration"} - PPT Master`,
      description: t.inspirationHeroDesc,
      type: "website",
    },
  };
}

export const revalidate = 3600;

export default async function InspirationLangPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  
  // Middleware handles /en/ redirect, so this page only serves non-English languages
  if (!isValidLanguage(lang) || lang === "en") {
    redirect("/inspiration");
  }

  return <InspirationPageClient currentLang={lang as Language} />;
}
