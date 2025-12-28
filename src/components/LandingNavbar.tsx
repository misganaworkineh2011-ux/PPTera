"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { ChevronDown, Menu, X } from "lucide-react";
import { cn } from "~/lib/utils";
import { useLanguage } from "~/contexts/LanguageContext";
import { LoadingLink } from "./LoadingLink";

export const LandingNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [communityOpen, setCommunityOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);

  const { t } = useLanguage();

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
        <div className="flex h-14 items-center justify-between">
          {/* Left: Logo & Nav */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="PPTMaster"
                width={120}
                height={32}
                className="h-7 w-auto"
              />
            </Link>

            <div className="hidden lg:flex items-center">
              {/* Products Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setProductsOpen(true)}
                onMouseLeave={() => setProductsOpen(false)}
              >
                <button className="flex items-center gap-1 px-3 py-2 text-sm text-zinc-700 hover:text-zinc-900 transition">
                  Products
                  <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", productsOpen && "rotate-180")} />
                </button>
                {productsOpen && (
                  <div className="absolute top-full left-0 pt-1 w-64">
                    <div className="bg-white rounded-lg border border-zinc-200 shadow-lg py-2">
                      <LoadingLink href="/dashboard" className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition">
                        AI Presentations
                      </LoadingLink>
                      <LoadingLink href="/dashboard/themes" className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition">
                        Themes
                      </LoadingLink>
                      <LoadingLink href="/inspiration" className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition">
                        Templates
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
                <button className="flex items-center gap-1 px-3 py-2 text-sm text-zinc-700 hover:text-zinc-900 transition">
                  Solutions
                  <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", communityOpen && "rotate-180")} />
                </button>
                {communityOpen && (
                  <div className="absolute top-full left-0 pt-1 w-64">
                    <div className="bg-white rounded-lg border border-zinc-200 shadow-lg py-2">
                      <LoadingLink href="/education" className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition">
                        For Education
                      </LoadingLink>
                      <LoadingLink href="/community" className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition">
                        Community
                      </LoadingLink>
                    </div>
                  </div>
                )}
              </div>

              {/* Community Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setResourcesOpen(true)}
                onMouseLeave={() => setResourcesOpen(false)}
              >
                <button className="flex items-center gap-1 px-3 py-2 text-sm text-zinc-700 hover:text-zinc-900 transition">
                  Resources
                  <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", resourcesOpen && "rotate-180")} />
                </button>
                {resourcesOpen && (
                  <div className="absolute top-full left-0 pt-1 w-64">
                    <div className="bg-white rounded-lg border border-zinc-200 shadow-lg py-2">
                      <LoadingLink href="/prompt-guide" className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition">
                        Prompt Guide
                      </LoadingLink>
                      <LoadingLink href="/insights" className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition">
                        Blog
                      </LoadingLink>
                      <LoadingLink href="/developer-docs" className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition">
                        Developer Docs
                      </LoadingLink>
                      <LoadingLink href="/help" className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition">
                        Help Center
                      </LoadingLink>
                    </div>
                  </div>
                )}
              </div>

              <LoadingLink href="/pricing" className="px-3 py-2 text-sm text-zinc-700 hover:text-zinc-900 transition">
                Pricing
              </LoadingLink>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="hidden lg:block px-3 py-2 text-sm text-zinc-700 hover:text-zinc-900 transition">
                  Log in
                </button>
              </SignInButton>
              <SignInButton mode="modal">
                <button className="hidden lg:flex items-center px-4 py-2 text-sm text-zinc-700 border border-zinc-300 rounded-md hover:bg-zinc-50 transition">
                  Contact sales
                </button>
              </SignInButton>
              <SignInButton mode="modal">
                <button className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded-md hover:bg-zinc-800 transition">
                  Get started for free
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <LoadingLink 
                href="/dashboard" 
                className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded-md hover:bg-zinc-800 transition"
              >
                Dashboard
              </LoadingLink>
            </SignedIn>

            <button 
              className="lg:hidden p-2 text-zinc-600"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-zinc-200 px-6 py-4">
          <div className="flex flex-col gap-1">
            <LoadingLink href="/dashboard" className="py-2 text-zinc-900 font-medium" onClick={() => setMobileOpen(false)}>
              AI Presentations
            </LoadingLink>
            <LoadingLink href="/inspiration" className="py-2 text-zinc-600" onClick={() => setMobileOpen(false)}>
              Templates
            </LoadingLink>
            <LoadingLink href="/education" className="py-2 text-zinc-600" onClick={() => setMobileOpen(false)}>
              For Education
            </LoadingLink>
            <LoadingLink href="/community" className="py-2 text-zinc-600" onClick={() => setMobileOpen(false)}>
              Community
            </LoadingLink>
            <LoadingLink href="/pricing" className="py-2 text-zinc-600" onClick={() => setMobileOpen(false)}>
              Pricing
            </LoadingLink>
            <div className="pt-4 border-t border-zinc-200 mt-2">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="w-full py-3 text-sm font-medium text-white bg-zinc-900 rounded-md">
                    Get started for free
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <LoadingLink 
                  href="/dashboard" 
                  className="block w-full py-3 text-sm font-medium text-center text-white bg-zinc-900 rounded-md"
                  onClick={() => setMobileOpen(false)}
                >
                  Dashboard
                </LoadingLink>
              </SignedIn>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
