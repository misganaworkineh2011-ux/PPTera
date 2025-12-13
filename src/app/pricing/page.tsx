"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
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
    id: string; // Added id to monthly
    displayPrice: string;
    priceAmount: number;
    recurringInterval: string;
  } | null;
  yearly: {
    id: string; // Added id to yearly
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

  const { isSignedIn } = useUser();
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

  const handleSubscribe = async (productId: string) => {
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    setCheckoutLoadingId(productId);
    try {
      const res = await fetch("/api/polar/checkout", {
        method: "POST",
        body: JSON.stringify({
          productId,
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

  // Helper to parse UI description features
  const getFeatures = (desc?: string) => {
    if (!desc) return [];
    return desc.split('\n').filter(line => line.trim().startsWith('•')).map(line => line.replace('•', '').trim());
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-slate-900 selection:text-white overflow-x-hidden">
      <LandingNavbar />

      <div className="relative pt-40 pb-20 px-6">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 md:text-7xl mb-6 animate-fade-in-up">
            {t.pricingTitle}
          </h1>
          <p className="text-xl text-slate-500 mb-12 animate-fade-in-up [animation-delay:100ms]">
            {t.pricingSubtitle}
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-4 mb-16 animate-fade-in-up [animation-delay:200ms]">
            <span className={cn("text-sm font-semibold", !isAnnual ? "text-slate-900" : "text-slate-500")}>{t.monthly}</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative h-8 w-14 rounded-full bg-slate-200 p-1 transition-colors hover:bg-slate-300"
            >
              <div className={cn("h-6 w-6 rounded-full bg-white shadow-sm transition-transform", isAnnual ? "translate-x-6" : "translate-x-0")} />
            </button>
            <span className={cn("text-sm font-semibold", isAnnual ? "text-slate-900" : "text-slate-500")}>
              {t.yearly} <span className="text-green-600 font-bold ml-1">{t.savePercent}</span>
            </span>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
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
              {products.map((product, i) => {
                const priceData = isAnnual ? product.yearly : product.monthly;
                const activePrice = priceData || product.monthly || product.yearly;

                if (!activePrice) return null;

                const isHighlighted = product.key === 'pro';

                return (
                  <div
                    key={product.key}
                    className={cn(
                      "relative rounded-3xl p-8 text-left border transition-all duration-300 flex flex-col h-full animate-fade-in-up",
                      isHighlighted
                        ? "bg-black text-white shadow-2xl scale-105 border-black z-10"
                        : "bg-white text-slate-900 border-slate-200 hover:border-slate-300 hover:shadow-xl"
                    )}
                    style={{ animationDelay: `${300 + (i * 100)}ms` }}
                  >
                    <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                    <p className={cn("text-sm mb-6 min-h-[40px]", isHighlighted ? "text-slate-400" : "text-slate-500")}>
                      {product.description?.split('\n')[0] || "Unlock your potential."}
                    </p>

                    <div className="flex items-baseline gap-1 mb-8">
                      <span className="text-4xl font-extrabold tracking-tight">{activePrice.displayPrice.split('/')[0]}</span>
                      <span className={cn("text-sm", isHighlighted ? "text-slate-400" : "text-slate-500")}>/{activePrice.recurringInterval}</span>
                    </div>

                    <button
                      onClick={() => handleSubscribe(activePrice.id)}
                      disabled={!!checkoutLoadingId}
                      className={cn(
                        "w-full rounded-full py-3 px-6 font-bold text-sm mb-8 transition-transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed",
                        isHighlighted
                          ? "bg-white text-black hover:bg-slate-100"
                          : "bg-black text-white hover:bg-slate-800"
                      )}>
                      {checkoutLoadingId === activePrice.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                      ) : (
                        activePrice.priceAmount === 0 ? t.signUpFree : t.getStartedBtn
                      )}
                    </button>

                    <ul className="space-y-4 flex-1">
                      {getFeatures(product.uiDescription).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm">
                          <CheckCircle2 className={cn("h-5 w-5 shrink-0", isHighlighted ? "text-green-400" : "text-green-600")} />
                          <span className={cn(isHighlighted ? "text-slate-300" : "text-slate-600")}>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-32 max-w-3xl mx-auto text-left">
            <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">{t.faqTitle}</h2>
            <div className="space-y-8">
              <div>
                <h4 className="font-bold text-slate-900 mb-2">{t.faqCancel}</h4>
                <p className="text-slate-600">{t.faqCancelAnswer}</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-2">{t.faqStudentDiscount}</h4>
                <p className="text-slate-600">{t.faqStudentAnswer}</p>
              </div>
              <div>
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
