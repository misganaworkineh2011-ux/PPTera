"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Loading() {
  const [showTimeout, setShowTimeout] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Show timeout message after 15 seconds
    const timer = setTimeout(() => {
      setShowTimeout(true);
    }, 15000);

    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        {/* Spinner Animation */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          {/* Outer Ring */}
          <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
          
          {/* Spinning Gradient Ring */}
          <div className="absolute inset-0 border-4 border-transparent border-t-[#1e3a8a] border-r-[#06b6d4] rounded-full animate-spin"></div>
          
          {/* Inner Pulsing Circle */}
          <div className="absolute inset-3 bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] rounded-full animate-pulse"></div>
        </div>

        {/* Loading Text */}
        <div className="space-y-2 mb-6">
          <h2 className="text-xl font-bold text-slate-900">Loading...</h2>
          <div className="flex gap-1 justify-center">
            <div className="h-2 w-2 bg-[#1e3a8a] rounded-full animate-bounce"></div>
            <div className="h-2 w-2 bg-[#06b6d4] rounded-full animate-bounce [animation-delay:100ms]"></div>
            <div className="h-2 w-2 bg-[#1e3a8a] rounded-full animate-bounce [animation-delay:200ms]"></div>
          </div>
        </div>

        {/* Timeout Message */}
        {showTimeout && (
          <div className="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-200 animate-fade-in">
            <p className="text-slate-600 mb-4">
              This is taking longer than expected. The page might be experiencing issues.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleRefresh}
                className="px-6 py-2 bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Refresh Page
              </button>
              <button
                onClick={handleGoHome}
                className="px-6 py-2 bg-white border-2 border-slate-200 text-slate-700 rounded-lg font-semibold hover:border-[#06b6d4] transition-all"
              >
                Go Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
