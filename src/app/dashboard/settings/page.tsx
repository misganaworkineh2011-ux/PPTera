"use client";

import { useState, useEffect } from "react";
import { User, Shield, CreditCard, Bell, Monitor, ChevronRight, Loader2, Check, Save, ExternalLink, Sun, Moon, Laptop, MessageSquare } from "lucide-react";
import ReviewWidget from "~/components/dashboard/ReviewWidget";
import PricingModal from "~/components/dashboard/PricingModal";
import { useUser } from "~/lib/auth-compat";
import { authClient } from "~/lib/auth-client";
import { toast } from "sonner";
import { useSettings } from "~/contexts/SettingsContext";
import { useLanguage } from "~/contexts/LanguageContext";
import { dashboardTranslations, type Language } from "~/lib/dashboard-translations";

interface UserSettings {
  id: string;
  name: string;
  email: string;
  image?: string;
  subscriptionPlan?: string;
  credits?: number;
  createdAt?: string;
}

const languageNames: Record<Language, string> = {
  en: "English (United States)",
  es: "Español (Spanish)",
  fr: "Français (French)",
  de: "Deutsch (German)",
  zh: "中文 (Chinese)",
  pt: "Português (Portuguese)",
  it: "Italiano (Italian)",
  ja: "日本語 (Japanese)",
  ko: "한국어 (Korean)",
  ar: "العربية (Arabic)",
  hi: "हिन्दी (Hindi)",
  ru: "Русский (Russian)",
};

export default function SettingsPage() {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { theme, setTheme, emailNotifications, setEmailNotifications, collaborationAlerts, setCollaborationAlerts } = useSettings();
  const { language, setLanguage } = useLanguage();
  
  const [activeTab, setActiveTab] = useState("general");
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [displayName, setDisplayName] = useState("");
  
  // 2FA state
  const [has2FA, setHas2FA] = useState(false);
  
  // Pricing modal state
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);

  const t = dashboardTranslations[language] || dashboardTranslations.en;

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    // Two-factor auth isn't wired up on Better Auth yet.
    if (clerkLoaded && clerkUser) {
      setHas2FA(false);
    }
  }, [clerkLoaded, clerkUser]);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.user) {
        setUserSettings(data.user);
        setDisplayName(data.user.name || "");
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: displayName }),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
        fetchSettings();
      }
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handle2FAToggle = () => {
    toast.info("Two-factor authentication is coming soon.");
  };

  // Password changes go through the email reset link flow.
  const sendPasswordReset = async () => {
    const email = clerkUser?.primaryEmailAddress?.emailAddress;
    if (!email) return;
    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/sign-in",
    });
    if (error) toast.error("Could not send the reset email. Try again.");
    else toast.success(`Password reset link sent to ${email}`);
  };

  const tabs = [
    { id: "general", label: t.general, icon: Monitor, description: t.generalDesc },
    { id: "account", label: t.account, icon: User, description: t.accountDesc },
    { id: "billing", label: t.billing, icon: CreditCard, description: t.billingDesc },
    { id: "notifications", label: t.notifications, icon: Bell, description: t.notificationsDesc },
    { id: "security", label: t.security, icon: Shield, description: t.securityDesc },
    { id: "feedback", label: t.feedback || "Feedback", icon: MessageSquare, description: t.feedbackDesc || "Share your thoughts" },
  ];

  if (isLoading) {
    return (
      <>
        <style jsx global>{`
          @keyframes shimmer {
            100% {
              transform: translateX(100%);
            }
          }
        `}</style>
        <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-5 lg:px-6 lg:py-4">
          <div className="flex flex-col gap-6 lg:flex-row">
            {/* Sidebar Skeleton */}
            <aside className="w-full lg:w-64 shrink-0">
              <nav className="flex flex-col gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-slate-200 dark:bg-zinc-800" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-20 bg-slate-200 dark:bg-zinc-800 rounded" />
                        <div className="h-3 w-32 bg-slate-100 dark:bg-zinc-800 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </nav>
            </aside>

            {/* Main Content Skeleton */}
            <main className="flex-1 rounded-[20px] border border-slate-200/80 dark:border-white/10 bg-white dark:bg-zinc-950 shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-none p-5 sm:p-6 relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <div className="space-y-6">
                <div>
                  <div className="h-6 w-40 bg-slate-200 dark:bg-zinc-800 rounded mb-2" />
                  <div className="h-4 w-64 bg-slate-100 dark:bg-zinc-800 rounded" />
                </div>
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 w-32 bg-slate-200 dark:bg-zinc-800 rounded" />
                      <div className="h-10 w-full bg-slate-100 dark:bg-zinc-800 rounded-lg" />
                    </div>
                  ))}
                </div>
              </div>
            </main>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-5 lg:px-6 lg:py-4">
      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="w-full lg:w-64 shrink-0">
          <nav className="flex flex-col gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
                  activeTab === tab.id
                    ? "border-[#06b6d4] bg-cyan-50/50 dark:bg-[#06b6d4]/10 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? "bg-[#06b6d4] text-white shadow-lg shadow-cyan-500/30"
                      : "bg-slate-100 text-slate-500 group-hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-400 dark:group-hover:bg-zinc-700"
                  }`}>
                    <tab.icon size={18} />
                  </div>
                  <div>
                    <span className={`block text-sm font-bold ${activeTab === tab.id ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-zinc-300"}`}>
                      {tab.label}
                    </span>
                    <span className="text-xs text-slate-500 hidden sm:block dark:text-zinc-400">{tab.description}</span>
                  </div>
                </div>
                {activeTab === tab.id && <ChevronRight size={16} className="text-[#06b6d4]" />}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 rounded-[20px] border border-slate-200/80 dark:border-white/10 bg-white dark:bg-zinc-950 shadow-[0_4px_24px_rgba(0,0,0,0.06)] ring-1 ring-slate-900/5 dark:ring-0 dark:shadow-none p-5 sm:p-6">{activeTab === "general" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t.generalPreferences}</h2>
                <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 mt-1">{t.customizeInterface}</p>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 dark:text-zinc-300">{t.interfaceLanguage}</label>
                  <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as Language)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium focus:border-[#06b6d4] focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white transition-all"
                  >
                    {Object.entries(languageNames).map(([code, name]) => (
                      <option key={code} value={code}>{name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3 dark:text-zinc-300">{t.appearance}</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: "light", label: t.light, icon: Sun },
                      { value: "dark", label: t.dark, icon: Moon },
                      { value: "system", label: t.system, icon: Laptop },
                    ].map((option) => (
                      <label key={option.value} className="cursor-pointer">
                        <input 
                          type="radio" 
                          name="theme" 
                          value={option.value}
                          checked={theme === option.value}
                          onChange={(e) => setTheme(e.target.value as "light" | "dark" | "system")}
                          className="peer sr-only" 
                        />
                        <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-slate-200 p-4 transition-all hover:border-[#06b6d4]/50 hover:shadow-sm peer-checked:border-[#06b6d4] peer-checked:bg-cyan-50/30 peer-checked:shadow-md dark:border-zinc-800 dark:peer-checked:bg-[#06b6d4]/10">
                          <option.icon size={24} className={theme === option.value ? "text-[#06b6d4]" : "text-slate-400 dark:text-zinc-500"} />
                          <span className="text-xs font-bold text-slate-600 dark:text-zinc-300">{option.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "account" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t.accountSettings}</h2>
                <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 mt-1">{t.manageProfile}</p>
              </div>
              
              <div className="space-y-5">
                <div className="flex items-center gap-4 p-5 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-zinc-900 dark:to-zinc-800/50 border border-slate-200 dark:border-zinc-800">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-cyan-500/30">
                    {clerkUser?.firstName?.[0] || userSettings?.name?.[0] || "U"}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{userSettings?.name || "User"}</p>
                    <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">{userSettings?.email}</p>
                    <p className="text-xs font-medium text-slate-400 dark:text-zinc-500 mt-1">{t.memberSince} {userSettings?.createdAt ? new Date(userSettings.createdAt).toLocaleDateString() : "N/A"}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 dark:text-zinc-300">{t.displayName}</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium focus:border-[#06b6d4] focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 dark:text-zinc-300">{t.emailAddress}</label>
                  <input
                    type="email"
                    value={userSettings?.email || ""}
                    disabled
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium bg-slate-50 text-slate-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400"
                  />
                  <p className="text-xs font-medium text-slate-400 dark:text-zinc-500 mt-1.5">{t.emailManaged}</p>
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-white px-5 py-2.5 text-sm font-bold text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 transition-all shadow-sm active:scale-95"
                >
                  {isSaving ? <Loader2 size={14} className="animate-spin" /> : saveSuccess ? <Check size={14} /> : <Save size={14} />}
                  {isSaving ? t.saving : saveSuccess ? t.saved : t.saveChanges}
                </button>
              </div>
            </div>
          )}

          {activeTab === "billing" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t.billingSubscription}</h2>
                <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 mt-1">{t.managePlan}</p>
              </div>
              
              <div className="rounded-xl border border-slate-200 dark:border-zinc-800 p-5 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-zinc-900 dark:to-zinc-800/50">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-sm font-bold text-slate-500 dark:text-zinc-400 mb-1">{t.currentPlan}</p>
                    <p className="text-3xl font-bold text-[#06b6d4] capitalize">{userSettings?.subscriptionPlan || t.free}</p>
                  </div>
                  <button
                    onClick={() => setIsPricingModalOpen(true)}
                    className="flex items-center gap-2 rounded-xl border-2 border-[#06b6d4] px-4 py-2 text-sm font-bold text-[#06b6d4] hover:bg-cyan-50 dark:hover:bg-[#06b6d4]/10 transition-all active:scale-95"
                  >
                    {t.upgrade}
                  </button>
                </div>
                <div className="pt-5 border-t border-slate-200 dark:border-zinc-800">
                  <p className="text-sm font-bold text-slate-600 dark:text-zinc-400 mb-2">{t.creditsRemaining}</p>
                  <p className="text-4xl font-bold text-slate-900 dark:text-white">{userSettings?.credits ?? 0}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t.notificationPreferences}</h2>
                <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 mt-1">{t.chooseUpdates}</p>
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-5 rounded-xl border border-slate-200 dark:border-zinc-800 cursor-pointer hover:border-[#06b6d4]/50 hover:shadow-sm transition-all bg-white dark:bg-zinc-900">
                  <div>
                    <span className="block text-sm font-bold text-slate-700 dark:text-zinc-300">{t.emailNotifications}</span>
                    <span className="text-xs font-medium text-slate-500 dark:text-zinc-400 mt-0.5">{t.emailNotificationsDesc}</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="h-5 w-5 rounded border-slate-300 text-[#06b6d4] focus:ring-[#06b6d4]" 
                  />
                </label>

                <label className="flex items-center justify-between p-5 rounded-xl border border-slate-200 dark:border-zinc-800 cursor-pointer hover:border-[#06b6d4]/50 hover:shadow-sm transition-all bg-white dark:bg-zinc-900">
                  <div>
                    <span className="block text-sm font-bold text-slate-700 dark:text-zinc-300">{t.collaborationAlerts}</span>
                    <span className="text-xs font-medium text-slate-500 dark:text-zinc-400 mt-0.5">{t.collaborationAlertsDesc}</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={collaborationAlerts}
                    onChange={(e) => setCollaborationAlerts(e.target.checked)}
                    className="h-5 w-5 rounded border-slate-300 text-[#06b6d4] focus:ring-[#06b6d4]" 
                  />
                </label>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t.securitySettings}</h2>
                <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 mt-1">{t.manageAccountSecurity}</p>
              </div>

              <div className="space-y-4">
                <div className="p-5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-700 dark:text-zinc-300">{t.password}</p>
                      <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 mt-0.5">{t.passwordManaged}</p>
                    </div>
                    <button
                      onClick={() => void sendPasswordReset()}
                      className="flex items-center gap-2 text-sm font-bold text-[#06b6d4] hover:underline"
                    >
                      {t.manage} <ExternalLink size={12} />
                    </button>
                  </div>
                </div>

                <div className="p-5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-700 dark:text-zinc-300">{t.twoFactorAuth}</p>
                      <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 mt-0.5">{t.twoFactorDesc}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${has2FA ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400"}`}>
                        {has2FA ? t.enabled : t.disabled}
                      </span>
                      <button
                        onClick={handle2FAToggle}
                        className={`px-4 py-2 text-sm font-bold rounded-xl transition-all active:scale-95 ${
                          has2FA 
                            ? "border-2 border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800" 
                            : "bg-[#06b6d4] text-white hover:bg-cyan-600 shadow-sm"
                        }`}
                      >
                        {has2FA ? t.manage : t.enable2FA}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-xl border-2 border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/10">
                  <p className="font-bold text-red-700 dark:text-red-400 mb-1">{t.dangerZone}</p>
                  <p className="text-xs font-medium text-red-600 mb-4 dark:text-red-400">
                    {t.deleteAccountContactSupport || "To delete your account, please contact our support team."}
                  </p>
                  <a 
                    href="mailto:support@pptmaster.app?subject=Account%20Deletion%20Request"
                    className="inline-flex items-center gap-2 rounded-xl border-2 border-red-300 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-100 transition-all active:scale-95 dark:border-red-700 dark:hover:bg-red-900/30"
                  >
                    <ExternalLink size={14} />
                    {t.contactSupport || "Contact Support"}
                  </a>
                </div>
              </div>
            </div>
          )}

          {activeTab === "feedback" && (
            <ReviewWidget />
          )}
        </main>
      </div>
      
      <PricingModal 
        isOpen={isPricingModalOpen} 
        onClose={() => setIsPricingModalOpen(false)} 
        initialTab="plans"
      />
    </div>
  );
}
