import { redirect } from "next/navigation";
import { isValidLanguage, type Language } from "~/lib/i18n";
import InsightPostPage from "../../../insights/[slug]/page";

export default async function InsightPostLangPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  
  // Middleware handles /en/ redirect, so this page only serves non-English languages
  if (!isValidLanguage(lang) || lang === "en") {
    redirect(`/insights/${slug}`);
  }

  return <InsightPostPage currentLang={lang as Language} />;
}
