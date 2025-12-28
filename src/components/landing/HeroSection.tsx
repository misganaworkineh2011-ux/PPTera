"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { ArrowRight, Command } from "lucide-react";
import { LoadingLink } from "~/components/LoadingLink";

interface HeroSectionProps {
  t: any;
}

const baseCards = [
  { id: 1, title: "Pitch Deck", prompt: "Create a modern pitch deck for a sustainable energy startup...", gradient: "from-blue-500/20 to-cyan-500/20" },
  { id: 2, title: "Financial Report", prompt: "Generate a financial dashboard showing Q4 growth metrics...", gradient: "from-purple-500/20 to-pink-500/20" },
  { id: 3, title: "Team Introduction", prompt: "Design a team introduction slide with professional photos...", gradient: "from-amber-500/20 to-orange-500/20" },
  { id: 4, title: "Mission Statement", prompt: "Add a minimalist mission statement slide with impact...", gradient: "from-emerald-500/20 to-teal-500/20" },
  { id: 5, title: "Product Launch", prompt: "Create an exciting product launch announcement slide...", gradient: "from-rose-500/20 to-red-500/20" },
  { id: 6, title: "Market Analysis", prompt: "Build a comprehensive market analysis with charts...", gradient: "from-indigo-500/20 to-violet-500/20" },
  { id: 7, title: "Contact Slide", prompt: "Create a closing summary with contact details...", gradient: "from-sky-500/20 to-blue-500/20" },
];

const CARD_HEIGHT = 420;
const CARD_GAP = 14;
const TOTAL_CARD_HEIGHT = CARD_HEIGHT + CARD_GAP;
const TYPING_SPEED = 35;
const VISIBLE_CARDS = 3;

export function HeroSection({ t }: HeroSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const lastY = useRef(0);
  const velocity = useRef(0);
  const animationFrame = useRef<number>(undefined);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoAdvanceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get the actual card index with infinite loop wrapping
  const getWrappedIndex = (index: number) => {
    const len = baseCards.length;
    return ((index % len) + len) % len;
  };

  // Get current card data
  const currentCard = baseCards[getWrappedIndex(activeIndex)];

  // Auto-advance to next card when typing finishes
  const advanceToNextCard = useCallback(() => {
    if (autoAdvanceTimeoutRef.current) clearTimeout(autoAdvanceTimeoutRef.current);
    autoAdvanceTimeoutRef.current = setTimeout(() => {
      setActiveIndex((prev) => prev + 1);
    }, 600);
  }, []);

  // Typing animation - advances card when complete
  useEffect(() => {
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    if (autoAdvanceTimeoutRef.current) clearTimeout(autoAdvanceTimeoutRef.current);

    const currentPrompt = currentCard?.prompt || "";
    setTypedText("");
    setIsTyping(true);
    let charIndex = 0;

    const startTyping = setTimeout(() => {
      typingIntervalRef.current = setInterval(() => {
        if (charIndex < currentPrompt.length) {
          setTypedText(currentPrompt.slice(0, charIndex + 1));
          charIndex++;
        } else {
          setIsTyping(false);
          if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
          advanceToNextCard();
        }
      }, TYPING_SPEED);
    }, 300);

    return () => {
      clearTimeout(startTyping);
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
      if (autoAdvanceTimeoutRef.current) clearTimeout(autoAdvanceTimeoutRef.current);
    };
  }, [activeIndex, currentCard?.prompt, advanceToNextCard]);

  const snapToNearest = useCallback((currentOffset: number, vel: number) => {
    const projectedOffset = currentOffset + vel * 0.3;
    const targetIndex = Math.round(-projectedOffset / TOTAL_CARD_HEIGHT);
    setActiveIndex(targetIndex);
    setDragOffset(0);
  }, []);

  const handleDragStart = useCallback((clientY: number) => {
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    if (autoAdvanceTimeoutRef.current) clearTimeout(autoAdvanceTimeoutRef.current);
    setIsDragging(true);
    dragStartY.current = clientY;
    lastY.current = clientY;
    velocity.current = 0;
    if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
  }, []);

  const handleDragMove = useCallback(
    (clientY: number) => {
      if (!isDragging) return;
      const delta = clientY - lastY.current;
      velocity.current = delta;
      lastY.current = clientY;
      setDragOffset((prev) => prev + delta);
    },
    [isDragging]
  );

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    snapToNearest(dragOffset - activeIndex * TOTAL_CARD_HEIGHT, velocity.current);
  }, [isDragging, dragOffset, activeIndex, snapToNearest]);

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientY);
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleDragMove(e.clientY);
    const onMouseUp = () => handleDragEnd();

    if (isDragging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  const onTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0]!.clientY);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0]!.clientY);
  };
  const onTouchEnd = () => handleDragEnd();

  // Generate visible cards (render extra cards for smooth infinite scroll)
  const getVisibleCards = () => {
    const visibleRange = 3; // Cards above and below center
    const result = [];
    for (let i = -visibleRange; i <= visibleRange; i++) {
      const virtualIndex = activeIndex + i;
      const actualIndex = getWrappedIndex(virtualIndex);
      result.push({
        ...baseCards[actualIndex]!,
        virtualIndex,
        key: `${virtualIndex}-${actualIndex}`,
      });
    }
    return result;
  };

  const getCardStyle = (virtualIndex: number) => {
    const baseOffset = -activeIndex * TOTAL_CARD_HEIGHT;
    const currentOffset = baseOffset + dragOffset;
    const y = virtualIndex * TOTAL_CARD_HEIGHT + currentOffset;

    const distanceFromCenter = Math.abs(y) / TOTAL_CARD_HEIGHT;
    const normalScale = 1 - distanceFromCenter * 0.15;
    // When dragging, all cards equalize to ~0.92 scale (middle shrinks, sides grow)
    const dragScale = 0.92;
    const scale = isDragging ? dragScale : Math.max(0.82, Math.min(1, normalScale));

    const opacity = Math.max(0.2, 1 - distanceFromCenter * 0.4);
    const zIndex = 10 - Math.floor(distanceFromCenter);

    return {
      transform: `translateY(${y}px) scale(${scale})`,
      opacity,
      zIndex,
      filter: `blur(${distanceFromCenter * 0.6}px)`,
      transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
    };
  };

  const handleIndicatorClick = (idx: number) => {
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    if (autoAdvanceTimeoutRef.current) clearTimeout(autoAdvanceTimeoutRef.current);
    // Calculate the closest path to the target
    const currentWrapped = getWrappedIndex(activeIndex);
    const diff = idx - currentWrapped;
    setActiveIndex(activeIndex + diff);
    setDragOffset(0);
  };

  const visibleCards = getVisibleCards();
  const containerHeight = VISIBLE_CARDS * TOTAL_CARD_HEIGHT;

  return (
    <section className="relative h-[95vh] min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image src="/herobg.jpeg" alt="Hero background" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-white/85 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 w-full py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[calc(100vh-160px)]">
          {/* Left Column */}
          <div className="flex flex-col justify-center max-w-xl">
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-zinc-900 leading-[1.1] mb-6">
              {t.heroTitle} <br />
              <span className="text-zinc-400">{t.heroSubtitle}</span>
            </h1>

            <p className="text-lg text-zinc-600 mb-8 leading-relaxed">
              Transform your ideas into stunning presentations in seconds. Just type what you need,
              and our AI handles the design, layout, and formatting.
            </p>

            {/* Prompt Box synced with cards */}
            <div className="w-full bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-zinc-100 p-5 mb-8">
              <div className="flex items-center gap-2 mb-3 border-b border-zinc-50 pb-3">
                <Command className="w-4 h-4 text-zinc-300" />
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  AI Prompt
                </span>
                <span className="ml-auto text-xs text-zinc-300">
                  {getWrappedIndex(activeIndex) + 1}/{baseCards.length}
                </span>
              </div>
              <div className="min-h-[72px] flex items-start">
                <p className="text-zinc-800 font-medium text-lg leading-relaxed">
                  {typedText}
                  {isTyping && (
                    <span className="inline-block w-0.5 h-5 ml-1 bg-zinc-900 animate-pulse align-middle" />
                  )}
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
                <LoadingLink
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-all shadow-lg hover:shadow-zinc-900/20"
                >
                  {t.goToDashboard} <ArrowRight className="w-5 h-5" />
                </LoadingLink>
              </SignedIn>
              <span className="text-sm text-zinc-500 px-2">No credit card required</span>
            </div>
          </div>

          {/* Right Column - Full Height Card Scroller */}
          <div className="relative flex items-center justify-center h-full">
            <div
              ref={containerRef}
              className="relative w-full max-w-lg overflow-hidden select-none"
              style={{ 
                height: containerHeight,
                cursor: isDragging ? "grabbing" : "grab" 
              }}
              onMouseDown={onMouseDown}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {/* Cards Container */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-[320px] sm:w-[360px] md:w-[380px]" style={{ height: CARD_HEIGHT }}>
                  {visibleCards.map((card) => (
                    <div
                      key={card.key}
                      className="absolute left-0 right-0 mx-auto px-4"
                      style={{
                        ...getCardStyle(card.virtualIndex),
                        height: CARD_HEIGHT,
                        top: "50%",
                        marginTop: -CARD_HEIGHT / 2,
                      }}
                    >
                      <div
                        className={`w-full h-full bg-gradient-to-br ${card.gradient} bg-white border border-zinc-200/50  backdrop-blur-sm p-6 flex flex-col justify-between`}
                      >
                        <div>
                          <div className="w-14 h-14 rounded-sm bg-white/80 shadow-sm flex items-center justify-center mb-4">
                            <span className="text-2xl font-bold text-zinc-700">{card.id}</span>
                          </div>
                          <h3 className="text-2xl font-semibold text-zinc-800">{card.title}</h3>
                        </div>
                        <p className="text-base text-zinc-600 line-clamp-2">{card.prompt}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gradient Overlays */}
              <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-white to-transparent pointer-events-none z-20" />
              <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-white to-transparent pointer-events-none z-20" />
            </div>

            {/* Indicators */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-2 mr-4">
              {baseCards.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleIndicatorClick(idx)}
                  className={`w-2 rounded-full transition-all duration-400 ${
                    getWrappedIndex(activeIndex) === idx
                      ? "h-8 bg-zinc-900"
                      : "h-2 bg-zinc-300 hover:bg-zinc-400"
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
