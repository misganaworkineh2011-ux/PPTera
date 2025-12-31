import { redirect } from "next/navigation";
import { generateLanguageParams, isValidLanguage, type Language } from "~/lib/i18n";
import { ContactPageClient } from "../../contact/ContactPageClient";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return generateLanguageParams();
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  return {
    title: "Contact Us - PPT Master",
    description: "Get in touch with the PPT Master team. We're here to help with any questions or feedback.",
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
