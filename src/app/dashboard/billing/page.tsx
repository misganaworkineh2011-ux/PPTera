"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  Zap,
  Calendar,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowUpRight,
  Gift,
} from "lucide-react";
import Link from "next/link";
import { ReferralCard } from "~/components/dashboard/ReferralCard";
import { useLanguage } from "~/contexts/LanguageContext";
import { dashboardTranslations } from "~/lib/dashboard-translations";
import PricingModal from "~/components/dashboard/PricingModal";
import { cn } from "~/lib/utils";

interface BillingData {
  subscription: {
    plan: string | null;
    type: string | null;
    isActive: boolean;
    nextResetDate: string | null;
    polarCustomerId: string | null;
    polarSubscriptionId: string | null;
  };
  credits: {
    current: number;
    max: number;
    used: number;
    usagePercentage: number;
  };
  planDetails: {
    name: string;
    credits: number;
    cardsPerPrompt: number;
    features: string[];
  } | null;
  usage: {
    presentations: number;
    estimatedSlides: number;
    estimatedImages: number;
  };
  memberSince: string;
}

interface UsageActivity {
  id: string;
  type: string;
  description: string;
  createdAt: string;
  presentation?: { id: string; title: string } | null;
}

export default function BillingPage() {
  const [billing, setBilling] = useState<BillingData | null>(null);
  const [activities, setActivities] = useState<UsageActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [pricingModalTab, setPricingModalTab] = useState<"plans" | "topup">("plans");
  const { language } = useLanguage();
  const t = dashboardTranslations[language] || dashboardTranslations.en;

  useEffect(() => {
    async function fetchBillingData() {
      try {
        const [billingRes, usageRes] = await Promise.all([
          fetch("/api/billing"),
          fetch("/api/billing/usage?days=30"),
        ]);

        if (!billingRes.ok) throw new Error("Failed to fetch billing");
        
        const billingData = await billingRes.json();
        setBilling(billingData);

        if (usageRes.ok) {
          const usageData = await usageRes.json();
          setActivities(usageData.activities || []);
        }
      } catch (err) {
        setError("Failed to load billing information");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchBillingData();
  }, []);

  if (loading) {
    return (
      <>
        <style jsx global>{`
          @keyframes shimmer {
            100% {
              transform: translateX(100%);
            }
          }
        `}</style>
        <div className="max-w-[1400px] mx-auto p-4 md:p-5 lg:px-6 lg:py-4">
          {/* Current Plan Skeleton */}
          <div className="bg-white dark:bg-zinc-950 rounded-[20px] border border-slate-200/80 dark:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-none p-5 sm:p-6 mb-5 relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-zinc-800" />
                <div>
                  <div className="h-3 w-20 bg-slate-200 dark:bg-zinc-800 rounded mb-2" />
                  <div className="h-5 w-16 bg-slate-200 dark:bg-zinc-800 rounded" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-slate-50 dark:bg-zinc-900/50 rounded-2xl p-4">
                  <div className="h-3 w-16 bg-slate-200 dark:bg-zinc-800 rounded mb-2" />
                  <div className="h-7 w-12 bg-slate-200 dark:bg-zinc-800 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Credit Usage Skeleton */}
          <div className="bg-white dark:bg-zinc-950 rounded-[20px] border border-slate-200/80 dark:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-none p-5 sm:p-6 mb-5 relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="h-6 w-32 bg-slate-200 dark:bg-zinc-800 rounded mb-4" />
            <div className="h-2.5 bg-slate-100 dark:bg-zinc-800 rounded-full mb-4" />
            <div className="flex justify-between mb-6">
              <div className="h-4 w-20 bg-slate-200 dark:bg-zinc-800 rounded" />
              <div className="h-4 w-24 bg-slate-200 dark:bg-zinc-800 rounded" />
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !billing) {
    return (
      <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] rounded-[32px] border-2 border-dashed border-slate-200/60 dark:border-zinc-800/60 bg-slate-50/50 dark:bg-zinc-900/50 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white dark:bg-zinc-800 shadow-lg ring-1 ring-slate-900/5 dark:ring-0">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">
            {t.somethingWentWrong || "Something went wrong"}
          </h3>
          <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
            {error || "Failed to load billing information"}
          </p>
        </div>
      </div>
    );
  }

  const isPaidUser = billing.subscription.plan && billing.subscription.plan.toLowerCase() !== "free";

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-5 lg:px-6 lg:py-4">
      {/* Current Plan */}
      <div className="group bg-white dark:bg-zinc-950 rounded-[20px] border border-slate-200/80 dark:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] ring-1 ring-slate-900/5 dark:ring-0 dark:shadow-none p-5 sm:p-6 mb-5 transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl shadow-lg shadow-teal-500/30">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">{t.currentPlan || "Current Plan"}</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white capitalize">
                {billing.subscription.plan || t.free || "Free"}
              </p>
            </div>
          </div>
          {!billing.subscription.isActive && (
            <button
              onClick={() => {
                setPricingModalTab("plans");
                setShowPricingModal(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white text-sm font-bold rounded-2xl hover:opacity-90 transition shadow-lg shadow-teal-500/20 active:scale-95"
            >
              <Sparkles className="h-4 w-4" />
              {t.upgrade || "Upgrade"}
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-50 dark:bg-zinc-900/50 rounded-2xl p-4">
            <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 mb-1">{t.credits || "Credits"}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {billing.credits.current.toLocaleString()}
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-zinc-900/50 rounded-2xl p-4">
            <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 mb-1">{t.monthlyLimit || "Monthly Limit"}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {billing.credits.max.toLocaleString()}
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-zinc-900/50 rounded-2xl p-4">
            <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 mb-1">{t.billing || "Billing"}</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white capitalize">
              {billing.subscription.type || "—"}
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-zinc-900/50 rounded-2xl p-4">
            <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 mb-1">{t.resets || "Resets"}</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              {billing.subscription.nextResetDate
                ? new Date(billing.subscription.nextResetDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Credit Usage */}
      <div className="bg-white dark:bg-zinc-950 rounded-[20px] border border-slate-200/80 dark:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.06)] ring-1 ring-slate-900/5 dark:ring-0 dark:shadow-none p-5 sm:p-6 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t.creditUsage || "Credit Usage"}</h2>
          <span className="text-sm font-medium text-slate-500 dark:text-zinc-400">
            {billing.credits.usagePercentage}% {t.used || "used"}
          </span>
        </div>

        <div className="h-2.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-blue-600 rounded-full transition-all"
            style={{ width: `${Math.min(billing.credits.usagePercentage, 100)}%` }}
          />
        </div>

        <div className="flex justify-between text-sm font-medium text-slate-500 dark:text-zinc-400">
          <span>{billing.credits.used.toLocaleString()} {t.used || "used"}</span>
          <span>{billing.credits.current.toLocaleString()} {t.remaining || "remaining"}</span>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-zinc-800">
          <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 mb-3">{t.estimatedRemaining || "Estimated remaining"}:</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {billing.usage.estimatedSlides}
              </p>
              <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">{t.slides || "slides"}</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {billing.usage.estimatedImages}
              </p>
              <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">{t.aiImages || "AI images"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-3 mb-5">
        <button
          onClick={() => {
            setPricingModalTab("plans");
            setShowPricingModal(true);
          }}
          className="flex items-center gap-3 p-5 bg-white dark:bg-zinc-950 rounded-[20px] border border-slate-200/80 dark:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-teal-300 dark:hover:border-teal-700 ring-1 ring-slate-900/5 dark:ring-0 dark:shadow-none transition-all group"
        >
          <div className="p-2.5 bg-gradient-to-br from-teal-500/10 to-blue-600/10 dark:from-teal-500/20 dark:to-blue-600/20 rounded-xl group-hover:from-teal-500/20 group-hover:to-blue-600/20 transition-all">
            <TrendingUp className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-bold text-slate-900 dark:text-white">{t.upgrade || "Upgrade"}</p>
            <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">{t.moreCredits || "More credits"}</p>
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-teal-500 transition-colors" />
        </button>

        {isPaidUser && (
          <button
            onClick={() => {
              setPricingModalTab("topup");
              setShowPricingModal(true);
            }}
            className="flex items-center gap-3 p-5 bg-white dark:bg-zinc-950 rounded-[20px] border border-slate-200/80 dark:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-blue-300 dark:hover:border-blue-700 ring-1 ring-slate-900/5 dark:ring-0 dark:shadow-none transition-all group"
          >
            <div className="p-2.5 bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/20 rounded-xl group-hover:from-blue-500/20 group-hover:to-blue-600/20 transition-all">
              <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-slate-900 dark:text-white">{t.buyCredits || "Buy Credits"}</p>
              <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">{t.oneTime || "One-time"}</p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
          </button>
        )}

        <Link
          href="/dashboard/activity"
          className="flex items-center gap-3 p-5 bg-white dark:bg-zinc-950 rounded-[20px] border border-slate-200/80 dark:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-slate-300 dark:hover:border-zinc-700 ring-1 ring-slate-900/5 dark:ring-0 dark:shadow-none transition-all group"
        >
          <div className="p-2.5 bg-gradient-to-br from-slate-500/10 to-slate-600/10 dark:from-slate-500/20 dark:to-slate-600/20 rounded-xl group-hover:from-slate-500/20 group-hover:to-slate-600/20 transition-all">
            <Calendar className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-bold text-slate-900 dark:text-white">{t.history || "History"}</p>
            <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">{t.allActivity || "All activity"}</p>
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
        </Link>
      </div>

      {/* Referral Program */}
      <div id="referral" className="mb-5">
        <ReferralCard />
      </div>

      {/* Plan Features */}
      {billing.planDetails && (
        <div className="bg-white dark:bg-zinc-950 rounded-[20px] border border-slate-200/80 dark:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.06)] ring-1 ring-slate-900/5 dark:ring-0 dark:shadow-none p-5 sm:p-6 mb-5">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t.planFeatures || "Plan Features"}</h2>
          <ul className="space-y-3">
            {billing.planDetails.features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm">
                <div className="mt-0.5 h-5 w-5 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-3 w-3 text-teal-600 dark:text-teal-400" />
                </div>
                <span className="font-medium text-slate-600 dark:text-zinc-300">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recent Activity */}
      {activities.length > 0 && (
        <div className="bg-white dark:bg-zinc-950 rounded-[20px] border border-slate-200/80 dark:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.06)] ring-1 ring-slate-900/5 dark:ring-0 dark:shadow-none p-5 sm:p-6 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t.recentActivity || "Recent Activity"}</h2>
            <Link href="/dashboard/activity" className="text-sm font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors">
              {t.viewAll || "View all"} →
            </Link>
          </div>

          <div className="space-y-2">
            {activities.slice(0, 5).map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{activity.description}</p>
                  {activity.presentation && (
                    <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">{activity.presentation.title}</p>
                  )}
                </div>
                <span className="text-xs font-medium text-slate-400 dark:text-zinc-500">
                  {new Date(activity.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Member Info */}
      <div className="flex items-center justify-between text-sm font-medium text-slate-500 dark:text-zinc-400 px-1">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>
            Member since {new Date(billing.memberSince).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </span>
        </div>
        <span>{billing.usage.presentations} presentations</span>
      </div>

      {/* Pricing Modal */}
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        currentPlan={billing.subscription.plan}
        initialTab={pricingModalTab}
      />
    </div>
  );
}
