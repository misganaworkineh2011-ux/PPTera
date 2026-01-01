import { redirect } from "next/navigation";
import { generateLanguageParams, isValidLanguage, type Language } from "~/lib/i18n";
import { LandingNavbar } from "~/components/LandingNavbar";
import { LandingFooter } from "~/components/LandingFooter";
import { CookiesContent } from "../../cookies/CookiesContent";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return generateLanguageParams();
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const t = getTranslations(lang);
  
  return {
    title: `${t.cookieNotice || "Cookie Notice"} - PPT Master`,
    description: t.cookieNoticeDesc || "Learn how PPT Master uses cookies and similar technologies to improve your experience. Manage your cookie preferences easily.",
    openGraph: {
      title: `${t.cookieNotice || "Cookie Notice"} - PPT Master`,
      description: t.cookieNoticeDesc || "Learn how PPT Master uses cookies and similar technologies.",
      type: "website",
    },
  };
}

export const revalidate = 86400; // Revalidate once per day

export default async function CookiesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  
  // Middleware handles /en/ redirect, so this page only serves non-English languages
  if (!isValidLanguage(lang) || lang === "en") {
    redirect("/cookies");
  }

  return (
    <div className="landing-page min-h-screen bg-white">
      <LandingNavbar currentLang={lang as Language} />
      <CookiesContent />
      <LandingFooter currentLang={lang as Language} />
    </div>
  );
}
