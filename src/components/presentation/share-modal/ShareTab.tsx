"use client";

import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { Globe, Lock, CheckCircle2, Copy, Mail, Shield, Calendar, Crown } from "lucide-react";
import { toast } from "sonner";
import type { Theme } from "~/lib/themes";
import { useLanguage } from "~/contexts/LanguageContext";
import { dashboardTranslations } from "~/lib/dashboard-translations";
import { trackSharePresentation } from "~/components/GoogleAnalytics";

interface ShareTabProps {
  presentationId: string;
  initialIsPublic?: boolean;
  initialShareToken?: string | null;
  theme?: Theme;
  subscriptionPlan?: string | null;
}

export default function ShareTab({
  presentationId,
  initialIsPublic,
  initialShareToken,
  theme,
  subscriptionPlan,
}: ShareTabProps) {
  const [isPublic, setIsPublic] = useState(initialIsPublic || false);
  const [shareToken, setShareToken] = useState(initialShareToken || null);
  const [sharePassword, setSharePassword] = useState("");
  const [shareExpiresAt, setShareExpiresAt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showEmailInvite, setShowEmailInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);

  const { language } = useLanguage();
  const t = dashboardTranslations[language] || dashboardTranslations.en;

  const hasPremiumSharing = subscriptionPlan === "pro" || subscriptionPlan === "ultra";

  useEffect(() => {
    // Fetch current settings including password/expiration
    async function fetchSettings() {
      try {
        const res = await fetch(`/api/presentations/${presentationId}/share`);
        if (res.ok) {
          const data = await res.json();
          setSharePassword(data.sharePassword || "");
          if (data.shareExpiresAt) {
            setShareExpiresAt(new Date(data.shareExpiresAt).toISOString().split('T')[0]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch share settings", err);
      }
    }
    fetchSettings();
  }, [presentationId]);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = shareToken ? `${baseUrl}/share/${shareToken}` : "";

  const isDark = theme?.colors.background.startsWith("#") &&
    parseInt(theme.colors.background.slice(1, 3), 16) < 128;

  const colors = isDark ? {
    text: "#fafafa",
    textMuted: "#a1a1aa",
    heading: "#fafafa",
    border: "#3f3f46",
    inputBg: "#27272a",
    cardBg: "#27272a",
    iconBg: "rgba(59, 130, 246, 0.2)",
    iconColor: "#60a5fa",
    successBg: "rgba(34, 197, 94, 0.15)",
    successBorder: "rgba(34, 197, 94, 0.3)",
    successIconBg: "rgba(34, 197, 94, 0.2)",
    successIconColor: "#4ade80",
    successText: "#4ade80",
    successTextMuted: "#86efac",
    lockBg: "#27272a",
    lockIconColor: "#71717a",
    btnBg: "#3b82f6",
    btnHoverBg: "#2563eb",
    copyBtnBg: "#27272a",
    copyBtnHoverBg: "#3f3f46",
  } : {
    text: "#0f172a",
    textMuted: "#64748b",
    heading: "#0f172a",
    border: "#e2e8f0",
    inputBg: "#f8fafc",
    cardBg: "#ffffff",
    iconBg: "#dbeafe",
    iconColor: "#2563eb",
    successBg: "#dcfce7",
    successBorder: "#bbf7d0",
    successIconBg: "#dcfce7",
    successIconColor: "#16a34a",
    successText: "#166534",
    successTextMuted: "#15803d",
    lockBg: "#f1f5f9",
    lockIconColor: "#94a3b8",
    btnBg: "#2563eb",
    btnHoverBg: "#1d4ed8",
    copyBtnBg: "#f1f5f9",
    copyBtnHoverBg: "#e2e8f0",
  };

  const handleTogglePublic = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/presentations/${presentationId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          isPublic: !isPublic,
          // Only send these if the plan allows it
          ...(hasPremiumSharing && {
            sharePassword: sharePassword || null,
            shareExpiresAt: shareExpiresAt || null,
          })
        }),
      });

      if (!res.ok) throw new Error("Failed to update");

      const data = await res.json();
      setIsPublic(data.isPublic);

      if (data.shareUrl) {
        const urlParts = data.shareUrl.split("/");
        setShareToken(urlParts[urlParts.length - 1] || null);
      }

      toast.success(data.isPublic ? "Link sharing enabled!" : "Link sharing disabled");
    } catch {
      toast.error("Failed to update sharing settings");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success(t.linkCopied || "Link copied!");
    trackSharePresentation("link");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmailInvite = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setSendingInvite(true);
    try {
      const res = await fetch("/api/presentations/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          presentationId,
          recipientEmail: inviteEmail.trim(),
          message: inviteMessage.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send invite");
      }

      toast.success(`Invite sent to ${inviteEmail}!`);
      trackSharePresentation("email");
      setInviteEmail("");
      setInviteMessage("");
      setShowEmailInvite(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send invite");
    } finally {
      setSendingInvite(false);
    }
  };

  const handleUpdatePremiumSettings = async () => {
    if (!hasPremiumSharing) {
      toast.error("Upgrade to Pro or Ultra for these features");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/presentations/${presentationId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          isPublic, 
          sharePassword: sharePassword || null,
          shareExpiresAt: shareExpiresAt || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to update");
      toast.success("Sharing settings updated!");
    } catch {
      toast.error("Failed to update sharing settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {isPublic && shareUrl ? (
        <div className="space-y-4">
          <div 
            className="flex items-center gap-3 p-4 rounded-xl"
            style={{ 
              backgroundColor: colors.successBg,
              border: `1px solid ${colors.successBorder}`,
            }}
          >
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: colors.successIconBg }}
            >
              <Globe style={{ color: colors.successIconColor }} size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: colors.successText }}>{t.publicLinkActive || "Public link active"}</p>
              <p className="text-xs mt-0.5" style={{ color: colors.successTextMuted }}>{t.anyoneWithLinkCanView || "Anyone with the link can view this presentation"}</p>
            </div>
            <button
              onClick={handleTogglePublic}
              disabled={loading}
              className="text-sm font-medium px-3 py-1.5 rounded-lg transition"
              style={{ color: colors.successText }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.successIconBg}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {t.disableLink || "Disable"}
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="w-full rounded-lg border px-4 py-3 text-sm font-mono focus:outline-none"
                  style={{ 
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.text,
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyToClipboard}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all border"
                style={{
                  backgroundColor: copied ? "#22c55e" : colors.copyBtnBg,
                  color: copied ? "#ffffff" : colors.text,
                  borderColor: copied ? "#22c55e" : colors.border,
                }}
              >
                {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                {copied ? "Copied!" : "Copy link"}
              </button>
              <button
                onClick={() => setShowEmailInvite(!showEmailInvite)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all border"
                style={{
                  backgroundColor: showEmailInvite ? colors.iconBg : colors.copyBtnBg,
                  color: showEmailInvite ? colors.iconColor : colors.text,
                  borderColor: showEmailInvite ? colors.iconColor : colors.border,
                }}
              >
                <Mail size={16} />
                Share via email
              </button>
            </div>

            {showEmailInvite && (
              <form onSubmit={handleSendEmailInvite} className="space-y-3 pt-3" style={{ borderTop: `1px solid ${colors.border}` }}>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: colors.textMuted }} />
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Enter recipient's email"
                    className="w-full rounded-lg border pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    style={{ 
                      backgroundColor: colors.inputBg,
                      borderColor: colors.border,
                      color: colors.text,
                    }}
                    required
                  />
                </div>
                <textarea
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  placeholder="Add a personal message (optional)"
                  rows={2}
                  className="w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                  style={{ 
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.text,
                  }}
                />
                <button
                  type="submit"
                  disabled={sendingInvite || !inviteEmail.trim()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50"
                  style={{ backgroundColor: colors.btnBg }}
                >
                  {sendingInvite ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail size={16} />
                      Send Invite
                    </>
                  )}
                </button>
              </form>
            )}

            <p className="text-xs text-center pt-2" style={{ color: colors.textMuted }}>
              Anyone with the link can view, but not comment or edit.
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: colors.lockBg }}
          >
            <Lock style={{ color: colors.lockIconColor }} size={28} />
          </div>
          <p className="font-semibold mb-2" style={{ color: colors.text }}>{t.linkSharingDisabled || "Link sharing is off"}</p>
          <p className="text-sm mb-4" style={{ color: colors.textMuted }}>
            {t.enableToShare || "Enable link sharing to let anyone with the link view this presentation"}
          </p>
          <button
            onClick={handleTogglePublic}
            disabled={loading}
            className="px-6 py-2.5 rounded-lg text-white text-sm font-semibold transition disabled:opacity-50"
            style={{ backgroundColor: colors.btnBg }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.btnHoverBg}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.btnBg}
          >
            {loading ? "Enabling..." : (t.enableLinkSharing || "Enable link sharing")}
          </button>
        </div>
      )}

      {/* Premium Sharing Settings */}
      <div className="p-5 rounded-xl border space-y-4" style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: colors.text }}>
            <Shield size={16} className="text-cyan-500" />
            Premium Sharing Options
          </h3>
          {!hasPremiumSharing && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800">
              <Crown size={10} className="text-amber-600 dark:text-amber-400" />
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase">Pro/Ultra Only</span>
            </div>
          )}
        </div>

        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${!hasPremiumSharing ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500" style={{ color: colors.textMuted }}>
              Password Protection
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter password"
                value={sharePassword}
                onChange={(e) => setSharePassword(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                style={{ backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }}
              />
              <Lock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500" style={{ color: colors.textMuted }}>
              Expiration Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={shareExpiresAt || ""}
                onChange={(e) => setShareExpiresAt(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                style={{ backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }}
              />
              <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30" />
            </div>
          </div>
        </div>

        {hasPremiumSharing && (
          <button
            onClick={handleUpdatePremiumSettings}
            disabled={loading}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg text-xs font-bold transition-all"
            style={{ color: colors.text }}
          >
            {loading ? "Updating..." : "Update Protection Settings"}
          </button>
        )}
      </div>
    </div>
  );
}
