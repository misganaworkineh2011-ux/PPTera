import { redirect } from "next/navigation";
import { generateLanguageParams, getTranslations, isValidLanguage, type Language } from "~/lib/i18n";
import type { Metadata } from "next";
import { LandingPageClient } from "../LandingPageClient";

export async function generateStaticParams() {
  return generateLanguageParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const t = getTranslations(lang);

  return {
    title: `PPTera – ${t.heroTitle} ${t.heroSubtitle} ${t.heroSubtitle2}`,
    description: t.heroDescription,
    openGraph: {
      title: `PPTera – ${t.heroTitle} ${t.heroSubtitle} ${t.heroSubtitle2}`,
      description: t.heroDescription,
      type: "website",
    },
  };
}

export const revalidate = 3600;

// Server-rendered landing page with critical SEO content for each language
function LandingPageServer({ lang }: { lang: Language }) {
  const t = getTranslations(lang);
  
  return (
    <>
      {/* Critical SEO content - server-rendered for Google */}
      <div className="sr-only" aria-hidden="false">
        <h1>PPTera — {t.heroTitle} {t.heroSubtitle} {t.heroSubtitle2}</h1>
        <p><strong>PPTera</strong> (PPTera) - {t.heroDescription}</p>
        <ul>
          <li>{t.aiPresentations}</li>
          <li>{t.templates}</li>
          <li>{t.exportFormats}</li>
          <li>{t.noCreditCard}</li>
        </ul>
      </div>
      {/* Interactive landing page */}
      <LandingPageClient currentLang={lang} />
    </>
  );
}

export default async function LangHomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  
  // Middleware handles /en/ redirect, so this page only serves non-English languages
  if (!isValidLanguage(lang) || lang === "en") {
    redirect("/");
  }

  return <LandingPageServer lang={lang as Language} />;
}
