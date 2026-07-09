"use client";

import { useEffect, useState } from "react";
import { Zap, Crown, Users, ArrowRight, Check, Sparkles, Timer, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/Button";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface CyberMondayDealsProps {
  subscriptionPlan?: string | null;
}

export function DiscountBadgeBanner({ subscriptionPlan }: CyberMondayDealsProps) {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const [lifetimeProductId, setLifetimeProductId] = useState<string | null>(null);
  const [lifetimePrice, setLifetimePrice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLoadingPrice, setIsLoadingPrice] = useState(true);
  const [claimedCount, setClaimedCount] = useState<number>(0);
  
  // Inflate the claimed count by 4
  const displayedClaimedCount = claimedCount + 13;
  // Start with 20 spots, but expand if we get close to ensure there's always availability
  const totalSpots = Math.max(20, displayedClaimedCount + 4);

  const isLifetime = subscriptionPlan === 'lifetime';

  // Fixed epoch time to calculate continuous 3-day cycles
  const EPOCH_START_TIME = new Date("2024-01-01T00:00:00Z").getTime();
  const CYCLE_MS = 3 * 24 * 60 * 60 * 1000;
  
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Fetch lifetime product ID and price
    fetch("/api/polar/lifetime")
      .then((res) => res.json())
      .then((data) => {
        if (data.productId) {
          setLifetimeProductId(data.productId);
        }
        if (data.displayPrice) {
          setLifetimePrice(data.displayPrice);
        }
        if (data.claimedCount !== undefined) {
          setClaimedCount(data.claimedCount);
        }
      })
      .catch((err) => console.error("Failed to fetch lifetime product details", err))
      .finally(() => setIsLoadingPrice(false));

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const timeSinceEpoch = Math.max(0, now - EPOCH_START_TIME);
      const difference = CYCLE_MS - (timeSinceEpoch % CYCLE_MS);

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="w-full">
      {/* Premium shining banner with top-left to bottom-right glow */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#006482] to-[#014457] px-8 md:px-12 py-10 md:py-12 text-white rounded-[2.5rem] border border-[#006482]/30 group shadow-[0_0_20px_rgba(0,100,130,0.15)]">
        {/* Animated shining sweep from top-left to bottom-right */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Decorative glowing orbs */}
          <div className="absolute top-0 left-0 w-48 h-48 bg-[#06b6d4]/20 blur-[80px] rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-purple-600/20 blur-[80px] rounded-full translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10 w-full">
          {/* Left Side: Premium Typography */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-6 md:gap-8 text-center sm:text-left">
            <div className="relative group-hover:scale-110 transition-transform duration-500 shrink-0">
              <div className="absolute inset-0 bg-[#006482] blur-md opacity-20 group-hover:opacity-40" />
              <div className="relative p-4 rounded-[1.5rem] bg-white shadow-lg shadow-[#006482]/20">
                <img src="/logo.png" alt="PPTera Logo" className="h-10 w-10 md:h-12 md:w-12 object-contain" />
              </div>
            </div>
            
            <div className="flex flex-col items-center sm:items-start">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-none bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  100K USER DISCOUNT
                </h2>
                <div className="px-4 py-1.5 rounded-full bg-yellow-400 text-slate-900 text-xs font-black tracking-[0.2em] uppercase whitespace-nowrap">
                  ACTIVE
                </div>
              </div>
              <p className="text-lg sm:text-xl md:text-2xl text-slate-300 mt-3 md:mt-4 font-bold">
                Enjoy <span className="text-white font-black">50% OFF</span> all premium plans. Discount applied at checkout.
              </p>
            </div>
          </div>

          {/* Right Side: Enhanced Countdown */}
          <div className="shrink-0 flex flex-col items-center sm:items-end gap-3">
            <div className="flex gap-2 sm:gap-3">
              {[
                {
                  label: "DAYS",
                  value: timeLeft.days,
                },
                {
                  label: "HOURS",
                  value: timeLeft.hours,
                },
                {
                  label: "MINS",
                  value: timeLeft.minutes,
                },
                {
                  label: "SECS",
                  value: timeLeft.seconds,
                },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 backdrop-blur-md shadow-inner">
                    <span className="text-xl sm:text-2xl font-black tabular-nums text-white">
                      {String(item.value).padStart(2, '0')}
                    </span>
                  </div>
                  <span className="text-[10px] font-black text-slate-500 mt-2 tracking-widest">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center sm:items-end mt-2">
              <div className="flex items-center gap-2 text-yellow-400 text-xs sm:text-sm font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] animate-pulse">
                <Timer className="h-4 w-4 sm:h-5 sm:w-5" /> Limited Offer
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}