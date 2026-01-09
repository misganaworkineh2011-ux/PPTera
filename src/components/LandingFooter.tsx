"use client";

import Image from "next/image";
import { getTranslations, type Language } from "~/lib/i18n";
import { LoadingLink } from "./LoadingLink";
import { useState } from "react";
import { toast } from "sonner";

interface LandingFooterProps {
  currentLang: Language;
}

// Helper to get localized path - English uses root, others use /[lang]/
function getLocalizedPath(path: string, lang: Language): string {
  if (lang === "en") {
    return path; // English uses root path
  }
  return `/${lang}${path}`;
}

export const LandingFooter = ({ currentLang }: LandingFooterProps) => {
  const t = getTranslations(currentLang);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Helper for this component
  const localPath = (path: string) => getLocalizedPath(path, currentLang);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to subscribe");
      }

      toast.success(data.message || "Successfully subscribed!");
      setEmail("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to subscribe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-zinc-900 text-white">
      {/* Main Footer */}
      <div className="mx-auto max-w-[1400px] px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Logo & Description */}
          <div className="col-span-2">
            <LoadingLink href={localPath("/")} className="inline-block mb-6">
              <Image
                src="/logo.png"
                alt="PPTMaster"
                width={120}
                height={40}
                className="h-8 w-auto brightness-0 invert"
              />
            </LoadingLink>
            <p className="text-zinc-400 text-sm max-w-xs mb-6">
              {t.howGoodIdeas}
            </p>
            
            {/* Newsletter */}
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={loading}
                className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-white text-zinc-900 text-sm font-medium rounded-lg hover:bg-zinc-100 transition disabled:opacity-50"
              >
                {loading ? "..." : t.subscribe}
              </button>
            </form>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-medium text-white mb-4 text-base">{t.productFooter}</h3>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li><LoadingLink href={localPath("/pricing")} className="hover:text-white transition">{t.pricing}</LoadingLink></li>
              <li><LoadingLink href={localPath("/inspiration")} className="hover:text-white transition">{t.inspiration}</LoadingLink></li>
              <li><LoadingLink href={localPath("/prompt-guide")} className="hover:text-white transition">{t.promptGuide}</LoadingLink></li>
              <li><LoadingLink href={localPath("/insights")} className="hover:text-white transition">{t.insights}</LoadingLink></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-medium text-white mb-4 text-base">{t.company}</h3>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li><LoadingLink href={localPath("/about")} className="hover:text-white transition">{t.about}</LoadingLink></li>
              <li><LoadingLink href={localPath("/careers")} className="hover:text-white transition">{t.careers}</LoadingLink></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="font-medium text-white mb-4 text-base">{t.help}</h3>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li><LoadingLink href={localPath("/help")} className="hover:text-white transition">{t.helpCenter}</LoadingLink></li>
              <li><LoadingLink href={localPath("/community")} className="hover:text-white transition">{t.community}</LoadingLink></li>
              <li><LoadingLink href={localPath("/contact")} className="hover:text-white transition">{t.contactUs}</LoadingLink></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-medium text-white mb-4 text-base">{t.legal}</h3>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li><LoadingLink href={localPath("/privacy")} className="hover:text-white transition">{t.privacyPolicy}</LoadingLink></li>
              <li><LoadingLink href={localPath("/terms")} className="hover:text-white transition">{t.termsOfService}</LoadingLink></li>
              <li><LoadingLink href={localPath("/cookies")} className="hover:text-white transition">{t.cookieNotice}</LoadingLink></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-zinc-800">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-zinc-500">© 2025 PPTMaster Tech, Inc.</p>
          <div className="flex gap-6 text-sm text-zinc-500">
            <LoadingLink href={localPath("/privacy")} className="hover:text-white transition">{t.privacyPolicy}</LoadingLink>
            <LoadingLink href={localPath("/terms")} className="hover:text-white transition">{t.termsOfService}</LoadingLink>
            <LoadingLink href={localPath("/cookies")} className="hover:text-white transition">{t.cookieNotice}</LoadingLink>
          </div>
        </div>
      </div>
    </footer>
  );
};
