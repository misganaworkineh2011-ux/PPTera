import { translations, type Language } from "./translations";

export type { Language };

export const SUPPORTED_LANGUAGES: Language[] = [
  "en",
  "es",
  "fr",
  "de",
  "zh",
  "pt",
  "it",
  "ja",
  "ko",
  "ar",
  "hi",
  "ru",
];

export const DEFAULT_LANGUAGE: Language = "en";

export const LANGUAGE_NAMES: Record<Language, { name: string; flag: string; short: string }> = {
  en: { name: "English", flag: "🇺🇸", short: "EN" },
  es: { name: "Español", flag: "🇪🇸", short: "ES" },
  fr: { name: "Français", flag: "🇫🇷", short: "FR" },
  de: { name: "Deutsch", flag: "🇩🇪", short: "DE" },
  zh: { name: "中文", flag: "🇨🇳", short: "中文" },
  pt: { name: "Português", flag: "🇧🇷", short: "PT" },
  it: { name: "Italiano", flag: "🇮🇹", short: "IT" },
  ja: { name: "日本語", flag: "🇯🇵", short: "日本" },
  ko: { name: "한국어", flag: "🇰🇷", short: "한국" },
  ar: { name: "العربية", flag: "🇸🇦", short: "عربي" },
  hi: { name: "हिन्दी", flag: "🇮🇳", short: "हिंदी" },
  ru: { name: "Русский", flag: "🇷🇺", short: "RU" },
};

/**
 * Check if a language code is supported
 */
export function isValidLanguage(lang: string): lang is Language {
  return SUPPORTED_LANGUAGES.includes(lang as Language);
}

/**
 * Get translations for a specific language
 */
export function getTranslations(lang: string) {
  if (!isValidLanguage(lang)) {
    return translations[DEFAULT_LANGUAGE];
  }
  return translations[lang];
}

/**
 * Generate static params for all supported languages
 */
export function generateLanguageParams() {
  return SUPPORTED_LANGUAGES.map((lang) => ({ lang }));
}

/**
 * Get alternate language links for hreflang tags
 * English uses root path, other languages use /[lang]/ prefix
 */
export function getAlternateLanguages(pathname: string) {
  return SUPPORTED_LANGUAGES.map((lang) => ({
    lang,
    url: lang === DEFAULT_LANGUAGE ? pathname : `/${lang}${pathname}`,
  }));
}

/**
 * Get localized path for a given language
 * English uses root path, other languages use /[lang]/ prefix
 */
export function getLocalizedPath(path: string, lang: Language): string {
  if (lang === DEFAULT_LANGUAGE) {
    return path; // English uses root path
  }
  return `/${lang}${path}`;
}
