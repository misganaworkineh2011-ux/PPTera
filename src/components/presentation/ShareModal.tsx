"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Globe, Lock, CheckCircle2, Copy, Link2, Users, ChevronDown, Mail, UserPlus, Trash2, Edit3 } from "lucide-react";
import { toast } from "sonner";
import type { Theme } from "~/lib/themes";
import { getModalColors } from "~/app/presentation/[slug]/components/ui-colors";
import { useLanguage } from "~/contexts/LanguageContext";
import { dashboardTranslations } from "~/lib/dashboard-translations";
import { trackSharePresentation } from "~/components/GoogleAnalytics";

interface Collaborator {
  id: string;
  email: string;
  role: string;
  status: string;
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string;
  } | null;
}

interface ShareModalProps {
  presentationId: string;
  initialIsPublic?: boolean;
  initialShareToken?: string | null;
  onClose: () => void;
  theme?: Theme;
}

export default function ShareModal({
  presentationId,
  initialIsPublic = false,
  initialShareToken = null,
  onClose,
  theme
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
          {activeTab === "collaborate" && <CollaborateTab presentationId={presentationId} theme={theme} />}
          {activeTab === "share" && (
            <ShareTab
              presentationId={presentationId}
              initialIsPublic={initialIsPublic}
              initialShareToken={initialShareToken}
              theme={theme}
            />
          )}
          {activeTab === "export" && <ExportTab presentationId={presentationId} theme={theme} />}
          {activeTab === "embed" && <EmbedTab presentationId={presentationId} theme={theme} />}
        </div>
      </div>
    </div>
  );
}

function ExportTab({ presentationId, theme, onExportStart }: { presentationId: string; theme?: Theme; onExportStart?: (format: "pdf" | "pptx" | "images") => void }) {
  const [isExporting, setIsExporting] = useState<"pdf" | "pptx" | "images" | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<"pdf" | "pptx" | "images">("pptx");
  const isDark = theme?.colors.background.startsWith("#") &&
    parseInt(theme.colors.background.slice(1, 3), 16) < 128;
  
  const primaryColor = theme?.colors.primary || "#06b6d4";
  
  // Get translations
  const { language } = useLanguage();
  const t = dashboardTranslations[language] || dashboardTranslations.en;
  
  const colors = isDark ? {
    text: "#fafafa",
    textMuted: "#a1a1aa",
    heading: "#fafafa",
    border: "#3f3f46",
    cardBg: "#27272a",
    hoverBorder: "#06b6d4",
    hoverBg: "rgba(6, 182, 212, 0.1)",
  } : {
    text: "#0f172a",
    textMuted: "#64748b",
    heading: "#0f172a",
    border: "#e2e8f0",
    cardBg: "#ffffff",
    hoverBorder: "#06b6d4",
    hoverBg: "rgba(6, 182, 212, 0.05)",
  };

  // Microsoft PowerPoint icon - official style
  const PowerPointIcon = ({ selected }: { selected: boolean }) => (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
      <rect x="8" y="4" width="32" height="40" rx="2" fill={selected ? "#D24726" : "#6B7280"} />
      <rect x="4" y="12" width="20" height="24" rx="1" fill={selected ? "#B7472A" : "#525252"} />
      <text x="14" y="28" fontSize="14" fontWeight="bold" fill="white" textAnchor="middle">P</text>
      <path d="M28 14h8M28 20h8M28 26h8M28 32h6" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
    </svg>
  );

  // Adobe PDF icon - official style  
  const PDFIcon = ({ selected }: { selected: boolean }) => (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
      <path d="M8 4h24l8 8v32a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z" fill={selected ? "#FF0000" : "#6B7280"} />
      <path d="M32 4v8h8" fill={selected ? "#CC0000" : "#525252"} />
      <path d="M32 4l8 8h-8V4z" fill={selected ? "#FF3333" : "#737373"} />
      <text x="24" y="32" fontSize="10" fontWeight="bold" fill="white" textAnchor="middle">PDF</text>
    </svg>
  );

  // Image/Gallery icon - photo style
  const ImagesIcon = ({ selected }: { selected: boolean }) => (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
      <rect x="4" y="8" width="40" height="32" rx="3" fill={selected ? "#4CAF50" : "#6B7280"} />
      <circle cx="14" cy="18" r="4" fill={selected ? "#81C784" : "#9CA3AF"} />
      <path d="M4 32l10-10 8 8 8-12 14 18H4v-4z" fill={selected ? "#2E7D32" : "#525252"} />
      <rect x="8" y="4" width="36" height="28" rx="2" fill="none" stroke={selected ? "#66BB6A" : "#9CA3AF"} strokeWidth="2" opacity="0.5" />
    </svg>
  );

  const formats = [
    { id: "pptx" as const, Icon: PowerPointIcon, label: t.powerpoint || "PowerPoint", ext: ".pptx" },
    { id: "pdf" as const, Icon: PDFIcon, label: t.pdf || "PDF", ext: ".pdf" },
    { id: "images" as const, Icon: ImagesIcon, label: t.imagesZip || "Images", ext: ".zip" },
  ];

  const handleExport = async () => {
    setIsExporting(selectedFormat);
    onExportStart?.(selectedFormat);
    
    try {
      const params = new URLSearchParams();
      params.set("format", selectedFormat);
      params.set("range", "all");

      const exportUrl = `/api/presentations/${presentationId}/export?${params.toString()}`;
      toast.info(`${t.preparingExport || "Preparing export"}...`);

      const response = await fetch(exportUrl);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Export failed with status ${response.status}`);
      }

      const blob = await response.blob();
      
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = `presentation.${selectedFormat === "images" ? "zip" : selectedFormat}`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^";\n]+)"?/);
        if (match && match[1]) {
          filename = decodeURIComponent(match[1]);
        }
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(t.exportCompleteMsg || "Export complete!");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error(error instanceof Error ? error.message : "Export failed");
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: colors.heading }}>{t.exportPresentationTitle || "Export Presentation"}</h3>
        <p className="text-sm" style={{ color: colors.textMuted }}>{t.downloadInFormats || "Download your presentation in various formats"}</p>
      </div>

      {/* Format Selection - Grid like ExportModal */}
      <div>
        <label className="text-sm font-medium mb-3 block" style={{ color: colors.textMuted }}>{t.formatLabel || "Format"}</label>
        <div className="grid grid-cols-3 gap-3">
          {formats.map((fmt) => (
            <button
              key={fmt.id}
              onClick={() => setSelectedFormat(fmt.id)}
              disabled={isExporting !== null}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all disabled:opacity-50"
              style={{
                borderColor: selectedFormat === fmt.id ? primaryColor : colors.border,
                backgroundColor: selectedFormat === fmt.id ? (isDark ? "rgba(6, 182, 212, 0.1)" : "rgba(6, 182, 212, 0.05)") : colors.cardBg,
              }}
            >
              <fmt.Icon selected={selectedFormat === fmt.id} />
              <span className="text-sm font-medium" style={{ color: colors.text }}>{fmt.label}</span>
              <span className="text-xs" style={{ color: colors.textMuted }}>{fmt.ext}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <button
          onClick={handleExport}
          disabled={isExporting !== null}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-50"
          style={{ backgroundColor: primaryColor }}
        >
          {isExporting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {t.exportingStatus || "Exporting..."}
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {t.exportBtn || "Export"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function EmbedTab({ presentationId, theme }: { presentationId: string; theme?: Theme }) {
  const [copied, setCopied] = useState(false);
  const [embedSize, setEmbedSize] = useState<"responsive" | "fixed">("responsive");
  const [width, setWidth] = useState(960);
  const [height, setHeight] = useState(540);
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  // Get translations
  const { language } = useLanguage();
  const t = dashboardTranslations[language] || dashboardTranslations.en;

  const embedCode = embedSize === "responsive"
    ? `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;max-width:100%;">
  <iframe src="${baseUrl}/embed/${presentationId}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen></iframe>
</div>`
    : `<iframe src="${baseUrl}/embed/${presentationId}" width="${width}" height="${height}" style="border:0;" allowfullscreen></iframe>`;

  const primaryColor = theme?.colors.primary || "#06b6d4";
  const isDark = theme?.colors.background.startsWith("#") &&
    parseInt(theme.colors.background.slice(1, 3), 16) < 128;

  const colors = isDark ? {
    text: "#fafafa",
    textMuted: "#a1a1aa",
    heading: "#fafafa",
    border: "#3f3f46",
    inputBg: "#27272a",
    cardBg: "#27272a",
    codeBg: "#27272a",
    infoBg: "rgba(59, 130, 246, 0.1)",
    infoBorder: "rgba(59, 130, 246, 0.3)",
    activeBtn: "rgba(6, 182, 212, 0.2)",
    activeBtnText: "#22d3ee",
    activeBtnBorder: "#06b6d4",
    inactiveBtn: "#27272a",
    inactiveBtnText: "#a1a1aa",
    inactiveBtnBorder: "#3f3f46",
  } : {
    text: "#0f172a",
    textMuted: "#64748b",
    heading: "#0f172a",
    border: "#e2e8f0",
    inputBg: "#ffffff",
    cardBg: "#f8fafc",
    codeBg: "#f8fafc",
    infoBg: "#eff6ff",
    infoBorder: "#bfdbfe",
    activeBtn: "rgba(6, 182, 212, 0.1)",
    activeBtnText: "#0891b2",
    activeBtnBorder: "#06b6d4",
    inactiveBtn: "#ffffff",
    inactiveBtnText: "#64748b",
    inactiveBtnBorder: "#e2e8f0",
  };

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    toast.success(t.copiedStatus || "Copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2" style={{ color: colors.heading }}>{t.embedPresentation || "Embed Presentation"}</h3>
        <p className="text-xs sm:text-sm" style={{ color: colors.textMuted }}>{t.addToWebsite || "Add this presentation to your website or blog"}</p>
      </div>

      {/* Size Options */}
      <div className="space-y-2 sm:space-y-3">
        <label className="text-xs sm:text-sm font-semibold" style={{ color: colors.text }}>{t.embedSize || "Embed Size"}</label>
        <div className="flex gap-2">
          <button
            onClick={() => setEmbedSize("responsive")}
            className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all border"
            style={{
              backgroundColor: embedSize === "responsive" ? colors.activeBtn : colors.inactiveBtn,
              color: embedSize === "responsive" ? colors.activeBtnText : colors.inactiveBtnText,
              borderColor: embedSize === "responsive" ? colors.activeBtnBorder : colors.inactiveBtnBorder,
            }}
          >
            {t.responsive || "Responsive"}
          </button>
          <button
            onClick={() => setEmbedSize("fixed")}
            className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all border"
            style={{
              backgroundColor: embedSize === "fixed" ? colors.activeBtn : colors.inactiveBtn,
              color: embedSize === "fixed" ? colors.activeBtnText : colors.inactiveBtnText,
              borderColor: embedSize === "fixed" ? colors.activeBtnBorder : colors.inactiveBtnBorder,
            }}
          >
            {t.fixedSize || "Fixed Size"}
          </button>
        </div>

        {embedSize === "fixed" && (
          <div className="flex gap-2 sm:gap-3 mt-2 sm:mt-3">
            <div className="flex-1">
              <label className="text-xs mb-1 block" style={{ color: colors.textMuted }}>{t.widthPx || "Width (px)"}</label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                style={{ 
                  backgroundColor: colors.inputBg,
                  borderColor: colors.border,
                  color: colors.text,
                }}
              />
            </div>
            <div className="flex-1">
              <label className="text-xs mb-1 block" style={{ color: colors.textMuted }}>{t.heightPx || "Height (px)"}</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                style={{ 
                  backgroundColor: colors.inputBg,
                  borderColor: colors.border,
                  color: colors.text,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Preview */}
      <div 
        className="rounded-xl border-2 p-2 sm:p-4"
        style={{ borderColor: colors.border, backgroundColor: colors.cardBg }}
      >
        <p className="text-xs font-semibold mb-2 sm:mb-3 uppercase tracking-wide" style={{ color: colors.textMuted }}>{t.previewLabel || "Preview"}</p>
        <div 
          className="aspect-video rounded-lg border overflow-hidden"
          style={{ borderColor: colors.border, backgroundColor: isDark ? "#18181b" : "#ffffff" }}
        >
          <iframe
            src={`${baseUrl}/embed/${presentationId}`}
            className="w-full h-full"
            style={{ border: 0 }}
            title="Presentation Preview"
          />
        </div>
      </div>

      {/* Embed Code */}
      <div className="space-y-2 sm:space-y-3">
        <label className="text-xs sm:text-sm font-semibold" style={{ color: colors.text }}>{t.embedCodeLabel || "Embed Code"}</label>
        <div className="relative">
          <pre 
            className="w-full rounded-xl border px-3 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all max-h-32 sm:max-h-40 overflow-y-auto"
            style={{ 
              backgroundColor: colors.codeBg,
              borderColor: colors.border,
              color: colors.text,
            }}
          >
            {embedCode}
          </pre>
          <button
            onClick={copyEmbedCode}
            className="absolute top-2 right-2 sm:top-3 sm:right-3 flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all border"
            style={{
              backgroundColor: copied ? "#22c55e" : colors.inputBg,
              color: copied ? "#ffffff" : colors.text,
              borderColor: copied ? "#22c55e" : colors.border,
            }}
          >
            {copied ? <CheckCircle2 size={14} className="sm:w-4 sm:h-4" /> : <Copy size={14} className="sm:w-4 sm:h-4" />}
            <span className="hidden sm:inline">{copied ? (t.copiedStatus || "Copied!") : (t.copy || "Copy")}</span>
          </button>
        </div>
        <p 
          className="text-[10px] sm:text-xs rounded-lg px-2 sm:px-3 py-1.5 sm:py-2"
          style={{ 
            backgroundColor: colors.infoBg,
            borderColor: colors.infoBorder,
            border: `1px solid ${colors.infoBorder}`,
            color: colors.textMuted,
          }}
        >
          💡 {t.pasteIntoHtml || "Paste this code into your website's HTML to embed the presentation"}
        </p>
      </div>
    </div>
  );
}

function ShareTab({
  presentationId,
  initialIsPublic,
  initialShareToken,
  theme,
}: {
  presentationId: string;
  initialIsPublic?: boolean;
  initialShareToken?: string | null;
  theme?: Theme;
}) {
  const [isPublic, setIsPublic] = useState(initialIsPublic || false);
  const [shareToken, setShareToken] = useState(initialShareToken || null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Email invite state
  const [showEmailInvite, setShowEmailInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);

  // Get translations
  const { language } = useLanguage();
  const t = dashboardTranslations[language] || dashboardTranslations.en;

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
        body: JSON.stringify({ isPublic: !isPublic }),
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

  const handleSendEmailInvite = async (e: React.FormEvent) => {
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

  return (
    <div className="space-y-5">
      {/* Share Link Section */}
      {isPublic && shareUrl ? (
        <div className="space-y-4">
          {/* Status Banner */}
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

          {/* Share Link Input */}
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
            
            {/* Action Buttons - Side by Side */}
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

            {/* Email Invite Form - Expands Below */}
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

            {/* Info text */}
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
    </div>
  );
}

function CollaborateTab({ presentationId, theme }: { presentationId: string; theme?: Theme }) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isOwner, setIsOwner] = useState(false);

  const textColor = theme?.colors.text || "#1e293b";
  const mutedColor = theme?.colors.textMuted || "#64748b";
  const [emailInput, setEmailInput] = useState("");
  const [emailList, setEmailList] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [selectedRole, setSelectedRole] = useState<"viewer" | "editor">("viewer");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [openCollabDropdown, setOpenCollabDropdown] = useState<string | null>(null);
  const [updatingCollabId, setUpdatingCollabId] = useState<string | null>(null);
  
  // For portal-based dropdown positioning
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const [roleDropdownStyle, setRoleDropdownStyle] = useState<React.CSSProperties>({});
  const roleButtonRef = useRef<HTMLButtonElement>(null);
  const collabButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const fetchCollaborators = async () => {
    setFetching(true);
    try {
      const res = await fetch(`/api/presentations/${presentationId}/collaborators`);
      const data = await res.json();
      setCollaborators(data.collaborators || []);
      setIsOwner(data.isOwner);
    } catch (error) {
      console.error("Error fetching collaborators:", error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchCollaborators();
  }, [presentationId]);

  // Calculate and set dropdown position for role selector
  const handleOpenRoleDropdown = () => {
    if (showRoleDropdown) {
      setShowRoleDropdown(false);
      return;
    }
    
    if (roleButtonRef.current) {
      const rect = roleButtonRef.current.getBoundingClientRect();
      const dropdownHeight = 140;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openAbove = spaceBelow < dropdownHeight;
      
      setRoleDropdownStyle({
        position: 'fixed',
        left: rect.left,
        width: rect.width,
        ...(openAbove 
          ? { bottom: window.innerHeight - rect.top + 4 }
          : { top: rect.bottom + 4 }
        ),
      });
    }
    setShowRoleDropdown(true);
  };

  // Calculate and set dropdown position for collaborator role
  const handleOpenCollabDropdown = (collabId: string) => {
    if (openCollabDropdown === collabId) {
      setOpenCollabDropdown(null);
      return;
    }
    
    const buttonEl = collabButtonRefs.current[collabId];
    if (buttonEl) {
      const rect = buttonEl.getBoundingClientRect();
      const dropdownHeight = 80;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openAbove = spaceBelow < dropdownHeight;
      
      setDropdownStyle({
        position: 'fixed',
        left: rect.left,
        width: rect.width,
        ...(openAbove 
          ? { bottom: window.innerHeight - rect.top + 4 }
          : { top: rect.bottom + 4 }
        ),
      });
    }
    setOpenCollabDropdown(collabId);
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addEmailToList();
    } else if (e.key === "Backspace" && !emailInput && emailList.length > 0) {
      // Remove last email when backspace on empty input
      setEmailList(emailList.slice(0, -1));
    }
  };

  const addEmailToList = () => {
    const trimmedEmail = emailInput.trim().toLowerCase();
    if (!trimmedEmail) return;

    if (!isValidEmail(trimmedEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    if (emailList.includes(trimmedEmail)) {
      setError("This email is already added");
      return;
    }

    // Check if already a collaborator
    if (collaborators.some(c => c.email.toLowerCase() === trimmedEmail)) {
      setError("This person is already a collaborator");
      return;
    }

    setEmailList([...emailList, trimmedEmail]);
    setEmailInput("");
    setError("");
  };

  const removeEmail = (emailToRemove: string) => {
    setEmailList(emailList.filter(e => e !== emailToRemove));
  };

  const handleInviteAll = async () => {
    if (emailList.length === 0) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/presentations/${presentationId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails: emailList, role: selectedRole }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to send invitations");
        return;
      }

      const data = await res.json();
      toast.success(`Invitations sent to ${data.invited} people!`);
      trackSharePresentation("collaborate");
      setEmailList([]);
      fetchCollaborators();
    } catch {
      setError("Failed to send invitations");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (collaboratorId: string, newRole: string) => {
    // Optimistic update - update local state immediately
    const previousCollaborators = [...collaborators];
    setUpdatingCollabId(collaboratorId);
    
    // Update local state optimistically
    setCollaborators(prev => 
      prev.map(c => c.id === collaboratorId ? { ...c, role: newRole } : c)
    );
    
    try {
      const res = await fetch(`/api/presentations/${presentationId}/collaborators`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collaboratorId, role: newRole }),
      });
      
      if (!res.ok) {
        throw new Error("Failed to update role");
      }
      
      toast.success("Role updated!");
    } catch {
      // Revert on error
      setCollaborators(previousCollaborators);
      toast.error("Failed to update role");
    } finally {
      setUpdatingCollabId(null);
    }
  };

  const handleRemove = async (collaboratorId: string) => {
    try {
      await fetch(`/api/presentations/${presentationId}/collaborators?collaboratorId=${collaboratorId}`, {
        method: "DELETE",
      });
      toast.success("Collaborator removed");
      fetchCollaborators();
    } catch {
      toast.error("Failed to remove collaborator");
    }
  };

  return (
    <div className="space-y-6">
      {/* Add People Input with Email Chips */}
      <div className="space-y-3">
        <div 
          className="flex flex-wrap items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 min-h-[52px] cursor-text"
          onClick={() => document.getElementById("email-input")?.focus()}
        >
          {/* Email Chips */}
          {emailList.map((email) => (
            <span
              key={email}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
            >
              {email}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeEmail(email);
                }}
                className="hover:bg-blue-200 rounded-full p-0.5 transition"
              >
                <X size={14} />
              </button>
            </span>
          ))}
          
          {/* Input */}
          <input
            id="email-input"
            type="email"
            value={emailInput}
            onChange={(e) => {
              setEmailInput(e.target.value);
              setError("");
            }}
            onKeyDown={handleKeyDown}
            onBlur={addEmailToList}
            placeholder={emailList.length === 0 ? "Add emails (press Enter after each)" : "Add more..."}
            className="flex-1 min-w-[150px] bg-transparent text-sm focus:outline-none placeholder:text-slate-400"
          />
        </div>

        {/* Role selector and Add button */}
        {emailList.length > 0 && (
          <div className="flex items-center gap-2">
            {/* Custom Role Dropdown */}
            <div className="relative flex-1">
              <button
                ref={roleButtonRef}
                type="button"
                onClick={handleOpenRoleDropdown}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] text-slate-700 font-medium transition-all"
              >
                <span className="flex items-center gap-2">
                  {selectedRole === "editor" ? (
                    <>
                      <Edit3 size={14} className="text-[#1e3a8a]" />
                      Can edit
                    </>
                  ) : (
                    <>
                      <Globe size={14} className="text-[#06b6d4]" />
                      Can view
                    </>
                  )}
                </span>
                <ChevronDown 
                  size={16} 
                  className={`text-slate-400 transition-transform duration-200 ${showRoleDropdown ? "rotate-180" : ""}`} 
                />
              </button>
              
              {/* Portal-based Dropdown Menu */}
              {showRoleDropdown && typeof document !== 'undefined' && createPortal(
                <>
                  <div 
                    className="fixed inset-0 z-[99999]" 
                    onClick={() => setShowRoleDropdown(false)} 
                  />
                  <div 
                    className="bg-white rounded-lg border border-slate-200 shadow-xl z-[100000] overflow-hidden animate-in fade-in duration-100"
                    style={roleDropdownStyle}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRole("viewer");
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-slate-50 transition-colors ${
                        selectedRole === "viewer" ? "bg-slate-50" : ""
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#06b6d4]/10 flex items-center justify-center">
                        <Globe size={16} className="text-[#06b6d4]" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Can view</p>
                        <p className="text-xs text-slate-500">View only access</p>
                      </div>
                    </button>
                    <div className="border-t border-slate-100" />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRole("editor");
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-slate-50 transition-colors ${
                        selectedRole === "editor" ? "bg-slate-50" : ""
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#1e3a8a]/10 flex items-center justify-center">
                        <Edit3 size={16} className="text-[#1e3a8a]" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Can edit</p>
                        <p className="text-xs text-slate-500">Full editing access</p>
                      </div>
                    </button>
                  </div>
                </>,
                document.body
              )}
            </div>
            <button
              onClick={handleInviteAll}
              disabled={loading || emailList.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  Add {emailList.length > 1 ? `(${emailList.length})` : ""}
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}

      {/* Current User */}
      <div className="flex items-center justify-between py-3 border-t border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
            <span className="text-sm font-bold text-white">Y</span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">You</p>
            <p className="text-xs text-slate-500">Owner</p>
          </div>
        </div>
        <span className="text-sm text-slate-500 font-medium">Full Access</span>
      </div>

      {/* Collaborators List */}
      {!fetching && collaborators.length > 0 && (
        <div className="space-y-2 max-h-64 overflow-y-auto border-t border-slate-200 pt-4">
          {collaborators.map((collab) => (
            <div 
              key={collab.id} 
              className={`flex items-center justify-between py-3 hover:bg-slate-50 rounded-lg px-2 transition-all duration-200 ${
                updatingCollabId === collab.id ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                {collab.user?.image ? (
                  <img src={collab.user.image} alt="" className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {collab.email[0]?.toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {collab.user?.name || collab.email}
                  </p>
                  {collab.status === "pending" && (
                    <span className="text-xs text-slate-500">Pending</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isOwner ? (
                  <>
                    {/* Custom Role Dropdown for Collaborator */}
                    <div className="relative">
                      <button
                        ref={(el) => { collabButtonRefs.current[collab.id] = el; }}
                        type="button"
                        onClick={() => handleOpenCollabDropdown(collab.id)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 text-slate-600 font-medium transition-all"
                      >
                        {collab.role === "editor" ? (
                          <>
                            <Edit3 size={12} className="text-[#1e3a8a]" />
                            Can edit
                          </>
                        ) : (
                          <>
                            <Globe size={12} className="text-[#06b6d4]" />
                            Can view
                          </>
                        )}
                        <ChevronDown 
                          size={14} 
                          className={`text-slate-400 transition-transform duration-200 ${openCollabDropdown === collab.id ? "rotate-180" : ""}`} 
                        />
                      </button>
                      
                      {/* Portal-based Dropdown Menu */}
                      {openCollabDropdown === collab.id && typeof document !== 'undefined' && createPortal(
                        <>
                          <div 
                            className="fixed inset-0 z-[99999]" 
                            onClick={() => setOpenCollabDropdown(null)} 
                          />
                          <div 
                            className="bg-white rounded-lg border border-slate-200 shadow-xl z-[100000] overflow-hidden animate-in fade-in duration-100"
                            style={dropdownStyle}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setOpenCollabDropdown(null);
                                if (collab.role !== "viewer") {
                                  handleUpdateRole(collab.id, "viewer");
                                }
                              }}
                              className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-slate-50 transition-colors ${
                                collab.role === "viewer" ? "bg-slate-50" : ""
                              }`}
                            >
                              <Globe size={12} className="text-[#06b6d4]" />
                              Can view
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setOpenCollabDropdown(null);
                                if (collab.role !== "editor") {
                                  handleUpdateRole(collab.id, "editor");
                                }
                              }}
                              className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-slate-50 transition-colors ${
                                collab.role === "editor" ? "bg-slate-50" : ""
                              }`}
                            >
                              <Edit3 size={12} className="text-[#1e3a8a]" />
                              Can edit
                            </button>
                          </div>
                        </>,
                        document.body
                      )}
                    </div>
                    <button
                      onClick={() => handleRemove(collab.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                ) : (
                  <span className="text-sm text-slate-500 font-medium flex items-center gap-1.5">
                    {collab.role === "editor" ? (
                      <>
                        <Edit3 size={12} className="text-[#1e3a8a]" />
                        Can edit
                      </>
                    ) : (
                      <>
                        <Globe size={12} className="text-[#06b6d4]" />
                        Can view
                      </>
                    )}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
