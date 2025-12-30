"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Globe, Check } from "lucide-react";
import { SUPPORTED_LANGUAGES, LANGUAGE_NAMES, DEFAULT_LANGUAGE, type Language } from "~/lib/i18n";

interface LanguageSwitcherProps {
  currentLang: Language;
}

export function LanguageSwitcher({ currentLang }: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = () => setIsOpen(false);
    if (isOpen) {
      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
    }
  }, [isOpen]);

  const switchLanguage = (newLang: Language) => {
    // Get path without any language prefix
    let pathWithoutLang = pathname;
    
    // Check if current path has a language prefix (for non-English)
    const langMatch = pathname.match(/^\/([a-z]{2})(\/|$)/);
    if (langMatch && SUPPORTED_LANGUAGES.includes(langMatch[1] as Language) && langMatch[1] !== "en") {
      pathWithoutLang = pathname.replace(`/${langMatch[1]}`, "") || "/";
    }
    
    // Build new path:
    // - For English: use root path (no /en/ prefix)
    // - For other languages: use /[lang]/ prefix
    let newPath: string;
    if (newLang === DEFAULT_LANGUAGE) {
      // English uses root path
      newPath = pathWithoutLang || "/";
    } else {
      // Other languages use /[lang]/ prefix
      newPath = `/${newLang}${pathWithoutLang === "/" ? "" : pathWithoutLang}`;
    }
    
    // Set cookie for persistence
    document.cookie = `NEXT_LOCALE=${newLang}; path=/; max-age=31536000`; // 1 year
    
    // Navigate to new language
    router.push(newPath);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
        aria-label="Change language"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{LANGUAGE_NAMES[currentLang].name}</span>
        <span className="sm:hidden">{LANGUAGE_NAMES[currentLang].flag}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg border border-slate-200 bg-white shadow-lg z-50">
          <div className="py-1">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => switchLanguage(lang)}
                className="flex w-full items-center justify-between px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span>{LANGUAGE_NAMES[lang].flag}</span>
                  <span>{LANGUAGE_NAMES[lang].name}</span>
                </span>
                {lang === currentLang && (
                  <Check className="h-4 w-4 text-[#06b6d4]" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
