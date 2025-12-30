"use client";

import { createPortal } from "react-dom";
import { X, Lock, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "~/lib/utils";
import { useState } from "react";

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
    features: ['20 cards per prompt', '1,000 monthly credits', 'Remove branding', 'Advanced AI models'],
    price: { monthly: '$10', yearly: '$8' },
  },
  pro: {
    name: 'Pro',
    color: 'from-purple-500 to-pink-500',
    features: ['60 cards per prompt', '4,000 monthly credits', 'Custom themes & branding', 'Analytics & API access'],
    price: { monthly: '$25', yearly: '$18' },
  },
  ultra: {
    name: 'Ultra',
    color: 'from-orange-500 to-red-500',
    features: ['75 cards per prompt', '20,000 monthly credits', 'Most advanced AI models', '100 custom domains'],
    price: { monthly: '$100', yearly: '$90' },
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
  
  if (!isOpen || typeof window === 'undefined') return null;

  const planInfo = PLAN_INFO[requiredPlan];
  const currentPlanLower = currentPlan?.toLowerCase();

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
              <h2 className="text-2xl font-bold text-white">Upgrade Required</h2>
              <p className="text-white/80 text-sm">Unlock premium features</p>
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
              {description || `This feature requires a ${planInfo.name} plan or higher.`}
              {currentPlanLower && currentPlanLower !== 'free' && (
                <span className="block mt-2 text-sm">
                  You're currently on the <span className="font-semibold capitalize">{currentPlanLower}</span> plan.
                </span>
              )}
            </p>
          </div>

          {/* Plan highlight */}
          <div className="mb-6 p-4 rounded-xl border-2 border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800/50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {planInfo.name} Plan
              </h3>
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {planInfo.price.yearly}
                  <span className="text-sm font-normal text-slate-500 dark:text-neutral-400">/mo</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-neutral-500">
                  billed annually
                </div>
              </div>
            </div>
            
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
              Maybe Later
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
                  View Plans
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
