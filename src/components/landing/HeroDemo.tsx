"use client";

import { useState, useEffect } from "react";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { cn } from "~/lib/utils";

export function HeroDemo() {
  const [phase, setPhase] = useState(0);
  const [typing, setTyping] = useState("");
  const fullPrompt = "Create a quarterly business review presentation";

  useEffect(() => {
    if (phase === 0) {
      let i = 0;
      const timer = setInterval(() => {
        if (i <= fullPrompt.length) {
          setTyping(fullPrompt.slice(0, i));
          i++;
        } else {
          clearInterval(timer);
          setTimeout(() => setPhase(1), 600);
        }
      }, 40);
      return () => clearInterval(timer);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 1) {
      const timer = setTimeout(() => setPhase(2), 1500);
      return () => clearTimeout(timer);
    }
    if (phase === 2) {
      const timer = setTimeout(() => {
        setPhase(0);
        setTyping("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  return (
    <div className="relative">
      {/* Main Demo Container - Figma style with clean shadows */}
      <div className="relative rounded-2xl overflow-hidden bg-white border border-zinc-200 shadow-2xl shadow-zinc-200/50">
        {/* Browser Chrome */}
        <div className="flex items-center gap-2 px-4 py-3 bg-zinc-50 border-b border-zinc-200">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-zinc-300"></div>
            <div className="w-3 h-3 rounded-full bg-zinc-300"></div>
            <div className="w-3 h-3 rounded-full bg-zinc-300"></div>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="px-4 py-1 bg-white rounded-md text-xs text-zinc-500 border border-zinc-200">
              pptmaster.app
            </div>
          </div>
        </div>

        {/* App Content */}
        <div className="p-6 bg-zinc-50">
          {/* AI Input */}
          <div className="bg-white rounded-xl border border-zinc-200 p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-zinc-900">
                  {typing}
                  {phase === 0 && <span className="animate-pulse">|</span>}
                </p>
              </div>
              {phase === 1 && (
                <div className="w-5 h-5 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>
          </div>

          {/* Generated Slides Preview */}
          <div className={cn(
            "transition-all duration-500",
            phase >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            {/* Slide Thumbnails */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { title: "Q4 Business Review", subtitle: "Annual Performance" },
                { title: "Key Metrics", subtitle: "+23% Revenue Growth" },
                { title: "Market Analysis", subtitle: "Regional Expansion" },
              ].map((slide, i) => (
                <div 
                  key={i}
                  className="aspect-video bg-white rounded-lg border border-zinc-200 p-3 shadow-sm"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="h-1.5 w-3/4 bg-zinc-900 rounded mb-2"></div>
                  <div className="h-1 w-1/2 bg-zinc-300 rounded mb-3"></div>
                  <div className="space-y-1">
                    <div className="h-0.5 w-full bg-zinc-100 rounded"></div>
                    <div className="h-0.5 w-4/5 bg-zinc-100 rounded"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Status */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-200">
              <span className="text-xs text-zinc-500">6 slides generated</span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Ready to edit
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Profile Card - Figma style */}
      <div className="absolute -right-4 top-8 bg-white rounded-xl border border-zinc-200 shadow-xl p-4 w-48 hidden lg:block">
        <div className="text-xs text-zinc-400 mb-2">CoLab / Profile</div>
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 mb-2"></div>
          <p className="font-medium text-zinc-900">Julia Simmons</p>
          <p className="text-xs text-zinc-500">New York, NY, USA</p>
          <div className="flex gap-2 mt-3">
            <button className="px-3 py-1 bg-zinc-900 text-white text-xs rounded-md">Follow</button>
            <button className="px-3 py-1 border border-zinc-200 text-xs rounded-md">Message</button>
          </div>
        </div>
      </div>

      {/* Floating Activity Card */}
      <div className="absolute -left-4 bottom-8 bg-white rounded-xl border border-zinc-200 shadow-xl p-3 w-56 hidden lg:block">
        <div className="flex items-start gap-2">
          <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-900">Called get_code_for_selection</p>
            <p className="text-xs text-zinc-500 mt-0.5">Processing complete</p>
          </div>
        </div>
      </div>
    </div>
  );
}
