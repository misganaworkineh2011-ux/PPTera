"use client";

import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { translations } from "~/lib/translations";
import type { Language } from "~/lib/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    try {
      // Check if user has a saved language preference
      const savedLanguage = localStorage.getItem("language") as Language;
      
      if (savedLanguage && translations[savedLanguage]) {
        // Use saved preference
        setLanguageState(savedLanguage);
      } else {
        // Auto-detect browser language on first visit
        const browserLang = detectBrowserLanguage();
        setLanguageState(browserLang);
        localStorage.setItem("language", browserLang);
      }
    } catch (error) {
      console.error("Error loading language preference:", error);
      // Fallback to English if there's any error
      setLanguageState("en");
    }
  }, []);

  // Detect browser language and map to supported languages
  const detectBrowserLanguage = (): Language => {
    if (typeof window === "undefined") return "en";

    // Get browser language (e.g., "en-US", "es-ES", "fr-FR")
    const browserLang = navigator.language || (navigator as any).userLanguage || "en";
    
    // Extract the primary language code (e.g., "en" from "en-US")
    const primaryLang = browserLang.split("-")[0]?.toLowerCase();

    // Map browser language to supported languages
    const languageMap: Record<string, Language> = {
      en: "en",
      es: "es",
      fr: "fr",
      de: "de",
      zh: "zh",
      pt: "pt",
      it: "it",
      ja: "ja",
      ko: "ko",
      ar: "ar",
      hi: "hi",
      ru: "ru",
    };

    // Return mapped language or default to English
    return languageMap[primaryLang] || "en";
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("language", lang);
      }
    } catch (error) {
      console.error("Error saving language preference:", error);
    }
  };

  // Merge selected language with English fallback
  const t = new Proxy(translations[language] || translations.en, {
    get(target, prop: string) {
      return target[prop as keyof typeof target] || translations.en[prop as keyof typeof translations.en];
    }
  }) as typeof translations.en;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
