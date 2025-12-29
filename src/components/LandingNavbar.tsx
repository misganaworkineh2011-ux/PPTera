"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { ChevronDown, Menu, X, Globe } from "lucide-react";
import { cn } from "~/lib/utils";
import { LoadingLink } from "./LoadingLink";
import { useLanguage } from "~/contexts/LanguageContext";
import type { Language } from "~/lib/translations";

const languages: { code: Language; name: string; flag: string }[] = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "pt", name: "Português", flag: "🇧🇷" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
];

export const LandingNavbar = () => {
  const { language, setLanguage, t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [communityOpen, setCommunityOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);

  const currentLang = languages.find(l => l.code === language) || languages[0];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-200",
      isScrolled ? "bg-white border-b border-zinc-200" : "bg-white"
    )}>
      <nav className="mx-auto max-w-[1400px] px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Logo & Nav */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="PPTMaster"
                width={140}
                height={40}
                className="h-9 w-auto"
              />
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {/* Products Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setProductsOpen(true)}
                onMouseLeave={() => setProductsOpen(false)}
              >
                <button className="flex items-center gap-1.5 px-4 py-2.5 text-[15px] text-zinc-700 hover:text-zinc-900 transition">
                  {t.navProducts || "Products"}
                  <ChevronDown className={cn("h-4 w-4 transition-transform", productsOpen && "rotate-180")} />
                </button>
                {productsOpen && (
                  <div className="absolute top-full left-0 pt-2 w-72">
                    <div className="bg-white rounded-xl border border-zinc-200 shadow-xl py-2">
                      <SignedOut>
                        <SignInButton mode="modal">
                          <button className="block w-full text-left px-5 py-3 text-[15px] text-zinc-700 hover:bg-zinc-50 transition">
                            {t.navAIPresentations || "AI Presentations"}
                          </button>
                        </SignInButton>
                        <SignInButton mode="modal">
                          <button className="block w-full text-left px-5 py-3 text-[15px] text-zinc-700 hover:bg-zinc-50 transition">
                            {t.navThemes || "Themes"}
                          </button>
                        </SignInButton>
                      </SignedOut>
                      <SignedIn>
                        <LoadingLink href="/" className="block px-5 py-3 text-[15px] text-zinc-700 hover:bg-zinc-50 transition">
                          {t.navAIPresentations || "AI Presentations"}
                        </LoadingLink>
                        <LoadingLink href="/dashboard/themes" className="block px-5 py-3 text-[15px] text-zinc-700 hover:bg-zinc-50 transition">
                          {t.navThemes || "Themes"}
                        </LoadingLink>
                      </SignedIn>
                      <LoadingLink href="/inspiration" className="block px-5 py-3 text-[15px] text-zinc-700 hover:bg-zinc-50 transition">
                        {t.navTemplates || "Templates"}
                      </LoadingLink>
                    </div>
                  </div>
                )}
              </div>

              {/* Solutions Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setCommunityOpen(true)}
                onMouseLeave={() => setCommunityOpen(false)}
              >
                <button className="flex items-center gap-1.5 px-4 py-2.5 text-[15px] text-zinc-700 hover:text-zinc-900 transition">
                  {t.navSolutions || "Solutions"}
                  <ChevronDown className={cn("h-4 w-4 transition-transform", communityOpen && "rotate-180")} />
                </button>
                {communityOpen && (
                  <div className="absolute top-full left-0 pt-2 w-72">
                    <div className="bg-white rounded-xl border border-zinc-200 shadow-xl py-2">
                      <LoadingLink href="/education" className="block px-5 py-3 text-[15px] text-zinc-700 hover:bg-zinc-50 transition">
                        {t.navForEducation || "For Education"}
                      </LoadingLink>
                      <LoadingLink href="/community" className="block px-5 py-3 text-[15px] text-zinc-700 hover:bg-zinc-50 transition">
                        {t.navCommunity || "Community"}
                      </LoadingLink>
                    </div>
                  </div>
                )}
              </div>

              {/* Resources Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setResourcesOpen(true)}
                onMouseLeave={() => setResourcesOpen(false)}
              >
                <button className="flex items-center gap-1.5 px-4 py-2.5 text-[15px] text-zinc-700 hover:text-zinc-900 transition">
                  {t.navResources || "Resources"}
                  <ChevronDown className={cn("h-4 w-4 transition-transform", resourcesOpen && "rotate-180")} />
                </button>
                {resourcesOpen && (
                  <div className="absolute top-full left-0 pt-2 w-72">
                    <div className="bg-white rounded-xl border border-zinc-200 shadow-xl py-2">
                      <LoadingLink href="/prompt-guide" className="block px-5 py-3 text-[15px] text-zinc-700 hover:bg-zinc-50 transition">
                        {t.navPromptGuide || "Prompt Guide"}
                      </LoadingLink>
                      <LoadingLink href="/insights" className="block px-5 py-3 text-[15px] text-zinc-700 hover:bg-zinc-50 transition">
                        {t.navBlog || "Blog"}
                      </LoadingLink>
                      <LoadingLink href="/developer-docs" className="block px-5 py-3 text-[15px] text-zinc-700 hover:bg-zinc-50 transition">
                        {t.navDeveloperDocs || "Developer Docs"}
                      </LoadingLink>
                      <LoadingLink href="/help" className="block px-5 py-3 text-[15px] text-zinc-700 hover:bg-zinc-50 transition">
                        {t.navHelpCenter || "Help Center"}
                      </LoadingLink>
                    </div>
                  </div>
                )}
              </div>

              <LoadingLink href="/pricing" className="px-4 py-2.5 text-[15px] text-zinc-700 hover:text-zinc-900 transition">
                {t.navPricing || "Pricing"}
              </LoadingLink>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div
              className="relative hidden lg:block"
              onMouseEnter={() => setLanguageOpen(true)}
              onMouseLeave={() => setLanguageOpen(false)}
            >
              <button className="flex items-center gap-2 px-4 py-2.5 text-[15px] text-zinc-700 hover:text-zinc-900 transition">
                <Globe className="h-4 w-4" />
                <span className="font-medium">{currentLang?.code.toUpperCase()}</span>
                <ChevronDown className={cn("h-4 w-4 transition-transform", languageOpen && "rotate-180")} />
              </button>
              {languageOpen && (
                <div className="absolute top-full right-0 pt-2 w-48">
                  <div className="bg-white rounded-xl border border-zinc-200 shadow-xl py-2 max-h-80 overflow-y-auto">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setLanguageOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-2.5 text-[15px] hover:bg-zinc-50 transition text-left",
                          language === lang.code ? "text-zinc-900 bg-zinc-50" : "text-zinc-600"
                        )}
                      >
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <SignedOut>
              <SignInButton mode="modal">
                <button className="hidden lg:block px-4 py-2.5 text-[15px] text-zinc-700 hover:text-zinc-900 transition">
                  {t.navLogin || "Log in"}
                </button>
              </SignInButton>
              <SignInButton mode="modal">
                <button className="px-5 py-2.5 text-[15px] font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition">
                  {t.navGetStarted || "Get started for free"}
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <LoadingLink 
                href="/" 
                className="px-5 py-2.5 text-[15px] font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition"
              >
                {t.navDashboard || "Dashboard"}
              </LoadingLink>
            </SignedIn>

            <button 
              className="lg:hidden p-2 text-zinc-600"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-zinc-200 px-6 py-6">
          <div className="flex flex-col gap-2">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="py-3 text-lg text-zinc-900 font-medium text-left" onClick={() => setMobileOpen(false)}>
                  {t.navAIPresentations || "AI Presentations"}
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <LoadingLink href="/" className="py-3 text-lg text-zinc-900 font-medium" onClick={() => setMobileOpen(false)}>
                {t.navAIPresentations || "AI Presentations"}
              </LoadingLink>
            </SignedIn>
            <LoadingLink href="/inspiration" className="py-3 text-lg text-zinc-600" onClick={() => setMobileOpen(false)}>
              {t.navTemplates || "Templates"}
            </LoadingLink>
            <LoadingLink href="/education" className="py-3 text-lg text-zinc-600" onClick={() => setMobileOpen(false)}>
              {t.navForEducation || "For Education"}
            </LoadingLink>
            <LoadingLink href="/community" className="py-3 text-lg text-zinc-600" onClick={() => setMobileOpen(false)}>
              {t.navCommunity || "Community"}
            </LoadingLink>
            <LoadingLink href="/pricing" className="py-3 text-lg text-zinc-600" onClick={() => setMobileOpen(false)}>
              {t.navPricing || "Pricing"}
            </LoadingLink>
            
            {/* Mobile Language Selector */}
            <div className="py-3 border-t border-zinc-100 mt-2">
              <p className="text-sm text-zinc-500 mb-2">{t.navLanguage || "Language"}</p>
              <div className="grid grid-cols-3 gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={cn(
                      "flex items-center justify-center px-3 py-2 text-sm rounded-lg transition",
                      language === lang.code 
                        ? "bg-zinc-900 text-white" 
                        : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                    )}
                  >
                    <span className="truncate">{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-200 mt-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="w-full py-4 text-base font-medium text-white bg-zinc-900 rounded-lg">
                    {t.navGetStarted || "Get started for free"}
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <LoadingLink 
                  href="/" 
                  className="block w-full py-4 text-base font-medium text-center text-white bg-zinc-900 rounded-lg"
                  onClick={() => setMobileOpen(false)}
                >
                  {t.navDashboard || "Dashboard"}
                </LoadingLink>
              </SignedIn>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
