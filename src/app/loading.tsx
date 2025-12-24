"use client";

export default function Loading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        {/* Simple Spinner */}
        <div className="relative w-12 h-12 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-[#1e3a8a] border-r-[#06b6d4] rounded-full animate-spin"></div>
        </div>
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    </div>
  );
}
