"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Theme } from "~/lib/themes";
import type { BoxContentItem } from "~/lib/layouts/content/boxes";
import EditableText from "~/components/presentation/EditableText";
import { alpha } from "~/components/presentation/PremiumComponents";
import { containerVariantsFor, itemMotionProps } from "~/components/presentation/item-animations";

// Animation variants (subtle entrance, only used while presenting)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  },
};

interface CycleDiagramRendererProps {
  items: BoxContentItem[];
  theme?: Theme;
  accentColor?: string;
  className?: string;
  layoutId?: string;
  isPresenting?: boolean;
  animationKey?: string;
  itemAnimation?: string;
  revealCount?: number;
  // Editing props
  isEditing?: boolean;
  editingText?: { field: string; bulletIndex?: number } | null;
  onStartEditLabel?: (index: number) => void;
  onStartEditText?: (index: number) => void;
  onUpdateLabel?: (index: number, value: string) => void;
  onUpdateText?: (index: number, value: string) => void;
  onFinishEditing?: () => void;
  onDeleteItem?: (index: number) => void;
  isOwner?: boolean;
  isHovered?: boolean;
  spotlightIndex?: number;
  isSpotlightMode?: boolean;
}

export function CycleDiagramRenderer({
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
  onDeleteItem,
  isOwner = false,
  isHovered = false,
  spotlightIndex,
  isSpotlightMode = false,
}: CycleDiagramRendererProps) {
  const displayItems = items.slice(0, 6); // Cap nodes at 6
  const itemCount = displayItems.length;

  // Defensive color resolution
  const titleColor = theme?.colors.heading || "#1e293b";
  const bodyColor = theme?.colors.textMuted || "#64748b";
  const accent =
    accentColor ||
    theme?.colors.accent ||
    theme?.colors.primary ||
    "#6366f1";
  const cardBg =
    theme?.cardBox?.background ||
    theme?.colors.surface ||
    "rgba(255,255,255,0.06)";
  const border = theme?.colors.border || "rgba(0,0,0,0.1)";

  // Radius of the cycle, as a percentage of the bounded container. Kept modest
  // so the top/bottom nodes (which wrap their full text and are absolutely
  // positioned — invisible to the canvas shrink-to-fit) stay inside the box.
  const R = 34; // percent

  const getSpotlightStyle = (index: number): React.CSSProperties => {
    if (!isSpotlightMode || spotlightIndex === undefined) return {};
    const isHighlighted = spotlightIndex === index;
    return {
      opacity: isHighlighted ? 1 : 0.3,
      transition: "all 0.4s ease-out",
    };
  };

  const Container = isPresenting ? motion.div : "div";
  const containerProps = isPresenting
    ? {
        variants: containerVariants,
        initial: "hidden",
        animate: "visible",
      }
    : {};

  // ---- Shared bits for the added styles (2-12) ----
  const pad2 = (n: number) => String(n).padStart(2, "0");
  const CItem = isPresenting ? motion.div : "div";
  const cProps = isPresenting
    ? { variants: containerVariantsFor(itemAnimation), initial: "hidden" as const, animate: "visible" as const }
    : {};
  const itemMotion = (i: number) => itemMotionProps(isPresenting, itemAnimation, revealCount, i);

  const editLabel = (item: BoxContentItem, index: number, cls: string, style?: React.CSSProperties) =>
    item.label ? (
      onStartEditLabel ? (
        <EditableText
          value={item.label}
          isEditing={isEditing && editingText?.field === `content-label-${index}`}
          onStartEdit={() => onStartEditLabel(index)}
          onChange={(val) => onUpdateLabel?.(index, val)}
          onFinish={onFinishEditing || (() => {})}
          onDelete={onDeleteItem ? () => onDeleteItem(index) : undefined}
          className={cls}
          style={{ color: titleColor, ...style }}
          isOwner={isOwner}
          isHovered={isHovered}
        />
      ) : (
        <h3 className={cls} style={{ color: titleColor, ...style }}>{item.label}</h3>
      )
    ) : null;

  const editText = (item: BoxContentItem, index: number, cls: string, style?: React.CSSProperties) =>
    onStartEditText ? (
      <EditableText
        value={item.text}
        isEditing={isEditing && editingText?.field === `content-text-${index}`}
        onStartEdit={() => onStartEditText(index)}
        onChange={(val) => onUpdateText?.(index, val)}
        onFinish={onFinishEditing || (() => {})}
        onDelete={onDeleteItem ? () => onDeleteItem(index) : undefined}
        className={cls}
        style={{ color: bodyColor, ...style }}
        isOwner={isOwner}
        isHovered={isHovered}
      />
    ) : (
      <p className={cls} style={{ color: bodyColor, ...style }}>{item.text}</p>
    );

  // Point on the (stretched) ring at a given angle, in 0-100 viewBox space
  const P = (deg: number, rx: number, ry: number) => ({
    x: 50 + rx * Math.cos((deg * Math.PI) / 180),
    y: 50 + ry * Math.sin((deg * Math.PI) / 180),
  });
  const arcPath = (a0: number, a1: number, rx: number, ry: number) => {
    const s = P(a0, rx, ry);
    const e = P(a1, rx, ry);
    const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${rx} ${ry} 0 ${large} 1 ${e.x} ${e.y}`;
  };
  const shade = (i: number, n: number) =>
    `color-mix(in srgb, ${accent} ${100 - (n > 1 ? (i / (n - 1)) * 45 : 0)}%, #0b1220 ${n > 1 ? (i / (n - 1)) * 45 : 0}%)`;
  // Node block: number chip + label + text, centered at a ring position
  const nodeBlock = (item: BoxContentItem, index: number, leftPct: number, topPct: number, w = "9rem") => (
    <CItem
      key={index}
      className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center"
      style={{ left: `${leftPct}%`, top: `${topPct}%`, width: w, ...getSpotlightStyle(index) }}
      {...itemMotion(index)}
    >
      <div
        className="mb-1.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white tabular-nums"
        style={{ background: `linear-gradient(135deg, ${accent}, ${alpha(accent, "cc")})`, boxShadow: `0 0 0 4px ${alpha(accent, "1a")}` }}
      >
        {index + 1}
      </div>
      {editLabel(item, index, "text-sm font-bold leading-tight")}
      {editText(item, index, "mt-0.5 text-xs leading-snug break-words")}
    </CItem>
  );

  // == CYCLE-STYLE-2: SEGMENT RING — bold colored arc segments form the loop
  if (layoutId === "cycle-style-2") {
    const sItems = displayItems;
    const n = sItems.length;
    const span = 360 / n;
    return (
      <Container className={`w-full h-full flex items-center justify-center ${className}`} key={animationKey} {...cProps}>
        <div className="relative w-full max-w-3xl aspect-[16/9] mx-auto">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
            {sItems.map((_, i) => {
              const a0 = -90 + i * span + 9;
              const a1 = -90 + (i + 1) * span - 9;
              return <path key={i} d={arcPath(a0, a1, 34, 34)} fill="none" stroke={shade(i, n)} strokeWidth={5.5} strokeLinecap="round" opacity={0.9} />;
            })}
          </svg>
          {sItems.map((item, index) => {
            const mid = -90 + index * span + span / 2;
            const pos = P(mid, 34, 34);
            return nodeBlock(item, index, pos.x, pos.y);
          })}
        </div>
      </Container>
    );
  }

  // == CYCLE-STYLE-3: STADIUM TRACK — cards docked around a rounded racetrack
  if (layoutId === "cycle-style-3") {
    const sItems = displayItems;
    const n = sItems.length;
    return (
      <Container className={`w-full h-full flex items-center justify-center ${className}`} key={animationKey} {...cProps}>
        <div className="relative w-full max-w-3xl aspect-[16/9] mx-auto">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
            <rect x={12} y={22} width={76} height={56} rx={22} fill="none" stroke={accent} strokeWidth={0.7} strokeDasharray="2.5 2" opacity={0.45} />
            <g transform="translate(50 22)"><polygon points="-2.2,-1.6 2.2,0 -2.2,1.6" fill={accent} opacity={0.6} /></g>
            <g transform="translate(50 78)"><polygon points="2.2,-1.6 -2.2,0 2.2,1.6" fill={accent} opacity={0.6} /></g>
          </svg>
          {sItems.map((item, index) => {
            const angle = -90 + (index * 360) / n;
            const pos = P(angle, 38, 28);
            return (
              <CItem
                key={index}
                className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-xl px-3.5 py-2.5 text-center"
                style={{ left: `${pos.x}%`, top: `${pos.y}%`, width: "10rem", backgroundColor: cardBg, border: `1px solid ${border}`, boxShadow: "0 4px 14px rgba(0,0,0,0.08)", ...getSpotlightStyle(index) }}
                {...itemMotion(index)}
              >
                <span className="mb-1 font-mono text-[10px] font-bold tracking-[0.18em]" style={{ color: accent }}>{pad2(index + 1)}</span>
                {editLabel(item, index, "text-[13px] font-bold leading-tight")}
                {editText(item, index, "mt-0.5 text-[11px] leading-snug break-words")}
              </CItem>
            );
          })}
        </div>
      </Container>
    );
  }

  // == CYCLE-STYLE-4: CHEVRON RING — nodes with chevrons circling between
  if (layoutId === "cycle-style-4") {
    const sItems = displayItems;
    const n = sItems.length;
    return (
      <Container className={`w-full h-full flex items-center justify-center ${className}`} key={animationKey} {...cProps}>
        <div className="relative w-full max-w-3xl aspect-[16/9] mx-auto">
          {sItems.map((_, index) => {
            if (n < 2) return null;
            const mid = -90 + ((index + 0.5) * 360) / n;
            const pos = P(mid, 34, 34);
            return (
              <span
                key={`c${index}`}
                className="absolute -translate-x-1/2 -translate-y-1/2 text-2xl font-bold leading-none"
                style={{ left: `${pos.x}%`, top: `${pos.y}%`, color: alpha(accent, "73"), transform: `translate(-50%,-50%) rotate(${mid + 90}deg)` }}
                aria-hidden
              >
                ›
              </span>
            );
          })}
          {sItems.map((item, index) => {
            const pos = P(-90 + (index * 360) / n, 34, 34);
            return nodeBlock(item, index, pos.x, pos.y, "8.5rem");
          })}
        </div>
      </Container>
    );
  }

  // == CYCLE-STYLE-5: SPLIT CYCLE — mini ring left, numbered content right
  if (layoutId === "cycle-style-5") {
    const sItems = displayItems;
    const n = sItems.length;
    return (
      <Container className={`w-full h-full flex items-center justify-center gap-8 px-4 ${className}`} key={animationKey} {...cProps}>
        <div className="relative aspect-square w-2/5 max-w-[230px] shrink-0 self-center">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
            <circle cx={50} cy={50} r={33} fill="none" stroke={accent} strokeWidth={1} strokeDasharray="3 2.4" opacity={0.5} />
            <circle cx={50} cy={50} r={22} fill="none" stroke={accent} strokeWidth={0.4} opacity={0.2} />
            {/* Clockwise arrowheads between the dots — this is what makes it a loop */}
            {sItems.map((_, i) => {
              const m = -90 + ((i + 0.5) * 360) / n;
              const pos = P(m, 33, 33);
              return (
                <g key={i} transform={`translate(${pos.x} ${pos.y}) rotate(${m + 90})`} opacity={0.65}>
                  <polygon points="0,-2 3,0 0,2" fill={accent} />
                </g>
              );
            })}
          </svg>
          {/* Center cue indicating the repeating cycle */}
          <div
            className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
            style={{ width: "2.5rem", height: "2.5rem", backgroundColor: cardBg, border: `1px solid ${border}`, color: accent }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M21 12a9 9 0 1 1-2.64-6.36" />
              <polyline points="21 3 21 9 15 9" />
            </svg>
          </div>
          {sItems.map((_, index) => {
            const pos = P(-90 + (index * 360) / n, 33, 33);
            return (
              <span
                key={index}
                className="absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-xs font-extrabold tabular-nums text-white"
                style={{ left: `${pos.x}%`, top: `${pos.y}%`, background: `linear-gradient(135deg, ${accent}, ${alpha(accent, "cc")})`, boxShadow: `0 0 0 3px ${alpha(accent, "1f")}` }}
              >
                {index + 1}
              </span>
            );
          })}
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-3">
          {sItems.map((item, index) => (
            <CItem key={index} className="flex items-start gap-3 min-w-0" style={getSpotlightStyle(index)} {...itemMotion(index)}>
              <span className="mt-0.5 shrink-0 font-mono text-xs font-bold tabular-nums" style={{ color: accent }}>{pad2(index + 1)}</span>
              <div className="min-w-0 border-l pl-3" style={{ borderColor: alpha(accent, "33") }}>
                {editLabel(item, index, "text-sm font-bold tracking-tight", { textAlign: "left" })}
                {editText(item, index, "mt-0.5 text-xs leading-snug break-words", { textAlign: "left" })}
              </div>
            </CItem>
          ))}
        </div>
      </Container>
    );
  }

  // == CYCLE-STYLE-6: INFINITY LOOP — nodes riding a figure-eight
  if (layoutId === "cycle-style-6") {
    const sItems = items.slice(0, 5);
    const n = sItems.length;
    return (
      <Container className={`w-full h-full flex items-center justify-center ${className}`} key={animationKey} {...cProps}>
        <div className="relative w-full max-w-3xl aspect-[16/9] mx-auto">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
            <path
              d="M 50 50 C 42 28, 16 28, 16 50 C 16 72, 42 72, 50 50 C 58 28, 84 28, 84 50 C 84 72, 58 72, 50 50"
              fill="none"
              stroke={accent}
              strokeWidth={1}
              strokeDasharray="2.6 2"
              opacity={0.5}
            />
          </svg>
          {sItems.map((item, index) => {
            const t = (index * 2 * Math.PI) / n;
            const x = 50 + 32 * Math.cos(t);
            const y = 50 + 21 * Math.sin(2 * t);
            return nodeBlock(item, index, x, y, "8.5rem");
          })}
        </div>
      </Container>
    );
  }

  // == CYCLE-STYLE-7: CLOCK FACE — tick ring with a sweeping accent hand
  if (layoutId === "cycle-style-7") {
    const sItems = displayItems;
    const n = sItems.length;
    const hand = P(-90, 20, 20);
    return (
      <Container className={`w-full h-full flex items-center justify-center ${className}`} key={animationKey} {...cProps}>
        <div className="relative w-full max-w-3xl aspect-[16/9] mx-auto">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
            <circle cx={50} cy={50} r={34} fill="none" stroke={border} strokeWidth={0.8} opacity={0.8} />
            {Array.from({ length: 12 }, (_, i) => {
              const a = i * 30;
              const o = P(a, 34, 34);
              const inn = P(a, 31, 31);
              return <line key={i} x1={inn.x} y1={inn.y} x2={o.x} y2={o.y} stroke={accent} strokeWidth={0.7} opacity={0.35} />;
            })}
            <line x1={50} y1={50} x2={hand.x} y2={hand.y} stroke={accent} strokeWidth={1.4} strokeLinecap="round" opacity={0.75} />
            <circle cx={50} cy={50} r={2.2} fill={accent} />
            {/* Clockwise sweep cue at the hand tip */}
            <path d={arcPath(-150, -104, 14, 14)} fill="none" stroke={accent} strokeWidth={1} strokeLinecap="round" opacity={0.55} />
            <g transform={`translate(${P(-104, 14, 14).x} ${P(-104, 14, 14).y}) rotate(${-104 + 90})`} opacity={0.7}>
              <polygon points="0,-1.7 2.6,0 0,1.7" fill={accent} />
            </g>
            {/* Clockwise arrowheads between the stages on the dial */}
            {sItems.map((_, i) => {
              const m = -90 + ((i + 0.5) * 360) / n;
              const pos = P(m, 34, 34);
              return (
                <g key={`a${i}`} transform={`translate(${pos.x} ${pos.y}) rotate(${m + 90})`} opacity={0.6}>
                  <polygon points="0,-1.8 2.8,0 0,1.8" fill={accent} />
                </g>
              );
            })}
          </svg>
          {sItems.map((item, index) => {
            const pos = P(-90 + (index * 360) / n, 34, 34);
            return nodeBlock(item, index, pos.x, pos.y, "8.5rem");
          })}
        </div>
      </Container>
    );
  }

  // == CYCLE-STYLE-8: RECYCLE TRIAD — triangular loop with corner arrows
  if (layoutId === "cycle-style-8") {
    const sItems = items.slice(0, 4);
    const n = sItems.length;
    return (
      <Container className={`w-full h-full flex items-center justify-center ${className}`} key={animationKey} {...cProps}>
        <div className="relative w-full max-w-3xl aspect-[16/9] mx-auto">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
            {sItems.map((_, i) => {
              const a0 = -90 + (i * 360) / n + 16;
              const a1 = -90 + ((i + 1) * 360) / n - 16;
              const e = P(a1, 33, 33);
              return (
                <g key={i}>
                  <path d={arcPath(a0, a1, 33, 33)} fill="none" stroke={accent} strokeWidth={1.6} strokeLinecap="round" opacity={0.55} />
                  <g transform={`translate(${e.x} ${e.y}) rotate(${a1 + 90})`}>
                    <polygon points="0,-2 3,0 0,2" fill={accent} opacity={0.75} />
                  </g>
                </g>
              );
            })}
          </svg>
          {sItems.map((item, index) => {
            const pos = P(-90 + (index * 360) / n, 33, 33);
            return nodeBlock(item, index, pos.x, pos.y);
          })}
        </div>
      </Container>
    );
  }

  // == CYCLE-STYLE-9: MOMENTUM SPIRAL — nodes growing along an outward spiral,
  // with a return arc closing the loop (each pass builds momentum)
  if (layoutId === "cycle-style-9") {
    const sItems = items.slice(0, 5);
    const pts = sItems.map((_, i) => {
      const a = -150 + i * 84;
      const r = 11 + i * 6.2;
      return { ...P(a, r, r), a, r };
    });
    // Point + direction (deg) along a quadratic curve, for placing arrowheads
    type Pt = { x: number; y: number };
    const qAt = (p: Pt, c: Pt, q: Pt, t: number): Pt => ({
      x: (1 - t) * (1 - t) * p.x + 2 * t * (1 - t) * c.x + t * t * q.x,
      y: (1 - t) * (1 - t) * p.y + 2 * t * (1 - t) * c.y + t * t * q.y,
    });
    const qDir = (p: Pt, c: Pt, q: Pt, t: number): number =>
      (Math.atan2(
        2 * (1 - t) * (c.y - p.y) + 2 * t * (q.y - c.y),
        2 * (1 - t) * (c.x - p.x) + 2 * t * (q.x - c.x),
      ) * 180) / Math.PI;
    // Return arc: from the last (largest) node clockwise back to the first
    const first = pts[0]!;
    const last = pts[pts.length - 1]!;
    const retMidA = (last.a + first.a + 360) / 2;
    const retR = Math.min(Math.max(last.r * 1.28, 22), 46);
    const retC = P(retMidA, retR, retR);
    return (
      <Container className={`w-full h-full flex items-center justify-center ${className}`} key={animationKey} {...cProps}>
        <div className="relative w-full max-w-3xl aspect-[16/9] mx-auto">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
            {pts.slice(0, -1).map((p, i) => {
              const q = pts[i + 1]!;
              const midA = (p.a + q.a) / 2;
              const midR = ((p.r + q.r) / 2) * 1.18;
              const c = P(midA, midR, midR);
              const tip = qAt(p, c, q, 0.8);
              const dir = qDir(p, c, q, 0.8);
              return (
                <g key={i}>
                  <path d={`M ${p.x} ${p.y} Q ${c.x} ${c.y} ${q.x} ${q.y}`} fill="none" stroke={accent} strokeWidth={0.9} strokeDasharray="2.2 1.8" opacity={0.5} />
                  <g transform={`translate(${tip.x} ${tip.y}) rotate(${dir})`} opacity={0.65}>
                    <polygon points="0,-1.7 2.6,0 0,1.7" fill={accent} />
                  </g>
                </g>
              );
            })}
            {pts.length >= 2 && (
              <g>
                <path d={`M ${last.x} ${last.y} Q ${retC.x} ${retC.y} ${first.x} ${first.y}`} fill="none" stroke={accent} strokeWidth={1.1} strokeLinecap="round" opacity={0.55} />
                <g
                  transform={`translate(${qAt(last, retC, first, 0.88).x} ${qAt(last, retC, first, 0.88).y}) rotate(${qDir(last, retC, first, 0.88)})`}
                  opacity={0.75}
                >
                  <polygon points="0,-1.9 2.9,0 0,1.9" fill={accent} />
                </g>
              </g>
            )}
          </svg>
          {sItems.map((item, index) => {
            const p = pts[index]!;
            const size = 2 + index * 0.35;
            return (
              <CItem
                key={index}
                className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center"
                style={{ left: `${p.x}%`, top: `${p.y}%`, width: "8.5rem", ...getSpotlightStyle(index) }}
                {...itemMotion(index)}
              >
                <div
                  className="mb-1.5 flex flex-shrink-0 items-center justify-center rounded-full font-bold text-white tabular-nums"
                  style={{ width: `${size}rem`, height: `${size}rem`, fontSize: `${0.72 + index * 0.06}rem`, background: `linear-gradient(135deg, ${accent}, ${alpha(accent, "cc")})`, boxShadow: `0 0 0 4px ${alpha(accent, "17")}` }}
                >
                  {index + 1}
                </div>
                {editLabel(item, index, "text-[13px] font-bold leading-tight")}
                {editText(item, index, "mt-0.5 text-[11px] leading-snug break-words")}
              </CItem>
            );
          })}
        </div>
      </Container>
    );
  }

  // == CYCLE-STYLE-10: DIAL GAUGE — half-donut segments + legend below
  if (layoutId === "cycle-style-10") {
    const sItems = items.slice(0, 5);
    const n = sItems.length;
    const span = 180 / n;
    const needleA = 180 + span / 2;
    const needle = P(needleA, 24, 42);
    return (
      <Container className={`w-full h-full flex flex-col justify-center ${className}`} key={animationKey} {...cProps}>
        <div className="relative mx-auto w-3/5 max-w-[440px] aspect-[100/58]">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 58" preserveAspectRatio="none" aria-hidden>
            {sItems.map((_, i) => {
              const a0 = 180 + i * span + 3;
              const a1 = 180 + (i + 1) * span - 3;
              const s = { x: 50 + 40 * Math.cos((a0 * Math.PI) / 180), y: 54 + 46 * Math.sin((a0 * Math.PI) / 180) };
              const e = { x: 50 + 40 * Math.cos((a1 * Math.PI) / 180), y: 54 + 46 * Math.sin((a1 * Math.PI) / 180) };
              return <path key={i} d={`M ${s.x} ${s.y} A 40 46 0 0 1 ${e.x} ${e.y}`} fill="none" stroke={shade(i, n)} strokeWidth={8} strokeLinecap="round" opacity={0.92} />;
            })}
            <line x1={50} y1={54} x2={50 + 26 * Math.cos((needleA * Math.PI) / 180)} y2={54 + 30 * Math.sin((needleA * Math.PI) / 180)} stroke={accent} strokeWidth={1.6} strokeLinecap="round" />
            <circle cx={50} cy={54} r={3} fill={accent} />
          </svg>
          {sItems.map((_, i) => {
            const mid = 180 + i * span + span / 2;
            const x = 50 + 40 * Math.cos((mid * Math.PI) / 180);
            const y = (54 + 46 * Math.sin((mid * Math.PI) / 180)) * (100 / 58);
            return (
              <span key={i} className="absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[10px] font-extrabold tabular-nums text-white" style={{ left: `${x}%`, top: `${y}%`, background: shade(i, n), boxShadow: "0 1px 4px rgba(0,0,0,0.25)" }}>
                {i + 1}
              </span>
            );
          })}
        </div>
        <div className="mx-auto mt-4 grid w-full gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(n, 5)}, minmax(0, 1fr))` }}>
          {sItems.map((item, index) => (
            <CItem key={index} className="min-w-0 text-center" style={getSpotlightStyle(index)} {...itemMotion(index)}>
              <span className="mx-auto mb-1 block h-1.5 w-8 rounded-full" style={{ background: shade(index, n) }} aria-hidden />
              {editLabel(item, index, "text-xs font-bold leading-tight")}
              {editText(item, index, "mt-0.5 text-[11px] leading-snug break-words")}
            </CItem>
          ))}
        </div>
      </Container>
    );
  }

  // == CYCLE-STYLE-11: LOOP TIMELINE — flattened loop, out along the top, back along the bottom
  if (layoutId === "cycle-style-11") {
    const sItems = displayItems;
    const split = Math.ceil(sItems.length / 2);
    const topRow = sItems.slice(0, split);
    const bottomRow = sItems.slice(split);
    const card = (item: BoxContentItem, index: number) => (
      <CItem
        key={index}
        className="min-w-0 flex-1 rounded-xl px-3.5 py-2.5 text-center"
        style={{ backgroundColor: cardBg, border: `1px solid ${border}`, ...getSpotlightStyle(index) }}
        {...itemMotion(index)}
      >
        <span className="font-mono text-[10px] font-bold tracking-[0.18em]" style={{ color: accent }}>{pad2(index + 1)}</span>
        {editLabel(item, index, "mt-0.5 text-[13px] font-bold leading-tight")}
        {editText(item, index, "mt-0.5 text-[11px] leading-snug break-words")}
      </CItem>
    );
    return (
      <Container className={`w-full h-full flex flex-col justify-center gap-3 px-6 ${className}`} key={animationKey} {...cProps}>
        <div className="relative px-5">
          <div className="flex items-stretch gap-2">
            {topRow.map((item, i) => (
              <React.Fragment key={i}>
                {card(item, i)}
                {i < topRow.length - 1 && <span className="self-center text-xl font-bold" style={{ color: alpha(accent, "73") }} aria-hidden>›</span>}
              </React.Fragment>
            ))}
          </div>
          {bottomRow.length > 0 && (
            <>
              <div className="mt-3 flex flex-row-reverse items-stretch gap-2">
                {bottomRow.map((item, i) => (
                  <React.Fragment key={i}>
                    {card(item, split + i)}
                    {i < bottomRow.length - 1 && <span className="self-center text-xl font-bold" style={{ color: alpha(accent, "73") }} aria-hidden>‹</span>}
                  </React.Fragment>
                ))}
              </div>
              {/* Loop-closing rails: the right descends into the bottom row,
                  the left returns up to the top row — this closes the cycle.
                  Drawn with flex + fixed-size arrowheads so nothing stretches
                  or clips (the old external U-turn SVGs collapsed on auto-height). */}
              <div aria-hidden className="pointer-events-none absolute right-0 top-2 bottom-2 flex w-3 flex-col items-center justify-end">
                <div className="w-[3px] flex-1 rounded-full" style={{ background: alpha(accent, "3d") }} />
                <svg width="12" height="9" viewBox="0 0 12 9" className="-mt-px block"><polygon points="6,9 0,0 12,0" fill={accent} /></svg>
              </div>
              <div aria-hidden className="pointer-events-none absolute left-0 top-2 bottom-2 flex w-3 flex-col items-center justify-start">
                <svg width="12" height="9" viewBox="0 0 12 9" className="-mb-px block"><polygon points="6,0 0,9 12,9" fill={accent} /></svg>
                <div className="w-[3px] flex-1 rounded-full" style={{ background: alpha(accent, "59") }} />
              </div>
            </>
          )}
        </div>
      </Container>
    );
  }

  // == CYCLE-STYLE-12: CLASSIC CYCLE — glowing gradient nodes + arc arrows
  if (layoutId === "cycle-style-12") {
    const sItems = displayItems;
    const n = sItems.length;
    const span = 360 / n;
    return (
      <Container className={`w-full h-full flex items-center justify-center ${className}`} key={animationKey} {...cProps}>
        <div className="relative w-full max-w-3xl aspect-[16/9] mx-auto">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
            {sItems.map((_, i) => {
              if (n < 2) return null;
              const a0 = -90 + i * span + 14;
              const a1 = -90 + (i + 1) * span - 14;
              const e = P(a1, 33, 33);
              return (
                <g key={i}>
                  <path d={arcPath(a0, a1, 33, 33)} fill="none" stroke={alpha(accent, "59")} strokeWidth={1.2} strokeLinecap="round" />
                  <g transform={`translate(${e.x} ${e.y}) rotate(${a1 + 90})`}>
                    <polygon points="0,-1.7 2.6,0 0,1.7" fill={accent} opacity={0.7} />
                  </g>
                </g>
              );
            })}
          </svg>
          {sItems.map((item, index) => {
            const pos = P(-90 + index * span, 33, 33);
            return (
              <CItem
                key={index}
                className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center"
                style={{ left: `${pos.x}%`, top: `${pos.y}%`, width: "9rem", ...getSpotlightStyle(index) }}
                {...itemMotion(index)}
              >
                <div
                  className="mb-1.5 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-base font-extrabold text-white tabular-nums"
                  style={{ background: `linear-gradient(135deg, ${accent}, ${alpha(accent, "b3")})`, boxShadow: `0 0 0 5px ${alpha(accent, "1a")}, 0 6px 16px ${alpha(accent, "4d")}` }}
                >
                  {item.icon || index + 1}
                </div>
                {editLabel(item, index, "text-sm font-bold leading-tight")}
                {editText(item, index, "mt-0.5 text-xs leading-snug break-words")}
              </CItem>
            );
          })}
        </div>
      </Container>
    );
  }

  // Arrowheads suggesting clockwise direction along the loop.
  const arrowAngles = itemCount > 1 ? [45, 135, 225, 315] : [];

  return (
    <Container
      className={`w-full h-full flex items-center justify-center ${className}`}
      key={animationKey} {...containerProps}
    >
      <div className="relative w-full max-w-3xl aspect-[16/9] mx-auto">
        {/* The cycle ring + directional arrowheads (behind the nodes) */}
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <circle
            cx={50}
            cy={50}
            r={R}
            fill="none"
            stroke={accent}
            strokeWidth={0.5}
            strokeDasharray="2 1.5"
            opacity={0.4}
          />
          {arrowAngles.map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const cx = 50 + R * Math.cos(rad);
            const cy = 50 + R * Math.sin(rad);
            // Tangent direction for a clockwise loop is +90deg from the radius.
            const tangent = deg + 90;
            return (
              <g
                key={deg}
                transform={`translate(${cx} ${cy}) rotate(${tangent})`}
                opacity={0.5}
              >
                <polygon points="0,-1.6 2.4,0 0,1.6" fill={accent} />
              </g>
            );
          })}
        </svg>

        {/* Center cue indicating the repeating cycle */}
        <div
          className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
          style={{
            width: "3.5rem",
            height: "3.5rem",
            backgroundColor: cardBg,
            border: `1px solid ${border}`,
            color: accent,
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 12a9 9 0 1 1-2.64-6.36" />
            <polyline points="21 3 21 9 15 9" />
          </svg>
        </div>

        {/* Nodes evenly spaced around the circle */}
        {displayItems.map((item, index) => {
          const angle = -90 + (index * 360) / itemCount;
          const rad = (angle * Math.PI) / 180;
          const left = 50 + R * Math.cos(rad);
          const top = 50 + R * Math.sin(rad);

          const ItemWrapper = isPresenting ? motion.div : "div";
          const variantsProps = isPresenting ? { variants: itemVariants } : {};

          return (
            <ItemWrapper
              key={index}
              className="absolute flex w-36 -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                ...getSpotlightStyle(index),
              }}
              {...variantsProps}
            >
              {/* Numbered accent circle (gradient + glow ring) */}
              <div
                className="mb-1.5 flex flex-shrink-0 items-center justify-center rounded-full font-bold text-white tabular-nums"
                style={{
                  width: "2.5rem",
                  height: "2.5rem",
                  background: `linear-gradient(135deg, ${accent}, ${alpha(accent, "cc")})`,
                  boxShadow: `0 0 0 4px ${alpha(accent, "1a")}, 0 3px 10px ${alpha(accent, "4d")}`,
                }}
              >
                {index + 1}
              </div>

              {/* Label */}
              {item.label &&
                (onStartEditLabel ? (
                  <EditableText
                    value={item.label}
                    isEditing={
                      isEditing &&
                      editingText?.field === `content-label-${index}`
                    }
                    onStartEdit={() => onStartEditLabel(index)}
                    onChange={(val) => onUpdateLabel?.(index, val)}
                    onFinish={onFinishEditing || (() => {})}
                    onDelete={onDeleteItem ? () => onDeleteItem(index) : undefined}
                    className="text-sm font-bold leading-tight"
                    style={{ color: titleColor }}
                    isOwner={isOwner}
                    isHovered={isHovered}
                  />
                ) : (
                  <h3
                    className="text-sm font-bold leading-tight"
                    style={{ color: titleColor }}
                  >
                    {item.label}
                  </h3>
                ))}

              {/* Short description (clamped to 2 lines) */}
              {onStartEditText ? (
                <EditableText
                  value={item.text}
                  isEditing={
                    isEditing && editingText?.field === `content-text-${index}`
                  }
                  onStartEdit={() => onStartEditText(index)}
                  onChange={(val) => onUpdateText?.(index, val)}
                  onFinish={onFinishEditing || (() => {})}
                  onDelete={onDeleteItem ? () => onDeleteItem(index) : undefined}
                  className="mt-0.5 text-xs leading-snug break-words"
                  style={{ color: bodyColor }}
                  isOwner={isOwner}
                  isHovered={isHovered}
                />
              ) : (
                <p
                  className="mt-0.5 text-xs leading-snug break-words"
                  style={{ color: bodyColor }}
                >
                  {item.text}
                </p>
              )}
            </ItemWrapper>
          );
        })}
      </div>
    </Container>
  );
}
