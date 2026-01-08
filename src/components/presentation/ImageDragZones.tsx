"use client";

import { useState } from "react";
import { ImageIcon } from "lucide-react";
import type { SlideLayoutType } from "~/lib/layouts/slide";

interface ImageDragZonesProps {
  isVisible: boolean;
  currentPosition: "left" | "right" | "top" | "bottom" | "none" | "full";
  onDropPosition: (position: SlideLayoutType) => void;
  theme: "dark" | "light";
}

export default function ImageDragZones({
  isVisible,
  currentPosition,
  onDropPosition,
  theme,
}: ImageDragZonesProps) {
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  if (!isVisible) return null;

  const isDark = theme === "dark";
  const baseZoneClass = `absolute transition-all duration-200 flex items-center justify-center border-2 border-dashed rounded-lg`;
  const activeClass = isDark 
    ? "bg-blue-500/30 border-blue-400" 
    : "bg-blue-500/20 border-blue-500";
  const inactiveClass = isDark 
    ? "bg-zinc-800/50 border-zinc-600" 
    : "bg-slate-100/50 border-slate-400";

  const handleDragOver = (e: React.DragEvent, zone: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setHoveredZone(zone);
  };

  const handleDragLeave = () => {
    setHoveredZone(null);
  };

  const handleDrop = (e: React.DragEvent, position: SlideLayoutType) => {
    e.preventDefault();
    setHoveredZone(null);
    onDropPosition(position);
  };

  const zones = [
    { id: "left", position: "image-left" as SlideLayoutType, style: { left: 0, top: "20%", width: "15%", height: "60%" } },
    { id: "right", position: "image-right" as SlideLayoutType, style: { right: 0, top: "20%", width: "15%", height: "60%" } },
    { id: "top", position: "image-top" as SlideLayoutType, style: { left: "20%", top: 0, width: "60%", height: "15%" } },
    { id: "bottom", position: "image-bottom" as SlideLayoutType, style: { left: "20%", bottom: 0, width: "60%", height: "15%" } },
  ];

  return (
    <div className="absolute inset-0 z-40 pointer-events-none">
      {zones.map((zone) => {
        const isCurrentPosition = currentPosition === zone.id;
        const isHovered = hoveredZone === zone.id;
        
        return (
          <div
            key={zone.id}
            className={`${baseZoneClass} ${isHovered ? activeClass : inactiveClass} ${isCurrentPosition ? "opacity-30" : "opacity-70"} pointer-events-auto`}
            style={zone.style}
            onDragOver={(e) => handleDragOver(e, zone.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, zone.position)}
          >
            <div className={`flex flex-col items-center gap-1 ${isHovered ? "scale-110" : ""} transition-transform`}>
              <ImageIcon size={20} className={isDark ? "text-zinc-400" : "text-slate-500"} />
              <span className={`text-xs font-medium ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
                {zone.id.charAt(0).toUpperCase() + zone.id.slice(1)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
