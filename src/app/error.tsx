"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to console for debugging
    console.error("Application error:", error);
  }, [error]);

  const handleGoHome = () => {
    router.push("/");
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center">
        {/* Error Icon */}
        <div className="mb-8">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 bg-red-100 rounded-full"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          Oops! Something went wrong
        </h1>
        <p className="text-lg text-slate-600 mb-8">
          We encountered an unexpected error. Don't worry, your data is safe.
        </p>

        {/* Error Details (only in development) */}
        {process.env.NODE_ENV === "development" && (
          <div className="mb-8 p-4 bg-slate-50 rounded-lg border border-slate-200 text-left">
            <p className="text-sm font-mono text-red-600 break-all">
              {error.message}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="px-8 py-3 bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white rounded-lg font-semibold hover:shadow-xl transition-all"
          >
            Try Again
          </button>
          <button
            onClick={handleRefresh}
            className="px-8 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-lg font-semibold hover:border-[#06b6d4] transition-all"
          >
            Refresh Page
          </button>
          <button
            onClick={handleGoHome}
            className="px-8 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-lg font-semibold hover:border-[#06b6d4] transition-all"
          >
            Go Home
          </button>
        </div>

        {/* Help Text */}
        <p className="mt-8 text-sm text-slate-500">
          If this problem persists, please try clearing your browser cache or contact support.
        </p>
      </div>
    </div>
  );
}
