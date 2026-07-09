"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Theme } from "~/lib/themes";
import type { BoxContentItem } from "~/lib/layouts/content/boxes";
import EditableText from "~/components/presentation/EditableText";
import { tileStyle, SLIDE_FRAME } from "./tile";
import { alpha } from "~/components/presentation/PremiumComponents";
import { containerVariantsFor, itemMotionProps } from "~/components/presentation/item-animations";

// Animation variants (entrance gated on isPresenting)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
};

const rowVariants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  },
};

interface ZigzagRendererProps {
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
  onStartEditLabel?: (i: number) => void;
  onStartEditText?: (i: number) => void;
  onUpdateLabel?: (i: number, v: string) => void;
  onUpdateText?: (i: number, v: string) => void;
  onFinishEditing?: () => void;
  onDeleteItem?: (i: number) => void;
  isOwner?: boolean;
  isHovered?: boolean;
  spotlightIndex?: number;
  isSpotlightMode?: boolean;
}

export function ZigzagRenderer({
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
}: ZigzagRendererProps) {
  // Cap at 5 items for a clean zigzag rhythm
  const displayItems = items.slice(0, 5);

  // Defensive theme colors
  const titleColor = theme?.colors.heading || "#1e293b";
  const bodyColor = theme?.colors.textMuted || "#64748b";
  const accent =
    accentColor || theme?.colors.accent || theme?.colors.primary || "#6366f1";
  const cardBg =
    theme?.cardBox?.background ||
    theme?.colors.surface ||
    "rgba(255,255,255,0.05)";
  const border = theme?.colors.border || "rgba(0,0,0,0.08)";

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
        initial: "hidden" as const,
        animate: "visible" as const,
      }
    : {};

  const Row = isPresenting ? motion.div : "div";

  // ---- Shared bits for the added styles (2-8) ----
  const n = displayItems.length;
  const pad2 = (k: number) => String(k).padStart(2, "0");
  const CItem = isPresenting ? motion.div : "div";
  const cProps = isPresenting
    ? { variants: containerVariantsFor(itemAnimation), initial: "hidden" as const, animate: "visible" as const }
    : {};
  const itemMotion = (i: number) => itemMotionProps(isPresenting, itemAnimation, revealCount, i);

  const editLabel = (item: BoxContentItem, index: number, cls: string, style?: React.CSSProperties) =>
    item.label ? (
      onStartEditLabel ? (
        <EditableText value={item.label} isEditing={isEditing && editingText?.field === `content-label-${index}`}
          onStartEdit={() => onStartEditLabel(index)} onChange={(val) => onUpdateLabel?.(index, val)}
          onFinish={onFinishEditing || (() => {})} onDelete={onDeleteItem ? () => onDeleteItem(index) : undefined}
          className={cls} style={{ color: titleColor, ...style }} isOwner={isOwner} isHovered={isHovered} />
      ) : (
        <h3 className={cls} style={{ color: titleColor, ...style }}>{item.label}</h3>
      )
    ) : null;

  const editText = (item: BoxContentItem, index: number, cls: string, style?: React.CSSProperties) =>
    onStartEditText ? (
      <EditableText value={item.text} isEditing={isEditing && editingText?.field === `content-text-${index}`}
        onStartEdit={() => onStartEditText(index)} onChange={(val) => onUpdateText?.(index, val)}
        onFinish={onFinishEditing || (() => {})} onDelete={onDeleteItem ? () => onDeleteItem(index) : undefined}
        className={cls} style={{ color: bodyColor, ...style }} isOwner={isOwner} isHovered={isHovered} />
    ) : (
      <p className={cls} style={{ color: bodyColor, ...style }}>{item.text}</p>
    );

  // == ZIGZAG-STYLE-2: CENTER SPINE — vertical spine, cards alternate with nodes
  if (layoutId === "zigzag-style-2") {
    return (
      <Container className={`${SLIDE_FRAME} flex flex-col justify-center ${className}`} key={animationKey} {...cProps}>
        <div className="relative flex flex-col gap-4">
          <div aria-hidden className="absolute left-1/2 top-2 bottom-2 w-0.5 -translate-x-1/2 rounded-full" style={{ background: alpha(accent, "33") }} />
          {displayItems.map((item, index) => {
            const left = index % 2 === 0;
            return (
              <CItem key={index} className="relative grid items-center gap-2" style={{ gridTemplateColumns: "1fr auto 1fr", ...getSpotlightStyle(index) }} {...itemMotion(index)}>
                <div className={left ? "col-start-1 flex justify-end" : "col-start-3 flex justify-start"}>
                  <div className="ppt-tile w-full max-w-sm rounded-2xl px-5 py-3.5" style={tileStyle(cardBg, border, accent)}>
                    {editLabel(item, index, "font-bold text-base leading-snug break-words", { textAlign: left ? "right" : "left" })}
                    {editText(item, index, "mt-0.5 text-sm leading-relaxed break-words", { textAlign: left ? "right" : "left" })}
                  </div>
                </div>
                <div className="col-start-2 z-10 flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: `linear-gradient(135deg, ${accent}, ${alpha(accent, "cc")})`, boxShadow: `0 0 0 4px ${cardBg}` }}>{index + 1}</div>
              </CItem>
            );
          })}
        </div>
      </Container>
    );
  }

  // == ZIGZAG-STYLE-3: DIAGONAL STEPS — cards stepping down-right with arrows
  if (layoutId === "zigzag-style-3") {
    return (
      <Container className={`${SLIDE_FRAME} flex flex-col justify-center ${className}`} key={animationKey} {...cProps}>
        <div className="flex flex-col gap-1.5">
          {displayItems.map((item, index) => {
            const indent = n > 1 ? (index / (n - 1)) * 34 : 0;
            return (
              <React.Fragment key={index}>
                <CItem className="ppt-tile relative rounded-2xl px-5 py-3.5" style={{ ...tileStyle(cardBg, border, accent, { bar: "left" }), marginLeft: `${indent}%`, width: "58%", ...getSpotlightStyle(index) }} {...itemMotion(index)}>
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-xs font-bold tabular-nums" style={{ color: accent }}>{pad2(index + 1)}</span>
                    <div className="min-w-0 flex-1">
                      {editLabel(item, index, "font-bold text-base leading-snug break-words")}
                      {editText(item, index, "mt-0.5 text-sm leading-relaxed break-words")}
                    </div>
                  </div>
                </CItem>
                {index < n - 1 && (
                  <div aria-hidden className="text-lg font-bold leading-none" style={{ marginLeft: `${indent + 26}%`, color: alpha(accent, "80") }}>↘</div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </Container>
    );
  }

  // == ZIGZAG-STYLE-4: NUMBER WEAVE — oversized alternating-side numerals
  if (layoutId === "zigzag-style-4") {
    return (
      <Container className={`${SLIDE_FRAME} flex flex-col justify-center gap-3 ${className}`} key={animationKey} {...cProps}>
        {displayItems.map((item, index) => {
          const left = index % 2 === 0;
          const num = (
            <span className="shrink-0 font-extrabold tabular-nums leading-none" style={{ fontSize: "3rem", color: alpha(accent, "d9"), letterSpacing: "-0.04em" }}>{pad2(index + 1)}</span>
          );
          return (
            <CItem key={index} className={`flex items-center gap-5 ${left ? "" : "flex-row-reverse"}`} style={getSpotlightStyle(index)} {...itemMotion(index)}>
              {num}
              <div className={`min-w-0 flex-1 ${left ? "border-l pl-4" : "border-r pr-4 text-right"}`} style={{ borderColor: alpha(accent, "33") }}>
                {editLabel(item, index, "font-bold text-lg leading-snug break-words")}
                {editText(item, index, "mt-0.5 text-sm leading-relaxed break-words")}
              </div>
            </CItem>
          );
        })}
      </Container>
    );
  }

  // == ZIGZAG-STYLE-5: RIBBON PANELS — full-width alternating tinted panels
  if (layoutId === "zigzag-style-5") {
    return (
      <Container className={`${SLIDE_FRAME} flex flex-col justify-center gap-2.5 ${className}`} key={animationKey} {...cProps}>
        {displayItems.map((item, index) => {
          const left = index % 2 === 0;
          const badge = (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white text-base font-extrabold tabular-nums" style={{ background: `linear-gradient(135deg, ${accent}, ${alpha(accent, "cc")})` }}>{index + 1}</div>
          );
          return (
            <CItem key={index} className={`flex items-center gap-4 rounded-xl px-5 py-3.5 ${left ? "" : "flex-row-reverse text-right"}`}
              style={{ background: left ? `linear-gradient(90deg, ${alpha(accent, "1f")}, ${alpha(accent, "0a")})` : cardBg, border: `1px solid ${left ? alpha(accent, "2e") : border}`, ...getSpotlightStyle(index) }} {...itemMotion(index)}>
              {badge}
              <div className="min-w-0 flex-1">
                {editLabel(item, index, "font-bold text-base leading-snug break-words")}
                {editText(item, index, "mt-0.5 text-sm leading-relaxed break-words")}
              </div>
            </CItem>
          );
        })}
      </Container>
    );
  }

  // == ZIGZAG-STYLE-6: CONNECTOR ARROWS — alternating cards joined by S-curves
  if (layoutId === "zigzag-style-6") {
    return (
      <Container className={`${SLIDE_FRAME} flex flex-col justify-center ${className}`} key={animationKey} {...cProps}>
        <div className="flex flex-col">
          {displayItems.map((item, index) => {
            const left = index % 2 === 0;
            const isLast = index === n - 1;
            return (
              <React.Fragment key={index}>
                <CItem className={`flex w-full ${left ? "justify-start" : "justify-end"}`} style={getSpotlightStyle(index)} {...itemMotion(index)}>
                  <div className="ppt-tile relative w-[60%] rounded-2xl px-5 py-4" style={tileStyle(cardBg, border, accent)}>
                    <div className="absolute -top-3 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm" style={{ background: accent, [left ? "left" : "right"]: "1.25rem" }}>{index + 1}</div>
                    <div className="mt-2">
                      {editLabel(item, index, "font-bold text-lg leading-snug break-words")}
                      {editText(item, index, "mt-1 text-sm leading-relaxed break-words")}
                    </div>
                  </div>
                </CItem>
                {!isLast && (
                  <div className={`flex ${left ? "justify-start" : "justify-end"}`} aria-hidden>
                    <svg width="120" height="30" viewBox="0 0 120 30" className="mx-[8%]" style={{ overflow: "visible" }}>
                      <path d={left ? "M 24 2 C 24 22, 96 8, 96 28" : "M 96 2 C 96 22, 24 8, 24 28"} fill="none" stroke={alpha(accent, "80")} strokeWidth={2} strokeLinecap="round" strokeDasharray="3 3" />
                      <polygon points={left ? "96,28 91,22 101,22" : "24,28 19,22 29,22"} fill={accent} />
                    </svg>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </Container>
    );
  }

  // == ZIGZAG-STYLE-7: SPLIT ROWS — number cell and text swap sides each row
  if (layoutId === "zigzag-style-7") {
    return (
      <Container className={`${SLIDE_FRAME} flex flex-col justify-center gap-3 ${className}`} key={animationKey} {...cProps}>
        {displayItems.map((item, index) => {
          const numLeft = index % 2 === 0;
          const numCell = (
            <div className="flex w-20 shrink-0 items-center justify-center" style={{ background: `linear-gradient(135deg, ${accent}, ${alpha(accent, "cc")})` }}>
              <span className="text-2xl font-extrabold tabular-nums text-white">{pad2(index + 1)}</span>
            </div>
          );
          return (
            <CItem key={index} className="ppt-tile flex items-stretch overflow-hidden rounded-2xl" style={{ background: cardBg, border: `1px solid ${border}`, minHeight: "3.75rem", ...getSpotlightStyle(index) }} {...itemMotion(index)}>
              {numLeft && numCell}
              <div className={`min-w-0 flex-1 px-5 py-3 ${numLeft ? "" : "text-right"}`}>
                {editLabel(item, index, "font-bold text-base leading-snug break-words")}
                {editText(item, index, "mt-0.5 text-sm leading-relaxed break-words")}
              </div>
              {!numLeft && numCell}
            </CItem>
          );
        })}
      </Container>
    );
  }

  // == ZIGZAG-STYLE-8: GHOST WEAVE — cards with a large ghost numeral, slight overlap
  if (layoutId === "zigzag-style-8") {
    return (
      <Container className={`${SLIDE_FRAME} flex flex-col justify-center ${className}`} key={animationKey} {...cProps}>
        <div className="flex flex-col">
          {displayItems.map((item, index) => {
            const left = index % 2 === 0;
            return (
              <CItem key={index} className={`flex w-full ${left ? "justify-start" : "justify-end"}`} style={{ marginTop: index > 0 ? "-0.5rem" : 0, zIndex: index + 1, ...getSpotlightStyle(index) }} {...itemMotion(index)}>
                <div className="ppt-tile relative w-[62%] overflow-hidden rounded-2xl px-5 py-4" style={tileStyle(cardBg, border, accent, { bar: "left" })}>
                  <span aria-hidden className="pointer-events-none absolute -top-3 select-none font-black leading-none tabular-nums" style={{ [left ? "right" : "left"]: "0.5rem", fontSize: "4.5rem", color: alpha(accent, "12"), letterSpacing: "-0.05em" }}>{pad2(index + 1)}</span>
                  <div className={`relative ${left ? "" : "text-right"}`}>
                    {editLabel(item, index, "font-bold text-lg leading-snug break-words")}
                    {editText(item, index, "mt-1 text-sm leading-relaxed break-words")}
                  </div>
                </div>
              </CItem>
            );
          })}
        </div>
      </Container>
    );
  }

  return (
    <Container
      className={`${SLIDE_FRAME} flex flex-col justify-center ${className}`}
      key={animationKey} {...containerProps}
    >
      <div className="flex flex-col">
        {displayItems.map((item, index) => {
          const isLeft = index % 2 === 0;
          const isLast = index === displayItems.length - 1;
          const rowVariantsProps = isPresenting ? { variants: rowVariants } : {};

          return (
            <Row
              key={index}
              className="relative flex flex-col"
              style={getSpotlightStyle(index)}
              {...rowVariantsProps}
            >
              {/* Card row — alternating side */}
              <div
                className={`flex w-full ${
                  isLeft ? "justify-start" : "justify-end"
                }`}
              >
                <div
                  className="ppt-tile relative w-[60%] rounded-2xl px-5 py-4"
                  style={tileStyle(cardBg, border, accent)}
                >
                  {/* Accent number badge */}
                  <div
                    className="absolute -top-3 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold leading-none shadow-sm"
                    style={{
                      background: accent,
                      color: "#ffffff",
                      // Badge sits on the leading corner of the card
                      [isLeft ? "left" : "right"]: "1.25rem",
                    }}
                  >
                    {index + 1}
                  </div>

                  {/* Label */}
                  <div className="mt-2">
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
                          onDelete={
                            onDeleteItem ? () => onDeleteItem(index) : undefined
                          }
                          className="font-bold text-lg leading-snug break-words"
                          style={{ color: titleColor }}
                          isOwner={isOwner}
                          isHovered={isHovered}
                        />
                      ) : (
                        <h3
                          className="font-bold text-lg leading-snug break-words"
                          style={{ color: titleColor }}
                        >
                          {item.label}
                        </h3>
                      ))}

                    {/* Text — wraps fully */}
                    {onStartEditText ? (
                      <EditableText
                        value={item.text}
                        isEditing={
                          isEditing &&
                          editingText?.field === `content-text-${index}`
                        }
                        onStartEdit={() => onStartEditText(index)}
                        onChange={(val) => onUpdateText?.(index, val)}
                        onFinish={onFinishEditing || (() => {})}
                        onDelete={
                          onDeleteItem ? () => onDeleteItem(index) : undefined
                        }
                        className="mt-1 text-sm leading-relaxed break-words"
                        style={{ color: bodyColor }}
                        isOwner={isOwner}
                        isHovered={isHovered}
                      />
                    ) : (
                      <p
                        className="mt-1 text-sm leading-relaxed break-words"
                        style={{ color: bodyColor }}
                      >
                        {item.text}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Connector — centered vertical accent line implying flow */}
              {!isLast && (
                <div className="flex justify-center py-1.5" aria-hidden="true">
                  <div
                    className="rounded-full"
                    style={{
                      width: "2px",
                      height: "1.25rem",
                      background: accent,
                      opacity: 0.45,
                    }}
                  />
                </div>
              )}
            </Row>
          );
        })}
      </div>
    </Container>
  );
}
