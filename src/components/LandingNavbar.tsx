"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import {
    ChevronDown,
    Globe,
    Menu,
    X
} from "lucide-react";
import { cn } from "~/lib/utils";
import { useLanguage } from "~/contexts/LanguageContext";
import { languageNames, type Language } from "~/lib/translations";
import { LoadingLink } from "./LoadingLink";

export const LandingNavbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Dropdown states
    const [productsOpen, setProductsOpen] = useState(false);
    const [solutionsOpen, setSolutionsOpen] = useState(false);
    const [langDropdownOpen, setLangDropdownOpen] = useState(false);
    const [mobileLangOpen, setMobileLangOpen] = useState(false);
    const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
    const [mobileSolutionsOpen, setMobileSolutionsOpen] = useState(false);
    
    const { language, setLanguage, t } = useLanguage();

    useEffect(() => {
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    setIsScrolled(window.scrollY > 10);
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-2 md:pt-4 px-2 md:px-4">
            <nav
                className={cn(
                    "flex w-full items-center justify-between rounded-full bg-white/80 pl-3 md:pl-6 pr-2 py-2 md:py-2.5 backdrop-blur-md transition-all duration-300 border border-white/50",
                    isScrolled ? "max-w-6xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/90" : "max-w-7xl bg-transparent border-transparent"
                )}
            >
                {/* Left: Branding & Links */}
                <div className="flex items-center gap-2 md:gap-8">
                    <Link href="/" className="flex items-center gap-2 group shrink-0">
                        <div className="flex items-center justify-center transition group-hover:scale-105">
                            <Image
                                src="/logo.png"
                                alt="PPTMaster Logo"
                                width={100}
                                height={35}
                                className="h-6 md:h-8 lg:h-10 w-auto object-contain"
                            />
                        </div>
                    </Link>

                    <div className="hidden items-center gap-1 md:flex">
                        {/* Products Dropdown */}
                        <div
                            className="relative"
                            onMouseEnter={() => setProductsOpen(true)}
                            onMouseLeave={() => setProductsOpen(false)}
                        >
                            <button className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100/50 hover:text-slate-900">
                                {t.products} <ChevronDown className={cn("h-4 w-4 transition-transform", productsOpen && "rotate-180")} />
                            </button>
                            {productsOpen && (
                                <div className="absolute top-full left-0 pt-2 w-64 animate-fade-in-up [animation-duration:0.2s] origin-top">
                                    <div className="rounded-2xl border border-slate-100 bg-white p-2 shadow-xl">
                                        <LoadingLink href="/dashboard" className="flex items-start gap-3 rounded-xl p-3 hover:bg-slate-50">
                                            <div>
                                                <div className="font-semibold text-slate-900">{t.aiPresentations}</div>
                                                <div className="text-xs text-slate-500">{t.aiPresentationsDesc}</div>
                                            </div>
                                        </LoadingLink>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Solutions Dropdown */}
                        <div
                            className="relative"
                            onMouseEnter={() => setSolutionsOpen(true)}
                            onMouseLeave={() => setSolutionsOpen(false)}
                        >
                            <button className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100/50 hover:text-slate-900">
                                {t.solutions} <ChevronDown className={cn("h-4 w-4 transition-transform", solutionsOpen && "rotate-180")} />
                            </button>
                            {solutionsOpen && (
                                <div className="absolute top-full left-0 pt-2 w-64 animate-fade-in-up [animation-duration:0.2s] origin-top">
                                    <div className="rounded-2xl border border-slate-100 bg-white p-2 shadow-xl">
                                        <LoadingLink href="/education" className="block rounded-xl p-3 hover:bg-slate-50">
                                            <div className="font-semibold text-slate-900">{t.forEducation}</div>
                                            <div className="text-xs text-slate-500">{t.forEducationDesc}</div>
                                        </LoadingLink>
                                        <LoadingLink href="/community" className="block rounded-xl p-3 hover:bg-slate-50">
                                            <div className="font-semibold text-slate-900">{t.community}</div>
                                            <div className="text-xs text-slate-500">{t.communityDesc || "Join our community"}</div>
                                        </LoadingLink>
                                    </div>
                                </div>
                            )}
                        </div>

                        <LoadingLink href="/about" className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100/50 hover:text-slate-900">{t.about}</LoadingLink>
                        <LoadingLink href="/pricing" className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100/50 hover:text-slate-900">{t.pricing}</LoadingLink>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1 md:gap-2 shrink-0">
                    {/* Language Dropdown */}
                    <div 
                        className="relative hidden lg:block"
                        onMouseEnter={() => setLangDropdownOpen(true)}
                        onMouseLeave={() => setLangDropdownOpen(false)}
                    >
                        <button className="flex items-center gap-1 rounded-full px-2 md:px-3 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-900">
                            <Globe className="h-4 w-4" />
                            <span>{language.toUpperCase()}</span>
                        </button>
                        {langDropdownOpen && (
                            <div className="absolute top-full right-0 pt-2 w-40 animate-fade-in-up [animation-duration:0.2s] origin-top">
                                <div className="rounded-2xl border border-slate-100 bg-white p-2 shadow-xl">
                                    {(Object.keys(languageNames) as Language[]).map((lang) => (
                                        <button
                                            key={lang}
                                            onClick={() => {
                                                setLanguage(lang);
                                                setLangDropdownOpen(false);
                                            }}
                                            className={`w-full text-left rounded-xl px-3 py-2 text-sm transition hover:bg-slate-50 ${
                                                language === lang ? 'bg-slate-100 font-semibold text-slate-900' : 'text-slate-700'
                                            }`}
                                        >
                                            {languageNames[lang]}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="hidden h-4 w-px bg-slate-200 lg:block mx-1"></div>

                    <SignedOut>
                        <SignInButton mode="modal">
                            <button className="hidden rounded-full px-3 md:px-5 py-2 md:py-2.5 text-sm font-semibold text-slate-700 transition hover:text-slate-900 lg:block">
                                {t.login}
                            </button>
                        </SignInButton>
                        <SignInButton mode="modal">
                            <button className="rounded-full bg-black px-3 md:px-4 lg:px-6 py-1.5 md:py-2 lg:py-2.5 text-xs md:text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5 whitespace-nowrap">
                                {t.getStarted}
                            </button>
                        </SignInButton>
                    </SignedOut>
                    <SignedIn>
                        <LoadingLink href="/dashboard" className="hidden lg:block rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5">
                            {t.dashboard}
                        </LoadingLink>
                    </SignedIn>

                    <button className="ml-1 md:ml-2 lg:hidden p-1" onClick={() => setMobileOpen(!mobileOpen)}>
                        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu - Fixed with max-height and scrollable content */}
            {mobileOpen && (
                <div className="absolute top-20 left-4 right-4 z-40 rounded-3xl border border-slate-100 bg-white p-4 shadow-2xl md:hidden origin-top animate-fade-in-up [animation-duration:0.2s] max-h-[calc(100vh-6rem)] overflow-y-auto">
                    <div className="flex flex-col gap-2">
                        {/* Products - Expandable */}
                        <div>
                            <button 
                                onClick={() => setMobileProductsOpen(!mobileProductsOpen)}
                                className="w-full flex items-center justify-between rounded-xl bg-slate-50 p-3 font-semibold text-slate-900"
                            >
                                {t.products}
                                <ChevronDown className={cn("h-4 w-4 transition-transform", mobileProductsOpen && "rotate-180")} />
                            </button>
                            {mobileProductsOpen && (
                                <div className="mt-1 ml-2 space-y-1">
                                    <LoadingLink 
                                        href="/dashboard" 
                                        className="block rounded-lg p-3 hover:bg-slate-50"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        <div className="font-medium text-slate-900">{t.aiPresentations}</div>
                                        <div className="text-xs text-slate-500">{t.aiPresentationsDesc}</div>
                                    </LoadingLink>
                                </div>
                            )}
                        </div>

                        {/* Solutions - Expandable */}
                        <div>
                            <button 
                                onClick={() => setMobileSolutionsOpen(!mobileSolutionsOpen)}
                                className="w-full flex items-center justify-between rounded-xl bg-slate-50 p-3 font-semibold text-slate-900"
                            >
                                {t.solutions}
                                <ChevronDown className={cn("h-4 w-4 transition-transform", mobileSolutionsOpen && "rotate-180")} />
                            </button>
                            {mobileSolutionsOpen && (
                                <div className="mt-1 ml-2 space-y-1">
                                    <LoadingLink 
                                        href="/education" 
                                        className="block rounded-lg p-3 hover:bg-slate-50"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        <div className="font-medium text-slate-900">{t.forEducation}</div>
                                        <div className="text-xs text-slate-500">{t.forEducationDesc}</div>
                                    </LoadingLink>
                                    <LoadingLink 
                                        href="/community" 
                                        className="block rounded-lg p-3 hover:bg-slate-50"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        <div className="font-medium text-slate-900">{t.community}</div>
                                        <div className="text-xs text-slate-500">Join our community</div>
                                    </LoadingLink>
                                </div>
                            )}
                        </div>

                        <LoadingLink href="/about" className="rounded-xl p-3 font-semibold text-slate-600 hover:bg-slate-50" onClick={() => setMobileOpen(false)}>{t.about}</LoadingLink>
                        <LoadingLink href="/pricing" className="rounded-xl p-3 font-semibold text-slate-600 hover:bg-slate-50" onClick={() => setMobileOpen(false)}>{t.pricing}</LoadingLink>

                        {/* Mobile Language Selector - Collapsible */}
                        <div className="border-t border-slate-100 pt-2 mt-2">
                            <button 
                                onClick={() => setMobileLangOpen(!mobileLangOpen)}
                                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50"
                            >
                                <div className="flex items-center gap-2">
                                    <Globe className="h-4 w-4 text-slate-500" />
                                    <span className="text-sm font-semibold text-slate-700">{languageNames[language]}</span>
                                </div>
                                <ChevronDown className={cn("h-4 w-4 text-slate-500 transition-transform", mobileLangOpen && "rotate-180")} />
                            </button>
                            
                            {mobileLangOpen && (
                                <div className="mt-1 grid grid-cols-2 gap-1 px-1">
                                    {(Object.keys(languageNames) as Language[]).map((lang) => (
                                        <button
                                            key={lang}
                                            onClick={() => {
                                                setLanguage(lang);
                                                setMobileLangOpen(false);
                                            }}
                                            className={`text-left rounded-lg px-3 py-2 text-sm transition ${
                                                language === lang ? 'bg-slate-100 font-semibold text-slate-900' : 'text-slate-600 hover:bg-slate-50'
                                            }`}
                                        >
                                            {languageNames[lang]}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <SignedIn>
                            <div className="mt-2 text-center">
                                <LoadingLink href="/dashboard" className="block w-full rounded-xl bg-black py-3 font-bold text-white" onClick={() => setMobileOpen(false)}>
                                    {t.dashboard}
                                </LoadingLink>
                            </div>
                        </SignedIn>
                        <SignedOut>
                            <div className="mt-2 text-center">
                                <SignInButton mode="modal">
                                    <button className="block w-full rounded-xl bg-black py-3 font-bold text-white">
                                        {t.login}
                                    </button>
                                </SignInButton>
                            </div>
                        </SignedOut>
                    </div>
                </div>
            )}
        </div>
    );
};
