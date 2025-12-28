"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { ArrowRight, Sparkles, Command } from "lucide-react";
import { LoadingLink } from "~/components/LoadingLink";

interface HeroSectionProps { t: any; }

const slides = [
  {
    id: 1,
    prompt: "Create a modern pitch deck for a sustainable energy startup...",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop", 
    alt: "Title Slide Screenshot"
  },
  {
    id: 2,
    prompt: "Generate a financial dashboard showing Q4 growth...",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop",
    alt: "Metrics Slide Screenshot"
  },
  {
    id: 3,
    prompt: "Design a team introduction slide with photos...",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2670&auto=format&fit=crop",
    alt: "Team Slide Screenshot"
  },
  {
    id: 4,
    prompt: "Add a minimalist mission statement slide...",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
    alt: "Mission Slide Screenshot"
  },
  {
    id: 5,
    prompt: "Create a closing summary with contact details...",
    image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=2574&auto=format&fit=crop",
    alt: "Contact Slide Screenshot"
  },
];

const SLIDE_DURATION = 8000; // 8 seconds per slide
const TYPING_SPEED = 80;     // Speed of typing

export function HeroSection({ t }: HeroSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  // Refs to track timers so we can clear them reliably
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Handle Typing Logic
  useEffect(() => {
    // Cleanup previous timers immediately when activeIndex changes
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);

    const currentPrompt = slides[activeIndex]?.prompt || "";
    setTypedText(""); // Reset text
    setIsTyping(true);
    let charIndex = 0;

    // Start typing after a brief delay
    typingTimeoutRef.current = setTimeout(() => {
      typingIntervalRef.current = setInterval(() => {
        if (charIndex < currentPrompt.length) {
          setTypedText(currentPrompt.slice(0, charIndex + 1));
          charIndex++;
        } else {
          setIsTyping(false);
          if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
        }
      }, TYPING_SPEED);
    }, 500);

    // Cleanup function when component unmounts or activeIndex changes
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    };
  }, [activeIndex]);

  // 2. Handle Auto-Advance Logic
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, SLIDE_DURATION);

    return () => clearInterval(slideTimer);
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center bg-white overflow-hidden pt-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* LEFT COLUMN: Text Content */}
          <div className="flex flex-col justify-center max-w-xl">
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-zinc-900 leading-[1.1] mb-6">
              {t.heroTitle} <br />
              <span className="text-zinc-400">{t.heroSubtitle}</span>
            </h1>

            <p className="text-lg text-zinc-600 mb-8 leading-relaxed">
              Transform your ideas into stunning presentations in seconds. 
              Just type what you need, and our AI handles the design, layout, and formatting.
            </p>

            {/* Input Simulation Box */}
            <div className="w-full bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-zinc-100 p-4 mb-8">
              <div className="flex items-center gap-2 mb-3 border-b border-zinc-50 pb-3">
                <Command className="w-4 h-4 text-zinc-300" />
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">AI Prompt</span>
              </div>
              <div className="min-h-[60px] flex items-start">
                <p className="text-zinc-800 font-medium text-lg leading-relaxed">
                  {typedText}
                  {isTyping && <span className="inline-block w-0.5 h-5 ml-1 bg-zinc-900 animate-pulse align-middle" />}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-all shadow-lg hover:shadow-zinc-900/20">
                    {t.getStarted} <ArrowRight className="w-5 h-5" />
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <LoadingLink href="/dashboard" className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-all shadow-lg hover:shadow-zinc-900/20">
                  {t.goToDashboard} <ArrowRight className="w-5 h-5" />
                </LoadingLink>
              </SignedIn>
              <span className="text-sm text-zinc-500 px-2">No credit card required</span>
            </div>
          </div>

          {/* RIGHT COLUMN: Slide Image Viewer */}
          <div className="relative w-full">
            {/* Image Container with 16:9 Aspect Ratio */}
            <div 
              className="relative aspect-[16/9] w-full bg-zinc-100 rounded-xl overflow-hidden shadow-2xl transition-all duration-500"
              style={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)" }}
            >
              {/* Render Current Slide Image */}
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    index === activeIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                  }`}
                >
                  <Image
                    src={slide.image}
                    alt={slide.alt}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                  {/* Subtle Gradient Overlay for depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
                </div>
              ))}

              {/* Slide Counter Badge */}
              <div className="absolute bottom-4 right-4 z-20 px-3 py-1 bg-black/70 backdrop-blur-md rounded-full text-white text-xs font-medium">
                Slide {activeIndex + 1} / {slides.length}
              </div>
            </div>

            {/* Indicators (Non-clickable) */}
            <div className="flex justify-center gap-2 mt-6">
              {slides.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    idx === activeIndex 
                      ? "w-8 bg-zinc-900" 
                      : "w-2 bg-zinc-300"
                  }`}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}