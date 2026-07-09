import { redirect } from "next/navigation";
import { generateLanguageParams, getTranslations, isValidLanguage, type Language } from "~/lib/i18n";
import CommunityPageClient from "../../community/CommunityPageClient";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return generateLanguageParams();
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const t = getTranslations(lang);
  
  return {
    title: `${t.community || "Community"} - PPTera | ${t.communityHeroTitle}`,
    description: t.communityHeroDesc || "Join the PPTera community to connect with creators, share your presentations, and learn from experts. Get inspired and grow together.",
    openGraph: {
      title: `${t.community || "Community"} - PPTera`,
      description: t.communityHeroDesc,
      type: "website",
    },
  };
}

export const revalidate = 3600;

export default async function CommunityLangPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  
  // Middleware handles /en/ redirect, so this page only serves non-English languages
  if (!isValidLanguage(lang) || lang === "en") {
    redirect("/community");
  }

  return <CommunityPageClient currentLang={lang as Language} />;
}
