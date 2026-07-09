import { redirect } from "next/navigation";
import { generateLanguageParams, getTranslations, isValidLanguage, type Language } from "~/lib/i18n";
import { ContactPageClient } from "../../contact/ContactPageClient";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return generateLanguageParams();
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const t = getTranslations(lang);
  
  return {
    title: `${t.contactTitle || "Contact Us"} - PPTera`,
    description: t.contactSubtitle || "Get in touch with the PPTera team for questions, feedback, or support. We respond within 24 hours to help you succeed.",
    openGraph: {
      title: `${t.contactTitle || "Contact Us"} - PPTera`,
      description: t.contactSubtitle || "Get in touch with the PPTera team for questions, feedback, or support.",
      type: "website",
    },
  };
}

export const revalidate = 3600;

export default async function ContactPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  
  // Middleware handles /en/ redirect, so this page only serves non-English languages
  if (!isValidLanguage(lang) || lang === "en") {
    redirect("/contact");
  }

  return <ContactPageClient currentLang={lang as Language} />;
}
