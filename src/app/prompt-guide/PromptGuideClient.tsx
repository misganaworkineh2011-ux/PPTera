"use client";

import { LoadingLink } from "~/components/LoadingLink";

import { Zap } from "lucide-react";

export function CTAButton() {
  return (
    <LoadingLink href="/sign-in" 
        className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 md:px-8 md:py-4 text-sm md:text-lg font-bold text-[#1e3a8a] shadow-xl hover:shadow-2xl transition-all hover:scale-105"
      >
        Start Creating
        <Zap className="h-4 w-4 md:h-5 md:w-5" />
      </LoadingLink>
  );
}
