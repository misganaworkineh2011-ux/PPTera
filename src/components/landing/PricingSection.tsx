"use client";

import { useState, useEffect } from "react";
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
        t.removeBranding || "Remove PPTera branding",
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
        t.removeBranding || "Remove PPTera branding",
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
        t.removeBranding || "Remove PPTera branding",
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
    <section className="py-24 px-6 lg:px-8 border-t border-white/10">
      <div className="mx-auto max-w-7xl">
        {/* Banner above header */}
        <div className="mb-12 max-w-5xl mx-auto px-4 text-center">
           <DiscountBadgeBanner />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-[2.75rem] leading-[1.15] font-semibold tracking-tight text-white lg:text-[3.25rem] mb-4">
            {t.simplePricing || "Simple, transparent pricing"}
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            {t.pricingSubtitle || "Start free, upgrade when you need more power"}
          </p>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <span
            className={`text-sm font-medium ${!isAnnual ? "text-white" : "text-slate-500"}`}
          >
            {t.monthly || "Monthly"}
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className="relative h-7 w-12 rounded-full bg-white/15 border border-white/20 p-0.5 transition-all"
            style={{ cursor: "url('/pointinghand.svg') 12 8, pointer" }}
          >
            <div
              className={`h-6 w-6 rounded-full bg-white shadow transition-transform ${isAnnual ? "translate-x-5" : "translate-x-0"}`}
            />
          </button>
          <span
            className={`text-sm font-medium ${isAnnual ? "text-white" : "text-slate-500"}`}
          >
            {t.yearly || "Yearly"}{" "}
            <span className="text-emerald-400 font-semibold ml-1">
              {t.savePercent || "Save 25%"}
            </span>
          </span>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-start max-w-7xl mx-auto">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative rounded-[2rem] p-8 flex flex-col h-auto transition-all duration-300 group border border-white/10 ${
                plan.highlight
                  ? "border-teal-400/40 bg-white/[0.07] shadow-[0_20px_50px_-15px_rgba(45,212,191,0.25)]"
                  : "hover:border-white/25 hover:bg-white/[0.06] bg-white/[0.04]"
              }`}
            >
              {plan.badge && (
                <div
                  className={`absolute -top-4 left-1/2 -translate-x-1/2 text-white text-[11px] font-black tracking-[0.15em] px-5 py-1.5 rounded-full shadow-lg whitespace-nowrap z-10 uppercase ${
                    plan.badgeGradient
                      ? "bg-gradient-to-r from-emerald-600 to-pink-600 shadow-emerald-500/20"
                      : "bg-gradient-to-r from-emerald-600 to-teal-500 shadow-teal-500/20 shadow-lg"
                  }`}
                >
                  {plan.badge}
                </div>
              )}

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-2xl font-black text-white">
                    {plan.name}
                  </h3>
                  {plan.highlight && (
                    <div className="flex items-center justify-center p-1 rounded-lg bg-teal-400/10 border border-teal-400/30">
                      <Zap className="h-4 w-4 text-teal-300 fill-teal-300/20" />
                    </div>
                  )}
                  {plan.name === "Ultra" && (
                    <Sparkles className="h-5 w-5 text-emerald-500 fill-emerald-500/20" />
                  )}
                </div>
                <p className="text-xs font-bold text-slate-400 leading-relaxed min-h-[32px]">
                  {plan.description}
                </p>
              </div>

              <div className="mb-4 border-b border-white/10 pb-4">
                {plan.price === null ? (
                  <div className="h-10 w-24 animate-pulse rounded-xl bg-white/10" />
                ) : (
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-black tracking-tighter text-white">
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
                    <div className={`mt-0.5 h-3.5 w-3.5 rounded-full flex items-center justify-center shrink-0 ${plan.highlight ? "bg-teal-400/15 text-teal-300" : "bg-white/10 text-slate-400"}`}>
                      <Check className="h-2 w-2 stroke-[4]" />
                    </div>
                    <span className="text-[13px] font-bold text-slate-300 leading-tight">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                <LoadingLink
                  href={localPath("/pricing")}
                  className={`w-full py-4 rounded-[1.2rem] text-sm font-black text-center transition-all duration-300 border border-white/15 block ${
                    plan.highlight
                      ? "bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:brightness-110 hover:scale-[1.02] shadow-xl shadow-teal-500/25"
                      : "bg-white/10 text-white hover:bg-white/20"
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
            className="text-white font-medium underline underline-offset-4 hover:text-slate-300 transition"
          >
            {t.viewAllPlans || "View all plans and features"} →
          </LoadingLink>
        </div>
      </div>
    </section>
  );
}
