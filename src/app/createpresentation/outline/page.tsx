"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, Check, Edit2, Trash2, Plus, Sparkles } from "lucide-react";

interface Slide {
  type: "title" | "content";
  title: string;
  subtitle?: string;
  bulletPoints?: string[];
}

interface OutlineData {
  success: boolean;
  outline: Slide[];
  metadata: {
    topic: string;
    totalSlides: number;
    tone: string;
    language: string;
  };
  creditsRemaining: number;
}

export default function OutlinePage() {
  const router = useRouter();
  const [outlineData, setOutlineData] = useState<OutlineData | null>(null);
  const [editingSlide, setEditingSlide] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Get outline from sessionStorage
    const storedOutline = sessionStorage.getItem("generatedOutline");
    if (storedOutline) {
      try {
        const parsed = JSON.parse(storedOutline);
        setOutlineData(parsed);
      } catch (e) {
        console.error("Failed to parse outline:", e);
        router.push("/createpresentation?mode=ai");
      }
    } else {
      // No outline found, redirect back
      router.push("/createpresentation?mode=ai");
    }
  }, [router]);

  if (!mounted || !outlineData) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-[#ecfdf5] via-[#5eead4] to-[#ecfdf5]">
        <div className="text-[#1e3a8a] font-semibold">Loading outline...</div>
      </div>
    );
  }

  const handleUpdateSlide = (index: number, updatedSlide: Slide) => {
    const newOutline = [...outlineData.outline];
    newOutline[index] = updatedSlide;
    setOutlineData({ ...outlineData, outline: newOutline });
    setEditingSlide(null);
  };

  const handleDeleteSlide = (index: number) => {
    if (outlineData.outline.length <= 2) {
      alert("You need at least 2 slides.");
      return;
    }
    const newOutline = outlineData.outline.filter((_, i) => i !== index);
    setOutlineData({ ...outlineData, outline: newOutline });
  };

  const handleCreatePresentation = () => {
    // Store the final outline and redirect to presentation creation
    sessionStorage.setItem("finalOutline", JSON.stringify(outlineData));
    // For now, just log - later we can redirect to actual presentation editor
    console.log("Creating presentation with outline:", outlineData);
    alert("Presentation creation coming soon! The outline has been saved.");
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: `linear-gradient(to bottom, #ecfdf5 0%, #e6fcf5 15%, #d1fae5 30%, #b2f5ea 45%, #81e6d9 55%, #5eead4 60%, #b2f5ea 75%, #d1fae5 85%, #ecfdf5 100%)`,
        }}
      />
      
      {/* Reflection Effect */}
      <div 
        className="absolute top-0 right-0 w-full h-full z-0"
        style={{
          background: `
            linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.4) 15%, transparent 40%),
            linear-gradient(120deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.3) 20%, transparent 50%)
          `,
        }}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="px-8 pt-8 pb-6">
          <button 
            onClick={() => router.back()}
            className="mb-8 flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-sm px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-white hover:text-[#1e3a8a]"
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        {/* Title */}
        <div className="flex flex-col items-center justify-center mb-8 px-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] text-white shadow-md">
              <Sparkles size={24} />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-[#1e3a8a]">
              Your Outline
            </h1>
          </div>
          <p className="text-slate-600 text-center max-w-xl">
            Review and edit your presentation outline. Click on any slide to make changes.
          </p>
          <div className="mt-4 flex items-center gap-4 text-sm text-slate-500">
            <span className="px-3 py-1 rounded-full bg-white/80 border border-slate-200">
              {outlineData.outline.length} slides
            </span>
            <span className="px-3 py-1 rounded-full bg-white/80 border border-slate-200">
              {outlineData.metadata.tone}
            </span>
            <span className="px-3 py-1 rounded-full bg-white/80 border border-slate-200">
              {outlineData.metadata.language}
            </span>
          </div>
        </div>

        {/* Slides Grid */}
        <div className="flex-1 px-8 pb-12">
          <div className="mx-auto max-w-4xl space-y-4">
            {outlineData.outline.map((slide, index) => (
              <div
                key={index}
                className={`rounded-xl border bg-white shadow-sm transition-all ${
                  editingSlide === index 
                    ? "border-[#06b6d4] ring-2 ring-[#06b6d4]/20" 
                    : "border-slate-200 hover:border-[#06b6d4]/50 hover:shadow-md"
                }`}
              >
                {/* Slide Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
                      slide.type === "title" 
                        ? "bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] text-white" 
                        : "bg-slate-200 text-slate-600"
                    }`}>
                      {index + 1}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {slide.type === "title" ? "Title Slide" : "Content Slide"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingSlide(editingSlide === index ? null : index)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-[#06b6d4] hover:bg-[#06b6d4]/10 transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    {index > 0 && (
                      <button
                        onClick={() => handleDeleteSlide(index)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Slide Content */}
                <div className="p-5">
                  {editingSlide === index ? (
                    <SlideEditor 
                      slide={slide} 
                      onSave={(updated) => handleUpdateSlide(index, updated)} 
                      onCancel={() => setEditingSlide(null)}
                    />
                  ) : (
                    <>
                      <h3 className="text-lg font-bold text-[#1e3a8a] mb-2">
                        {slide.title}
                      </h3>
                      {slide.subtitle && (
                        <p className="text-slate-500 text-sm mb-3">{slide.subtitle}</p>
                      )}
                      {slide.bulletPoints && slide.bulletPoints.length > 0 && (
                        <ul className="space-y-2">
                          {slide.bulletPoints.map((point, pointIndex) => (
                            <li key={pointIndex} className="flex items-start gap-2 text-slate-600 text-sm">
                              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#06b6d4] flex-shrink-0" />
                              {point}
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mx-auto max-w-4xl mt-8 flex items-center justify-center gap-4">
            <button
              onClick={() => router.push("/createpresentation?mode=ai")}
              className="px-6 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold transition-all hover:bg-slate-50 hover:shadow-md"
            >
              Start Over
            </button>
            <button
              onClick={handleCreatePresentation}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white font-semibold shadow-lg transition-all hover:opacity-90 hover:shadow-xl hover:scale-[1.02] flex items-center gap-2"
            >
              <Check size={18} />
              Create Presentation
            </button>
          </div>

          {/* Credits Info */}
          <div className="mx-auto max-w-4xl mt-6 text-center">
            <p className="text-xs text-slate-500">
              Credits remaining: <span className="font-semibold text-[#06b6d4]">{outlineData.creditsRemaining}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Slide Editor Component
function SlideEditor({ 
  slide, 
  onSave, 
  onCancel 
}: { 
  slide: Slide; 
  onSave: (slide: Slide) => void; 
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(slide.title);
  const [subtitle, setSubtitle] = useState(slide.subtitle || "");
  const [bulletPoints, setBulletPoints] = useState(slide.bulletPoints || []);

  const handleAddBullet = () => {
    setBulletPoints([...bulletPoints, ""]);
  };

  const handleUpdateBullet = (index: number, value: string) => {
    const updated = [...bulletPoints];
    updated[index] = value;
    setBulletPoints(updated);
  };

  const handleRemoveBullet = (index: number) => {
    setBulletPoints(bulletPoints.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const updatedSlide: Slide = {
      ...slide,
      title,
      subtitle: slide.type === "title" ? subtitle : undefined,
      bulletPoints: slide.type === "content" ? bulletPoints.filter(b => b.trim()) : undefined,
    };
    onSave(updatedSlide);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20 focus:border-[#06b6d4]"
        />
      </div>

      {slide.type === "title" && (
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Subtitle</label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20 focus:border-[#06b6d4]"
          />
        </div>
      )}

      {slide.type === "content" && (
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Bullet Points</label>
          <div className="space-y-2">
            {bulletPoints.map((point, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={point}
                  onChange={(e) => handleUpdateBullet(index, e.target.value)}
                  placeholder={`Point ${index + 1}`}
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20 focus:border-[#06b6d4]"
                />
                <button
                  onClick={() => handleRemoveBullet(index)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {bulletPoints.length < 5 && (
              <button
                onClick={handleAddBullet}
                className="flex items-center gap-1 text-xs text-[#06b6d4] hover:text-[#1e3a8a] font-medium"
              >
                <Plus size={14} /> Add bullet point
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-1.5 text-sm bg-[#06b6d4] text-white rounded-lg hover:bg-[#0891b2] transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  );
}

