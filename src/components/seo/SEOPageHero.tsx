"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

interface SEOPageHeroProps {
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink?: string;
    badge?: string;
}

export function SEOPageHero({
    title,
    subtitle,
    ctaText,
    ctaLink = "/sign-up",
    badge = "AI-Powered"
}: SEOPageHeroProps) {
    return (
        <section className="relative pt-32 pb-20 px-6 overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-cyan-50/30 to-blue-50/50" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />

            <div className="relative max-w-5xl mx-auto text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-200/50 mb-8">
                    <Sparkles className="w-4 h-4 text-cyan-600" />
                    <span className="text-sm font-semibold text-cyan-700">{badge}</span>
                </div>

                {/* H1 Title */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
                    {title}
                </h1>

                {/* Subtitle */}
                <p className="text-xl md:text-2xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed">
                    {subtitle}
                </p>

                {/* CTA Button */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href={ctaLink}
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg shadow-xl shadow-cyan-500/25 hover:shadow-2xl hover:shadow-cyan-500/30 hover:scale-105 transition-all duration-300"
                    >
                        <Sparkles className="w-5 h-5" />
                        {ctaText}
                    </Link>
                    <Link
                        href="/inspiration"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-slate-200 bg-white text-slate-700 font-semibold text-lg hover:border-cyan-400 hover:text-cyan-600 transition-all duration-300"
                    >
                        View Examples
                    </Link>
                </div>

                {/* Trust badges */}
                <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
                    <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        Free to start
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        No credit card required
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        Export to PowerPoint
                    </span>
                </div>
            </div>
        </section>
    );
}
