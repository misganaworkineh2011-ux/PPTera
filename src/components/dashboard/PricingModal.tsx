"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, AlertCircle, Zap, Check } from "lucide-react";
import { cn } from "~/lib/utils";
import { DiscountTopBanner } from "~/components/DiscountTopBanner";
import { useUser } from "~/lib/auth-compat";
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
  initialTab?: "plans" | "topup";
}

export default function PricingModal({ isOpen, onClose, currentPlan, initialTab = "plans" }: PricingModalProps) {
  const [isAnnual, setIsAnnual] = useState(true);
  const [products, setProducts] = useState<PolarProduct[]>([]);
  const [topupOptions, setTopupOptions] = useState<TopupOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [topupLoading, setTopupLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutLoadingId, setCheckoutLoadingId] = useState<string | null>(null);
  const [topupLoadingId, setTopupLoadingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"plans" | "topup">(initialTab);

  const { isSignedIn } = useUser();
  const router = useRouter();
  const { language } = useLanguage();
  const t = dashboardTranslations[language] || dashboardTranslations.en;

  const isPaidUser = currentPlan && currentPlan.toLowerCase() !== "free";

  useEffect(() => {
    if (isOpen) {
      setCheckoutLoadingId(null);
      setTopupLoadingId(null);
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

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

  const getPriceFromProducts = (key: string) => {
    const product = products.find(p => p.key === key);
    if (!product) return null;
    const monthlyPrice = product.monthly?.priceAmount ? product.monthly.priceAmount / 100 : null;
    const yearlyPrice = product.yearly?.priceAmount ? product.yearly.priceAmount / 100 : null;
    if (monthlyPrice === null && yearlyPrice === null) return null;
    const yearlyMonthly = yearlyPrice ? Number((yearlyPrice / 12).toFixed(2)) : monthlyPrice;
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
        t.credits1000 || "1,000 monthly credits", 
        t.upTo20Slides || "20 cards per prompt", 
        t.exportFormatsAll || "Export to PDF, PPTX & PNG",
        t.removeBranding || "Remove PPTera branding", 
        t.advancedAIModels || "Basic AI image models",
        t.basicAnimations || "Basic slide animations"
      ], 
      highlight: false, 
      badge: null, 
      badgeGradient: false 
    },
    { 
      key: "pro", 
      name: "Pro", 
      prices: getPriceFromProducts("pro"), 
      description: t.forPremiumAI || "For premium AI and customization", 
      features: [
        t.credits4000 || "4,000 monthly credits", 
        t.upTo60Slides || "60 cards per prompt", 
        t.removeBranding || "Remove PPTera branding", 
        t.exportFormatsAll || "Export to PDF, PPTX & PNG",
        t.premiumAIModels || "Pro AI models & 2K exports", 
        t.premiumAnimations || "Advanced animations",
        t.customBranding || "Full Brand Control & Fonts",
        t.detailedAnalyticsSharing || "Detailed analytics & premium sharing",
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
        t.credits20000 || "20,000 monthly credits", 
        t.upTo75Slides || "75 cards per prompt", 
        t.removeBranding || "Remove PPTera branding", 
        t.exportFormatsAll || "Export to PDF, PPTX & PNG",
        t.premiumAIModels || "Pro AI models & 2K exports",
        t.mostAdvancedModels || "Most advanced AI models", 
        t.allAnimations || "All slide animations & effects",
        t.customBranding || "Full Brand Control & Fonts",
        t.detailedAnalyticsSharing || "Detailed analytics & premium sharing",
        t.apiWebhookAccess || "API & Webhook access",
        t.earlyAccess || "Early access to new features"
      ], 
      highlight: false, 
      badge: t.introductoryPrice || "INTRODUCTORY PRICE", 
      badgeGradient: true 
    },
  ];

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm overflow-hidden">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative bg-white md:rounded-[2rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] w-full max-w-5xl h-full md:h-auto md:max-h-[92vh] overflow-hidden flex flex-col group animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between px-8 py-5">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
              {t.upgradeYourPlan || "Upgrade Your Plan"}
              {isPaidUser && (
                <span className="text-[10px] uppercase tracking-widest bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-100">
                  {currentPlan}
                </span>
              )}
            </h2>
            <p className="text-sm font-medium text-slate-400">
              {t.choosePlanToUnlock || "Choose a plan to unlock more features"}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2.5 rounded-2xl text-slate-300 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="px-8 flex items-center justify-between border-b border-slate-100/50 pb-0">
          <div className="flex h-full pt-2">
            {isPaidUser ? (
              <button 
                onClick={() => setActiveTab(activeTab === "plans" ? "topup" : "plans")} 
                className="px-5 py-3 text-sm font-bold transition-all relative text-slate-900 flex items-center gap-2 hover:bg-slate-50 rounded-t-lg"
              >
                {activeTab === "plans" ? (
                  <>
                    <Zap className="h-4 w-4 text-cyan-600" />
                    {t.buyCredits || "Buy Credits"}
                  </>
                ) : (
                  "Back to Plans"
                )}
                {activeTab === "topup" && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#06b6d4] rounded-t-full" />
                )}
              </button>
            ) : (
               <div className="px-5 py-3 text-sm font-bold text-slate-900 border-b-4 border-[#06b6d4]">
                 {t.subscriptionPlans || "Subscription Plans"}
               </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
          <div className="p-8 pb-0">
            <DiscountTopBanner />
          </div>

          {activeTab === "plans" ? (
            <div className="p-8">
              {/* Toggle */}
              <div className="flex items-center justify-center gap-4 mb-10">
                <span
                  className={`text-sm font-medium ${!isAnnual ? "text-zinc-900" : "text-zinc-500"}`}
                >
                  {t.monthly || "Monthly"}
                </span>
                <button
                  onClick={() => setIsAnnual(!isAnnual)}
                  className="relative h-7 w-12 rounded-full bg-zinc-900 p-0.5 transition-all"
                  style={{ cursor: "url('/pointinghand.svg') 12 8, pointer" }}
                >
                  <div
                    className={`h-6 w-6 rounded-full bg-white shadow transition-transform ${isAnnual ? "translate-x-5" : "translate-x-0"}`}
                  />
                </button>
                <span
                  className={`text-sm font-medium ${isAnnual ? "text-zinc-900" : "text-zinc-500"}`}
                >
                  {t.yearly || "Yearly"}{" "}
                  <span className="text-emerald-600 font-semibold ml-1">
                    {t.saveUpTo || "(Save 50%)"}
                  </span>
                </span>
              </div>

              {error && (
                <div className="flex items-center gap-2 mb-8 px-4 py-3 rounded-2xl bg-red-50 text-red-600 text-sm font-bold border border-red-100 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                  <button onClick={loadProducts} className="ml-auto text-xs underline decoration-2 underline-offset-2">{t.tryAgain || "Try again"}</button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan, i) => {
                  const isCurrentPlan = currentPlan?.toLowerCase() === plan.key.toLowerCase();
                  const price = plan.prices ? (isAnnual ? plan.prices.yearly : plan.prices.monthly) : null;
                  const yearlyTotal = plan.prices?.yearlyTotal;
                  
                  return (
                    <div 
                      key={plan.key} 
                      className={cn(
                        "relative rounded-[2rem] p-8 transition-all duration-300 flex flex-col group",
                        plan.highlight 
                          ? "ring-2 ring-[#06b6d4] shadow-[0_20px_40px_-15px_rgba(6,182,212,0.15)] bg-gradient-to-b from-white to-cyan-50/20" 
                          : "border border-slate-100/80 hover:border-slate-200 hover:shadow-xl bg-white"
                      )}
                    >
                      {plan.badge && (
                        <div className={cn(
                          "absolute -top-4 left-1/2 -translate-x-1/2 text-[11px] font-black tracking-[0.15em] px-5 py-1.5 rounded-full shadow-lg whitespace-nowrap uppercase",
                          plan.badgeGradient 
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white" 
                            : "bg-[#06b6d4] text-white shadow-cyan-500/20"
                        )}>
                          {plan.badge}
                        </div>
                      )}
                      
                      {isCurrentPlan && (
                        <div className="absolute top-6 right-8 bg-emerald-50 text-emerald-600 text-[10px] font-black tracking-widest px-2 py-0.5 rounded-full border border-emerald-100 uppercase">
                          {t.current || "CURRENT"}
                        </div>
                      )}

                      <div className="mb-6">
                        <h3 className="text-xl font-black text-slate-900 mb-1 flex items-center gap-2">
                          {plan.name}
                          {plan.highlight && (
                            <div className="flex items-center justify-center p-1 rounded-lg bg-cyan-50 border border-cyan-100">
                              <Zap className="h-3.5 w-3.5 text-[#06b6d4] fill-[#06b6d4]/20" />
                            </div>
                          )}
                        </h3>
                        <p className="text-xs font-bold text-slate-400 leading-relaxed min-h-[32px]">{plan.description}</p>
                      </div>

                      <div className="mb-8">
                        {loading || price === null ? (
                          <div className="h-10 w-24 animate-pulse rounded-xl bg-slate-100" />
                        ) : (
                          <>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-4xl font-black tracking-tighter text-slate-900">${price}</span>
                              <span className="text-sm font-bold text-slate-400">/ {isAnnual ? "yr" : "mo"}</span>
                            </div>
                            {isAnnual && yearlyTotal && (
                              <div className="mt-1 flex items-center gap-2">
                                <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 uppercase">
                                  Billed ${yearlyTotal}/year
                                </span>
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      <div className="space-y-4 mb-10 flex-1">
                        {plan.features.map((feature, j) => (
                          <div key={j} className="flex items-start gap-3">
                            <div className={cn(
                              "mt-0.5 h-4 w-4 rounded-full flex items-center justify-center shrink-0",
                              plan.highlight ? "bg-cyan-100 text-cyan-600" : "bg-slate-100 text-slate-400"
                            )}>
                              <Check className="h-2.5 w-2.5 stroke-[4]" />
                            </div>
                            <span className="text-[13px] font-bold text-slate-600 leading-tight">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => handleSubscribe(plan.key)}
                        disabled={!!checkoutLoadingId || isCurrentPlan}
                        className={cn(
                          "w-full py-4 rounded-2xl text-sm font-black transition-all duration-300 relative overflow-hidden group/btn disabled:opacity-50 disabled:cursor-not-allowed",
                          isCurrentPlan 
                            ? "bg-slate-50 text-slate-400 border border-slate-100" 
                            : plan.highlight
                              ? "bg-slate-900 text-white hover:bg-black hover:scale-[1.02] shadow-xl"
                              : "bg-white border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white"
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
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-8">
              <div className="flex flex-col">
                <div className="text-center mb-10">
                  <h3 className="text-2xl font-black text-slate-900 mb-2">{t.buyMoreCredits || "Need More Credits?"}</h3>
                  <p className="text-sm font-medium text-slate-400">{t.oneTimePurchase || "One-time purchase, use anytime"}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                          "relative rounded-[2.5rem] p-10 text-center transition-all duration-300 flex flex-col group items-center",
                          isPopular
                            ? "bg-slate-900 text-white shadow-2xl scale-105 z-10"
                            : "bg-white border border-slate-100 hover:border-slate-200 hover:shadow-xl"
                        )}
                      >
                        {isPopular && (
                          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#06b6d4] text-white text-[11px] font-black tracking-[0.15em] px-5 py-1.5 rounded-full shadow-lg shadow-cyan-500/20 uppercase whitespace-nowrap">
                            {t.bestValue || "BEST VALUE"}
                          </div>
                        )}

                        <div className={cn(
                          "w-16 h-16 rounded-3xl flex items-center justify-center mb-8 rotate-3 group-hover:rotate-6 transition-transform",
                          isPopular ? "bg-white/10 ring-1 ring-white/20" : "bg-slate-50 ring-1 ring-slate-100"
                        )}>
                          <Zap className={cn("w-8 h-8", isPopular ? "text-cyan-400" : "text-slate-900")} />
                        </div>

                        <div className="mb-4">
                          <div className={cn("text-4xl font-black tracking-tighter", isPopular ? "text-white" : "text-slate-900")}>
                            {credits.toLocaleString()}
                          </div>
                          <div className={cn("text-xs font-black tracking-[0.2em] uppercase mt-1", isPopular ? "text-cyan-400" : "text-slate-400")}>
                            {t.credits || "credits"}
                          </div>
                        </div>

                        <div className={cn("text-3xl font-black mb-10", isPopular ? "text-white" : "text-[#06b6d4]")}>
                          {topupLoading || !option ? (
                            <div className="h-8 w-20 animate-pulse rounded-lg bg-current/20 mx-auto" />
                          ) : (
                            `$${option.priceDisplay}`
                          )}
                        </div>
                        
                        <button 
                          onClick={() => option && handleTopup(option.credits, index)} 
                          disabled={topupLoadingId !== null || topupLoading || !option?.available} 
                          className={cn(
                            "w-full py-4 rounded-2xl text-sm font-black transition-all duration-300 disabled:opacity-50 mt-auto",
                            isPopular
                              ? "bg-[#06b6d4] text-white hover:bg-cyan-400 shadow-[0_10px_20px_-5px_rgba(6,182,212,0.4)]"
                              : "bg-slate-900 text-white hover:scale-[1.02]"
                          )}
                        >
                          {topupLoadingId === index ? (
                            <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                          ) : (
                            t.purchase || "Purchase"
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-center gap-2 mt-12 mb-4">
                  <div className="h-px w-8 bg-slate-100" />
                  <p className="text-[11px] font-black tracking-widest text-slate-300 uppercase">
                    Credits never expire & apply instantly
                  </p>
                  <div className="h-px w-8 bg-slate-100" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
