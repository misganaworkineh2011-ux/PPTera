"use client";

import { useState } from "react";
import { toast } from "sonner";

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
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8">
        <h2 className="text-3xl font-bold text-white">
          Create New Presentation
        </h2>
        <p className="mt-2 text-blue-100">
          Describe your topic and let AI do the magic
        </p>
      </div>

      <div className="p-8">
        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-900">
              What's your presentation about?
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Climate Change Solutions, AI in Healthcare..."
              className="w-full rounded-xl border-2 border-slate-200 px-4 py-3.5 text-slate-900 placeholder-slate-400 transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-900">
                Number of Slides
              </label>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700">
                {slides} slides
              </span>
            </div>
            <input
              type="range"
              min="3"
              max="15"
              value={slides}
              onChange={(e) => setSlides(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200"
              style={{
                background: `linear-gradient(to right, rgb(37, 99, 235) 0%, rgb(37, 99, 235) ${((slides - 3) / 12) * 100}%, rgb(226, 232, 240) ${((slides - 3) / 12) * 100}%, rgb(226, 232, 240) 100%)`,
              }}
            />
            <div className="mt-2 flex justify-between text-xs text-slate-500">
              <span>3</span>
              <span>15</span>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || credits < 1}
            className="group relative w-full overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 font-bold text-white shadow-lg shadow-blue-600/30 transition hover:shadow-xl hover:shadow-blue-600/40 disabled:opacity-50 disabled:hover:shadow-lg"
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
              <span className="flex items-center justify-center gap-2">
                ✨ Generate Presentation
                <span className="transition group-hover:translate-x-1">→</span>
              </span>
            )}
          </button>

          {credits < 1 && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-center">
              <p className="text-sm font-medium text-amber-800">
                You're out of credits. Upgrade your plan to continue creating.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
