"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, AlertCircle, Zap } from "lucide-react";
import { cn } from "~/lib/utils";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useLanguage } from "~/contexts/LanguageContext";
import { dashboardTranslations } from "~/lib/dashboard-translations";
import { trackViewPricing, trackSelectPlan, trackBeginCheckout } from "~/components/GoogleAnalytics";

type PolarProduct = {
  key: string;
  name: string;
  description?: string;
  uiDescription?: string;
  monthly: {
    id: string;
    displayPrice: string;
    priceAmount: number;
    recurringInterval: string;
  } | null;
  yearly: {
    id: string;
    displayPrice: string;
    priceAmount: number;
    recurringInterval: string;
  } | null;
};

type TopupOption = {
  credits: number;
  price: number;
  priceDisplay: string;
  available: boolean;
};

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan?: string | null;
}

export default function PricingModal({ isOpen, onClose, currentPlan }: PricingModalProps) {
  const [isAnnual, setIsAnnual] = useState(true);
  const [products, setProducts] = useState<PolarProduct[]>([]);
  const [topupOptions, setTopupOptions] = useState<TopupOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [topupLoading, setTopupLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutLoadingId, setCheckoutLoadingId] = useState<string | null>(null);
  const [topupLoadingId, setTopupLoadingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"plans" | "topup">("plans");

  const { isSignedIn } = useUser();
  const router = useRouter();
  const { language } = useLanguage();
  const t = dashboardTranslations[language] || dashboardTranslations.en;

  const isPaidUser = currentPlan && currentPlan.toLowerCase() !== 'free';

  useEffect(() => {
    if (isOpen) {
      setCheckoutLoadingId(null);
      setTopupLoadingId(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && products.length === 0) loadProducts();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && topupOptions.length === 0) loadTopupOptions();
  }, [isOpen]);

  async function loadProducts() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/polar/products");
      if (!res.ok) throw new Error("Failed to load pricing");
      setProducts(await res.json());
      trackViewPricing();
    } catch (err) {
      console.error(err);
      setError("Could not load pricing plans.");
    } finally {
      setLoading(false);
    }
  }

  async function loadTopupOptions() {
    setTopupLoading(true);
    try {
      const res = await fetch("/api/polar/topup");
      if (!res.ok) throw new Error("Failed to load topup options");
      const data = await res.json();
      setTopupOptions(data.options || []);
    } catch (err) {
      console.error(err);
    } finally {
      setTopupLoading(false);
    }
  }

  const handleSubscribe = async (productKey: string) => {
    if (!isSignedIn) { router.push("/sign-in"); return; }
    const product = products.find(p => p.key === productKey);
    if (!product) return;
    const priceData = isAnnual ? product.yearly : product.monthly;
    if (!priceData) return;

    const price = priceData.priceAmount / 100;
    trackSelectPlan(productKey, price, isAnnual);

    setCheckoutLoadingId(productKey);
    try {
      trackBeginCheckout(productKey, price, isAnnual);
      const res = await fetch("/api/polar/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: priceData.id, recurringInterval: isAnnual ? "year" : "month" })
      });
      const data = await res.json();
      if (data.checkoutUrl) window.location.href = data.checkoutUrl;
      else throw new Error("No checkout URL");
    } catch (err) {
      console.error(err);
      alert("Failed to start checkout");
      setCheckoutLoadingId(null);
    }
  };

  const handleTopup = async (credits: number, index: number) => {
    if (!isSignedIn) { router.push("/sign-in"); return; }
    setTopupLoadingId(index);
    try {
      const res = await fetch("/api/polar/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credits: credits.toString() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start checkout");
      if (data.checkoutUrl) window.location.href = data.checkoutUrl;
      else throw new Error("No checkout URL");
    } catch (err: unknown) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to start checkout");
      setTopupLoadingId(null);
    }
  };

  if (!isOpen || typeof window === 'undefined') return null;

  const getPriceFromProducts = (key: string) => {
    const product = products.find(p => p.key === key);
    if (!product) return null;
    const monthlyPrice = product.monthly?.priceAmount ? product.monthly.priceAmount / 100 : null;
    const yearlyPrice = product.yearly?.priceAmount ? product.yearly.priceAmount / 100 : null;
    if (monthlyPrice === null && yearlyPrice === null) return null;
    const yearlyMonthly = yearlyPrice ? Math.round(yearlyPrice / 12) : monthlyPrice;
    return {
      monthly: monthlyPrice ?? yearlyMonthly ?? 0,
      yearly: yearlyMonthly ?? monthlyPrice ?? 0,
      yearlyTotal: yearlyPrice ?? (monthlyPrice ? monthlyPrice * 12 : 0),
    };
  };

  const plans = [
    { 
      key: "plus", 
      name: "Plus", 
      prices: getPriceFromProducts("plus"), 
      description: t.unlimitedAICreations || "Unlimited AI creations", 
      features: [
        t.upTo20Slides || "Up to 20 slides per presentation", 
        t.credits1000 || "1,000 AI credits/month", 
        t.removeBranding || "Remove PPTMaster branding", 
        t.advancedAIModels || "Advanced AI image models"
      ], 
      highlight: false, 
      badge: null as string | null, 
      badgeGradient: false 
    },
    { 
      key: "pro", 
      name: "Pro", 
      prices: getPriceFromProducts("pro"), 
      description: t.forPremiumAI || "For premium AI and customization", 
      features: [
        t.upTo60Slides || "Up to 60 slides per presentation", 
        t.credits4000 || "4,000 AI credits/month", 
        t.premiumAIModels || "Premium AI image models", 
        t.customBranding || "Custom branding & fonts",
        t.detailedAnalytics || "Detailed analytics"
      ], 
      highlight: true, 
      badge: t.mostPopular || "MOST POPULAR", 
      badgeGradient: false 
    },
    { 
      key: "ultra", 
      name: "Ultra", 
      prices: getPriceFromProducts("ultra"), 
      description: t.for20xMoreAI || "For 20× more AI usage", 
      features: [
        t.upTo75Slides || "Up to 75 slides per presentation", 
        t.credits20000 || "20,000 AI credits/month", 
        t.mostAdvancedModels || "Most advanced AI models", 
        t.earlyAccess || "Early access to new features"
      ], 
      highlight: false, 
      badge: t.introductoryPrice || "INTRODUCTORY PRICE", 
      badgeGradient: true 
    },
  ];

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{t.upgradeYourPlan || "Upgrade Your Plan"}</h2>
            <p className="text-sm text-slate-500">
              {currentPlan ? `${t.current || "Current"}: ${currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}` : t.choosePlanToUnlock || "Choose a plan to unlock more features"}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4 flex gap-2">
          <button 
            onClick={() => setActiveTab("plans")} 
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-semibold transition",
              activeTab === "plans" 
                ? "bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white" 
                : "text-slate-600 hover:bg-slate-100 border border-slate-200"
            )}
          >
            {t.subscriptionPlans || "Subscription Plans"}
          </button>
          {isPaidUser && (
            <button 
              onClick={() => setActiveTab("topup")} 
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2",
                activeTab === "topup" 
                  ? "bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white" 
                  : "text-slate-600 hover:bg-slate-100 border border-slate-200"
              )}
            >
              <Zap className="h-4 w-4" />
              {t.buyCredits || "Buy Credits"}
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] min-h-[420px]">
          {activeTab === "plans" && (
            <>
              {/* Toggle */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <span className={cn("text-sm font-semibold", !isAnnual ? "text-slate-900" : "text-slate-500")}>{t.monthly || "Monthly"}</span>
                <button 
                  onClick={() => setIsAnnual(!isAnnual)} 
                  className="relative h-8 w-14 rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] p-1 transition-all hover:shadow-lg"
                >
                  <div className={cn("h-6 w-6 rounded-full bg-white shadow-md transition-transform", isAnnual ? "translate-x-6" : "translate-x-0")} />
                </button>
                <span className={cn("text-sm font-semibold", isAnnual ? "text-slate-900" : "text-slate-500")}>
                  {t.yearly || "Yearly"} <span className="text-green-600 font-bold ml-1">-20%</span>
                </span>
              </div>

              {error && (
                <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-lg bg-red-50 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{t.couldNotLoadPricing || "Could not load pricing"}</span>
                  <button onClick={loadProducts} className="ml-auto text-xs underline font-medium">{t.tryAgain || "Try again"}</button>
                </div>
              )}

              {/* Pricing Cards - Matching pricing page style */}
              <div className="grid md:grid-cols-3 gap-3">
                {plans.map((plan) => {
                  const isCurrentPlan = currentPlan?.toLowerCase() === plan.key.toLowerCase();
                  const price = plan.prices ? (isAnnual ? plan.prices.yearly : plan.prices.monthly) : null;
                  const yearlyTotal = plan.prices?.yearlyTotal;
                  
                  return (
                    <div 
                      key={plan.key} 
                      className={cn(
                        "relative rounded-lg flex flex-col transition-all mt-4",
                        plan.highlight 
                          ? "border-2 border-[#06b6d4] bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] text-white shadow-lg" 
                          : "border border-slate-200 bg-white hover:border-[#06b6d4]",
                        isCurrentPlan && !plan.highlight && "ring-2 ring-green-500"
                      )}
                    >
                      {/* Badge */}
                      {plan.badge && (
                        <div className={cn(
                          "absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap",
                          plan.badgeGradient 
                            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" 
                            : "bg-gradient-to-r from-amber-400 to-orange-500 text-white"
                        )}>
                          {plan.badge.toUpperCase()}
                        </div>
                      )}
                      {isCurrentPlan && (
                        <div className="absolute -top-2.5 right-3 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                          {t.current || "CURRENT"}
                        </div>
                      )}

                      <div className="p-4 flex flex-col h-full">
                        {/* Plan name */}
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={cn("text-sm", plan.highlight ? "text-white" : "text-[#06b6d4]")}>✦</span>
                          <h3 className="text-lg font-bold">{plan.name}</h3>
                        </div>
                        <p className={cn("text-xs mb-3", plan.highlight ? "text-white/70" : "text-slate-500")}>{plan.description}</p>

                        {/* Price */}
                        <div className="mb-3">
                          {loading || price === null ? (
                            <div className={cn("h-6 w-12 animate-pulse rounded", plan.highlight ? "bg-white/20" : "bg-slate-200")} />
                          ) : (
                            <>
                              <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold">${price}</span>
                                <span className={cn("text-xs", plan.highlight ? "text-white/60" : "text-slate-500")}>/ {(t.monthly || "month").toLowerCase()}</span>
                              </div>
                              {isAnnual && yearlyTotal && (
                                <p className={cn("text-xs", plan.highlight ? "text-white/50" : "text-slate-400")}>
                                  ${yearlyTotal} {t.billedAnnually || "billed annually"}
                                </p>
                              )}
                            </>
                          )}
                        </div>

                        {/* Button */}
                        <div className="mt-auto mb-4">
                          <button 
                            onClick={() => handleSubscribe(plan.key)} 
                            disabled={!!checkoutLoadingId || isCurrentPlan} 
                            className={cn(
                              "w-full rounded-md py-2 px-3 font-medium text-sm transition disabled:opacity-50",
                              plan.highlight 
                                ? "bg-white text-[#1e3a8a] hover:bg-slate-100" 
                                : "bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white hover:opacity-90",
                              isCurrentPlan && "!bg-green-500 !text-white cursor-default"
                            )}
                          >
                            {checkoutLoadingId === plan.key ? (
                              <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                            ) : isCurrentPlan ? (
                              t.currentPlan || "Current Plan"
                            ) : (
                              t.getStarted || "Get Started"
                            )}
                          </button>
                        </div>

                        {/* Features */}
                        <p className={cn("text-xs mb-2 font-medium", plan.highlight ? "text-white/70" : "text-slate-500")}>
                          {t.includes || "Includes:"}
                        </p>
                        <ul className="space-y-1.5 text-xs flex-grow">
                          {plan.features.map((feature, j) => (
                            <li key={j} className="flex items-start gap-1.5">
                              <span className={cn("text-xs", plan.highlight ? "text-white" : "text-[#06b6d4]")}>✓</span>
                              <span className={plan.highlight ? "text-white/90" : "text-slate-600"}>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {activeTab === "topup" && (
            <div className="flex flex-col">
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-slate-900 mb-2">{t.buyMoreCredits || "Need More Credits?"}</h3>
                <p className="text-sm text-slate-500">{t.oneTimePurchase || "One-time purchase, use anytime"}</p>
              </div>

              {/* Credit Cards */}
              <div className="grid md:grid-cols-3 gap-5 mt-4">
                {[
                  { credits: 500, index: 0 },
                  { credits: 1000, index: 1 },
                  { credits: 2500, index: 2 },
                ].map(({ credits, index }) => {
                  const isPopular = index === 1;
                  const option = topupOptions.find(o => o.credits === credits);
                  
                  return (
                    <div 
                      key={index} 
                      className={cn(
                        "relative rounded-lg p-6 text-center transition-all flex flex-col",
                        isPopular
                          ? "border-2 border-[#06b6d4] bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] text-white shadow-lg mt-0"
                          : "border border-slate-200 bg-white hover:border-[#06b6d4] hover:shadow-md mt-3"
                      )}
                    >
                      {isPopular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">
                          {t.bestValue || "BEST VALUE"}
                        </div>
                      )}

                      {/* Icon */}
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4",
                        isPopular ? "bg-white/20" : "bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4]"
                      )}>
                        <Zap className={cn("w-5 h-5", isPopular ? "text-cyan-300" : "text-white")} />
                      </div>

                      {/* Credits */}
                      <div className={cn("text-3xl font-bold", isPopular ? "text-white" : "text-slate-900")}>
                        {credits.toLocaleString()}
                      </div>
                      <div className={cn("text-sm mb-4", isPopular ? "text-white/70" : "text-slate-500")}>
                        {t.credits || "credits"}
                      </div>

                      {/* Price - only this part shows skeleton */}
                      <div className={cn("text-2xl font-bold mb-5", isPopular ? "text-white" : "text-[#1e3a8a]")}>
                        {topupLoading || !option ? (
                          <span className={cn("inline-block h-7 w-16 animate-pulse rounded", isPopular ? "bg-white/30" : "bg-slate-200")} />
                        ) : (
                          `$${option.priceDisplay}`
                        )}
                      </div>
                      
                      {/* Button */}
                      <button 
                        onClick={() => option && handleTopup(option.credits, index)} 
                        disabled={topupLoadingId !== null || topupLoading || !option?.available} 
                        className={cn(
                          "w-full py-2.5 rounded-md text-sm font-semibold transition disabled:opacity-50 mt-auto",
                          isPopular
                            ? "bg-white text-[#1e3a8a] hover:bg-slate-100"
                            : "bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white hover:opacity-90"
                        )}
                      >
                        {topupLoadingId === index ? (
                          <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                        ) : (
                          t.purchase || "Purchase"
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Info text */}
              <p className="text-center text-xs text-slate-400 mt-8">
                Credits never expire and can be used for AI generations
              </p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
