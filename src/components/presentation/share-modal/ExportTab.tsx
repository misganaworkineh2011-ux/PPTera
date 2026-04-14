"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { Theme } from "~/lib/themes";
import { useLanguage } from "~/contexts/LanguageContext";
import { dashboardTranslations } from "~/lib/dashboard-translations";
import PricingModal from "~/components/dashboard/PricingModal";

type ExportFormat = "pdf" | "pptx" | "images";

interface ExportTabProps {
  presentationId: string;
  theme?: Theme;
  subscriptionPlan?: string | null;
  onExportStart?: (format: ExportFormat) => void;
}

export default function ExportTab({ presentationId, theme, subscriptionPlan, onExportStart }: ExportTabProps) {
  const [isExporting, setIsExporting] = useState<ExportFormat | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("pptx");
  const [showPricingModal, setShowPricingModal] = useState(false);
  const isDark = theme?.colors.background.startsWith("#") &&
    parseInt(theme.colors.background.slice(1, 3), 16) < 128;

  const primaryColor = theme?.colors.primary || "#06b6d4";

  const { language } = useLanguage();
  const t = dashboardTranslations[language] || dashboardTranslations.en;
  const userPlan = (subscriptionPlan || "free").toLowerCase();
  const hasPaidPlan = ["plus", "pro", "ultra"].includes(userPlan);

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

  const PowerPointIcon = ({ selected }: { selected: boolean }) => (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
      <rect x="8" y="4" width="32" height="40" rx="2" fill={selected ? "#D24726" : "#6B7280"} />
      <rect x="4" y="12" width="20" height="24" rx="1" fill={selected ? "#B7472A" : "#525252"} />
      <text x="14" y="28" fontSize="14" fontWeight="bold" fill="white" textAnchor="middle">P</text>
      <path d="M28 14h8M28 20h8M28 26h8M28 32h6" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
    </svg>
  );

  const PDFIcon = ({ selected }: { selected: boolean }) => (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
      <path d="M8 4h24l8 8v32a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z" fill={selected ? "#FF0000" : "#6B7280"} />
      <path d="M32 4v8h8" fill={selected ? "#CC0000" : "#525252"} />
      <path d="M32 4l8 8h-8V4z" fill={selected ? "#FF3333" : "#737373"} />
      <text x="24" y="32" fontSize="10" fontWeight="bold" fill="white" textAnchor="middle">PDF</text>
    </svg>
  );

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
    if (!hasPaidPlan) {
      setShowPricingModal(true);
      return;
    }

    setIsExporting(selectedFormat);
    onExportStart?.(selectedFormat);
    const toastId = toast.loading(`${t.preparingExport || "Exporting presentation..."} This might take a few minutes.`);

    try {
      const params = new URLSearchParams();
      params.set("format", selectedFormat);
      params.set("range", "all");

      const exportUrl = `/api/presentations/${presentationId}/export?${params.toString()}`;

      const response = await fetch(exportUrl);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 403) {
          setShowPricingModal(true);
        }
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

      toast.success(t.exportCompleteMsg || "Export complete!", { id: toastId });
    } catch (error) {
      console.error("Export failed:", error);
      toast.error(error instanceof Error ? error.message : "Export failed", { id: toastId });
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

      <div className="flex justify-end">
        <button
          onClick={hasPaidPlan ? handleExport : () => setShowPricingModal(true)}
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
              {hasPaidPlan ? (t.exportBtn || "Export") : (t.upgradeToExport || "Upgrade to Export")}
            </>
          )}
        </button>
      </div>

      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        currentPlan={subscriptionPlan}
      />
    </div>
  );
}
