"use client";

import Link from "next/link";
import { Home, ArrowLeft, Search } from "lucide-react";
import { useLanguage } from "~/contexts/LanguageContext";

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Animation */}
        <div className="relative mb-8">
          <h1 className="text-[150px] md:text-[200px] font-black text-slate-200 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-32 w-32 rounded-full bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] flex items-center justify-center animate-bounce">
              <Search className="h-16 w-16 text-white" />
            </div>
          </div>
        </div>

        {/* Message */}
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          {t.pageNotFound || "Page Not Found"}
        </h2>
        <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
          {t.pageNotFoundDesc || "The page you're looking for doesn't exist or has been moved."}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <Home className="h-5 w-5" />
            {t.backToHome || "Back to Home"}
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-6 py-3 bg-white text-slate-700 font-bold rounded-full border-2 border-slate-200 hover:border-slate-300 transition-all hover:scale-105"
          >
            <ArrowLeft className="h-5 w-5" />
            {t.goBack || "Go Back"}
          </button>
        </div>

        {/* Decorative Elements */}
        <div className="mt-16 grid grid-cols-3 gap-4 max-w-md mx-auto opacity-50">
          <div className="h-2 bg-slate-200 rounded-full animate-pulse"></div>
          <div className="h-2 bg-slate-200 rounded-full animate-pulse [animation-delay:200ms]"></div>
          <div className="h-2 bg-slate-200 rounded-full animate-pulse [animation-delay:400ms]"></div>
        </div>
      </div>
    </div>
  );
}
