import { redirect } from "next/navigation";
import { generateLanguageParams, getTranslations, isValidLanguage, type Language } from "~/lib/i18n";
import { LandingNavbar } from "~/components/LandingNavbar";
import { LandingFooter } from "~/components/LandingFooter";
import { TermsContent } from "../../terms/TermsContent";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return generateLanguageParams();
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const t = getTranslations(lang);
  
  return {
    title: `${t.termsOfService || "Terms of Service"} - PPTera`,
    description: t.termsOfServiceDesc || "Read PPTera's terms of service to understand the rules and guidelines for using our AI presentation platform.",
    openGraph: {
      title: `${t.termsOfService || "Terms of Service"} - PPTera`,
      description: t.termsOfServiceDesc || "Read PPTera's terms of service to understand the rules and guidelines.",
      type: "website",
    },
  };
}

export const revalidate = 86400; // Revalidate once per day

export default async function TermsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  
  // Middleware handles /en/ redirect, so this page only serves non-English languages
  if (!isValidLanguage(lang) || lang === "en") {
    redirect("/terms");
  }

  return (
    <div className="landing-page min-h-screen bg-white">
      <LandingNavbar currentLang={lang as Language} />
      <TermsContent />
      <LandingFooter currentLang={lang as Language} />
    </div>
  );
}
