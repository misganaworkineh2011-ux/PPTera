"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, CheckCircle2, Loader2, AlertCircle, Zap, Plus, Sparkles } from "lucide-react";
import { cn } from "~/lib/utils";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

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

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan?: string | null;
}

export default function PricingModal({ isOpen, onClose, currentPlan }: PricingModalProps) {
  const [isAnnual, setIsAnnual] = useState(true);
  const [products, setProducts] = useState<PolarProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutLoadingId, setCheckoutLoadingId] = useState<string | null>(null);
  const [topupLoadingId, setTopupLoadingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"plans" | "topup">("plans");

  const { isSignedIn } = useUser();
  const router = useRouter();

  // Fetch products when modal opens
  useEffect(() => {
    if (isOpen && products.length === 0) {
      loadProducts();
    }
  }, [isOpen]);

  async function loadProducts() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/polar/products");
      if (!res.ok) throw new Error("Failed to load pricing");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
      setError("Could not load pricing plans. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const handleSubscribe = async (productKey: string) => {
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    const product = products.find(p => p.key === productKey);
    if (!product) return;

    const priceData = isAnnual ? product.yearly : product.monthly;
    if (!priceData) return;

    setCheckoutLoadingId(productKey);
    try {
      const res = await fetch("/api/polar/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: priceData.id,
          recurringInterval: isAnnual ? "year" : "month"
        })
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to start checkout");
      setCheckoutLoadingId(null);
    }
  };

  const topUpOptions = [
    { credits: 500, price: "$9.99", popular: false, slides: 125, images: 50 },
    { credits: 1000, price: "$17.99", popular: true, slides: 250, images: 100 },
    { credits: 2500, price: "$39.99", popular: false, slides: 625, images: 250 },
  ];

  const handleTopup = async (credits: number, index: number) => {
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    setTopupLoadingId(index);
    try {
      const res = await fetch("/api/polar/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credits: credits.toString() }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to start checkout");
      }
      
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to start checkout");
      setTopupLoadingId(null);
    }
  };

  const getFeatures = (desc?: string) => {
    if (!desc) return [];
    return desc.split('\n').filter(line => line.trim().startsWith('•')).map(line => line.replace('•', '').trim());
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden mx-4">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-neutral-900 border-b border-slate-200 dark:border-neutral-800 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Upgrade Your Plan</h2>
              <p className="text-sm text-slate-500 dark:text-neutral-400">
                {currentPlan ? `Current: ${currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}` : "Choose a plan to unlock more features"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-neutral-800 dark:hover:text-white transition"
          >
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
                : "bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-neutral-700"
            )}
          >
            Subscription Plans
          </button>
          {currentPlan && (
            <button
              onClick={() => setActiveTab("topup")}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2",
                activeTab === "topup"
                  ? "bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white"
                  : "bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-neutral-700"
              )}
            >
              <Zap className="h-4 w-4" />
              Buy Credits
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {activeTab === "plans" && (
            <>
              {/* Billing Toggle */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <span className={cn("text-sm font-semibold", !isAnnual ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-neutral-500")}>Monthly</span>
                <button
                  onClick={() => setIsAnnual(!isAnnual)}
                  className="relative h-8 w-14 rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] p-1 transition-all hover:shadow-lg"
                >
                  <div className={cn("h-6 w-6 rounded-full bg-white shadow-md transition-transform", isAnnual ? "translate-x-6" : "translate-x-0")} />
                </button>
                <span className={cn("text-sm font-semibold", isAnnual ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-neutral-500")}>
                  Yearly <span className="text-green-600 font-bold ml-1">Save 20%</span>
                </span>
              </div>

              {/* Plans */}
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-[#06b6d4]" />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg">
                    <AlertCircle className="h-5 w-5" />
                    <span>{error}</span>
                  </div>
                  <button
                    onClick={loadProducts}
                    className="text-sm text-[#06b6d4] hover:underline"
                  >
                    Try again
                  </button>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-3">
                  {products.map((product) => {
                    const priceData = isAnnual ? product.yearly : product.monthly;
                    const activePrice = priceData || product.monthly || product.yearly;
                    const isCurrentPlan = currentPlan?.toLowerCase() === product.key.toLowerCase();
                    const isHighlighted = product.key === 'pro';

                    if (!activePrice) return null;

                    return (
                      <div
                        key={product.key}
                        className={cn(
                          "relative rounded-2xl p-6 border transition-all duration-300 flex flex-col",
                          isHighlighted
                            ? "bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] text-white border-transparent shadow-xl scale-[1.02]"
                            : "bg-white dark:bg-neutral-800 text-slate-900 dark:text-white border-slate-200 dark:border-neutral-700 hover:border-[#06b6d4]",
                          isCurrentPlan && "ring-2 ring-green-500"
                        )}
                      >
                        {isHighlighted && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                            MOST POPULAR
                          </div>
                        )}
                        {isCurrentPlan && (
                          <div className="absolute -top-3 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                            CURRENT
                          </div>
                        )}

                        <h3 className="text-lg font-bold mb-1">{product.name}</h3>
                        <p className={cn("text-sm mb-4 line-clamp-2", isHighlighted ? "text-white/80" : "text-slate-500 dark:text-neutral-400")}>
                          {product.description?.split('\n')[0] || "Unlock your potential."}
                        </p>

                        <div className="flex items-baseline gap-1 mb-6">
                          <span className="text-3xl font-extrabold">{activePrice.displayPrice.split('/')[0]}</span>
                          <span className={cn("text-sm", isHighlighted ? "text-white/70" : "text-slate-500 dark:text-neutral-500")}>/{activePrice.recurringInterval}</span>
                        </div>

                        <button
                          onClick={() => handleSubscribe(product.key)}
                          disabled={!!checkoutLoadingId || isCurrentPlan}
                          className={cn(
                            "w-full rounded-xl py-2.5 px-4 font-bold text-sm mb-6 transition-all disabled:opacity-70 disabled:cursor-not-allowed",
                            isHighlighted
                              ? "bg-white text-[#1e3a8a] hover:bg-slate-100"
                              : "bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white hover:shadow-lg",
                            isCurrentPlan && "!bg-green-500 !text-white"
                          )}
                        >
                          {checkoutLoadingId === product.key ? (
                            <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                          ) : isCurrentPlan ? (
                            "Current Plan"
                          ) : (
                            "Get Started"
                          )}
                        </button>

                        <ul className="space-y-2.5 flex-1 text-sm">
                          {getFeatures(product.uiDescription).slice(0, 6).map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className={cn("h-4 w-4 shrink-0 mt-0.5", isHighlighted ? "text-white" : "text-[#06b6d4]")} />
                              <span className={cn(isHighlighted ? "text-white/90" : "text-slate-600 dark:text-neutral-300")}>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {activeTab === "topup" && (
            <>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Buy More Credits</h3>
                <p className="text-slate-500 dark:text-neutral-400">One-time purchase, no subscription required</p>
              </div>

              <div className="grid gap-6 md:grid-cols-3 max-w-3xl mx-auto">
                {topUpOptions.map((option, i) => (
                  <div
                    key={i}
                    className={cn(
                      "relative rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl",
                      option.popular
                        ? "border-[#06b6d4] bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 scale-105"
                        : "border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-[#06b6d4]"
                    )}
                  >
                    {option.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#06b6d4] text-white text-xs font-bold px-3 py-1 rounded-full">
                        BEST VALUE
                      </div>
                    )}

                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] text-white mb-4">
                        <Plus className="w-7 h-7" />
                      </div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{option.credits.toLocaleString()}</div>
                      <div className="text-sm text-slate-500 dark:text-neutral-400 mb-1">Credits</div>
                      <div className="text-xs text-slate-400 dark:text-neutral-500 mb-4">
                        ~{option.slides} slides or ~{option.images} images
                      </div>
                      <div className="text-xl font-bold text-[#1e3a8a] dark:text-[#06b6d4] mb-4">{option.price}</div>
                      <button
                        onClick={() => handleTopup(option.credits, i)}
                        disabled={topupLoadingId !== null}
                        className={cn(
                          "w-full rounded-xl py-2.5 px-4 font-semibold text-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed",
                          option.popular
                            ? "bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white shadow-lg hover:shadow-xl"
                            : "border-2 border-[#06b6d4] text-[#1e3a8a] dark:text-[#06b6d4] hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
                        )}
                      >
                        {topupLoadingId === i ? (
                          <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                        ) : (
                          "Purchase"
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center text-sm text-slate-500 dark:text-neutral-500">
                <p>Credit costs: <span className="font-medium">4 credits/slide</span> • <span className="font-medium">10 credits/AI image</span> • <span className="font-medium">15 credits/HD image</span></p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
