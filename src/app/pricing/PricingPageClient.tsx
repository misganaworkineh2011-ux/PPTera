"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Loader2, AlertCircle, Plus, Zap, ChevronDown } from "lucide-react";
import { LandingNavbar } from "~/components/LandingNavbar";
import { LandingFooter } from "~/components/LandingFooter";
import { cn } from "~/lib/utils";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { getTranslations, type Language } from "~/lib/i18n";

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

interface PricingPageClientProps {
  currentLang: Language;
}

export function PricingPageClient({ currentLang }: PricingPageClientProps) {
  const [isAnnual, setIsAnnual] = useState(true);
  const [products, setProducts] = useState<PolarProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutLoadingId, setCheckoutLoadingId] = useState<string | null>(null);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [topupLoadingId, setTopupLoadingId] = useState<number | null>(null);

  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const t = getTranslations(currentLang);

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
    } catch (err: unknown) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to start checkout");
      setTopupLoadingId(null);
    }
  };

  return (
    <div className="landing-page min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden">
      <LandingNavbar currentLang={currentLang} />

      {/* Hero Section */}
      <div className="relative pt-40 pb-20 px-6 overflow-hidden">
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
            <div className="grid gap-4 md:grid-cols-4 max-w-7xl mx-auto">
              {/* Free Plan Card */}
              <div className="relative rounded-md border border-slate-200 bg-white hover:border-[#06b6d4] transition-all flex flex-col h-full">
                <div className="absolute top-3 right-3 bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-1 rounded">
                  NO CREDIT CARD
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold mb-1">Free</h3>
                  <p className="text-xs text-slate-500 mb-4">Get started with PPT Master</p>
                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold">$0</span>
                      <span className="text-xs text-slate-500">/forever</span>
                    </div>
                  </div>
                  <button onClick={() => router.push(isSignedIn ? "/" : "/sign-up")} className="w-full rounded py-2 px-4 font-semibold text-xs mb-4 bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white hover:opacity-90">
                    {isSignedIn ? t.goToDashboard : t.signUpFree}
                  </button>
                  <ul className="space-y-2.5 text-xs">
                    <li className="flex items-start gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#06b6d4] mt-0.5" /><span className="text-slate-600">Create up to 10 cards per prompt</span></li>
                    <li className="flex items-start gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#06b6d4] mt-0.5" /><span className="text-slate-600">200 credits at signup</span></li>
                    <li className="flex items-start gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#06b6d4] mt-0.5" /><span className="text-slate-600">Simple presentations and images</span></li>
                    <li className="flex items-start gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#06b6d4] mt-0.5" /><span className="text-slate-600">Export to PDF, PPTX, PNG & Google Slides</span></li>
                  </ul>
                </div>
              </div>

              {/* Plus Plan */}
              <div className="relative rounded-md border border-slate-200 bg-white hover:border-[#06b6d4] transition-all flex flex-col h-full">
                <div className="p-5">
                  <h3 className="text-lg font-bold mb-1">Plus</h3>
                  <p className="text-xs text-slate-500 mb-4">For extra AI power</p>
                  <div className="mb-4">
                    {isAnnual ? (
                      <>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-extrabold">$8</span>
                          <span className="text-xs text-slate-500">/ month</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">$96 billed annually</p>
                      </>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-extrabold">$10</span>
                        <span className="text-xs text-slate-500">/ month</span>
                      </div>
                    )}
                  </div>
                  <button onClick={() => handleSubscribe('plus')} disabled={!!checkoutLoadingId} className="w-full rounded py-2 px-4 font-semibold text-xs mb-4 bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white hover:opacity-90 disabled:opacity-50">
                    {checkoutLoadingId === 'plus' ? <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto" /> : t.getStartedBtn}
                  </button>
                  <p className="text-[12px] text-slate-500 mb-2 font-semibold">Everything in Free, and:</p>
                  <ul className="space-y-2.5 text-xs">
                    <li className="flex items-start gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#06b6d4] mt-0.5" /><span className="text-slate-600">1,000 monthly credits</span></li>
                    <li className="flex items-start gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#06b6d4] mt-0.5" /><span className="text-slate-600">Remove branding</span></li>
                    <li className="flex items-start gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#06b6d4] mt-0.5" /><span className="text-slate-600">Advanced AI image models</span></li>
                  </ul>
                </div>
              </div>

              {/* Pro Plan - Most Popular */}
              <div className="relative rounded-md border-2 border-[#06b6d4] bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] text-white shadow-lg scale-105 flex flex-col h-full">
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap">MOST POPULAR</div>
                <div className="p-5 pt-6">
                  <h3 className="text-lg font-bold mb-1">Pro</h3>
                  <p className="text-xs text-white/80 mb-4">For premium AI and customization</p>
                  <div className="mb-4">
                    {isAnnual ? (
                      <>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-extrabold">$18</span>
                          <span className="text-xs text-white/70">/ month</span>
                        </div>
                        <p className="text-[10px] text-white/60 mt-0.5">$216 billed annually</p>
                      </>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-extrabold">$25</span>
                        <span className="text-xs text-white/70">/ month</span>
                      </div>
                    )}
                  </div>
                  <button onClick={() => handleSubscribe('pro')} disabled={!!checkoutLoadingId} className="w-full rounded py-2 px-4 font-semibold text-xs mb-4 bg-white text-[#1e3a8a] hover:bg-slate-100 disabled:opacity-50">
                    {checkoutLoadingId === 'pro' ? <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto" /> : t.getStartedBtn}
                  </button>
                  <p className="text-[12px] text-white/80 mb-2 font-semibold">Everything in Plus, and:</p>
                  <ul className="space-y-2.5 text-xs">
                    <li className="flex items-start gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-white mt-0.5" /><span className="text-white/90">4,000 monthly credits</span></li>
                    <li className="flex items-start gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-white mt-0.5" /><span className="text-white/90">Premium AI image models</span></li>
                    <li className="flex items-start gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-white mt-0.5" /><span className="text-white/90">Custom branding & fonts</span></li>
                    <li className="flex items-start gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-white mt-0.5" /><span className="text-white/90">API access</span></li>
                  </ul>
                </div>
              </div>

              {/* Ultra Plan */}
              <div className="relative rounded-md border border-slate-200 bg-white hover:border-[#06b6d4] transition-all flex flex-col h-full">
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap">INTRODUCTORY PRICE</div>
                <div className="p-5 pt-6">
                  <h3 className="text-lg font-bold mb-1">Ultra</h3>
                  <p className="text-xs text-slate-500 mb-4">For 20× more AI usage</p>
                  <div className="mb-4">
                    {isAnnual ? (
                      <>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-extrabold">$90</span>
                          <span className="text-xs text-slate-500">/ month</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">$1,080 billed annually</p>
                      </>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-extrabold">$100</span>
                        <span className="text-xs text-slate-500">/ month</span>
                      </div>
                    )}
                  </div>
                  <button onClick={() => handleSubscribe('ultra')} disabled={!!checkoutLoadingId} className="w-full rounded py-2 px-4 font-semibold text-xs mb-4 bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white hover:opacity-90 disabled:opacity-50">
                    {checkoutLoadingId === 'ultra' ? <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto" /> : t.getStartedBtn}
                  </button>
                  <p className="text-[12px] text-slate-500 mb-2 font-semibold">Everything in Pro, and:</p>
                  <ul className="space-y-2.5 text-xs">
                    <li className="flex items-start gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#06b6d4] mt-0.5" /><span className="text-slate-600">20,000 monthly credits</span></li>
                    <li className="flex items-start gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#06b6d4] mt-0.5" /><span className="text-slate-600">Most advanced AI models</span></li>
                    <li className="flex items-start gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#06b6d4] mt-0.5" /><span className="text-slate-600">Early access to new features</span></li>
                  </ul>
                </div>
              </div>
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
                <p className="text-lg text-slate-500">Purchase additional credits anytime</p>
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
                      <div className="text-2xl font-bold text-[#1e3a8a] mb-6">{option.price}</div>
                      <button
                        onClick={() => handleTopup(option.credits, i)}
                        disabled={topupLoadingId !== null}
                        className={cn(
                          "w-full rounded-full py-2.5 px-6 font-semibold text-sm transition-all hover:scale-105 disabled:opacity-70",
                          option.popular
                            ? "bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white shadow-lg"
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
            </div>
          )}

          {/* FAQ Section */}
          <div className="mt-32 max-w-3xl mx-auto text-left">
            <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">{t.faqTitle}</h2>
            <p className="text-lg text-slate-600 mb-12 text-center max-w-2xl mx-auto">
              Find answers to common questions about PPT Master pricing, credits, and features. Can't find what you're looking for? Contact our support team.
            </p>
            <div className="space-y-3">
              {[
                { question: t.faqAIModels, answer: t.faqAIModelsAnswer },
                { question: t.faqAICredits, answer: t.faqAICreditsAnswer },
                { question: t.faqMoreCredits, answer: t.faqMoreCreditsAnswer },
                { question: t.faqCard, answer: t.faqCardAnswer },
                { question: t.faqPowerPoint, answer: t.faqPowerPointAnswer },
                { question: t.faqAnnualDiscount, answer: t.faqAnnualDiscountAnswer },
              ].map((faq, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 hover:border-[#06b6d4] transition-all overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                  >
                    <h4 className="font-bold text-slate-900 text-lg">{faq.question}</h4>
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 text-slate-500 flex-shrink-0 transition-transform duration-200",
                        openFaqIndex === index && "rotate-180"
                      )}
                    />
                  </button>
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-200",
                      openFaqIndex === index ? "max-h-96" : "max-h-0"
                    )}
                  >
                    <p className="px-6 pb-6 text-slate-600 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust Section */}
          <div className="mt-24 text-center">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Trusted by Professionals Worldwide</h3>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
              Join over 100,000 users who trust PPT Master to create professional presentations. Our AI-powered platform has generated over 1 million presentations across 150+ countries.
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-slate-400">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#06b6d4]">4.8/5</div>
                <div className="text-sm">User Rating</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#06b6d4]">30-Day</div>
                <div className="text-sm">Money Back Guarantee</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#06b6d4]">24/7</div>
                <div className="text-sm">Customer Support</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <LandingFooter currentLang={currentLang} />
    </div>
  );
}
