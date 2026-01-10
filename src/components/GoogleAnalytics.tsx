"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Declare gtag on window
declare global {
  interface Window {
    gtag: (command: string, ...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

function GoogleAnalyticsTracking() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GA_MEASUREMENT_ID || typeof window.gtag !== "function") return;

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    
    window.gtag("config", GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }, [pathname, searchParams]);

  return null;
}

export default function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) return null;
  
  return (
    <>
      {/* Google tag (gtag.js) */}
      <Script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `,
        }}
      />
      <Suspense fallback={null}>
        <GoogleAnalyticsTracking />
      </Suspense>
    </>
  );
}

// ============================================
// CUSTOM EVENT TRACKING
// ============================================

// Generic event tracking
export function trackEvent(action: string, category: string, label?: string, value?: number) {
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== "function") return;
  
  window.gtag("event", action, {
    event_category: category,
    event_label: label,
    value: value,
  });
}

// ============================================
// AUTHENTICATION EVENTS
// ============================================

export function trackSignUp(method: string = "email") {
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== "function") return;
  window.gtag("event", "sign_up", { method });
}

export function trackLogin(method: string = "email") {
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== "function") return;
  window.gtag("event", "login", { method });
}

// ============================================
// E-COMMERCE / SUBSCRIPTION EVENTS
// ============================================

export function trackViewPricing() {
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== "function") return;
  window.gtag("event", "view_item_list", {
    item_list_id: "pricing_plans",
    item_list_name: "Pricing Plans",
  });
}

export function trackSelectPlan(planName: string, price: number, isYearly: boolean = false) {
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== "function") return;
  window.gtag("event", "select_item", {
    items: [{
      item_id: planName.toLowerCase(),
      item_name: planName,
      item_category: isYearly ? "yearly_subscription" : "monthly_subscription",
      price: price,
      currency: "USD",
    }],
  });
}

export function trackBeginCheckout(planName: string, price: number, isYearly: boolean = false) {
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== "function") return;
  window.gtag("event", "begin_checkout", {
    currency: "USD",
    value: price,
    items: [{
      item_id: planName.toLowerCase(),
      item_name: planName,
      item_category: isYearly ? "yearly_subscription" : "monthly_subscription",
      price: price,
      quantity: 1,
    }],
  });
}

export function trackPurchase(
  transactionId: string,
  planName: string,
  price: number,
  isYearly: boolean = false
) {
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== "function") return;
  window.gtag("event", "purchase", {
    transaction_id: transactionId,
    currency: "USD",
    value: price,
    items: [{
      item_id: planName.toLowerCase(),
      item_name: planName,
      item_category: isYearly ? "yearly_subscription" : "monthly_subscription",
      price: price,
      quantity: 1,
    }],
  });
}

export function trackCreditTopUp(credits: number, price: number, transactionId?: string) {
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== "function") return;
  window.gtag("event", "purchase", {
    transaction_id: transactionId || `topup_${Date.now()}`,
    currency: "USD",
    value: price,
    items: [{
      item_id: `credits_${credits}`,
      item_name: `${credits} Credits`,
      item_category: "credit_topup",
      price: price,
      quantity: 1,
    }],
  });
}

// ============================================
// FEATURE USAGE EVENTS
// ============================================

export function trackCreatePresentation(source: string = "dashboard") {
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== "function") return;
  window.gtag("event", "create_presentation", {
    event_category: "engagement",
    event_label: source,
  });
}

export function trackExportPresentation(format: "pptx" | "pdf" | "images") {
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== "function") return;
  window.gtag("event", "export", {
    event_category: "conversion",
    event_label: format,
  });
}

export function trackSharePresentation(method: "link" | "email" | "collaborate") {
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== "function") return;
  window.gtag("event", "share", {
    method: method,
    content_type: "presentation",
  });
}

export function trackGenerateOutline() {
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== "function") return;
  window.gtag("event", "generate_outline", {
    event_category: "engagement",
  });
}

// ============================================
// CONVERSION FUNNEL EVENTS
// ============================================

export function trackTrialStart() {
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== "function") return;
  window.gtag("event", "trial_start", {
    event_category: "conversion",
  });
}

export function trackUpgradeClick(fromPlan: string, toPlan: string) {
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== "function") return;
  window.gtag("event", "upgrade_click", {
    event_category: "conversion",
    event_label: `${fromPlan}_to_${toPlan}`,
  });
}
