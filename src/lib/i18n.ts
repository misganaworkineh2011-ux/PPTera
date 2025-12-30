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

export const LANGUAGE_NAMES: Record<Language, { name: string; flag: string }> = {
  en: { name: "English", flag: "🇺🇸" },
  es: { name: "Español", flag: "🇪🇸" },
  fr: { name: "Français", flag: "🇫🇷" },
  de: { name: "Deutsch", flag: "🇩🇪" },
  zh: { name: "中文", flag: "🇨🇳" },
  pt: { name: "Português", flag: "🇧🇷" },
  it: { name: "Italiano", flag: "🇮🇹" },
  ja: { name: "日本語", flag: "🇯🇵" },
  ko: { name: "한국어", flag: "🇰🇷" },
  ar: { name: "العربية", flag: "🇸🇦" },
  hi: { name: "हिन्दी", flag: "🇮🇳" },
  ru: { name: "Русский", flag: "🇷🇺" },
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
