"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { ChevronDown, Menu, X } from "lucide-react";
import { cn } from "~/lib/utils";
import { LoadingLink } from "./LoadingLink";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { getTranslations, type Language } from "~/lib/i18n";

interface LandingNavbarProps {
  currentLang: Language;
}

// Helper to get localized path - English uses root, others use /[lang]/
function getLocalizedPath(path: string, lang: Language): string {
  if (lang === "en") {
    return path; // English uses root path
  }
  return `/${lang}${path}`;
}

export const LandingNavbar = ({ currentLang }: LandingNavbarProps) => {
  const t = getTranslations(currentLang);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [communityOpen, setCommunityOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  
  // Helper for this component
  const localPath = (path: string) => getLocalizedPath(path, currentLang);
  
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
            <Link href={localPath("/")} className="flex items-center">
              <Image
                src="/logo.png"
                alt="PPTMaster"
                width={180}
                height={48}
                className="h-12 w-auto"
                priority
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
                      <LoadingLink href={localPath("/inspiration")} className="block px-5 py-3 text-[15px] text-zinc-700 hover:bg-zinc-50 transition">
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
                      <LoadingLink href={localPath("/education")} className="block px-5 py-3 text-[15px] text-zinc-700 hover:bg-zinc-50 transition">
                        {t.navForEducation || "For Education"}
                      </LoadingLink>
                      <LoadingLink href={localPath("/community")} className="block px-5 py-3 text-[15px] text-zinc-700 hover:bg-zinc-50 transition">
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
                      <LoadingLink href={localPath("/prompt-guide")} className="block px-5 py-3 text-[15px] text-zinc-700 hover:bg-zinc-50 transition">
                        {t.navPromptGuide || "Prompt Guide"}
                      </LoadingLink>
                      <LoadingLink href={localPath("/insights")} className="block px-5 py-3 text-[15px] text-zinc-700 hover:bg-zinc-50 transition">
                        {t.navBlog || "Blog"}
                      </LoadingLink>
                      <LoadingLink href={localPath("/help")} className="block px-5 py-3 text-[15px] text-zinc-700 hover:bg-zinc-50 transition">
                        {t.navHelpCenter || "Help Center"}
                      </LoadingLink>
                    </div>
                  </div>
                )}
              </div>

              <LoadingLink href={localPath("/pricing")} className="px-4 py-2.5 text-[15px] text-zinc-700 hover:text-zinc-900 transition">
                {t.navPricing || "Pricing"}
              </LoadingLink>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="hidden lg:block">
              <LanguageSwitcher currentLang={currentLang} />
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
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu - Full screen overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 top-16 bg-white z-40 overflow-y-auto">
          <div className="px-6 py-4">
            {/* Products Section */}
            <div className="border-b border-zinc-100 pb-3">
              <button
                onClick={() => setProductsOpen(!productsOpen)}
                className="w-full flex items-center justify-between py-3 text-base font-medium text-zinc-900"
              >
                {t.navProducts || "Products"}
                <ChevronDown className={cn("h-5 w-5 text-zinc-400 transition-transform", productsOpen && "rotate-180")} />
              </button>
              {productsOpen && (
                <div className="pl-4 space-y-1 pb-2">
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button className="block w-full text-left py-2 text-sm text-zinc-600" onClick={() => setMobileOpen(false)}>
                        {t.navAIPresentations || "AI Presentations"}
                      </button>
                    </SignInButton>
                    <SignInButton mode="modal">
                      <button className="block w-full text-left py-2 text-sm text-zinc-600" onClick={() => setMobileOpen(false)}>
                        {t.navThemes || "Themes"}
                      </button>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    <LoadingLink href="/" className="block py-2 text-sm text-zinc-600" onClick={() => setMobileOpen(false)}>
                      {t.navAIPresentations || "AI Presentations"}
                    </LoadingLink>
                    <LoadingLink href="/dashboard/themes" className="block py-2 text-sm text-zinc-600" onClick={() => setMobileOpen(false)}>
                      {t.navThemes || "Themes"}
                    </LoadingLink>
                  </SignedIn>
                  <LoadingLink href={localPath("/inspiration")} className="block py-2 text-sm text-zinc-600" onClick={() => setMobileOpen(false)}>
                    {t.navTemplates || "Templates"}
                  </LoadingLink>
                </div>
              )}
            </div>

            {/* Solutions Section */}
            <div className="border-b border-zinc-100 pb-3">
              <button
                onClick={() => setCommunityOpen(!communityOpen)}
                className="w-full flex items-center justify-between py-3 text-base font-medium text-zinc-900"
              >
                {t.navSolutions || "Solutions"}
                <ChevronDown className={cn("h-5 w-5 text-zinc-400 transition-transform", communityOpen && "rotate-180")} />
              </button>
              {communityOpen && (
                <div className="pl-4 space-y-1 pb-2">
                  <LoadingLink href={localPath("/education")} className="block py-2 text-sm text-zinc-600" onClick={() => setMobileOpen(false)}>
                    {t.navForEducation || "For Education"}
                  </LoadingLink>
                  <LoadingLink href={localPath("/community")} className="block py-2 text-sm text-zinc-600" onClick={() => setMobileOpen(false)}>
                    {t.navCommunity || "Community"}
                  </LoadingLink>
                </div>
              )}
            </div>

            {/* Resources Section */}
            <div className="border-b border-zinc-100 pb-3">
              <button
                onClick={() => setResourcesOpen(!resourcesOpen)}
                className="w-full flex items-center justify-between py-3 text-base font-medium text-zinc-900"
              >
                {t.navResources || "Resources"}
                <ChevronDown className={cn("h-5 w-5 text-zinc-400 transition-transform", resourcesOpen && "rotate-180")} />
              </button>
              {resourcesOpen && (
                <div className="pl-4 space-y-1 pb-2">
                  <LoadingLink href={localPath("/prompt-guide")} className="block py-2 text-sm text-zinc-600" onClick={() => setMobileOpen(false)}>
                    {t.navPromptGuide || "Prompt Guide"}
                  </LoadingLink>
                  <LoadingLink href={localPath("/insights")} className="block py-2 text-sm text-zinc-600" onClick={() => setMobileOpen(false)}>
                    {t.navBlog || "Blog"}
                  </LoadingLink>
                  <LoadingLink href={localPath("/help")} className="block py-2 text-sm text-zinc-600" onClick={() => setMobileOpen(false)}>
                    {t.navHelpCenter || "Help Center"}
                  </LoadingLink>
                </div>
              )}
            </div>

            {/* Pricing - Direct Link */}
            <LoadingLink 
              href={localPath("/pricing")} 
              className="block py-3 text-base font-medium text-zinc-900 border-b border-zinc-100" 
              onClick={() => setMobileOpen(false)}
            >
              {t.navPricing || "Pricing"}
            </LoadingLink>

            {/* Language Selector */}
            <div className="mt-4 pt-4">
              <LanguageSwitcher currentLang={currentLang} variant="grid" />
            </div>

            {/* CTA Button */}
            <div className="mt-6">
              <SignedOut>
                <SignInButton mode="modal">
                  <button 
                    className="w-full py-3 text-base font-medium text-white bg-zinc-900 rounded-lg"
                    onClick={() => setMobileOpen(false)}
                  >
                    {t.navGetStarted || "Get started free"}
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <LoadingLink 
                  href="/" 
                  className="block w-full py-3 text-base font-medium text-center text-white bg-zinc-900 rounded-lg"
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
