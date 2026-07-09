"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Theme } from "~/lib/themes";
import type { BoxContentItem } from "~/lib/layouts/content/boxes";
import EditableText from "~/components/presentation/EditableText";
import { alpha } from "~/components/presentation/PremiumComponents";
import { containerVariantsFor, itemMotionProps } from "~/components/presentation/item-animations";

// Animation variants (subtle entrance, gated on isPresenting)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const hubVariants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  },
};

const spokeVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  },
};

interface HubSpokeRendererProps {
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

export function HubSpokeRenderer({
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
}: HubSpokeRendererProps) {
  // Defensive color resolution
  const titleColor = theme?.colors.heading || "#1e293b";
  const bodyColor = theme?.colors.textMuted || "#64748b";
  const accent =
    accentColor || theme?.colors.accent || theme?.colors.primary || "#6366f1";
  const cardBg =
    theme?.cardBox?.background ||
    theme?.colors.surface ||
    "rgba(255,255,255,0.06)";
  const border = theme?.colors.border || "rgba(0,0,0,0.1)";

  // First item is the hub; the rest are spokes (cap spokes at 6 -> max 7 total).
  const hub = items[0];
  const spokes = items.slice(1, 7);
  const spokeCount = spokes.length;

  // Elliptical radius (percent of container): wider horizontally so the
  // left/right spokes use the empty side space, and shorter vertically so the
  // top/bottom spokes don't run off the slide. Spokes are absolutely positioned
  // and therefore invisible to the canvas shrink-to-fit, so the geometry itself
  // must stay inside the box.
  const Rx = 46;
  const Ry = 31;

  // Compute spoke positions (in container-percentage coords) once.
  const spokePositions = spokes.map((_, k) => {
    const angleDeg = -90 + (k * 360) / Math.max(spokeCount, 1);
    const angleRad = (angleDeg * Math.PI) / 180;
    const left = 50 + Rx * Math.cos(angleRad);
    const top = 50 + Ry * Math.sin(angleRad);
    return { left, top };
  });

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

  const HubWrapper = isPresenting ? motion.div : "div";
  const hubVariantProps = isPresenting ? { variants: hubVariants } : {};

  if (!hub) {
    return null;
  }

  // ---- Shared bits for the added styles (2-10) ----
  const CItem = isPresenting ? motion.div : "div";
  const cProps = isPresenting
    ? { variants: containerVariantsFor(itemAnimation), initial: "hidden" as const, animate: "visible" as const }
    : {};
  const itemMotion = (i: number) => itemMotionProps(isPresenting, itemAnimation, revealCount, i);
  const hubText = hub.label || hub.text;
  const pos = (k: number, count: number, rx: number, ry: number) => {
    const a = (-90 + (k * 360) / Math.max(count, 1)) * (Math.PI / 180);
    return { left: 50 + rx * Math.cos(a), top: 50 + ry * Math.sin(a) };
  };
  const editHub = (cls: string, style?: React.CSSProperties) =>
    onStartEditLabel ? (
      <EditableText value={hubText} isEditing={isEditing && editingText?.field === `content-label-0`}
        onStartEdit={() => onStartEditLabel(0)} onChange={(val) => onUpdateLabel?.(0, val)}
        onFinish={onFinishEditing || (() => {})} onDelete={onDeleteItem ? () => onDeleteItem(0) : undefined}
        className={cls} style={style} isOwner={isOwner} isHovered={isHovered} />
    ) : (
      <h3 className={cls} style={style}>{hubText}</h3>
    );
  const editSLabel = (item: BoxContentItem, i: number, cls: string, style?: React.CSSProperties) =>
    item.label ? (
      onStartEditLabel ? (
        <EditableText value={item.label} isEditing={isEditing && editingText?.field === `content-label-${i}`}
          onStartEdit={() => onStartEditLabel(i)} onChange={(val) => onUpdateLabel?.(i, val)}
          onFinish={onFinishEditing || (() => {})} onDelete={onDeleteItem ? () => onDeleteItem(i) : undefined}
          className={cls} style={{ color: titleColor, ...style }} isOwner={isOwner} isHovered={isHovered} />
      ) : (
        <h3 className={cls} style={{ color: titleColor, ...style }}>{item.label}</h3>
      )
    ) : null;
  const editSText = (item: BoxContentItem, i: number, cls: string, style?: React.CSSProperties) =>
    onStartEditText ? (
      <EditableText value={item.text} isEditing={isEditing && editingText?.field === `content-text-${i}`}
        onStartEdit={() => onStartEditText(i)} onChange={(val) => onUpdateText?.(i, val)}
        onFinish={onFinishEditing || (() => {})} onDelete={onDeleteItem ? () => onDeleteItem(i) : undefined}
        className={cls} style={{ color: bodyColor, ...style }} isOwner={isOwner} isHovered={isHovered} />
    ) : (
      <p className={cls} style={{ color: bodyColor, ...style }}>{item.text}</p>
    );
  // Hub node used by several of the radial styles
  const hubNode = (size: string, fontCls = "text-sm") => (
    <CItem className="absolute left-1/2 top-1/2 z-10 flex items-center justify-center rounded-full text-center" style={{ width: size, height: size, transform: "translate(-50%,-50%)", background: `linear-gradient(135deg, ${accent}, ${alpha(accent, "cc")})`, boxShadow: `0 0 0 6px ${alpha(accent, "1a")}, 0 6px 18px ${alpha(accent, "4d")}`, ...getSpotlightStyle(0) }} {...itemMotion(0)}>
      <div className="px-2">{editHub(`font-bold ${fontCls} leading-tight text-white`, { color: "#ffffff" })}</div>
    </CItem>
  );

  // == HUBSPOKE-STYLE-2: SATELLITE CARDS — circular satellite nodes on an ellipse
  if (layoutId === "hubspoke-style-2") {
    const sp = spokes.map((_, k) => pos(k, spokeCount, 40, 32));
    return (
      <Container className={`w-full h-full flex items-center justify-center ${className}`} key={animationKey} {...cProps}>
        <div className="relative w-full max-w-3xl aspect-[16/9] mx-auto">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
            {sp.map((p, k) => <line key={k} x1={50} y1={50} x2={p.left} y2={p.top} stroke={accent} strokeWidth={0.4} strokeDasharray="1.5 1.2" opacity={0.5} />)}
          </svg>
          {spokes.map((item, k) => {
            const i = k + 1; const p = sp[k]!;
            return (
              <CItem key={i} className="absolute flex w-36 -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center" style={{ left: `${p.left}%`, top: `${p.top}%`, ...getSpotlightStyle(i) }} {...itemMotion(i)}>
                <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-full text-sm font-extrabold text-white tabular-nums" style={{ background: alpha(accent, "e6"), boxShadow: `0 0 0 4px ${alpha(accent, "1a")}` }}>{item.icon || i}</div>
                {editSLabel(item, i, "text-xs font-bold leading-tight")}
                {editSText(item, i, "text-[11px] leading-snug break-words", item.label ? undefined : { color: titleColor, fontWeight: 600 })}
              </CItem>
            );
          })}
          {hubNode("6rem")}
        </div>
      </Container>
    );
  }

  // == HUBSPOKE-STYLE-3: SUN RAYS — a glowing hub emitting rays to nodes
  if (layoutId === "hubspoke-style-3") {
    const sp = spokes.map((_, k) => pos(k, spokeCount, 42, 33));
    return (
      <Container className={`w-full h-full flex items-center justify-center ${className}`} key={animationKey} {...cProps}>
        <div className="relative w-full max-w-3xl aspect-[16/9] mx-auto">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
            {sp.map((p, k) => {
              const a = Math.atan2(p.top - 50, p.left - 50); const w = 3.4;
              const x1 = 50 + Math.cos(a - w / 100) * 9, y1 = 50 + Math.sin(a - w / 100) * 9;
              const x2 = 50 + Math.cos(a + w / 100) * 9, y2 = 50 + Math.sin(a + w / 100) * 9;
              return <polygon key={k} points={`${x1},${y1} ${x2},${y2} ${p.left},${p.top}`} fill={alpha(accent, "26")} />;
            })}
          </svg>
          {spokes.map((item, k) => {
            const i = k + 1; const p = sp[k]!;
            return (
              <CItem key={i} className="absolute w-32 -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: `${p.left}%`, top: `${p.top}%`, ...getSpotlightStyle(i) }} {...itemMotion(i)}>
                {editSLabel(item, i, "text-xs font-bold leading-tight")}
                {editSText(item, i, "text-[11px] leading-snug break-words", item.label ? undefined : { color: titleColor, fontWeight: 600 })}
              </CItem>
            );
          })}
          <div className="absolute left-1/2 top-1/2 z-10 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-center" style={{ background: `radial-gradient(circle, ${accent}, ${alpha(accent, "b3")})`, boxShadow: `0 0 30px ${alpha(accent, "80")}, 0 0 0 8px ${alpha(accent, "17")}` }}>
            <div className="px-2">{editHub("font-bold text-sm leading-tight text-white", { color: "#ffffff" })}</div>
          </div>
        </div>
      </Container>
    );
  }

  // == HUBSPOKE-STYLE-4: LEFT HUB — hub on the left, spokes fan to the right
  if (layoutId === "hubspoke-style-4") {
    return (
      <Container className={`w-full h-full flex items-center gap-6 px-6 ${className}`} key={animationKey} {...cProps}>
        <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-2xl text-center" style={{ background: `linear-gradient(135deg, ${accent}, ${alpha(accent, "cc")})`, boxShadow: `0 8px 22px ${alpha(accent, "4d")}` }}>
          <div className="px-3">{editHub("font-bold text-base leading-tight text-white", { color: "#ffffff" })}</div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2.5">
          {spokes.map((item, k) => {
            const i = k + 1;
            return (
              <CItem key={i} className="flex items-center gap-3 rounded-xl px-4 py-2.5 min-w-0" style={{ background: cardBg, border: `1px solid ${border}`, borderLeft: `3px solid ${accent}`, ...getSpotlightStyle(i) }} {...itemMotion(i)}>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold text-white" style={{ background: accent }}>{item.icon || i}</span>
                <div className="min-w-0">{editSLabel(item, i, "text-sm font-bold leading-tight")}{editSText(item, i, "text-xs leading-snug break-words", item.label ? undefined : { color: titleColor, fontWeight: 600 })}</div>
              </CItem>
            );
          })}
        </div>
      </Container>
    );
  }

  // == HUBSPOKE-STYLE-5: NUMBERED SPOKES — numbered chips around the hub
  if (layoutId === "hubspoke-style-5") {
    const sp = spokes.map((_, k) => pos(k, spokeCount, 40, 33));
    return (
      <Container className={`w-full h-full flex items-center justify-center ${className}`} key={animationKey} {...cProps}>
        <div className="relative w-full max-w-3xl aspect-[16/9] mx-auto">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
            {sp.map((p, k) => <line key={k} x1={50} y1={50} x2={p.left} y2={p.top} stroke={accent} strokeWidth={0.35} opacity={0.4} />)}
          </svg>
          {spokes.map((item, k) => {
            const i = k + 1; const p = sp[k]!;
            return (
              <CItem key={i} className="absolute flex w-40 -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full px-2 py-1.5" style={{ left: `${p.left}%`, top: `${p.top}%`, background: cardBg, border: `1px solid ${border}`, ...getSpotlightStyle(i) }} {...itemMotion(i)}>
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold text-white" style={{ background: accent }}>{i}</span>
                {editSLabel(item, i, "text-xs font-bold leading-tight truncate") || editSText(item, i, "text-xs leading-tight truncate", { color: titleColor })}
              </CItem>
            );
          })}
          {hubNode("5.5rem")}
        </div>
      </Container>
    );
  }

  // == HUBSPOKE-STYLE-6: GEAR HUB — hub framed by a dashed cog ring
  if (layoutId === "hubspoke-style-6") {
    const sp = spokes.map((_, k) => pos(k, spokeCount, 41, 33));
    return (
      <Container className={`w-full h-full flex items-center justify-center ${className}`} key={animationKey} {...cProps}>
        <div className="relative w-full max-w-3xl aspect-[16/9] mx-auto">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
            <circle cx={50} cy={50} r={17} fill="none" stroke={alpha(accent, "59")} strokeWidth={2.5} strokeDasharray="3 2.4" />
            {sp.map((p, k) => <line key={k} x1={50} y1={50} x2={p.left} y2={p.top} stroke={accent} strokeWidth={0.35} opacity={0.4} />)}
          </svg>
          {spokes.map((item, k) => {
            const i = k + 1; const p = sp[k]!;
            return (
              <CItem key={i} className="absolute w-32 -translate-x-1/2 -translate-y-1/2 rounded-lg px-2.5 py-1.5 text-center" style={{ left: `${p.left}%`, top: `${p.top}%`, background: cardBg, border: `1px solid ${border}`, ...getSpotlightStyle(i) }} {...itemMotion(i)}>
                {editSLabel(item, i, "text-xs font-bold leading-tight") || editSText(item, i, "text-xs leading-tight", { color: titleColor, fontWeight: 600 })}
              </CItem>
            );
          })}
          {hubNode("5.5rem")}
        </div>
      </Container>
    );
  }

  // == HUBSPOKE-STYLE-7: BUBBLE CLUSTER — hub bubble + size-varied bubbles
  if (layoutId === "hubspoke-style-7") {
    const sp = spokes.map((_, k) => pos(k, spokeCount, 38, 32));
    return (
      <Container className={`w-full h-full flex items-center justify-center ${className}`} key={animationKey} {...cProps}>
        <div className="relative w-full max-w-3xl aspect-[16/9] mx-auto">
          {spokes.map((item, k) => {
            const i = k + 1; const p = sp[k]!; const size = 5.5 - (k % 3) * 0.8;
            return (
              <CItem key={i} className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full p-2 text-center" style={{ left: `${p.left}%`, top: `${p.top}%`, width: `${size}rem`, height: `${size}rem`, background: `radial-gradient(circle at 35% 30%, ${alpha(accent, "40")}, ${alpha(accent, "1a")})`, border: `1.5px solid ${alpha(accent, "40")}`, ...getSpotlightStyle(i) }} {...itemMotion(i)}>
                {editSLabel(item, i, "text-[11px] font-bold leading-tight") || editSText(item, i, "text-[11px] leading-tight", { color: titleColor, fontWeight: 600 })}
              </CItem>
            );
          })}
          <div className="absolute left-1/2 top-1/2 z-10 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-center" style={{ background: `linear-gradient(135deg, ${accent}, ${alpha(accent, "cc")})`, boxShadow: `0 8px 24px ${alpha(accent, "4d")}` }}>
            <div className="px-2">{editHub("font-bold text-sm leading-tight text-white", { color: "#ffffff" })}</div>
          </div>
        </div>
      </Container>
    );
  }

  // == HUBSPOKE-STYLE-8: MIND MAP — central node branching to curved-line spokes
  if (layoutId === "hubspoke-style-8") {
    const half = Math.ceil(spokes.length / 2);
    const rows = (arr: BoxContentItem[], side: "l" | "r") => (
      <div className={`flex flex-1 flex-col justify-center gap-3 ${side === "l" ? "items-end text-right" : "items-start text-left"}`}>
        {arr.map((item) => {
          const i = spokes.indexOf(item) + 1;
          return (
            <CItem key={i} className="max-w-[14rem] rounded-lg px-3.5 py-2" style={{ background: cardBg, border: `1px solid ${border}`, [side === "l" ? "borderRight" : "borderLeft"]: `3px solid ${accent}`, ...getSpotlightStyle(i) }} {...itemMotion(i)}>
              {editSLabel(item, i, "text-xs font-bold leading-tight")}
              {editSText(item, i, "text-[11px] leading-snug break-words", item.label ? undefined : { color: titleColor, fontWeight: 600 })}
            </CItem>
          );
        })}
      </div>
    );
    return (
      <Container className={`w-full h-full flex items-center gap-4 px-6 ${className}`} key={animationKey} {...cProps}>
        {rows(spokes.slice(0, half), "l")}
        <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full text-center" style={{ background: `linear-gradient(135deg, ${accent}, ${alpha(accent, "cc")})`, boxShadow: `0 0 0 6px ${alpha(accent, "1a")}, 0 6px 18px ${alpha(accent, "4d")}` }}>
          <div className="px-2">{editHub("font-bold text-sm leading-tight text-white", { color: "#ffffff" })}</div>
        </div>
        {rows(spokes.slice(half), "r")}
      </Container>
    );
  }

  // == HUBSPOKE-STYLE-9: ORBIT HUB — spokes docked as nodes on a ring
  if (layoutId === "hubspoke-style-9") {
    const sp = spokes.map((_, k) => pos(k, spokeCount, 36, 36));
    return (
      <Container className={`w-full h-full flex items-center justify-center ${className}`} key={animationKey} {...cProps}>
        <div className="relative w-full max-w-3xl aspect-[16/9] mx-auto">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
            <ellipse cx={50} cy={50} rx={36} ry={36} fill="none" stroke={alpha(accent, "40")} strokeWidth={1} strokeDasharray="2.5 2" />
          </svg>
          {spokes.map((item, k) => {
            const i = k + 1; const p = sp[k]!;
            return (
              <CItem key={i} className="absolute flex w-32 -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center" style={{ left: `${p.left}%`, top: `${p.top}%`, ...getSpotlightStyle(i) }} {...itemMotion(i)}>
                <span className="mb-1 flex h-8 w-8 items-center justify-center rounded-full text-xs font-extrabold text-white" style={{ background: accent, boxShadow: `0 0 0 4px ${theme?.colors.background || "#0b1220"}` }}>{item.icon || i}</span>
                {editSLabel(item, i, "text-[11px] font-bold leading-tight") || editSText(item, i, "text-[11px] leading-tight", { color: titleColor, fontWeight: 600 })}
              </CItem>
            );
          })}
          {hubNode("5.5rem")}
        </div>
      </Container>
    );
  }

  // == HUBSPOKE-STYLE-10: SPOTLIGHT HUB — hub card above a grid of spokes
  if (layoutId === "hubspoke-style-10") {
    const cols = spokes.length <= 3 ? spokes.length || 1 : spokes.length <= 4 ? 2 : 3;
    return (
      <Container className={`w-full h-full flex flex-col justify-center gap-5 px-8 ${className}`} key={animationKey} {...cProps}>
        <div className="mx-auto flex max-w-md items-center gap-4 rounded-2xl px-6 py-4 text-center" style={{ background: `linear-gradient(135deg, ${accent}, ${alpha(accent, "cc")})`, boxShadow: `0 8px 24px ${alpha(accent, "40")}` }}>
          <div className="flex-1">{editHub("font-bold text-lg leading-tight text-white", { color: "#ffffff" })}</div>
        </div>
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {spokes.map((item, k) => {
            const i = k + 1;
            return (
              <CItem key={i} className="rounded-xl px-4 py-3" style={{ background: cardBg, border: `1px solid ${border}`, borderTop: `2px solid ${accent}`, ...getSpotlightStyle(i) }} {...itemMotion(i)}>
                {editSLabel(item, i, "text-sm font-bold leading-tight")}
                {editSText(item, i, "text-xs leading-snug break-words", item.label ? undefined : { color: titleColor, fontWeight: 600 })}
              </CItem>
            );
          })}
        </div>
      </Container>
    );
  }

  return (
    <Container
      className={`w-full h-full flex items-center justify-center ${className}`}
      key={animationKey} {...containerProps}
    >
      <div
        className="relative w-full max-w-3xl aspect-[16/9] mx-auto"
        data-layout-id={layoutId}
      >
        {/* Connector lines layer (behind nodes) */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          {spokePositions.map((pos, k) => (
            <line
              key={k}
              x1={50}
              y1={50}
              x2={pos.left}
              y2={pos.top}
              stroke={accent}
              strokeWidth={0.4}
              opacity={0.5}
            />
          ))}
        </svg>

        {/* Spokes arranged evenly around the hub */}
        {spokes.map((item, k) => {
          // index in the original items array (hub is 0)
          const itemIndex = k + 1;
          const pos = spokePositions[k]!;

          const SpokeWrapper = isPresenting ? motion.div : "div";
          const spokeVariantProps = isPresenting
            ? { variants: spokeVariants }
            : {};

          return (
            <SpokeWrapper
              key={itemIndex}
              className="absolute w-44 max-w-[12rem]"
              style={{
                left: `${pos.left}%`,
                top: `${pos.top}%`,
                transform: "translate(-50%, -50%)",
                ...getSpotlightStyle(itemIndex),
              }}
              {...spokeVariantProps}
            >
              <div
                className="rounded-xl px-3 py-2 shadow-sm"
                style={{
                  background: cardBg,
                  border: `1px solid ${border}`,
                }}
              >
                {/* Spoke label */}
                {item.label &&
                  (onStartEditLabel ? (
                    <EditableText
                      value={item.label}
                      isEditing={
                        isEditing &&
                        editingText?.field === `content-label-${itemIndex}`
                      }
                      onStartEdit={() => onStartEditLabel(itemIndex)}
                      onChange={(val) => onUpdateLabel?.(itemIndex, val)}
                      onFinish={onFinishEditing || (() => {})}
                      onDelete={
                        onDeleteItem ? () => onDeleteItem(itemIndex) : undefined
                      }
                      className="font-bold text-sm leading-tight"
                      style={{ color: titleColor }}
                      isOwner={isOwner}
                      isHovered={isHovered}
                    />
                  ) : (
                    <h3
                      className="font-bold text-sm leading-tight"
                      style={{ color: titleColor }}
                    >
                      {item.label}
                    </h3>
                  ))}

                {/* Spoke text — wraps fully. When the bullet has no separate
                    title, render the text itself as the node's prominent line so
                    the node never looks like an orphaned description. */}
                {onStartEditText ? (
                  <EditableText
                    value={item.text}
                    isEditing={
                      isEditing &&
                      editingText?.field === `content-text-${itemIndex}`
                    }
                    onStartEdit={() => onStartEditText(itemIndex)}
                    onChange={(val) => onUpdateText?.(itemIndex, val)}
                    onFinish={onFinishEditing || (() => {})}
                    onDelete={
                      onDeleteItem ? () => onDeleteItem(itemIndex) : undefined
                    }
                    className={
                      item.label
                        ? "text-xs leading-snug mt-0.5 break-words"
                        : "text-sm font-semibold leading-tight break-words"
                    }
                    style={{ color: item.label ? bodyColor : titleColor }}
                    isOwner={isOwner}
                    isHovered={isHovered}
                  />
                ) : (
                  <p
                    className={
                      item.label
                        ? "text-xs leading-snug mt-0.5 break-words"
                        : "text-sm font-semibold leading-tight break-words"
                    }
                    style={{ color: item.label ? bodyColor : titleColor }}
                  >
                    {item.text}
                  </p>
                )}
              </div>
            </SpokeWrapper>
          );
        })}

        {/* Central HUB (first item) */}
        <HubWrapper
          className="absolute left-1/2 top-1/2 flex items-center justify-center rounded-full text-center"
          style={{
            width: "6.5rem",
            height: "6.5rem",
            transform: "translate(-50%, -50%)",
            // Premium hub: gradient fill + accent glow ring
            background: `linear-gradient(135deg, ${accent}, ${alpha(accent, "cc")})`,
            boxShadow: `0 0 0 6px ${alpha(accent, "1a")}, 0 6px 18px ${alpha(accent, "4d")}`,
            ...getSpotlightStyle(0),
          }}
          {...hubVariantProps}
        >
          <div className="px-2">
            {onStartEditLabel ? (
              <EditableText
                value={hub.label || hub.text}
                isEditing={
                  isEditing && editingText?.field === `content-label-0`
                }
                onStartEdit={() => onStartEditLabel(0)}
                onChange={(val) => onUpdateLabel?.(0, val)}
                onFinish={onFinishEditing || (() => {})}
                onDelete={onDeleteItem ? () => onDeleteItem(0) : undefined}
                className="font-bold text-sm leading-tight"
                style={{ color: "#ffffff" }}
                isOwner={isOwner}
                isHovered={isHovered}
              />
            ) : (
              <h3
                className="font-bold text-sm leading-tight"
                style={{ color: "#ffffff" }}
              >
                {hub.label || hub.text}
              </h3>
            )}
          </div>
        </HubWrapper>
      </div>
    </Container>
  );
}
