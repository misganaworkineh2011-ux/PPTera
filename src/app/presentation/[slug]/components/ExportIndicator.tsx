"use client";

interface ExportIndicatorProps {
  isExporting: boolean;
  exportingFormat: string | null;
}

export function ExportIndicator({ isExporting, exportingFormat }: ExportIndicatorProps) {
  if (!isExporting) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-[10001] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white animate-pulse">
      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      <span className="font-medium">Exporting {exportingFormat?.toUpperCase() || "file"}...</span>
    </div>
  );
}
