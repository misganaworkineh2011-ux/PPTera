"use client";

import React from "react";
import type { StepsLayoutType, StepContentItem } from "~/lib/layouts/content/steps";
import EditableText from "~/components/presentation/EditableText";

interface StepsLayoutRendererProps {
  layoutId: StepsLayoutType;
  items: StepContentItem[];
  accentColor?: string;
  className?: string;
  isNarrowSpace?: boolean;
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

export function StepsLayoutRenderer({
  layoutId,
  items,
  accentColor = "#047857",
  className = "",
  isNarrowSpace = false,
  isEditing = false,
  editingText = null,
  onStartEditLabel,
  onStartEditText,
  onUpdateLabel,
  onUpdateText,
  onFinishEditing,
  isOwner = false,
  isHovered = false,
}: StepsLayoutRendererProps) {
  const displayItems = items.slice(0, 6);

  if (layoutId === "steps-pyramid") {
    return (
      <PyramidSteps
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

  if (layoutId === "steps-arrows") {
    return (
      <ArrowSteps
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

  if (layoutId === "steps-cards") {
    return (
      <CardSteps
        items={displayItems}
        accentColor={accentColor}
        className={className}
        isNarrowSpace={isNarrowSpace}
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
    <BarSteps
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

// Style 1: Pyramid Steps - Sharp triangle with gaps between sections, text staggered diagonally
function PyramidSteps({
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
  items: StepContentItem[];
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
  const pyramidWidth = 280;
  const sectionHeight = 80; // Height of each section
  const gap = 15; // Visible gap between sections
  const totalHeight = itemCount * sectionHeight + (itemCount - 1) * gap;

  return (
    <div className={`flex gap-6 ${className}`}>
      {/* Pyramid on left */}
      <div className="flex-shrink-0" style={{ width: `${pyramidWidth}px` }}>
        <svg
          width={pyramidWidth}
          height={totalHeight}
          viewBox={`0 0 ${pyramidWidth} ${totalHeight}`}
        >
          {items.map((_, index) => {
            // Calculate Y positions with gaps between sections
            const topY = index * (sectionHeight + gap);
            const bottomY = topY + sectionHeight;
            
            // Calculate width at each Y position for sharp triangle
            // The pyramid expands from a point at top to full width at bottom
            const getWidthAtY = (y: number) => {
              return (y / totalHeight) * pyramidWidth;
            };
            
            const topWidth = getWidthAtY(topY);
            const bottomWidth = getWidthAtY(bottomY);
            
            const centerX = pyramidWidth / 2;
            const topLeftX = centerX - topWidth / 2;
            const topRightX = centerX + topWidth / 2;
            const bottomLeftX = centerX - bottomWidth / 2;
            const bottomRightX = centerX + bottomWidth / 2;

            // For first section, make it a triangle (point at top)
            if (index === 0) {
              return (
                <g key={index}>
                  <path
                    d={`M ${centerX} 0 L ${bottomRightX} ${bottomY} L ${bottomLeftX} ${bottomY} Z`}
                    fill={`${accentColor}12`}
                    stroke={`${accentColor}25`}
                    strokeWidth="1"
                  />
                  <text
                    x={centerX}
                    y={sectionHeight * 0.65}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-xl"
                    fill={`${accentColor}40`}
                    style={{ fontWeight: 300 }}
                  >
                    {index + 1}
                  </text>
                </g>
              );
            }

            // Other sections are trapezoids with gap from previous section
            return (
              <g key={index}>
                <path
                  d={`M ${topLeftX} ${topY} L ${topRightX} ${topY} L ${bottomRightX} ${bottomY} L ${bottomLeftX} ${bottomY} Z`}
                  fill={`${accentColor}12`}
                  stroke={`${accentColor}25`}
                  strokeWidth="1"
                />
                <text
                  x={centerX}
                  y={topY + sectionHeight / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xl"
                  fill={`${accentColor}40`}
                  style={{ fontWeight: 300 }}
                >
                  {index + 1}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Content on right - staggered diagonally to align with pyramid right edge */}
      <div className="flex-1 flex flex-col">
        {items.map((item, index) => {
          // Calculate left padding to create diagonal stagger effect
          // Text aligns with the right edge of each pyramid section
          const staggerPadding = index * 40; // Increase padding as we go down
          
          return (
            <div
              key={index}
              className="flex flex-col justify-center"
              style={{
                height: `${sectionHeight + gap}px`,
                paddingLeft: `${staggerPadding}px`,
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
                    className="text-lg font-semibold text-slate-800 mb-1"
                    isOwner={isOwner}
                    isHovered={isHovered}
                  />
                ) : (
                  <h3 className="text-lg font-semibold text-slate-800 mb-1">
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
                  className="text-sm text-slate-600 leading-relaxed"
                  isOwner={isOwner}
                  isHovered={isHovered}
                />
              ) : (
                <p className="text-sm text-slate-600 leading-relaxed">
                  {item.text}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Style 2: Arrow Steps - Thick downward arrows, staggered to the right
function ArrowSteps({
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
  items: StepContentItem[];
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
  // Each arrow is offset more to the right (staggered effect)
  const getLeftPadding = (index: number) => {
    return index * 35; // 35px offset per step for more visible stagger
  };

  // Arrow dimensions - much thicker and taller
  const arrowWidth = 50;
  const arrowHeight = 85;
  const bodyWidth = 30; // Thick body
  const headHeight = 25; // Arrow head portion

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {items.map((item, index) => (
        <div
          key={index}
          className="flex items-start gap-5"
          style={{ paddingLeft: `${getLeftPadding(index)}px` }}
        >
          {/* Thick arrow pointing down */}
          <div className="flex-shrink-0">
            <svg width={arrowWidth} height={arrowHeight} viewBox={`0 0 ${arrowWidth} ${arrowHeight}`} fill="none">
              {/* Arrow body (thick rectangle) */}
              <rect 
                x={(arrowWidth - bodyWidth) / 2} 
                y="0" 
                width={bodyWidth} 
                height={arrowHeight - headHeight} 
                fill={`${accentColor}15`} 
              />
              {/* Arrow head (wide triangle pointing down) */}
              <polygon 
                points={`${arrowWidth / 2},${arrowHeight} 0,${arrowHeight - headHeight} ${arrowWidth},${arrowHeight - headHeight}`} 
                fill={`${accentColor}15`} 
              />
            </svg>
          </div>

          {/* Content */}
          <div className="flex-1 pt-2">
            {item.label && (
              onStartEditLabel ? (
                <EditableText
                  value={item.label}
                  isEditing={isEditing && editingText?.field === `content-label-${index}`}
                  onStartEdit={() => onStartEditLabel(index)}
                  onChange={(val) => onUpdateLabel?.(index, val)}
                  onFinish={onFinishEditing || (() => {})}
                  className="text-lg font-semibold text-slate-800 mb-1"
                  isOwner={isOwner}
                  isHovered={isHovered}
                />
              ) : (
                <h3 className="text-lg font-semibold text-slate-800 mb-1">
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
                className="text-sm text-slate-600 leading-relaxed"
                isOwner={isOwner}
                isHovered={isHovered}
              />
            ) : (
              <p className="text-sm text-slate-600 leading-relaxed">
                {item.text}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Style 3: Card Steps - Horizontal cards with INCREASING HEIGHT (stairs going up)
function CardSteps({
  items,
  accentColor,
  className,
  isNarrowSpace,
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
  items: StepContentItem[];
  accentColor: string;
  className: string;
  isNarrowSpace: boolean;
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
  
  // Heights increase from left to right (like stairs)
  const getHeight = (index: number) => {
    const minHeight = 120;
    const maxHeight = 200;
    const step = (maxHeight - minHeight) / Math.max(itemCount - 1, 1);
    return minHeight + step * index;
  };

  if (isNarrowSpace) {
    // Stack vertically in narrow space
    return (
      <div className={`flex flex-col gap-4 ${className}`}>
        {items.map((item, index) => (
          <div
            key={index}
            className="rounded-xl p-5"
            style={{
              backgroundColor: `${accentColor}06`,
              border: `1px solid ${accentColor}15`,
              borderLeftWidth: "3px",
              borderLeftColor: `${accentColor}25`,
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
                  className="text-base font-semibold text-slate-800 mb-2"
                  isOwner={isOwner}
                  isHovered={isHovered}
                />
              ) : (
                <h3 className="text-base font-semibold text-slate-800 mb-2">
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
                className="text-sm text-slate-600 leading-relaxed"
                isOwner={isOwner}
                isHovered={isHovered}
              />
            ) : (
              <p className="text-sm text-slate-600 leading-relaxed">
                {item.text}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex items-start gap-4 ${className}`}>
      {items.map((item, index) => (
        <div
          key={index}
          className="flex-1 rounded-2xl p-6 flex flex-col"
          style={{
            backgroundColor: `${accentColor}05`,
            border: `1px solid ${accentColor}12`,
            borderLeftWidth: "4px",
            borderLeftColor: `${accentColor}30`,
            height: `${getHeight(index)}px`,
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
                className="text-base font-semibold text-slate-800 mb-2"
                isOwner={isOwner}
                isHovered={isHovered}
              />
            ) : (
              <h3 className="text-base font-semibold text-slate-800 mb-2">
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
              className="text-sm text-slate-600 leading-relaxed"
              isOwner={isOwner}
              isHovered={isHovered}
            />
          ) : (
            <p className="text-sm text-slate-600 leading-relaxed">
              {item.text}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

// Style 4: Bar Steps - Vertical bars with INCREASING WIDTH, text OUTSIDE the bar
function BarSteps({
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
  items: StepContentItem[];
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
  
  // Widths increase from top to bottom (like steps)
  const getWidth = (index: number) => {
    const minWidth = 25; // percentage
    const maxWidth = 45;
    const step = (maxWidth - minWidth) / Math.max(itemCount - 1, 1);
    return minWidth + step * index;
  };

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-5">
          {/* Number bar - only contains the number */}
          <div
            className="flex-shrink-0 rounded-xl flex items-center justify-center py-5"
            style={{
              backgroundColor: `${accentColor}10`,
              border: `1px solid ${accentColor}15`,
              width: `${getWidth(index)}%`,
              minWidth: "80px",
            }}
          >
            <span
              className="text-2xl"
              style={{ color: `${accentColor}50`, fontWeight: 300 }}
            >
              {index + 1}
            </span>
          </div>

          {/* Content section - OUTSIDE the bar */}
          <div className="flex-1">
            {item.label && (
              onStartEditLabel ? (
                <EditableText
                  value={item.label}
                  isEditing={isEditing && editingText?.field === `content-label-${index}`}
                  onStartEdit={() => onStartEditLabel(index)}
                  onChange={(val) => onUpdateLabel?.(index, val)}
                  onFinish={onFinishEditing || (() => {})}
                  className="text-base font-semibold mb-1"
                  style={{ color: accentColor }}
                  isOwner={isOwner}
                  isHovered={isHovered}
                />
              ) : (
                <h3
                  className="text-base font-semibold mb-1"
                  style={{ color: accentColor }}
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
                className="text-sm text-slate-600 leading-relaxed"
                isOwner={isOwner}
                isHovered={isHovered}
              />
            ) : (
              <p className="text-sm text-slate-600 leading-relaxed">
                {item.text}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default StepsLayoutRenderer;
