"use client";

import { useState, useEffect } from "react";
import { SignInButton } from "@clerk/nextjs";
import { LoadingLink } from "~/components/LoadingLink";
import { type Language } from "~/lib/i18n";
import { Check, Zap, Sparkles } from "lucide-react";
import { DiscountBadgeBanner } from "~/components/DiscountBadgeBanner";

interface PricingSectionProps {
  t: any;
  currentLang: Language;
}

type PolarProduct = {
  key: string;
  name: string;
  monthly: { priceAmount: number } | null;
  yearly: { priceAmount: number } | null;
};

function getLocalizedPath(path: string, lang: Language): string {
  if (lang === "en") return path;
  return `/${lang}${path}`;
}

function getPriceFromProducts(
  products: PolarProduct[],
  key: string
): { monthly: number; yearly: number } | null {
  const product = products.find((p) => p.key === key);
  if (!product) return null;
  const monthlyPrice = product.monthly?.priceAmount
    ? product.monthly.priceAmount / 100
    : null;
  const yearlyPrice = product.yearly?.priceAmount
    ? product.yearly.priceAmount / 100
    : null;
  if (monthlyPrice === null && yearlyPrice === null) return null;
  const yearlyMonthly = yearlyPrice
    ? Number((yearlyPrice / 12).toFixed(2))
    : monthlyPrice;
  return {
    monthly: monthlyPrice ?? yearlyMonthly ?? 0,
    yearly: yearlyMonthly ?? monthlyPrice ?? 0,
  };
}

export function PricingSection({ t, currentLang }: PricingSectionProps) {
  const [isAnnual, setIsAnnual] = useState(true);
  const [products, setProducts] = useState<PolarProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const localPath = (path: string) => getLocalizedPath(path, currentLang);

  useEffect(() => {
    fetch("/api/polar/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const plusPrices = getPriceFromProducts(products, "plus");
  const proPrices = getPriceFromProducts(products, "pro");
  const ultraPrices = getPriceFromProducts(products, "ultra");

  const plans = [
    {
      name: t.free || "Free",
      price: "$0",
      period: t.freeForever || "forever",
      description: t.getStartedWithPPT || "Get started with PPT Master",
      features: [
        t.createUpTo10Cards || "Up to 10 slides per presentation",
        t.simplePresentations || "Basic AI generation",
        t.importFromPdfPptx || "Import from PDF & PPTX",
      ],
      cta: t.startFree || "Start Free",
      popular: false,
      highlight: false,
      badge: null as string | null,
      badgeGradient: false,
    },
    {
      name: "Plus",
      price: loading
        ? null
        : isAnnual
          ? `$${plusPrices?.yearly || 8}`
          : `$${plusPrices?.monthly || 10}`,
      period: t.perMonth || "/month",
      description: t.unlimitedAICreations || "Unlimited AI creations",
      features: [
        t.credits1000 || "1,000 monthly credits",
        t.upTo20Slides || "20 cards per prompt",
        t.exportFormatsAll || "Export to PDF, PPTX & PNG",
        t.removeBranding || "Remove PPT Master branding",
        t.advancedAIModels || "Basic AI image models",
        t.basicAnimations || "Basic slide animations",
      ],
      cta: t.getStartedBtn || "Get Started",
      popular: false,
      highlight: false,
      badge: null as string | null,
      badgeGradient: false,
    },
    {
      name: "Pro",
      price: loading
        ? null
        : isAnnual
          ? `$${proPrices?.yearly || 16}`
          : `$${proPrices?.monthly || 20}`,
      period: t.perMonth || "/month",
      description: t.forPremiumAI || "For premium AI and customization",
      features: [
        t.credits4000 || "4,000 monthly credits",
        t.upTo60Slides || "60 cards per prompt",
        t.removeBranding || "Remove PPT Master branding",
        t.exportFormatsAll || "Export to PDF, PPTX & PNG",
        t.premiumAIModels || "Pro AI models & 2K exports", 
        t.premiumAnimations || "Advanced animations",
        t.customBranding || "Full Brand Control & Fonts",
        t.detailedAnalyticsSharing || "Detailed analytics & premium sharing",
      ],
      cta: t.getStartedBtn || "Get Started",
      popular: true,
      highlight: true,
      badge: t.mostPopular || "MOST POPULAR",
      badgeGradient: false,
    },
    {
      name: "Ultra",
      price: loading
        ? null
        : isAnnual
          ? `$${ultraPrices?.yearly || 67}`
          : `$${ultraPrices?.monthly || 79}`,
      period: t.perMonth || "/month",
      description: t.for20xMoreAI || "For 20Ã— more AI usage",
      features: [
        t.credits20000 || "20,000 monthly credits",
        t.upTo75Slides || "75 cards per prompt",
        t.removeBranding || "Remove PPT Master branding",
        t.exportFormatsAll || "Export to PDF, PPTX & PNG",
        t.premiumAIModels || "Pro AI models & 2K exports",
        t.mostAdvancedModels || "Most advanced AI models",
        t.allAnimations || "All slide animations & effects",
        t.customBranding || "Full Brand Control & Fonts",
        t.detailedAnalyticsSharing || "Detailed analytics & premium sharing",
        t.apiWebhookAccess || "API & Webhook access",
        t.earlyAccess || "Early access to new features",
      ],
      cta: t.getStartedBtn || "Get Started",
      popular: false,
      highlight: false,
      badge: t.introductoryPrice || "INTRODUCTORY PRICE",
      badgeGradient: true,
    },
  ];

  return (
    <section className="py-24 px-6 lg:px-8 bg-zinc-50">
      <div className="mx-auto max-w-7xl">
        {/* Banner above header */}
        <div className="mb-12 max-w-5xl mx-auto px-4 text-center">
           <DiscountBadgeBanner />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-[2.75rem] leading-[1.15] font-semibold tracking-tight text-zinc-900 lg:text-[3.25rem] mb-4">
            {t.simplePricing || "Simple, transparent pricing"}
          </h2>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
            {t.pricingSubtitle || "Start free, upgrade when you need more power"}
          </p>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-4 mb-8">
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
              {t.savePercent || "Save 20%"}
            </span>
          </span>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-start max-w-7xl mx-auto">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative rounded-[2rem] p-8 flex flex-col h-auto transition-all duration-300 group border-2 border-slate-900 ${
                plan.highlight
                  ? "shadow-[0_20px_40px_-15px_rgba(6,182,212,0.15)] bg-gradient-to-b from-white to-cyan-50/20"
                  : "hover:border-slate-800 hover:shadow-xl bg-white"
              }`}
            >
              {plan.badge && (
                <div
                  className={`absolute -top-4 left-1/2 -translate-x-1/2 text-white text-[11px] font-black tracking-[0.15em] px-5 py-1.5 rounded-full shadow-lg whitespace-nowrap z-10 uppercase ${
                    plan.badgeGradient
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 shadow-purple-500/20"
                      : "bg-[#06b6d4] shadow-cyan-500/20 shadow-lg"
                  }`}
                >
                  {plan.badge}
                </div>
              )}

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-2xl font-black text-slate-900">
                    {plan.name}
                  </h3>
                  {plan.highlight && (
                    <div className="flex items-center justify-center p-1 rounded-lg bg-cyan-50 border border-cyan-100">
                      <Zap className="h-4 w-4 text-[#06b6d4] fill-[#06b6d4]/20" />
                    </div>
                  )}
                  {plan.name === "Ultra" && (
                    <Sparkles className="h-5 w-5 text-purple-500 fill-purple-500/20" />
                  )}
                </div>
                <p className="text-xs font-bold text-slate-400 leading-relaxed min-h-[32px]">
                  {plan.description}
                </p>
              </div>

              <div className="mb-4 border-b border-slate-100 pb-4">
                {plan.price === null ? (
                  <div className="h-10 w-24 animate-pulse rounded-xl bg-slate-100" />
                ) : (
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-black tracking-tighter text-slate-900">
                      {plan.price}
                    </span>
                    <span className="text-sm font-bold text-slate-400">
                      /{isAnnual && plan.name !== "Free" ? "yr" : plan.period.replace("/", "")}
                    </span>
                  </div>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className={`mt-0.5 h-3.5 w-3.5 rounded-full flex items-center justify-center shrink-0 ${plan.highlight ? "bg-cyan-100 text-cyan-600" : "bg-slate-100 text-slate-400"}`}>
                      <Check className="h-2 w-2 stroke-[4]" />
                    </div>
                    <span className="text-[13px] font-bold text-slate-600 leading-tight">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                <LoadingLink
                  href={localPath("/pricing")}
                  className={`w-full py-4 rounded-[1.2rem] text-sm font-black text-center transition-all duration-300 border-2 border-slate-900 block ${
                    plan.highlight
                      ? "bg-slate-900 text-white hover:bg-black hover:scale-[1.02] shadow-xl"
                      : "bg-white text-slate-900 hover:bg-slate-900 hover:text-white"
                  }`}
                >
                  {plan.cta}
                </LoadingLink>
              </div>
            </div>
          ))}
        </div>

        {/* View all plans link */}
        <div className="text-center mt-8">
          <LoadingLink
            href={localPath("/pricing")}
            className="text-zinc-900 font-medium underline underline-offset-4 hover:text-zinc-600 transition"
          >
            {t.viewAllPlans || "View all plans and features"} →
          </LoadingLink>
        </div>
      </div>
    </section>
  );
}
