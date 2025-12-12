"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, ArrowRight } from "lucide-react";

interface Props {
  userId: string;
  credits: number;
}

export default function PresentationGenerator({ userId, credits }: Props) {
  const [topic, setTopic] = useState("");
  const [slides, setSlides] = useState(5);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    if (credits < 1) {
      toast.error("Insufficient credits. Please upgrade your plan.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, slides }),
      });

      if (!response.ok) {
        throw new Error("Generation failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${topic.replace(/\s+/g, "-")}.pptx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Presentation generated successfully!");
      setTopic("");
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      toast.error("Failed to generate presentation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50/50 p-8">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <Sparkles className="text-[#06b6d4]" />
          Create New Presentation
        </h2>
        <p className="mt-2 text-slate-500">
          Describe your topic and let AI generate a professional deck for you
        </p>
      </div>

      <div className="p-8">
        <div className="space-y-8">
          <div>
            <label className="mb-3 block text-sm font-bold text-slate-900">
              What's your presentation about?
            </label>
            <div className="relative">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Q3 Financial Report, Marketing Strategy for 2025..."
                className="w-full rounded-2xl border-2 border-slate-200 bg-white px-6 py-4 text-lg text-slate-900 placeholder-slate-400 transition-all focus:border-[#06b6d4] focus:outline-none focus:ring-4 focus:ring-cyan-500/10"
              />
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <label className="text-sm font-bold text-slate-900">
                Number of Slides
              </label>
              <span className="rounded-full bg-slate-100 px-4 py-1.5 text-sm font-bold text-slate-900">
                {slides} slides
              </span>
            </div>
            <input
              type="range"
              min="3"
              max="15"
              value={slides}
              onChange={(e) => setSlides(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-[#06b6d4]"
            />
            <div className="mt-2 flex justify-between text-xs font-medium text-slate-400">
              <span>3</span>
              <span>15</span>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || credits < 1}
            className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] px-8 py-5 font-bold text-white shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.01] hover:shadow-xl hover:shadow-cyan-500/30 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="h-5 w-5 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Generating your presentation...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2 text-lg">
                Generate Presentation
                <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </span>
            )}
          </button>

          {credits < 1 && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-center">
              <p className="text-sm font-medium text-rose-900">
                You're out of credits. Upgrade your plan to continue creating.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
