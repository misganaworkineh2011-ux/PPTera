"use client";

import Link from "next/link";
import Image from "next/image";
import { Globe, CheckCircle2 } from "lucide-react";
import { useLanguage } from "~/contexts/LanguageContext";

export const LandingFooter = () => {
    const { t } = useLanguage();
    
    return (
        <footer className="relative z-10 bg-black text-white">
            {/* CTA Section - Full Height, Text centered top */}
            <div className="relative w-full h-[60vh] md:h-screen bg-gradient-to-t from-[#ff9a9e] via-[#ffd1d5] to-white flex items-start justify-center pt-20 md:pt-32">

                {/* Background Image - Full image shown at bottom */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="/background.png"
                        alt="Background"
                        className="h-full w-full object-contain object-bottom opacity-80"
                    />
                </div>

                {/* Text + Button - Centered relative to container */}
                <div className="relative z-10 mx-auto max-w-4xl text-center px-6">
                    <h2 className="mb-4 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl lg:text-7xl">
                        {t.footerCtaTitle}
                    </h2>

                    <p className="mb-8 text-lg text-slate-700 md:text-xl font-medium">
                        {t.footerCtaSubtitle}
                    </p>

                    <Link href="/pricing">
                        <button className="rounded-full bg-black px-8 py-3 text-lg font-bold text-white shadow-xl transition-transform hover:scale-105 hover:bg-slate-800">
                            {t.tryForFree}
                        </button>
                    </Link>
                </div>
            </div>

            {/* Footer Links - Grid layout for mobile (2 cols) */}
            <div className="pt-20 pb-10 px-6">
                <div className="mx-auto max-w-7xl">
                    {/* Updated grid-cols-2 for mobile instead of 1 */}
                    <div className="grid gap-12 grid-cols-2 lg:grid-cols-6 mb-20">
                        <div className="col-span-2 lg:col-span-2">
                            <div className="flex items-center gap-2 mb-6">
                                <Link href="/" className="flex items-center gap-2">
                                    <Image
                                        src="/logo.png"
                                        alt="PPTMaster Logo"
                                        width={160}
                                        height={60}
                                        className="h-14 w-auto object-contain brightness-0 invert"
                                    />
                                </Link>
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
                                <li><Link href="/pricing" className="hover:text-white transition">{t.pricing}</Link></li>
                                <li><Link href="/inspiration" className="hover:text-white transition">{t.inspiration}</Link></li>
                                <li><Link href="/templates" className="hover:text-white transition">{t.templates}</Link></li>
                                <li><Link href="/prompt-guide" className="hover:text-white transition">{t.promptGuide}</Link></li>
                                <li><Link href="/insights" className="hover:text-white transition">{t.insights}</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-white mb-6 text-lg">{t.company}</h4>
                            <ul className="space-y-4 text-sm text-slate-400">
                                <li><Link href="/about" className="hover:text-white transition">{t.about}</Link></li>
                                <li><Link href="/careers" className="hover:text-white transition">{t.careers}</Link></li>
                                <li><Link href="/team" className="hover:text-white transition">{t.ourTeam}</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-white mb-6 text-lg">{t.help}</h4>
                            <ul className="space-y-4 text-sm text-slate-400">
                                <li><Link href="/help" className="hover:text-white transition">{t.helpCenter}</Link></li>
                                <li><Link href="/help" className="hover:text-white transition">{t.community}</Link></li>
                                <li><Link href="/help" className="hover:text-white transition">{t.developerDocs}</Link></li>
                                <li><Link href="/contact" className="hover:text-white transition">{t.contactUs}</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-white mb-6 text-lg">{t.legal}</h4>
                            <ul className="space-y-4 text-sm text-slate-400">
                                <li><Link href="/privacy" className="hover:text-white transition">{t.privacyPolicy}</Link></li>
                                <li><Link href="/terms" className="hover:text-white transition">{t.termsOfService}</Link></li>
                                <li><Link href="/cookies" className="hover:text-white transition">{t.cookieNotice}</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-slate-500">© 2025 PPTMaster Tech, Inc.</p>
                        <div className="flex gap-6 text-sm text-slate-500">
                            <Link href="/privacy" className="hover:text-white transition">{t.privacyPolicy}</Link>
                            <Link href="/terms" className="hover:text-white transition">{t.termsOfService}</Link>
                            <Link href="/cookies" className="hover:text-white transition">{t.cookieNotice}</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};
