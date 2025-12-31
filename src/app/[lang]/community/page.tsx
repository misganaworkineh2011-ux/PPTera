import { redirect } from "next/navigation";
import { generateLanguageParams, isValidLanguage, type Language } from "~/lib/i18n";
import CommunityPage from "../../community/page";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return generateLanguageParams();
}

export const metadata: Metadata = {
  title: "Community - PPT Master",
  description: "Join the PPT Master community. Connect with creators, share your work, and learn from experts.",
};

export const revalidate = 3600;

export default async function CommunityLangPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  
  // Middleware handles /en/ redirect, so this page only serves non-English languages
  if (!isValidLanguage(lang) || lang === "en") {
    redirect("/community");
  }

  return <CommunityPage currentLang={lang as Language} />;
}
