"use client";

import { useState } from "react";
import { motion, type Transition } from "framer-motion";
import { X, Sparkles, Play, Check } from "lucide-react";
import { 
  ANIMATION_PRESETS, 
  getAnimationCategories, 
  type AnimationPreset,
  type AnimationCategory 
} from "~/lib/animations";
import type { Theme } from "~/lib/themes";

interface AnimationPickerProps {
  isOpen: boolean;
  currentAnimation?: string;
  theme: Theme;
  onSelect: (animationId: string) => void;
  onClose: () => void;
}

// Animation preview component
function AnimationPreview({ 
  animation, 
  isSelected,
  isPlaying,
  onPlay,
  onSelect,
}: { 
  animation: AnimationPreset;
  isSelected: boolean;
  isPlaying: boolean;
  onPlay: () => void;
  onSelect: () => void;
}) {
  const [key, setKey] = useState(0);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setKey(k => k + 1);
    onPlay();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`relative group rounded-xl overflow-hidden transition-all cursor-pointer ${
        isSelected 
          ? "ring-2 ring-cyan-500 ring-offset-2 ring-offset-slate-900" 
          : "hover:ring-2 hover:ring-white/20"
      }`}
    >
      {/* Preview Card */}
      <div 
        className="aspect-video w-full relative"
        style={{ 
          background: animation.previewGradient || "linear-gradient(135deg, #1e293b 0%, #334155 100%)" 
        }}
      >
        {/* Animated preview content */}
        <motion.div
          key={key}
          className="absolute inset-4 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center"
          initial={isPlaying ? animation.enterAnimation.initial : { opacity: 1 }}
          animate={isPlaying ? animation.enterAnimation.animate : { opacity: 1 }}
          transition={animation.enterAnimation.transition as Transition}
        >
          <div className="text-center">
            <div className="w-8 h-1 bg-white/60 rounded mb-2 mx-auto" />
            <div className="w-12 h-1 bg-white/40 rounded mx-auto" />
          </div>
        </motion.div>

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
          <button
            onClick={handlePlay}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <Play size={18} className="text-white ml-0.5" fill="white" />
          </button>
        </div>

        {/* Selected indicator */}
        {isSelected && (
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center">
            <Check size={14} className="text-white" />
          </div>
        )}

        {/* Effects badge */}
        {animation.hasEffects && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-[10px] font-bold text-white">
            ✨ FX
          </div>
        )}
      </div>

      {/* Label */}
      <div className="p-2 bg-slate-800/80">
        <p className="text-xs font-medium text-white truncate">{animation.name}</p>
        <p className="text-[10px] text-slate-400 truncate">{animation.description}</p>
      </div>
    </div>
  );
}

export default function AnimationPicker({
  isOpen,
  currentAnimation = "fade",
  theme,
  onSelect,
  onClose,
}: AnimationPickerProps) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<AnimationCategory | "all">("all");
  
  const categories = getAnimationCategories();

  const filteredAnimations = selectedCategory === "all" 
    ? ANIMATION_PRESETS 
    : ANIMATION_PRESETS.filter(a => a.category === selectedCategory);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Slide Animation</h2>
              <p className="text-sm text-slate-400">Choose how this slide appears during presentation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="px-5 py-3 border-b border-white/10 overflow-x-auto">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                selectedCategory === "all"
                  ? "bg-cyan-500 text-white"
                  : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              All
            </button>
            {categories.filter(c => c.category !== "none").map((cat) => (
              <button
                key={cat.category}
                onClick={() => setSelectedCategory(cat.category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  selectedCategory === cat.category
                    ? "bg-cyan-500 text-white"
                    : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {cat.name}
                <span className="ml-1.5 text-xs opacity-60">({cat.animations.length})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Animation Grid */}
        <div className="p-5 overflow-y-auto" style={{ maxHeight: "calc(85vh - 180px)" }}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filteredAnimations.map((animation) => (
              <AnimationPreview
                key={animation.id}
                animation={animation}
                isSelected={currentAnimation === animation.id}
                isPlaying={playingId === animation.id}
                onPlay={() => {
                  setPlayingId(animation.id);
                  setTimeout(() => setPlayingId(null), animation.duration + 100);
                }}
                onSelect={() => onSelect(animation.id)}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-white/10 bg-slate-900/50">
          <p className="text-xs text-slate-500">
            Animations play when navigating between slides in present mode
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-cyan-500 text-white hover:bg-cyan-600 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
