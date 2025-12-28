"use client";

import React from "react";
import { ImageIcon } from "lucide-react";
import type { ImageLayoutType, ImageContentItem } from "~/lib/layouts/content/images";
import { calculateImageGridDimensions } from "~/lib/layouts/content/images";

interface ImageLayoutRendererProps {
  layoutId: ImageLayoutType;
  items: ImageContentItem[];
  accentColor?: string;
  className?: string;
  isNarrowSpace?: boolean;
}

export function ImageLayoutRenderer({
  layoutId,
  items,
  accentColor = "#047857",
  className = "",
  isNarrowSpace = false,
}: ImageLayoutRendererProps) {
  const displayItems = items.slice(0, 6);
  const { columns } = calculateImageGridDimensions(displayItems.length, isNarrowSpace);

  // Style 1: Small rounded square left, text right (horizontal layout per item)
  if (layoutId === "image-style-1") {
    return (
      <div
        className={`grid gap-6 ${className}`}
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
        }}
      >
        {displayItems.map((item, idx) => (
          <div key={idx} className="flex items-start gap-4">
            {/* Small rounded square image */}
            <div
              className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden"
              style={{
                backgroundColor: item.image ? undefined : `${accentColor}15`,
                border: item.image ? "none" : `1px dashed ${accentColor}40`,
              }}
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.label || ""}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon size={24} style={{ color: `${accentColor}50` }} />
                </div>
              )}
            </div>
            {/* Text content */}
            <div className="flex-1 min-w-0">
              {item.label && (
                <h3 className="text-base font-semibold text-slate-800 mb-1">
                  {item.label}
                </h3>
              )}
              <p className="text-sm text-slate-600 leading-relaxed">
                {item.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Style 2: Larger rounded square top, text below
  if (layoutId === "image-style-2") {
    return (
      <div
        className={`grid gap-6 ${className}`}
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
        }}
      >
        {displayItems.map((item, idx) => (
          <div key={idx} className="flex flex-col">
            {/* Larger rounded square image */}
            <div
              className="w-full aspect-square rounded-2xl overflow-hidden mb-4"
              style={{
                backgroundColor: item.image ? undefined : `${accentColor}15`,
                border: item.image ? "none" : `1px dashed ${accentColor}40`,
                maxWidth: "180px",
              }}
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.label || ""}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon size={40} style={{ color: `${accentColor}50` }} />
                </div>
              )}
            </div>
            {/* Text content */}
            <div>
              {item.label && (
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  {item.label}
                </h3>
              )}
              <p className="text-sm text-slate-600 leading-relaxed">
                {item.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Style 3: Large circle top, text below centered
  if (layoutId === "image-style-3") {
    return (
      <div
        className={`grid gap-8 ${className}`}
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
        }}
      >
        {displayItems.map((item, idx) => (
          <div key={idx} className="flex flex-col items-center text-center">
            {/* Large circular image */}
            <div
              className="w-40 h-40 rounded-full overflow-hidden mb-4 flex-shrink-0"
              style={{
                backgroundColor: item.image ? undefined : `${accentColor}15`,
                border: item.image ? "none" : `1px dashed ${accentColor}40`,
              }}
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.label || ""}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon size={48} style={{ color: `${accentColor}50` }} />
                </div>
              )}
            </div>
            {/* Text content centered */}
            <div>
              {item.label && (
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  {item.label}
                </h3>
              )}
              <p className="text-sm text-slate-600 leading-relaxed max-w-[250px]">
                {item.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Style 4: Large rounded rectangle top, text below centered
  return (
    <div
      className={`grid gap-6 ${className}`}
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
      }}
    >
      {displayItems.map((item, idx) => (
        <div key={idx} className="flex flex-col items-center text-center">
          {/* Large rounded rectangle image */}
          <div
            className="w-full rounded-2xl overflow-hidden mb-4"
            style={{
              aspectRatio: "4/3",
              maxWidth: "280px",
              backgroundColor: item.image ? undefined : `${accentColor}15`,
              border: item.image ? "none" : `1px dashed ${accentColor}40`,
            }}
          >
            {item.image ? (
              <img
                src={item.image}
                alt={item.label || ""}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon size={48} style={{ color: `${accentColor}50` }} />
              </div>
            )}
          </div>
          {/* Text content centered */}
          <div>
            {item.label && (
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                {item.label}
              </h3>
            )}
            <p className="text-sm text-slate-600 leading-relaxed max-w-[280px]">
              {item.text}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ImageLayoutRenderer;
