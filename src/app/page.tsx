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

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-slate-900 selection:text-white overflow-x-hidden">
            {/* Subtle Background Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-100px,#1e1e1e0a,transparent)]"></div>

            <LandingNavbar />

            {/* Hero Section */}
            <section className="relative pt-40 pb-20 px-6 overflow-hidden">
                <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                        {/* Left Column - Text Content */}
                        <div className="flex flex-col items-start text-left animate-fade-in-up">
                            {/* Badge */}
                            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/50 px-3 py-1 backdrop-blur-sm animate-fade-in [animation-delay:100ms]">
                                <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">AI Generation V2.0</span>
                            </div>

                            {/* Headline */}
                            <h1 className="relative z-10 text-5xl font-extrabold tracking-tight text-slate-900 md:text-6xl lg:text-7xl animate-fade-in-up [animation-delay:200ms]">
                                Design beautiful <br />
                                <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent">presentations</span> with AI.
                            </h1>

                            <p className="mt-8 text-lg text-slate-500 md:text-xl max-w-xl animate-fade-in-up [animation-delay:300ms]">
                                The smartest way to create professional decks. Just describe your idea, and PPTMaster generates the story, design, and slides for you.
                            </p>

                            {/* CTA Buttons */}
                            <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row animate-fade-in-up [animation-delay:400ms]">
                                <SignedOut>
                                    <SignInButton mode="modal">
                                        <button className="h-12 w-full min-w-[180px] rounded-full bg-black px-8 text-base font-bold text-white shadow-xl shadow-slate-900/10 transition hover:scale-105 hover:bg-slate-800 hover:shadow-2xl sm:w-auto">
                                            Start for free
                                        </button>
                                    </SignInButton>
                                </SignedOut>
                                <SignedIn>
                                    <Link href="/dashboard" className="flex h-12 w-full min-w-[180px] items-center justify-center rounded-full bg-black px-8 text-base font-bold text-white shadow-xl shadow-slate-900/10 transition hover:scale-105 hover:bg-slate-800 hover:shadow-2xl sm:w-auto">
                                        Go to Dashboard
                                    </Link>
                                </SignedIn>

                                <button className="flex h-12 w-full min-w-[180px] items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-8 text-base font-bold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50 sm:w-auto">
                                    <Play className="h-4 w-4 fill-current" />
                                    See how it works
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

            {/* Feature Grid Section (Sky Blue Theme) */}
            <section className="relative z-10 pt-32 pb-48 px-6 bg-[#85CBF8] overflow-x-hidden">
                {/* Smooth Top Gradient from White Hero */}
                <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-white to-transparent z-20 pointer-events-none"></div>

                {/* Cloud Background Effects (Cleaner) */}
                <div className="absolute inset-0 pointer-events-none opacity-50">
                    <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-white/20 rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-[120px]"></div>
                </div>

                <div className="mx-auto max-w-7xl relative z-10">
                    <div className="text-center mb-16 md:mb-24">
                        <span className="inline-block py-1 px-3 rounded-full bg-white/20 border border-white/30 text-white text-sm font-semibold mb-4 tracking-wide uppercase">
                            Features
                        </span>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6">
                            Everything you need to <br className="hidden md:block" /> tell your story.
                        </h2>
                        <p className="text-lg text-white/90 max-w-2xl mx-auto font-medium">
                            Powerful tools wrapped in a stunning interface. Designed for speed, built for impact.
                        </p>
                    </div>

                    {/* Feature Grid: Sky Blue Theme (White Cards) */}
                    <div className="flex overflow-x-auto gap-6 pb-8 px-0 md:grid md:grid-cols-2 md:gap-8 md:overflow-visible md:pb-0 scrollbar-hide snap-x snap-mandatory">

                        {/* Card 1: Presentations */}
                        <div className="min-w-[85vw] md:min-w-0 snap-center group relative overflow-hidden rounded-[2rem] bg-white p-8 shadow-xl hover:shadow-2xl transition-all duration-300 md:h-[400px] flex flex-col md:flex-row items-center gap-6">
                            <div className="flex-1 text-left z-10">
                                <h3 className="mb-2 text-2xl font-bold text-slate-900 tracking-tight">Presentations</h3>
                                <p className="text-slate-600 leading-relaxed text-sm">
                                    Stunning slides with consistent branding in minutes. Export to PPT, Google Slides, and more.
                                </p>
                            </div>
                            <div className="w-full md:w-1/2 h-48 md:h-full relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 group-hover:scale-105 transition-transform duration-500">
                                <div className="absolute inset-0 flex items-center justify-center text-blue-300">
                                    <svg className="w-20 h-20 opacity-50" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" /><path d="M7 7h10v2H7zm0 4h10v2H7zm0 4h7v2H7z" /></svg>
                                </div>
                            </div>
                        </div>

                        {/* Card 2: Documents */}
                        <div className="min-w-[85vw] md:min-w-0 snap-center group relative overflow-hidden rounded-[2rem] bg-white p-8 shadow-xl hover:shadow-2xl transition-all duration-300 md:h-[400px] flex flex-col md:flex-row items-center gap-6">
                            <div className="w-full md:w-1/2 h-48 md:h-full relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-50 group-hover:scale-105 transition-transform duration-500">
                                <div className="absolute inset-0 flex items-center justify-center text-indigo-300">
                                    <svg className="w-20 h-20 opacity-50" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /></svg>
                                </div>
                            </div>
                            <div className="flex-1 text-left z-10">
                                <h3 className="mb-2 text-2xl font-bold text-slate-900 tracking-tight">Documents</h3>
                                <p className="text-slate-600 leading-relaxed text-sm">
                                    Show-stopping proposals, PDFs, visual aids and more, lightning-fast on any topic.
                                </p>
                            </div>
                        </div>

                        {/* Card 3: Social Media */}
                        <div className="min-w-[85vw] md:min-w-0 snap-center group relative overflow-hidden rounded-[2rem] bg-white p-8 shadow-xl hover:shadow-2xl transition-all duration-300 md:h-[400px] flex flex-col md:flex-row items-center gap-6">
                            <div className="flex-1 text-left z-10">
                                <h3 className="mb-2 text-2xl font-bold text-slate-900 tracking-tight">Social Media</h3>
                                <p className="text-slate-600 leading-relaxed text-sm">
                                    Gorgeous graphics and convincing copy. Share directly to social platforms.
                                </p>
                            </div>
                            <div className="w-full md:w-1/2 h-48 md:h-full relative overflow-hidden rounded-xl bg-gradient-to-br from-pink-100 to-pink-50 group-hover:scale-105 transition-transform duration-500">
                                <div className="absolute inset-0 flex items-center justify-center text-pink-300">
                                    <svg className="w-20 h-20 opacity-50" fill="currentColor" viewBox="0 0 24 24"><path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z" /></svg>
                                </div>
                            </div>
                        </div>

                        {/* Card 4: Websites */}
                        <div className="min-w-[85vw] md:min-w-0 snap-center group relative overflow-hidden rounded-[2rem] bg-white p-8 shadow-xl hover:shadow-2xl transition-all duration-300 md:h-[400px] flex flex-col md:flex-row items-center gap-6">
                            <div className="w-full md:w-1/2 h-48 md:h-full relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 group-hover:scale-105 transition-transform duration-500">
                                <div className="absolute inset-0 flex items-center justify-center text-emerald-300">
                                    <Globe className="w-20 h-20 opacity-50" />
                                </div>
                            </div>
                            <div className="flex-1 text-left z-10">
                                <h3 className="mb-2 text-2xl font-bold text-slate-900 tracking-tight">Websites</h3>
                                <p className="text-slate-600 leading-relaxed text-sm">
                                    Business sites, landing pages, portfolios and more. Faster than you can blink. No coding required.
                                </p>
                            </div>
                        </div>

                    </div>

                    {/* API Banner - White style */}
                    <div className="mt-8 rounded-[1.5rem] bg-white p-6 shadow-xl relative overflow-hidden group flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <span className="rounded bg-green-100 px-2 py-1 text-[10px] font-bold text-green-700 uppercase tracking-wide">Beta</span>
                            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                API
                            </h3>
                            <p className="text-slate-500 text-sm hidden md:block border-l border-slate-200 pl-4">
                                Connect to PPTMaster programmatically. Automate creation, integrate with your tools, and scale your storytelling.
                            </p>
                        </div>
                        <div className="hidden md:block">
                            <Wand2 className="h-6 w-6 text-slate-400" />
                        </div>
                    </div>

                    {/* Logo Section */}
                    <div className="mt-32 text-center">
                        <p className="mb-10 text-3xl font-medium text-white/90">
                            Your next big idea is in good company.
                        </p>
                        <div className="relative">
                            <div className="relative z-10 flex flex-wrap justify-center gap-12 md:gap-20 opacity-80 mix-blend-multiply transition-all duration-500 hover:mix-blend-normal hover:opacity-100 items-center">
                                {/* Logos */}
                                <Image src="/companyLogo/amazon.png" alt="Amazon" width={300} height={90} className="h-20 w-auto object-contain brightness-0 invert lg:brightness-100 lg:invert-0" />
                                <Image src="/companyLogo/adobe.png" alt="Adobe" width={300} height={90} className="h-16 w-40 object-contain brightness-0 invert lg:brightness-100 lg:invert-0" />
                                <Image src="/companyLogo/vercel.png" alt="Vercel" width={300} height={90} className="h-20 w-40 object-contain brightness-0 invert lg:brightness-100 lg:invert-0" />
                                <Image src="/companyLogo/zoom.png" alt="Zoom" width={300} height={90} className="h-20 w-auto object-contain brightness-0 invert lg:brightness-100 lg:invert-0" />
                                <Image src="/companyLogo/losangelestimes.png" alt="Los Angeles Times" width={420} height={90} className="h-20 w-60 object-contain brightness-0 invert lg:brightness-100 lg:invert-0" />
                            </div>
                        </div>
                    </div>

                </div>

                {/* Cloud Divider - Absolute at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-24 md:h-48 z-20 pointer-events-none translate-y-1">
                    <svg viewBox="0 0 1440 320" className="w-full h-full" preserveAspectRatio="none">
                        <path fill="#ffffff" fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    </svg>
                </div>
            </section>

            {/* Generate / Shape / Share Section */}
            <section className="relative z-10 py-24 px-6 md:py-32 bg-gradient-to-b from-white to-[#fffbf7]">
                <div className="mx-auto max-w-7xl">
                    {/* Generate */}
                    <div className="grid gap-12 md:grid-cols-2 items-center mb-32">
                        <div className="order-2 md:order-1">
                            <div className="mb-6 inline-flex rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-600">
                                Instant Creation
                            </div>
                            <h3 className="mb-4 text-3xl font-bold text-slate-900">Skip the blank page. <br /> Create brilliance in a flash.</h3>
                            <ul className="space-y-4 text-lg text-slate-600">
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-blue-500" />
                                    Start with an idea, paste an outline, or import docs
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-blue-500" />
                                    20+ AI models for highest-quality output
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-blue-500" />
                                    Import your brand or use one of our 100+ themes
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
                                Smart Refine
                            </div>
                            <h3 className="mb-4 text-3xl font-bold text-slate-900">Edit with AI, <br /> in just a click.</h3>
                            <ul className="space-y-4 text-lg text-slate-600">
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-purple-500" />
                                    Instantly add smart layouts and translations
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-purple-500" />
                                    Generate images and rework with AI
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-purple-500" />
                                    Collaborate real-time with your team
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Share */}
                    <div className="grid gap-12 md:grid-cols-2 items-center">
                        <div>
                            <div className="mb-6 inline-flex rounded-full bg-green-100 px-4 py-1.5 text-sm font-semibold text-green-600">
                                Universal Share
                            </div>
                            <h3 className="mb-4 text-3xl font-bold text-slate-900">Shareworthy content, <br /> wherever you need it.</h3>
                            <ul className="space-y-4 text-lg text-slate-600">
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    Export as PPT, PDF, PNG, or Google Slides
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    Publish as a website or social post
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    Track engagement metrics
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
            <section className="relative z-10 py-24 bg-white overflow-hidden">
                <div className="mx-auto max-w-7xl px-6 mb-16 text-center">
                    <h2 className="text-4xl font-bold tracking-tight text-slate-900">Join 50+ million users changing <br /> how the world communicates</h2>
                </div>

                <ActualCarousel />
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
