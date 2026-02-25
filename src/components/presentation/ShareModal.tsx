"use client";

import { useState } from "react";
import { X, Globe, Link2, Users } from "lucide-react";
import type { Theme } from "~/lib/themes";
import { getModalColors } from "~/app/presentation/[slug]/components/ui-colors";
import { useLanguage } from "~/contexts/LanguageContext";
import { dashboardTranslations } from "~/lib/dashboard-translations";
import CollaborateTab from "./share-modal/CollaborateTab";
import EmbedTab from "./share-modal/EmbedTab";
import ExportTab from "./share-modal/ExportTab";
import ShareTab from "./share-modal/ShareTab";

interface ShareModalProps {
  presentationId: string;
  initialIsPublic?: boolean;
  initialShareToken?: string | null;
  onClose: () => void;
  theme?: Theme;
  subscriptionPlan?: string | null;
}

export default function ShareModal({
  presentationId,
  initialIsPublic = false,
  initialShareToken = null,
  onClose,
  theme,
  subscriptionPlan
}: ShareModalProps) {
  const [activeTab, setActiveTab] = useState<"collaborate" | "share" | "export" | "embed">("share");

  // Get translations
  const { language } = useLanguage();
  const t = dashboardTranslations[language] || dashboardTranslations.en;

  // Get modal colors using the helper
  const modalColors = theme ? getModalColors(theme) : null;
  
  // Theme colors - use modalColors for consistent theming
  const bgColor = modalColors?.bg || theme?.colors.background || "#ffffff";
  const textColor = modalColors?.text || theme?.colors.text || "#1e293b";
  const headingColor = theme?.colors.heading || "#0f172a";
  const primaryColor = theme?.colors.primary || "#06b6d4";
  const mutedColor = modalColors?.textMuted || theme?.colors.textMuted || "#64748b";

  // Determine if theme is dark
  const isDark = modalColors?.isDark ?? (theme?.colors.background.startsWith("#") &&
    parseInt(theme.colors.background.slice(1, 3), 16) < 128);

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4">
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
        style={{ backgroundColor: bgColor }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5"
          style={{
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
          }}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: primaryColor + '20' }}
            >
              <Link2 size={18} className="sm:hidden" style={{ color: primaryColor }} />
              <Link2 size={20} className="hidden sm:block" style={{ color: primaryColor }} />
            </div>
            <h2 className="text-lg sm:text-xl font-bold" style={{ color: headingColor }}>{t.sharePresentation || "Share Presentation"}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 transition-colors"
            style={{
              color: mutedColor,
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 sm:gap-2 px-4 sm:px-8 pt-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab("collaborate")}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap"
            style={{
              backgroundColor: activeTab === "collaborate" ? primaryColor + '20' : 'transparent',
              color: activeTab === "collaborate" ? primaryColor : mutedColor
            }}
          >
            <Users size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="hidden xs:inline">{t.collaborate || "Collaborate"}</span>
            <span className="xs:hidden">{t.collaborate || "Collab"}</span>
          </button>
          <button
            onClick={() => setActiveTab("share")}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap"
            style={{
              backgroundColor: activeTab === "share" ? primaryColor + '20' : 'transparent',
              color: activeTab === "share" ? primaryColor : mutedColor
            }}
          >
            <Globe size={16} className="sm:w-[18px] sm:h-[18px]" />
            {t.shareTab || "Share"}
          </button>
          <button
            onClick={() => setActiveTab("export")}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap"
            style={{
              backgroundColor: activeTab === "export" ? primaryColor + '20' : 'transparent',
              color: activeTab === "export" ? primaryColor : mutedColor
            }}
          >
            <svg width="16" height="16" className="sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {t.exportTab || "Export"}
          </button>
          <button
            onClick={() => setActiveTab("embed")}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap"
            style={{
              backgroundColor: activeTab === "embed" ? primaryColor + '20' : 'transparent',
              color: activeTab === "embed" ? primaryColor : mutedColor
            }}
          >
            <svg width="16" height="16" className="sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            {t.embedTab || "Embed"}
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-8">
          {activeTab === "collaborate" && (
            <CollaborateTab presentationId={presentationId} theme={theme} />
          )}
          {activeTab === "share" && (
            <ShareTab 
              presentationId={presentationId} 
              initialIsPublic={initialIsPublic} 
              initialShareToken={initialShareToken}
              theme={theme}
              subscriptionPlan={subscriptionPlan}
            />
          )}
          {activeTab === "export" && <ExportTab presentationId={presentationId} theme={theme} />}
          {activeTab === "embed" && <EmbedTab presentationId={presentationId} theme={theme} />}
        </div>
      </div>
    </div>
  );
}
