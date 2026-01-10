"use client";

import { createPortal } from "react-dom";
import { X, Lock, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "~/lib/utils";
import { useState, useEffect } from "react";
import { useLanguage } from "~/contexts/LanguageContext";
import { dashboardTranslations } from "~/lib/dashboard-translations";

type PolarProduct = {
  key: string;
  name: string;
  monthly: { priceAmount: number } | null;
  yearly: { priceAmount: number } | null;
};

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  requiredPlan: 'plus' | 'pro' | 'ultra';
  currentPlan?: string | null;
  description?: string;
  onOpenPricing?: () => void;
}

const PLAN_INFO = {
  plus: {
    name: 'Plus',
    color: 'from-blue-500 to-cyan-500',
    features: ['1,000 monthly credits', '20 cards per prompt', 'Remove PPTMaster branding', 'Advanced AI models'],
    includesText: null,
  },
  pro: {
    name: 'Pro',
    color: 'from-purple-500 to-pink-500',
    features: ['4,000 monthly credits', '60 cards per prompt', 'Premium AI image models', 'Custom branding & fonts', 'Detailed analytics & advanced sharing'],
    includesText: 'Everything in Plus, and:',
  },
  ultra: {
    name: 'Ultra',
    color: 'from-orange-500 to-red-500',
    features: ['20,000 monthly credits', '75 cards per prompt', 'Most advanced AI models (text, image, video)', 'Early access to new features'],
    includesText: 'Everything in Pro, and:',
  },
};

export default function UpgradeModal({
  isOpen,
  onClose,
  feature,
  requiredPlan,
  currentPlan,
  description,
  onOpenPricing,
}: UpgradeModalProps) {
  const [isNavigating, setIsNavigating] = useState(false);
  const [products, setProducts] = useState<PolarProduct[]>([]);
  const [loadingPrices, setLoadingPrices] = useState(false);
  const { language } = useLanguage();
  const t = dashboardTranslations[language] || dashboardTranslations.en;
  
  // Reset navigation state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsNavigating(false);
    }
  }, [isOpen]);
  
  // Fetch prices when modal opens
  useEffect(() => {
    if (isOpen && products.length === 0) {
      setLoadingPrices(true);
      fetch("/api/polar/products")
        .then(res => res.json())
        .then(data => setProducts(data))
        .catch(console.error)
        .finally(() => setLoadingPrices(false));
    }
  }, [isOpen, products.length]);
  
  if (!isOpen || typeof window === 'undefined') return null;

  const planInfo = PLAN_INFO[requiredPlan];
  const currentPlanLower = currentPlan?.toLowerCase();
  
  // Get dynamic price from Polar
  const product = products.find(p => p.key === requiredPlan);
  const yearlyPrice = product?.yearly?.priceAmount ? product.yearly.priceAmount / 100 : null;
  const yearlyMonthly = yearlyPrice ? Math.round(yearlyPrice / 12) : null;

  const handleUpgrade = () => {
    setIsNavigating(true);
    onClose(); // Close upgrade modal first
    if (onOpenPricing) {
      onOpenPricing(); // Open pricing modal
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header with gradient */}
        <div className={cn("relative p-6 bg-gradient-to-br", planInfo.color)}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{t.upgradeRequired || "Upgrade Required"}</h2>
              <p className="text-white/80 text-sm">{t.unlockPremiumFeatures || "Unlock premium features"}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-neutral-800 mb-3">
              <Sparkles className="h-4 w-4 text-[#06b6d4]" />
              <span className="text-sm font-semibold text-slate-700 dark:text-neutral-300">
                {feature}
              </span>
            </div>
            
            <p className="text-slate-600 dark:text-neutral-400 leading-relaxed">
              {description || (t.featureRequiresPlan || "This feature requires a {plan} plan or higher.").replace("{plan}", planInfo.name)}
              {currentPlanLower && currentPlanLower !== 'free' && (
                <span className="block mt-2 text-sm">
                  {(t.currentlyOnPlan || "You're currently on the {plan} plan.").replace("{plan}", currentPlanLower)}
                </span>
              )}
            </p>
          </div>

          {/* Plan highlight */}
          <div className="mb-6 p-4 rounded-xl border-2 border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800/50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {planInfo.name} {t.plan || "Plan"}
              </h3>
              <div className="text-right">
                {loadingPrices ? (
                  <div className="h-8 w-16 bg-slate-200 dark:bg-neutral-700 animate-pulse rounded" />
                ) : (
                  <>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      ${yearlyMonthly ?? '—'}
                      <span className="text-sm font-normal text-slate-500 dark:text-neutral-400">{t.perMonth || "/mo"}</span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-neutral-500">
                      {t.billedAnnually || "billed annually"}
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {planInfo.includesText && (
              <p className="text-xs text-slate-500 dark:text-neutral-400 font-semibold mb-2">{planInfo.includesText}</p>
            )}
            <ul className="space-y-2">
              {planInfo.features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-neutral-300">
                  <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-[#06b6d4] flex-shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border-2 border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 font-semibold hover:bg-slate-50 dark:hover:bg-neutral-800 transition"
            >
              {t.maybeLater || "Maybe Later"}
            </button>
            <button
              onClick={handleUpgrade}
              disabled={isNavigating}
              className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white font-semibold hover:shadow-lg transition disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isNavigating ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {t.viewPlans || "View Plans"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
