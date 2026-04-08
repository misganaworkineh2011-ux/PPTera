"use client";

import { useState, useEffect } from "react";
import { Gift, Copy, Check, Users, Coins, Share2 } from "lucide-react";
import { useLanguage } from "~/contexts/LanguageContext";
import { dashboardTranslations } from "~/lib/dashboard-translations";

interface ReferralStats {
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  totalCreditsEarned: number;
}

interface ReferralData {
  referralCode: string;
  referralLink: string;
  stats: ReferralStats;
  creditsPerReferral: number;
}

export function ReferralCard() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { language } = useLanguage();
  const t = dashboardTranslations[language] || dashboardTranslations.en;

  useEffect(() => {
    fetch("/api/referral")
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnTwitter = () => {
    const text = t.twitterShareText || `I'm using PPT Master to create amazing AI presentations! Sign up with my link and we both get 10 free credits 🎁`;
    const url = data?.referralLink || "";
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      "_blank"
    );
  };

  const shareOnLinkedIn = () => {
    const url = data?.referralLink || "";
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      "_blank"
    );
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6 animate-pulse">
        <div className="h-6 w-32 bg-zinc-200 rounded mb-4" />
        <div className="h-4 w-full bg-zinc-100 rounded mb-2" />
        <div className="h-10 w-full bg-zinc-100 rounded" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="rounded-xl border border-zinc-200 bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
          <Gift className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-zinc-900">{t.inviteFriends || "Invite Friends, Earn Credits"}</h3>
          <p className="text-sm text-zinc-600">
            {(t.getCreditsPerReferral || "Get {credits} credits for each friend who signs up").replace("{credits}", String(data.creditsPerReferral))}
          </p>
        </div>
      </div>

      {/* Referral Link */}
      <div className="mb-4">
        <label className="text-xs font-medium text-zinc-500 mb-1.5 block">
          {t.yourReferralLink || "Your referral link"}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={data.referralLink}
            className="flex-1 px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg text-zinc-700 truncate"
          />
          <button
            onClick={() => copyToClipboard(data.referralLink)}
            className="px-3 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition flex items-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span className="text-sm">{t.copied || "Copied!"}</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span className="text-sm">{t.copy || "Copy"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Referral Code */}
      <div className="mb-4 p-3 bg-white/60 rounded-lg border border-zinc-200/50">
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-500">{t.yourCode || "Your code"}</span>
          <button
            onClick={() => copyToClipboard(data.referralCode)}
            className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
          >
            <Copy className="w-3 h-3" />
            {t.copyCode || "Copy code"}
          </button>
        </div>
        <p className="text-lg font-mono font-bold text-zinc-900 tracking-wider">
          {data.referralCode}
        </p>
      </div>

      {/* Share Buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={shareOnTwitter}
          className="flex-1 py-2 px-3 bg-[#1DA1F2] text-white rounded-lg hover:bg-[#1a8cd8] transition flex items-center justify-center gap-2 text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          {t.shareOnTwitter || "Twitter"}
        </button>
        <button
          onClick={shareOnLinkedIn}
          className="flex-1 py-2 px-3 bg-[#0A66C2] text-white rounded-lg hover:bg-[#094d92] transition flex items-center justify-center gap-2 text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          {t.shareOnLinkedIn || "LinkedIn"}
        </button>
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: "Join PPT Master",
                text: t.shareText || "Sign up with my link and we both get 10 free credits!",
                url: data.referralLink,
              });
            } else {
              copyToClipboard(data.referralLink);
            }
          }}
          className="flex-1 py-2 px-3 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition flex items-center justify-center gap-2 text-sm font-medium"
        >
          <Share2 className="w-4 h-4" />
          {t.share || "Share"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center p-3 bg-white/60 rounded-lg">
          <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
            <Users className="w-4 h-4" />
          </div>
          <p className="text-xl font-bold text-zinc-900">{data?.stats?.completedReferrals || 0}</p>
          <p className="text-xs text-zinc-500">{t.signups || "Signups"}</p>
        </div>
        <div className="text-center p-3 bg-white/60 rounded-lg">
          <div className="flex items-center justify-center gap-1 text-pink-600 mb-1">
            <Coins className="w-4 h-4" />
          </div>
          <p className="text-xl font-bold text-zinc-900">{data?.stats?.totalCreditsEarned || 0}</p>
          <p className="text-xs text-zinc-500">{t.creditsEarned || "Credits Earned"}</p>
        </div>
      </div>
    </div>
  );
}
