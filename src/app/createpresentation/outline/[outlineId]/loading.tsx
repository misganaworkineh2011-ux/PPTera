"use client";

export default function OutlineLoading() {
  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Background matching CreatePresentationClient */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `linear-gradient(to bottom, 
            #f7fefc 0%,
            #f0fdfa 10%,
            #e6fcf5 20%,
            #d1fae5 30%,
            #b2f5ea 40%,
            #99f6e4 50%,
            #7ee7d4 60%,
            #6ee7d4 70%,
            #5eead4 80%,
            #4dd0c4 90%,
            #38b9a8 100%
          )`
        }}
      />
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.7) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.5) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.3) 0%, transparent 70%),
            radial-gradient(circle at 50% 100%, rgba(255, 255, 255, 0.6) 0%, transparent 50%)
          `
        }}
      />

      {/* Loading content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-4">
            <div className="absolute inset-0 border-3 border-slate-200 rounded-full"></div>
            <div className="absolute inset-0 border-3 border-transparent border-t-[#1e3a8a] border-r-[#06b6d4] rounded-full animate-spin"></div>
          </div>
          <p className="text-sm text-slate-600">Loading outline...</p>
        </div>
      </div>
    </div>
  );
}
