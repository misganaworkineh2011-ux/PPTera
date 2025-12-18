"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Loader2, AlertCircle, Plus, Zap } from "lucide-react";
import { LandingNavbar } from "~/components/LandingNavbar";
import { LandingFooter } from "~/components/LandingFooter";
import { cn } from "~/lib/utils";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useLanguage } from "~/contexts/LanguageContext";

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

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [products, setProducts] = useState<PolarProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutLoadingId, setCheckoutLoadingId] = useState<string | null>(null);
  const [hasSubscription, setHasSubscription] = useState(false);

  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/polar/products");
        if (!res.ok) throw new Error("Failed to load pricing");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error(err);
        setError("Could not load pricing plans. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  // Check if user has a subscription
  useEffect(() => {
    if (isSignedIn && user) {
      const subscription = user.publicMetadata?.subscription as string | undefined;
      setHasSubscription(!!subscription && subscription !== 'free');
    }
  }, [isSignedIn, user]);

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

  const getFeatures = (desc?: string) => {
    if (!desc) return [];
    return desc.split('\n').filter(line => line.trim().startsWith('•')).map(line => line.replace('•', '').trim());
  };

  const [topupLoadingId, setTopupLoadingId] = useState<number | null>(null);

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

  // Product Schema for SEO
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "PPTMaster AI Presentation Generator",
    "description": "AI-powered presentation generator that creates professional slides instantly",
    "brand": {
      "@type": "Brand",
      "name": "PPTMaster"
    },
    "offers": [
      {
        "@type": "Offer",
        "name": "Plus Plan - Monthly",
        "price": "10",
        "priceCurrency": "USD",
        "priceValidUntil": "2026-12-31",
        "availability": "https://schema.org/InStock",
        "url": "https://www.pptmaster.app/pricing"
      },
      {
        "@type": "Offer",
        "name": "Pro Plan - Monthly",
        "price": "25",
        "priceCurrency": "USD",
        "priceValidUntil": "2026-12-31",
        "availability": "https://schema.org/InStock",
        "url": "https://www.pptmaster.app/pricing"
      },
      {
        "@type": "Offer",
        "name": "Ultra Plan - Monthly",
        "price": "100",
        "priceCurrency": "USD",
        "priceValidUntil": "2026-12-31",
        "availability": "https://schema.org/InStock",
        "url": "https://www.pptmaster.app/pricing"
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "1250"
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <LandingNavbar />

      {/* Hero Section */}
      <div className="relative pt-40 pb-20 px-6 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-100px,#1e1e1e0a,transparent)]"></div>

        <div className="mx-auto max-w-7xl text-center relative z-10">
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 md:text-7xl mb-6">
            {t.pricingTitle}
          </h1>
          <p className="text-xl text-slate-500 mb-12">
            {t.pricingSubtitle}
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-4 mb-16">
            <span className={cn("text-sm font-semibold", !isAnnual ? "text-slate-900" : "text-slate-500")}>{t.monthly}</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative h-8 w-14 rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] p-1 transition-all hover:shadow-lg"
            >
              <div className={cn("h-6 w-6 rounded-full bg-white shadow-md transition-transform", isAnnual ? "translate-x-6" : "translate-x-0")} />
            </button>
            <span className={cn("text-sm font-semibold", isAnnual ? "text-slate-900" : "text-slate-500")}>
              {t.yearly} <span className="text-green-600 font-bold ml-1">{t.savePercent}</span>
            </span>
          </div>

          {/* Pricing Cards */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[#06b6d4]" />
            </div>
          ) : error ? (
            <div className="flex justify-center py-20">
              <div className="flex items-center gap-2 text-red-500 bg-red-50 px-4 py-2 rounded-lg">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-3 items-start">
              {products.map((product) => {
                const priceData = isAnnual ? product.yearly : product.monthly;
                const activePrice = priceData || product.monthly || product.yearly;
                const isUltra = product.key === 'ultra';

                if (!activePrice) return null;

                const isHighlighted = product.key === 'pro';

                return (
                  <div
                    key={product.key}
                    className={cn(
                      "relative rounded-3xl p-8 text-left border transition-all duration-300 flex flex-col h-full",
                      isHighlighted
                        ? "bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] text-white shadow-2xl scale-105 border-transparent"
                        : "bg-white text-slate-900 border-slate-200 hover:border-[#06b6d4] hover:shadow-xl"
                    )}
                  >
                    {isHighlighted && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                        MOST POPULAR
                      </div>
                    )}
                    {isUltra && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                        INTRODUCTORY PRICE
                      </div>
                    )}

                    <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                    <p className={cn("text-sm mb-6 min-h-[40px]", isHighlighted ? "text-white/80" : "text-slate-500")}>
                      {product.description?.split('\n')[0] || "Unlock your potential."}
                    </p>

                    <div className="flex items-baseline gap-1 mb-8">
                      <span className="text-4xl font-extrabold tracking-tight">{activePrice.displayPrice.split('/')[0]}</span>
                      <span className={cn("text-sm", isHighlighted ? "text-white/70" : "text-slate-500")}>/{activePrice.recurringInterval}</span>
                    </div>

                    <button
                      onClick={() => handleSubscribe(product.key)}
                      disabled={!!checkoutLoadingId}
                      className={cn(
                        "w-full rounded-full py-3 px-6 font-bold text-sm mb-8 transition-all hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg",
                        isHighlighted
                          ? "bg-white text-[#1e3a8a] hover:bg-slate-100"
                          : "bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white hover:shadow-xl"
                      )}>
                      {checkoutLoadingId === product.key ? (
                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                      ) : (
                        activePrice.priceAmount === 0 ? t.signUpFree : t.getStartedBtn
                      )}
                    </button>

                    <ul className="space-y-4 flex-1">
                      {getFeatures(product.uiDescription).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm">
                          <CheckCircle2 className={cn("h-5 w-5 shrink-0", isHighlighted ? "text-white" : "text-[#06b6d4]")} />
                          <span className={cn(isHighlighted ? "text-white/90" : "text-slate-600")}>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}

          {/* Top-up Cards - Only show for subscribed users */}
          {hasSubscription && (
            <div id="topup" className="mt-24 scroll-mt-32">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#06b6d4] bg-cyan-50 px-4 py-2 mb-4">
                  <Zap className="h-4 w-4 text-[#06b6d4]" />
                  <span className="text-sm font-semibold text-[#1e3a8a] uppercase tracking-wide">Credit Top-ups</span>
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-3">Need More Credits?</h2>
                <p className="text-lg text-slate-500">Purchase additional credits anytime to keep creating</p>
              </div>

              <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
                {topUpOptions.map((option, i) => (
                  <div
                    key={i}
                    className={cn(
                      "relative rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl",
                      option.popular
                        ? "border-[#06b6d4] bg-gradient-to-br from-cyan-50 to-blue-50 scale-105"
                        : "border-slate-200 bg-white hover:border-[#06b6d4]"
                    )}
                  >
                    {option.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#06b6d4] text-white text-xs font-bold px-3 py-1 rounded-full">
                        BEST VALUE
                      </div>
                    )}

                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] text-white mb-4">
                        <Plus className="w-8 h-8" />
                      </div>
                      <div className="text-3xl font-bold text-slate-900 mb-1">{option.credits.toLocaleString()}</div>
                      <div className="text-sm text-slate-500 mb-2">Credits</div>
                      <div className="text-xs text-slate-400 mb-4">
                        ~{option.slides} slides or ~{option.images} AI images
                      </div>
                      <div className="text-2xl font-bold text-[#1e3a8a] mb-6">{option.price}</div>
                      <button
                        onClick={() => handleTopup(option.credits, i)}
                        disabled={topupLoadingId !== null}
                        className={cn(
                          "w-full rounded-full py-2.5 px-6 font-semibold text-sm transition-all hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed",
                          option.popular
                            ? "bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white shadow-lg hover:shadow-xl"
                            : "border-2 border-[#06b6d4] text-[#1e3a8a] hover:bg-cyan-50"
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
              
              {/* Credit cost explanation */}
              <div className="mt-8 text-center text-sm text-slate-500">
                <p>Credit costs: <span className="font-medium">4 credits/slide</span> • <span className="font-medium">10 credits/AI image</span> • <span className="font-medium">15 credits/HD image</span></p>
              </div>
            </div>
          )}

          {/* FAQ Section */}
          <div className="mt-32 max-w-3xl mx-auto text-left">
            <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">{t.faqTitle}</h2>
            <div className="space-y-8">
              <div className="p-6 rounded-2xl border border-slate-200 hover:border-[#06b6d4] transition-colors">
                <h4 className="font-bold text-slate-900 mb-2">{t.faqCancel}</h4>
                <p className="text-slate-600">{t.faqCancelAnswer}</p>
              </div>
              <div className="p-6 rounded-2xl border border-slate-200 hover:border-[#06b6d4] transition-colors">
                <h4 className="font-bold text-slate-900 mb-2">{t.faqStudentDiscount}</h4>
                <p className="text-slate-600">{t.faqStudentAnswer}</p>
              </div>
              <div className="p-6 rounded-2xl border border-slate-200 hover:border-[#06b6d4] transition-colors">
                <h4 className="font-bold text-slate-900 mb-2">{t.faqDowngrade}</h4>
                <p className="text-slate-600">{t.faqDowngradeAnswer}</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      <LandingFooter />
    </div>
  );
}
