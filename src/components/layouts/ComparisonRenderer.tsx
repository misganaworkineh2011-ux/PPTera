"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Theme } from "~/lib/themes";
import type { ComparisonContentItem } from "~/lib/layouts/content/comparison";
import { splitLeftAndRight } from "~/lib/layouts/content/comparison";
import EditableText from "~/components/presentation/EditableText";
import { alpha } from "~/components/presentation/PremiumComponents";
import { containerVariantsFor, itemMotionProps } from "~/components/presentation/item-animations";

// --- Constants ---
const CANVAS_HEIGHT = 600;
const CANVAS_WIDTH = 1000;
const ANCHOR_RADIUS = 160; // BIGGER: Large radius for the gray circles
const ARC_RADIUS = 320;    // Pushed out further to clear the big circles
const BUBBLE_RADIUS = 20;

// --- Colors ---
const DEFAULT_COLORS = {
  left: "#009688", // Teal
  right: "#f97316", // Orange
  grayBg: "#f1f5f9", 
  text: "#334155",
  line: "#cbd5e1"
};

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

const itemVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.3 } },
};

interface ComparisonRendererProps {
  items: ComparisonContentItem[];
  theme?: Theme;
  accentColor?: string;
  className?: string;
  layoutId?: string;
  isPresenting?: boolean;
  animationKey?: string;
  itemAnimation?: string;
  revealCount?: number;
  isEditing?: boolean;
  editingText?: { field: string; bulletIndex?: number } | null;
  onStartEditLabel?: (index: number) => void;
  onStartEditText?: (index: number) => void;
  onUpdateLabel?: (index: number, value: string) => void;
  onUpdateText?: (index: number, value: string) => void;
  onFinishEditing?: () => void;
  isOwner?: boolean;
  isHovered?: boolean;
  spotlightIndex?: number;
  isSpotlightMode?: boolean;
}

export function ComparisonRenderer({
  items,
  theme,
  accentColor,
  className = "",
  layoutId,
  isPresenting = false,
  animationKey,
  itemAnimation,
  revealCount,
  isEditing = false,
  editingText = null,
  onStartEditLabel,
  onStartEditText,
  onUpdateLabel,
  onUpdateText,
  onFinishEditing,
  isOwner = false,
  isHovered = false,
}: ComparisonRendererProps) {
  const { left, right } = splitLeftAndRight(items);
  const displayLeft = left.slice(0, 6);
  const displayRight = right.slice(0, 6);

  // Colors
  const leftColor = theme?.colors.primary || accentColor || DEFAULT_COLORS.left;
  const rightColor = theme?.colors.secondary || theme?.colors.accent || DEFAULT_COLORS.right;
  // Theme-aware neutrals (were hardcoded slate/gray — broke on dark themes)
  const titleColor = theme?.colors.heading || theme?.colors.text || DEFAULT_COLORS.text;
  const bodyColor = theme?.colors.textMuted || DEFAULT_COLORS.text;
  const grayBg =
    theme?.cardBox?.background || theme?.colors.surface || DEFAULT_COLORS.grayBg;
  const lineColor = theme?.colors.border || DEFAULT_COLORS.line;

  if (layoutId && layoutId.startsWith("comparison-style-")) {
    return (
      <ExtendedComparison
        layoutId={layoutId}
        left={displayLeft}
        right={displayRight}
        colors={{ leftColor, rightColor, titleColor, bodyColor, surface: grayBg, border: lineColor }}
        className={className}
        isPresenting={isPresenting}
        animationKey={animationKey}
        itemAnimation={itemAnimation}
        revealCount={revealCount}
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

  // --- Math Helpers ---
  const getPosition = (index: number, total: number, isLeft: boolean) => {
    let angle;
    let anchorX;
    
    // Spread Angle: A bit wider since the circles are bigger
    const spread = Math.PI * 0.5; // 90 degrees

    if (isLeft) {
      anchorX = 0; 
      const startAngle = -spread / 2;
      const endAngle = spread / 2;
      const step = total > 1 ? (endAngle - startAngle) / (total - 1) : 0;
      angle = startAngle + (index * step);
    } else {
      anchorX = CANVAS_WIDTH;
      const startAngle = Math.PI + (spread / 2);
      const endAngle = Math.PI - (spread / 2);
      const step = total > 1 ? (endAngle - startAngle) / (total - 1) : 0;
      angle = startAngle + (index * step);
    }

    // Coordinates for the bubble center
    const x = anchorX + ARC_RADIUS * Math.cos(angle);
    const y = (CANVAS_HEIGHT / 2) + ARC_RADIUS * Math.sin(angle);

    // Anchor point (Start of line)
    // Starts exactly at the edge of the big circle
    const lineStartX = anchorX + (ANCHOR_RADIUS) * Math.cos(angle);
    const lineStartY = (CANVAS_HEIGHT / 2) + (ANCHOR_RADIUS) * Math.sin(angle);

    return { x, y, lineStartX, lineStartY };
  };

  const Container = isPresenting ? motion.div : "div";
  const ItemWrapper = isPresenting ? motion.div : "div";

  return (
    <Container
      className={`w-full max-w-7xl mx-auto py-8 relative ${className}`}
      variants={containerVariants}
      initial={isPresenting ? "hidden" : undefined}
      animate={isPresenting ? "visible" : undefined}
    >
      {/* Aspect Ratio Box with Overflow Hidden to cut the circles in half */}
      <div className="relative w-full aspect-[16/9] md:aspect-[2/1] max-h-[600px] overflow-hidden bg-white/5 rounded-xl">
        
        {/* --- 1. Background Anchors (Big Half Circles) --- */}
        
        {/* Left Anchor - Centered on Left Edge (0%) */}
        <div 
          className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 rounded-full z-10 shadow-sm"
          style={{ 
            width: ANCHOR_RADIUS * 2,
            height: ANCHOR_RADIUS * 2,
            backgroundColor: grayBg
          }}
        />

        {/* Right Anchor - Centered on Right Edge (100%) */}
        <div 
          className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 rounded-full z-10 shadow-sm"
          style={{ 
            width: ANCHOR_RADIUS * 2,
            height: ANCHOR_RADIUS * 2,
            backgroundColor: grayBg
          }}
        />

        {/* --- 2. SVG Connector Layer --- */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none z-0" 
          viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
          preserveAspectRatio="none"
        >
           {/* Left Lines */}
           {displayLeft.map((_, i) => {
             const pos = getPosition(i, displayLeft.length, true);
             return (
               <g key={`line-left-${i}`}>
                 {/* Dot on the rim of the big circle */}
                 <circle cx={pos.lineStartX} cy={pos.lineStartY} r="4" fill={leftColor} />
                 <line 
                    x1={pos.lineStartX} 
                    y1={pos.lineStartY} 
                    x2={pos.x}
                    y2={pos.y}
                    stroke={lineColor}
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
               </g>
             );
           })}
           {/* Right Lines */}
           {displayRight.map((_, i) => {
             const pos = getPosition(i, displayRight.length, false);
             return (
               <g key={`line-right-${i}`}>
                 {/* Dot on the rim of the big circle */}
                 <circle cx={pos.lineStartX} cy={pos.lineStartY} r="4" fill={rightColor} />
                 <line 
                    x1={pos.lineStartX} 
                    y1={pos.lineStartY} 
                    x2={pos.x}
                    y2={pos.y}
                    stroke={lineColor}
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
               </g>
             );
           })}
        </svg>

        {/* --- 3. Items Layer --- */}
        
        {/* Left Items */}
        {displayLeft.map((item, index) => {
          const pos = getPosition(index, displayLeft.length, true);
          const leftPct = (pos.x / CANVAS_WIDTH) * 100;
          const topPct = (pos.y / CANVAS_HEIGHT) * 100;

          return (
            <ItemWrapper
              key={`left-item-${index}`}
              variants={itemVariants}
              className="absolute flex items-center gap-3 pointer-events-auto"
              style={{ 
                left: `${leftPct}%`, 
                top: `${topPct}%`,
                transform: `translate(-${BUBBLE_RADIUS}px, -50%)`,
                width: 'max-content',
                maxWidth: '240px'
              }}
            >
              <div
                className="shrink-0 rounded-full flex items-center justify-center text-white font-bold text-sm tabular-nums"
                style={{
                  width: BUBBLE_RADIUS * 2,
                  height: BUBBLE_RADIUS * 2,
                  background: `linear-gradient(135deg, ${leftColor}, ${leftColor}cc)`,
                  boxShadow: `0 3px 10px ${leftColor}59`,
                }}
              >
                {String(index + 1).padStart(2, '0')}
              </div>

              <div className="flex-1 text-left">
                {onStartEditLabel ? (
                  <EditableText
                    value={item.label || ""}
                    isEditing={isEditing && editingText?.field === `content-label-${index}`}
                    onStartEdit={() => onStartEditLabel(index)}
                    onChange={(val) => onUpdateLabel?.(index, val)}
                    onFinish={onFinishEditing || (() => {})}
                    className="font-semibold text-sm md:text-base leading-tight tracking-tight"
                    style={{ color: titleColor }}
                    isOwner={isOwner}
                    isHovered={isHovered}
                  />
                ) : (
                  <span
                    className="font-semibold text-sm md:text-base leading-tight tracking-tight"
                    style={{ color: titleColor }}
                  >
                    {item.label}
                  </span>
                )}
              </div>
            </ItemWrapper>
          );
        })}

        {/* Right Items */}
        {displayRight.map((item, index) => {
          const pos = getPosition(index, displayRight.length, false);
          const leftPct = (pos.x / CANVAS_WIDTH) * 100;
          const topPct = (pos.y / CANVAS_HEIGHT) * 100;
          const globalIndex = displayLeft.length + index;

          return (
            <ItemWrapper
              key={`right-item-${index}`}
              variants={itemVariants}
              className="absolute flex flex-row-reverse items-center gap-3 pointer-events-auto"
              style={{ 
                left: `${leftPct}%`, 
                top: `${topPct}%`,
                transform: `translate(calc(-100% + ${BUBBLE_RADIUS}px), -50%)`,
                width: 'max-content',
                maxWidth: '240px'
              }}
            >
              <div
                className="shrink-0 rounded-full flex items-center justify-center text-white font-bold text-sm tabular-nums"
                style={{
                  width: BUBBLE_RADIUS * 2,
                  height: BUBBLE_RADIUS * 2,
                  background: `linear-gradient(135deg, ${rightColor}, ${rightColor}cc)`,
                  boxShadow: `0 3px 10px ${rightColor}59`,
                }}
              >
                {String(index + 1).padStart(2, '0')}
              </div>

              <div className="flex-1 text-right">
                {onStartEditLabel ? (
                  <EditableText
                    value={item.label || ""}
                    isEditing={isEditing && editingText?.field === `content-label-${globalIndex}`}
                    onStartEdit={() => onStartEditLabel(globalIndex)}
                    onChange={(val) => onUpdateLabel?.(globalIndex, val)}
                    onFinish={onFinishEditing || (() => {})}
                    className="font-semibold text-sm md:text-base leading-tight tracking-tight"
                    style={{ color: titleColor }}
                    isOwner={isOwner}
                    isHovered={isHovered}
                  />
                ) : (
                  <span
                    className="font-semibold text-sm md:text-base leading-tight tracking-tight"
                    style={{ color: titleColor }}
                  >
                    {item.label}
                  </span>
                )}
              </div>
            </ItemWrapper>
          );
        })}

      </div>
    </Container>
  );
}

// Styles 2-10: additional VS comparison treatments
function ExtendedComparison({
  layoutId,
  left,
  right,
  colors,
  className,
  isPresenting = false,
  animationKey,
  itemAnimation,
  revealCount,
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
  layoutId: string;
  left: ComparisonContentItem[];
  right: ComparisonContentItem[];
  colors: { leftColor: string; rightColor: string; titleColor: string; bodyColor: string; surface: string; border: string };
  className: string;
  isPresenting?: boolean;
  animationKey?: string;
  itemAnimation?: string;
  revealCount?: number;
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
  const { leftColor: LC, rightColor: RC, titleColor, bodyColor, surface, border } = colors;
  const Container = isPresenting ? motion.div : "div";
  const cProps = isPresenting
    ? { variants: containerVariantsFor(itemAnimation), initial: "hidden" as const, animate: "visible" as const }
    : {};
  const CItem = isPresenting ? motion.div : "div";
  const itemMotion = (i: number) => itemMotionProps(isPresenting, itemAnimation, revealCount, i);
  const pad2 = (k: number) => String(k).padStart(2, "0");
  const gL = (i: number) => i;
  const gR = (i: number) => left.length + i;

  const eLabel = (item: ComparisonContentItem, g: number, cls: string, style?: React.CSSProperties) =>
    item.label ? (
      onStartEditLabel ? (
        <EditableText value={item.label} isEditing={isEditing && editingText?.field === `content-label-${g}`}
          onStartEdit={() => onStartEditLabel(g)} onChange={(val) => onUpdateLabel?.(g, val)}
          onFinish={onFinishEditing || (() => {})} className={cls} style={{ color: titleColor, ...style }} isOwner={isOwner} isHovered={isHovered} />
      ) : (
        <h4 className={cls} style={{ color: titleColor, ...style }}>{item.label}</h4>
      )
    ) : null;
  const eText = (item: ComparisonContentItem, g: number, cls: string, style?: React.CSSProperties) =>
    item.text ? (
      onStartEditText ? (
        <EditableText value={item.text} isEditing={isEditing && editingText?.field === `content-text-${g}`}
          onStartEdit={() => onStartEditText(g)} onChange={(val) => onUpdateText?.(g, val)}
          onFinish={onFinishEditing || (() => {})} className={cls} style={{ color: bodyColor, ...style }} isOwner={isOwner} isHovered={isHovered} />
      ) : (
        <p className={cls} style={{ color: bodyColor, ...style }}>{item.text}</p>
      )
    ) : null;

  const badge = (n: number, color: string) => (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold text-white tabular-nums" style={{ background: `linear-gradient(135deg, ${color}, ${alpha(color, "cc")})` }}>{pad2(n)}</span>
  );
  const rows = (arr: ComparisonContentItem[], side: "l" | "r") =>
    arr.map((item, i) => {
      const g = side === "l" ? gL(i) : gR(i);
      return (
        <CItem key={i} className="flex items-start gap-3 min-w-0" {...itemMotion(g)}>
          {badge(i + 1, side === "l" ? LC : RC)}
          <div className="min-w-0 flex-1">{eLabel(item, g, "text-sm font-bold leading-tight")}{eText(item, g, "text-xs leading-snug break-words")}</div>
        </CItem>
      );
    });
  const head = (label: string, color: string) => (
    <div className="mb-3 inline-flex items-center gap-2 rounded-full px-3.5 py-1" style={{ background: alpha(color, "1a") }}>
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      <span className="text-sm font-extrabold uppercase tracking-wide" style={{ color }}>{label}</span>
    </div>
  );
  const vsBadge = (cls = "h-11 w-11 text-sm") => (
    <span className={`flex shrink-0 items-center justify-center rounded-full font-black text-white ${cls}`} style={{ background: `linear-gradient(135deg, ${LC}, ${RC})`, boxShadow: "0 6px 18px rgba(0,0,0,0.3)" }}>VS</span>
  );
  const frame = `w-full h-full flex flex-col justify-center px-6 ${className}`;

  // == STYLE-2: TWO COLUMNS
  if (layoutId === "comparison-style-2") {
    return (
      <Container className={frame} key={animationKey} {...cProps}>
        <div className="mx-auto flex w-full max-w-4xl items-stretch gap-5">
          <div className="flex-1">{head("A", LC)}<div className="flex flex-col gap-3">{rows(left, "l")}</div></div>
          <div className="flex items-center">{vsBadge()}</div>
          <div className="flex-1">{head("B", RC)}<div className="flex flex-col gap-3">{rows(right, "r")}</div></div>
        </div>
      </Container>
    );
  }

  // == STYLE-3: ROW FACE-OFF
  if (layoutId === "comparison-style-3") {
    const n = Math.max(left.length, right.length);
    return (
      <Container className={frame} key={animationKey} {...cProps}>
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-2.5">
          {Array.from({ length: n }).map((_, i) => (
            <div key={i} className="grid items-center gap-3" style={{ gridTemplateColumns: "1fr auto 1fr" }}>
              <CItem className="rounded-lg px-4 py-2.5 text-right min-w-0" style={{ background: alpha(LC, "12") }} {...itemMotion(gL(i))}>{left[i] && eLabel(left[i]!, gL(i), "text-sm font-bold leading-tight")}{left[i] && eText(left[i]!, gL(i), "text-xs leading-snug break-words")}</CItem>
              <span className="text-xs font-black" style={{ color: bodyColor }}>VS</span>
              <CItem className="rounded-lg px-4 py-2.5 min-w-0" style={{ background: alpha(RC, "12") }} {...itemMotion(gR(i))}>{right[i] && eLabel(right[i]!, gR(i), "text-sm font-bold leading-tight")}{right[i] && eText(right[i]!, gR(i), "text-xs leading-snug break-words")}</CItem>
            </div>
          ))}
        </div>
      </Container>
    );
  }

  // == STYLE-4: HEAD TO HEAD
  if (layoutId === "comparison-style-4") {
    const card = (arr: ComparisonContentItem[], side: "l" | "r", label: string, color: string) => (
      <div className="ppt-tile flex-1 rounded-2xl p-6" style={{ background: surface, border: `1px solid ${border}`, borderTop: `4px solid ${color}` }}>
        <div className="mb-3 text-lg font-black uppercase tracking-wide" style={{ color }}>{label}</div>
        <div className="flex flex-col gap-2.5">{rows(arr, side)}</div>
      </div>
    );
    return (
      <Container className={`relative ${frame}`} key={animationKey} {...cProps}>
        <div className="mx-auto flex w-full max-w-4xl items-center gap-4">
          {card(left, "l", "A", LC)}
          {vsBadge("h-14 w-14 text-base")}
          {card(right, "r", "B", RC)}
        </div>
      </Container>
    );
  }

  // == STYLE-5: CENTER SPINE
  if (layoutId === "comparison-style-5") {
    const n = Math.max(left.length, right.length);
    return (
      <Container className={frame} key={animationKey} {...cProps}>
        <div className="relative mx-auto w-full max-w-4xl">
          <div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 rounded-full" style={{ background: `linear-gradient(${LC}, ${RC})` }} aria-hidden />
          <div className="flex flex-col gap-3">
            {Array.from({ length: n }).map((_, i) => (
              <div key={i} className="grid items-center gap-4" style={{ gridTemplateColumns: "1fr auto 1fr" }}>
                <CItem className="flex flex-row-reverse items-start gap-2.5 text-right min-w-0" {...itemMotion(gL(i))}>{left[i] && badge(i + 1, LC)}<div className="min-w-0">{left[i] && eLabel(left[i]!, gL(i), "text-sm font-bold leading-tight")}</div></CItem>
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: bodyColor }} />
                <CItem className="flex items-start gap-2.5 min-w-0" {...itemMotion(gR(i))}>{right[i] && badge(i + 1, RC)}<div className="min-w-0">{right[i] && eLabel(right[i]!, gR(i), "text-sm font-bold leading-tight")}</div></CItem>
              </div>
            ))}
          </div>
        </div>
      </Container>
    );
  }

  // == STYLE-6: DIAGONAL SPLIT
  if (layoutId === "comparison-style-6") {
    return (
      <Container className={`relative w-full h-full flex items-center justify-center overflow-hidden ${className}`} key={animationKey} {...cProps}>
        <div className="absolute inset-0" style={{ background: alpha(LC, "14"), clipPath: "polygon(0 0, 60% 0, 40% 100%, 0 100%)" }} aria-hidden />
        <div className="absolute inset-0" style={{ background: alpha(RC, "14"), clipPath: "polygon(60% 0, 100% 0, 100% 100%, 40% 100%)" }} aria-hidden />
        <div className="relative grid w-full max-w-4xl grid-cols-2 gap-10 px-8">
          <div>{head("A", LC)}<div className="flex flex-col gap-2.5">{rows(left, "l")}</div></div>
          <div>{head("B", RC)}<div className="flex flex-col gap-2.5">{rows(right, "r")}</div></div>
        </div>
        {vsBadge("absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 h-12 w-12 text-sm")}
      </Container>
    );
  }

  // == STYLE-7: TINTED COLUMNS
  if (layoutId === "comparison-style-7") {
    return (
      <Container className={frame} key={animationKey} {...cProps}>
        <div className="mx-auto grid w-full max-w-4xl grid-cols-2 gap-5">
          <div className="rounded-2xl p-5" style={{ background: alpha(LC, "12"), border: `1px solid ${alpha(LC, "2e")}` }}>{head("A", LC)}<div className="flex flex-col gap-3">{rows(left, "l")}</div></div>
          <div className="rounded-2xl p-5" style={{ background: alpha(RC, "12"), border: `1px solid ${alpha(RC, "2e")}` }}>{head("B", RC)}<div className="flex flex-col gap-3">{rows(right, "r")}</div></div>
        </div>
      </Container>
    );
  }

  // == STYLE-8: BATTLE CARDS
  if (layoutId === "comparison-style-8") {
    const col = (arr: ComparisonContentItem[], side: "l" | "r", label: string, color: string) => (
      <div className="flex-1">
        <div className="mb-3 flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-white" style={{ background: `linear-gradient(135deg, ${color}, ${alpha(color, "cc")})` }}>
          <span className="text-lg font-black">{label}</span>
        </div>
        <div className="flex flex-col gap-2">
          {arr.map((item, i) => {
            const g = side === "l" ? gL(i) : gR(i);
            return (
              <CItem key={i} className="rounded-xl px-4 py-2.5 min-w-0" style={{ background: surface, border: `1px solid ${border}`, borderLeft: `3px solid ${color}` }} {...itemMotion(g)}>
                {eLabel(item, g, "text-sm font-bold leading-tight")}{eText(item, g, "text-xs leading-snug break-words")}
              </CItem>
            );
          })}
        </div>
      </div>
    );
    return (
      <Container className={frame} key={animationKey} {...cProps}>
        <div className="mx-auto flex w-full max-w-4xl gap-6">{col(left, "l", "A", LC)}{col(right, "r", "B", RC)}</div>
      </Container>
    );
  }

  // == STYLE-9: SCORECARD
  if (layoutId === "comparison-style-9") {
    const scoreRows = (arr: ComparisonContentItem[], side: "l" | "r", color: string) =>
      arr.map((item, i) => {
        const g = side === "l" ? gL(i) : gR(i);
        return (
          <CItem key={i} className="flex items-center gap-3 border-b py-2.5 min-w-0" style={{ borderColor: alpha(bodyColor, "1a") }} {...itemMotion(g)}>
            <span className="text-lg font-black tabular-nums" style={{ color }}>{i + 1}</span>
            <div className="min-w-0 flex-1">{eLabel(item, g, "text-sm font-bold leading-tight")}</div>
          </CItem>
        );
      });
    return (
      <Container className={frame} key={animationKey} {...cProps}>
        <div className="mx-auto grid w-full max-w-4xl grid-cols-2 gap-8">
          <div><div className="mb-1 text-sm font-extrabold uppercase tracking-wider" style={{ color: LC }}>Side A</div>{scoreRows(left, "l", LC)}</div>
          <div><div className="mb-1 text-sm font-extrabold uppercase tracking-wider" style={{ color: RC }}>Side B</div>{scoreRows(right, "r", RC)}</div>
        </div>
      </Container>
    );
  }

  // == STYLE-10: RIBBON VS
  if (layoutId === "comparison-style-10") {
    const banner = (label: string, color: string, side: "l" | "r") => (
      <div className="mb-3 flex items-center px-5 py-2 text-white" style={{ background: `linear-gradient(90deg, ${color}, ${alpha(color, "b3")})`, clipPath: side === "l" ? "polygon(0 0, 100% 0, 92% 100%, 0 100%)" : "polygon(8% 0, 100% 0, 100% 100%, 0 100%)" }}>
        <span className="text-base font-black uppercase tracking-wide">{label}</span>
      </div>
    );
    return (
      <Container className={frame} key={animationKey} {...cProps}>
        <div className="mx-auto grid w-full max-w-4xl grid-cols-2 gap-6">
          <div>{banner("Option A", LC, "l")}<div className="flex flex-col gap-3">{rows(left, "l")}</div></div>
          <div>{banner("Option B", RC, "r")}<div className="flex flex-col gap-3">{rows(right, "r")}</div></div>
        </div>
      </Container>
    );
  }

  return null;
}