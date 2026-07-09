"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Theme } from "~/lib/themes";
import type { BeforeAfterContentItem } from "~/lib/layouts/content/beforeafter";
import { splitBeforeAndAfter } from "~/lib/layouts/content/beforeafter";
import EditableText from "~/components/presentation/EditableText";
import { alpha } from "~/components/presentation/PremiumComponents";
import { containerVariantsFor, itemMotionProps } from "~/components/presentation/item-animations";

// --- Configuration ---
const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 500;
const CENTER_X = CANVAS_WIDTH / 2;
const CENTER_Y = CANVAS_HEIGHT / 2;
const HUB_RADIUS = 80; // Radius of the central white circle
const ITEM_RADIUS = 240; // Distance from center to item nodes

// --- Styles & Colors ---
interface ThemeStyles {
  beforeColor: string;
  afterColor: string;
  titleColor: string;
  bodyColor: string;
  hubBg: string;
  hubBorder: string;
  lineColor: string;
}

function getThemeStyles(theme?: Theme, accentColor?: string): ThemeStyles {
  const primaryColor = accentColor || theme?.colors.accent || "#f97316"; // Orange for before
  const secondaryColor = theme?.colors.secondary || theme?.colors.primary || "#14b8a6"; // Teal for after

  return {
    beforeColor: primaryColor,
    afterColor: secondaryColor,
    titleColor: theme?.colors.heading || "#1e293b",
    bodyColor: theme?.colors.textMuted || "#64748b",
    // Theme-aware hub + connectors (were hardcoded bg-white / #cbd5e1 — broke on dark themes)
    hubBg: theme?.cardBox?.background || theme?.colors.surface || "#ffffff",
    hubBorder: theme?.colors.border || "rgba(0,0,0,0.08)",
    lineColor: theme?.colors.border || "#cbd5e1",
  };
}

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

const itemVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.3 } },
};

interface BeforeAfterRendererProps {
  items: BeforeAfterContentItem[];
  theme?: Theme;
  accentColor?: string;
  className?: string;
  layoutId?: string;
  /** Concept shown in the central hub (defaults to the slide title). */
  centerText?: string;
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
}

export function BeforeAfterRenderer({
  items,
  theme,
  accentColor,
  className = "",
  layoutId,
  centerText,
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
}: BeforeAfterRendererProps) {
  const themeStyles = getThemeStyles(theme, accentColor);
  const { before, after } = splitBeforeAndAfter(items);

  // Limit to 6 items per side to maintain the visual arc
  const displayBefore = before.slice(0, 6);
  const displayAfter = after.slice(0, 6);

  if (layoutId && layoutId.startsWith("beforeafter-style-")) {
    return (
      <ExtendedBeforeAfter
        layoutId={layoutId}
        before={displayBefore}
        after={displayAfter}
        themeStyles={themeStyles}
        centerText={centerText}
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

  // Helper to calculate position on the arc
  // We want the items to span roughly 120 degrees vertically on each side
  const getPosition = (index: number, total: number, isLeft: boolean) => {
    // Angles in radians. 
    // Left side center is PI (180deg). We want to span from approx 240deg to 120deg (Top to Bottom)
    // Right side center is 0 (0deg). We want to span from approx 300deg (-60) to 60deg
    
    const spread = Math.PI * 0.65; // Total angle spread
    const startAngleLeft = Math.PI + (spread / 2); 
    const step = spread / (Math.max(total - 1, 1));
    
    let angle;
    if (isLeft) {
      // For left side, iterate top-down
      angle = startAngleLeft - (index * step);
    } else {
      // For right side, iterate top-down (which is negative angle to positive angle)
      const startAngleRight = -(spread / 2);
      angle = startAngleRight + (index * step);
    }

    return {
      x: CENTER_X + ITEM_RADIUS * Math.cos(angle),
      y: CENTER_Y + ITEM_RADIUS * Math.sin(angle),
      angle
    };
  };

  const Container = isPresenting ? motion.div : "div";
  const ItemWrapper = isPresenting ? motion.div : "div";

  return (
    <Container 
      className={`w-full max-w-[1000px] mx-auto py-4 relative ${className}`}
      variants={containerVariants}
      initial={isPresenting ? "hidden" : undefined}
      animate={isPresenting ? "visible" : undefined}
    >
      {/* Aspect Ratio Box to keep geometry intact */}
      <div className="relative w-full aspect-[16/9] md:aspect-[2/1] max-h-[600px]">
        
        {/* --- 1. SVG Layer for Connecting Lines --- */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none z-0" 
          viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
        >
          {/* Before Lines */}
          {displayBefore.map((_, i) => {
            const pos = getPosition(i, displayBefore.length, true);
            return (
              <line
                key={`line-before-${i}`}
                x1={pos.x}
                y1={pos.y}
                x2={CENTER_X}
                y2={CENTER_Y}
                stroke={themeStyles.lineColor}
                strokeWidth="2"
                strokeDasharray="6 4"
              />
            );
          })}
          {/* After Lines */}
          {displayAfter.map((_, i) => {
            const pos = getPosition(i, displayAfter.length, false);
            return (
              <line
                key={`line-after-${i}`}
                x1={pos.x}
                y1={pos.y}
                x2={CENTER_X}
                y2={CENTER_Y}
                stroke={themeStyles.lineColor}
                strokeWidth="2"
                strokeDasharray="6 4"
              />
            );
          })}
        </svg>


        {/* --- 2. Central Hub --- */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-2xl flex flex-col items-center justify-center z-20"
          style={{
            width: `${HUB_RADIUS * 2}px`,
            height: `${HUB_RADIUS * 2}px`,
            backgroundColor: themeStyles.hubBg,
            border: `1px solid ${themeStyles.hubBorder}`,
          }}
        >
          {/* Inner accent ring decoration */}
          <div
            className="absolute inset-2 rounded-full border"
            style={{ borderColor: `${themeStyles.beforeColor}2b` }}
          />

          <h2
            className="text-base md:text-xl font-black text-center leading-tight px-5 z-10 line-clamp-3 break-words"
            style={{ color: themeStyles.titleColor }}
          >
            {centerText?.trim() || "Before → After"}
          </h2>
        </div>
        
        {/* Headers */}
        <div className="absolute top-4 left-[25%] text-xl font-bold" style={{ color: themeStyles.beforeColor }}>Before</div>
        <div className="absolute top-4 right-[25%] text-xl font-bold" style={{ color: themeStyles.afterColor }}>After</div>


        {/* --- 3. Items Layer --- */}
        <div className="absolute inset-0 w-full h-full z-10">
          
          {/* Left Side (Before) */}
          {displayBefore.map((item, index) => {
            // Calculate pixel positions scaled to % for responsiveness
            const rawPos = getPosition(index, displayBefore.length, true);
            const leftPct = (rawPos.x / CANVAS_WIDTH) * 100;
            const topPct = (rawPos.y / CANVAS_HEIGHT) * 100;

            return (
              <ItemWrapper
                key={`before-${index}`}
                variants={itemVariants}
                className="absolute flex items-center justify-end gap-4 w-[250px]"
                style={{ 
                  left: `${leftPct}%`, 
                  top: `${topPct}%`,
                  transform: 'translate(-100%, -50%)', // Anchor right side of the wrapper to the point
                }}
              >
                {/* Text Label (Left aligned) */}
                <div className="flex flex-col items-end text-right">
                  {onStartEditLabel ? (
                    <EditableText
                      value={item.label || ""}
                      isEditing={isEditing && editingText?.field === `content-label-${index}`}
                      onStartEdit={() => onStartEditLabel(index)}
                      onChange={(val) => onUpdateLabel?.(index, val)}
                      onFinish={onFinishEditing || (() => {})}
                      className="font-medium text-sm md:text-base leading-tight"
                      style={{ color: themeStyles.titleColor }}
                      isOwner={isOwner}
                      isHovered={isHovered}
                    />
                  ) : (
                    <span
                      className="font-medium text-sm md:text-base leading-tight"
                      style={{ color: themeStyles.titleColor }}
                    >
                      {item.label}
                    </span>
                  )}
                </div>

                {/* Number Bubble (The Anchor) */}
                <div className="relative shrink-0 w-12 h-12 flex items-center justify-center">
                  {/* Outer Ring */}
                  <div 
                    className="absolute inset-0 rounded-full border-2 opacity-60" 
                    style={{ borderColor: themeStyles.beforeColor }} 
                  />
                  {/* Inner Gap - simulated by just sizing the inner circle down */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm tabular-nums"
                    style={{
                      background: `linear-gradient(135deg, ${themeStyles.beforeColor}, ${themeStyles.beforeColor}cc)`,
                      boxShadow: `0 3px 10px ${themeStyles.beforeColor}59`,
                    }}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </div>
                </div>
              </ItemWrapper>
            );
          })}

          {/* Right Side (After) */}
          {displayAfter.map((item, index) => {
            const rawPos = getPosition(index, displayAfter.length, false);
            const leftPct = (rawPos.x / CANVAS_WIDTH) * 100;
            const topPct = (rawPos.y / CANVAS_HEIGHT) * 100;
            const globalIndex = displayBefore.length + index;

            return (
              <ItemWrapper
                key={`after-${index}`}
                variants={itemVariants}
                className="absolute flex items-center justify-start gap-4 w-[250px]"
                style={{ 
                  left: `${leftPct}%`, 
                  top: `${topPct}%`,
                  transform: 'translate(0%, -50%)', // Anchor left side of the wrapper to the point
                }}
              >
                {/* Number Bubble (The Anchor) */}
                <div className="relative shrink-0 w-12 h-12 flex items-center justify-center">
                  {/* Outer Ring */}
                  <div 
                    className="absolute inset-0 rounded-full border-2 opacity-60" 
                    style={{ borderColor: themeStyles.afterColor }} 
                  />
                  {/* Inner Circle */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm tabular-nums"
                    style={{
                      background: `linear-gradient(135deg, ${themeStyles.afterColor}, ${themeStyles.afterColor}cc)`,
                      boxShadow: `0 3px 10px ${themeStyles.afterColor}59`,
                    }}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </div>
                </div>

                {/* Text Label (Right aligned) */}
                <div className="flex flex-col items-start text-left">
                   {onStartEditLabel ? (
                    <EditableText
                      value={item.label || ""}
                      isEditing={isEditing && editingText?.field === `content-label-${globalIndex}`}
                      onStartEdit={() => onStartEditLabel(globalIndex)}
                      onChange={(val) => onUpdateLabel?.(globalIndex, val)}
                      onFinish={onFinishEditing || (() => {})}
                      className="font-medium text-sm md:text-base leading-tight"
                      style={{ color: themeStyles.titleColor }}
                      isOwner={isOwner}
                      isHovered={isHovered}
                    />
                  ) : (
                    <span
                      className="font-medium text-sm md:text-base leading-tight"
                      style={{ color: themeStyles.titleColor }}
                    >
                      {item.label}
                    </span>
                  )}
                </div>
              </ItemWrapper>
            );
          })}
        </div>
      </div>
    </Container>
  );
}

// Styles 2-12: additional before/after treatments (panels, arrows, ledger, slider)
function ExtendedBeforeAfter({
  layoutId,
  before,
  after,
  themeStyles,
  centerText,
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
  before: BeforeAfterContentItem[];
  after: BeforeAfterContentItem[];
  themeStyles: ThemeStyles;
  centerText?: string;
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
  const beforeC = themeStyles.beforeColor;
  const afterC = themeStyles.afterColor;
  const titleColor = themeStyles.titleColor;
  const bodyColor = themeStyles.bodyColor;
  const surface = themeStyles.hubBg;
  const border = themeStyles.hubBorder;

  const Container = isPresenting ? motion.div : "div";
  const cProps = isPresenting
    ? { variants: containerVariantsFor(itemAnimation), initial: "hidden" as const, animate: "visible" as const }
    : {};
  const CItem = isPresenting ? motion.div : "div";
  const itemMotion = (i: number) => itemMotionProps(isPresenting, itemAnimation, revealCount, i);
  const pad2 = (k: number) => String(k).padStart(2, "0");
  const gB = (i: number) => i;
  const gA = (i: number) => before.length + i;

  const eLabel = (item: BeforeAfterContentItem, g: number, cls: string, style?: React.CSSProperties) =>
    onStartEditLabel ? (
      <EditableText value={item.label || ""} isEditing={isEditing && editingText?.field === `content-label-${g}`}
        onStartEdit={() => onStartEditLabel(g)} onChange={(val) => onUpdateLabel?.(g, val)}
        onFinish={onFinishEditing || (() => {})} className={cls} style={{ color: titleColor, ...style }} isOwner={isOwner} isHovered={isHovered} />
    ) : (
      <span className={cls} style={{ color: titleColor, ...style }}>{item.label}</span>
    );
  const eText = (item: BeforeAfterContentItem, g: number, cls: string, style?: React.CSSProperties) =>
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
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-white tabular-nums" style={{ background: `linear-gradient(135deg, ${color}, ${alpha(color, "cc")})` }}>{pad2(n)}</span>
  );
  const rows = (arr: BeforeAfterContentItem[], side: "b" | "a") =>
    arr.map((item, i) => {
      const g = side === "b" ? gB(i) : gA(i);
      return (
        <CItem key={i} className="flex items-start gap-3 min-w-0" style={{}} {...itemMotion(g)}>
          {badge(i + 1, side === "b" ? beforeC : afterC)}
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

  const frame = `w-full h-full flex flex-col justify-center px-6 ${className}`;

  // == STYLE-2: SPLIT PANEL
  if (layoutId === "beforeafter-style-2") {
    return (
      <Container className={`relative w-full h-full flex items-center justify-center gap-4 px-6 ${className}`} key={animationKey} {...cProps}>
        <div className="flex-1 self-stretch rounded-2xl p-6" style={{ background: alpha(bodyColor, "12"), border: `1px solid ${border}` }}>
          {head("Before", beforeC)}
          <div className="flex flex-col gap-3">{rows(before, "b")}</div>
        </div>
        <span className="shrink-0 text-3xl font-black" style={{ color: afterC }} aria-hidden>→</span>
        <div className="flex-1 self-stretch rounded-2xl p-6" style={{ background: alpha(afterC, "14"), border: `1px solid ${alpha(afterC, "33")}` }}>
          {head("After", afterC)}
          <div className="flex flex-col gap-3">{rows(after, "a")}</div>
        </div>
      </Container>
    );
  }

  // == STYLE-3: ARROW TRANSFORM
  if (layoutId === "beforeafter-style-3") {
    return (
      <Container className={`w-full h-full flex items-center justify-center gap-5 px-6 ${className}`} key={animationKey} {...cProps}>
        <div className="flex-1"><div className="mb-3 text-sm font-extrabold uppercase tracking-wider" style={{ color: beforeC }}>Before</div><div className="flex flex-col gap-3">{rows(before, "b")}</div></div>
        <div className="flex shrink-0 flex-col items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full text-2xl text-white" style={{ background: `linear-gradient(135deg, ${beforeC}, ${afterC})`, boxShadow: "0 6px 18px rgba(0,0,0,0.25)" }}>→</div>
        </div>
        <div className="flex-1"><div className="mb-3 text-sm font-extrabold uppercase tracking-wider" style={{ color: afterC }}>After</div><div className="flex flex-col gap-3">{rows(after, "a")}</div></div>
      </Container>
    );
  }

  // == STYLE-4: TWO COLUMNS
  if (layoutId === "beforeafter-style-4") {
    return (
      <Container className={frame} key={animationKey} {...cProps}>
        <div className="mx-auto grid w-full max-w-4xl grid-cols-2 gap-8">
          <div>{head("Before", beforeC)}<div className="flex flex-col gap-3">{rows(before, "b")}</div></div>
          <div>{head("After", afterC)}<div className="flex flex-col gap-3">{rows(after, "a")}</div></div>
        </div>
      </Container>
    );
  }

  // == STYLE-5: LEDGER ROWS
  if (layoutId === "beforeafter-style-5") {
    const n = Math.max(before.length, after.length);
    return (
      <Container className={frame} key={animationKey} {...cProps}>
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-2">
          {Array.from({ length: n }).map((_, i) => (
            <div key={i} className="grid items-center gap-3 border-b py-2.5" style={{ gridTemplateColumns: "1fr auto 1fr", borderColor: alpha(bodyColor, "1a") }}>
              <div className="min-w-0 text-right">{before[i] && eLabel(before[i]!, gB(i), "text-sm font-bold leading-tight", { color: beforeC })}{before[i] && eText(before[i]!, gB(i), "text-xs leading-snug break-words")}</div>
              <span className="text-lg" style={{ color: afterC }} aria-hidden>→</span>
              <div className="min-w-0">{after[i] && eLabel(after[i]!, gA(i), "text-sm font-bold leading-tight", { color: afterC })}{after[i] && eText(after[i]!, gA(i), "text-xs leading-snug break-words")}</div>
            </div>
          ))}
        </div>
      </Container>
    );
  }

  // == STYLE-6: DIAGONAL SPLIT
  if (layoutId === "beforeafter-style-6") {
    return (
      <Container className={`relative w-full h-full flex items-center justify-center overflow-hidden ${className}`} key={animationKey} {...cProps}>
        <div className="absolute inset-0" style={{ background: alpha(beforeC, "12"), clipPath: "polygon(0 0, 60% 0, 40% 100%, 0 100%)" }} aria-hidden />
        <div className="absolute inset-0" style={{ background: alpha(afterC, "14"), clipPath: "polygon(60% 0, 100% 0, 100% 100%, 40% 100%)" }} aria-hidden />
        <div className="relative grid w-full max-w-4xl grid-cols-2 gap-10 px-8">
          <div>{head("Before", beforeC)}<div className="flex flex-col gap-2.5">{rows(before, "b")}</div></div>
          <div>{head("After", afterC)}<div className="flex flex-col gap-2.5">{rows(after, "a")}</div></div>
        </div>
      </Container>
    );
  }

  // == STYLE-7: METRIC DELTAS
  if (layoutId === "beforeafter-style-7") {
    const n = Math.max(before.length, after.length);
    return (
      <Container className={frame} key={animationKey} {...cProps}>
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
          {Array.from({ length: n }).map((_, i) => (
            <CItem key={i} className="flex items-center gap-4 rounded-xl px-5 py-3" style={{ background: surface, border: `1px solid ${border}` }} {...itemMotion(before[i] ? gB(i) : gA(i))}>
              <div className="min-w-0 flex-1 text-right">{before[i] && eLabel(before[i]!, gB(i), "text-base font-bold leading-tight", { color: beforeC })}</div>
              <span className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-extrabold text-white" style={{ background: afterC }}>→</span>
              <div className="min-w-0 flex-1">{after[i] && eLabel(after[i]!, gA(i), "text-base font-bold leading-tight", { color: afterC })}</div>
            </CItem>
          ))}
        </div>
      </Container>
    );
  }

  // == STYLE-8: STACKED COMPARE
  if (layoutId === "beforeafter-style-8") {
    const n = Math.max(before.length, after.length);
    const cols = n <= 2 ? n || 1 : n <= 4 ? 2 : 3;
    return (
      <Container className={frame} key={animationKey} {...cProps}>
        <div className="mx-auto grid w-full max-w-4xl gap-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {Array.from({ length: n }).map((_, i) => (
            <CItem key={i} className="flex flex-col gap-1.5" {...itemMotion(before[i] ? gB(i) : gA(i))}>
              <div className="rounded-lg px-3.5 py-2 opacity-70" style={{ background: alpha(bodyColor, "14"), border: `1px solid ${border}` }}>
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: beforeC }}>Before</span>
                {before[i] && eLabel(before[i]!, gB(i), "text-xs font-semibold leading-tight")}
              </div>
              <span className="mx-auto text-sm" style={{ color: afterC }} aria-hidden>↓</span>
              <div className="rounded-lg px-3.5 py-2" style={{ background: alpha(afterC, "17"), border: `1px solid ${alpha(afterC, "40")}` }}>
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: afterC }}>After</span>
                {after[i] && eLabel(after[i]!, gA(i), "text-xs font-bold leading-tight")}
              </div>
            </CItem>
          ))}
        </div>
      </Container>
    );
  }

  // == STYLE-9: SLIDER
  if (layoutId === "beforeafter-style-9") {
    return (
      <Container className={`relative w-full h-full flex items-center justify-center ${className}`} key={animationKey} {...cProps}>
        <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl" style={{ minHeight: "16rem", border: `1px solid ${border}` }}>
          <div className="absolute inset-0" style={{ background: alpha(beforeC, "10") }} />
          <div className="absolute inset-y-0 left-1/2 right-0" style={{ background: alpha(afterC, "14") }} />
          <div className="absolute inset-y-0 left-1/2 w-1 -translate-x-1/2" style={{ background: `linear-gradient(${beforeC}, ${afterC})` }} />
          <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white text-xs font-black text-white" style={{ background: `linear-gradient(135deg, ${beforeC}, ${afterC})`, boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}>⇆</div>
          <div className="relative grid h-full grid-cols-2 gap-8 p-6" style={{ minHeight: "16rem" }}>
            <div>{head("Before", beforeC)}<div className="flex flex-col gap-2.5">{rows(before, "b")}</div></div>
            <div className="pl-4">{head("After", afterC)}<div className="flex flex-col gap-2.5">{rows(after, "a")}</div></div>
          </div>
        </div>
      </Container>
    );
  }

  // == STYLE-10: TIMELINE TRANSFORM
  if (layoutId === "beforeafter-style-10") {
    return (
      <Container className={frame} key={animationKey} {...cProps}>
        <div className="mx-auto w-full max-w-4xl">
          <div className="relative mb-5 flex items-center justify-between">
            <span className="rounded-full px-4 py-1.5 text-sm font-extrabold text-white" style={{ background: beforeC }}>Before</span>
            <div className="mx-3 h-0.5 flex-1 rounded-full" style={{ background: `linear-gradient(90deg, ${beforeC}, ${afterC})` }} />
            <span className="max-w-[30%] truncate rounded-full px-3 py-1 text-xs font-bold" style={{ background: surface, border: `1px solid ${border}`, color: titleColor }}>{centerText?.trim() || "Transform"}</span>
            <div className="mx-3 h-0.5 flex-1 rounded-full" style={{ background: `linear-gradient(90deg, ${beforeC}, ${afterC})` }} />
            <span className="rounded-full px-4 py-1.5 text-sm font-extrabold text-white" style={{ background: afterC }}>After</span>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="flex flex-col gap-2.5">{rows(before, "b")}</div>
            <div className="flex flex-col gap-2.5">{rows(after, "a")}</div>
          </div>
        </div>
      </Container>
    );
  }

  // == STYLE-11: MIRROR SPLIT
  if (layoutId === "beforeafter-style-11") {
    return (
      <Container className={`relative w-full h-full flex items-stretch justify-center gap-0 ${className}`} key={animationKey} {...cProps}>
        <div className="flex flex-1 flex-col justify-center gap-2.5 py-6 pr-6 text-right">
          <div className="ml-auto">{head("Before", beforeC)}</div>
          {before.map((item, i) => (
            <CItem key={i} className="flex flex-row-reverse items-start gap-3 min-w-0" {...itemMotion(gB(i))}>
              {badge(i + 1, beforeC)}
              <div className="min-w-0 flex-1">{eLabel(item, gB(i), "text-sm font-bold leading-tight")}{eText(item, gB(i), "text-xs leading-snug break-words")}</div>
            </CItem>
          ))}
        </div>
        <div className="w-px self-stretch" style={{ background: `linear-gradient(${beforeC}, ${afterC})` }} />
        <div className="flex flex-1 flex-col justify-center gap-2.5 py-6 pl-6">
          {head("After", afterC)}
          {after.map((item, i) => (
            <CItem key={i} className="flex items-start gap-3 min-w-0" {...itemMotion(gA(i))}>
              {badge(i + 1, afterC)}
              <div className="min-w-0 flex-1">{eLabel(item, gA(i), "text-sm font-bold leading-tight")}{eText(item, gA(i), "text-xs leading-snug break-words")}</div>
            </CItem>
          ))}
        </div>
      </Container>
    );
  }

  // == STYLE-12: TOGGLE CARDS
  if (layoutId === "beforeafter-style-12") {
    return (
      <Container className={frame} key={animationKey} {...cProps}>
        <div className="mx-auto grid w-full max-w-4xl grid-cols-2 gap-6">
          <div>
            <div className="mb-3 text-sm font-extrabold uppercase tracking-wider opacity-70" style={{ color: beforeC }}>Before</div>
            <div className="flex flex-col gap-2.5">
              {before.map((item, i) => (
                <CItem key={i} className="rounded-xl px-4 py-2.5 min-w-0 opacity-70" style={{ background: alpha(bodyColor, "10"), border: `1px dashed ${border}` }} {...itemMotion(gB(i))}>
                  {eLabel(item, gB(i), "text-sm font-semibold leading-tight")}{eText(item, gB(i), "text-xs leading-snug break-words")}
                </CItem>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-3 text-sm font-extrabold uppercase tracking-wider" style={{ color: afterC }}>After</div>
            <div className="flex flex-col gap-2.5">
              {after.map((item, i) => (
                <CItem key={i} className="rounded-xl px-4 py-2.5 min-w-0" style={{ background: `linear-gradient(135deg, ${alpha(afterC, "24")}, ${alpha(afterC, "0d")})`, border: `1px solid ${alpha(afterC, "40")}`, boxShadow: `0 4px 14px ${alpha(afterC, "1a")}` }} {...itemMotion(gA(i))}>
                  {eLabel(item, gA(i), "text-sm font-bold leading-tight")}{eText(item, gA(i), "text-xs leading-snug break-words")}
                </CItem>
              ))}
            </div>
          </div>
        </div>
      </Container>
    );
  }

  return null;
}