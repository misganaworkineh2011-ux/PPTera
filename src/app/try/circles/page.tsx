"use client";

import { useState } from "react";
import { CircleLayoutRenderer } from "~/components/layouts/CircleLayoutRenderer";
import type { CircleLayoutType, CircleContentItem } from "~/lib/layouts/content/circles";

const sampleItems: CircleContentItem[] = [
  {
    label: "Mind Mapping",
    text: "Visually connect broad topics to subtopics, fostering unexpected associations and leading to fresh ideas.",
    icon: "🧠",
  },
  {
    label: "Rapid Ideation",
    text: "Set a strict timer (e.g., 5-10 minutes) and generate as many ideas as possible without judgment or self-censorship.",
    icon: "⏱️",
  },
  {
    label: "Team Diversity",
    text: "Combine these techniques with a diverse team to unlock a wider range of perspectives and truly unique ideas.",
    icon: "👥",
  },
];

export default function CircleLayoutDemo() {
  const [layoutId, setLayoutId] = useState<CircleLayoutType>("circle-arc");
  const [accentColor, setAccentColor] = useState("#0d9488");

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 via-green-50 to-teal-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Circle Layout Demo</h1>

        {/* Controls */}
        <div className="flex gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <h2 className="text-sm font-semibold text-slate-800 mb-3">Layout Style</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setLayoutId("circle-arc")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  layoutId === "circle-arc"
                    ? "bg-teal-500 text-white shadow-md"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Arc Flow
              </button>
              <button
                onClick={() => setLayoutId("circle-ring")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  layoutId === "circle-ring"
                    ? "bg-teal-500 text-white shadow-md"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Ring Cycle
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <h2 className="text-sm font-semibold text-slate-800 mb-3">Accent Color</h2>
            <div className="flex gap-2">
              {["#0d9488", "#2563eb", "#7c3aed", "#dc2626", "#ea580c"].map((color) => (
                <button
                  key={color}
                  onClick={() => setAccentColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    accentColor === color ? "border-slate-800 scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-gradient-to-br from-lime-100/50 via-green-100/30 to-yellow-100/50 rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="aspect-video w-full">
            <CircleLayoutRenderer
              layoutId={layoutId}
              items={sampleItems}
              accentColor={accentColor}
            />
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-white rounded-xl border border-slate-200">
          <h3 className="font-semibold text-slate-800 mb-2">
            {layoutId === "circle-arc" ? "Arc Flow Layout" : "Ring Cycle Layout"}
          </h3>
          <p className="text-sm text-slate-600">
            {layoutId === "circle-arc"
              ? "Three curved segments forming an arc with content positioned around the edges (left, top, right). Best for wide slides."
              : "Three segments forming a complete ring with content on the left and right sides. Works well in both wide and narrow spaces."}
          </p>
        </div>
      </div>
    </div>
  );
}
