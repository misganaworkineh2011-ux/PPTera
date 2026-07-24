"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console for debugging
    console.error("Global application error:", error);
  }, [error]);

  const handleRefresh = () => {
    window.location.href = "/";
  };

  return (
    <html>
      <body>
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
            <h1
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                color: "#0f172a",
                marginBottom: "1rem",
              }}
            >
              Critical Error
            </h1>
            <p
              style={{
                fontSize: "1.125rem",
                color: "#64748b",
                marginBottom: "2rem",
              }}
            >
              The application encountered a critical error. Please refresh the page.
            </p>

            {/* Error Details (only in development) */}
            {process.env.NODE_ENV === "development" && (
              <div
                style={{
                  marginBottom: "2rem",
                  padding: "1rem",
                  backgroundColor: "#f8fafc",
                  borderRadius: "0.5rem",
                  border: "1px solid #e2e8f0",
                  textAlign: "left",
                }}
              >
                <p
                  style={{
                    fontSize: "0.875rem",
                    fontFamily: "monospace",
                    color: "#dc2626",
                    wordBreak: "break-all",
                  }}
                >
                  {error.message}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <button
                onClick={reset}
                style={{
                  padding: "0.75rem 2rem",
                  background: "linear-gradient(to right, #0f766e, #14b8a6)",
                  color: "white",
                  borderRadius: "0.5rem",
                  fontWeight: "600",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Try Again
              </button>
              <button
                onClick={handleRefresh}
                style={{
                  padding: "0.75rem 2rem",
                  background: "white",
                  border: "2px solid #e2e8f0",
                  color: "#334155",
                  borderRadius: "0.5rem",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Go to Home
              </button>
            </div>

            {/* Help Text */}
            <p
              style={{
                marginTop: "2rem",
                fontSize: "0.875rem",
                color: "#94a3b8",
              }}
            >
              If this problem persists, please clear your browser cache or contact support.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
