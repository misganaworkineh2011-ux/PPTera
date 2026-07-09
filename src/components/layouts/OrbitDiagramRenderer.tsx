"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Theme } from "~/lib/themes";
import type { BoxContentItem } from "~/lib/layouts/content/boxes";
import type { OrbitLayoutType } from "~/lib/layouts/content/orbit";
import EditableText from "~/components/presentation/EditableText";
import { alpha } from "~/components/presentation/PremiumComponents";
import { SLIDE_FRAME } from "./tile";
import { containerVariantsFor, itemMotionProps } from "~/components/presentation/item-animations";

// Animation variants (subtle entrance, gated on isPresenting)
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
    scale: 0.94,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  },
};

interface OrbitDiagramRendererProps {
  layoutId?: OrbitLayoutType;
  items: BoxContentItem[];
  theme?: Theme;
  accentColor?: string;
  /** Concept shown in the hub of the rings variant (defaults to slide title). */
  centerText?: string;
  className?: string;
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

export function OrbitDiagramRenderer({
  layoutId = "orbit-rings",
  items,
  theme,
  accentColor,
  centerText,
  className = "",
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
}: OrbitDiagramRendererProps) {
  // Defensive color fallbacks
  const titleColor = theme?.colors.heading || "#1e293b";
  const bodyColor = theme?.colors.textMuted || "#64748b";
  const accent =
    accentColor || theme?.colors.accent || theme?.colors.primary || "#6366f1";

  const getSpotlightStyle = (index: number): React.CSSProperties => {
    if (!isSpotlightMode || spotlightIndex === undefined) return {};
    const isHighlighted = spotlightIndex === index;
    return {
      opacity: isHighlighted ? 1 : 0.3,
      transition: "all 0.4s ease-out",
    };
  };

  const renderLabel = (
    item: BoxContentItem,
    index: number,
    labelClass: string,
    labelStyle: React.CSSProperties,
  ) => {
    if (!item.label) return null;
    return onStartEditLabel ? (
      <EditableText
        value={item.label}
        isEditing={isEditing && editingText?.field === `content-label-${index}`}
        onStartEdit={() => onStartEditLabel(index)}
        onChange={(val) => onUpdateLabel?.(index, val)}
        onFinish={onFinishEditing || (() => {})}
        onDelete={onDeleteItem ? () => onDeleteItem(index) : undefined}
        className={labelClass}
        style={labelStyle}
        isOwner={isOwner}
        isHovered={isHovered}
      />
    ) : (
      <h3 className={labelClass} style={labelStyle}>
        {item.label}
      </h3>
    );
  };

  const renderText = (
    item: BoxContentItem,
    index: number,
    textClass: string,
    textStyle: React.CSSProperties,
  ) => {
    return onStartEditText ? (
      <EditableText
        value={item.text}
        isEditing={isEditing && editingText?.field === `content-text-${index}`}
        onStartEdit={() => onStartEditText(index)}
        onChange={(val) => onUpdateText?.(index, val)}
        onFinish={onFinishEditing || (() => {})}
        onDelete={onDeleteItem ? () => onDeleteItem(index) : undefined}
        className={textClass}
        style={textStyle}
        isOwner={isOwner}
        isHovered={isHovered}
      />
    ) : (
      <p className={textClass} style={textStyle}>
        {item.text}
      </p>
    );
  };

  const Container = isPresenting ? motion.div : "div";
  const containerProps = isPresenting
    ? {
        variants: containerVariants,
        initial: "hidden" as const,
        animate: "visible" as const,
      }
    : {};
  const ItemWrapper = isPresenting ? motion.div : "div";
  const variantsProps = isPresenting ? { variants: itemVariants } : {};

  // ---- Shared bits for the added styles (5-12) ----
  const CItem = isPresenting ? motion.div : "div";
  const cProps = isPresenting
    ? { variants: containerVariantsFor(itemAnimation), initial: "hidden" as const, animate: "visible" as const }
    : {};
  const itemMotion = (i: number) => itemMotionProps(isPresenting, itemAnimation, revealCount, i);
  const pos = (k: number, count: number, rx: number, ry: number, off = -90) => {
    const a = (off + (k * 360) / Math.max(count, 1)) * (Math.PI / 180);
    return { left: 50 + rx * Math.cos(a), top: 50 + ry * Math.sin(a) };
  };
  const core = centerText?.trim() || "Core";
  const coreNode = (size: string) => (
    <div className="absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-center" style={{ width: size, height: size, background: `linear-gradient(135deg, ${accent}, ${alpha(accent, "cc")})`, boxShadow: `0 6px 18px ${alpha(accent, "40")}` }}>
      <span className="px-2 text-xs font-bold leading-tight text-white line-clamp-3 break-words">{core}</span>
    </div>
  );
  const nodeContent = (item: BoxContentItem, index: number) => (
    <>
      {renderLabel(item, index, "text-sm font-bold tracking-tight", { color: titleColor })}
      {renderText(item, index, "mt-0.5 text-xs leading-snug break-words", { color: bodyColor })}
    </>
  );
  const shadeO = (i: number, n: number) => `color-mix(in srgb, ${accent} ${100 - (n > 1 ? (i / (n - 1)) * 45 : 0)}%, #0b1220 ${n > 1 ? (i / (n - 1)) * 45 : 0}%)`;

  /* -------------------- orbit-style-5: SATELLITES ------------------------- */
  if (layoutId === "orbit-style-5") {
    const its = items.slice(0, 6); const n = its.length;
    const sp = its.map((_, k) => pos(k, n, 40, 32));
    return (
      <Container className={`${SLIDE_FRAME} flex items-center justify-center ${className}`} key={animationKey} {...cProps}>
        <div className="relative w-full max-w-3xl aspect-[16/9] mx-auto">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
            <ellipse cx={50} cy={50} rx={40} ry={32} fill="none" stroke={alpha(accent, "33")} strokeWidth={0.6} strokeDasharray="2 1.6" />
          </svg>
          {its.map((item, k) => {
            const p = sp[k]!;
            return (
              <CItem key={k} className="absolute flex w-32 -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center" style={{ left: `${p.left}%`, top: `${p.top}%`, ...getSpotlightStyle(k) }} {...itemMotion(k)}>
                <span className="mb-1 h-4 w-4 rounded-full" style={{ background: accent, boxShadow: `0 0 0 4px ${alpha(accent, "1f")}` }} />
                {nodeContent(item, k)}
              </CItem>
            );
          })}
          {coreNode("5.5rem")}
        </div>
      </Container>
    );
  }

  /* -------------------- orbit-style-6: SOLAR SYSTEM ----------------------- */
  if (layoutId === "orbit-style-6") {
    const its = items.slice(0, 5); const n = its.length;
    return (
      <Container className={`${SLIDE_FRAME} flex items-center justify-center ${className}`} key={animationKey} {...cProps}>
        <div className="relative w-full max-w-3xl aspect-[16/9] mx-auto">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
            {its.map((_, k) => { const r = 10 + ((k + 1) * 34) / n; return <ellipse key={k} cx={50} cy={50} rx={r * 1.35} ry={r} fill="none" stroke={alpha(accent, "33")} strokeWidth={0.5} />; })}
          </svg>
          {its.map((item, k) => {
            const r = 10 + ((k + 1) * 34) / n; const a = (-90 + k * 55) * (Math.PI / 180);
            const left = 50 + r * 1.35 * Math.cos(a), top = 50 + r * Math.sin(a);
            return (
              <CItem key={k} className="absolute flex w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center" style={{ left: `${left}%`, top: `${top}%`, ...getSpotlightStyle(k) }} {...itemMotion(k)}>
                <span className="mb-1 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-extrabold text-white" style={{ background: shadeO(k, n) }}>{k + 1}</span>
                {renderLabel(item, k, "text-[11px] font-bold leading-tight", { color: titleColor })}
              </CItem>
            );
          })}
          {coreNode("4.5rem")}
        </div>
      </Container>
    );
  }

  /* -------------------- orbit-style-7: MOLECULE --------------------------- */
  if (layoutId === "orbit-style-7") {
    const its = items.slice(0, 6); const n = its.length;
    const sp = its.map((_, k) => pos(k, n, 38, 33));
    return (
      <Container className={`${SLIDE_FRAME} flex items-center justify-center ${className}`} key={animationKey} {...cProps}>
        <div className="relative w-full max-w-3xl aspect-[16/9] mx-auto">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
            {sp.map((p, k) => <line key={k} x1={50} y1={50} x2={p.left} y2={p.top} stroke={alpha(accent, "59")} strokeWidth={0.8} />)}
          </svg>
          {its.map((item, k) => {
            const p = sp[k]!;
            return (
              <CItem key={k} className="absolute flex w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center" style={{ left: `${p.left}%`, top: `${p.top}%`, ...getSpotlightStyle(k) }} {...itemMotion(k)}>
                <span className="mb-1 flex h-9 w-9 items-center justify-center rounded-full text-xs font-extrabold text-white" style={{ background: `radial-gradient(circle at 35% 30%, ${alpha(accent, "e6")}, ${accent})` }}>{item.icon || k + 1}</span>
                {renderLabel(item, k, "text-[11px] font-bold leading-tight", { color: titleColor })}
              </CItem>
            );
          })}
          <div className="absolute left-1/2 top-1/2 z-10 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full" style={{ background: `radial-gradient(circle, ${accent}, ${alpha(accent, "99")})`, boxShadow: `0 0 20px ${alpha(accent, "66")}` }} />
        </div>
      </Container>
    );
  }

  /* -------------------- orbit-style-8: GAUGE ORBIT ------------------------ */
  if (layoutId === "orbit-style-8") {
    const its = items.slice(0, 5); const n = its.length; const span = 180 / n;
    return (
      <Container className={`${SLIDE_FRAME} flex flex-col items-center justify-center ${className}`} key={animationKey} {...cProps}>
        <div className="relative mx-auto w-3/5 max-w-md aspect-[100/58]">
          <svg viewBox="0 0 100 58" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
            {its.map((_, i) => {
              const a0 = 180 + i * span + 3, a1 = 180 + (i + 1) * span - 3;
              const s = { x: 50 + 42 * Math.cos((a0 * Math.PI) / 180), y: 54 + 48 * Math.sin((a0 * Math.PI) / 180) };
              const e = { x: 50 + 42 * Math.cos((a1 * Math.PI) / 180), y: 54 + 48 * Math.sin((a1 * Math.PI) / 180) };
              return <path key={i} d={`M ${s.x} ${s.y} A 42 48 0 0 1 ${e.x} ${e.y}`} fill="none" stroke={shadeO(i, n)} strokeWidth={9} strokeLinecap="round" />;
            })}
          </svg>
          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs font-bold" style={{ color: accent }}>{core}</span>
        </div>
        <div className="mt-4 grid w-full max-w-2xl gap-3 px-4" style={{ gridTemplateColumns: `repeat(${Math.min(n, 5)}, minmax(0, 1fr))` }}>
          {its.map((item, k) => (
            <CItem key={k} className="text-center min-w-0" style={getSpotlightStyle(k)} {...itemMotion(k)}>
              <span className="mx-auto mb-1 block h-1.5 w-8 rounded-full" style={{ background: shadeO(k, n) }} />
              {renderLabel(item, k, "text-xs font-bold leading-tight", { color: titleColor })}
              {renderText(item, k, "mt-0.5 text-[11px] leading-snug break-words", { color: bodyColor })}
            </CItem>
          ))}
        </div>
      </Container>
    );
  }

  /* -------------------- orbit-style-9: RADAR ------------------------------ */
  if (layoutId === "orbit-style-9") {
    const its = items.slice(0, 6); const n = its.length;
    const sp = its.map((_, k) => pos(k, n, 30 + (k % 2) * 8, 28 + (k % 2) * 6));
    return (
      <Container className={`${SLIDE_FRAME} flex items-center justify-center ${className}`} key={animationKey} {...cProps}>
        <div className="relative w-full max-w-3xl aspect-[16/9] mx-auto">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
            {[14, 26, 38].map((r, i) => <ellipse key={i} cx={50} cy={50} rx={r * 1.3} ry={r} fill="none" stroke={alpha(accent, "26")} strokeWidth={0.5} />)}
            {its.map((p, k) => { const q = sp[k]!; return <line key={k} x1={50} y1={50} x2={q.left} y2={q.top} stroke={alpha(accent, "26")} strokeWidth={0.4} />; })}
          </svg>
          {its.map((item, k) => {
            const p = sp[k]!;
            return (
              <CItem key={k} className="absolute flex w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center" style={{ left: `${p.left}%`, top: `${p.top}%`, ...getSpotlightStyle(k) }} {...itemMotion(k)}>
                <span className="mb-1 h-3 w-3 rounded-full" style={{ background: accent, boxShadow: `0 0 8px ${accent}` }} />
                {renderLabel(item, k, "text-[11px] font-bold leading-tight", { color: titleColor })}
              </CItem>
            );
          })}
        </div>
      </Container>
    );
  }

  /* -------------------- orbit-style-10: HALO ------------------------------ */
  if (layoutId === "orbit-style-10") {
    const its = items.slice(0, 6); const n = its.length;
    const sp = its.map((_, k) => pos(k, n, 41, 33));
    return (
      <Container className={`${SLIDE_FRAME} flex items-center justify-center ${className}`} key={animationKey} {...cProps}>
        <div className="relative w-full max-w-3xl aspect-[16/9] mx-auto">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
            <ellipse cx={50} cy={50} rx={41} ry={33} fill="none" stroke={alpha(accent, "40")} strokeWidth={6} style={{ filter: "blur(2px)" }} opacity={0.5} />
          </svg>
          {its.map((item, k) => {
            const p = sp[k]!;
            return (
              <CItem key={k} className="absolute flex w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center" style={{ left: `${p.left}%`, top: `${p.top}%`, ...getSpotlightStyle(k) }} {...itemMotion(k)}>
                <span className="mb-1 flex h-8 w-8 items-center justify-center rounded-full text-xs font-extrabold text-white" style={{ background: accent, boxShadow: `0 0 14px ${alpha(accent, "80")}` }}>{item.icon || k + 1}</span>
                {renderLabel(item, k, "text-[11px] font-bold leading-tight", { color: titleColor })}
              </CItem>
            );
          })}
          {coreNode("5rem")}
        </div>
      </Container>
    );
  }

  /* -------------------- orbit-style-11: CONSTELLATION -------------------- */
  if (layoutId === "orbit-style-11") {
    const its = items.slice(0, 6); const n = its.length;
    const sp = its.map((_, k) => pos(k, n, 40, 32, -110 + k * 8));
    const path = sp.map((p, k) => `${k === 0 ? "M" : "L"} ${p.left} ${p.top}`).join(" ");
    return (
      <Container className={`${SLIDE_FRAME} flex items-center justify-center ${className}`} key={animationKey} {...cProps}>
        <div className="relative w-full max-w-3xl aspect-[16/9] mx-auto">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
            <path d={path} fill="none" stroke={alpha(accent, "59")} strokeWidth={0.6} strokeDasharray="1.5 1.5" />
          </svg>
          {its.map((item, k) => {
            const p = sp[k]!;
            return (
              <CItem key={k} className="absolute flex w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center" style={{ left: `${p.left}%`, top: `${p.top}%`, ...getSpotlightStyle(k) }} {...itemMotion(k)}>
                <span className="mb-1 text-lg leading-none" style={{ color: accent }}>✦</span>
                {renderLabel(item, k, "text-[11px] font-bold leading-tight", { color: titleColor })}
                {renderText(item, k, "text-[10px] leading-snug break-words", { color: bodyColor })}
              </CItem>
            );
          })}
        </div>
      </Container>
    );
  }

  /* -------------------- orbit-style-12: NUCLEUS -------------------------- */
  if (layoutId === "orbit-style-12") {
    const its = items.slice(0, 6); const n = its.length;
    const sp = its.map((_, k) => pos(k, n, 38, 33));
    return (
      <Container className={`${SLIDE_FRAME} flex items-center justify-center ${className}`} key={animationKey} {...cProps}>
        <div className="relative w-full max-w-3xl aspect-[16/9] mx-auto">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
            {[0, 60, 120].map((rot, i) => <ellipse key={i} cx={50} cy={50} rx={40} ry={16} fill="none" stroke={alpha(accent, "40")} strokeWidth={0.7} transform={`rotate(${rot} 50 50)`} />)}
          </svg>
          {its.map((item, k) => {
            const p = sp[k]!;
            return (
              <CItem key={k} className="absolute flex w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center" style={{ left: `${p.left}%`, top: `${p.top}%`, ...getSpotlightStyle(k) }} {...itemMotion(k)}>
                <span className="mb-1 h-3.5 w-3.5 rounded-full" style={{ background: accent, boxShadow: `0 0 0 3px ${alpha(accent, "26")}` }} />
                {renderLabel(item, k, "text-[11px] font-bold leading-tight", { color: titleColor })}
              </CItem>
            );
          })}
          <div className="absolute left-1/2 top-1/2 z-10 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: `radial-gradient(circle, ${accent}, ${alpha(accent, "99")})`, boxShadow: `0 0 18px ${alpha(accent, "66")}` }} />
        </div>
      </Container>
    );
  }

  /* -------------------- orbit-rings (center + cardinal callouts) ----------- */
  if (layoutId === "orbit-rings") {
    const displayItems = items.slice(0, 4);
    const [top, right, bottom, left] = [
      displayItems[0],
      displayItems[1],
      displayItems[2],
      displayItems[3],
    ];
    const ringSize = 200;
    const ringAlphas = ["2e", "4d", "73"];

    const callout = (
      item: BoxContentItem | undefined,
      index: number,
      align: "center" | "left" | "right",
    ) =>
      item ? (
        <ItemWrapper
          className={`max-w-[200px] ${
            align === "center"
              ? "mx-auto text-center"
              : align === "right"
                ? "ml-auto text-right"
                : "text-left"
          }`}
          style={getSpotlightStyle(index)}
          {...variantsProps}
        >
          {renderLabel(item, index, "text-sm font-bold tracking-tight", {
            color: titleColor,
          })}
          {renderText(item, index, "mt-0.5 text-xs leading-snug break-words", {
            color: bodyColor,
          })}
        </ItemWrapper>
      ) : (
        <div />
      );

    return (
      <Container
        className={`${SLIDE_FRAME} flex items-center justify-center ${className}`}
        key={animationKey} {...containerProps}
      >
        <div
          className="grid items-center gap-x-6 gap-y-3"
          style={{ gridTemplateColumns: "1fr auto 1fr" }}
        >
          <div />
          {callout(top, 0, "center")}
          <div />
          {callout(left, 3, "right")}
          <div className="relative" style={{ width: ringSize, height: ringSize }}>
            {ringAlphas.map((a, ri) => (
              <div
                key={ri}
                className="absolute rounded-full"
                style={{
                  inset: `${ri * 11}%`,
                  border: `1.5px solid ${alpha(accent, a)}`,
                }}
              />
            ))}
            <div
              className="absolute flex items-center justify-center rounded-full text-center"
              style={{
                inset: "33%",
                background: `linear-gradient(135deg, ${accent}, ${alpha(accent, "cc")})`,
                boxShadow: `0 6px 18px ${alpha(accent, "40")}`,
              }}
            >
              <span className="px-2 text-xs font-bold leading-tight text-white line-clamp-3 break-words">
                {centerText?.trim() || "Core"}
              </span>
            </div>
          </div>
          {callout(right, 1, "left")}
          <div />
          {callout(bottom, 2, "center")}
          <div />
        </div>
      </Container>
    );
  }

  /* ---------------------- orbit-overlap (Venn trio) ------------------------ */
  if (layoutId === "orbit-overlap") {
    const displayItems = items.slice(0, 3);
    const diameter = 190;
    return (
      <Container
        className={`${SLIDE_FRAME} flex items-center justify-center ${className}`}
        key={animationKey} {...containerProps}
      >
        <div className="flex items-center justify-center">
          {displayItems.map((item, index) => {
            const mid = index === 1 || displayItems.length === 1;
            return (
              <ItemWrapper
                key={index}
                className="flex flex-col items-center justify-center rounded-full px-7 text-center"
                style={{
                  width: diameter,
                  height: diameter,
                  marginLeft: index === 0 ? 0 : -diameter * 0.18,
                  zIndex: mid ? 2 : 1,
                  background: mid
                    ? `linear-gradient(135deg, ${accent}, ${alpha(accent, "cc")})`
                    : alpha(accent, "14"),
                  border: mid ? "none" : `1.5px solid ${alpha(accent, "40")}`,
                  boxShadow: mid ? `0 6px 18px ${alpha(accent, "40")}` : undefined,
                  ...getSpotlightStyle(index),
                }}
                {...variantsProps}
              >
                {renderLabel(item, index, "text-sm font-bold tracking-tight", {
                  color: mid ? "#ffffff" : titleColor,
                })}
                {renderText(item, index, "mt-1 text-xs leading-snug break-words", {
                  color: mid ? "rgba(255,255,255,0.85)" : bodyColor,
                })}
              </ItemWrapper>
            );
          })}
        </div>
      </Container>
    );
  }

  /* ---------------------- orbit-phases (status circles) -------------------- */
  if (layoutId === "orbit-phases") {
    const displayItems = items.slice(0, 4);
    return (
      <Container
        className={`${SLIDE_FRAME} flex items-center justify-center ${className}`}
        key={animationKey} {...containerProps}
      >
        <div
          className="grid w-full justify-items-center gap-5"
          style={{
            gridTemplateColumns: `repeat(${Math.min(4, displayItems.length)}, minmax(0, 1fr))`,
          }}
        >
          {displayItems.map((item, index) => {
            // Lead phase reads as "active" for visual hierarchy.
            const on = index === 0;
            return (
              <ItemWrapper
                key={index}
                className="flex aspect-square w-full max-w-[180px] flex-col items-center justify-center rounded-full px-5 text-center"
                style={{
                  background: on
                    ? `linear-gradient(135deg, ${accent}, ${alpha(accent, "cc")})`
                    : alpha(accent, "12"),
                  border: on ? "none" : `1.5px dashed ${alpha(accent, "4d")}`,
                  boxShadow: on ? `0 6px 18px ${alpha(accent, "40")}` : undefined,
                  ...getSpotlightStyle(index),
                }}
                {...variantsProps}
              >
                {renderLabel(item, index, "text-sm font-bold tracking-tight", {
                  color: on ? "#ffffff" : titleColor,
                })}
                {renderText(item, index, "mt-1 text-xs leading-snug break-words", {
                  color: on ? "rgba(255,255,255,0.85)" : bodyColor,
                })}
              </ItemWrapper>
            );
          })}
        </div>
      </Container>
    );
  }

  /* ---------------------- orbit-spectrum (dots on a line) ------------------ */
  const displayItems = items.slice(0, 5);
  const n = Math.max(displayItems.length, 1);
  const cols = { gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` };
  return (
    <Container
      className={`${SLIDE_FRAME} flex flex-col justify-center ${className}`}
      key={animationKey} {...containerProps}
    >
      <div>
        <div className="grid" style={cols}>
          {displayItems.map((item, index) => (
            <div
              key={index}
              className="flex items-end justify-center px-2 text-center"
              style={getSpotlightStyle(index)}
            >
              {renderLabel(item, index, "text-sm font-bold tracking-tight", {
                color: titleColor,
              })}
            </div>
          ))}
        </div>
        <div className="relative mt-2.5">
          <div
            className="absolute top-1/2 h-[2px] -translate-y-1/2 rounded-full"
            style={{
              left: `${100 / (n * 2)}%`,
              right: `${100 / (n * 2)}%`,
              background: `linear-gradient(90deg, ${alpha(accent, "33")}, ${accent}, ${alpha(accent, "33")})`,
            }}
          />
          <div className="relative grid" style={cols}>
            {displayItems.map((_, index) => (
              <ItemWrapper
                key={index}
                className="flex justify-center"
                style={getSpotlightStyle(index)}
                {...variantsProps}
              >
                <span
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor: accent,
                    boxShadow: `0 0 0 4px ${alpha(accent, "1f")}`,
                  }}
                />
              </ItemWrapper>
            ))}
          </div>
        </div>
        <div className="mt-2.5 grid" style={cols}>
          {displayItems.map((item, index) => (
            <div key={index} className="px-2 text-center" style={getSpotlightStyle(index)}>
              {renderText(item, index, "text-xs leading-snug break-words", {
                color: bodyColor,
              })}
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
