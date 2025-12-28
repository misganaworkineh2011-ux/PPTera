"use client";

import React from "react";
import { Check, ChevronRight } from "lucide-react";
import type { BulletLayoutType, BulletContentItem } from "~/lib/layouts/content/bullets";
import { calculateBulletGridDimensions } from "~/lib/layouts/content/bullets";

interface BulletLayoutRendererProps {
  layoutId: BulletLayoutType;
  items: BulletContentItem[];
  accentColor?: string;
  className?: string;
  isNarrowSpace?: boolean;
}

export function BulletLayoutRenderer({
  layoutId,
  items,
  accentColor = "#047857",
  className = "",
  isNarrowSpace = false,
}: BulletLayoutRendererProps) {
  const displayItems = items.slice(0, 8);

  // Style 1: Cards with filled circle bullets, grid layout
  if (layoutId === "bullet-style-1") {
    return (
      <CardBullets
        items={displayItems}
        accentColor={accentColor}
        bulletType="circle"
        className={className}
        isNarrowSpace={isNarrowSpace}
      />
    );
  }

  // Style 2: Simple text with filled circle bullets, no cards
  if (layoutId === "bullet-style-2") {
    return (
      <SimpleBullets
        items={displayItems}
        accentColor={accentColor}
        bulletType="circle"
        className={className}
        isNarrowSpace={isNarrowSpace}
      />
    );
  }

  // Style 3: Checkmark bullets in cards
  if (layoutId === "bullet-style-3") {
    return (
      <CardBullets
        items={displayItems}
        accentColor={accentColor}
        bulletType="checkmark"
        className={className}
        isNarrowSpace={isNarrowSpace}
      />
    );
  }

  // Style 4: Arrow bullets, minimal list
  return (
    <ArrowBullets
      items={displayItems}
      accentColor={accentColor}
      className={className}
      isNarrowSpace={isNarrowSpace}
    />
  );
}

// Card Bullets Component (Style 1 & 3)
function CardBullets({
  items,
  accentColor,
  bulletType,
  className,
  isNarrowSpace,
}: {
  items: BulletContentItem[];
  accentColor: string;
  bulletType: "circle" | "checkmark";
  className: string;
  isNarrowSpace: boolean;
}) {
  const { columns, specialLayout } = calculateBulletGridDimensions(items.length, isNarrowSpace);

  // Special 2-1 layout for 3 items
  if (specialLayout === "2-1" && items.length === 3) {
    return (
      <div className={`flex flex-col gap-4 ${className}`}>
        {/* Top row - 2 items */}
        <div className="grid grid-cols-2 gap-4">
          {items.slice(0, 2).map((item, idx) => (
            <BulletCard key={idx} item={item} accentColor={accentColor} bulletType={bulletType} />
          ))}
        </div>
        {/* Bottom row - 1 full-width item */}
        <div>
          <BulletCard item={items[2]!} accentColor={accentColor} bulletType={bulletType} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`grid gap-4 ${className}`}
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
      }}
    >
      {items.map((item, idx) => (
        <BulletCard key={idx} item={item} accentColor={accentColor} bulletType={bulletType} />
      ))}
    </div>
  );
}

// Single Bullet Card
function BulletCard({
  item,
  accentColor,
  bulletType,
}: {
  item: BulletContentItem;
  accentColor: string;
  bulletType: "circle" | "checkmark";
}) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        backgroundColor: `${accentColor}10`,
      }}
    >
      <div className="flex items-start gap-3">
        {/* Bullet */}
        <div className="flex-shrink-0 mt-1">
          {bulletType === "circle" ? (
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: accentColor }}
            />
          ) : (
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${accentColor}20` }}
            >
              <Check size={12} style={{ color: accentColor }} strokeWidth={3} />
            </div>
          )}
        </div>
        {/* Content */}
        <div className="flex-1">
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
    </div>
  );
}

// Simple Bullets Component (Style 2)
function SimpleBullets({
  items,
  accentColor,
  bulletType,
  className,
  isNarrowSpace,
}: {
  items: BulletContentItem[];
  accentColor: string;
  bulletType: "circle";
  className: string;
  isNarrowSpace: boolean;
}) {
  // For 3 items: 2 columns on top row, 1 on bottom
  if (items.length === 3 && !isNarrowSpace) {
    return (
      <div className={`flex flex-col gap-6 ${className}`}>
        {/* Top row - 2 items */}
        <div className="grid grid-cols-2 gap-8">
          {items.slice(0, 2).map((item, idx) => (
            <SimpleBulletItem key={idx} item={item} accentColor={accentColor} />
          ))}
        </div>
        {/* Bottom row - 1 item */}
        <div>
          <SimpleBulletItem item={items[2]!} accentColor={accentColor} />
        </div>
      </div>
    );
  }

  // Default: columns based on item count
  const columns = isNarrowSpace ? 1 : items.length <= 2 ? items.length : 2;

  return (
    <div
      className={`grid gap-6 ${className}`}
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
      }}
    >
      {items.map((item, idx) => (
        <SimpleBulletItem key={idx} item={item} accentColor={accentColor} />
      ))}
    </div>
  );
}

// Single Simple Bullet Item
function SimpleBulletItem({
  item,
  accentColor,
}: {
  item: BulletContentItem;
  accentColor: string;
}) {
  return (
    <div className="flex items-start gap-3">
      {/* Bullet */}
      <div className="flex-shrink-0 mt-2">
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: accentColor }}
        />
      </div>
      {/* Content */}
      <div className="flex-1">
        {item.label && (
          <h3 className="text-lg font-semibold text-slate-800 mb-1">
            {item.label}
          </h3>
        )}
        <p className="text-sm text-slate-600 leading-relaxed">
          {item.text}
        </p>
      </div>
    </div>
  );
}

// Arrow Bullets Component (Style 4)
function ArrowBullets({
  items,
  accentColor,
  className,
  isNarrowSpace,
}: {
  items: BulletContentItem[];
  accentColor: string;
  className: string;
  isNarrowSpace: boolean;
}) {
  // Vertical list layout
  const columns = isNarrowSpace ? 1 : items.length <= 4 ? 1 : 2;

  return (
    <div
      className={`grid gap-4 ${className}`}
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
      }}
    >
      {items.map((item, idx) => (
        <div key={idx} className="flex items-start gap-3">
          {/* Arrow bullet */}
          <div className="flex-shrink-0 mt-1">
            <ChevronRight size={18} style={{ color: accentColor }} strokeWidth={2.5} />
          </div>
          {/* Content */}
          <div className="flex-1">
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

export default BulletLayoutRenderer;
