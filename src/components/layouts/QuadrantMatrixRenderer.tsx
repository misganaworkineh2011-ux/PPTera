"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Theme } from "~/lib/themes";
import type { BoxContentItem } from "~/lib/layouts/content/boxes";
import EditableText from "~/components/presentation/EditableText";
import { SLIDE_FRAME } from "./tile";
import { alpha } from "~/components/presentation/PremiumComponents";
import { containerVariantsFor, itemMotionProps } from "~/components/presentation/item-animations";

// Animation variants
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
    y: 16,
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

interface QuadrantMatrixRendererProps {
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

export function QuadrantMatrixRenderer({
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
}: QuadrantMatrixRendererProps) {
  // Defensive color fallbacks
  const titleColor = theme?.colors.heading || "#1e293b";
  const bodyColor = theme?.colors.textMuted || "#64748b";
  const accent =
    accentColor || theme?.colors.accent || theme?.colors.primary || "#6366f1";
  const cardBg =
    theme?.cardBox?.background ||
    theme?.colors.surface ||
    "rgba(255,255,255,0.05)";
  const border = theme?.colors.border || "rgba(0,0,0,0.1)";

  // Exactly four quadrant slots; take the first four items if more are supplied.
  const displayItems = items.slice(0, 4);
  const slots: (BoxContentItem | null)[] = [
    displayItems[0] ?? null,
    displayItems[1] ?? null,
    displayItems[2] ?? null,
    displayItems[3] ?? null,
  ];

  // Per-corner subtle tints so quadrants read as distinct yet stay calm.
  const quadrantTints = ["08", "05", "06", "09"]; // hex alpha suffixes (low opacity)
  const getQuadrantBg = (index: number): string => {
    // Only blend an accent tint when the accent is a 6-digit hex; otherwise keep card bg.
    if (/^#[0-9a-fA-F]{6}$/.test(accent)) {
      return `${accent}${quadrantTints[index] ?? "06"}`;
    }
    return cardBg;
  };

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

  // ---- Shared bits for the added styles (2-6) ----
  const CItem = isPresenting ? motion.div : "div";
  const cProps = isPresenting
    ? { variants: containerVariantsFor(itemAnimation), initial: "hidden" as const, animate: "visible" as const }
    : {};
  const itemMotion = (i: number) => itemMotionProps(isPresenting, itemAnimation, revealCount, i);
  const quadTint = (i: number) => `color-mix(in srgb, ${accent} ${[16, 10, 10, 16][i] ?? 12}%, transparent)`;

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

  const quadInner = (item: BoxContentItem | null, index: number) =>
    item ? (
      <>
        {item.icon && <div className="mb-1.5 text-xl" style={{ color: accent }}>{item.icon}</div>}
        {editLabel(item, index, "mb-1 font-bold text-base leading-tight")}
        {editText(item, index, "text-sm leading-relaxed break-words")}
      </>
    ) : (
      <div className="h-2 w-10 rounded-full" style={{ backgroundColor: border, opacity: 0.6 }} />
    );

  // == MATRIX-STYLE-2: AXIS MATRIX — quadrants with X/Y axis arrows
  if (layoutId === "matrix-style-2") {
    return (
      <Container className={`${SLIDE_FRAME} flex items-center justify-center ${className}`} data-layout-id={layoutId} key={animationKey} {...cProps}>
        <div className="relative w-full max-w-3xl pb-7 pl-7">
          <div className="absolute bottom-7 left-0 top-0 flex w-5 flex-col items-center" aria-hidden>
            <span className="text-sm font-bold" style={{ color: accent }}>▲</span>
            <div className="w-0.5 flex-1" style={{ background: alpha(accent, "80") }} />
          </div>
          <div className="absolute bottom-0 left-7 right-0 flex h-5 items-center" aria-hidden>
            <div className="h-0.5 flex-1" style={{ background: alpha(accent, "80") }} />
            <span className="text-sm font-bold" style={{ color: accent }}>▶</span>
          </div>
          <div className="grid grid-cols-2 grid-rows-2 gap-2" style={{ aspectRatio: "3 / 2" }}>
            {slots.map((item, index) => (
              <CItem key={index} className="flex flex-col items-start rounded-lg p-4" style={{ background: quadTint(index), border: `1px solid ${alpha(accent, "26")}`, ...getSpotlightStyle(index) }} {...itemMotion(index)}>
                {quadInner(item, index)}
              </CItem>
            ))}
          </div>
        </div>
      </Container>
    );
  }

  // == MATRIX-STYLE-3: QUADRANT CARDS — four separated cards with badges
  if (layoutId === "matrix-style-3") {
    return (
      <Container className={`${SLIDE_FRAME} flex items-center justify-center ${className}`} data-layout-id={layoutId} key={animationKey} {...cProps}>
        <div className="grid w-full max-w-3xl grid-cols-2 grid-rows-2 gap-4" style={{ aspectRatio: "3 / 2" }}>
          {slots.map((item, index) => (
            <CItem key={index} className="ppt-tile relative flex flex-col rounded-2xl p-5 pt-6" style={{ background: cardBg, border: `1px solid ${border}`, borderTop: `3px solid ${accent}`, ...getSpotlightStyle(index) }} {...itemMotion(index)}>
              <span className="absolute right-4 top-3 text-2xl font-extrabold tabular-nums" style={{ color: alpha(accent, "2e") }}>{String(index + 1).padStart(2, "0")}</span>
              {quadInner(item, index)}
            </CItem>
          ))}
        </div>
      </Container>
    );
  }

  // == MATRIX-STYLE-4: PLOTTED BUBBLES — a plotting field with a bubble per quadrant
  if (layoutId === "matrix-style-4") {
    const bubblePos = [{ l: "26%", t: "28%" }, { l: "72%", t: "24%" }, { l: "30%", t: "72%" }, { l: "70%", t: "70%" }];
    return (
      <Container className={`${SLIDE_FRAME} flex items-center justify-center ${className}`} data-layout-id={layoutId} key={animationKey} {...cProps}>
        <div className="relative w-full max-w-3xl rounded-xl" style={{ aspectRatio: "3 / 2", background: `linear-gradient(135deg, ${alpha(accent, "0a")}, transparent)`, border: `1px solid ${border}` }}>
          <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2" style={{ background: alpha(accent, "33") }} />
          <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2" style={{ background: alpha(accent, "33") }} />
          {slots.map((item, index) => (
            <CItem key={index} className="absolute flex w-40 max-w-[42%] -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center" style={{ left: bubblePos[index]!.l, top: bubblePos[index]!.t, ...getSpotlightStyle(index) }} {...itemMotion(index)}>
              <span className="mb-1.5 flex h-11 w-11 items-center justify-center rounded-full text-sm font-extrabold text-white tabular-nums" style={{ background: `linear-gradient(135deg, ${accent}, ${alpha(accent, "cc")})`, boxShadow: `0 4px 14px ${alpha(accent, "40")}` }}>{item?.icon || index + 1}</span>
              {item && editLabel(item, index, "text-sm font-bold leading-tight")}
              {item && editText(item, index, "text-[11px] leading-snug break-words")}
            </CItem>
          ))}
        </div>
      </Container>
    );
  }

  // == MATRIX-STYLE-5: CORNER NUMBERS — quadrants with oversized ghost numerals
  if (layoutId === "matrix-style-5") {
    return (
      <Container className={`${SLIDE_FRAME} flex items-center justify-center ${className}`} data-layout-id={layoutId} key={animationKey} {...cProps}>
        <div className="grid w-full max-w-3xl grid-cols-2 grid-rows-2 overflow-hidden rounded-xl" style={{ aspectRatio: "3 / 2", gap: 2, background: border }}>
          {slots.map((item, index) => (
            <CItem key={index} className="relative flex flex-col justify-end overflow-hidden p-5" style={{ background: cardBg, ...getSpotlightStyle(index) }} {...itemMotion(index)}>
              <span className="pointer-events-none absolute -right-2 -top-4 select-none font-black leading-none tabular-nums" style={{ fontSize: "5rem", color: alpha(accent, "14") }}>{index + 1}</span>
              <div className="relative">{quadInner(item, index)}</div>
            </CItem>
          ))}
        </div>
      </Container>
    );
  }

  // == MATRIX-STYLE-6: HEADER BANDS — each quadrant with an accent header band
  if (layoutId === "matrix-style-6") {
    return (
      <Container className={`${SLIDE_FRAME} flex items-center justify-center ${className}`} data-layout-id={layoutId} key={animationKey} {...cProps}>
        <div className="grid w-full max-w-3xl grid-cols-2 grid-rows-2 gap-3" style={{ aspectRatio: "3 / 2" }}>
          {slots.map((item, index) => (
            <CItem key={index} className="flex flex-col overflow-hidden rounded-xl" style={{ background: cardBg, border: `1px solid ${border}`, ...getSpotlightStyle(index) }} {...itemMotion(index)}>
              <div className="flex items-center gap-2 px-4 py-2" style={{ background: `linear-gradient(90deg, ${accent}, ${alpha(accent, "b3")})` }}>
                <span className="text-xs font-extrabold tabular-nums text-white opacity-80">{String(index + 1).padStart(2, "0")}</span>
                {item?.label && editLabel(item, index, "text-sm font-bold leading-tight truncate", { color: "#ffffff" })}
              </div>
              <div className="flex-1 px-4 py-3">{item ? editText(item, index, "text-sm leading-relaxed break-words") : quadInner(item, index)}</div>
            </CItem>
          ))}
        </div>
      </Container>
    );
  }

  return (
    <Container
      className={`${SLIDE_FRAME} flex items-center justify-center ${className}`}
      data-layout-id={layoutId}
      key={animationKey} {...containerProps}
    >
      {/* Matrix container: square-ish, constrained to fit a 16:9 slide */}
      <div className="w-full max-w-3xl">
        <div
          className="ppt-tile relative grid grid-cols-2 grid-rows-2 overflow-hidden rounded-xl"
          style={{
            aspectRatio: "3 / 2",
            backgroundColor: cardBg,
            border: `1px solid ${border}`,
            // gap reveals the background between cells; divider lines drawn below
            gap: "2px",
          }}
        >
          {/* Center divider lines (vertical + horizontal) */}
          <div
            className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2"
            style={{ width: "2px", backgroundColor: accent, opacity: 0.35 }}
          />
          <div
            className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2"
            style={{ height: "2px", backgroundColor: accent, opacity: 0.35 }}
          />

          {slots.map((item, index) => {
            const ItemWrapper = isPresenting ? motion.div : "div";
            const variantsProps = isPresenting ? { variants: itemVariants } : {};

            // Empty placeholder cell when fewer than 4 items are provided.
            if (!item) {
              return (
                <ItemWrapper
                  key={index}
                  className="relative flex flex-col items-start justify-start p-4 sm:p-5"
                  style={{
                    backgroundColor: getQuadrantBg(index),
                    ...getSpotlightStyle(index),
                  }}
                  {...variantsProps}
                >
                  <div
                    className="h-2 w-10 rounded-full"
                    style={{ backgroundColor: border, opacity: 0.6 }}
                  />
                </ItemWrapper>
              );
            }

            return (
              <ItemWrapper
                key={index}
                className="relative flex flex-col items-start justify-start p-4 sm:p-5"
                style={{
                  backgroundColor: getQuadrantBg(index),
                  ...getSpotlightStyle(index),
                }}
                {...variantsProps}
              >
                {/* Optional icon */}
                {item.icon && (
                  <div
                    className="mb-1.5 text-xl sm:text-2xl"
                    style={{ color: accent }}
                  >
                    {item.icon}
                  </div>
                )}

                {/* Label (bold, titleColor) */}
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
                      className="mb-1 font-bold text-base leading-tight sm:text-lg"
                      style={{ color: titleColor }}
                      isOwner={isOwner}
                      isHovered={isHovered}
                    />
                  ) : (
                    <h3
                      className="mb-1 font-bold text-base leading-tight sm:text-lg"
                      style={{ color: titleColor }}
                    >
                      {item.label}
                    </h3>
                  ))}

                {/* Text (bodyColor) */}
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
                    className="text-sm leading-relaxed"
                    style={{ color: bodyColor }}
                    isOwner={isOwner}
                    isHovered={isHovered}
                  />
                ) : (
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: bodyColor }}
                  >
                    {item.text}
                  </p>
                )}
              </ItemWrapper>
            );
          })}
        </div>
      </div>
    </Container>
  );
}
