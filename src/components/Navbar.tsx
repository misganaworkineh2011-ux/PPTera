"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ChevronDown, Menu, X, Globe } from "lucide-react";
import { useLanguage } from "~/contexts/LanguageContext";
import { languageNames, type Language } from "~/lib/translations";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-slate-100 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="PPTMaster"
              width={120}
              height={34}
              className="h-8 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-1 lg:flex">
            <div className="group relative">
              <button className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-[#1e3a8a]">
                {t.products}
                <ChevronDown className="h-4 w-4 transition group-hover:rotate-180" />
              </button>
              <div className="invisible absolute left-0 top-full pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
                <div className="w-64 rounded-2xl border border-slate-100 bg-white p-3 shadow-xl">
                  <Link href="/dashboard" className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-slate-50">
                    <div>
                      <div className="font-semibold text-slate-900">{t.aiPresentations}</div>
                      <div className="text-xs text-slate-500">{t.aiPresentationsDesc}</div>
                    </div>
                  </Link>
                  <Link href="/dashboard" className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-slate-50">
                    <div>
                      <div className="font-semibold text-slate-900">{t.templates}</div>
                      <div className="text-xs text-slate-500">{t.templatesDesc}</div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            <div className="group relative">
              <button className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-[#1e3a8a]">
                {t.solutions}
                <ChevronDown className="h-4 w-4 transition group-hover:rotate-180" />
              </button>
              <div className="invisible absolute left-0 top-full pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
                <div className="w-64 rounded-2xl border border-slate-100 bg-white p-3 shadow-xl">
                  <Link href="/education" className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-slate-50">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
                      <span className="text-lg text-white">🏢</span>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{t.forBusiness}</div>
                      <div className="text-xs text-slate-500">{t.forBusinessDesc}</div>
                    </div>
                  </Link>
                  <Link href="/education" className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-slate-50">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
                      <span className="text-lg text-white">🎓</span>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{t.forEducation}</div>
                      <div className="text-xs text-slate-500">{t.forEducationDesc}</div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            <Link href="/pricing" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-[#1e3a8a]">
              {t.pricing}
            </Link>
            <Link href="/about" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-[#1e3a8a]">
              {t.about}
            </Link>

            {/* Language Dropdown */}
            <div className="group relative">
              <button 
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-[#1e3a8a]"
              >
                <Globe className="h-4 w-4" />
                {languageNames[language]}
                <ChevronDown className="h-4 w-4 transition group-hover:rotate-180" />
              </button>
              <div className={`${langDropdownOpen ? 'visible opacity-100' : 'invisible opacity-0'} absolute right-0 top-full pt-2 transition-all`}>
                <div className="w-48 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl">
                  {(Object.keys(languageNames) as Language[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setLanguage(lang);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left rounded-xl px-4 py-2 text-sm transition hover:bg-slate-50 ${
                        language === lang ? 'bg-slate-100 font-semibold text-slate-900' : 'text-slate-700'
                      }`}
                    >
                      {languageNames[lang]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="hidden text-sm font-medium text-slate-700 transition hover:text-[#1e3a8a] lg:block">
                  {t.login}
                </button>
              </SignInButton>
              <SignInButton mode="modal">
                <button className="rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#06b6d4]/25 transition hover:shadow-xl hover:shadow-[#06b6d4]/30">
                  {t.getStarted}
                </button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <Link
                href="/dashboard"
                className="rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#06b6d4]/25 transition hover:shadow-xl hover:shadow-[#06b6d4]/30"
              >
                {t.dashboard}
              </Link>
              <UserButton />
            </SignedIn>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-lg p-2 text-slate-700 lg:hidden"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="border-t border-slate-100 py-4 lg:hidden">
            <div className="space-y-2">
              <Link href="/dashboard" className="block rounded-lg px-4 py-2 text-sm font-medium text-slate-700">
                {t.products}
              </Link>
              <Link href="/education" className="block rounded-lg px-4 py-2 text-sm font-medium text-slate-700">
                {t.solutions}
              </Link>
              <Link href="/pricing" className="block rounded-lg px-4 py-2 text-sm font-medium text-slate-700">
                {t.pricing}
              </Link>
              <Link href="/about" className="block rounded-lg px-4 py-2 text-sm font-medium text-slate-700">
                {t.about}
              </Link>
              
              {/* Mobile Language Selector */}
              <div className="border-t border-slate-100 pt-2 mt-2">
                <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Language</div>
                {(Object.keys(languageNames) as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setLanguage(lang);
                      setMobileOpen(false);
                    }}
                    className={`w-full text-left rounded-lg px-4 py-2 text-sm transition ${
                      language === lang ? 'bg-slate-100 font-semibold text-slate-900' : 'text-slate-700'
                    }`}
                  >
                    {languageNames[lang]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
