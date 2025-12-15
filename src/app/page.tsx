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
            <section className="relative pt-40 pb-32 px-6 overflow-hidden flex items-center" style={{ minHeight: '80vh' }}>
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
                                {t.heroTitle} <br />
                                <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent">{t.heroSubtitle}</span> {t.heroSubtitle2}
                            </h1>

                            <p className="mt-8 text-lg text-slate-500 md:text-xl max-w-xl animate-fade-in-up [animation-delay:300ms]">
                                {t.heroDescription}
                            </p>

                            {/* CTA Buttons */}
                            <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row animate-fade-in-up [animation-delay:400ms]">
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

            {/* Feature Grid Section - Hero Style */}
            <section className="relative z-10 pt-32 pb-32 px-6 overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <img src="/bg2.webp" alt="" className="w-full h-full object-cover" />
                    {/* Overlay for readability */}
                    <div className="absolute inset-0 bg-white/70"></div>
                </div>
                {/* Top gradient blend with hero section */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none"></div>

                <div className="mx-auto max-w-7xl relative z-10">
                    {/* Header - Hero Style */}
                    <div className="text-center mb-16 md:mb-20">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/50 px-3 py-1 backdrop-blur-sm">
                            <span className="flex h-2 w-2 rounded-full bg-blue-500"></span>
                            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{t.products}</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-6">
                            {t.featuresTitle}
                        </h2>
                        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                            {t.featuresSubtitle}
                        </p>
                    </div>

                    {/* Feature Grid - Clean Cards with Hero Aesthetic */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">

                        {/* Card 1: Presentations */}
                        <div className="group relative overflow-hidden rounded-[20px] bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-200 hover:shadow-[0_25px_60px_-12px_rgba(0,0,0,0.15)] transition-shadow duration-500">
                            <div className="p-8">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1">
                                        <span className="flex h-2 w-2 rounded-full bg-blue-500"></span>
                                        <span className="text-xs font-semibold text-blue-600">{t.presentations}</span>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-3">{t.presentations}</h3>
                                <p className="text-slate-500 leading-relaxed mb-6">{t.presentationsDesc}</p>
                                <SignInButton mode="modal">
                                    <button className="flex items-center gap-2 text-blue-600 font-semibold text-sm hover:gap-3 transition-all cursor-pointer">
                                        <span>Learn more</span>
                                        <ArrowUpRight className="w-4 h-4" />
                                    </button>
                                </SignInButton>
                            </div>
                        </div>

                        {/* Card 2: Documents */}
                        <div className="group relative overflow-hidden rounded-[20px] bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-200 hover:shadow-[0_25px_60px_-12px_rgba(0,0,0,0.15)] transition-shadow duration-500">
                            <div className="p-8">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3 py-1">
                                        <span className="flex h-2 w-2 rounded-full bg-purple-500"></span>
                                        <span className="text-xs font-semibold text-purple-600">{t.documents}</span>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-600 shadow-lg shadow-purple-500/25 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-3">{t.documents}</h3>
                                <p className="text-slate-500 leading-relaxed mb-6">{t.documentsDesc}</p>
                                <SignInButton mode="modal">
                                    <button className="flex items-center gap-2 text-purple-600 font-semibold text-sm hover:gap-3 transition-all cursor-pointer">
                                        <span>Learn more</span>
                                        <ArrowUpRight className="w-4 h-4" />
                                    </button>
                                </SignInButton>
                            </div>
                        </div>

                        {/* Card 3: Social Media */}
                        <div className="group relative overflow-hidden rounded-[20px] bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-200 hover:shadow-[0_25px_60px_-12px_rgba(0,0,0,0.15)] transition-shadow duration-500">
                            <div className="p-8">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1">
                                        <span className="flex h-2 w-2 rounded-full bg-rose-500"></span>
                                        <span className="text-xs font-semibold text-rose-600">{t.socialMedia}</span>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg shadow-rose-500/25 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-3">{t.socialMedia}</h3>
                                <p className="text-slate-500 leading-relaxed mb-6">{t.socialMediaDesc}</p>
                                <SignInButton mode="modal">
                                    <button className="flex items-center gap-2 text-rose-600 font-semibold text-sm hover:gap-3 transition-all cursor-pointer">
                                        <span>Learn more</span>
                                        <ArrowUpRight className="w-4 h-4" />
                                    </button>
                                </SignInButton>
                            </div>
                        </div>

                        {/* Card 4: Websites */}
                        <div className="group relative overflow-hidden rounded-[20px] bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-200 hover:shadow-[0_25px_60px_-12px_rgba(0,0,0,0.15)] transition-shadow duration-500">
                            <div className="p-8">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1">
                                        <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                                        <span className="text-xs font-semibold text-emerald-600">{t.websites}</span>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                                        <Globe className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-3">{t.websites}</h3>
                                <p className="text-slate-500 leading-relaxed mb-6">{t.websitesDesc}</p>
                                <SignInButton mode="modal">
                                    <button className="flex items-center gap-2 text-emerald-600 font-semibold text-sm hover:gap-3 transition-all cursor-pointer">
                                        <span>Learn more</span>
                                        <ArrowUpRight className="w-4 h-4" />
                                    </button>
                                </SignInButton>
                            </div>
                        </div>

                    </div>

                    {/* API Banner - Hero Style */}
                    <div className="mt-10 relative overflow-hidden rounded-[20px] bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-200">
                        <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1">
                                    <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                                    <span className="text-xs font-semibold text-green-600">{t.beta}</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">{t.api}</h3>
                                <p className="text-slate-500 text-sm hidden md:block border-l border-slate-200 pl-4">
                                    {t.apiDescription}
                                </p>
                            </div>
                            <button className="flex items-center gap-2 rounded-full bg-black px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition hover:scale-105 hover:bg-slate-800">
                                <Wand2 className="h-4 w-4" />
                                <span>Explore API</span>
                                <ArrowUpRight className="h-4 w-4" />
                            </button>
                        </div>
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
            <section className="relative w-full h-[70vh] md:h-screen bg-gradient-to-t from-[#ff9a9e] via-[#ffd1d5] to-white flex items-start justify-center pt-12 md:pt-32">
                {/* Background Image - Full image shown at bottom */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="/background.png"
                        alt="Background"
                        className="h-full w-full object-contain object-bottom opacity-80"
                    />
                </div>

                {/* Text + Button - Top aligned on mobile, centered on desktop */}
                <div className="relative z-10 mx-auto max-w-4xl text-center px-6">
                    <h2 className="mb-3 text-3xl font-bold tracking-tight text-slate-900 md:mb-4 md:text-5xl lg:text-7xl">
                        {t.footerCtaTitle}
                    </h2>

                    <p className="mb-6 text-base text-slate-700 md:mb-8 md:text-lg lg:text-xl font-medium">
                        {t.footerCtaSubtitle}
                    </p>

                    <SignedOut>
                        <SignInButton mode="modal">
                            <button className="h-11 w-full min-w-[160px] rounded-full bg-white px-6 text-sm font-bold text-black shadow-xl shadow-slate-900/10 transition hover:scale-105 hover:bg-slate-100 hover:shadow-2xl sm:h-12 sm:min-w-[180px] sm:px-8 sm:text-base sm:w-auto">
                                {t.tryForFree}
                            </button>
                        </SignInButton>
                    </SignedOut>
                </div>
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
