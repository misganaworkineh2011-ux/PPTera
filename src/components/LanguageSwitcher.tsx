"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Globe, Check, ChevronDown } from "lucide-react";
import {
  SUPPORTED_LANGUAGES,
  LANGUAGE_NAMES,
  DEFAULT_LANGUAGE,
  type Language,
} from "~/lib/i18n";

interface LanguageSwitcherProps {
  currentLang: Language;
  variant?: "dropdown" | "grid"; // grid for mobile menu
}

export function LanguageSwitcher({
  currentLang,
  variant = "dropdown",
}: LanguageSwitcherProps) {
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
    let pathWithoutLang = pathname;

    const langMatch = pathname.match(/^\/([a-z]{2})(\/|$)/);
    if (
      langMatch &&
      SUPPORTED_LANGUAGES.includes(langMatch[1] as Language) &&
      langMatch[1] !== "en"
    ) {
      pathWithoutLang = pathname.replace(`/${langMatch[1]}`, "") || "/";
    }

    let newPath: string;
    if (newLang === DEFAULT_LANGUAGE) {
      newPath = pathWithoutLang || "/";
    } else {
      newPath = `/${newLang}${pathWithoutLang === "/" ? "" : pathWithoutLang}`;
    }

    document.cookie = `NEXT_LOCALE=${newLang}; path=/; max-age=31536000`;
    router.push(newPath);
    setIsOpen(false);
  };

  // Grid variant for mobile menu - shows all languages in a scrollable grid
  if (variant === "grid") {
    return (
      <div className="w-full">
        <div className="flex items-center gap-2 mb-3 text-sm text-slate-500">
          <Globe className="h-4 w-4" />
          <span>Language</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang}
              onClick={() => switchLanguage(lang)}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                lang === currentLang
                  ? "bg-teal-50 text-teal-700 border border-teal-200"
                  : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-transparent"
              }`}
            >
              <span>{LANGUAGE_NAMES[lang].flag}</span>
              <span className="truncate">{LANGUAGE_NAMES[lang].short || lang.toUpperCase()}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Default dropdown variant
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
        <span>{LANGUAGE_NAMES[currentLang].name}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-slate-200 bg-white shadow-lg z-50 overflow-hidden max-h-80 overflow-y-auto">
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
                  <Check className="h-4 w-4 text-[#14b8a6]" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
