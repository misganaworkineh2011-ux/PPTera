"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  Zap,
  Calendar,
  TrendingUp,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import DashboardStickyHeader from "~/components/dashboard/DashboardStickyHeader";
import { ReferralCard } from "~/components/dashboard/ReferralCard";
import { useLanguage } from "~/contexts/LanguageContext";
import { dashboardTranslations } from "~/lib/dashboard-translations";

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
      <div className="max-w-4xl mx-auto space-y-6 py-6">
        {/* Current Plan Skeleton */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-cyan-500/10 to-blue-900/10 dark:from-cyan-500/20 dark:to-blue-900/20 rounded-lg">
                <CreditCard className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{t.currentPlan || "Current Plan"}</p>
                <div className="h-5 w-20 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse mt-1" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[t.credits || "Credits", t.monthlyLimit || "Monthly Limit", t.billing || "Billing", t.resets || "Resets"].map((label, i) => (
              <div key={i} className="bg-zinc-50 dark:bg-zinc-700/50 rounded-lg p-4">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">{label}</p>
                <div className="h-7 w-16 bg-zinc-200 dark:bg-zinc-600 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Credit Usage Skeleton */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-zinc-900 dark:text-white">{t.creditUsage || "Credit Usage"}</h2>
            <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
          </div>

          <div className="h-2 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden mb-4">
            <div className="h-full w-1/3 bg-zinc-200 dark:bg-zinc-600 rounded-full animate-pulse" />
          </div>

          <div className="flex justify-between">
            <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
            <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
          </div>

          <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-700">
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">{t.estimatedRemaining || "Estimated remaining"}:</p>
            <div className="grid grid-cols-2 gap-4">
              {[t.slides || "slides", t.aiImages || "AI images"].map((label, i) => (
                <div key={i}>
                  <div className="h-8 w-12 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse mb-1" />
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions - static */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-3 p-4 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <TrendingUp className="h-5 w-5 text-cyan-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-zinc-900 dark:text-white">{t.upgrade || "Upgrade"}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{t.moreCredits || "More credits"}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-zinc-400" />
          </div>

          <div className="flex items-center gap-3 p-4 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <Zap className="h-5 w-5 text-blue-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-zinc-900 dark:text-white">{t.buyCredits || "Buy Credits"}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{t.oneTime || "One-time"}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-zinc-400" />
          </div>

          <div className="flex items-center gap-3 p-4 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <Clock className="h-5 w-5 text-zinc-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-zinc-900 dark:text-white">{t.history || "History"}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{t.allActivity || "All activity"}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-zinc-400" />
          </div>
        </div>

        {/* Features Skeleton */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
          <h2 className="font-medium text-zinc-900 dark:text-white mb-4">{t.planFeatures || "Plan Features"}</h2>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
                <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" style={{ width: `${60 + i * 10}%` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !billing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="h-10 w-10 text-zinc-400 mb-4" />
        <p className="text-zinc-500">{error || "Something went wrong"}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6">
      {/* Current Plan */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-cyan-500/10 to-blue-900/10 dark:from-cyan-500/20 dark:to-blue-900/20 rounded-lg">
              <CreditCard className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{t.currentPlan || "Current Plan"}</p>
              <p className="font-semibold text-zinc-900 dark:text-white capitalize">
                {billing.subscription.plan || t.free || "Free"}
              </p>
            </div>
          </div>
          {!billing.subscription.isActive && (
            <Link
              href="/pricing"
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium rounded-lg hover:opacity-90 transition shadow-sm"
            >
              <Sparkles className="h-4 w-4" />
              {t.upgrade || "Upgrade"}
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-zinc-50 dark:bg-zinc-700/50 rounded-lg p-4">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">{t.credits || "Credits"}</p>
            <p className="text-xl font-semibold text-zinc-900 dark:text-white">
              {billing.credits.current.toLocaleString()}
            </p>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-700/50 rounded-lg p-4">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">{t.monthlyLimit || "Monthly Limit"}</p>
            <p className="text-xl font-semibold text-zinc-900 dark:text-white">
              {billing.credits.max.toLocaleString()}
            </p>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-700/50 rounded-lg p-4">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">{t.billing || "Billing"}</p>
            <p className="text-xl font-semibold text-zinc-900 dark:text-white capitalize">
              {billing.subscription.type || "—"}
            </p>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-700/50 rounded-lg p-4">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">{t.resets || "Resets"}</p>
            <p className="text-lg font-semibold text-zinc-900 dark:text-white">
              {billing.subscription.nextResetDate
                ? new Date(billing.subscription.nextResetDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Credit Usage */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-medium text-zinc-900 dark:text-white">{t.creditUsage || "Credit Usage"}</h2>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {billing.credits.usagePercentage}% {t.used || "used"}
          </span>
        </div>

        <div className="h-2 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all"
            style={{ width: `${Math.min(billing.credits.usagePercentage, 100)}%` }}
          />
        </div>

        <div className="flex justify-between text-sm text-zinc-500 dark:text-zinc-400">
          <span>{billing.credits.used.toLocaleString()} {t.used || "used"}</span>
          <span>{billing.credits.current.toLocaleString()} {t.remaining || "remaining"}</span>
        </div>

        <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-700">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">{t.estimatedRemaining || "Estimated remaining"}:</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-2xl font-semibold text-zinc-900 dark:text-white">
                {billing.usage.estimatedSlides}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{t.slides || "slides"}</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-zinc-900 dark:text-white">
                {billing.usage.estimatedImages}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{t.aiImages || "AI images"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Link
          href="/pricing"
          className="flex items-center gap-3 p-4 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-cyan-300 dark:hover:border-cyan-700 transition group"
        >
          <TrendingUp className="h-5 w-5 text-cyan-500 group-hover:text-cyan-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-zinc-900 dark:text-white">{t.upgrade || "Upgrade"}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{t.moreCredits || "More credits"}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-zinc-400 group-hover:text-cyan-500" />
        </Link>

        {billing.subscription.plan !== "free" && (
          <Link
            href="/pricing#topup"
            className="flex items-center gap-3 p-4 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-blue-300 dark:hover:border-blue-700 transition group"
          >
            <Zap className="h-5 w-5 text-blue-500 group-hover:text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-zinc-900 dark:text-white">{t.buyCredits || "Buy Credits"}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{t.oneTime || "One-time"}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-zinc-400 group-hover:text-blue-500" />
          </Link>
        )}

        <Link
          href="/dashboard/activity"
          className="flex items-center gap-3 p-4 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 transition group"
        >
          <Clock className="h-5 w-5 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300" />
          <div className="flex-1">
            <p className="text-sm font-medium text-zinc-900 dark:text-white">{t.history || "History"}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{t.allActivity || "All activity"}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-zinc-400" />
        </Link>
      </div>

      {/* Referral Program */}
      <ReferralCard />

      {/* Plan Features */}
      {billing.planDetails && (
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
          <h2 className="font-medium text-zinc-900 dark:text-white mb-4">{t.planFeatures || "Plan Features"}</h2>
          <ul className="space-y-2">
            {billing.planDetails.features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-cyan-500 mt-0.5 flex-shrink-0" />
                <span className="text-zinc-600 dark:text-zinc-300">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recent Activity */}
      {activities.length > 0 && (
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-zinc-900 dark:text-white">{t.recentActivity || "Recent Activity"}</h2>
            <Link href="/dashboard/activity" className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
              {t.viewAll || "View all"}
            </Link>
          </div>

          <div className="space-y-3">
            {activities.slice(0, 5).map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-700 last:border-0"
              >
                <div>
                  <p className="text-sm text-zinc-900 dark:text-white">{activity.description}</p>
                  {activity.presentation && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{activity.presentation.title}</p>
                  )}
                </div>
                <span className="text-xs text-zinc-400">
                  {new Date(activity.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Member Info */}
      <div className="flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400 px-1">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>
            Member since {new Date(billing.memberSince).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </span>
        </div>
        <span>{billing.usage.presentations} presentations</span>
      </div>
    </div>
  );
}
