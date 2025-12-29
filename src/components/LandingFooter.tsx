"use client";

import Image from "next/image";
import { useLanguage } from "~/contexts/LanguageContext";
import { LoadingLink } from "./LoadingLink";
import { useState } from "react";
import { toast } from "sonner";

export const LandingFooter = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/newsletter", {
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
            <LoadingLink href="/" className="inline-block mb-6">
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
            <h4 className="font-medium text-white mb-4">{t.productFooter}</h4>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li><LoadingLink href="/pricing" className="hover:text-white transition">{t.pricing}</LoadingLink></li>
              <li><LoadingLink href="/inspiration" className="hover:text-white transition">{t.inspiration}</LoadingLink></li>
              <li><LoadingLink href="/prompt-guide" className="hover:text-white transition">{t.promptGuide}</LoadingLink></li>
              <li><LoadingLink href="/insights" className="hover:text-white transition">{t.insights}</LoadingLink></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-medium text-white mb-4">{t.company}</h4>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li><LoadingLink href="/about" className="hover:text-white transition">{t.about}</LoadingLink></li>
              <li><LoadingLink href="/careers" className="hover:text-white transition">{t.careers}</LoadingLink></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-medium text-white mb-4">{t.help}</h4>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li><LoadingLink href="/help" className="hover:text-white transition">{t.helpCenter}</LoadingLink></li>
              <li><LoadingLink href="/community" className="hover:text-white transition">{t.community}</LoadingLink></li>
              <li><LoadingLink href="/contact" className="hover:text-white transition">{t.contactUs}</LoadingLink></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-medium text-white mb-4">{t.legal}</h4>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li><LoadingLink href="/privacy" className="hover:text-white transition">{t.privacyPolicy}</LoadingLink></li>
              <li><LoadingLink href="/terms" className="hover:text-white transition">{t.termsOfService}</LoadingLink></li>
              <li><LoadingLink href="/cookies" className="hover:text-white transition">{t.cookieNotice}</LoadingLink></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-zinc-800">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-zinc-500">© 2025 PPTMaster Tech, Inc.</p>
          <div className="flex gap-6 text-sm text-zinc-500">
            <LoadingLink href="/privacy" className="hover:text-white transition">{t.privacyPolicy}</LoadingLink>
            <LoadingLink href="/terms" className="hover:text-white transition">{t.termsOfService}</LoadingLink>
            <LoadingLink href="/cookies" className="hover:text-white transition">{t.cookieNotice}</LoadingLink>
          </div>
        </div>
      </div>
    </footer>
  );
};
