import Link from "next/link";
import { Sparkles, CheckCircle2 } from "lucide-react";

interface SEOCTASectionProps {
    title?: string;
    subtitle?: string;
    ctaText?: string;
    ctaLink?: string;
    features?: string[];
}

export function SEOCTASection({
    title = "Ready to Create Stunning Presentations?",
    subtitle = "Join thousands of professionals who create better presentations with AI.",
    ctaText = "Get Started Free",
    ctaLink = "/sign-up",
    features = [
        "No credit card required",
        "Free credits included",
        "Export to PowerPoint"
    ]
}: SEOCTASectionProps) {
    return (
        <section className="py-20 px-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
            </div>

            <div className="relative max-w-4xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                    {title}
                </h2>

                <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                    {subtitle}
                </p>

                {/* Features list */}
                <div className="flex flex-wrap items-center justify-center gap-6 mb-10">
                    {features.map((feature, index) => (
                        <span key={index} className="flex items-center gap-2 text-slate-300">
                            <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                            {feature}
                        </span>
                    ))}
                </div>

                {/* CTA Button */}
                <Link
                    href={ctaLink}
                    className="inline-flex items-center justify-center gap-2 px-10 py-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-xl shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 transition-all duration-300"
                >
                    <Sparkles className="w-6 h-6" />
                    {ctaText}
                </Link>

                {/* Social proof */}
                <p className="mt-8 text-slate-400 text-sm">
                    ⭐⭐⭐⭐⭐ Rated 4.8/5 by 1,300+ users
                </p>
            </div>
        </section>
    );
}
