"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import {
    Play,
    CheckCircle2,
    Wand2,
    Sparkles,
    Globe,
    ArrowUpRight
} from "lucide-react";
import { LandingNavbar } from "~/components/LandingNavbar";
import { LandingFooter } from "~/components/LandingFooter";
import { cn } from "~/lib/utils";
import { useLanguage } from "~/contexts/LanguageContext";
import { LoadingLink } from "~/components/LoadingLink";

export default function HomePage() {
    const { t } = useLanguage();
    
    return (
        <>
            {/* Show Dashboard for signed-in users */}
            <SignedIn>
                <DashboardRedirect />
            </SignedIn>

            {/* Show Landing Page for signed-out users */}
            <SignedOut>
                <LandingPageContent t={t} />
            </SignedOut>
        </>
    );
}

// Component to handle dashboard redirect
function DashboardRedirect() {
    if (typeof window !== 'undefined') {
        window.location.href = '/dashboard';
    }
    return null;
}

// Landing page content component
function LandingPageContent({ t }: { t: any }) {
    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-slate-900 selection:text-white overflow-x-hidden">
            {/* Subtle Background Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-100px,#1e1e1e0a,transparent)]"></div>

            <LandingNavbar />

            {/* Hero Section */}
            <section className="relative pt-24 pb-16 px-4 overflow-hidden flex items-center sm:pt-32 sm:pb-24 md:pt-40 md:pb-32 sm:px-6" style={{ minHeight: '70vh' }}>
                <div className="mx-auto max-w-7xl w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center sm:gap-12">

                        {/* Left Column - Text Content */}
                        <div className="flex flex-col items-start text-left animate-fade-in-up">

                            {/* Headline */}
                            <h1 className="relative z-10 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl animate-fade-in-up [animation-delay:200ms]">
                                {t.heroTitle} <br />
                                <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent">{t.heroSubtitle}</span> {t.heroSubtitle2}
                            </h1>

                            <p className="mt-4 text-base text-slate-500 max-w-xl sm:mt-6 sm:text-lg md:mt-8 md:text-xl animate-fade-in-up [animation-delay:300ms]">
                                {t.heroDescription}
                            </p>

                            {/* CTA Buttons */}
                            <div className="mt-6 flex flex-col items-start gap-3 w-full sm:mt-8 sm:flex-row sm:gap-4 md:mt-10 animate-fade-in-up [animation-delay:400ms]">
                                <SignedOut>
                                    <SignInButton mode="modal">
                                        <button className="h-12 w-full min-w-[180px] rounded-full bg-black px-8 text-base font-bold text-white shadow-xl shadow-slate-900/10 transition hover:scale-105 hover:bg-slate-800 hover:shadow-2xl sm:w-auto">
                                            {t.startForFree}
                                        </button>
                                    </SignInButton>
                                </SignedOut>
                                <SignedIn>
                                    <LoadingLink href="/dashboard" className="flex h-12 w-full min-w-[180px] items-center justify-center rounded-full bg-black px-8 text-base font-bold text-white shadow-xl shadow-slate-900/10 transition hover:scale-105 hover:bg-slate-800 hover:shadow-2xl sm:w-auto">
                                        {t.goToDashboard}
                                    </LoadingLink>
                                </SignedIn>

                                <button className="flex h-12 w-full min-w-[180px] items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-8 text-base font-bold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50 sm:w-auto">
                                    <Play className="h-4 w-4 fill-current" />
                                    {t.seeHowItWorks}
                                </button>
                            </div>
                        </div>

                        {/* Right Column - Hero Visual */}
                        <div className="relative w-full perspective-1000 animate-fade-in-right [animation-delay:500ms]">
                            <div className="relative aspect-video overflow-hidden rounded-[20px] bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-200">
                                {/* Mac Window Dots */}
                                <div className="absolute top-0 left-0 right-0 h-10 border-b border-slate-100 bg-white flex items-center px-4 gap-2 z-10">
                                    <div className="h-3 w-3 rounded-full bg-red-400"></div>
                                    <div className="h-3 w-3 rounded-full bg-amber-400"></div>
                                    <div className="h-3 w-3 rounded-full bg-green-400"></div>
                                    <div className="mx-auto flex w-1/3 items-center justify-center rounded-md bg-slate-50 py-1 text-[10px] text-slate-400">
                                        Untitled Presentation.pptx
                                    </div>
                                </div>

                                {/* App Interface Mockup */}
                                <div className="absolute inset-0 top-10 flex">
                                    {/* Sidebar */}
                                    <div className="w-16 md:w-64 border-r border-slate-100 bg-slate-50/50 p-4 hidden md:block">
                                        <div className="space-y-3">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div key={i} className={cn("aspect-video rounded-lg border border-slate-200 bg-white shadow-sm", i === 1 && "ring-2 ring-blue-500/20 border-blue-500")}></div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Main Canvas */}
                                    <div className="flex-1 bg-white p-8 md:p-12 flex items-center justify-center relative">
                                        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
                                        <div className="h-full w-full max-w-2xl rounded-xl bg-white shadow-2xl border border-slate-100 p-8 md:p-16 flex flex-col justify-center relative overflow-hidden group z-10">
                                            {/* Simulated Slide Content */}
                                            <h2 className="text-3xl font-bold text-slate-900 md:text-5xl">Q4 Strategy Review</h2>
                                            <div className="mt-6 space-y-3">
                                                <div className="h-4 w-3/4 rounded bg-slate-100"></div>
                                                <div className="h-4 w-1/2 rounded bg-slate-100"></div>
                                            </div>

                                            {/* Magic AI Cursor/Badge */}
                                            <div className="absolute bottom-10 right-10 flex items-center gap-2 rounded-full bg-black px-4 py-2 text-white shadow-xl animate-float">
                                                <Sparkles className="h-4 w-4 text-amber-300" />
                                                <span className="text-xs font-bold">AI Generating...</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Glass Cards Decoration */}
                            <div className="absolute -left-12 bottom-20 z-20 hidden lg:block animate-bounce [animation-duration:3s]">
                                <div className="flex items-center gap-3 rounded-2xl border border-white/50 bg-white/80 p-4 shadow-xl backdrop-blur-md">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">Slides Ready</p>
                                        <p className="text-xs text-slate-500">Just now</p>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute -right-8 top-10 z-20 hidden lg:block animate-bounce [animation-duration:4s]">
                                <div className="flex items-center gap-3 rounded-2xl border border-white/50 bg-white/80 p-4 shadow-xl backdrop-blur-md">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                        <Wand2 className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">Auto-Design</p>
                                        <p className="text-xs text-slate-500">Theme applied</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Fade to White at Bottom of Hero (Overlay) */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent z-10 pointer-events-none"></div>
            </section>

            {/* How It Works Section */}
            <section className="relative z-10 py-20 px-4 sm:py-28 sm:px-6 md:py-32 overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <img src="/bg2.webp" alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-blue-100/80"></div>
                </div>
                {/* Top gradient blend */}
                <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none"></div>
                <div className="mx-auto max-w-6xl relative z-10">
                    {/* Header */}
                    <div className="text-center mb-16 sm:mb-20">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
                            {t.fromIdeaToPresentation}
                        </h2>
                    </div>


                    {/* CTA */}
                    <div className="mt-16 text-center">
                        <SignedOut>
                            <SignInButton mode="modal">
                                <button className="inline-flex items-center gap-2 h-12 rounded-full bg-black px-8 text-base font-bold text-white shadow-lg transition hover:scale-105 hover:bg-slate-800">
                                    <Sparkles className="w-5 h-5" />
                                    {t.tryItFree}
                                </button>
                            </SignInButton>
                        </SignedOut>
                        <SignedIn>
                            <LoadingLink href="/dashboard" className="inline-flex items-center gap-2 h-12 rounded-full bg-black px-8 text-base font-bold text-white shadow-lg transition hover:scale-105 hover:bg-slate-800">
                                <Sparkles className="w-5 h-5" />
                                {t.goToDashboard}
                            </LoadingLink>
                        </SignedIn>
                    </div>
                </div>
            </section>

            {/* Trusted By Section */}
            <section className="relative z-10 py-12 sm:py-16 md:py-20 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    <p className="text-center text-sm font-medium text-slate-400 uppercase tracking-wider mb-8 sm:mb-10">
                        {t.trustedByCompanies}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 md:gap-16">
                        <img src="/companyLogo/adobe.png" alt="Adobe" className="h-8 sm:h-10 object-contain brightness-0 opacity-70" />
                        <img src="/companyLogo/amazon.png" alt="Amazon" className="h-8 sm:h-10 object-contain brightness-0 opacity-70" />
                        <img src="/companyLogo/stanford.png" alt="Stanford" className="h-8 sm:h-10 object-contain brightness-0 opacity-70" />
                        <img src="/companyLogo/vercel.png" alt="Vercel" className="h-8 sm:h-10 object-contain brightness-0 opacity-70" />
                        <img src="/companyLogo/zoom.png" alt="Zoom" className="h-8 sm:h-10 object-contain brightness-0 opacity-70" />
                        <img src="/companyLogo/latimes.png" alt="LA Times" className="h-8 sm:h-10 object-contain brightness-0 opacity-70" />
                    </div>
                </div>
            </section>

            {/* Generate / Shape / Share Section */}
            <section className="relative z-10 py-24 px-6 md:py-32 bg-gradient-to-b from-white to-[#fffbf7]">
                <div className="mx-auto max-w-7xl">
                    {/* Generate */}
                    <div className="grid gap-12 md:grid-cols-2 items-center mb-32">
                        <div className="order-2 md:order-1">
                            <div className="mb-6 inline-flex rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-600">
                                {t.instantCreation}
                            </div>
                            <h3 className="mb-4 text-3xl font-bold text-slate-900">{t.skipBlankPage} <br /> {t.createBrilliance}</h3>
                            <ul className="space-y-4 text-lg text-slate-600">
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-blue-500" />
                                    {t.startWithIdea}
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-blue-500" />
                                    {t.aiModels}
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-blue-500" />
                                    {t.importBrand}
                                </li>
                            </ul>
                        </div>
                        <div className="order-1 md:order-2 rounded-3xl bg-white p-2 shadow-2xl border border-slate-100 rotate-2 hover:rotate-0 transition-transform duration-500">
                            <div className="h-64 md:h-80 w-full rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                                <Sparkles className="h-24 w-24 text-blue-300" />
                            </div>
                        </div>
                    </div>

                    {/* Shape */}
                    <div className="grid gap-12 md:grid-cols-2 items-center mb-32">
                        <div className="rounded-3xl bg-white p-2 shadow-2xl border border-slate-100 -rotate-2 hover:rotate-0 transition-transform duration-500">
                            <div className="h-64 md:h-80 w-full rounded-2xl bg-gradient-to-br from-purple-100 to-fuchsia-100 flex items-center justify-center">
                                <Wand2 className="h-24 w-24 text-purple-300" />
                            </div>
                        </div>
                        <div>
                            <div className="mb-6 inline-flex rounded-full bg-purple-100 px-4 py-1.5 text-sm font-semibold text-purple-600">
                                {t.smartRefine}
                            </div>
                            <h3 className="mb-4 text-3xl font-bold text-slate-900">{t.editWithAI} <br /> {t.inJustClick}</h3>
                            <ul className="space-y-4 text-lg text-slate-600">
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-purple-500" />
                                    {t.smartLayouts}
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-purple-500" />
                                    {t.generateImages}
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-purple-500" />
                                    {t.collaborateRealtime}
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Share */}
                    <div className="grid gap-12 md:grid-cols-2 items-center">
                        <div>
                            <div className="mb-6 inline-flex rounded-full bg-green-100 px-4 py-1.5 text-sm font-semibold text-green-600">
                                {t.universalShare}
                            </div>
                            <h3 className="mb-4 text-3xl font-bold text-slate-900">{t.shareworthyContent} <br /> {t.whereverYouNeed}</h3>
                            <ul className="space-y-4 text-lg text-slate-600">
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    {t.exportFormats}
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    {t.publishWebsite}
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    {t.trackEngagement}
                                </li>
                            </ul>
                        </div>
                        <div className="rounded-3xl bg-white p-2 shadow-2xl border border-slate-100 rotate-2 hover:rotate-0 transition-transform duration-500">
                            <div className="h-64 md:h-80 w-full rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                                <ArrowUpRight className="h-24 w-24 text-green-300" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="relative z-10 py-12 md:py-24 bg-white overflow-hidden">
                <div className="mx-auto max-w-7xl px-6 mb-16 text-center">
                    <h2 className="text-4xl font-bold tracking-tight text-slate-900">{t.joinMillionUsers}</h2>
                </div>

                <ActualCarousel />
            </section>

            {/* CTA Section - Only on Home Page */}
            <section className="relative w-full min-h-[35vh] sm:min-h-[45vh] md:min-h-[55vh] lg:min-h-[70vh] xl:min-h-[85vh] 2xl:min-h-screen bg-gradient-to-t from-[#ff9a9e] via-[#ffd1d5] to-white flex flex-col pt-6 sm:pt-8 md:pt-10 lg:pt-14 xl:pt-18 2xl:pt-18">
                {/* Background Image - Full image shown at bottom */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://res.cloudinary.com/di76ibrro/image/upload/v1766157051/B3ackground-min_1_dyfstu.png"
                        alt="Background"
                        className="h-full w-full object-contain object-bottom opacity-80"
                    />
                </div>

                {/* Text + Button - Starts at top, scales proportionally */}
                <div className="relative z-10 mx-auto max-w-4xl text-center px-4 sm:px-6 flex-shrink-0">
                    <h2 className="mb-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl sm:mb-3 md:text-3xl md:mb-4 lg:text-4xl lg:mb-5 xl:text-5xl xl:mb-6 2xl:text-6xl 2xl:mb-8">
                        {t.footerCtaTitle}
                    </h2>

                    <SignedOut>
                        <SignInButton mode="modal">
                            <button className="h-10 w-full min-w-[140px] rounded-full bg-white px-5 text-sm font-bold text-black shadow-xl shadow-slate-900/10 transition hover:scale-105 hover:bg-slate-100 hover:shadow-2xl sm:h-12 sm:min-w-[180px] sm:px-8 sm:text-base sm:w-auto">
                                {t.tryForFree}
                            </button>
                        </SignInButton>
                    </SignedOut>
                </div>
                
                {/* Spacer to push content to top */}
                <div className="flex-grow"></div>
            </section>

            <LandingFooter />
        </div>
    );
}

function ActualCarousel() {
    const [index, setIndex] = useState(0);
    const testimonials = [
        { quote: "Beyond saving me hours of labor that I now channel into more meaningful work, PPTMaster has made me something of a campus hero!", author: "Christina Salazar", role: "Development Teacher" },
        { quote: "No matter what I create, PPTMaster is the home for my best complex ideas, expressed beautifully and with elegance.", author: "Jordan Crawford", role: "Founder" },
        { quote: "PPTMaster has been a game-changer for internal collaboration, eliminating our startup's reliance on traditional slides and documents.", author: "Young Zhao", role: "Founder" },
        { quote: "PPTMaster is our choice. You've created the perfect balance between customizability and fast workflow.", author: "Jeff Shuck", role: "Principal Consultant" },
        { quote: "This product rocks! I no longer use Google Slides — it just seems so prehistoric compared to PPTMaster!", author: "Denise Penn", role: "Creator" },
        { quote: "PPTMaster got rid of the website design bottleneck; now our pages pop up fast, on brand, and ready to rock.", author: "Darby Rollins", role: "Educator" },
        { quote: "PPTMaster has forever changed how I make presentations... I'm now able to turn any of those into a stand-alone website with just a few clicks.", author: "Matthew Fried", role: "Coach" },
        { quote: "PPTMaster has helped us raise our Pre-Seed round, and we use their website builder to quickly run and validate ideas!", author: "Aibek Yegemberdin", role: "Founder" },
        { quote: "Every chance I get, I talk about PPTMaster — I call it a magic moment, a dopamine moment. Thank you so much!", author: "Zohar Urian", role: "Consultant" }
    ];

    const next = () => {
        setIndex((prev) => (prev + 1) % (testimonials.length - 2));
    };
    const prev = () => {
        setIndex((prev) => (prev - 1 + (testimonials.length - 2)) % (testimonials.length - 2));
    };

    // Get 3 visible testimonials
    const visibleTestimonials = [
        testimonials[index],
        testimonials[index + 1],
        testimonials[index + 2]
    ];

    return (
        <div className="relative mx-auto max-w-6xl px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {visibleTestimonials.map((t, i) => (
                    <div
                        key={`${index}-${i}`}
                        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in"
                        style={{ animationDelay: `${i * 100}ms` }}
                    >
                        <p className="mb-4 text-sm text-slate-600 leading-relaxed italic line-clamp-3">"{t?.quote}"</p>
                        <div className="flex items-center gap-3 mt-auto">
                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                                <span className="font-bold text-slate-500 text-xs">
                                    {t?.author ? t.author.split(' ').map(n => n[0]).join('').slice(0, 2) : '??'}
                                </span>
                            </div>
                            <div>
                                <div className="font-semibold text-slate-900 text-sm">{t?.author}</div>
                                <div className="text-xs text-slate-500">{t?.role}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-center gap-3">
                <button onClick={prev} className="rounded-full bg-white border border-slate-200 p-3 text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 active:scale-95">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button onClick={next} className="rounded-full bg-white border border-slate-200 p-3 text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 active:scale-95">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>
        </div>
    );
}
