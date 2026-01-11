"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, AlertCircle, Zap } from "lucide-react";
import { cn } from "~/lib/utils";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useLanguage } from "~/contexts/LanguageContext";
import { dashboardTranslations } from "~/lib/dashboard-translations";

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

    setCheckoutLoadingId(productKey);
    try {
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
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to start checkout");
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
    { key: "plus", name: "Plus", prices: getPriceFromProducts("plus"), description: t.unlimitedAICreations, features: [t.upTo20Slides || "Up to 20 slides per presentation", t.credits1000 || "1,000 AI credits/month", t.removeBranding || "Remove PPTMaster branding", t.advancedAIModels || "Advanced AI image models", t.basicAnimations || "Basic slide animations"], highlight: false, badge: null as string | null, badgeGradient: false },
    { key: "pro", name: "Pro", prices: getPriceFromProducts("pro"), description: t.forPremiumAI, features: [t.upTo60Slides || "Up to 60 slides per presentation", t.credits4000 || "4,000 AI credits/month", t.premiumAIModels || "Premium AI image models", t.customBranding || "Custom branding & fonts", t.premiumAnimations || "Premium slide animations"], highlight: true, badge: t.mostPopular, badgeGradient: false },
    { key: "ultra", name: "Ultra", prices: getPriceFromProducts("ultra"), description: t.for20xMoreAI, features: [t.upTo75Slides || "Up to 75 slides per presentation", t.credits20000 || "20,000 AI credits/month", t.mostAdvancedModels || "Most advanced AI models", t.allAnimations || "All slide animations & effects", t.earlyAccess || "Early access to new features"], highlight: false, badge: t.introductoryPrice, badgeGradient: true },
  ];

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden mx-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{t.upgradeYourPlan}</h2>
            <p className="text-sm text-slate-500">
              {currentPlan ? `${t.current}: ${currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}` : t.choosePlanToUnlock}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4 flex gap-2">
          <button onClick={() => setActiveTab("plans")} className={cn("px-4 py-2 rounded-lg text-sm font-medium transition", activeTab === "plans" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50")}>
            {t.subscriptionPlans}
          </button>
          {isPaidUser && (
            <button onClick={() => setActiveTab("topup")} className={cn("px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2", activeTab === "topup" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50")}>
              <Zap className="h-4 w-4" />
              {t.buyCredits}
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {activeTab === "plans" && (
            <>
              {/* Toggle */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <span className={cn("text-sm", !isAnnual ? "text-slate-900 font-medium" : "text-slate-400")}>{t.monthly}</span>
                <button onClick={() => setIsAnnual(!isAnnual)} className="relative h-6 w-11 rounded-full bg-slate-200 transition-colors" style={{ backgroundColor: isAnnual ? '#0ea5e9' : undefined }}>
                  <div className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform", isAnnual ? "translate-x-5" : "translate-x-0.5")} />
                </button>
                <span className={cn("text-sm", isAnnual ? "text-slate-900 font-medium" : "text-slate-400")}>
                  {t.yearly} <span className="text-emerald-600 text-xs ml-1">-20%</span>
                </span>
              </div>

              {error && (
                <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-red-50 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{t.couldNotLoadPricing}</span>
                  <button onClick={loadProducts} className="ml-auto text-xs underline">{t.tryAgain}</button>
                </div>
              )}

              {/* Pricing Cards */}
              <div className="grid md:grid-cols-3 gap-4">
                {plans.map((plan) => {
                  const isCurrentPlan = currentPlan?.toLowerCase() === plan.key.toLowerCase();
                  const price = plan.prices ? (isAnnual ? plan.prices.yearly : plan.prices.monthly) : null;
                  const yearlyTotal = plan.prices?.yearlyTotal;
                  
                  return (
                    <div key={plan.key} className={cn("relative rounded-xl p-5 flex flex-col transition-all", plan.highlight ? "bg-slate-900 text-white ring-2 ring-slate-900" : "bg-white border border-slate-200 hover:border-slate-300", isCurrentPlan && !plan.highlight && "ring-2 ring-emerald-500")}>
                      {plan.badge && (
                        <div className={cn("absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-semibold px-2.5 py-0.5 rounded-full", plan.badgeGradient ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white" : "bg-amber-400 text-amber-900")}>
                          {plan.badge}
                        </div>
                      )}
                      {isCurrentPlan && <div className="absolute -top-2.5 right-3 bg-emerald-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">{t.current}</div>}

                      <h3 className={cn("text-base font-semibold mb-1", plan.highlight ? "text-white" : "text-slate-900")}>{plan.name}</h3>
                      <p className={cn("text-xs mb-3", plan.highlight ? "text-slate-400" : "text-slate-500")}>{plan.description}</p>

                      <div className="mb-4">
                        {loading || price === null ? (
                          <div className={cn("h-7 w-16 animate-pulse rounded", plan.highlight ? "bg-white/20" : "bg-slate-100")} />
                        ) : (
                          <>
                            <div className="flex items-baseline gap-1">
                              <span className={cn("text-2xl font-bold", plan.highlight ? "text-white" : "text-slate-900")}>${price}</span>
                              <span className={cn("text-xs", plan.highlight ? "text-slate-400" : "text-slate-500")}>/{t.monthly?.toLowerCase()}</span>
                            </div>
                            {isAnnual && yearlyTotal && <p className={cn("text-[11px]", plan.highlight ? "text-slate-500" : "text-slate-400")}>${yearlyTotal} {t.billedAnnually}</p>}
                          </>
                        )}
                      </div>

                      <button onClick={() => handleSubscribe(plan.key)} disabled={!!checkoutLoadingId || isCurrentPlan} className={cn("w-full py-2 rounded-lg text-sm font-medium transition mb-4", plan.highlight ? "bg-white text-slate-900 hover:bg-slate-100" : "bg-slate-900 text-white hover:bg-slate-800", isCurrentPlan && "!bg-emerald-500 !text-white cursor-default", "disabled:opacity-60")}>
                        {checkoutLoadingId === plan.key ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : isCurrentPlan ? t.currentPlan : t.getStarted}
                      </button>

                      <ul className="space-y-2 text-xs flex-grow">
                        {plan.features.map((feature, j) => (
                          <li key={j} className="flex items-start gap-2">
                            <span className={plan.highlight ? "text-emerald-400" : "text-emerald-500"}>✓</span>
                            <span className={plan.highlight ? "text-slate-300" : "text-slate-600"}>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {activeTab === "topup" && (
            <>
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-1">{t.buyMoreCredits}</h3>
                <p className="text-sm text-slate-500">{t.oneTimePurchase}</p>
              </div>

              {/* Sleek Credit Cards */}
              <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                {topupLoading ? (
                  [0, 1, 2].map((i) => (
                    <div key={i} className="rounded-xl border border-slate-200 p-5">
                      <div className="h-6 w-20 bg-slate-100 animate-pulse rounded mb-2 mx-auto" />
                      <div className="h-8 w-16 bg-slate-100 animate-pulse rounded mb-4 mx-auto" />
                      <div className="h-9 w-full bg-slate-100 animate-pulse rounded-lg" />
                    </div>
                  ))
                ) : (
                  topupOptions.map((option, i) => {
                    const isPopular = i === 1;
                    return (
                      <div key={i} className={cn("relative rounded-xl p-5 text-center transition-all", isPopular ? "bg-slate-900 text-white ring-2 ring-slate-900" : "border border-slate-200 hover:border-slate-300")}>
                        {isPopular && <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-[10px] font-semibold px-2.5 py-0.5 rounded-full">{t.bestValue}</div>}
                        
                        <div className={cn("text-2xl font-bold mb-0.5", isPopular ? "text-white" : "text-slate-900")}>{option.credits.toLocaleString()}</div>
                        <div className={cn("text-xs mb-3", isPopular ? "text-slate-400" : "text-slate-500")}>{t.credits}</div>
                        <div className={cn("text-xl font-semibold mb-4", isPopular ? "text-white" : "text-slate-900")}>${option.priceDisplay}</div>
                        
                        <button onClick={() => handleTopup(option.credits, i)} disabled={topupLoadingId !== null || !option.available} className={cn("w-full py-2 rounded-lg text-sm font-medium transition", isPopular ? "bg-white text-slate-900 hover:bg-slate-100" : "bg-slate-900 text-white hover:bg-slate-800", "disabled:opacity-60")}>
                          {topupLoadingId === i ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : t.purchase}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
