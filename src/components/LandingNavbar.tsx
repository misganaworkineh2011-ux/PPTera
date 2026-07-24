"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { SignedIn, SignedOut } from "~/lib/auth-compat";
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
      isScrolled ? "bg-[#070b14]/85 backdrop-blur-xl border-b border-white/10" : "bg-transparent"
    )}>
      <nav className="mx-auto max-w-[1400px] px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Logo & Nav */}
          <div className="flex items-center gap-8">
            <Link href={localPath("/")} className="flex items-center">
              <Image
                src="/logo.png"
                alt="PPTera"
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
                <button className="flex items-center gap-1.5 px-4 py-2.5 text-[15px] text-slate-300 hover:text-white transition">
                  {t.navProducts || "Products"}
                  <ChevronDown className={cn("h-4 w-4 transition-transform", productsOpen && "rotate-180")} />
                </button>
                {productsOpen && (
                  <div className="absolute top-full left-0 pt-2 w-72">
                    <div className="bg-[#0b1120]/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl shadow-black/50 py-2">
                      <SignedOut>
                        <LoadingLink href="/sign-in" className="block w-full text-left px-5 py-3 text-[15px] text-slate-300 hover:bg-white/5 hover:text-white transition">
                            {t.navAIPresentations || "AI Presentations"}
                          </LoadingLink>
                        <LoadingLink href="/sign-in" className="block w-full text-left px-5 py-3 text-[15px] text-slate-300 hover:bg-white/5 hover:text-white transition">
                            {t.navThemes || "Themes"}
                          </LoadingLink>
                      </SignedOut>
                      <SignedIn>
                        <LoadingLink href="/" className="block px-5 py-3 text-[15px] text-slate-300 hover:bg-white/5 hover:text-white transition">
                          {t.navAIPresentations || "AI Presentations"}
                        </LoadingLink>
                        <LoadingLink href="/dashboard/themes" className="block px-5 py-3 text-[15px] text-slate-300 hover:bg-white/5 hover:text-white transition">
                          {t.navThemes || "Themes"}
                        </LoadingLink>
                      </SignedIn>
                      <LoadingLink href={localPath("/inspiration")} className="block px-5 py-3 text-[15px] text-slate-300 hover:bg-white/5 hover:text-white transition">
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
                <button className="flex items-center gap-1.5 px-4 py-2.5 text-[15px] text-slate-300 hover:text-white transition">
                  {t.navSolutions || "Solutions"}
                  <ChevronDown className={cn("h-4 w-4 transition-transform", communityOpen && "rotate-180")} />
                </button>
                {communityOpen && (
                  <div className="absolute top-full left-0 pt-2 w-72">
                    <div className="bg-[#0b1120]/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl shadow-black/50 py-2">
                      <LoadingLink href={localPath("/education")} className="block px-5 py-3 text-[15px] text-slate-300 hover:bg-white/5 hover:text-white transition">
                        {t.navForEducation || "For Education"}
                      </LoadingLink>
                      <LoadingLink href={localPath("/community")} className="block px-5 py-3 text-[15px] text-slate-300 hover:bg-white/5 hover:text-white transition">
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
                <button className="flex items-center gap-1.5 px-4 py-2.5 text-[15px] text-slate-300 hover:text-white transition">
                  {t.navResources || "Resources"}
                  <ChevronDown className={cn("h-4 w-4 transition-transform", resourcesOpen && "rotate-180")} />
                </button>
                {resourcesOpen && (
                  <div className="absolute top-full left-0 pt-2 w-72">
                    <div className="bg-[#0b1120]/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl shadow-black/50 py-2">
                      <LoadingLink href={localPath("/prompt-guide")} className="block px-5 py-3 text-[15px] text-slate-300 hover:bg-white/5 hover:text-white transition">
                        {t.navPromptGuide || "Prompt Guide"}
                      </LoadingLink>
                      <LoadingLink href={localPath("/insights")} className="block px-5 py-3 text-[15px] text-slate-300 hover:bg-white/5 hover:text-white transition">
                        {t.navBlog || "Blog"}
                      </LoadingLink>
                      <LoadingLink href={localPath("/help")} className="block px-5 py-3 text-[15px] text-slate-300 hover:bg-white/5 hover:text-white transition">
                        {t.navHelpCenter || "Help Center"}
                      </LoadingLink>
                    </div>
                  </div>
                )}
              </div>

              <LoadingLink href={localPath("/pricing")} className="px-4 py-2.5 text-[15px] text-slate-300 hover:text-white transition">
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
              <LoadingLink href="/sign-in" className="hidden lg:block px-4 py-2.5 text-[15px] text-slate-300 hover:text-white transition">
                  {t.navLogin || "Log in"}
                </LoadingLink>
              <LoadingLink href="/sign-up" className="px-5 py-2.5 text-[15px] font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-500 rounded-lg shadow-lg shadow-teal-500/20 hover:brightness-110 transition">
                  Sign up
                </LoadingLink>
            </SignedOut>
            <SignedIn>
              <LoadingLink 
                href="/" 
                className="px-5 py-2.5 text-[15px] font-medium text-white bg-white/10 border border-white/15 rounded-lg hover:bg-white/15 transition"
              >
                {t.navDashboard || "Dashboard"}
              </LoadingLink>
            </SignedIn>

            <button 
              className="lg:hidden p-2 text-slate-300"
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
        <div className="lg:hidden fixed inset-0 top-16 bg-[#070b14]/[0.98] backdrop-blur-xl z-40 overflow-y-auto">
          <div className="px-6 py-4">
            {/* Products Section */}
            <div className="border-b border-white/10 pb-3">
              <button
                onClick={() => setProductsOpen(!productsOpen)}
                className="w-full flex items-center justify-between py-3 text-base font-medium text-white"
              >
                {t.navProducts || "Products"}
                <ChevronDown className={cn("h-5 w-5 text-slate-500 transition-transform", productsOpen && "rotate-180")} />
              </button>
              {productsOpen && (
                <div className="pl-4 space-y-1 pb-2">
                  <SignedOut>
                    <LoadingLink href="/sign-in" className="block w-full text-left py-2 text-sm text-slate-400" onClick={() => setMobileOpen(false)}>
                        {t.navAIPresentations || "AI Presentations"}
                      </LoadingLink>
                    <LoadingLink href="/sign-in" className="block w-full text-left py-2 text-sm text-slate-400" onClick={() => setMobileOpen(false)}>
                        {t.navThemes || "Themes"}
                      </LoadingLink>
                  </SignedOut>
                  <SignedIn>
                    <LoadingLink href="/" className="block py-2 text-sm text-slate-400" onClick={() => setMobileOpen(false)}>
                      {t.navAIPresentations || "AI Presentations"}
                    </LoadingLink>
                    <LoadingLink href="/dashboard/themes" className="block py-2 text-sm text-slate-400" onClick={() => setMobileOpen(false)}>
                      {t.navThemes || "Themes"}
                    </LoadingLink>
                  </SignedIn>
                  <LoadingLink href={localPath("/inspiration")} className="block py-2 text-sm text-slate-400" onClick={() => setMobileOpen(false)}>
                    {t.navTemplates || "Templates"}
                  </LoadingLink>
                </div>
              )}
            </div>

            {/* Solutions Section */}
            <div className="border-b border-white/10 pb-3">
              <button
                onClick={() => setCommunityOpen(!communityOpen)}
                className="w-full flex items-center justify-between py-3 text-base font-medium text-white"
              >
                {t.navSolutions || "Solutions"}
                <ChevronDown className={cn("h-5 w-5 text-slate-500 transition-transform", communityOpen && "rotate-180")} />
              </button>
              {communityOpen && (
                <div className="pl-4 space-y-1 pb-2">
                  <LoadingLink href={localPath("/education")} className="block py-2 text-sm text-slate-400" onClick={() => setMobileOpen(false)}>
                    {t.navForEducation || "For Education"}
                  </LoadingLink>
                  <LoadingLink href={localPath("/community")} className="block py-2 text-sm text-slate-400" onClick={() => setMobileOpen(false)}>
                    {t.navCommunity || "Community"}
                  </LoadingLink>
                </div>
              )}
            </div>

            {/* Resources Section */}
            <div className="border-b border-white/10 pb-3">
              <button
                onClick={() => setResourcesOpen(!resourcesOpen)}
                className="w-full flex items-center justify-between py-3 text-base font-medium text-white"
              >
                {t.navResources || "Resources"}
                <ChevronDown className={cn("h-5 w-5 text-slate-500 transition-transform", resourcesOpen && "rotate-180")} />
              </button>
              {resourcesOpen && (
                <div className="pl-4 space-y-1 pb-2">
                  <LoadingLink href={localPath("/prompt-guide")} className="block py-2 text-sm text-slate-400" onClick={() => setMobileOpen(false)}>
                    {t.navPromptGuide || "Prompt Guide"}
                  </LoadingLink>
                  <LoadingLink href={localPath("/insights")} className="block py-2 text-sm text-slate-400" onClick={() => setMobileOpen(false)}>
                    {t.navBlog || "Blog"}
                  </LoadingLink>
                  <LoadingLink href={localPath("/help")} className="block py-2 text-sm text-slate-400" onClick={() => setMobileOpen(false)}>
                    {t.navHelpCenter || "Help Center"}
                  </LoadingLink>
                </div>
              )}
            </div>

            {/* Pricing - Direct Link */}
            <LoadingLink 
              href={localPath("/pricing")} 
              className="block py-3 text-base font-medium text-white border-b border-white/10" 
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
                <LoadingLink href="/sign-in" 
                    className="w-full py-3 text-base font-medium text-white bg-gradient-to-r from-[#0f766e] to-[#14b8a6] rounded-lg hover:opacity-90"
                    onClick={() => setMobileOpen(false)}
                  >
                    Sign up
                  </LoadingLink>
              </SignedOut>
              <SignedIn>
                <LoadingLink 
                  href="/" 
                  className="block w-full py-3 text-base font-medium text-center text-white bg-gradient-to-r from-emerald-600 to-teal-500 rounded-lg shadow-lg shadow-teal-500/20"
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
