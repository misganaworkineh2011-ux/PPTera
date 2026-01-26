"use client";

import { useState } from "react";
import { CheckCircle2, Copy } from "lucide-react";
import { toast } from "sonner";
import type { Theme } from "~/lib/themes";
import { useLanguage } from "~/contexts/LanguageContext";
import { dashboardTranslations } from "~/lib/dashboard-translations";

interface EmbedTabProps {
  presentationId: string;
  theme?: Theme;
}

export default function EmbedTab({ presentationId, theme }: EmbedTabProps) {
  const [copied, setCopied] = useState(false);
  const [embedSize, setEmbedSize] = useState<"responsive" | "fixed">("responsive");
  const [width, setWidth] = useState(960);
  const [height, setHeight] = useState(540);
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  const { language } = useLanguage();
  const t = dashboardTranslations[language] || dashboardTranslations.en;

  const embedCode = embedSize === "responsive"
    ? `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;max-width:100%;">
  <iframe src="${baseUrl}/embed/${presentationId}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen></iframe>
</div>`
    : `<iframe src="${baseUrl}/embed/${presentationId}" width="${width}" height="${height}" style="border:0;" allowfullscreen></iframe>`;

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
