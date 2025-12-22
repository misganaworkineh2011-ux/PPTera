"use client";

import { useState, useEffect } from "react";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { cn } from "~/lib/utils";

// Ocean Depths theme
const theme = {
  bg: "#0a1628",
  bgAlt: "#0d1f35",
  surface: "#122a45",
  primary: "#14b8a6",
  secondary: "#06b6d4",
  accent: "#a78bfa",
  text: "#e0f2fe",
  textMuted: "#7dd3fc",
  heading: "#ffffff",
};

export function GenerateDemo() {
  const [phase, setPhase] = useState(0);
  const [typing, setTyping] = useState("");
  const fullPrompt = "Create a presentation about ocean conservation";

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
      }, 50);
      return () => clearInterval(timer);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 1) {
      const timer = setTimeout(() => setPhase(2), 2500);
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
    <div className="relative aspect-[4/3] rounded-2xl shadow-2xl overflow-hidden border" style={{ background: theme.bg, borderColor: `${theme.primary}30` }}>
      {/* Window Chrome */}
      <div className="absolute top-0 left-0 right-0 h-8 border-b flex items-center px-3 gap-1.5" style={{ background: theme.bgAlt, borderColor: `${theme.primary}20` }}>
        <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
        <div className="mx-auto flex items-center gap-1.5 text-[9px]" style={{ color: theme.textMuted }}>
          <Sparkles className="w-3 h-3" style={{ color: theme.primary }} />
          PPTMaster
        </div>
      </div>

      <div className="absolute inset-0 top-8 p-4 flex flex-col">
        {/* Input Area */}
        <div className="rounded-xl p-3 mb-3 border" style={{ background: theme.surface, borderColor: `${theme.primary}30` }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}>
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs" style={{ color: theme.text }}>
                {typing}
                {phase === 0 && <span className="animate-pulse" style={{ color: theme.primary }}>|</span>}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 relative">
          {/* Generating State */}
          {phase === 1 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-3">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle cx="40" cy="40" r="34" stroke={`${theme.primary}30`} strokeWidth="6" fill="none" />
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      stroke={`url(#oceanGradient)`}
                      strokeWidth="6"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray="213.6"
                      className="animate-[dash_2s_ease-in-out_infinite]"
                    />
                    <defs>
                      <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={theme.primary} />
                        <stop offset="100%" stopColor={theme.secondary} />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 animate-pulse" style={{ color: theme.primary }} />
                  </div>
                </div>
                <p className="text-xs font-medium" style={{ color: theme.text }}>Generating slides...</p>
                <p className="text-[10px] mt-1" style={{ color: theme.primary }}>Ocean Depths theme</p>
              </div>
            </div>
          )}

          {/* Generated Slide Preview */}
          {phase === 2 && (
            <div className="absolute inset-0 rounded-xl overflow-hidden border animate-fade-in" style={{ background: theme.bg, borderColor: `${theme.primary}30` }}>
              {/* Decorative elements */}
              <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-full h-1" style={{ background: `linear-gradient(90deg, transparent, ${theme.primary}, transparent)` }}></div>
                <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20" style={{ background: `radial-gradient(circle, ${theme.primary}, transparent)` }}></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full opacity-15" style={{ background: `radial-gradient(circle, ${theme.secondary}, transparent)` }}></div>
              </div>

              <div className="relative h-full flex flex-col items-center justify-center p-4 text-center">
                <div className="w-10 h-0.5 rounded-full mb-3" style={{ background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})` }}></div>
                <h3 className="text-lg md:text-xl font-bold mb-1" style={{ color: theme.heading }}>Ocean Conservation</h3>
                <p className="text-xs" style={{ color: theme.textMuted }}>Protecting Our Blue Planet</p>
                
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="w-6 h-4 rounded-sm border" style={{ background: i === 0 ? theme.surface : "transparent", borderColor: `${theme.primary}40` }}></div>
                    ))}
                  </div>
                  <span className="flex items-center gap-1 text-[10px]" style={{ color: theme.primary }}>
                    <CheckCircle2 className="w-3 h-3" />
                    4 slides ready
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
