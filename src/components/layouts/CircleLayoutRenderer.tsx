"use client";

import React from "react";
import type { CircleLayoutType, CircleContentItem } from "~/lib/layouts/content/circles";
import {
  getArcSegmentPath,
  getRingSegmentPath,
  getArcIconPosition,
  getRingIconPosition,
} from "~/lib/layouts/content/circles";
import EditableText from "~/components/presentation/EditableText";

interface CircleLayoutRendererProps {
  layoutId: CircleLayoutType;
  items: CircleContentItem[];
  accentColor?: string;
  className?: string;
  // Editing props
  isEditing?: boolean;
  editingText?: { field: string; bulletIndex?: number } | null;
  onStartEditLabel?: (index: number) => void;
  onStartEditText?: (index: number) => void;
  onUpdateLabel?: (index: number, value: string) => void;
  onUpdateText?: (index: number, value: string) => void;
  onFinishEditing?: () => void;
  isOwner?: boolean;
  isHovered?: boolean;
}

export function CircleLayoutRenderer({
  layoutId,
  items,
  accentColor = "#0d9488",
  className = "",
  isEditing = false,
  editingText = null,
  onStartEditLabel,
  onStartEditText,
  onUpdateLabel,
  onUpdateText,
  onFinishEditing,
  isOwner = false,
  isHovered = false,
}: CircleLayoutRendererProps) {
  const displayItems = items.slice(0, 8);

  if (layoutId === "circle-arc") {
    return (
      <ArcLayout
        items={displayItems}
        accentColor={accentColor}
        className={className}
        isEditing={isEditing}
        editingText={editingText}
        onStartEditLabel={onStartEditLabel}
        onStartEditText={onStartEditText}
        onUpdateLabel={onUpdateLabel}
        onUpdateText={onUpdateText}
        onFinishEditing={onFinishEditing}
        isOwner={isOwner}
        isHovered={isHovered}
      />
    );
  }

  return (
    <RingLayout
      items={displayItems}
      accentColor={accentColor}
      className={className}
      isEditing={isEditing}
      editingText={editingText}
      onStartEditLabel={onStartEditLabel}
      onStartEditText={onStartEditText}
      onUpdateLabel={onUpdateLabel}
      onUpdateText={onUpdateText}
      onFinishEditing={onFinishEditing}
      isOwner={isOwner}
      isHovered={isHovered}
    />
  );
}

// Arc Layout - Text positioned above each arc segment following the curve
function ArcLayout({
  items,
  accentColor,
  className,
  isEditing = false,
  editingText = null,
  onStartEditLabel,
  onStartEditText,
  onUpdateLabel,
  onUpdateText,
  onFinishEditing,
  isOwner = false,
  isHovered = false,
}: {
  items: CircleContentItem[];
  accentColor: string;
  className: string;
  isEditing?: boolean;
  editingText?: { field: string; bulletIndex?: number } | null;
  onStartEditLabel?: (index: number) => void;
  onStartEditText?: (index: number) => void;
  onUpdateLabel?: (index: number, value: string) => void;
  onUpdateText?: (index: number, value: string) => void;
  onFinishEditing?: () => void;
  isOwner?: boolean;
  isHovered?: boolean;
}) {
  const itemCount = items.length;

  // Arc sizes - bigger arc
  const outerRadius = itemCount <= 3 ? 170 : itemCount <= 5 ? 150 : 130;
  const innerRadius = itemCount <= 3 ? 95 : itemCount <= 5 ? 82 : 70;
  const gapAngle = itemCount <= 3 ? 10 : itemCount <= 5 ? 8 : 6;

  const fontSize = itemCount <= 4 ? "0.875rem" : "0.75rem";
  const labelSize = itemCount <= 4 ? "1rem" : "0.875rem";

  // Calculate position info for each item
  const getItemPosition = (index: number) => {
    const totalArcAngle = 180 - (itemCount - 1) * gapAngle;
    const segmentAngle = totalArcAngle / itemCount;
    const startAngle = -180 + index * (segmentAngle + gapAngle);
    const midAngle = startAngle + segmentAngle / 2;

    // Normalize to 0-1 range where 0 = leftmost (-180°), 1 = rightmost (0°)
    const normalizedPos = (midAngle + 180) / 180;

    // Calculate vertical offset - center items are higher (smaller offset), edge items are lower
    // Using sine curve: edges (0, 1) have sin close to 0, center (0.5) has sin = 1
    const verticalFactor = Math.sin(normalizedPos * Math.PI);

    let textAlign: "left" | "center" | "right" = "center";
    if (midAngle < -120) textAlign = "right";
    else if (midAngle > -60) textAlign = "left";

    return { normalizedPos, verticalFactor, textAlign };
  };

  // Grid columns based on item count
  const gridCols = Math.min(itemCount, 6);

  return (
    <div className={`w-full flex flex-col items-center ${className}`}>
      {/* Text row - items spread horizontally, with vertical offset following arc curve */}
      <div
        className="w-full grid gap-2 px-4"
        style={{
          gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
        }}
      >
        {items.slice(0, gridCols).map((item, index) => {
          const pos = getItemPosition(index);
          // Vertical margin: center items have less top margin (appear higher)
          // Edge items have more top margin (appear lower) - increased for wing texts
          const topMargin = Math.round((1 - pos.verticalFactor) * 100);

          return (
            <div
              key={index}
              className="flex flex-col"
              style={{
                marginTop: `${topMargin}px`,
                textAlign: pos.textAlign,
              }}
            >
              {item.label && (
                onStartEditLabel ? (
                  <EditableText
                    value={item.label}
                    isEditing={isEditing && editingText?.field === `content-label-${index}`}
                    onStartEdit={() => onStartEditLabel(index)}
                    onChange={(val) => onUpdateLabel?.(index, val)}
                    onFinish={onFinishEditing || (() => {})}
                    className="font-semibold text-slate-800 mb-1 leading-tight"
                    style={{ fontSize: labelSize }}
                    isOwner={isOwner}
                    isHovered={isHovered}
                  />
                ) : (
                  <h3
                    className="font-semibold text-slate-800 mb-1 leading-tight"
                    style={{ fontSize: labelSize }}
                  >
                    {item.label}
                  </h3>
                )
              )}
              {onStartEditText ? (
                <EditableText
                  value={item.text}
                  isEditing={isEditing && editingText?.field === `content-text-${index}`}
                  onStartEdit={() => onStartEditText(index)}
                  onChange={(val) => onUpdateText?.(index, val)}
                  onFinish={onFinishEditing || (() => {})}
                  className="text-slate-600 leading-snug"
                  style={{ fontSize }}
                  isOwner={isOwner}
                  isHovered={isHovered}
                />
              ) : (
                <p className="text-slate-600 leading-snug" style={{ fontSize }}>
                  {item.text}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Arc SVG */}
      <svg
        width="480"
        height="250"
        viewBox="-240 -240 480 250"
        className="flex-shrink-0 -mt-20"
      >
        {Array.from({ length: itemCount }).map((_, index) => {
          const path = getArcSegmentPath(
            index,
            itemCount,
            outerRadius,
            innerRadius,
            gapAngle
          );
          const iconPos = getArcIconPosition(
            index,
            itemCount,
            (outerRadius + innerRadius) / 2
          );
          const item = items[index];

          return (
            <g key={index}>
              <path
                d={path}
                fill={`${accentColor}15`}
                stroke={`${accentColor}30`}
                strokeWidth="1"
              />
              <circle
                cx={iconPos.x}
                cy={iconPos.y}
                r={itemCount <= 4 ? 16 : 13}
                fill="white"
                stroke={`${accentColor}40`}
                strokeWidth="1"
              />
              {item?.icon ? (
                <text
                  x={iconPos.x}
                  y={iconPos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="12"
                  fill={accentColor}
                >
                  {item.icon}
                </text>
              ) : (
                <circle
                  cx={iconPos.x}
                  cy={iconPos.y}
                  r={3}
                  fill={`${accentColor}40`}
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// Ring Layout
function RingLayout({
  items,
  accentColor,
  className,
  isEditing = false,
  editingText = null,
  onStartEditLabel,
  onStartEditText,
  onUpdateLabel,
  onUpdateText,
  onFinishEditing,
  isOwner = false,
  isHovered = false,
}: {
  items: CircleContentItem[];
  accentColor: string;
  className: string;
  isEditing?: boolean;
  editingText?: { field: string; bulletIndex?: number } | null;
  onStartEditLabel?: (index: number) => void;
  onStartEditText?: (index: number) => void;
  onUpdateLabel?: (index: number, value: string) => void;
  onUpdateText?: (index: number, value: string) => void;
  onFinishEditing?: () => void;
  isOwner?: boolean;
  isHovered?: boolean;
}) {
  const itemCount = items.length;
  
  const outerRadius = itemCount <= 4 ? 100 : itemCount <= 6 ? 85 : 75;
  const innerRadius = itemCount <= 4 ? 50 : itemCount <= 6 ? 42 : 36;
  const svgSize = itemCount <= 4 ? 240 : itemCount <= 6 ? 200 : 180;
  const gapAngle = itemCount <= 4 ? 15 : itemCount <= 6 ? 12 : 10;

  // For more than 4 items, use grid below
  if (itemCount > 4) {
    return (
      <div className={`w-full flex flex-col items-center gap-4 ${className}`}>
        <svg
          width={svgSize}
          height={svgSize}
          viewBox={`${-svgSize / 2} ${-svgSize / 2} ${svgSize} ${svgSize}`}
        >
          {Array.from({ length: itemCount }).map((_, index) => {
            const path = getRingSegmentPath(index, itemCount, outerRadius, innerRadius, gapAngle);
            const iconPos = getRingIconPosition(index, itemCount, (outerRadius + innerRadius) / 2);
            const item = items[index];

            return (
              <g key={index}>
                <path d={path} fill={`${accentColor}15`} stroke={`${accentColor}30`} strokeWidth="1" />
                <circle cx={iconPos.x} cy={iconPos.y} r={11} fill="white" stroke={`${accentColor}40`} strokeWidth="1" />
                {item?.icon ? (
                  <text x={iconPos.x} y={iconPos.y} textAnchor="middle" dominantBaseline="central" fontSize="10" fill={accentColor}>
                    {item.icon}
                  </text>
                ) : (
                  <circle cx={iconPos.x} cy={iconPos.y} r={2} fill={`${accentColor}40`} />
                )}
              </g>
            );
          })}
        </svg>

        <div className="w-full grid gap-2 px-4" style={{ gridTemplateColumns: `repeat(${Math.min(itemCount, 4)}, 1fr)` }}>
          {items.map((item, index) => (
            <div key={index} className="p-2 rounded-lg text-center" style={{ backgroundColor: `${accentColor}08` }}>
              {item.label && (
                onStartEditLabel ? (
                  <EditableText
                    value={item.label}
                    isEditing={isEditing && editingText?.field === `content-label-${index}`}
                    onStartEdit={() => onStartEditLabel(index)}
                    onChange={(val) => onUpdateLabel?.(index, val)}
                    onFinish={onFinishEditing || (() => {})}
                    className="text-sm font-semibold text-slate-800 mb-1"
                    isOwner={isOwner}
                    isHovered={isHovered}
                  />
                ) : (
                  <h3 className="text-sm font-semibold text-slate-800 mb-1">{item.label}</h3>
                )
              )}
              {onStartEditText ? (
                <EditableText
                  value={item.text}
                  isEditing={isEditing && editingText?.field === `content-text-${index}`}
                  onStartEdit={() => onStartEditText(index)}
                  onChange={(val) => onUpdateText?.(index, val)}
                  onFinish={onFinishEditing || (() => {})}
                  className="text-xs text-slate-600 leading-relaxed line-clamp-2"
                  isOwner={isOwner}
                  isHovered={isHovered}
                />
              ) : (
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{item.text}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Standard layout - content on sides
  const leftItems = items.filter((_, i) => i % 2 === 0);
  const rightItems = items.filter((_, i) => i % 2 === 1);
  const leftIndices = items.map((_, i) => i).filter(i => i % 2 === 0);
  const rightIndices = items.map((_, i) => i).filter(i => i % 2 === 1);

  return (
    <div className={`w-full flex items-center justify-center gap-6 ${className}`}>
      <div className="flex flex-col justify-center items-end text-right space-y-4" style={{ maxWidth: '180px' }}>
        {leftItems.map((item, idx) => {
          const actualIndex = leftIndices[idx]!;
          return (
            <div key={idx}>
              {item.label && (
                onStartEditLabel ? (
                  <EditableText
                    value={item.label}
                    isEditing={isEditing && editingText?.field === `content-label-${actualIndex}`}
                    onStartEdit={() => onStartEditLabel(actualIndex)}
                    onChange={(val) => onUpdateLabel?.(actualIndex, val)}
                    onFinish={onFinishEditing || (() => {})}
                    className="text-base font-semibold text-slate-800 mb-1"
                    isOwner={isOwner}
                    isHovered={isHovered}
                  />
                ) : (
                  <h3 className="text-base font-semibold text-slate-800 mb-1">{item.label}</h3>
                )
              )}
              {onStartEditText ? (
                <EditableText
                  value={item.text}
                  isEditing={isEditing && editingText?.field === `content-text-${actualIndex}`}
                  onStartEdit={() => onStartEditText(actualIndex)}
                  onChange={(val) => onUpdateText?.(actualIndex, val)}
                  onFinish={onFinishEditing || (() => {})}
                  className="text-sm text-slate-600 leading-relaxed"
                  isOwner={isOwner}
                  isHovered={isHovered}
                />
              ) : (
                <p className="text-sm text-slate-600 leading-relaxed">{item.text}</p>
              )}
            </div>
          );
        })}
      </div>

      <svg width={svgSize} height={svgSize} viewBox={`${-svgSize / 2} ${-svgSize / 2} ${svgSize} ${svgSize}`}>
        {Array.from({ length: itemCount }).map((_, index) => {
          const path = getRingSegmentPath(index, itemCount, outerRadius, innerRadius, 15);
          const iconPos = getRingIconPosition(index, itemCount, (outerRadius + innerRadius) / 2);
          const item = items[index];

          return (
            <g key={index}>
              <path d={path} fill={`${accentColor}15`} stroke={`${accentColor}30`} strokeWidth="1" />
              <circle cx={iconPos.x} cy={iconPos.y} r="14" fill="white" stroke={`${accentColor}40`} strokeWidth="1" />
              {item?.icon ? (
                <text x={iconPos.x} y={iconPos.y} textAnchor="middle" dominantBaseline="central" fontSize="11" fill={accentColor}>
                  {item.icon}
                </text>
              ) : (
                <circle cx={iconPos.x} cy={iconPos.y} r="3" fill={`${accentColor}40`} />
              )}
            </g>
          );
        })}
      </svg>

      <div className="flex flex-col justify-center items-start text-left space-y-4" style={{ maxWidth: '180px' }}>
        {rightItems.map((item, idx) => {
          const actualIndex = rightIndices[idx]!;
          return (
            <div key={idx}>
              {item.label && (
                onStartEditLabel ? (
                  <EditableText
                    value={item.label}
                    isEditing={isEditing && editingText?.field === `content-label-${actualIndex}`}
                    onStartEdit={() => onStartEditLabel(actualIndex)}
                    onChange={(val) => onUpdateLabel?.(actualIndex, val)}
                    onFinish={onFinishEditing || (() => {})}
                    className="text-base font-semibold text-slate-800 mb-1"
                    isOwner={isOwner}
                    isHovered={isHovered}
                  />
                ) : (
                  <h3 className="text-base font-semibold text-slate-800 mb-1">{item.label}</h3>
                )
              )}
              {onStartEditText ? (
                <EditableText
                  value={item.text}
                  isEditing={isEditing && editingText?.field === `content-text-${actualIndex}`}
                  onStartEdit={() => onStartEditText(actualIndex)}
                  onChange={(val) => onUpdateText?.(actualIndex, val)}
                  onFinish={onFinishEditing || (() => {})}
                  className="text-sm text-slate-600 leading-relaxed"
                  isOwner={isOwner}
                  isHovered={isHovered}
                />
              ) : (
                <p className="text-sm text-slate-600 leading-relaxed">{item.text}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CircleLayoutRenderer;
