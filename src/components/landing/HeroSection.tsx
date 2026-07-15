"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { ArrowRight, Command } from "lucide-react";
import { LoadingLink } from "~/components/LoadingLink";
import { LazyVideo } from "./LazyVideo";
import { type Language } from "~/lib/i18n";

interface HeroSectionProps {
  t: any;
  currentLang: Language;
}

// Helper to get localized path
function getLocalizedPath(path: string, lang: Language): string {
  if (lang === "en") return path;
  return `/${lang}${path}`;
}

const CARD_HEIGHT = 420;
const CARD_GAP = 8; // Reduced gap between cards
const TOTAL_CARD_HEIGHT = CARD_HEIGHT + CARD_GAP;
const TYPING_SPEED = 35;
const VISIBLE_CARDS = 3;
const AUTO_ADVANCE_DELAY = 7000; // 7 seconds per card

// Mobile horizontal slider constants - maintain same aspect ratio as desktop (width:height ≈ 0.83)
const MOBILE_CARD_WIDTH = 220;
const MOBILE_CARD_HEIGHT = 265; // Same ratio as desktop (350/420)
const MOBILE_CARD_GAP = 12;
const TOTAL_MOBILE_CARD_WIDTH = MOBILE_CARD_WIDTH + MOBILE_CARD_GAP;

// Cloudinary video URLs - optimized with f_auto for best format, q_auto for quality
// Replace these with your own Cloudinary video URLs when ready
const CLOUDINARY_VIDEOS = [
  "https://res.cloudinary.com/di76ibrro/video/upload/v1767877805/2026-01-08_05-07-50_online-video-cutter.com_yggzut.mp4",
  "https://res.cloudinary.com/di76ibrro/video/upload/v1767878128/2026-01-08_05-13-43_online-video-cutter.com_dymw7x.mp4",
  "https://res.cloudinary.com/di76ibrro/video/upload/v1767878458/2026-01-08_05-18-55_online-video-cutter.com_q4onv0.mp4",
  "https://res.cloudinary.com/di76ibrro/video/upload/v1767879225/2026-01-08_05-27-57_online-video-cutter.com_bwcnuh.mp4",
  "https://res.cloudinary.com/di76ibrro/video/upload/v1767877229/2026-01-0804-48-10online-video-cutter.com1-ezgif_iclikm.mp4",
];

export function HeroSection({ t, currentLang }: HeroSectionProps) {
  const localPath = (path: string) => getLocalizedPath(path, currentLang);
  
  // Create cards with video URLs
  const baseCards = useMemo(() => [
    { id: 1, prompt: t.heroCard1Prompt || "Create a 10-slide investor pitch deck for my AI startup with market analysis and financials...", video: CLOUDINARY_VIDEOS[0] },
    { id: 2, prompt: t.heroCard2Prompt || "Generate a quarterly sales report with charts showing revenue growth and KPIs...", video: CLOUDINARY_VIDEOS[1] },
    { id: 3, prompt: t.heroCard3Prompt || "Design a professional team introduction with photos and role descriptions...", video: CLOUDINARY_VIDEOS[2] },
    { id: 4, prompt: t.heroCard4Prompt || "Build a comprehensive business plan presentation with SWOT analysis...", video: CLOUDINARY_VIDEOS[3] },
    { id: 5, prompt: t.heroCard5Prompt || "Create an engaging product demo showcasing features and benefits...", video: CLOUDINARY_VIDEOS[4] },
  ], [t]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const mobileContainerRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const dragStartX = useRef(0);
  const lastY = useRef(0);
  const lastX = useRef(0);
  const velocity = useRef(0);
  const velocityX = useRef(0);
  const animationFrame = useRef<number>(undefined);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoAdvanceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [mobileDragOffset, setMobileDragOffset] = useState(0);
  const [isMobileDragging, setIsMobileDragging] = useState(false);

  // Get the actual card index with infinite loop wrapping
  const getWrappedIndex = (index: number) => {
    const len = baseCards.length;
    return ((index % len) + len) % len;
  };

  // Get current card data
  const currentCard = baseCards[getWrappedIndex(activeIndex)];

  // Auto-advance to next card after 7 seconds
  const advanceToNextCard = useCallback(() => {
    if (autoAdvanceTimeoutRef.current) clearTimeout(autoAdvanceTimeoutRef.current);
    autoAdvanceTimeoutRef.current = setTimeout(() => {
      setActiveIndex((prev) => prev + 1);
    }, AUTO_ADVANCE_DELAY);
  }, []);

  // Typing animation - starts advance timer when complete
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

  const snapToNearestMobile = useCallback((currentOffset: number, vel: number) => {
    const projectedOffset = currentOffset + vel * 0.3;
    const targetIndex = Math.round(-projectedOffset / TOTAL_MOBILE_CARD_WIDTH);
    setActiveIndex(targetIndex);
    setMobileDragOffset(0);
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

  // Mobile horizontal drag handlers
  const handleMobileDragStart = useCallback((clientX: number) => {
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    if (autoAdvanceTimeoutRef.current) clearTimeout(autoAdvanceTimeoutRef.current);
    setIsMobileDragging(true);
    dragStartX.current = clientX;
    lastX.current = clientX;
    velocityX.current = 0;
    if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
  }, []);

  const handleMobileDragMove = useCallback(
    (clientX: number) => {
      if (!isMobileDragging) return;
      const delta = clientX - lastX.current;
      velocityX.current = delta;
      lastX.current = clientX;
      setMobileDragOffset((prev) => prev + delta);
    },
    [isMobileDragging]
  );

  const handleMobileDragEnd = useCallback(() => {
    if (!isMobileDragging) return;
    setIsMobileDragging(false);
    snapToNearestMobile(mobileDragOffset - activeIndex * TOTAL_MOBILE_CARD_WIDTH, velocityX.current);
  }, [isMobileDragging, mobileDragOffset, activeIndex, snapToNearestMobile]);

  const onMobileTouchStart = (e: React.TouchEvent) => {
    handleMobileDragStart(e.touches[0]!.clientX);
  };
  const onMobileTouchMove = (e: React.TouchEvent) => {
    handleMobileDragMove(e.touches[0]!.clientX);
  };
  const onMobileTouchEnd = () => handleMobileDragEnd();

  // Generate visible cards (render extra cards for smooth infinite scroll)
  const getVisibleCards = () => {
    const visibleRange = 3;
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
    const dragScale = 0.92;
    const scale = isDragging ? dragScale : Math.max(0.82, Math.min(1, normalScale));

    const opacity = Math.max(0.2, 1 - distanceFromCenter * 0.4);
    const zIndex = 10 - Math.floor(distanceFromCenter);

    return {
      transform: `translateY(${y}px) scale(${scale})`,
      opacity,
      zIndex,
      filter: `blur(${distanceFromCenter * 0.6}px)`,
      transition: "all 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)",
    };
  };

  // Mobile horizontal card style
  const getMobileCardStyle = (virtualIndex: number) => {
    const baseOffset = -activeIndex * TOTAL_MOBILE_CARD_WIDTH;
    const currentOffset = baseOffset + mobileDragOffset;
    const x = virtualIndex * TOTAL_MOBILE_CARD_WIDTH + currentOffset;

    const distanceFromCenter = Math.abs(x) / TOTAL_MOBILE_CARD_WIDTH;
    const normalScale = 1 - distanceFromCenter * 0.1;
    const dragScale = 0.95;
    const scale = isMobileDragging ? dragScale : Math.max(0.85, Math.min(1, normalScale));

    const opacity = Math.max(0.3, 1 - distanceFromCenter * 0.3);
    const zIndex = 10 - Math.floor(distanceFromCenter);

    return {
      transform: `translateX(${x}px) scale(${scale})`,
      opacity,
      zIndex,
      transition: isMobileDragging ? "none" : "all 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)",
    };
  };

  const handleIndicatorClick = (idx: number) => {
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    if (autoAdvanceTimeoutRef.current) clearTimeout(autoAdvanceTimeoutRef.current);
    const currentWrapped = getWrappedIndex(activeIndex);
    const diff = idx - currentWrapped;
    setActiveIndex(activeIndex + diff);
    setDragOffset(0);
  };

  const visibleCards = getVisibleCards();
  const containerHeight = VISIBLE_CARDS * TOTAL_CARD_HEIGHT;

  return (
    <section className="relative min-h-[600px] h-auto lg:h-[95vh] flex items-center justify-center overflow-hidden">
      {/* Hero halo over the global atmosphere */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 h-[420px] w-[720px] rounded-full bg-violet-600/[0.14] blur-[130px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 w-full pt-24 pb-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center lg:min-h-[calc(100vh-160px)]">
          {/* Left Column */}
          <div className="flex flex-col justify-center max-w-xl">
            {/* Eyebrow badge */}
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 shadow-sm backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-500 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" />
              </span>
              <span className="text-[13px] font-semibold tracking-wide text-slate-300">
                AI presentation studio
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.08] mb-6">
              {t.heroTitle} <br />
              <span className="bg-gradient-to-r from-violet-400 via-sky-300 to-cyan-300 bg-clip-text text-transparent">
                {t.heroSubtitle}
              </span>
            </h1>

            <p className="text-lg text-slate-400 mb-8 leading-relaxed">
              {t.heroDescription}
            </p>

            {/* Prompt Box synced with cards — glass card with gradient ring */}
            <div className="relative w-full mb-8 group">
              <div className="absolute -inset-[1.5px] rounded-2xl bg-gradient-to-r from-violet-500/50 via-cyan-400/50 to-fuchsia-500/40 opacity-70 blur-[1.5px] transition-opacity group-hover:opacity-100" />
              <div className="relative w-full rounded-2xl bg-[#0b1120]/90 border border-white/10 p-5 shadow-[0_16px_50px_-16px_rgba(0,0,0,0.6)] backdrop-blur">
                <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-cyan-400">
                    <Command className="w-3.5 h-3.5 text-white" />
                  </span>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {t.aiPrompt}
                  </span>
                  <span className="ml-auto rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold tabular-nums text-slate-400">
                    {getWrappedIndex(activeIndex) + 1}/{baseCards.length}
                  </span>
                </div>
                <div className="min-h-[72px] flex items-start">
                  <p className="text-slate-100 font-medium text-lg leading-relaxed">
                    {typedText}
                    {isTyping && (
                      <span className="inline-block w-0.5 h-5 ml-1 bg-gradient-to-b from-violet-400 to-cyan-400 animate-pulse align-middle" />
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <button
                    style={{ cursor: "url('/pointinghand.svg') 12 8, pointer" }}
                    className="group inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-violet-600 to-cyan-500 rounded-xl transition-all shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/40 hover:brightness-110"
                  >
                    {t.getStartedBtn || "Get Started"}
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <div style={{ cursor: "url('/pointinghand.svg') 12 8, pointer" }}>
                  <LoadingLink
                    href={localPath("/")}
                    className="group inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white bg-white/10 border border-white/15 rounded-xl hover:bg-white/15 transition-all shadow-lg"
                  >
                    {t.goToDashboard}
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
                  </LoadingLink>
                </div>
              </SignedIn>
              <span className="text-sm text-slate-500 px-2">{t.noCreditCard}</span>
            </div>

            {/* Proof strip */}
            <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-white/10 pt-6">
              {[
                { value: "100+", label: "Designer themes" },
                { value: "40+", label: "Smart layout families" },
                { value: "< 1 min", label: "Prompt to full deck" },
              ].map(({ value, label }) => (
                <div key={label} className="flex flex-col">
                  <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-violet-400 to-cyan-300 bg-clip-text text-transparent">
                    {value}
                  </span>
                  <span className="text-[12.5px] font-medium text-slate-500">{label}</span>
                </div>
              ))}
            </div>

            {/* Mobile Horizontal Slider - Below CTA buttons - Fixed height to prevent CLS */}
            <div className="lg:hidden mt-10 -mx-6 px-6" style={{ minHeight: MOBILE_CARD_HEIGHT + 60 }}>
              <div
                ref={mobileContainerRef}
                className={`relative overflow-hidden select-none ${isMobileDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                style={{ height: MOBILE_CARD_HEIGHT + 20 }}
                onTouchStart={onMobileTouchStart}
                onTouchMove={onMobileTouchMove}
                onTouchEnd={onMobileTouchEnd}
              >
                {/* Cards Container */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative" style={{ width: MOBILE_CARD_WIDTH, height: MOBILE_CARD_HEIGHT }}>
                    {visibleCards.map((card) => {
                      return (
                        <div
                          key={`mobile-${card.key}`}
                          className="absolute top-0"
                          style={{
                            ...getMobileCardStyle(card.virtualIndex),
                            width: MOBILE_CARD_WIDTH,
                            height: MOBILE_CARD_HEIGHT,
                            left: "50%",
                            marginLeft: -MOBILE_CARD_WIDTH / 2,
                          }}
                        >
                          <div className="w-full h-full overflow-hidden rounded-xl ring-1 ring-white/10 shadow-[0_18px_50px_-20px_rgba(0,0,0,0.75)] relative bg-zinc-900">
                            <LazyVideo
                              src={card.video || ""}
                              className="absolute inset-0 w-full h-full"
                              title={`Presentation demo ${card.id}`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Gradient Overlays - removed for mobile */}
              </div>

              {/* Mobile Indicators */}
              <div className="flex justify-center gap-1 mt-4" role="tablist" aria-label="Presentation slides">
                {baseCards.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleIndicatorClick(idx)}
                    style={{ cursor: "url('/pointinghand.svg') 12 8, pointer" }}
                    aria-label={`Go to slide ${idx + 1}`}
                    aria-selected={getWrappedIndex(activeIndex) === idx}
                    role="tab"
                    className="p-2 -m-1"
                  >
                    <span className={`block rounded-full transition-all duration-400 ${
                      getWrappedIndex(activeIndex) === idx
                        ? "w-6 h-2 bg-white"
                        : "w-2 h-2 bg-slate-600"
                    }`} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Full Height Card Scroller (hidden on mobile) */}
          <div className="relative hidden lg:flex items-center justify-center h-full">
            {/* Glow bed behind the scroller */}
            <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[70%] rounded-[48px] bg-gradient-to-b from-violet-500/20 via-cyan-400/15 to-fuchsia-500/20 blur-[70px]" />
            <div
              ref={containerRef}
              className={`relative w-full max-w-lg overflow-hidden select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
              style={{ height: containerHeight }}
              onMouseDown={onMouseDown}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {/* Cards Container */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-[350px]" style={{ height: CARD_HEIGHT }}>
                  {visibleCards.map((card) => {
                    return (
                      <div
                        key={card.key}
                        className="absolute left-0 right-0 mx-auto"
                        style={{
                          ...getCardStyle(card.virtualIndex),
                          height: CARD_HEIGHT,
                          width: 350,
                          top: "50%",
                          marginTop: -CARD_HEIGHT / 2,
                        }}
                      >
                        {/* Video card - lazy loaded */}
                        <div className="w-full h-full overflow-hidden rounded-2xl ring-1 ring-white/10 shadow-[0_24px_70px_-24px_rgba(0,0,0,0.8)] relative bg-zinc-900">
                          <LazyVideo
                            src={card.video || ""}
                            className="absolute inset-0 w-full h-full"
                            title={`Presentation demo ${card.id}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Gradient Overlays */}
              <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-[#070b14] to-transparent pointer-events-none z-20" />
              <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#070b14] to-transparent pointer-events-none z-20" />
            </div>

            {/* Indicators */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-1 mr-2" role="tablist" aria-label="Presentation slides">
              {baseCards.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleIndicatorClick(idx)}
                  style={{ cursor: "url('/pointinghand.svg') 12 8, pointer" }}
                  aria-label={`Go to slide ${idx + 1}`}
                  aria-selected={getWrappedIndex(activeIndex) === idx}
                  role="tab"
                  className="p-2 -m-1"
                >
                  <span className={`block w-2 rounded-full transition-all duration-400 ${
                    getWrappedIndex(activeIndex) === idx
                      ? "h-8 bg-white"
                      : "h-2 bg-slate-600 hover:bg-slate-400"
                  }`} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
