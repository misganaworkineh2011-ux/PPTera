import { redirect } from "next/navigation";
import { isValidLanguage, type Language } from "~/lib/i18n";
import InspirationItemPage from "../../../inspiration/[id]/page";

export default async function InspirationItemLangPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang, id } = await params;
  
  // Middleware handles /en/ redirect, so this page only serves non-English languages
  if (!isValidLanguage(lang) || lang === "en") {
    redirect(`/inspiration/${id}`);
  }

  return <InspirationItemPage currentLang={lang as Language} />;
}
