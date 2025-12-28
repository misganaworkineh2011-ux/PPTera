"use client";

import React from "react";
import type { CircleLayoutType, CircleContentItem } from "~/lib/layouts/content/circles";
import {
  getArcSegmentPath,
  getRingSegmentPath,
  getArcIconPosition,
  getRingIconPosition,
} from "~/lib/layouts/content/circles";

interface CircleLayoutRendererProps {
  layoutId: CircleLayoutType;
  items: CircleContentItem[];
  accentColor?: string;
  className?: string;
}

export function CircleLayoutRenderer({
  layoutId,
  items,
  accentColor = "#0d9488", // teal-600
  className = "",
}: CircleLayoutRendererProps) {
  // Limit to 3 items for these layouts
  const displayItems = items.slice(0, 3);
  const itemCount = displayItems.length;

  if (layoutId === "circle-arc") {
    return (
      <ArcLayout
        items={displayItems}
        accentColor={accentColor}
        className={className}
      />
    );
  }

  return (
    <RingLayout
      items={displayItems}
      accentColor={accentColor}
      className={className}
    />
  );
}

// Arc Layout Component
function ArcLayout({
  items,
  accentColor,
  className,
}: {
  items: CircleContentItem[];
  accentColor: string;
  className: string;
}) {
  const itemCount = items.length;
  const outerRadius = 140;
  const innerRadius = 75;
  const svgSize = 320;
  const centerX = svgSize / 2;
  const centerY = svgSize - 20; // Arc opens upward from bottom

  return (
    <div className={`relative w-full h-full flex items-center justify-center ${className}`}>
      {/* Content positioned around the arc */}
      <div className="absolute inset-0 grid grid-cols-3 gap-4 p-4">
        {/* Left content (item 0) */}
        {items[0] && (
          <div className="flex flex-col justify-end items-end text-right pb-16 pr-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              {items[0].label}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed max-w-[200px]">
              {items[0].text}
            </p>
          </div>
        )}

        {/* Top content (item 1) */}
        {items[1] && (
          <div className="flex flex-col items-center text-center pt-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              {items[1].label}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed max-w-[220px]">
              {items[1].text}
            </p>
          </div>
        )}

        {/* Right content (item 2) */}
        {items[2] && (
          <div className="flex flex-col justify-end items-start text-left pb-16 pl-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              {items[2].label}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed max-w-[200px]">
              {items[2].text}
            </p>
          </div>
        )}
      </div>

      {/* Arc SVG */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <svg
          width={svgSize}
          height={svgSize / 2 + 40}
          viewBox={`${-svgSize / 2} ${-svgSize / 2} ${svgSize} ${svgSize / 2 + 40}`}
          className="overflow-visible"
        >
          {/* Arc segments */}
          {Array.from({ length: itemCount }).map((_, index) => {
            const path = getArcSegmentPath(index, itemCount, outerRadius, innerRadius, 10);
            const iconPos = getArcIconPosition(index, itemCount, (outerRadius + innerRadius) / 2);
            const item = items[index];

            return (
              <g key={index}>
                {/* Segment */}
                <path
                  d={path}
                  fill={`${accentColor}15`}
                  stroke={`${accentColor}30`}
                  strokeWidth="1"
                  className="transition-all duration-300 hover:fill-[${accentColor}25]"
                />
                {/* Icon placeholder circle */}
                <circle
                  cx={iconPos.x}
                  cy={iconPos.y}
                  r="18"
                  fill="white"
                  stroke={`${accentColor}40`}
                  strokeWidth="1"
                />
                {/* Icon or placeholder */}
                {item?.icon ? (
                  <text
                    x={iconPos.x}
                    y={iconPos.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="text-sm"
                    fill={accentColor}
                  >
                    {item.icon}
                  </text>
                ) : (
                  <circle
                    cx={iconPos.x}
                    cy={iconPos.y}
                    r="4"
                    fill={`${accentColor}40`}
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// Ring Layout Component
function RingLayout({
  items,
  accentColor,
  className,
}: {
  items: CircleContentItem[];
  accentColor: string;
  className: string;
}) {
  const itemCount = items.length;
  const outerRadius = 110;
  const innerRadius = 55;
  const svgSize = 260;

  return (
    <div className={`relative w-full h-full flex items-center ${className}`}>
      {/* Left content (item 0) */}
      <div className="flex-1 flex flex-col justify-center items-end text-right pr-8">
        {items[0] && (
          <div className="max-w-[200px]">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              {items[0].label}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {items[0].text}
            </p>
          </div>
        )}
      </div>

      {/* Ring SVG - Center */}
      <div className="flex-shrink-0">
        <svg
          width={svgSize}
          height={svgSize}
          viewBox={`${-svgSize / 2} ${-svgSize / 2} ${svgSize} ${svgSize}`}
          className="overflow-visible"
        >
          {/* Ring segments */}
          {Array.from({ length: itemCount }).map((_, index) => {
            const path = getRingSegmentPath(index, itemCount, outerRadius, innerRadius, 15);
            const iconPos = getRingIconPosition(index, itemCount, (outerRadius + innerRadius) / 2);
            const item = items[index];

            return (
              <g key={index}>
                {/* Segment */}
                <path
                  d={path}
                  fill={`${accentColor}15`}
                  stroke={`${accentColor}30`}
                  strokeWidth="1"
                  className="transition-all duration-300"
                />
                {/* Icon placeholder circle */}
                <circle
                  cx={iconPos.x}
                  cy={iconPos.y}
                  r="16"
                  fill="white"
                  stroke={`${accentColor}40`}
                  strokeWidth="1"
                />
                {/* Icon or placeholder */}
                {item?.icon ? (
                  <text
                    x={iconPos.x}
                    y={iconPos.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="text-xs"
                    fill={accentColor}
                  >
                    {item.icon}
                  </text>
                ) : (
                  <circle
                    cx={iconPos.x}
                    cy={iconPos.y}
                    r="3"
                    fill={`${accentColor}40`}
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Right content (items 1 and 2) */}
      <div className="flex-1 flex flex-col justify-center items-start text-left pl-8 space-y-6">
        {items[1] && (
          <div className="max-w-[200px]">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              {items[1].label}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {items[1].text}
            </p>
          </div>
        )}
        {items[2] && (
          <div className="max-w-[200px]">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              {items[2].label}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {items[2].text}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CircleLayoutRenderer;
