"use client";

import { useState, useEffect } from "react";
import { User, Shield, CreditCard, Bell, Monitor, ChevronRight, Loader2, Check, Save, ExternalLink, Sun, Moon, Laptop, AlertTriangle, MessageSquare } from "lucide-react";
import ReviewWidget from "~/components/dashboard/ReviewWidget";
import { useUser, useClerk } from "@clerk/nextjs";
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

const deleteConfirmWords: Record<Language, string> = {
  en: "DELETE",
  es: "ELIMINAR",
  fr: "SUPPRIMER",
  de: "LÖSCHEN",
  zh: "删除",
  pt: "EXCLUIR",
  it: "ELIMINA",
  ja: "削除",
  ko: "삭제",
  ar: "حذف",
  hi: "हटाएं",
  ru: "УДАЛИТЬ",
};

export default function SettingsPage() {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const { theme, setTheme, emailNotifications, setEmailNotifications, collaborationAlerts, setCollaborationAlerts } = useSettings();
  const { language, setLanguage } = useLanguage();
  
  const [activeTab, setActiveTab] = useState("general");
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [displayName, setDisplayName] = useState("");
  
  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  
  // 2FA state
  const [has2FA, setHas2FA] = useState(false);

  const t = dashboardTranslations[language] || dashboardTranslations.en;

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (clerkLoaded && clerkUser) {
      // Check if user has 2FA enabled
      setHas2FA(clerkUser.twoFactorEnabled || false);
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

  const handleDeleteAccount = async () => {
    const confirmWord = deleteConfirmWords[language];
    if (deleteConfirmation !== confirmWord) {
      return;
    }

    try {
      setIsDeleting(true);
      const res = await fetch("/api/account/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: deleteConfirmation }),
      });

      if (res.ok) {
        // Sign out and redirect to home
        await signOut({ redirectUrl: "/" });
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete account");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Failed to delete account");
    } finally {
      setIsDeleting(false);
    }
  };

  const handle2FAToggle = () => {
    // Open Clerk's user profile to manage 2FA
    openUserProfile();
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
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#06b6d4]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 py-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-[#1e3a8a] dark:text-white">{t.settingsTitle}</h1>
        <p className="text-sm text-slate-500 dark:text-neutral-400">{t.settingsSubtitle}</p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="w-full lg:w-64 shrink-0">
          <nav className="flex flex-col gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group flex items-center justify-between rounded-xl border p-3 text-left transition-all hover:border-[#06b6d4]/30 ${
                  activeTab === tab.id
                    ? "border-[#06b6d4] bg-[#e0f2fe]/50 dark:bg-[#06b6d4]/20"
                    : "border-slate-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? "bg-[#06b6d4] text-white"
                      : "bg-slate-100 text-slate-500 group-hover:bg-[#e0f2fe] group-hover:text-[#06b6d4] dark:bg-neutral-800 dark:text-neutral-400"
                  }`}>
                    <tab.icon size={18} />
                  </div>
                  <div>
                    <span className={`block text-sm font-bold ${activeTab === tab.id ? "text-[#1e3a8a] dark:text-white" : "text-slate-700 dark:text-neutral-300"}`}>
                      {tab.label}
                    </span>
                    <span className="text-xs text-slate-500 hidden sm:block dark:text-neutral-400">{tab.description}</span>
                  </div>
                </div>
                {activeTab === tab.id && <ChevronRight size={16} className="text-[#06b6d4]" />}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          {activeTab === "general" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-[#1e3a8a] dark:text-white">{t.generalPreferences}</h2>
                <p className="text-sm text-slate-500 dark:text-neutral-400">{t.customizeInterface}</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 dark:text-neutral-300">{t.interfaceLanguage}</label>
                  <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as Language)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#06b6d4] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  >
                    {Object.entries(languageNames).map(([code, name]) => (
                      <option key={code} value={code}>{name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 dark:text-neutral-300">{t.appearance}</label>
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
                        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-slate-200 p-3 transition-all hover:border-[#06b6d4]/50 peer-checked:border-[#06b6d4] peer-checked:bg-[#e0f2fe]/30 dark:border-neutral-700 dark:peer-checked:bg-[#06b6d4]/20">
                          <option.icon size={24} className={theme === option.value ? "text-[#06b6d4]" : "text-slate-400"} />
                          <span className="text-xs font-medium text-slate-600 dark:text-neutral-300">{option.label}</span>
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
                <h2 className="text-lg font-bold text-[#1e3a8a] dark:text-white">{t.accountSettings}</h2>
                <p className="text-sm text-slate-500 dark:text-neutral-400">{t.manageProfile}</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 dark:bg-neutral-800">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] flex items-center justify-center text-white text-xl font-bold">
                    {clerkUser?.firstName?.[0] || userSettings?.name?.[0] || "U"}
                  </div>
                  <div>
                    <p className="font-bold text-[#1e3a8a] dark:text-white">{userSettings?.name || "User"}</p>
                    <p className="text-sm text-slate-500 dark:text-neutral-400">{userSettings?.email}</p>
                    <p className="text-xs text-slate-400 mt-1">{t.memberSince} {userSettings?.createdAt ? new Date(userSettings.createdAt).toLocaleDateString() : "N/A"}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 dark:text-neutral-300">{t.displayName}</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#06b6d4] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 dark:text-neutral-300">{t.emailAddress}</label>
                  <input
                    type="email"
                    value={userSettings?.email || ""}
                    disabled
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-slate-50 text-slate-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
                  />
                  <p className="text-xs text-slate-400 mt-1">{t.emailManaged}</p>
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex items-center gap-2 rounded-lg bg-[#1e3a8a] px-4 py-2 text-sm font-medium text-white hover:bg-[#1e3a8a]/90 disabled:opacity-50"
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
                <h2 className="text-lg font-bold text-[#1e3a8a] dark:text-white">{t.billingSubscription}</h2>
                <p className="text-sm text-slate-500 dark:text-neutral-400">{t.managePlan}</p>
              </div>
              
              <div className="rounded-lg border border-slate-200 p-4 dark:border-neutral-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-bold text-[#1e3a8a] dark:text-white">{t.currentPlan}</p>
                    <p className="text-2xl font-bold text-[#06b6d4] capitalize">{userSettings?.subscriptionPlan || t.free}</p>
                  </div>
                  <a
                    href="/pricing"
                    className="flex items-center gap-2 rounded-lg border border-[#06b6d4] px-3 py-1.5 text-sm font-medium text-[#06b6d4] hover:bg-[#e0f2fe] transition"
                  >
                    <ExternalLink size={14} /> {t.upgrade}
                  </a>
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-neutral-700">
                  <p className="text-sm text-slate-600 dark:text-neutral-400">{t.creditsRemaining}</p>
                  <p className="text-3xl font-bold text-[#1e3a8a] dark:text-white">{userSettings?.credits ?? 0}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-[#1e3a8a] dark:text-white">{t.notificationPreferences}</h2>
                <p className="text-sm text-slate-500 dark:text-neutral-400">{t.chooseUpdates}</p>
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 rounded-lg border border-slate-200 cursor-pointer hover:border-[#06b6d4]/50 dark:border-neutral-700">
                  <div>
                    <span className="block text-sm font-medium text-slate-700 dark:text-neutral-300">{t.emailNotifications}</span>
                    <span className="text-xs text-slate-500 dark:text-neutral-400">{t.emailNotificationsDesc}</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="h-5 w-5 rounded border-slate-300 text-[#06b6d4] focus:ring-[#06b6d4]" 
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-lg border border-slate-200 cursor-pointer hover:border-[#06b6d4]/50 dark:border-neutral-700">
                  <div>
                    <span className="block text-sm font-medium text-slate-700 dark:text-neutral-300">{t.collaborationAlerts}</span>
                    <span className="text-xs text-slate-500 dark:text-neutral-400">{t.collaborationAlertsDesc}</span>
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
                <h2 className="text-lg font-bold text-[#1e3a8a] dark:text-white">{t.securitySettings}</h2>
                <p className="text-sm text-slate-500 dark:text-neutral-400">{t.manageAccountSecurity}</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-lg border border-slate-200 dark:border-neutral-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-700 dark:text-neutral-300">{t.password}</p>
                      <p className="text-xs text-slate-500 dark:text-neutral-400">{t.passwordManaged}</p>
                    </div>
                    <button
                      onClick={() => openUserProfile()}
                      className="flex items-center gap-2 text-sm font-medium text-[#06b6d4] hover:underline"
                    >
                      {t.manage} <ExternalLink size={12} />
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-slate-200 dark:border-neutral-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-700 dark:text-neutral-300">{t.twoFactorAuth}</p>
                      <p className="text-xs text-slate-500 dark:text-neutral-400">{t.twoFactorDesc}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded ${has2FA ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-slate-100 text-slate-500 dark:bg-neutral-800 dark:text-neutral-400"}`}>
                        {has2FA ? t.enabled : t.disabled}
                      </span>
                      <button
                        onClick={handle2FAToggle}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                          has2FA 
                            ? "border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-neutral-700 dark:text-neutral-400" 
                            : "bg-[#06b6d4] text-white hover:bg-[#06b6d4]/90"
                        }`}
                      >
                        {has2FA ? t.manage : t.enable2FA}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20">
                  <p className="font-medium text-red-700 dark:text-red-400">{t.dangerZone}</p>
                  <p className="text-xs text-red-600 mb-3 dark:text-red-400">{t.deleteAccountWarning}</p>
                  <button 
                    onClick={() => setShowDeleteModal(true)}
                    className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100 transition dark:border-red-700 dark:hover:bg-red-900/50"
                  >
                    {t.deleteAccount}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "feedback" && (
            <ReviewWidget />
          )}
        </main>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl dark:bg-neutral-900" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-red-700 dark:text-red-400">{t.deleteConfirmTitle}</h3>
            </div>
            <p className="text-sm text-slate-600 mb-4 dark:text-neutral-400">
              {t.deleteConfirmMessage}
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2 dark:text-neutral-300">
                {t.typeToConfirm}: <span className="font-bold text-red-600">{deleteConfirmWords[language]}</span>
              </label>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-red-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                placeholder={deleteConfirmWords[language]}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmation("");
                }}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting || deleteConfirmation !== deleteConfirmWords[language]}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting && <Loader2 size={14} className="animate-spin" />}
                {isDeleting ? t.deleting : t.deleteAccount}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
