import { redirect } from "next/navigation";
import { generateLanguageParams, getTranslations, isValidLanguage, type Language } from "~/lib/i18n";
import { LandingNavbar } from "~/components/LandingNavbar";
import { LandingFooter } from "~/components/LandingFooter";
import { PromptGuideContent } from "../../prompt-guide/PromptGuideContent";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return generateLanguageParams();
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const t = getTranslations(lang);
  
  return {
    title: `${t.promptGuide || "Prompt Guide"} - PPTera`,
    description: t.promptGuideSubtitle || "Learn how to write effective AI prompts to create stunning presentations. Tips, examples, and best practices included.",
    openGraph: {
      title: `${t.promptGuide || "Prompt Guide"} - PPTera`,
      description: t.promptGuideSubtitle || "Learn how to write effective AI prompts to create stunning presentations.",
      type: "website",
    },
  };
}

export const revalidate = 3600;

export default async function PromptGuidePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  
  // Middleware handles /en/ redirect, so this page only serves non-English languages
  if (!isValidLanguage(lang) || lang === "en") {
    redirect("/prompt-guide");
  }

  return (
    <div className="landing-page min-h-screen bg-white">
      <LandingNavbar currentLang={lang as Language} />
      <PromptGuideContent currentLang={lang as Language} />
      <LandingFooter currentLang={lang as Language} />
    </div>
  );
}
