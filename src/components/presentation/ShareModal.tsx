"use client";

import { useState, useEffect } from "react";
import { X, Globe, Lock, CheckCircle2, Copy, Link2, Users, ChevronDown, Mail, UserPlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Theme } from "~/lib/themes";

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

  // Theme colors
  const bgColor = theme?.colors.background || "#ffffff";
  const textColor = theme?.colors.text || "#1e293b";
  const headingColor = theme?.colors.heading || "#0f172a";
  const primaryColor = theme?.colors.primary || "#06b6d4";
  const mutedColor = theme?.colors.textMuted || "#64748b";

  // Determine if theme is dark
  const isDark = theme?.colors.background.startsWith("#") &&
    parseInt(theme.colors.background.slice(1, 3), 16) < 128;

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
            <h2 className="text-lg sm:text-xl font-bold" style={{ color: headingColor }}>Share Presentation</h2>
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
            <span className="hidden xs:inline">Collaborate</span>
            <span className="xs:hidden">Collab</span>
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
            Share
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
            Export
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
            Embed
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
  const isDark = theme?.colors.background.startsWith("#") &&
    parseInt(theme.colors.background.slice(1, 3), 16) < 128;
  
  const colors = isDark ? {
    text: "#fafafa",
    textMuted: "#a1a1aa",
    heading: "#fafafa",
    border: "#3f3f46",
    cardBg: "#27272a",
    hoverBorder: "#06b6d4",
    hoverBg: "rgba(6, 182, 212, 0.1)",
    iconBg: {
      pdf: "rgba(239, 68, 68, 0.2)",
      pptx: "rgba(249, 115, 22, 0.2)",
      images: "rgba(168, 85, 247, 0.2)",
    },
    iconColor: {
      pdf: "#f87171",
      pptx: "#fb923c",
      images: "#c084fc",
    },
  } : {
    text: "#0f172a",
    textMuted: "#64748b",
    heading: "#0f172a",
    border: "#e2e8f0",
    cardBg: "#ffffff",
    hoverBorder: "#06b6d4",
    hoverBg: "rgba(6, 182, 212, 0.05)",
    iconBg: {
      pdf: "#fee2e2",
      pptx: "#ffedd5",
      images: "#f3e8ff",
    },
    iconColor: {
      pdf: "#dc2626",
      pptx: "#ea580c",
      images: "#9333ea",
    },
  };

  const handleExport = async (format: "pdf" | "pptx" | "images") => {
    setIsExporting(format);
    onExportStart?.(format);
    
    try {
      const params = new URLSearchParams();
      params.set("format", format);
      params.set("range", "all");

      const exportUrl = `/api/presentations/${presentationId}/export?${params.toString()}`;
      toast.info(`Preparing ${format.toUpperCase()} export...`);

      const response = await fetch(exportUrl);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Export failed with status ${response.status}`);
      }

      const blob = await response.blob();
      
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = `presentation.${format === "images" ? "zip" : format}`;
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

      toast.success("Export complete!");
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
        <h3 className="text-lg font-semibold mb-2" style={{ color: colors.heading }}>Export Presentation</h3>
        <p className="text-sm" style={{ color: colors.textMuted }}>Download your presentation in various formats</p>
      </div>

      <div className="grid gap-4">
        {/* PDF Export */}
        <button 
          onClick={() => handleExport("pdf")}
          disabled={isExporting !== null}
          className="flex items-center justify-between p-5 rounded-xl border-2 transition-all group disabled:opacity-50"
          style={{ borderColor: colors.border, backgroundColor: colors.cardBg }}
          onMouseEnter={(e) => {
            if (!isExporting) {
              e.currentTarget.style.borderColor = colors.hoverBorder;
              e.currentTarget.style.backgroundColor = colors.hoverBg;
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = colors.border;
            e.currentTarget.style.backgroundColor = colors.cardBg;
          }}
        >
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center transition"
              style={{ backgroundColor: colors.iconBg.pdf }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: colors.iconColor.pdf }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-semibold" style={{ color: colors.text }}>PDF Document</p>
              <p className="text-sm" style={{ color: colors.textMuted }}>Best for sharing and printing</p>
            </div>
          </div>
          {isExporting === "pdf" ? (
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" style={{ color: colors.textMuted }} />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: colors.textMuted }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          )}
        </button>

        {/* PowerPoint Export */}
        <button 
          onClick={() => handleExport("pptx")}
          disabled={isExporting !== null}
          className="flex items-center justify-between p-5 rounded-xl border-2 transition-all group disabled:opacity-50"
          style={{ borderColor: colors.border, backgroundColor: colors.cardBg }}
          onMouseEnter={(e) => {
            if (!isExporting) {
              e.currentTarget.style.borderColor = colors.hoverBorder;
              e.currentTarget.style.backgroundColor = colors.hoverBg;
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = colors.border;
            e.currentTarget.style.backgroundColor = colors.cardBg;
          }}
        >
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center transition"
              style={{ backgroundColor: colors.iconBg.pptx }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: colors.iconColor.pptx }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-semibold" style={{ color: colors.text }}>PowerPoint (PPTX)</p>
              <p className="text-sm" style={{ color: colors.textMuted }}>Editable presentation file</p>
            </div>
          </div>
          {isExporting === "pptx" ? (
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" style={{ color: colors.textMuted }} />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: colors.textMuted }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          )}
        </button>

        {/* Images Export */}
        <button 
          onClick={() => handleExport("images")}
          disabled={isExporting !== null}
          className="flex items-center justify-between p-5 rounded-xl border-2 transition-all group disabled:opacity-50"
          style={{ borderColor: colors.border, backgroundColor: colors.cardBg }}
          onMouseEnter={(e) => {
            if (!isExporting) {
              e.currentTarget.style.borderColor = colors.hoverBorder;
              e.currentTarget.style.backgroundColor = colors.hoverBg;
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = colors.border;
            e.currentTarget.style.backgroundColor = colors.cardBg;
          }}
        >
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center transition"
              style={{ backgroundColor: colors.iconBg.images }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: colors.iconColor.images }}>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
                <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                <polyline points="21 15 16 10 5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-semibold" style={{ color: colors.text }}>Images (ZIP)</p>
              <p className="text-sm" style={{ color: colors.textMuted }}>Individual slide images</p>
            </div>
          </div>
          {isExporting === "images" ? (
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" style={{ color: colors.textMuted }} />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: colors.textMuted }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
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
    toast.success("Embed code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2" style={{ color: colors.heading }}>Embed Presentation</h3>
        <p className="text-xs sm:text-sm" style={{ color: colors.textMuted }}>Add this presentation to your website or blog</p>
      </div>

      {/* Size Options */}
      <div className="space-y-2 sm:space-y-3">
        <label className="text-xs sm:text-sm font-semibold" style={{ color: colors.text }}>Embed Size</label>
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
            Responsive
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
            Fixed Size
          </button>
        </div>

        {embedSize === "fixed" && (
          <div className="flex gap-2 sm:gap-3 mt-2 sm:mt-3">
            <div className="flex-1">
              <label className="text-xs mb-1 block" style={{ color: colors.textMuted }}>Width (px)</label>
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
              <label className="text-xs mb-1 block" style={{ color: colors.textMuted }}>Height (px)</label>
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
        <p className="text-xs font-semibold mb-2 sm:mb-3 uppercase tracking-wide" style={{ color: colors.textMuted }}>Preview</p>
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
        <label className="text-xs sm:text-sm font-semibold" style={{ color: colors.text }}>Embed Code</label>
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
            <span className="hidden sm:inline">{copied ? "Copied!" : "Copy"}</span>
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
          💡 Paste this code into your website&apos;s HTML to embed the presentation
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
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* View Analytics Section */}
      <div 
        className="flex items-center justify-between py-4"
        style={{ borderBottom: `1px solid ${colors.border}` }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: colors.iconBg }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: colors.iconColor }}>
              <path d="M18 20V10" />
              <path d="M12 20V4" />
              <path d="M6 20v-6" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: colors.text }}>View analytics</p>
            <p className="text-xs" style={{ color: colors.textMuted }}>Anyone can view, but not comment or edit.</p>
          </div>
        </div>
        <button
          onClick={copyToClipboard}
          disabled={!isPublic || !shareUrl}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all border"
          style={{
            backgroundColor: copied ? colors.successBg : (isPublic && shareUrl ? colors.cardBg : colors.lockBg),
            color: copied ? colors.successText : (isPublic && shareUrl ? colors.text : colors.textMuted),
            borderColor: copied ? colors.successBorder : colors.border,
            cursor: !isPublic || !shareUrl ? "not-allowed" : "pointer",
            opacity: !isPublic || !shareUrl ? 0.6 : 1,
          }}
        >
          <Link2 size={16} />
          {copied ? "Copied!" : "Copy link"}
        </button>
      </div>

      {/* Share Link Section */}
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
              <p className="text-sm font-semibold" style={{ color: colors.successText }}>Public link active</p>
              <p className="text-xs mt-0.5" style={{ color: colors.successTextMuted }}>Anyone with the link can view this presentation</p>
            </div>
            <button
              onClick={handleTogglePublic}
              disabled={loading}
              className="text-sm font-medium px-3 py-1.5 rounded-lg transition"
              style={{ color: colors.successText }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.successIconBg}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Disable
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.textMuted }}>Share Link</label>
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
              <button
                onClick={copyToClipboard}
                className="p-3 rounded-lg transition-all"
                style={{
                  backgroundColor: copied ? "#22c55e" : colors.copyBtnBg,
                  color: copied ? "#ffffff" : colors.textMuted,
                }}
              >
                {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
              </button>
            </div>
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
          <p className="font-semibold mb-2" style={{ color: colors.text }}>Link sharing is off</p>
          <p className="text-sm mb-4" style={{ color: colors.textMuted }}>
            Enable link sharing to let anyone with the link view this presentation
          </p>
          <button
            onClick={handleTogglePublic}
            disabled={loading}
            className="px-6 py-2.5 rounded-lg text-white text-sm font-semibold transition disabled:opacity-50"
            style={{ backgroundColor: colors.btnBg }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.btnHoverBg}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.btnBg}
          >
            {loading ? "Enabling..." : "Enable link sharing"}
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
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [workspaceAccess, setWorkspaceAccess] = useState<"no-access" | "can-view" | "can-edit">("no-access");

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

  const handleAddCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/presentations/${presentationId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), role: "viewer" }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to add collaborator");
        return;
      }

      setEmail("");
      toast.success("Collaborator added successfully!");
      fetchCollaborators();
    } catch {
      setError("Failed to add collaborator");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (collaboratorId: string, newRole: string) => {
    try {
      await fetch(`/api/presentations/${presentationId}/collaborators`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collaboratorId, role: newRole }),
      });
      toast.success("Role updated!");
      fetchCollaborators();
    } catch {
      toast.error("Failed to update role");
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
      {/* Add People Input */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddCollaborator(e);
            }
          }}
          placeholder="Add emails or people"
          className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50"
        />
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}

      {/* Workspace Members */}
      <div className="space-y-3">
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-600">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-slate-700">Workspace members</span>
          </div>
          <div className="relative">
            <select
              value={workspaceAccess}
              onChange={(e) => setWorkspaceAccess(e.target.value as typeof workspaceAccess)}
              className="appearance-none pl-3 pr-10 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-600 font-medium"
            >
              <option value="no-access">No access</option>
              <option value="can-view">Can view</option>
              <option value="can-edit">Can edit</option>
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Current User */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
              <span className="text-sm font-bold text-white">Y</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">You</p>
            </div>
          </div>
          <span className="text-sm text-slate-500 font-medium">Full Access</span>
        </div>
      </div>

      {/* Collaborators List */}
      {!fetching && collaborators.length > 0 && (
        <div className="space-y-2 max-h-64 overflow-y-auto border-t border-slate-200 pt-4">
          {collaborators.map((collab) => (
            <div key={collab.id} className="flex items-center justify-between py-3 hover:bg-slate-50 rounded-lg px-2 transition-colors">
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
                    <select
                      value={collab.role}
                      onChange={(e) => handleUpdateRole(collab.id, e.target.value)}
                      className="text-sm px-3 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-600"
                    >
                      <option value="viewer">Can view</option>
                      <option value="editor">Can edit</option>
                    </select>
                    <button
                      onClick={() => handleRemove(collab.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                ) : (
                  <span className="text-sm text-slate-500 font-medium">
                    {collab.role === "editor" ? "Can edit" : "Can view"}
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
