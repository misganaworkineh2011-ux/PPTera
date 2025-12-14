"use client";

import Image from "next/image";
import { Globe, CheckCircle2, Mail } from "lucide-react";
import { useLanguage } from "~/contexts/LanguageContext";
import { SignedOut, SignInButton } from "@clerk/nextjs";
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

            toast.success(data.message || "Successfully subscribed!", {
                duration: 5000,
                position: "top-center",
            });
            setEmail("");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to subscribe", {
                duration: 5000,
                position: "top-center",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <footer className="relative z-10 bg-black text-white">
            {/* Newsletter Section */}
            <div className="pt-12 pb-10 px-6 border-b border-slate-800 md:pt-20 md:pb-12">
                <div className="mx-auto max-w-4xl text-center">
                    <Mail className="h-10 w-10 mx-auto mb-3 text-[#06b6d4] md:h-12 md:w-12 md:mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2 md:text-2xl lg:text-3xl md:mb-3">
                        Stay Updated
                    </h3>
                    <p className="text-sm text-slate-400 mb-6 max-w-2xl mx-auto md:text-base md:mb-8">
                        Get the latest tips, insights, and updates delivered to your inbox.
                    </p>
                    <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto">
                        <div className="flex flex-col gap-3 sm:flex-row sm:gap-2">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                                disabled={loading}
                                className="flex-1 px-4 py-3 rounded-full bg-slate-900 border border-slate-800 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-[#06b6d4] disabled:opacity-50 md:text-base"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-3 rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white text-sm font-bold hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap md:text-base"
                            >
                                {loading ? "..." : "Subscribe"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Footer Links - Grid layout for mobile (2 cols) */}
            <div className="pt-12 pb-10 px-6">
                <div className="mx-auto max-w-7xl">
                    {/* Updated grid-cols-2 for mobile instead of 1 */}
                    <div className="grid gap-12 grid-cols-2 lg:grid-cols-6 mb-20">
                        <div className="col-span-2 lg:col-span-2">
                            <div className="flex items-center gap-2 mb-6">
                                <LoadingLink href="/" className="flex items-center gap-2">
                                    <Image
                                        src="/logo.png"
                                        alt="PPTMaster Logo"
                                        width={160}
                                        height={60}
                                        className="h-14 w-auto object-contain brightness-0 invert"
                                    />
                                </LoadingLink>
                            </div>
                            <p className="text-slate-400 mb-6 max-w-xs">{t.howGoodIdeas}</p>
                            <div className="flex gap-4">
                                {/* Social Icons */}
                                <div className="h-10 w-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-white hover:text-black transition cursor-pointer"><Globe className="h-5 w-5" /></div>
                                <div className="h-10 w-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-white hover:text-black transition cursor-pointer"><CheckCircle2 className="h-5 w-5" /></div>
                            </div>
                        </div>

                        {/* Mobile Grid Sections */}
                        <div>
                            <h4 className="font-bold text-white mb-6 text-lg">{t.productFooter}</h4>
                            <ul className="space-y-4 text-sm text-slate-400">
                                <li><LoadingLink href="/pricing" className="hover:text-white transition">{t.pricing}</LoadingLink></li>
                                <li><LoadingLink href="/inspiration" className="hover:text-white transition">{t.inspiration}</LoadingLink></li>
                                <li><LoadingLink href="/templates" className="hover:text-white transition">{t.templates}</LoadingLink></li>
                                <li><LoadingLink href="/prompt-guide" className="hover:text-white transition">{t.promptGuide}</LoadingLink></li>
                                <li><LoadingLink href="/insights" className="hover:text-white transition">{t.insights}</LoadingLink></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-white mb-6 text-lg">{t.company}</h4>
                            <ul className="space-y-4 text-sm text-slate-400">
                                <li><LoadingLink href="/about" className="hover:text-white transition">{t.about}</LoadingLink></li>
                                <li><LoadingLink href="/careers" className="hover:text-white transition">{t.careers}</LoadingLink></li>
                                <li><LoadingLink href="/team" className="hover:text-white transition">{t.ourTeam}</LoadingLink></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-white mb-6 text-lg">{t.help}</h4>
                            <ul className="space-y-4 text-sm text-slate-400">
                                <li><LoadingLink href="/help" className="hover:text-white transition">{t.helpCenter}</LoadingLink></li>
                                <li><LoadingLink href="/community" className="hover:text-white transition">{t.community}</LoadingLink></li>
                                <li><LoadingLink href="/developer-docs" className="hover:text-white transition">{t.developerDocs}</LoadingLink></li>
                                <li><LoadingLink href="/contact" className="hover:text-white transition">{t.contactUs}</LoadingLink></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-white mb-6 text-lg">{t.legal}</h4>
                            <ul className="space-y-4 text-sm text-slate-400">
                                <li><LoadingLink href="/privacy" className="hover:text-white transition">{t.privacyPolicy}</LoadingLink></li>
                                <li><LoadingLink href="/terms" className="hover:text-white transition">{t.termsOfService}</LoadingLink></li>
                                <li><LoadingLink href="/cookies" className="hover:text-white transition">{t.cookieNotice}</LoadingLink></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-slate-500">© 2025 PPTMaster Tech, Inc.</p>
                        <div className="flex gap-6 text-sm text-slate-500">
                            <LoadingLink href="/privacy" className="hover:text-white transition">{t.privacyPolicy}</LoadingLink>
                            <LoadingLink href="/terms" className="hover:text-white transition">{t.termsOfService}</LoadingLink>
                            <LoadingLink href="/cookies" className="hover:text-white transition">{t.cookieNotice}</LoadingLink>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

