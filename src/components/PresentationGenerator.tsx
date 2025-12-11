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
      toast.error("Insufficient credits");
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

      toast.success("Presentation generated!");
      setTopic("");
    } catch (error) {
      toast.error("Failed to generate presentation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border bg-white p-8 shadow-sm">
      <h2 className="mb-6 text-2xl font-bold">Generate Presentation</h2>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Topic</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Climate Change Solutions"
            className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Number of Slides: {slides}
          </label>
          <input
            type="range"
            min="3"
            max="15"
            value={slides}
            onChange={(e) => setSlides(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || credits < 1}
          className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Generating..." : "Generate Presentation"}
        </button>
      </div>
    </div>
  );
}
