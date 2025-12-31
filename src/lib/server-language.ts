import { cookies, headers } from "next/headers";
import { translations, type Language } from "./translations";

const SUPPORTED_LANGUAGES: Language[] = ['en', 'es', 'fr', 'de', 'zh', 'pt', 'it', 'ja', 'ko', 'ar', 'hi', 'ru'];
const DEFAULT_LANGUAGE: Language = 'en';

/**
 * Get the current language from cookies or headers (server-side only)
 * This works with static generation and ISR
 */
export async function getServerLanguage(): Promise<Language> {
  // Try to get from cookie first
  const cookieStore = await cookies();
  const cookieLang = cookieStore.get('NEXT_LOCALE')?.value as Language;
  
  if (cookieLang && SUPPORTED_LANGUAGES.includes(cookieLang)) {
    return cookieLang;
  }

  // Fallback to header set by middleware
  const headersList = await headers();
  const headerLang = headersList.get('x-user-language') as Language;
  
  if (headerLang && SUPPORTED_LANGUAGES.includes(headerLang)) {
    return headerLang;
  }

  return DEFAULT_LANGUAGE;
}

/**
 * Get translations for the current language (server-side only)
 */
export async function getServerTranslations() {
  const language = await getServerLanguage();
  return translations[language];
}
