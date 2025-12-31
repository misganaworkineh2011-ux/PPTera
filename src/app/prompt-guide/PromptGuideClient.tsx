"use client";

import { SignInButton } from "@clerk/nextjs";
import { Zap } from "lucide-react";

export function CTAButton() {
  return (
    <SignInButton mode="modal">
      <button 
        className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 md:px-8 md:py-4 text-sm md:text-lg font-bold text-[#1e3a8a] shadow-xl hover:shadow-2xl transition-all hover:scale-105" 
        style={{ cursor: "url('/pointinghand.svg') 12 8, pointer" }}
      >
        Start Creating
        <Zap className="h-4 w-4 md:h-5 md:w-5" />
      </button>
    </SignInButton>
  );
}
