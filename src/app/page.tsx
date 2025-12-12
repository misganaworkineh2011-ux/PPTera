"use client";

import { useState } from "react";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import {
    Play,
    CheckCircle2,
    Wand2,
    Sparkles,
    Globe
} from "lucide-react";
import { LandingNavbar } from "~/components/LandingNavbar";
import { LandingFooter } from "~/components/LandingFooter";
import { cn } from "~/lib/utils";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-slate-900 selection:text-white">
            {/* Subtle Background Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-100px,#1e1e1e0a,transparent)]"></div>

            <LandingNavbar />

            {/* Hero Section */}
            <section className="relative pt-40 pb-20 px-6 overflow-hidden">
                <div className="mx-auto max-w-7xl">
                    <div className="flex flex-col items-center text-center">

                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/50 px-3 py-1 backdrop-blur-sm"
                        >
                            <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">AI Generation V2.0</span>
                        </motion.div>

                        {/* Headline */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                            className="relative z-10 max-w-5xl text-5xl font-extrabold tracking-tight text-slate-900 md:text-7xl lg:text-8xl"
                        >
                            Design beautiful <br />
                            <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent">presentations</span> with AI.
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="mt-8 max-w-2xl text-lg text-slate-500 md:text-xl"
                        >
                            The smartest way to create professional decks. Just describe your idea, and PPTMaster generates the story, design, and slides for you.
                        </motion.p>

                        {/* CTA Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
                        >
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
                        </motion.div>


                        {/* Hero Visual - Abstract Product Mockup */}
                        <motion.div
                            initial={{ opacity: 0, y: 60, rotateX: 20 }}
                            animate={{ opacity: 1, y: 0, rotateX: 0 }}
                            transition={{ delay: 0.5, type: "spring", damping: 20 }}
                            className="relative mt-20 w-full max-w-5xl md:mt-32 perspective-1000"
                        >
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
                                    <div className="flex-1 bg-white p-8 md:p-12 flex items-center justify-center bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-100">
                                        <div className="h-full w-full max-w-2xl rounded-xl bg-white shadow-2xl border border-slate-100 p-8 md:p-16 flex flex-col justify-center relative overflow-hidden group">
                                            {/* Simulated Slide Content */}
                                            <h2 className="text-3xl font-bold text-slate-900 md:text-5xl">Q4 Strategy Review</h2>
                                            <div className="mt-6 space-y-3">
                                                <div className="h-4 w-3/4 rounded bg-slate-100"></div>
                                                <div className="h-4 w-1/2 rounded bg-slate-100"></div>
                                            </div>

                                            {/* Magic AI Cursor/Badge */}
                                            <motion.div
                                                animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
                                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                                className="absolute bottom-10 right-10 flex items-center gap-2 rounded-full bg-black px-4 py-2 text-white shadow-xl"
                                            >
                                                <Sparkles className="h-4 w-4 text-amber-300" />
                                                <span className="text-xs font-bold">AI Generating...</span>
                                            </motion.div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Glass Cards Decoration */}
                            <div className="absolute -left-12 bottom-20 z-20 hidden md:block animate-bounce [animation-duration:3s]">
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

                            <div className="absolute -right-8 top-10 z-20 hidden md:block animate-bounce [animation-duration:4s]">
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
                        </motion.div>

                    </div>
                </div>
            </section>

            {/* Feature Grid / Premium Section 
                 - Updated Gradient from dashboard
                 - Increased padding ("give more time")
                 - Monochrome icons ("Hero like")
             */}
            <section className="relative z-10 py-32 px-6 lg:py-40 bg-gradient-to-br from-[#1e3a8a]/5 to-[#06b6d4]/5">
                <div className="mx-auto max-w-7xl">
                    {/* Feature Grid: Horizontal Scroll on Mobile, Grid on Desktop */}
                    <div className="flex overflow-x-auto gap-8 pb-8 -mx-6 px-6 md:grid md:grid-cols-2 md:gap-10 md:overflow-visible md:pb-0 md:mx-0 md:px-0 scrollbar-hide snap-x snap-mandatory">

                        {/* Card 1: Presentations */}
                        <div className="min-w-[85vw] md:min-w-0 snap-center group relative overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-2xl md:p-12 border border-white/50 hover:border-slate-200 flex flex-col h-full">
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="mb-8 md:mb-12">
                                    <div className="mb-6 inline-flex rounded-2xl bg-slate-50 p-4 text-slate-900 ring-1 ring-slate-100">
                                        <Play className="h-6 w-6" />
                                    </div>
                                    <h3 className="mb-4 text-3xl font-bold text-slate-900 tracking-tight">Smart Decks</h3>
                                    <p className="text-lg text-slate-500 leading-relaxed max-w-sm">
                                        Stunning slides with your brand DNA. Export to PowerPoint, PDF, or Google Slides instantly.
                                    </p>
                                </div>
                                <div className="relative h-64 md:h-80 w-full overflow-hidden rounded-3xl shadow-lg ring-1 ring-slate-100 transition-transform duration-500 group-hover:scale-[1.02]">
                                    <img
                                        src="https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80"
                                        alt="Presentation Slide"
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Card 2: Visual Docs */}
                        <div className="min-w-[85vw] md:min-w-0 snap-center group relative overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-2xl md:p-12 border border-white/50 hover:border-slate-200 flex flex-col h-full">
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="mb-8 md:mb-12">
                                    <div className="mb-6 inline-flex rounded-2xl bg-slate-50 p-4 text-slate-900 ring-1 ring-slate-100">
                                        <CheckCircle2 className="h-6 w-6" />
                                    </div>
                                    <h3 className="mb-4 text-3xl font-bold text-slate-900 tracking-tight">Visual Docs</h3>
                                    <p className="text-lg text-slate-500 leading-relaxed max-w-sm">
                                        Engaging reports, proposals, and handouts that people actually read.
                                    </p>
                                </div>
                                <div className="relative h-64 md:h-80 w-full overflow-hidden rounded-3xl shadow-lg ring-1 ring-slate-100 transition-transform duration-500 group-hover:scale-[1.02]">
                                    <img
                                        src="https://images.unsplash.com/photo-1586282391129-76a6df840fd0?auto=format&fit=crop&w=800&q=80"
                                        alt="Document Preview"
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Card 3: Social Media */}
                        <div className="min-w-[85vw] md:min-w-0 snap-center group relative overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-2xl md:p-12 border border-white/50 hover:border-slate-200 flex flex-col h-full">
                            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12 h-full">
                                <div className="flex-1">
                                    <div className="mb-6 inline-flex rounded-2xl bg-slate-50 p-4 text-slate-900 ring-1 ring-slate-100">
                                        <Sparkles className="h-6 w-6" />
                                    </div>
                                    <h3 className="mb-4 text-2xl font-bold text-slate-900 tracking-tight">Social Media</h3>
                                    <p className="text-slate-500 leading-relaxed">
                                        Gorgeous graphics and convincing copy. Share directly to social platforms.
                                    </p>
                                </div>
                                <div className="h-48 w-40 overflow-hidden rounded-2xl shadow-lg rotate-3 ring-1 ring-slate-100 transition-transform duration-500 group-hover:rotate-0 group-hover:scale-105 shrink-0">
                                    <img
                                        src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=400&q=80"
                                        alt="Social Post"
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Card 4: Microsites */}
                        <div className="min-w-[85vw] md:min-w-0 snap-center group relative overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-2xl md:p-12 border border-white/50 hover:border-slate-200 flex flex-col h-full">
                            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12 h-full">
                                <div className="flex-1">
                                    <div className="mb-6 inline-flex rounded-2xl bg-slate-50 p-4 text-slate-900 ring-1 ring-slate-100">
                                        <Globe className="h-6 w-6" />
                                    </div>
                                    <h3 className="mb-4 text-2xl font-bold text-slate-900 tracking-tight">Websites</h3>
                                    <p className="text-slate-500 leading-relaxed">
                                        Business sites, landing pages, portfolios and more. No coding required.
                                    </p>
                                </div>
                                <div className="h-48 w-56 overflow-hidden rounded-2xl shadow-lg -rotate-2 ring-1 ring-slate-100 transition-transform duration-500 group-hover:rotate-0 group-hover:scale-105 shrink-0">
                                    <img
                                        src="https://images.unsplash.com/photo-1467232004587-fc7be6695161?auto=format&fit=crop&w=600&q=80"
                                        alt="Website Layout"
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* API Banner */}
                    <div className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md md:px-10 md:py-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Wand2 className="h-32 w-32 text-slate-900" />
                        </div>
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                            <div className="flex items-center gap-6">
                                <span className="rounded-lg bg-green-100 px-3 py-1 text-xs font-bold text-green-800 uppercase tracking-wide border border-green-200/50">Beta</span>
                                <div className="text-left">
                                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-1">
                                        <Wand2 className="h-5 w-5" />
                                        Developers API
                                    </h3>
                                    <p className="text-slate-500 hidden md:block">
                                        Connect to PPTMaster programmatically. Automate creation and scale your storytelling.
                                    </p>
                                </div>
                            </div>
                            <button className="whitespace-nowrap rounded-full bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200">
                                Read documentation
                            </button>
                        </div>
                    </div>

                    {/* Logo Section */}
                    <div className="mt-32 text-center">
                        <p className="mb-10 text-lg font-medium text-slate-400">
                            Your next big idea is in good company.
                        </p>
                        <div className="relative">
                            {/* Cloud/Gradient Effect - Match dashboard gradient but soft */}
                            <div className="absolute -inset-x-20 -bottom-20 h-40 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-blue-100/50 via-transparent to-transparent blur-3xl"></div>

                            <div className="relative z-10 flex flex-wrap justify-center gap-12 md:gap-20 opacity-60 grayscale transition-all duration-500 hover:grayscale-0 hover:opacity-100 items-center">
                                {/* Logos - Increased size approx 3x */}
                                <Image src="/companyLogo/amazon.png" alt="Amazon" width={300} height={90} className="h-20 w-auto object-contain" />
                                <Image src="/companyLogo/adobe.png" alt="Adobe" width={300} height={90} className="h-24 w-auto object-contain" />
                                <Image src="/companyLogo/vercel.png" alt="Vercel" width={300} height={90} className="h-20 w-auto object-contain" />
                                <Image src="/companyLogo/zoom.png" alt="Zoom" width={300} height={90} className="h-16 w-auto object-contain" />
                                <Image src="/companyLogo/losangelestimes.png" alt="Los Angeles Times" width={420} height={90} className="h-16 w-auto object-contain" />
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* Generate / Shape / Share Section 
                - Updated background to "Settled/Creamy"
            */}
            <section className="relative z-10 py-24 px-6 md:py-32 bg-gradient-to-b from-white to-[#fffbf7]">
                <div className="mx-auto max-w-7xl">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">Creative content at the speed of light.</h2>
                    </div>

                    {/* Generate */}
                    <div className="grid gap-12 md:grid-cols-2 items-center mb-32">
                        <motion.div
                            initial={{ opacity: 0, x: -40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="order-2 md:order-1"
                        >
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
                        </motion.div>
                        <div className="order-1 md:order-2 rounded-3xl bg-white p-2 shadow-2xl border border-slate-100 rotate-2 hover:rotate-0 transition-transform duration-500">
                            <img src="https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=800&q=80" alt="Creation UI" className="rounded-2xl" />
                        </div>
                    </div>

                    {/* Shape */}
                    <div className="grid gap-12 md:grid-cols-2 items-center mb-32">
                        <div className="rounded-3xl bg-white p-2 shadow-2xl border border-slate-100 -rotate-2 hover:rotate-0 transition-transform duration-500">
                            <img src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80" alt="Editing UI" className="rounded-2xl" />
                        </div>
                        <motion.div
                            initial={{ opacity: 0, x: 40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
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
                        </motion.div>
                    </div>

                    {/* Share */}
                    <div className="grid gap-12 md:grid-cols-2 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
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
                        </motion.div>
                        <div className="rounded-3xl bg-white p-2 shadow-2xl border border-slate-100 rotate-2 hover:rotate-0 transition-transform duration-500">
                            <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80" alt="Sharing UI" className="rounded-2xl" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials 
                 - Horizontal Marquee 
                 - White background
            */}
            {/* Testimonials - Manual Carousel */}
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

function TestimonialCarousel() {

    const [index, setIndex] = useState(0);
    const testimonials = [
        { quote: "Beyond saving me hours of labor that I now channel into more meaningful work, PPTMaster has made me something of a campus hero!", author: "Christina Salazar", role: "Development Teacher" },
        { quote: "No matter what I create, PPTMaster is the home for my best complex ideas, expressed beautifully and with elegance.", author: "Jordan Crawford", role: "Founder" },
        { quote: "PPTMaster has been a game-changer for internal collaboration, eliminating our startup's reliance on traditional slides and documents.", author: "Young Zhao", role: "Founder" },
        { quote: "PPTMaster is our choice. You've created the perfect balance between customizability and fast workflow.", author: "Jeff Shuck", role: "Principal Consultant" },
        { quote: "This product rocks! I no longer use Google Slides — it just seems so prehistoric compared to PPTMaster!", author: "Denise Penn", role: "Creator" },
        { quote: "PPTMaster got rid of the website design bottleneck; now our pages pop up fast, on brand, and ready to rock.", author: "Darby Rollins", role: "Educator" },
    ];

    // We want to show 3 at a time.
    // Logic: index represents the start.
    const visibleTestimonials = [
        testimonials[index % testimonials.length],
        testimonials[(index + 1) % testimonials.length],
        testimonials[(index + 2) % testimonials.length]
    ];

    const next = () => setIndex((prev: number) => (prev + 1) % testimonials.length);
    const prev = () => setIndex((prev: number) => (prev - 1 + testimonials.length) % testimonials.length);

    return (
        <div className="relative mx-auto max-w-7xl px-6">
            <div className="relative">
                {/* Fade Masks - "3 cards in the left and right is fading design" - interpreted as fading edges of container */}
                <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-white to-transparent"></div>
                <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-white to-transparent"></div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {visibleTestimonials.map((t, i) => (
                        <div key={`${index}-${i}`} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-8 shadow-sm transition hover:shadow-md hover:bg-white text-left">
                            <p className="mb-6 text-lg text-slate-700 leading-relaxed italic">"{t?.quote}"</p>
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-slate-200 overflow-hidden shrink-0">
                                    {/* Random placeholder avatar based on index */}
                                    <img src={`https://images.unsplash.com/photo-${1500000000000 + ((index + i) % 9)}?auto=format&fit=crop&w=100&q=80`} alt={t?.author} className="h-full w-full object-cover" />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900 text-base">{t?.author}</div>
                                    <div className="text-sm text-slate-500">{t?.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Navigation Buttons */}
                <div className="mt-12 flex justify-center gap-4">
                    <button onClick={prev} className="rounded-full bg-white border border-slate-200 p-4 text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button onClick={next} className="rounded-full bg-white border border-slate-200 p-4 text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>
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
        setIndex((prev) => (prev + 1) % testimonials.length);
    };
    const prev = () => {
        setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    // Calculate indices for 3 cards: prev, current, next
    const getVisibleIndices = () => {
        const prevIndex = (index - 1 + testimonials.length) % testimonials.length;
        const nextIndex = (index + 1) % testimonials.length;
        return [prevIndex, index, nextIndex];
    };
    const visibleIndices = getVisibleIndices();

    return (
        <div className="relative mx-auto max-w-7xl px-6 group pb-4"> {/* Reduced padding bottom */}
            <div className="relative h-[400px] flex items-center justify-center overflow-visible md:overflow-hidden">
                {/* 
                   Center Mode Implementation:
                   We display 3 items. 
                   Middle one is scale-100 opacity-100 z-10.
                   Side ones are scale-90 opacity-50 z-0.
                   We position them absolutely to animate transitions? 
                   Or use a flex row and animate properties?
                   Absolute is easier for "centering" without complex scroll calc issues.
                */}
                <AnimatePresence mode='popLayout'>
                    {visibleIndices.map((idx, i) => {
                        // i=0 -> Left, i=1 -> Center, i=2 -> Right
                        let position = i === 0 ? "left" : i === 1 ? "center" : "right";
                        // Mobile Override: Only show center? Or stack?
                        // User asked for "1 in middle two fading", implies desktop view.

                        return (
                            <motion.div
                                key={`${idx}-${position}`}
                                layout
                                initial={{
                                    opacity: 0,
                                    scale: 0.8,
                                    x: position === "left" ? "-100%" : position === "right" ? "100%" : 0
                                }}
                                animate={{
                                    opacity: position === "center" ? 1 : 0.5,
                                    scale: position === "center" ? 1 : 0.9,
                                    zIndex: position === "center" ? 20 : 10,
                                    x: position === "left" ? "-60%" : position === "right" ? "60%" : "0%",
                                    y: 0
                                }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.5, type: "spring" }}
                                className={`absolute w-[85vw] md:w-[600px] p-6 md:p-10 rounded-3xl border bg-white shadow-xl flex flex-col justify-center text-center md:text-left
                                    ${position === "center" ? "border-slate-200 shadow-2xl" : "border-slate-100 bg-slate-50"}
                                `}
                            >
                                <p className={`mb-6 text-lg md:text-xl font-medium leading-relaxed italic ${position === "center" ? "text-slate-800" : "text-slate-500"}`}>
                                    "{testimonials[idx]?.quote}"
                                </p>
                                <div className="flex items-center gap-4 justify-center md:justify-start">
                                    <div className="h-12 w-12 rounded-full bg-slate-200 overflow-hidden shrink-0">
                                        <img src={`https://images.unsplash.com/photo-${1500000000000 + (idx % 9)}?auto=format&fit=crop&w=100&q=80`} alt={testimonials[idx]?.author} className="h-full w-full object-cover" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 text-base">{testimonials[idx]?.author}</div>
                                        <div className="text-sm text-slate-500">{testimonials[idx]?.role}</div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            <div className="mt-6 flex justify-center gap-4">
                <button onClick={prev} className="rounded-full bg-white border border-slate-200 p-4 text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 active:scale-95 z-30 relative">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button onClick={next} className="rounded-full bg-white border border-slate-200 p-4 text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 active:scale-95 z-30 relative">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>
        </div>
    );
}
