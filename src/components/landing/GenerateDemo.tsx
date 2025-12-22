"use client";

import { useState, useEffect } from "react";
import { Sparkles, CheckCircle2, Waves, Fish, Anchor } from "lucide-react";
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
      {/* Ambient glow */}
      <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-20 blur-3xl" style={{ background: theme.primary }}></div>
      <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full opacity-15 blur-3xl" style={{ background: theme.secondary }}></div>

      {/* Window Chrome */}
      <div className="absolute top-0 left-0 right-0 h-8 border-b flex items-center px-3 gap-1.5 z-10" style={{ background: theme.bgAlt, borderColor: `${theme.primary}20` }}>
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
            <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg" style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`, boxShadow: `0 0 20px ${theme.primary}40` }}>
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
            <div className="absolute inset-0 flex items-center justify-center z-10" style={{ background: `${theme.bg}ee` }}>
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
                    <Waves className="w-6 h-6 animate-pulse" style={{ color: theme.primary }} />
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
              {/* Decorative wave pattern */}
              <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-full h-1" style={{ background: `linear-gradient(90deg, transparent, ${theme.primary}, ${theme.secondary}, transparent)` }}></div>
                <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-30" style={{ background: `radial-gradient(circle, ${theme.primary}, transparent)` }}></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full opacity-20" style={{ background: `radial-gradient(circle, ${theme.secondary}, transparent)` }}></div>
                {/* Wave lines */}
                <svg className="absolute bottom-0 left-0 w-full h-16 opacity-20" viewBox="0 0 400 50" preserveAspectRatio="none">
                  <path d="M0,25 Q100,0 200,25 T400,25" fill="none" stroke={theme.primary} strokeWidth="2" />
                  <path d="M0,35 Q100,10 200,35 T400,35" fill="none" stroke={theme.secondary} strokeWidth="1.5" />
                </svg>
              </div>

              <div className="relative h-full flex flex-col items-center justify-center p-4 text-center">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${theme.primary}20` }}>
                    <Waves className="w-4 h-4" style={{ color: theme.primary }} />
                  </div>
                </div>
                <h3 className="text-lg md:text-2xl font-bold mb-1" style={{ color: theme.heading }}>Ocean Conservation</h3>
                <p className="text-xs mb-4" style={{ color: theme.textMuted }}>Protecting Our Blue Planet</p>
                
                {/* Stats preview */}
                <div className="flex gap-3 mb-4">
                  {[
                    { icon: Fish, value: "71%", label: "Ocean Coverage" },
                    { icon: Anchor, value: "3M+", label: "Species" },
                  ].map((stat, i) => (
                    <div key={i} className="px-3 py-2 rounded-lg border" style={{ background: `${theme.surface}80`, borderColor: `${theme.primary}20` }}>
                      <stat.icon className="w-3 h-3 mx-auto mb-1" style={{ color: i === 0 ? theme.primary : theme.secondary }} />
                      <p className="text-sm font-bold" style={{ color: theme.heading }}>{stat.value}</p>
                      <p className="text-[8px]" style={{ color: theme.textMuted }}>{stat.label}</p>
                    </div>
                  ))}
                </div>
                
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="w-6 h-4 rounded-sm border transition-all" style={{ 
                        background: i === 0 ? `${theme.primary}30` : "transparent", 
                        borderColor: i === 0 ? theme.primary : `${theme.primary}40`,
                        boxShadow: i === 0 ? `0 0 10px ${theme.primary}30` : "none"
                      }}></div>
                    ))}
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-medium" style={{ color: theme.primary }}>
                    <CheckCircle2 className="w-3 h-3" />
                    4 slides ready
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Theme indicator */}
      <div className="absolute bottom-2 left-3 text-[9px] z-10" style={{ color: theme.textMuted }}>
        Theme: <span style={{ color: theme.primary }}>Ocean Depths</span>
      </div>
    </div>
  );
}
