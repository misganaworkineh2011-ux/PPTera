"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  Zap,
  Calendar,
  TrendingUp,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Crown,
  Sparkles,
  BarChart3,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "~/contexts/LanguageContext";
import { dashboardTranslations } from "~/lib/dashboard-translations";
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
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#06b6d4]" />
      </div>
    );
  }

  if (error || !billing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-slate-600">{error || "Something went wrong"}</p>
      </div>
    );
  }

  const getPlanIcon = (plan: string | null) => {
    switch (plan) {
      case "ultra":
        return <Crown className="h-5 w-5 text-purple-500" />;
      case "pro":
        return <Sparkles className="h-5 w-5 text-blue-500" />;
      case "plus":
        return <Zap className="h-5 w-5 text-amber-500" />;
      default:
        return <CreditCard className="h-5 w-5 text-slate-400" />;
    }
  };

  const getPlanColor = (plan: string | null) => {
    switch (plan) {
      case "ultra":
        return "from-purple-500 to-pink-500";
      case "pro":
        return "from-blue-500 to-cyan-500";
      case "plus":
        return "from-amber-500 to-orange-500";
      default:
        return "from-slate-400 to-slate-500";
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Billing & Subscription
        </h1>
        <p className="text-slate-500 dark:text-neutral-400 mt-1">
          Manage your subscription and view credit usage
        </p>
      </div>

      {/* Current Plan Card */}
      <div className={cn(
        "relative overflow-hidden rounded-2xl p-6 sm:p-8 text-white",
        `bg-gradient-to-br ${getPlanColor(billing.subscription.plan)}`
      )}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              {getPlanIcon(billing.subscription.plan)}
            </div>
            <div>
              <p className="text-white/80 text-sm">Current Plan</p>
              <h2 className="text-2xl font-bold capitalize">
                {billing.subscription.plan || "Free"} Plan
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-white/70 text-xs mb-1">Credits Available</p>
              <p className="text-2xl font-bold">{billing.credits.current.toLocaleString()}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-white/70 text-xs mb-1">Monthly Limit</p>
              <p className="text-2xl font-bold">{billing.credits.max.toLocaleString()}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-white/70 text-xs mb-1">Billing Cycle</p>
              <p className="text-2xl font-bold capitalize">{billing.subscription.type || "N/A"}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-white/70 text-xs mb-1">Next Reset</p>
              <p className="text-lg font-bold">
                {billing.subscription.nextResetDate
                  ? new Date(billing.subscription.nextResetDate).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>

          {!billing.subscription.isActive && (
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-white text-slate-900 rounded-full font-semibold hover:bg-slate-100 transition"
            >
              Upgrade Now
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Credit Usage */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Usage Progress */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#06b6d4]" />
              Credit Usage
            </h3>
            <span className="text-sm text-slate-500">
              {billing.credits.usagePercentage}% used
            </span>
          </div>

          <div className="relative h-4 bg-slate-100 dark:bg-neutral-800 rounded-full overflow-hidden mb-4">
            <div
              className={cn(
                "absolute inset-y-0 left-0 rounded-full transition-all",
                billing.credits.usagePercentage > 90
                  ? "bg-red-500"
                  : billing.credits.usagePercentage > 70
                  ? "bg-amber-500"
                  : "bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4]"
              )}
              style={{ width: `${billing.credits.usagePercentage}%` }}
            />
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-neutral-400">
              {billing.credits.used.toLocaleString()} used
            </span>
            <span className="text-slate-600 dark:text-neutral-400">
              {billing.credits.current.toLocaleString()} remaining
            </span>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-neutral-800">
            <p className="text-sm text-slate-500 mb-3">With your remaining credits:</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 dark:bg-neutral-800/50 rounded-lg p-3">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {billing.usage.estimatedSlides}
                </p>
                <p className="text-xs text-slate-500">slides (4 credits each)</p>
              </div>
              <div className="bg-slate-50 dark:bg-neutral-800/50 rounded-lg p-3">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {billing.usage.estimatedImages}
                </p>
                <p className="text-xs text-slate-500">AI images (10 credits each)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Plan Features */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Plan Features
          </h3>

          {billing.planDetails ? (
            <ul className="space-y-3">
              {billing.planDetails.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-600 dark:text-neutral-300">{feature}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-500 mb-4">You're on the free plan</p>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white rounded-full text-sm font-semibold hover:opacity-90 transition"
              >
                View Plans
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/pricing"
          className="flex items-center gap-4 p-4 bg-white dark:bg-neutral-900 rounded-xl border border-slate-200 dark:border-neutral-800 hover:border-[#06b6d4] transition group"
        >
          <div className="p-3 bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] rounded-lg text-white">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-900 dark:text-white">Upgrade Plan</p>
            <p className="text-sm text-slate-500">Get more credits & features</p>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-[#06b6d4] transition" />
        </Link>

        <Link
          href="/pricing#topup"
          className="flex items-center gap-4 p-4 bg-white dark:bg-neutral-900 rounded-xl border border-slate-200 dark:border-neutral-800 hover:border-[#06b6d4] transition group"
        >
          <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg text-white">
            <Zap className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-900 dark:text-white">Buy Credits</p>
            <p className="text-sm text-slate-500">One-time credit purchase</p>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-[#06b6d4] transition" />
        </Link>

        <Link
          href="/dashboard/activity"
          className="flex items-center gap-4 p-4 bg-white dark:bg-neutral-900 rounded-xl border border-slate-200 dark:border-neutral-800 hover:border-[#06b6d4] transition group"
        >
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg text-white">
            <Clock className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-900 dark:text-white">View History</p>
            <p className="text-sm text-slate-500">See all activity</p>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-[#06b6d4] transition" />
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#06b6d4]" />
            Recent Credit Usage
          </h3>
          <Link
            href="/dashboard/activity"
            className="text-sm text-[#06b6d4] hover:underline"
          >
            View all
          </Link>
        </div>

        {activities.length > 0 ? (
          <div className="space-y-3">
            {activities.slice(0, 5).map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-neutral-800 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    activity.type === "create"
                      ? "bg-blue-100 text-blue-600"
                      : activity.type === "image_generate"
                      ? "bg-purple-100 text-purple-600"
                      : "bg-slate-100 text-slate-600"
                  )}>
                    {activity.type === "image_generate" ? (
                      <Sparkles className="h-4 w-4" />
                    ) : (
                      <BarChart3 className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {activity.description}
                    </p>
                    {activity.presentation && (
                      <p className="text-xs text-slate-500">
                        {activity.presentation.title}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-xs text-slate-500">
                  {new Date(activity.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-slate-500 py-8">No recent activity</p>
        )}
      </div>

      {/* Account Info */}
      <div className="bg-slate-50 dark:bg-neutral-900/50 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-slate-400" />
          <span className="text-sm text-slate-600 dark:text-neutral-400">
            Member since {new Date(billing.memberSince).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
        <span className="text-sm text-slate-500">
          {billing.usage.presentations} presentations created
        </span>
      </div>
    </div>
  );
}
