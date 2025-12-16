"use client";

import { X } from "lucide-react";

interface ExportModalProps {
  isExporting: boolean;
  onExport: (format: "pdf" | "pptx" | "images") => void;
  onClose: () => void;
}

export default function ExportModal({ isExporting, onExport, onClose }: ExportModalProps) {
  const options = [
    { format: "pdf" as const, icon: "📄", title: "PDF Document", desc: "Best for sharing and printing", bg: "bg-red-100" },
    { format: "pptx" as const, icon: "📊", title: "PowerPoint (PPTX)", desc: "Editable in PowerPoint", bg: "bg-orange-100" },
    { format: "images" as const, icon: "🖼️", title: "Images (ZIP)", desc: "Each slide as PNG image", bg: "bg-blue-100" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <X size={20} />
        </button>
        <h2 className="mb-4 text-2xl font-bold text-slate-900">Export Presentation</h2>
        <p className="mb-6 text-sm text-slate-600">Choose your preferred export format</p>
        <div className="space-y-3">
          {options.map((opt) => (
            <button
              key={opt.format}
              onClick={() => onExport(opt.format)}
              disabled={isExporting}
              className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-slate-200 hover:border-[#06b6d4] hover:bg-[#06b6d4]/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${opt.bg} flex items-center justify-center`}>
                  <span className="text-xl">{opt.icon}</span>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-slate-900">{opt.title}</div>
                  <div className="text-xs text-slate-500">{opt.desc}</div>
                </div>
              </div>
              {isExporting && (
                <div className="animate-spin h-5 w-5 border-2 border-[#06b6d4] border-t-transparent rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
