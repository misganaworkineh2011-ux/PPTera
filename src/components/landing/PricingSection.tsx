"use client";

import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { SignInButton } from "@clerk/nextjs";
import { LoadingLink } from "~/components/LoadingLink";
import { type Language } from "~/lib/i18n";

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
        t.exportFormatsAll || "Export to PPTX, PDF, Google Slides",
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
      description: t.forExtraAIPower || "Unlimited AI creations",
      features: [
        t.createUpTo20Cards || "Up to 20 slides per presentation",
        t.monthlyCredits1000 || "1,000 AI credits/month",
        t.removeBranding || "Remove PPT Master branding",
        t.advancedAIImageModels || "Advanced AI image models",
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
        t.createUpTo60Cards || "Up to 60 slides per presentation",
        t.monthlyCredits4000 || "4,000 AI credits/month",
        t.premiumAIImageModels || "Premium AI image models",
        t.customBrandingFonts || "Custom branding & fonts",
        t.premiumAnimations || "Premium slide animations",
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
      description: t.for20xMoreAI || "For 20× more AI usage",
      features: [
        t.createUpTo75Cards || "Up to 75 slides per presentation",
        t.monthlyCredits20000 || "20,000 AI credits/month",
        t.mostAdvancedAIModels || "Most advanced AI models",
        t.allAnimations || "All slide animations & effects",
        t.earlyAccessFeatures || "Early access to new features",
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
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-[2.75rem] leading-[1.15] font-semibold tracking-tight text-zinc-900 lg:text-[3.25rem] mb-4">
            {t.simplePricing || "Simple, transparent pricing"}
          </h2>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
            {t.pricingSubtitle || "Start free, upgrade when you need more power"}
          </p>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
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
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative rounded-2xl p-5 flex flex-col ${
                plan.highlight
                  ? "bg-zinc-900 text-white ring-2 ring-zinc-900"
                  : "bg-white border border-zinc-200"
              }`}
            >
              {plan.badge && (
                <div
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 text-white text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
                    plan.badgeGradient
                      ? "bg-gradient-to-r from-purple-500 to-pink-500"
                      : "bg-emerald-500"
                  }`}
                >
                  {plan.badge}
                </div>
              )}

              <div className="mb-3">
                <h3
                  className={`text-lg font-bold ${plan.highlight ? "text-white" : "text-zinc-900"}`}
                >
                  {plan.name}
                </h3>
                <p
                  className={`text-xs mt-1 ${plan.highlight ? "text-zinc-400" : "text-zinc-500"}`}
                >
                  {plan.description}
                </p>
              </div>

              <div className="mb-5">
                {plan.price === null ? (
                  <div className="h-9 w-16 bg-zinc-200 animate-pulse rounded" />
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span
                      className={`text-3xl font-bold ${plan.highlight ? "text-white" : "text-zinc-900"}`}
                    >
                      {plan.price}
                    </span>
                    <span
                      className={`text-xs ${plan.highlight ? "text-zinc-400" : "text-zinc-500"}`}
                    >
                      {plan.period}
                    </span>
                  </div>
                )}
              </div>

              <ul className="space-y-2.5 mb-6 flex-grow">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-2 text-xs">
                    <Check
                      className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${plan.highlight ? "text-emerald-400" : "text-emerald-500"}`}
                    />
                    <span
                      className={plan.highlight ? "text-zinc-300" : "text-zinc-600"}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {i === 0 ? (
                <SignInButton mode="modal">
                  <button
                    className="w-full py-2.5 px-4 rounded-lg font-semibold text-sm border-2 border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white transition"
                    style={{ cursor: "url('/pointinghand.svg') 12 8, pointer" }}
                  >
                    {plan.cta}
                  </button>
                </SignInButton>
              ) : (
                <SignInButton mode="modal">
                  <button
                    className={`w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition ${
                      plan.highlight
                        ? "bg-white text-zinc-900 hover:bg-zinc-100"
                        : "bg-zinc-900 text-white hover:bg-zinc-800"
                    }`}
                    style={{ cursor: "url('/pointinghand.svg') 12 8, pointer" }}
                  >
                    {plan.cta}
                  </button>
                </SignInButton>
              )}
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
